from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.deps import get_current_user
from app.database import get_db
from app.schemas import ConsentRequest, ConsentDecision
from app.services.consent import create_consent_request, decide_consent
from app.models import ConsentLog
from app.services.notifications import notify_patient

router = APIRouter(prefix="/access", tags=["access"])

@router.post("/request")
def request_access(payload: ConsentRequest, db: Session = Depends(get_db), user = Depends(get_current_user)):
    # A clinician or third party requests access; MVP assumes current user is the requester.
    log = create_consent_request(
        db=db,
        patient_id=user.id,  # For MVP, self-requests; later allow requesting other patient with lookup
        requester_name=payload.requester_name,
        requester_dob=payload.requester_dob,
        record_id=payload.record_id,
        reason=payload.reason,
    )
    notify_patient(email=user.email, message=f"Access request from {payload.requester_name}")
    return {"consent_id": log.id, "status": log.status}

@router.get("/consents")
def list_consents(db: Session = Depends(get_db), user = Depends(get_current_user)):
    items = db.query(ConsentLog).filter(ConsentLog.patient_id == user.id).order_by(ConsentLog.notified_at.desc()).all()
    return [{"id": i.id, "requester_name": i.requester_name, "status": i.status, "record_id": i.record_id} for i in items]

@router.post("/decide")
def decide(payload: ConsentDecision, db: Session = Depends(get_db), user = Depends(get_current_user)):
    try:
        log = decide_consent(db, consent_id=payload.consent_id, decision=payload.decision)
        return {"id": log.id, "status": log.status}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
