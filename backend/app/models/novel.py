from datetime import datetime
from sqlalchemy import Boolean, Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from ..database import Base


class Novel(Base):
    __tablename__ = "novels"

    id = Column(String(36), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    genre = Column(String(100), nullable=True)
    status = Column(String(50), default="draft")
    cover_image = Column(String(500), nullable=True)
    tags = Column(String(255), nullable=True)
    is_banned = Column(Boolean, default=False, nullable=False)
    word_count = Column(Integer, default=0)
    chapter_count = Column(Integer, default=0)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="novels")
    chapters = relationship("Chapter", back_populates="novel", cascade="all, delete")
    outlines = relationship("Outline", back_populates="novel", cascade="all, delete")
    characters = relationship("Character", back_populates="novel", cascade="all, delete")
    world_building = relationship("WorldBuilding", back_populates="novel", cascade="all, delete", uselist=False)
