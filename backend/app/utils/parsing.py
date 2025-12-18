import re
from typing import Dict, List, Tuple, Optional

SECTION_PATTERNS = {
    "presenting_complaint": r"(?:^|\n)\s*(Presenting complaint)[:\-]\s*(.+?)(?=\n[A-Z][A-Za-z ]+:|\n[A-Z][A-Za-z ]+\n|$)",
    "history": r"(?:^|\n)\s*(History)[:\-]\s*(.+?)(?=\n[A-Z][A-Za-z ]+:|\n[A-Z][A-Za-z ]+\n|$)",
    "examination": r"(?:^|\n)\s*(Examination)[:\-]\s*(.+?)(?=\n[A-Z][A-Za-z ]+:|\n[A-Z][A-Za-z ]+\n|$)",
    "assessment": r"(?:^|\n)\s*(Assessment)[:\-]\s*(.+?)(?=\n[A-Z][A-Za-z ]+:|\n[A-Z][A-Za-z ]+\n|$)",
    "plan": r"(?:^|\n)\s*(Plan)[:\-]\s*(.+?)(?=\n[A-Z][A-Za-z ]+:|\n[A-Z][A-Za-z ]+\n|$)",
    "tests": r"(?:^|\n)\s*(Tests)[:\-]\s*(.+?)(?=\n[A-Z][A-Za-z ]+:|\n[A-Z][A-Za-z ]+\n|$)",
    "follow_up": r"(?:^|\n)\s*(Follow-up)[:\-]\s*(.+?)(?=\n[A-Z][A-Za-z ]+:|\n[A-Z][A-Za-z ]+\n|$)",
    "medications": r"(?:^|\n)\s*(Medications?)[:\-]\s*(.+?)(?=\n[A-Z][A-Za-z ]+:|\n[A-Z][A-Za-z ]+\n|$)",
}

CLINIC_LINE = r"^(?P<clinic>.*?(Practice|Clinic).*)$"
CLINIC_CONTACT = r"^(?P<address>.+\bVIC\b.*?)(?:\s*\|\s*(?P<phone>\(0[0-9]\)\s*[0-9]{4}\s*[0-9]{3,4}))?$"

PATIENT_BLOCK = r"Patient:\s*(?P<patient_name>[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)+)\s*\|\s*DOB:\s*(?P<dob>[0-9]{1,2}\s+\w+\s+[0-9]{4})"
VISIT_DATE = r"(Date of visit|Visit Date)[:\-]\s*(?P<visit_date>[0-9]{1,2}\s+\w+\s+[0-9]{4}|[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}/[0-9]{1,2}/[0-9]{4})"

CLINICIAN_LINE = r"Clinician:\s*(?P<provider_name>Dr\.?\s+[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)\s*\((?P<provider_specialty>[^)]+)\)"
SIGNATURE_LINE = r"Signature:\s*(?P<signature>.+)"

LAB_RESULT = r"(?P<name>[A-Za-z ][A-Za-z ]+)[\:\-]\s*(?P<value>[0-9.]+)\s*(?P<units>mmol/L|g/L|mg/dL|%|°C)"

def normalize_text(text: str) -> str:
    """
    Basic cleanup to reduce OCR/line noise.
    """
    if not text:
        return ""
    # Normalize line endings and strip trailing spaces
    text = text.replace("\r", "")
    text = re.sub(r"[ \t]+\n", "\n", text)
    # Collapse multiple blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Normalize dashes and bullets
    text = text.replace("—", "-").replace("–", "-")
    return text.strip()

def _match_first(pattern: str, text: str, flags: int = 0) -> Optional[re.Match]:
    m = re.search(pattern, text, flags)
    return m

def _match_all(pattern: str, text: str, flags: int = 0) -> List[re.Match]:
    return list(re.finditer(pattern, text, flags))

def _extract_section(pattern: str, text: str) -> Optional[str]:
    m = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL | re.MULTILINE)
    if m:
        content = m.group(2).strip()
        content = re.sub(r"\s+", " ", content).strip()
        return content
    return None

def _collect_sections(text: str) -> Dict[str, Optional[str]]:
    sections: Dict[str, Optional[str]] = {}
    for key, pattern in SECTION_PATTERNS.items():
        sections[key] = _extract_section(pattern, text)
    return sections

def _extract_medications_global(text: str) -> List[str]:
    """
    Medications may appear inline (e.g., ‘Plan: ... Medications: Paracetamol ...’).
    We scan globally as a fallback.
    """
    meds: List[str] = []
    for m in _match_all(r"Medications?:\s*(.+)", text, flags=re.IGNORECASE):
        line = m.group(1).strip()
        # Split on typical separators while keeping dose info intact
        parts = re.split(r";|\.\s+(?=[A-Z])|,\s+(?=[A-Z])", line)
        for p in parts:
            p = p.strip()
            if p:
                meds.append(p)
    return meds

def _extract_lab_results(text: str) -> Dict[str, str]:
    labs: Dict[str, str] = {}
    for m in _match_all(LAB_RESULT, text, flags=re.IGNORECASE):
        name = m.group("name").strip()
        value = f"{m.group('value')} {m.group('units')}".strip()
        labs[name] = value
    return labs

def _normalize_date_str(date_str: Optional[str]) -> Optional[str]:
    """
    Normalize a variety of date formats to ISO-like ‘YYYY-MM-DD’ where possible.
    For MVP, we leave non-parsable formats as-is.
    """
    if not date_str:
        return None
    s = date_str.strip()

    # dd/mm/yyyy -> yyyy-mm-dd
    m = re.match(r"(?P<d>[0-9]{1,2})/(?P<m>[0-9]{1,2})/(?P<y>[0-9]{4})$", s)
    if m:
        d = int(m.group("d"))
        mo = int(m.group("m"))
        y = int(m.group("y"))
        return f"{y:04d}-{mo:02d}-{d:02d}"

    # yyyy-mm-dd already normalized
    if re.match(r"[0-9]{4}-[0-9]{2}-[0-9]{2}$", s):
        return s

    # “17 September 2025” -> yyyy-mm-dd
    m = re.match(r"(?P<d>[0-9]{1,2})\s+(?P<month>[A-Za-z]+)\s+(?P<y>[0-9]{4})$", s)
    if m:
        month_map = {
            "January": 1, "Jan": 1,
            "February": 2, "Feb": 2,
            "March": 3, "Mar": 3,
            "April": 4, "Apr": 4,
            "May": 5,
            "June": 6, "Jun": 6,
            "July": 7, "Jul": 7,
            "August": 8, "Aug": 8,
            "September": 9, "Sep": 9, "Sept": 9,
            "October": 10, "Oct": 10,
            "November": 11, "Nov": 11,
            "December": 12, "Dec": 12,
        }
        d = int(m.group("d"))
        mon = month_map.get(m.group("month"), 0)
        y = int(m.group("y"))
        if mon:
            return f"{y:04d}-{mon:02d}-{d:02d}"
        return s

    # “01 Jan 1990” -> yyyy-mm-dd
    m = re.match(r"(?P<d>[0-9]{1,2})\s+(?P<month>[A-Za-z]+)\s+(?P<y>[0-9]{4})$", s)
    if m:
        # handled above; keeping fallback
        return s

    # Otherwise return original string for audit
    return s

def extract_fields(text: str) -> Dict:
    """
    Heuristic extraction for GP-style consultation reports.
    Returns a structured dict capturing clinic, patient, visit, clinician,
    sections, medications, and lab results.
    """
    result: Dict = {}

    # Header clinic line
    clinic_line = _match_first(CLINIC_LINE, text, flags=re.IGNORECASE | re.MULTILINE)
    if clinic_line:
        result["provider_clinic"] = clinic_line.group("clinic").strip()

    # Header contact line (address | phone)
    contact_line = _match_first(CLINIC_CONTACT, text, flags=re.IGNORECASE | re.MULTILINE)
    if contact_line:
        result["clinic_address"] = (contact_line.group("address") or "").strip()
        result["clinic_phone"] = (contact_line.group("phone") or "").strip() or None

    # Patient block (name | DOB)
    pb = _match_first(PATIENT_BLOCK, text)
    if pb:
        result["patient_name"] = pb.group("patient_name").strip()
        result["patient_dob"] = _normalize_date_str(pb.group("dob").strip())

    # Visit date
    vd = _match_first(VISIT_DATE, text, flags=re.IGNORECASE)
    if vd:
        result["visit_date"] = _normalize_date_str(vd.group("visit_date").strip())
    else:
        result["visit_date"] = None

    # Clinician line and specialty
    cl = _match_first(CLINICIAN_LINE, text)
    if cl:
        result["provider_name"] = cl.group("provider_name").strip()
        result["provider_specialty"] = cl.group("provider_specialty").strip()

    # Signature (optional)
    sig = _match_first(SIGNATURE_LINE, text)
    result["signature"] = sig.group("signature").strip() if sig else None

    # Sections
    sections = _collect_sections(text)
    # Clean each section to single spaced lines
    for key, val in sections.items():
        if val:
            sections[key] = re.sub(r"\s+", " ", val).strip()
    result["sections"] = sections

    # Diagnosis: prefer 'assessment' section as primary diagnosis summary
    diagnosis: List[str] = []
    if sections.get("assessment"):
        diagnosis.append(sections["assessment"])
    result["diagnosis"] = diagnosis

    # Medications: merge section-derived and global scan; de-duplicate
    meds_section = []
    if sections.get("medications"):
        meds_section.append(sections["medications"])
    meds_global = _extract_medications_global(text)
    meds_all = meds_section + meds_global
    # De-duplicate while preserving order
    seen = set()
    meds_unique = []
    for m in meds_all:
        key = m.lower()
        if key not in seen:
            seen.add(key)
            meds_unique.append(m)
    result["medications"] = meds_unique

    # Lab results
    result["lab_results"] = _extract_lab_results(text)

    return result