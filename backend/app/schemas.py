from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    dob: Optional[str] = None
    role: Optional[str] = "patient"

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    role: str
    dob: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class RecordCreate(BaseModel):
    document_type: Optional[str] = None
    visit_date: Optional[str] = None
    provider_name: Optional[str] = None
    provider_clinic: Optional[str] = None
    provider_specialty: Optional[str] = None

class RecordOut(BaseModel):
    id: int
    patient_id: int
    document_type: Optional[str]
    visit_date: Optional[str]
    provider_name: Optional[str]
    provider_clinic: Optional[str]
    provider_specialty: Optional[str]
    storage_key: str
    structured_data: Optional[Dict]
    created_at: datetime

    class Config:
        from_attributes = True

class ConsentRequest(BaseModel):
    requester_name: str
    requester_dob: Optional[str] = None
    record_id: Optional[int] = None
    reason: Optional[str] = None

class ConsentDecision(BaseModel):
    consent_id: int
    decision: str  # approve | deny

class AnalyticsQuery(BaseModel):
    patient_id: int
    range_start: Optional[str] = None
    range_end: Optional[str] = None
