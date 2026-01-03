from typing import List

from sqlalchemy.orm import Session

from ..models import Novel, User
from ..schemas import AdminNovelUpdate, AdminUserUpdate
from ..utils.security import get_password_hash


def list_admin_users(db: Session) -> List[User]:
    return db.query(User).order_by(User.created_at.desc()).all()


def get_admin_user(db: Session, user_id: str) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def update_admin_user(db: Session, user: User, payload: AdminUserUpdate) -> User:
    data = payload.model_dump(exclude_unset=True)
    password = data.pop("password", None)
    if password:
        user.password = get_password_hash(password)
    for field, value in data.items():
        setattr(user, field, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_admin_novels(db: Session) -> List[Novel]:
    return db.query(Novel).order_by(Novel.updated_at.desc()).all()


def get_admin_novel(db: Session, novel_id: str) -> Novel | None:
    return db.query(Novel).filter(Novel.id == novel_id).first()


def update_admin_novel(db: Session, novel: Novel, payload: AdminNovelUpdate) -> Novel:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(novel, field, value)
    db.add(novel)
    db.commit()
    db.refresh(novel)
    return novel
