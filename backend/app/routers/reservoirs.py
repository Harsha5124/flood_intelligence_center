import json
from fastapi import APIRouter
from ..config import settings

router = APIRouter(prefix="/reservoirs", tags=["Reservoirs & Dams"])

@router.get("")
def list_reservoirs():
    stations_path = settings.DATA_DIR / "stations.json"
    if not stations_path.exists():
        return []
    with open(stations_path, "r") as f:
        data = json.load(f)
    return data.get("reservoirs", [])
