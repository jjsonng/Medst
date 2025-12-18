from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.deps import get_current_user
from app.database import get_db
from app.schemas import AnalyticsQuery
from app.models import Record

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.post("/summary")
def patient_summary(payload: AnalyticsQuery, db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Count diagnoses/meds occurrences
    q = db.query(Record).filter(Record.patient_id == user.id)
    items = q.all()
    diagnosis_counts = {}
    med_counts = {}
    for r in items:
        data = r.structured_data or {}
        for d in data.get("diagnosis", []):
            diagnosis_counts[d] = diagnosis_counts.get(d, 0) + 1
        for m in data.get("medications", []):
            med_counts[m] = med_counts.get(m, 0) + 1

    return {
        "total_records": len(items),
        "top_diagnoses": sorted(diagnosis_counts.items(), key=lambda x: x[1], reverse=True)[:10],
        "top_medications": sorted(med_counts.items(), key=lambda x: x[1], reverse=True)[:10],
    }
