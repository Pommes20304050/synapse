from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.note import Note
from ..services.auth import get_current_user
from ..services import claude

router = APIRouter(prefix="/api/ai", tags=["ai"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    history: list[ChatMessage] = []
    use_all_notes: bool = True
    note_ids: list[int] = []


class ChatResponse(BaseModel):
    answer: str


class InsightResponse(BaseModel):
    insight: str


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.use_all_notes:
        notes = db.query(Note).filter(Note.owner_id == current_user.id).all()
    else:
        notes = (
            db.query(Note)
            .filter(Note.owner_id == current_user.id, Note.id.in_(req.note_ids))
            .all()
        )

    notes_context = [{"title": n.title, "content": n.content} for n in notes]
    history = [{"role": m.role, "content": m.content} for m in req.history]

    answer = await claude.chat_with_notes(req.question, notes_context, history)
    return {"answer": answer}


@router.get("/insights", response_model=InsightResponse)
async def get_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notes = db.query(Note).filter(Note.owner_id == current_user.id).limit(20).all()
    if not notes:
        return {"insight": "Start adding notes and I'll analyze your knowledge base!"}

    notes_overview = "\n".join(f"- {n.title}" for n in notes)
    tags = [t for n in notes for t in (n.tags or [])]
    tag_counts: dict[str, int] = {}
    for t in tags:
        tag_counts[t] = tag_counts.get(t, 0) + 1
    top_tags = sorted(tag_counts.items(), key=lambda x: -x[1])[:5]

    from ..services.claude import get_client
    client = get_client()
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        system="You are a thoughtful knowledge analyst. Give a short, encouraging insight about what you notice in someone's notes. Be specific and actionable. 2-3 sentences max.",
        messages=[
            {
                "role": "user",
                "content": (
                    f"My notes ({len(notes)} total):\n{notes_overview}\n\n"
                    f"Top tags: {', '.join(f'{t}({c})' for t, c in top_tags)}"
                ),
            }
        ],
    )
    return {"insight": response.content[0].text.strip()}
