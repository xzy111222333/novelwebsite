from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..api import deps
from ..services import create_outline, delete_outline, get_novel, get_outline, list_outlines, update_outline

router = APIRouter(prefix="/novels/{novel_id}/outlines", tags=["outlines"])


@router.get("/", response_model=list[schemas.OutlineResponse])
def list_for_novel(
    novel_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return list_outlines(db, current_user.id, novel_id)


@router.post("/", response_model=schemas.OutlineResponse, status_code=status.HTTP_201_CREATED)
def create_for_novel(
    novel_id: str,
    outline_in: schemas.OutlineCreate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return create_outline(db, current_user.id, novel, outline_in)


@router.get("/{outline_id}", response_model=schemas.OutlineResponse)
def get_detail(
    novel_id: str,
    outline_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    outline = get_outline(db, current_user.id, outline_id)
    if not outline or outline.novel_id != novel_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outline not found")
    return outline


@router.put("/{outline_id}", response_model=schemas.OutlineResponse)
def update_detail(
    novel_id: str,
    outline_id: str,
    outline_in: schemas.OutlineUpdate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")

    outline = get_outline(db, current_user.id, outline_id)
    if not outline or outline.novel_id != novel_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outline not found")
    return update_outline(db, outline, outline_in)


@router.delete("/{outline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_detail(
    novel_id: str,
    outline_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")

    outline = get_outline(db, current_user.id, outline_id)
    if not outline or outline.novel_id != novel_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outline not found")
    delete_outline(db, outline)
    return None

