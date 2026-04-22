from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NoteBase(BaseModel):
    title: str
    content: str = ""
    color: str = "#ffffff"
    tags: list[str] = []
    is_pinned: int = 0


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    color: Optional[str] = None
    tags: Optional[list[str]] = None
    is_pinned: Optional[int] = None
    summary: Optional[str] = None


class NoteResponse(NoteBase):
    id: int
    summary: Optional[str] = None
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NoteSearchResult(BaseModel):
    notes: list[NoteResponse]
    total: int
    query: str
