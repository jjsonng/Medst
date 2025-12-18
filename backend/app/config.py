from pydantic import BaseModel
import os

class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "development")
    app_name: str = os.getenv("APP_NAME", "medst")
    app_version: str = os.getenv("APP_VERSION", "0.1.0")
    secret_key: str = os.getenv("SECRET_KEY", "change-me")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: int = int(os.getenv("DB_PORT", "5432"))
    db_user: str = os.getenv("DB_USER", "medst")
    db_password: str = os.getenv("DB_PASSWORD", "medst_password")
    db_name: str = os.getenv("DB_NAME", "medst")

    storage_provider: str = os.getenv("STORAGE_PROVIDER", "local")
    storage_local_path: str = os.getenv("STORAGE_LOCAL_PATH", "/data/storage")

    s3_bucket: str = os.getenv("S3_BUCKET", "")
    s3_region: str = os.getenv("S3_REGION", "")
    s3_access_key_id: str = os.getenv("S3_ACCESS_KEY_ID", "")
    s3_secret_access_key: str = os.getenv("S3_SECRET_ACCESS_KEY", "")

    gcs_bucket: str = os.getenv("GCS_BUCKET", "")
    google_app_creds: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "/app/creds/service-account.json")

    tess_lang: str = os.getenv("TESS_LANG", "eng")
    notify_from_email: str = os.getenv("NOTIFY_FROM_EMAIL", "noreply@medst.local")

    google_api_key: str = os.getenv("GOOGLE_API_KEY", "")


settings = Settings()
