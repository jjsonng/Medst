import requests
from typing import List, Dict, Optional
from app.config import settings

GOOGLE_PLACES_TEXT_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
GOOGLE_PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"


def geocode_location(location: str) -> Optional[str]:
    """
    Convert a location (suburb, postcode, or address) into lat,lng
    """
    # Add country context for more accurate geocoding
    params = {"address": f"{location}, Australia", "key": settings.google_api_key}
    resp = requests.get(GOOGLE_GEOCODE_URL, params=params)
    data = resp.json()

    if data.get("results"):
        loc = data["results"][0]["geometry"]["location"]
        return f"{loc['lat']},{loc['lng']}"

    return None


def search_clinics(query: str, location: Optional[str] = None) -> List[Dict]:
    """
    If a location is provided -> use Nearby Search (places near suburb).
    If no location -> use Text Search (best match, no radius constraint).
    """
    results = []

    # Recognized medical related keywords
    medical_types = {"doctor", "dentist", "hospital", "pharmacy", "physiotherapist"}

    if location:
        coords = geocode_location(location)
        if coords:
            # Nearby Search: find nearby places around suburb/postcode
            params = {
                "location": coords,
                "rankby": "distance",
                "keyword": query,
                "type": "doctor",
                "key": settings.google_api_key,
            }
            resp = requests.get(GOOGLE_PLACES_NEARBY_URL, params=params)
        else:
            # Fallback if geocoding fails
            params = {"query": f"{query} in {location}, Australia", "key": settings.google_api_key}
            resp = requests.get(GOOGLE_PLACES_TEXT_URL, params=params)
    else:
        # Text Search: no location, find best match
        params = {"query": query, "key": settings.google_api_key}
        resp = requests.get(GOOGLE_PLACES_TEXT_URL, params=params)

    data = resp.json()

    for place in data.get("results", []):
        types = place.get("types", [])
        if any(t in types for t in medical_types):
            results.append({
                "name": place.get("name"),
                "address": place.get("vicinity") or place.get("formatted_address"),
                "rating": place.get("rating"),
                "user_ratings_total": place.get("user_ratings_total"),
                "place_id": place.get("place_id"),
            })

    return results
