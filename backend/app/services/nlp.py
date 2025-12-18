# Placeholder for future advanced NLP
# For now, rely on utils.parsing heuristics.

def postprocess_structured(data: dict) -> dict:
    # Simple cleanup rules
    if "diagnosis" in data:
        data["diagnosis"] = [d.strip() for d in data["diagnosis"] if d.strip()]
    if "medications" in data:
        data["medications"] = [m.strip() for m in data["medications"] if m.strip()]
    return data
