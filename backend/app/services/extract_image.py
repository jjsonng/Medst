import io
from PIL import Image
import pytesseract
from app.config import settings

def extract_image_text(content: bytes) -> str:
    image = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(image, lang=settings.tess_lang)
    return text
