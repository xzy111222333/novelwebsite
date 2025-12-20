from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models import Chapter, Novel
from ..schemas import ChapterCreate, ChapterUpdate
from ..utils.security import generate_uuid


def _count_content_units(content: str) -> int:
    return len("".join(content.split()))


def _recalculate_novel_stats(db: Session, novel: Novel) -> None:
    chapter_count = db.query(func.count(Chapter.id)).filter(Chapter.novel_id == novel.id).scalar() or 0
    word_count = db.query(func.coalesce(func.sum(Chapter.word_count), 0)).filter(Chapter.novel_id == novel.id).scalar() or 0
    novel.chapter_count = int(chapter_count)
    novel.word_count = int(word_count)
    db.add(novel)


def list_chapters(db: Session, user_id: str, novel_id: str) -> List[Chapter]:
    return (
        db.query(Chapter)
        .join(Novel, Novel.id == Chapter.novel_id)
        .filter(Chapter.novel_id == novel_id, Novel.user_id == user_id)
        .order_by(Chapter.order.asc(), Chapter.created_at.asc())
        .all()
    )


def get_chapter(db: Session, user_id: str, chapter_id: str) -> Optional[Chapter]:
    return (
        db.query(Chapter)
        .join(Novel, Novel.id == Chapter.novel_id)
        .filter(Chapter.id == chapter_id, Novel.user_id == user_id)
        .first()
    )


def create_chapter(db: Session, user_id: str, novel: Novel, chapter_in: ChapterCreate) -> Chapter:
    if novel.user_id != user_id:
        raise ValueError("Forbidden")

    if not chapter_in.order or chapter_in.order <= 0:
        max_order = db.query(func.coalesce(func.max(Chapter.order), 0)).filter(Chapter.novel_id == novel.id).scalar() or 0
        order_value = int(max_order) + 1
    else:
        order_value = int(chapter_in.order)

    chapter = Chapter(
        id=generate_uuid(),
        novel_id=novel.id,
        title=chapter_in.title,
        content=chapter_in.content,
        summary=chapter_in.summary,
        order=order_value,
        status=chapter_in.status or "draft",
        word_count=_count_content_units(chapter_in.content),
    )
    db.add(chapter)
    db.commit()
    db.refresh(chapter)

    _recalculate_novel_stats(db, novel)
    db.commit()
    db.refresh(novel)

    return chapter


def update_chapter(db: Session, novel: Novel, chapter: Chapter, chapter_in: ChapterUpdate) -> Chapter:
    payload = chapter_in.model_dump(exclude_unset=True)
    for field, value in payload.items():
        setattr(chapter, field, value)
    if "content" in payload and payload["content"] is not None:
        chapter.word_count = _count_content_units(payload["content"])

    db.add(chapter)
    db.commit()
    db.refresh(chapter)

    _recalculate_novel_stats(db, novel)
    db.commit()
    db.refresh(novel)

    return chapter


def delete_chapter(db: Session, novel: Novel, chapter: Chapter) -> None:
    db.delete(chapter)
    db.commit()

    _recalculate_novel_stats(db, novel)
    db.commit()
    db.refresh(novel)


def reorder_chapters(db: Session, user_id: str, novel: Novel, chapter_ids: list[str]) -> None:
    if novel.user_id != user_id:
        raise ValueError("Forbidden")

    clean_ids = [cid for cid in chapter_ids if cid and str(cid).strip()]
    if not clean_ids:
        raise ValueError("chapter_ids 不能为空")

    rows = (
        db.query(Chapter)
        .join(Novel, Novel.id == Chapter.novel_id)
        .filter(Chapter.novel_id == novel.id, Novel.user_id == user_id, Chapter.id.in_(clean_ids))
        .all()
    )

    by_id = {c.id: c for c in rows}
    if len(by_id) != len(set(clean_ids)):
        raise ValueError("chapter_ids 包含不存在或不属于当前作品的章节")

    for idx, cid in enumerate(clean_ids, start=1):
        by_id[cid].order = idx
        db.add(by_id[cid])

    db.commit()
