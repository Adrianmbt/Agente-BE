"""
Router: /api/cv
Gestiona la subida, lectura y actualización del CV base del candidato.
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.application import CVProfile
from schemas.application import CVProfileOut
from services.cv_parser import extract_text_from_pdf

router = APIRouter(prefix="/api/cv", tags=["CV"])

SINGLETON_PROFILE_ID = "default-profile"


def _get_or_create_profile(db: Session) -> CVProfile:
    """Obtiene el perfil del candidato o lo crea si no existe (modo single-user)."""
    profile = db.query(CVProfile).filter(CVProfile.id == SINGLETON_PROFILE_ID).first()
    if not profile:
        profile = CVProfile(id=SINGLETON_PROFILE_ID, full_name="Adrian Bello")
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.post("/upload", response_model=CVProfileOut, summary="Subir CV en PDF")
async def upload_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Acepta un PDF, extrae el texto y lo guarda como CV base del candidato.
    Sobrescribe cualquier CV anterior.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos PDF.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="El archivo está vacío.")

    try:
        cv_text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"No se pudo leer el PDF: {e}")

    if len(cv_text.strip()) < 50:
        raise HTTPException(
            status_code=422,
            detail="El PDF no contiene suficiente texto legible. ¿Es un PDF escaneado?"
        )

    profile = _get_or_create_profile(db)
    profile.base_cv_text = cv_text
    profile.base_cv_filename = file.filename
    db.commit()
    db.refresh(profile)

    return profile


@router.get("/", response_model=CVProfileOut, summary="Obtener CV base actual")
def get_cv(db: Session = Depends(get_db)):
    """Devuelve el perfil y el texto del CV base almacenado."""
    profile = _get_or_create_profile(db)
    if not profile.base_cv_text:
        raise HTTPException(
            status_code=404,
            detail="No hay ningún CV cargado. Sube un PDF primero."
        )
    return profile


@router.get("/text", summary="Obtener solo el texto del CV")
def get_cv_text(db: Session = Depends(get_db)):
    """Devuelve únicamente el texto plano del CV (útil para el agente IA)."""
    profile = _get_or_create_profile(db)
    if not profile.base_cv_text:
        raise HTTPException(status_code=404, detail="No hay CV cargado.")
    return {"text": profile.base_cv_text, "filename": profile.base_cv_filename}
