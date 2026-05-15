# AI Job Application Agent

Este proyecto es un asistente inteligente diseñado para automatizar y optimizar el proceso de postulación a empleos. Utiliza **FastAPI** para el backend, **React** para el frontend, y **Supabase** para la base de datos y autenticación.

## Características
- **Análisis de Ofertas**: Extrae automáticamente la descripción de empleos desde una URL.
- **Adecuación de CV (Tailoring)**: Utiliza IA (Gemini Pro) para reescribir tu CV base y ajustarlo perfectamente a la descripción del cargo.
- **Seguimiento de Postulaciones**: Un tablero centralizado para gestionar todas tus aplicaciones y su estado.
- **Automatización de Formularios**: (En desarrollo) Capacidad para rellenar formularios fuera de LinkedIn/Easy Apply.

## Requisitos
- Python 3.9+
- Node.js 18+
- Cuenta en Supabase
- API Key de Google Gemini

## Configuración Inicial

1. **Clonar y Preparar**:
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   playwright install chromium
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Variables de Entorno**:
   Crea un archivo `.env` en el directorio raíz basado en `.env.example`:
   ```env
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_KEY=tu_anon_key_de_supabase
   GEMINI_API_KEY=tu_api_key_de_gemini
   ```

3. **Ejecutar el Proyecto**:
   - **Backend**: `cd backend && python main.py`
   - **Frontend**: `cd frontend && npm run dev`

## Próximos Pasos
- Implementar la lógica de rellenado de formularios con Playwright.
- Configurar el almacenamiento de Supabase para los archivos PDF de los CVs.
- Añadir sistema de autenticación de usuarios.
