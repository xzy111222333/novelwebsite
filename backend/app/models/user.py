from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    avatar = Column(String(500), nullable=True)
    password = Column(String(255), nullable=False)
    email_verified = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    novels = relationship("Novel", back_populates="user", cascade="all, delete")
