from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..api import deps
from ..services import create_chapter, delete_chapter, get_chapter, get_novel, list_chapters, reorder_chapters, update_chapter

router = APIRouter(prefix="/novels/{novel_id}/chapters", tags=["chapters"])


@router.get("/", response_model=list[schemas.ChapterResponse])
def list_for_novel(
    novel_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return list_chapters(db, current_user.id, novel_id)


@router.post("/", response_model=schemas.ChapterResponse, status_code=status.HTTP_201_CREATED)
def create_for_novel(
    novel_id: str,
    chapter_in: schemas.ChapterCreate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return create_chapter(db, current_user.id, novel, chapter_in)


@router.patch("/reorder", response_model=schemas.ChapterReorderResponse)
def reorder_for_novel(
    novel_id: str,
    payload: schemas.ChapterReorderRequest,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    try:
        reorder_chapters(db, current_user.id, novel, payload.chapter_ids)
        return schemas.ChapterReorderResponse(success=True)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{chapter_id}", response_model=schemas.ChapterResponse)
def get_detail(
    novel_id: str,
    chapter_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    chapter = get_chapter(db, current_user.id, chapter_id)
    if not chapter or chapter.novel_id != novel_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return chapter


@router.put("/{chapter_id}", response_model=schemas.ChapterResponse)
def update_detail(
    novel_id: str,
    chapter_id: str,
    chapter_in: schemas.ChapterUpdate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")

    chapter = get_chapter(db, current_user.id, chapter_id)
    if not chapter or chapter.novel_id != novel_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return update_chapter(db, novel, chapter, chapter_in)


@router.delete("/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_detail(
    novel_id: str,
    chapter_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    novel = get_novel(db, novel_id, current_user.id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")

    chapter = get_chapter(db, current_user.id, chapter_id)
    if not chapter or chapter.novel_id != novel_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    delete_chapter(db, novel, chapter)
    return None
