# import google.generativeai as genai
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# Gemini Config (Commented for future use)
# genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

class CVTailor:
    def __init__(self):
        # Gemini initialization (Commented)
        # self.gemini_model = genai.GenerativeMod
        # 
        # 
        # 
        # ('gemini-1.5-pro')
        
        # OpenAI initialization (Current)
        self.openai_client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    async def tailor_cv(self, base_cv_text: str, job_description: str) -> str:
        prompt = f"""
        Act as a professional career coach and expert ATS optimizer.
        I have a base CV and a job description. 
        Your task is to rewrite the CV to make it a perfect match for the job description.
        
        Rules:
        1. Maintain honesty; do not invent experiences the candidate doesn't have.
        2. Highlight and emphasize skills, keywords, and experiences that match the job description.
        3. Optimize for ATS (Applicant Tracking Systems).
        4. Use a professional, modern tone.
        5. Return the tailored CV in Markdown format.
        
        Job Description:
        {job_description}
        
        Base CV:
        {base_cv_text}
        
        Tailored CV (Markdown):
        """
        
        # Using GPT-4 for current testing
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a professional career coach."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content

        # Gemini Implementation (Commented)
        # response = self.gemini_model.generate_content(prompt)
        # return response.text




class CoverLetterGenerator:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def generate(self, cv_text: str, job_description: str) -> str:
        prompt = f"Genera una carta de presentación profesional basada en este CV: {cv_text} y esta descripción de cargo: {job_description}. Usa un tono persuasivo y profesional."
        response = await self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content

cover_letter_generator = CoverLetterGenerator()


cv_tailor = CVTailor()
