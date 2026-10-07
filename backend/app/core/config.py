from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict



class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "zippr-secure-default-change-in-production-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str = "postgresql+asyncpg://zippr:zipprpassword@localhost:5432/zipprdb"
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        if isinstance(v, str):
            # Render and other cloud providers give postgres:// or postgresql://
            # SQLAlchemy 2.0 async engine requires postgresql+asyncpg://
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+asyncpg://"):
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # Comma-separated origins string — kept as str to avoid pydantic-settings
    # trying to JSON-decode List fields from env vars (breaks on "*")
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    REDIS_URL: str = "redis://localhost:6379/0"

settings = Settings()
