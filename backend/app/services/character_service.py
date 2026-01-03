from typing import List, Optional

from sqlalchemy.orm import Session

from ..models import Character, Novel
from ..schemas import CharacterCreate, CharacterUpdate
from ..utils.security import generate_uuid


def list_characters(db: Session, user_id: str, novel_id: str) -> List[Character]:
    return (
        db.query(Character)
        .join(Novel, Novel.id == Character.novel_id)
        .filter(Character.novel_id == novel_id, Novel.user_id == user_id, Novel.is_banned == False)
        .order_by(Character.created_at.desc())
        .all()
    )


def get_character(db: Session, user_id: str, character_id: str) -> Optional[Character]:
    return (
        db.query(Character)
        .join(Novel, Novel.id == Character.novel_id)
        .filter(Character.id == character_id, Novel.user_id == user_id, Novel.is_banned == False)
        .first()
    )


def create_character(db: Session, user_id: str, novel: Novel, character_in: CharacterCreate) -> Character:
    if novel.user_id != user_id:
        raise ValueError("Forbidden")

    character = Character(
        id=generate_uuid(),
        novel_id=novel.id,
        name=character_in.name,
        description=character_in.description,
        avatar=character_in.avatar,
        personality=character_in.personality,
        background=character_in.background,
        relationships=character_in.relationships,
    )
    db.add(character)
    db.commit()
    db.refresh(character)
    return character


def update_character(db: Session, character: Character, character_in: CharacterUpdate) -> Character:
    for field, value in character_in.model_dump(exclude_unset=True).items():
        setattr(character, field, value)
    db.add(character)
    db.commit()
    db.refresh(character)
    return character


def delete_character(db: Session, character: Character) -> None:
    db.delete(character)
    db.commit()

