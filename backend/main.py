from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi import BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv


from services.cv_tailor import cv_tailor
from services.job_scraper import job_scraper
from services.supabase_client import supabase

load_dotenv()

app = FastAPI(title="AI Job Application Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeRequest(BaseModel):
    url: str

class TailorRequest(BaseModel):
    base_cv_text: str
    job_description: str

@app.get("/")
async def root():
    return {"message": "AI Job Application Agent API is running"}

@app.post("/analyze-job")
async def analyze_job(request: ScrapeRequest):
    try:
        job_data = await job_scraper.scrape_job(request.url)
        return job_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tailor-cv")
async def tailor_cv(request: TailorRequest):
    try:
        tailored_cv = await cv_tailor.tailor_cv(request.base_cv_text, request.job_description)
        return {"tailored_cv": tailored_cv}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auto-apply")
async def auto_apply(request: ScrapeRequest, background_tasks: BackgroundTasks):
    # El servidor responde de inmediato y sigue trabajando internamente
    background_tasks.add_task(process_full_application, request.url)
    return {"status": "Postulación iniciada en segundo plano"}

@app.post("/generate-email")
async def generate_email(request: TailorRequest):
    # Lógica similar a tailor_cv pero enfocada en el cuerpo del correo
    pass


@app.get("/applications")
async def get_applications():
    if not supabase:
        return {"error": "Supabase not configured"}
    
    response = supabase.table("applications").select("*").execute()
    return response.data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
