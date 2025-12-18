from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..api import deps
from ..services import delete_chapter, get_chapter, get_novel, update_chapter

router = APIRouter(prefix="/chapters", tags=["chapters"])


@router.get("/{chapter_id}", response_model=schemas.ChapterResponse)
def get_by_id(
    chapter_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    chapter = get_chapter(db, current_user.id, chapter_id)
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return chapter


@router.put("/{chapter_id}", response_model=schemas.ChapterResponse)
def update_by_id(
    chapter_id: str,
    chapter_in: schemas.ChapterUpdate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    chapter = get_chapter(db, current_user.id, chapter_id)
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")

    novel = get_novel(db, chapter.novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")

    return update_chapter(db, novel, chapter, chapter_in)


@router.delete("/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_by_id(
    chapter_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    chapter = get_chapter(db, current_user.id, chapter_id)
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")

    novel = get_novel(db, chapter.novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")

    delete_chapter(db, novel, chapter)
    return None

