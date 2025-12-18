from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..api import deps
from ..services import delete_world_building, get_novel, get_world_building, upsert_world_building

router = APIRouter(prefix="/novels/{novel_id}/world-building", tags=["world-building"])


@router.get("/", response_model=schemas.WorldBuildingResponse)
def get_for_novel(
    novel_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    wb = get_world_building(db, current_user.id, novel_id)
    if not wb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World building not found")
    return wb


@router.put("/", response_model=schemas.WorldBuildingResponse)
def upsert_for_novel(
    novel_id: str,
    payload: schemas.WorldBuildingUpsert,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return upsert_world_building(db, current_user.id, novel, payload)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def delete_for_novel(
    novel_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    wb = get_world_building(db, current_user.id, novel_id)
    if not wb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World building not found")
    delete_world_building(db, wb)
    return None

