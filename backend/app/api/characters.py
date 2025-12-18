from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..api import deps
from ..services import (
    create_character,
    delete_character,
    get_character,
    get_novel,
    list_characters,
    update_character,
)

router = APIRouter(prefix="/novels/{novel_id}/characters", tags=["characters"])


@router.get("/", response_model=list[schemas.CharacterResponse])
def list_for_novel(
    novel_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return list_characters(db, current_user.id, novel_id)


@router.post("/", response_model=schemas.CharacterResponse, status_code=status.HTTP_201_CREATED)
def create_for_novel(
    novel_id: str,
    character_in: schemas.CharacterCreate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return create_character(db, current_user.id, novel, character_in)


@router.get("/{character_id}", response_model=schemas.CharacterResponse)
def get_detail(
    novel_id: str,
    character_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    character = get_character(db, current_user.id, character_id)
    if not character or character.novel_id != novel_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    return character


@router.put("/{character_id}", response_model=schemas.CharacterResponse)
def update_detail(
    novel_id: str,
    character_id: str,
    character_in: schemas.CharacterUpdate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")

    character = get_character(db, current_user.id, character_id)
    if not character or character.novel_id != novel_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    return update_character(db, character, character_in)


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_detail(
    novel_id: str,
    character_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")

    character = get_character(db, current_user.id, character_id)
    if not character or character.novel_id != novel_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    delete_character(db, character)
    return None

