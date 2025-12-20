from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ChapterBase(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    order: int = 0
    status: str = "draft"


class ChapterCreate(ChapterBase):
    pass


class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    order: Optional[int] = None
    status: Optional[str] = None


class ChapterResponse(ChapterBase):
    id: str
    word_count: int
    novel_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChapterReorderRequest(BaseModel):
    chapter_ids: list[str]


class ChapterReorderResponse(BaseModel):
    success: bool = True
