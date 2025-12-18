from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class OutlineBase(BaseModel):
    title: str
    content: Optional[str] = None
    chapter_range: Optional[str] = None
    order: int = 0


class OutlineCreate(OutlineBase):
    pass


class OutlineUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    chapter_range: Optional[str] = None
    order: Optional[int] = None


class OutlineResponse(OutlineBase):
    id: str
    novel_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

