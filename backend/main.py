"""
main.py — Punto de entrada de la API FastAPI del Agente Postulador.
"""

from fastapi import FastAPI, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
import models  # Importar modelos para que SQLAlchemy los registre
from routers.cv import router as cv_router
from routers.applications import router as applications_router
from routers.jobs import router as jobs_router, process_full_application
from schemas.application import ScrapeRequest

# ── Crear tablas en la base de datos (SQLite en desarrollo) ──────────────────
Base.metadata.create_all(bind=engine)

# ── Aplicación FastAPI ────────────────────────────────────────────────────────
app = FastAPI(
    title="JobAgent AI API",
    description="Agente inteligente de postulaciones — Adapta CVs, gestiona aplicaciones y prepara entrevistas.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ── CORS (permite peticiones desde el frontend React) ────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Registrar routers ─────────────────────────────────────────────────────────
app.include_router(cv_router)
app.include_router(applications_router)
app.include_router(jobs_router)


# ── Endpoints raíz ───────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "app": "JobAgent AI",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}


# ── Auto-apply en background (mantiene compatibilidad con el endpoint original) ─
@app.post("/api/auto-apply", tags=["Jobs"])
async def auto_apply(
    request: ScrapeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Lanza el proceso completo de postulación en background:
    scraping → adaptación de CV → guardado en DB.
    """
    background_tasks.add_task(process_full_application, request.url, db)
    return {"status": "iniciado", "message": "Procesando la oferta en segundo plano.", "url": request.url}


# ── Inicio con uvicorn ────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
