from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from ..database import Base


class Outline(Base):
    __tablename__ = "outlines"

    id = Column(String(36), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(String, nullable=True)
    chapter_range = Column(String, nullable=True)
    order = Column(Integer, default=0)
    novel_id = Column(String(36), ForeignKey("novels.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    novel = relationship("Novel", back_populates="outlines")
