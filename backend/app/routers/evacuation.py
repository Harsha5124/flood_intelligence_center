import json
import math
from fastapi import APIRouter
from ..config import settings

router = APIRouter(prefix="/evacuation", tags=["Evacuation Intelligence"])

def haversine(lat1, lon1, lat2, lon2):
    """Calculates great-circle distance in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

@router.get("/shelters")
def list_shelters():
    stations_path = settings.DATA_DIR / "stations.json"
    if not stations_path.exists():
        return []
    with open(stations_path, "r") as f:
        data = json.load(f)
    return data.get("evacuation_centres", [])

@router.get("/nearest")
def find_nearest_shelters(lat: float = 13.0185, lon: float = 80.2227, limit: int = 5):
    shelters = list_shelters()
    for s in shelters:
        s["distance_km"] = haversine(lat, lon, s["lat"], s["lon"])
        s["estimated_travel_time_mins"] = int(s["distance_km"] * 6.5) # approx vehicle/walking travel time in flood conditions
    shelters.sort(key=lambda x: x["distance_km"])
    return {
        "user_location": {"lat": lat, "lon": lon},
        "nearest_shelters": shelters[:limit]
    }
