from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from ..database import get_db
from ..models.user import User
from ..models.note import Note
from ..schemas.note import NoteResponse, NoteSearchResult
from ..services.auth import get_current_user
from ..services import claude

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("/", response_model=NoteSearchResult)
async def search_notes(
    q: str = Query(..., min_length=1),
    semantic: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if semantic:
        all_notes = db.query(Note).filter(Note.owner_id == current_user.id).all()
        notes_data = [{"id": n.id, "title": n.title, "content": n.content} for n in all_notes]
        relevant_ids = await claude.smart_search(q, notes_data)
        notes = [n for n in all_notes if n.id in relevant_ids]
        id_order = {nid: i for i, nid in enumerate(relevant_ids)}
        notes.sort(key=lambda n: id_order.get(n.id, 999))
    else:
        pattern = f"%{q}%"
        notes = (
            db.query(Note)
            .filter(
                Note.owner_id == current_user.id,
                or_(
                    Note.title.ilike(pattern),
                    Note.content.ilike(pattern),
                    func.cast(Note.tags, type_=Note.tags.type).contains(q),
                ),
            )
            .order_by(Note.updated_at.desc())
            .limit(20)
            .all()
        )

    return NoteSearchResult(notes=notes, total=len(notes), query=q)
