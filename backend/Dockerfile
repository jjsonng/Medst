FROM python:3.12

# System deps for Tesseract OCR (optional)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libjpeg-dev zlib1g-dev gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependencies early for caching
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY app ./app
COPY .env ./.env
# Optional: service account creds for GCS
# COPY creds/service-account.json ./creds/service-account.json

ENV PYTHONUNBUFFERED=1

# Create storage path
RUN mkdir -p /data/storage
VOLUME ["/data/storage"]

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
