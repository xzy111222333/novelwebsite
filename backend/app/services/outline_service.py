from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models import Outline, Novel
from ..schemas import OutlineCreate, OutlineUpdate
from ..utils.security import generate_uuid


def list_outlines(db: Session, user_id: str, novel_id: str) -> List[Outline]:
    return (
        db.query(Outline)
        .join(Novel, Novel.id == Outline.novel_id)
        .filter(Outline.novel_id == novel_id, Novel.user_id == user_id, Novel.is_banned == False)
        .order_by(Outline.order.asc(), Outline.created_at.asc())
        .all()
    )


def get_outline(db: Session, user_id: str, outline_id: str) -> Optional[Outline]:
    return (
        db.query(Outline)
        .join(Novel, Novel.id == Outline.novel_id)
        .filter(Outline.id == outline_id, Novel.user_id == user_id, Novel.is_banned == False)
        .first()
    )


def create_outline(db: Session, user_id: str, novel: Novel, outline_in: OutlineCreate) -> Outline:
    if novel.user_id != user_id:
        raise ValueError("Forbidden")

    if not outline_in.order or outline_in.order <= 0:
        max_order = db.query(func.coalesce(func.max(Outline.order), 0)).filter(Outline.novel_id == novel.id).scalar() or 0
        order_value = int(max_order) + 1
    else:
        order_value = int(outline_in.order)

    outline = Outline(
        id=generate_uuid(),
        novel_id=novel.id,
        title=outline_in.title,
        content=outline_in.content,
        chapter_range=outline_in.chapter_range,
        order=order_value,
    )
    db.add(outline)
    db.commit()
    db.refresh(outline)
    return outline


def update_outline(db: Session, outline: Outline, outline_in: OutlineUpdate) -> Outline:
    for field, value in outline_in.model_dump(exclude_unset=True).items():
        setattr(outline, field, value)
    db.add(outline)
    db.commit()
    db.refresh(outline)
    return outline


def delete_outline(db: Session, outline: Outline) -> None:
    db.delete(outline)
    db.commit()
