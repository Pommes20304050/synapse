from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models.user import User
from ..models.note import Note
from ..schemas.note import NoteCreate, NoteUpdate, NoteResponse, NoteSearchResult
from ..services.auth import get_current_user
from ..services import claude

router = APIRouter(prefix="/api/notes", tags=["notes"])


def _get_note_or_404(note_id: int, user: User, db: Session) -> Note:
    note = db.query(Note).filter(Note.id == note_id, Note.owner_id == user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


async def _enrich_note(note_id: int, db: Session):
    """Background task: generate summary + tags for a note."""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note or not note.content.strip():
        return
    try:
        note.summary = await claude.generate_summary(note.content)
        if not note.tags:
            note.tags = await claude.generate_tags(note.title, note.content)
        db.commit()
    except Exception:
        pass  # Don't break the request if AI enrichment fails


@router.get("/", response_model=list[NoteResponse])
def list_notes(
    skip: int = 0,
    limit: int = 50,
    pinned_first: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Note).filter(Note.owner_id == current_user.id)
    if pinned_first:
        query = query.order_by(Note.is_pinned.desc(), Note.updated_at.desc())
    else:
        query = query.order_by(Note.updated_at.desc())
    return query.offset(skip).limit(limit).all()


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: NoteCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = Note(**note_in.model_dump(), owner_id=current_user.id)
    db.add(note)
    db.commit()
    db.refresh(note)
    if note.content.strip():
        background_tasks.add_task(_enrich_note, note.id, db)
    return note


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_note_or_404(note_id, current_user, db)


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_in: NoteUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = _get_note_or_404(note_id, current_user, db)
    update_data = note_in.model_dump(exclude_unset=True)
    content_changed = "content" in update_data and update_data["content"] != note.content

    for field, value in update_data.items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)

    if content_changed and note.content.strip():
        background_tasks.add_task(_enrich_note, note.id, db)

    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = _get_note_or_404(note_id, current_user, db)
    db.delete(note)
    db.commit()


@router.post("/{note_id}/summarize", response_model=NoteResponse)
async def summarize_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = _get_note_or_404(note_id, current_user, db)
    if not note.content.strip():
        raise HTTPException(status_code=400, detail="Note has no content to summarize")
    note.summary = await claude.generate_summary(note.content)
    db.commit()
    db.refresh(note)
    return note


@router.post("/{note_id}/tag", response_model=NoteResponse)
async def auto_tag_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = _get_note_or_404(note_id, current_user, db)
    note.tags = await claude.generate_tags(note.title, note.content)
    db.commit()
    db.refresh(note)
    return note
