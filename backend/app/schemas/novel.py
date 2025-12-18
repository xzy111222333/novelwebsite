from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class NovelBase(BaseModel):
    title: str
    description: Optional[str] = None
    genre: Optional[str] = None
    status: Optional[str] = "draft"
    tags: Optional[str] = None


class NovelCreate(NovelBase):
    pass


class NovelUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[str] = None


class NovelResponse(NovelBase):
    id: str
    cover_image: Optional[str] = None
    word_count: int
    chapter_count: int
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
