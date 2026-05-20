"""
cv_parser.py — Extrae texto limpio desde un PDF usando PyMuPDF (fitz).
PyMuPDF es más rápido y preciso que pdfplumber para CVs con columnas.
"""

import fitz  # PyMuPDF
import io


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extrae texto de los bytes de un PDF.
    Preserva el orden de lectura y elimina líneas vacías redundantes.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = []

    for page_num, page in enumerate(doc):
        # Extrae texto respetando el layout (columnas, etc.)
        text = page.get_text("text")
        full_text.append(f"--- Página {page_num + 1} ---\n{text}")

    doc.close()

    raw = "\n".join(full_text)

    # Limpieza: eliminar líneas vacías excesivas
    lines = raw.splitlines()
    cleaned = []
    prev_blank = False
    for line in lines:
        is_blank = line.strip() == ""
        if is_blank and prev_blank:
            continue  # Eliminar dobles líneas en blanco
        cleaned.append(line)
        prev_blank = is_blank

    return "\n".join(cleaned).strip()
