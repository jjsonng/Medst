from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="patient")  # patient | clinician | admin
    dob: Mapped[str] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    records = relationship("Record", back_populates="patient")

class Record(Base):
    __tablename__ = "records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    provider_name: Mapped[str] = mapped_column(String(255), nullable=True)
    provider_clinic: Mapped[str] = mapped_column(String(255), nullable=True)
    provider_specialty: Mapped[str] = mapped_column(String(100), nullable=True)

    document_type: Mapped[str] = mapped_column(String(100), nullable=True)  # pathology_report, referral, gp_note
    visit_date: Mapped[str] = mapped_column(String(50), nullable=True)      # ISO date string 
    storage_key: Mapped[str] = mapped_column(String(512), nullable=False)   # path or URI to file
    content_text: Mapped[str] = mapped_column(Text, nullable=True)          # extracted raw text
    structured_data: Mapped[dict] = mapped_column(JSON, nullable=True)      # parsed fields

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    patient = relationship("User", back_populates="records")

class ConsentLog(Base):
    __tablename__ = "consents"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    requester_name: Mapped[str] = mapped_column(String(255), nullable=False)
    requester_dob: Mapped[str] = mapped_column(String(20), nullable=True)
    record_id: Mapped[int] = mapped_column(ForeignKey("records.id"), index=True, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | approved | denied
    reason: Mapped[str] = mapped_column(String(500), nullable=True)
    notified_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    decided_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

class AccessGrant(Base):
    __tablename__ = "access_grants"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    grantee_name: Mapped[str] = mapped_column(String(255), nullable=False)
    grantee_dob: Mapped[str] = mapped_column(String(20), nullable=True)
    record_id: Mapped[int] = mapped_column(ForeignKey("records.id"), index=True, nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

class UploadTokens(Base):
    __tablename__ = "upload_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    clinic_name = Column(String)
    service_type = Column(String)
    used = Column(Boolean, default=False)
