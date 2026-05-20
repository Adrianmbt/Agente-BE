"""Pydantic schemas para validación y serialización."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.application import ApplicationStatus


# ── CV Profile ─────────────────────────────────────────────────────────────

class CVProfileOut(BaseModel):
    id: str
    full_name: str
    email: Optional[str]
    base_cv_filename: Optional[str]
    base_cv_text: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Applications ────────────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    company_name: str
    job_title: str
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    tailored_cv_text: Optional[str] = None
    cover_letter: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    match_score: Optional[int] = None
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None


class ApplicationOut(BaseModel):
    id: str
    company_name: str
    job_title: str
    job_url: Optional[str]
    job_description: Optional[str]
    tailored_cv_text: Optional[str]
    cover_letter: Optional[str]
    status: ApplicationStatus
    match_score: Optional[int]
    notes: Optional[str]
    applied_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Jobs ────────────────────────────────────────────────────────────────────

class ScrapeRequest(BaseModel):
    url: str


class TailorRequest(BaseModel):
    job_url: Optional[str] = None
    job_description: Optional[str] = None   # alternativa si ya tiene el texto
    save_as_application: bool = True         # guardar resultado en DB


class TailorResponse(BaseModel):
    application_id: Optional[str]
    tailored_cv: str
    cover_letter: str
    match_score: int
    key_matches: list[str]
    missing_skills: list[str]
