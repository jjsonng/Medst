from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, records, access, analytics, clinics_search, send_request_email, users

app = FastAPI(title=settings.app_name, version=settings.app_version)

# CORS (adjust for your frontend domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(auth.router)
app.include_router(records.router)
app.include_router(access.router)
app.include_router(analytics.router)
app.include_router(clinics_search.router)
app.include_router(send_request_email.router)
app.include_router(users.router)

@app.get("/health")
def health():
    return {"status": "ok", "env": settings.app_env}
