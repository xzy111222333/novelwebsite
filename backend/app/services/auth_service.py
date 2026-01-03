from typing import Optional

from sqlalchemy.orm import Session

from ..models import User
from ..schemas import UserCreate
from ..utils.security import get_password_hash, verify_password, generate_uuid


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    user = User(
        id=generate_uuid(),
        email=user_in.email,
        name=user_in.name,
        avatar=user_in.avatar,
        password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if user.is_banned:
        return None
    if not verify_password(password, user.password):
        return None
    return user
