from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class AdminUserResponse(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    avatar: Optional[str] = None
    is_admin: bool = False
    is_banned: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    avatar: Optional[str] = None
    password: Optional[str] = None
    is_admin: Optional[bool] = None
    is_banned: Optional[bool] = None


class AdminNovelResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    genre: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[str] = None
    cover_image: Optional[str] = None
    is_banned: bool = False
    word_count: int
    chapter_count: int
    user_id: str
    user_email: Optional[EmailStr] = None
    user_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AdminNovelUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[str] = None
    cover_image: Optional[str] = None
    user_id: Optional[str] = None
    is_banned: Optional[bool] = None
