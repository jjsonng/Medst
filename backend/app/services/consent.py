from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models import ConsentLog, AccessGrant

def create_consent_request(db: Session, patient_id: int, requester_name: str, requester_dob: str | None, record_id: int | None, reason: str | None) -> ConsentLog:
    log = ConsentLog(
        patient_id=patient_id,
        requester_name=requester_name,
        requester_dob=requester_dob,
        record_id=record_id,
        reason=reason,
        status="pending",
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def decide_consent(db: Session, consent_id: int, decision: str) -> ConsentLog:
    log = db.query(ConsentLog).filter(ConsentLog.id == consent_id).first()
    if not log:
        raise ValueError("Consent not found")
    log.status = "approved" if decision == "approve" else "denied"
    log.decided_at = datetime.utcnow()

    if log.status == "approved":
        grant = AccessGrant(
            patient_id=log.patient_id,
            grantee_name=log.requester_name,
            grantee_dob=log.requester_dob,
            record_id=log.record_id,
            expires_at=datetime.utcnow() + timedelta(days=7),
            active=True,
        )
        db.add(grant)
    db.commit()
    db.refresh(log)
    return log
