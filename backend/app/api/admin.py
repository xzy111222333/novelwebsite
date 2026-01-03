from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..api import deps
from ..services import (
    list_admin_users,
    get_admin_user,
    update_admin_user,
    list_admin_novels,
    get_admin_novel,
    update_admin_novel,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[schemas.AdminUserResponse])
def list_users(
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_admin),
):
    return list_admin_users(db)


@router.get("/users/{user_id}", response_model=schemas.AdminUserResponse)
def get_user(
    user_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_admin),
):
    user = get_admin_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/users/{user_id}", response_model=schemas.AdminUserResponse)
def update_user(
    user_id: str,
    payload: schemas.AdminUserUpdate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_admin),
):
    user = get_admin_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return update_admin_user(db, user, payload)


@router.get("/novels", response_model=list[schemas.AdminNovelResponse])
def list_novels(
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_admin),
):
    novels = list_admin_novels(db)
    return [
        schemas.AdminNovelResponse(
            id=novel.id,
            title=novel.title,
            description=novel.description,
            genre=novel.genre,
            status=novel.status,
            tags=novel.tags,
            cover_image=novel.cover_image,
            is_banned=novel.is_banned,
            word_count=novel.word_count,
            chapter_count=novel.chapter_count,
            user_id=novel.user_id,
            user_email=novel.user.email if novel.user else None,
            user_name=novel.user.name if novel.user else None,
            created_at=novel.created_at,
            updated_at=novel.updated_at,
        )
        for novel in novels
    ]


@router.get("/novels/{novel_id}", response_model=schemas.AdminNovelResponse)
def get_novel(
    novel_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_admin),
):
    novel = get_admin_novel(db, novel_id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    return schemas.AdminNovelResponse(
        id=novel.id,
        title=novel.title,
        description=novel.description,
        genre=novel.genre,
        status=novel.status,
        tags=novel.tags,
        cover_image=novel.cover_image,
        is_banned=novel.is_banned,
        word_count=novel.word_count,
        chapter_count=novel.chapter_count,
        user_id=novel.user_id,
        user_email=novel.user.email if novel.user else None,
        user_name=novel.user.name if novel.user else None,
        created_at=novel.created_at,
        updated_at=novel.updated_at,
    )


@router.patch("/novels/{novel_id}", response_model=schemas.AdminNovelResponse)
def update_novel(
    novel_id: str,
    payload: schemas.AdminNovelUpdate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_admin),
):
    novel = get_admin_novel(db, novel_id)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")

    if payload.user_id:
        owner = get_admin_user(db, payload.user_id)
        if not owner:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner not found")

    updated = update_admin_novel(db, novel, payload)
    return schemas.AdminNovelResponse(
        id=updated.id,
        title=updated.title,
        description=updated.description,
        genre=updated.genre,
        status=updated.status,
        tags=updated.tags,
        cover_image=updated.cover_image,
        is_banned=updated.is_banned,
        word_count=updated.word_count,
        chapter_count=updated.chapter_count,
        user_id=updated.user_id,
        user_email=updated.user.email if updated.user else None,
        user_name=updated.user.name if updated.user else None,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )
