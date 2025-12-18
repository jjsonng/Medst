from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi import Request
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from app.deps import get_current_user
from app.database import get_db
from app.models import Record, UploadTokens
from app.schemas import RecordCreate, RecordOut
from app.services.ingestion import ingest_document
from app.services.storage import get_file_content
import os
import mimetypes

router = APIRouter(prefix="/records", tags=["records"])

@router.post("/upload", response_model=RecordOut)
async def upload_record(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    content = await file.read()
    storage_key, text, fields, doc_type = ingest_document(user.id, file.filename, content)

    record = Record(
        patient_id=user.id,
        provider_name=fields.get("provider_name"),
        provider_clinic=fields.get("provider_clinic"),
        provider_specialty=fields.get("provider_specialty"),
        document_type=doc_type,
        visit_date=fields.get("visit_date"),
        storage_key=storage_key,
        content_text=text,
        structured_data=fields,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/", response_model=list[RecordOut])
def list_records(db: Session = Depends(get_db), user = Depends(get_current_user)):
    items = db.query(Record).filter(Record.patient_id == user.id).order_by(Record.created_at.desc()).all()
    return items

@router.get("/test")
def test_endpoint():
    return {"message": "Records router is working"}

@router.delete("/test-delete")
def test_delete():
    return {"message": "DELETE endpoint is working"}

@router.get("/{record_id}", response_model=RecordOut)
def get_record(record_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    record = db.query(Record).filter(Record.id == record_id, Record.patient_id == user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.get("/{record_id}/download")
async def download_record(record_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    record = db.query(Record).filter(Record.id == record_id, Record.patient_id == user.id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    try:
        # Get file content from storage
        file_content = get_file_content(record.storage_key)
        
        # Determine file extension and MIME type
        file_extension = os.path.splitext(record.storage_key)[1]
        mime_type, _ = mimetypes.guess_type(f"file{file_extension}")
        
        # Generate filename
        filename = f"health_record_{record.id}{file_extension}"
        
        # Return file as streaming response
        return StreamingResponse(
            iter([file_content]),
            media_type=mime_type or "application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")

@router.delete("/{record_id}")
async def delete_record(record_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    print(f"Delete request for record_id: {record_id}, user_id: {user.id}")
    
    record = db.query(Record).filter(Record.id == record_id, Record.patient_id == user.id).first()
    if not record:
        print(f"Record not found: {record_id}")
        raise HTTPException(status_code=404, detail="Record not found")
    
    print(f"Found record: {record.id}, storage_key: {record.storage_key}")
    
    try:
        # Delete file from storage
        from app.services.storage import delete_file
        print(f"Deleting file from storage: {record.storage_key}")
        delete_file(record.storage_key)
        print("File deleted from storage successfully")
        
        # Delete record from database
        print(f"Deleting record from database: {record.id}")
        db.delete(record)
        db.commit()
        print("Record deleted from database successfully")
        
        return {"message": "Record deleted successfully"}
    except Exception as e:
        print(f"Error during delete: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete record: {str(e)}")

@router.post("/tupload")
async def upload_record_with_token(
    token: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    upload_token = db.query(UploadTokens).filter_by(token=token, used=False).first()
    if not upload_token:
        raise HTTPException(status_code=400, detail="Invalid or expired upload link")

    # process uploaded file
    content = await file.read()
    storage_key, text, fields, doc_type = ingest_document(
        upload_token.patient_id, file.filename, content
    )

    record = Record(
        patient_id=upload_token.patient_id,
        provider_name=upload_token.clinic_name,
        provider_clinic=upload_token.clinic_name,
        provider_specialty=upload_token.service_type,
        document_type=doc_type,
        storage_key=storage_key,
        content_text=text,
        structured_data=fields,
    )

    db.add(record)
    upload_token.used = True
    db.commit()
    db.refresh(record)

    return {"message": "Upload successful", "record_id": record.id}