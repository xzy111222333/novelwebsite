from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..api import deps
from ..services import delete_outline, get_outline, update_outline

router = APIRouter(prefix="/outlines", tags=["outlines"])


@router.get("/{outline_id}", response_model=schemas.OutlineResponse)
def get_by_id(
    outline_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    outline = get_outline(db, current_user.id, outline_id)
    if not outline:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outline not found")
    return outline


@router.put("/{outline_id}", response_model=schemas.OutlineResponse)
def update_by_id(
    outline_id: str,
    outline_in: schemas.OutlineUpdate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    outline = get_outline(db, current_user.id, outline_id)
    if not outline:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outline not found")
    return update_outline(db, outline, outline_in)


@router.delete("/{outline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_by_id(
    outline_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    outline = get_outline(db, current_user.id, outline_id)
    if not outline:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outline not found")
    delete_outline(db, outline)
    return None

