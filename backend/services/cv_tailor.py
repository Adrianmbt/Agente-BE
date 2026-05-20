"""
cv_tailor.py — Adapta el CV base a una oferta de trabajo usando GPT-4.
Devuelve un dict estructurado con: tailored_cv, match_score, key_matches, missing_skills.
"""

import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()


class CVTailor:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    async def tailor_cv(self, base_cv_text: str, job_description: str) -> dict:
        """
        Adapta el CV base a la descripción del trabajo.
        Retorna un diccionario con:
          - tailored_cv: str (Markdown)
          - match_score: int (0-100)
          - key_matches: list[str]
          - missing_skills: list[str]
        """
        prompt = f"""
Eres un coach de carrera profesional y experto en optimización ATS.
Tienes el CV base de un candidato y una descripción de trabajo.

Tu tarea es:
1. Adaptar el CV para maximizar la compatibilidad con la oferta SIN inventar experiencias.
   - Resalta habilidades y logros reales que sean relevantes.
   - Usa las mismas keywords de la oferta donde apliquen honestamente.
   - Reordena secciones para poner lo más relevante primero.
   - Usa verbos de acción fuertes y métricas donde existan.

2. Calcular un match_score del 0 al 100 basado en cuántas de las habilidades y requisitos
   clave del candidato coinciden con la oferta.

3. Identificar las principales habilidades/keywords que ya tiene el candidato (key_matches).

4. Identificar brechas reales: qué pide la oferta que el candidato NO tiene (missing_skills).

IMPORTANTE: Responde SOLO con un JSON válido con esta estructura exacta:
{{
  "tailored_cv": "...CV adaptado en formato Markdown...",
  "match_score": 85,
  "key_matches": ["Python", "FastAPI", "REST APIs"],
  "missing_skills": ["Kubernetes", "Go"]
}}

Descripción del trabajo:
{job_description}

CV Base del candidato:
{base_cv_text}
"""
        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Eres un experto en recursos humanos y optimización de CVs. Responde SIEMPRE con JSON válido."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            response_format={"type": "json_object"}
        )

        raw = response.choices[0].message.content
        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            # Fallback si el modelo no devuelve JSON perfecto
            result = {
                "tailored_cv": raw,
                "match_score": 0,
                "key_matches": [],
                "missing_skills": []
            }

        return result


class CoverLetterGenerator:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def generate(self, cv_text: str, job_description: str) -> str:
        prompt = f"""
Genera una carta de presentación profesional, concisa y persuasiva (máximo 3 párrafos).

Tono: profesional, entusiasta y específico. Menciona 2-3 logros concretos del CV
que sean directamente relevantes para la oferta. No repitas el CV, complementa.

CV del candidato:
{cv_text}

Descripción del cargo:
{job_description}

Carta de presentación:
"""
        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6
        )
        return response.choices[0].message.content


cv_tailor = CVTailor()
cover_letter_generator = CoverLetterGenerator()
