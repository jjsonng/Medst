from typing import Tuple, Optional
from app.services.extract_pdf import extract_pdf_text
from app.services.extract_docx import extract_docx_text
from app.services.extract_image import extract_image_text
from app.utils.parsing import normalize_text, extract_fields
from app.services.storage import generate_storage_key, save_file
from app.services.nlp import postprocess_structured

def detect_type(filename: str) -> str:
    name = filename.lower()
    if name.endswith(".pdf"):
        return "pdf"
    if name.endswith(".docx"):
        return "docx"
    if name.endswith((".png", ".jpg", ".jpeg", ".tif", ".tiff")):
        return "image"
    return "unknown"

def ingest_document(patient_id: int, filename: str, content: bytes):
    dtype = detect_type(filename)
    if dtype == "pdf":
        text = extract_pdf_text(content)
    elif dtype == "docx":
        text = extract_docx_text(content)
    elif dtype == "image":
        text = extract_image_text(content)
    else:
        raise ValueError("Unsupported file type")

    text = normalize_text(text)
    fields = extract_fields(text)
    fields = postprocess_structured(fields)

    storage_key = generate_storage_key(patient_id, filename)
    uri = save_file(content, storage_key)
    return storage_key, text, fields, dtype

