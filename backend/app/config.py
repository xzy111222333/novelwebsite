from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "QingXie API"
    database_url: str = "sqlite:///./app.db"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"


@lru_cache
def get_settings() -> Settings:
    return Settings()
