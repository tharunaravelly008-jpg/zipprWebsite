from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Async Engine Setup
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True
)

class Base(DeclarativeBase):
    """SQLAlchemy 2.0 Base Declarative Class."""
    pass
