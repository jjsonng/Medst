from fastapi import APIRouter, Query
from typing import Optional
from app.services.clinics import search_clinics

router = APIRouter(prefix="/clinics", tags=["clinics"])

@router.get("/search")
def search_clinics_endpoint(
    name: str = Query(..., description="Clinic name or keyword"),
    location: Optional[str] = Query(None, description="Suburb, postcode, or address")
):
    """
    Search for clinics by name/keyword, optionally near a suburb/postcode/address.
    """
    results = search_clinics(name, location)
    return {"count": len(results), "results": results}
