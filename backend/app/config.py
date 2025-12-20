from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    _BACKEND_DIR = Path(__file__).resolve().parents[1]
    model_config = SettingsConfigDict(
        env_file=(str(_BACKEND_DIR / ".env"), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "QingXie API"
    database_url: str = "mysql+pymysql://root:123456@localhost:3306/aiwrite_db?charset=utf8mb4"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"

    doubao_api_key: str | None = None
    doubao_api_url: str = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
    doubao_model: str = "doubao-seed-1-6-flash-250828"


@lru_cache
def get_settings() -> Settings:
    return Settings()
