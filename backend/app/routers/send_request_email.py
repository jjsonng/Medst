from email.mime.text import MIMEText
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import smtplib, ssl, uuid
from app.database import get_db
from app.models import UploadTokens, User
from app.deps import get_current_user

router = APIRouter(prefix="/requests", tags=["requests"])

class RequestEmail(BaseModel):
    clinic_name: str
    service_type: str
    email: EmailStr  # recipient email

class RequestEmailResponse(BaseModel):
    message: str
    link: str
    patient_name: str  

@router.post("/send-email", response_model=RequestEmailResponse)
def send_request_email(
    request: RequestEmail,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  
):
    patient_name = current_user.full_name or current_user.email or "Unknown Patient"
    token = str(uuid.uuid4())
    upload_link = f"http://localhost:3000/upload?token={token}"

    # store token in DB
    upload_token = UploadTokens(
        token=token,
        patient_id=current_user.id,
        clinic_name=request.clinic_name,
        service_type=request.service_type,
    )
    db.add(upload_token)
    db.commit()
    db.refresh(upload_token)

    subject = f"Request to upload {request.service_type} records for {patient_name}"
    body = f"""
Hello,

You have been requested to upload {request.service_type} records for patient {patient_name} via {request.clinic_name}.

Click the link below to securely log in and upload the records:
{upload_link}

Thank you.
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = "main.medstinc@gmail.com"
    msg["To"] = request.email

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as smtp:
            smtp.ehlo()
            smtp.starttls(context=context)
            smtp.ehlo()
            smtp.login("main.medstinc@gmail.com", "yaja lsbb xvbb ujwc")  # replace with a valid app password
            smtp.send_message(msg)

        return RequestEmailResponse(
            message="Email sent successfully",
            link=upload_link,
            patient_name=patient_name
        )

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
