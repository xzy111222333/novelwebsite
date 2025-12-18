from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import schemas
from ..api import deps
from ..services import delete_world_building, get_world_building_by_id, list_world_buildings

router = APIRouter(prefix="/world-buildings", tags=["world-buildings"])


@router.get("/", response_model=list[schemas.WorldBuildingResponse])
def list_all(
    novel_id: str | None = Query(default=None),
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    return list_world_buildings(db, current_user.id, novel_id)


@router.get("/{world_building_id}", response_model=schemas.WorldBuildingResponse)
def get_by_id(
    world_building_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    wb = get_world_building_by_id(db, current_user.id, world_building_id)
    if not wb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World building not found")
    return wb


@router.put("/{world_building_id}", response_model=schemas.WorldBuildingResponse)
def update_by_id(
    world_building_id: str,
    payload: schemas.WorldBuildingUpsert,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    wb = get_world_building_by_id(db, current_user.id, world_building_id)
    if not wb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World building not found")

    wb.title = payload.title
    wb.content = payload.content
    wb.type = payload.type
    db.add(wb)
    db.commit()
    db.refresh(wb)
    return wb


@router.delete("/{world_building_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_by_id(
    world_building_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    wb = get_world_building_by_id(db, current_user.id, world_building_id)
    if not wb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World building not found")
    delete_world_building(db, wb)
    return None

