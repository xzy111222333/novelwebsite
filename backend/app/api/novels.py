from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..api import deps
from ..models import Novel
from ..services import create_novel, delete_novel, get_novel, list_novels, update_novel

router = APIRouter(prefix="/novels", tags=["novels"])


@router.get("/", response_model=list[schemas.NovelResponse])
def get_my_novels(db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    return list_novels(db, current_user.id)


@router.post("/", response_model=schemas.NovelResponse, status_code=status.HTTP_201_CREATED)
def create_my_novel(novel_in: schemas.NovelCreate, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    return create_novel(db, current_user.id, novel_in)


@router.get("/{novel_id}", response_model=schemas.NovelResponse)
def get_detail(novel_id: str, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return novel


@router.put("/{novel_id}", response_model=schemas.NovelResponse)
def update_detail(novel_id: str, novel_in: schemas.NovelUpdate, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return update_novel(db, novel, novel_in)


@router.delete("/{novel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_detail(novel_id: str, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    delete_novel(db, novel)
    return None
