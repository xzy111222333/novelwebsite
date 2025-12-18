import uuid
from datetime import datetime, timedelta

from jose import jwt, JWTError
from passlib.context import CryptContext

from ..config import get_settings
from ..schemas import TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


def generate_uuid() -> str:
    return str(uuid.uuid4())


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return TokenData(user_id=payload.get("sub"))
    except JWTError:
        return TokenData(user_id=None)
