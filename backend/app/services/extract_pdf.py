import fitz  # PyMuPDF

def extract_pdf_text(content: bytes) -> str:
    text = ""
    with fitz.open(stream=content, filetype="pdf") as doc:
        for page in doc:
            # Try text; if empty, fallback to page.get_text("text")
            page_text = page.get_text()
            if not page_text.strip():
                page_text = page.get_text("text")
            text += page_text + "\n"
    return text
