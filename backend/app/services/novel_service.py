from typing import List, Optional

from sqlalchemy.orm import Session

from ..models import Novel
from ..schemas import NovelCreate, NovelUpdate
from ..utils.security import generate_uuid


def list_novels(db: Session, user_id: str) -> List[Novel]:
    return db.query(Novel).filter(Novel.user_id == user_id).order_by(Novel.created_at.desc()).all()


def create_novel(db: Session, user_id: str, novel_in: NovelCreate) -> Novel:
    novel = Novel(
        id=generate_uuid(),
        user_id=user_id,
        title=novel_in.title,
        description=novel_in.description,
        genre=novel_in.genre,
        status=novel_in.status or "draft",
        tags=novel_in.tags,
    )
    db.add(novel)
    db.commit()
    db.refresh(novel)
    return novel


def get_novel(db: Session, novel_id: str, user_id: str) -> Optional[Novel]:
    return db.query(Novel).filter(Novel.id == novel_id, Novel.user_id == user_id).first()


def update_novel(db: Session, novel: Novel, novel_in: NovelUpdate) -> Novel:
    for field, value in novel_in.model_dump(exclude_unset=True).items():
        setattr(novel, field, value)
    db.add(novel)
    db.commit()
    db.refresh(novel)
    return novel


def delete_novel(db: Session, novel: Novel) -> None:
    db.delete(novel)
    db.commit()
