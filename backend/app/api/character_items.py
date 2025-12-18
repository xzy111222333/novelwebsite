from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..api import deps
from ..services import delete_character, get_character, update_character

router = APIRouter(prefix="/characters", tags=["characters"])


@router.get("/{character_id}", response_model=schemas.CharacterResponse)
def get_by_id(
    character_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    character = get_character(db, current_user.id, character_id)
    if not character:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    return character


@router.put("/{character_id}", response_model=schemas.CharacterResponse)
def update_by_id(
    character_id: str,
    character_in: schemas.CharacterUpdate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    character = get_character(db, current_user.id, character_id)
    if not character:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    return update_character(db, character, character_in)


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_by_id(
    character_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    character = get_character(db, current_user.id, character_id)
    if not character:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")
    delete_character(db, character)
    return None

