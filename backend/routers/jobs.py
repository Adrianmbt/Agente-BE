"""
Router: /api/jobs
Scraping de ofertas y adaptación de CV con IA.
"""

import json
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from database import get_db
from models.application import Application, CVProfile, ApplicationStatus
from schemas.application import ScrapeRequest, TailorRequest, TailorResponse
from services.job_scraper import job_scraper
from services.cv_tailor import cv_tailor, cover_letter_generator

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

SINGLETON_PROFILE_ID = "default-profile"


def _get_base_cv(db: Session) -> str:
    """Obtiene el texto del CV base. Lanza error si no hay CV cargado."""
    profile = db.query(CVProfile).filter(CVProfile.id == SINGLETON_PROFILE_ID).first()
    if not profile or not profile.base_cv_text:
        raise HTTPException(
            status_code=404,
            detail="No hay CV base cargado. Ve a /api/cv/upload para subir tu PDF primero."
        )
    return profile.base_cv_text


@router.post("/scrape", summary="Extraer información de una oferta de empleo")
async def scrape_job(request: ScrapeRequest):
    """
    Recibe una URL y devuelve el título y descripción de la oferta extraídos.
    """
    try:
        job_data = await job_scraper.scrape_job(request.url)
        return job_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al scrapear la URL: {e}")


@router.post("/tailor", response_model=TailorResponse, summary="Adaptar CV a una oferta")
async def tailor_cv(
    request: TailorRequest,
    db: Session = Depends(get_db)
):
    """
    Flujo completo:
    1. Si se da URL, scrapea la oferta.
    2. Adapta el CV base a la descripción del puesto con GPT-4.
    3. Genera carta de presentación.
    4. Guarda resultado como postulación en DB (si save_as_application=True).
    """
    base_cv_text = _get_base_cv(db)

    # 1. Obtener descripción del puesto
    job_info = {"title": "Oferta de empleo", "description": "", "url": ""}
    if request.job_url:
        try:
            job_info = await job_scraper.scrape_job(request.job_url)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"No se pudo acceder a la URL: {e}")
        job_description = job_info.get("description", "")
    elif request.job_description:
        job_description = request.job_description
    else:
        raise HTTPException(
            status_code=400,
            detail="Debes proporcionar 'job_url' o 'job_description'."
        )

    if len(job_description.strip()) < 50:
        raise HTTPException(status_code=422, detail="La descripción de la oferta es demasiado corta.")

    # 2. Adaptar CV con IA
    try:
        tailor_result = await cv_tailor.tailor_cv(base_cv_text, job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al adaptar el CV: {e}")

    # 3. Generar carta de presentación
    try:
        cover = await cover_letter_generator.generate(base_cv_text, job_description)
    except Exception as e:
        cover = ""  # No bloquear si falla la carta

    # 4. Guardar en DB si se solicitó
    application_id = None
    if request.save_as_application:
        # Extraer nombre de empresa y título del job_info
        title_parts = job_info.get("title", "").split(" - ")
        job_title = title_parts[0].strip() if title_parts else "Cargo sin título"
        company = title_parts[-1].strip() if len(title_parts) > 1 else "Empresa desconocida"

        app = Application(
            company_name=company,
            job_title=job_title,
            job_url=request.job_url or "",
            job_description=job_description,
            tailored_cv_text=tailor_result.get("tailored_cv", ""),
            cover_letter=cover,
            match_score=tailor_result.get("match_score", 0),
            status=ApplicationStatus.draft,
        )
        db.add(app)
        db.commit()
        db.refresh(app)
        application_id = app.id

    return TailorResponse(
        application_id=application_id,
        tailored_cv=tailor_result.get("tailored_cv", ""),
        cover_letter=cover,
        match_score=tailor_result.get("match_score", 0),
        key_matches=tailor_result.get("key_matches", []),
        missing_skills=tailor_result.get("missing_skills", []),
    )


async def process_full_application(url: str, db: Session):
    """
    Tarea en background: scrapea, adapta CV y guarda la postulación.
    Llamada desde el endpoint /auto-apply.
    """
    try:
        profile = db.query(CVProfile).filter(CVProfile.id == SINGLETON_PROFILE_ID).first()
        if not profile or not profile.base_cv_text:
            return

        job_info = await job_scraper.scrape_job(url)
        job_description = job_info.get("description", "")

        tailor_result = await cv_tailor.tailor_cv(profile.base_cv_text, job_description)
        cover = await cover_letter_generator.generate(profile.base_cv_text, job_description)

        title_parts = job_info.get("title", "").split(" - ")
        job_title = title_parts[0].strip() if title_parts else "Cargo"
        company = title_parts[-1].strip() if len(title_parts) > 1 else "Empresa"

        app = Application(
            company_name=company,
            job_title=job_title,
            job_url=url,
            job_description=job_description,
            tailored_cv_text=tailor_result.get("tailored_cv", ""),
            cover_letter=cover,
            match_score=tailor_result.get("match_score", 0),
            status=ApplicationStatus.draft,
        )
        db.add(app)
        db.commit()
    except Exception as e:
        print(f"[process_full_application] Error: {e}")
