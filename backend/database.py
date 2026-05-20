"""
database.py — SQLAlchemy engine y sesión.

Para migrar a Supabase (PostgreSQL) en el futuro, sólo hay que cambiar
DATABASE_URL en el .env:
  SQLite  (desarrollo):   sqlite:///./jobagent.db
  Supabase (producción):  postgresql://user:pass@host:5432/dbname
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./jobagent.db")

# connect_args sólo aplica a SQLite (manejo de hilos)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependencia FastAPI — provee una sesión de DB y la cierra al terminar."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
