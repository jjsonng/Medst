import io
import docx

def extract_docx_text(content: bytes) -> str:
    doc = docx.Document(io.BytesIO(content))
    parts = [p.text for p in doc.paragraphs]
    return "\n".join([p for p in parts if p and p.strip()])
