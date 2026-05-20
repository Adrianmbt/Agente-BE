"""
Router: /api/applications
CRUD completo de postulaciones a empleos.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from database import get_db
from models.application import Application, ApplicationStatus
from schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationOut

router = APIRouter(prefix="/api/applications", tags=["Applications"])


@router.get("/", response_model=List[ApplicationOut], summary="Listar postulaciones")
def list_applications(
    status: str = None,
    db: Session = Depends(get_db)
):
    """Devuelve todas las postulaciones, opcionalmente filtradas por estado."""
    query = db.query(Application).order_by(Application.created_at.desc())
    if status:
        try:
            status_enum = ApplicationStatus(status)
            query = query.filter(Application.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Estado inválido: {status}")
    return query.all()


@router.post("/", response_model=ApplicationOut, status_code=201, summary="Crear postulación")
def create_application(
    data: ApplicationCreate,
    db: Session = Depends(get_db)
):
    """Crea un nuevo registro de postulación en estado 'draft'."""
    app = Application(**data.model_dump())
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.get("/{app_id}", response_model=ApplicationOut, summary="Obtener postulación")
def get_application(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Postulación no encontrada.")
    return app


@router.patch("/{app_id}", response_model=ApplicationOut, summary="Actualizar postulación")
def update_application(
    app_id: str,
    data: ApplicationUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza campos parciales de una postulación (estado, notas, CV adaptado, etc.)."""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Postulación no encontrada.")

    update_data = data.model_dump(exclude_unset=True)

    # Si cambia el estado a 'applied', registrar la fecha
    if "status" in update_data and update_data["status"] == ApplicationStatus.applied:
        if not app.applied_at:
            update_data["applied_at"] = datetime.now(timezone.utc)

    for field, value in update_data.items():
        setattr(app, field, value)

    db.commit()
    db.refresh(app)
    return app


@router.delete("/{app_id}", status_code=204, summary="Eliminar postulación")
def delete_application(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Postulación no encontrada.")
    db.delete(app)
    db.commit()


@router.get("/stats/summary", summary="Resumen estadístico")
def get_stats(db: Session = Depends(get_db)):
    """Devuelve conteos por estado para el dashboard."""
    total = db.query(Application).count()
    by_status = {}
    for status in ApplicationStatus:
        count = db.query(Application).filter(Application.status == status).count()
        by_status[status.value] = count
    return {"total": total, "by_status": by_status}
