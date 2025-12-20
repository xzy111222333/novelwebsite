from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from .config import get_settings

settings = get_settings()


def _build_engine(database_url: str):
    if database_url.startswith("sqlite"):
        raise ValueError("SQLite is not supported. Please configure MySQL via DATABASE_URL.")
    return create_engine(database_url, pool_pre_ping=True, pool_recycle=3600)


engine = _build_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
