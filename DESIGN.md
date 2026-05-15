# AI Job Application Agent - Design System & Architecture

## Overview
An automated system to manage job applications, tailor CVs to specific job descriptions, and track application status using FastAPI, React, and Supabase.

## Architecture
- **Frontend**: React (Vite) + Vanilla CSS (Modern, Premium Aesthetic)
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI Engine**: Gemini Pro (via Google Generative AI SDK)
- **Automation**: Playwright (for form filling and scraping)

## Database Schema (Supabase)
### `profiles`
- `id`: uuid (primary key)
- `full_name`: text
- `email`: text
- `base_cv_url`: text (Storage link)

### `applications`
- `id`: uuid (primary key)
- `user_id`: uuid (foreign key)
- `company_name`: text
- `job_title`: text
- `job_description`: text
- `job_url`: text
- `status`: enum (Draft, Applied, Interviewing, Rejected, Offer)
- `tailored_cv_url`: text (Storage link)
- `applied_at`: timestamp
- `notes`: text

## Design System (Vanilla CSS)
### Colors
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #ec4899 (Pink)
- **Dark Mode Background**: #0f172a
- **Surface**: #1e293b
- **Text Primary**: #f8fafc
- **Text Secondary**: #94a3b8

### Typography
- **Font Family**: 'Inter', sans-serif
- **Headings**: 'Outfit', sans-serif

### Effects
- **Glassmorphism**: `backdrop-filter: blur(10px); background: rgba(30, 41, 59, 0.7);`
- **Gradients**: Linear gradients for buttons and highlights.

## Agent Workflow
1. **Input**: Job URL or Text.
2. **Analysis**: Extract key requirements and skills.
3. **Tailoring**: Modify the base CV to highlight matching skills (using Gemini).
4. **Storage**: Save the application record and the new CV to Supabase.
5. **Execution**: (Optional) Open browser to fill application form.
