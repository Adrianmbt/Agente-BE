"""Models ORM para la base de datos."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, DateTime, Enum as SAEnum
from sqlalchemy.dialects.sqlite import TEXT as SQLITE_TEXT
from database import Base
import enum


class ApplicationStatus(str, enum.Enum):
    draft = "draft"
    applied = "applied"
    interviewing = "interviewing"
    rejected = "rejected"
    offer = "offer"


class CVProfile(Base):
    """Perfil del candidato con el CV base."""
    __tablename__ = "cv_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(200), nullable=False, default="Adrian Bello")
    email = Column(String(200), nullable=True)
    base_cv_text = Column(Text, nullable=True)       # Texto extraído del PDF
    base_cv_filename = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))


class Application(Base):
    """Registro de una postulación a un trabajo."""
    __tablename__ = "applications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_name = Column(String(300), nullable=False)
    job_title = Column(String(300), nullable=False)
    job_url = Column(Text, nullable=True)
    job_description = Column(Text, nullable=True)
    tailored_cv_text = Column(Text, nullable=True)   # CV adaptado en Markdown
    cover_letter = Column(Text, nullable=True)
    status = Column(
        SAEnum(ApplicationStatus, native_enum=False),
        default=ApplicationStatus.draft,
        nullable=False
    )
    match_score = Column(Integer, nullable=True)     # 0-100
    notes = Column(Text, nullable=True)
    applied_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))


class InterviewSession(Base):
    """Sesión de preparación para entrevista asociada a una postulación."""
    __tablename__ = "interview_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String, nullable=False)  # FK a applications.id
    interview_type = Column(String(100), nullable=True)  # 'technical', 'hr', 'behavioral'
    scheduled_at = Column(DateTime, nullable=True)
    preparation_notes = Column(Text, nullable=True)  # Notas generadas por IA
    common_questions = Column(Text, nullable=True)   # JSON string con lista de preguntas
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
