import os
import uuid
from datetime import datetime
from app.config import settings

# Optional: S3 and GCS clients
import boto3
from google.cloud import storage as gcs

def _s3_client():
    return boto3.client(
        "s3",
        region_name=settings.s3_region,
        aws_access_key_id=settings.s3_access_key_id,
        aws_secret_access_key=settings.s3_secret_access_key,
    )

def _gcs_client():
    return gcs.Client.from_service_account_json(settings.google_app_creds)

def generate_storage_key(patient_id: int, filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    return f"patients/{patient_id}/{ts}-{uuid.uuid4().hex}{ext}"

def save_file(content: bytes, storage_key: str) -> str:
    provider = settings.storage_provider
    if provider == "local":
        base = settings.storage_local_path
        path = os.path.join(base, storage_key)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            f.write(content)
        return path
    elif provider == "s3":
        client = _s3_client()
        client.put_object(Bucket=settings.s3_bucket, Key=storage_key, Body=content)
        return f"s3://{settings.s3_bucket}/{storage_key}"
    elif provider == "gcs":
        client = _gcs_client()
        bucket = client.bucket(settings.gcs_bucket)
        blob = bucket.blob(storage_key)
        blob.upload_from_string(content)
        return f"gs://{settings.gcs_bucket}/{storage_key}"
    else:
        raise ValueError(f"Unsupported storage provider: {provider}")

def get_file_content(storage_key: str) -> bytes:
    """Retrieve file content from storage."""
    provider = settings.storage_provider
    if provider == "local":
        base = settings.storage_local_path
        path = os.path.join(base, storage_key)
        if not os.path.exists(path):
            raise FileNotFoundError(f"File not found: {path}")
        with open(path, "rb") as f:
            return f.read()
    elif provider == "s3":
        client = _s3_client()
        response = client.get_object(Bucket=settings.s3_bucket, Key=storage_key)
        return response['Body'].read()
    elif provider == "gcs":
        client = _gcs_client()
        bucket = client.bucket(settings.gcs_bucket)
        blob = bucket.blob(storage_key)
        return blob.download_as_bytes()
    else:
        raise ValueError(f"Unsupported storage provider: {provider}")

def delete_file(storage_key: str) -> None:
    """Delete file from storage."""
    provider = settings.storage_provider
    if provider == "local":
        base = settings.storage_local_path
        path = os.path.join(base, storage_key)
        if os.path.exists(path):
            os.remove(path)
    elif provider == "s3":
        client = _s3_client()
        client.delete_object(Bucket=settings.s3_bucket, Key=storage_key)
    elif provider == "gcs":
        client = _gcs_client()
        bucket = client.bucket(settings.gcs_bucket)
        blob = bucket.blob(storage_key)
        blob.delete()
    else:
        raise ValueError(f"Unsupported storage provider: {provider}")
