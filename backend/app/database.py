import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pathlib import Path

DATABASE_URL = os.environ.get("DATABASE_URL", "")

if DATABASE_URL:
    # Supabase / PostgreSQL
    # Fix Supabase URL format: postgres:// -> postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL, echo=False)
else:
    # Local SQLite fallback
    DB_DIR = Path(__file__).resolve().parent.parent
    DB_PATH = DB_DIR / "gaokao.db"
    engine = create_engine(
        f"sqlite:///{DB_PATH}",
        connect_args={"check_same_thread": False},
        echo=False,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
