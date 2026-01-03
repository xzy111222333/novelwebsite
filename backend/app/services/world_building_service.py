from typing import List, Optional

from sqlalchemy.orm import Session

from ..models import Novel, WorldBuilding
from ..schemas import WorldBuildingUpsert
from ..utils.security import generate_uuid


def get_world_building(db: Session, user_id: str, novel_id: str) -> Optional[WorldBuilding]:
    return (
        db.query(WorldBuilding)
        .join(Novel, Novel.id == WorldBuilding.novel_id)
        .filter(WorldBuilding.novel_id == novel_id, Novel.user_id == user_id, Novel.is_banned == False)
        .first()
    )


def upsert_world_building(db: Session, user_id: str, novel: Novel, payload: WorldBuildingUpsert) -> WorldBuilding:
    if novel.user_id != user_id:
        raise ValueError("Forbidden")

    existing = db.query(WorldBuilding).filter(WorldBuilding.novel_id == novel.id).first()
    if existing:
        existing.title = payload.title
        existing.content = payload.content
        existing.type = payload.type
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    world_building = WorldBuilding(
        id=generate_uuid(),
        novel_id=novel.id,
        title=payload.title,
        content=payload.content,
        type=payload.type,
    )
    db.add(world_building)
    db.commit()
    db.refresh(world_building)
    return world_building


def delete_world_building(db: Session, world_building: WorldBuilding) -> None:
    db.delete(world_building)
    db.commit()


def list_world_buildings(db: Session, user_id: str, novel_id: str | None = None) -> List[WorldBuilding]:
    query = (
        db.query(WorldBuilding)
        .join(Novel, Novel.id == WorldBuilding.novel_id)
        .filter(Novel.user_id == user_id, Novel.is_banned == False)
    )
    if novel_id:
        query = query.filter(WorldBuilding.novel_id == novel_id)
    return query.order_by(WorldBuilding.created_at.desc()).all()


def get_world_building_by_id(db: Session, user_id: str, world_building_id: str) -> Optional[WorldBuilding]:
    return (
        db.query(WorldBuilding)
        .join(Novel, Novel.id == WorldBuilding.novel_id)
        .filter(WorldBuilding.id == world_building_id, Novel.user_id == user_id, Novel.is_banned == False)
        .first()
    )
