import json
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from ..config import settings

router = APIRouter(prefix="/rivers", tags=["River Gauging"])

@router.get("")
def get_river_stations():
    stations_path = settings.DATA_DIR / "stations.json"
    if not stations_path.exists():
        return []
    with open(stations_path, "r") as f:
        data = json.load(f)
    return data.get("stations", [])

@router.get("/{station_id}/hydrograph")
def get_station_hydrograph(station_id: str):
    stations_path = settings.DATA_DIR / "stations.json"
    if not stations_path.exists():
        raise HTTPException(status_code=404, detail="Stations data not found")
        
    with open(stations_path, "r") as f:
        data = json.load(f)
        
    station = next((s for s in data.get("stations", []) if s["id"].lower() == station_id.lower()), None)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
        
    curr_level = station["current_level_m"]
    warning_mark = station["warning_level_m"]
    danger_mark = station["danger_level_m"]
    
    # Generate 24h hydrograph curve leading up to current level
    now = datetime.now()
    points = []
    base_level = curr_level - (station["rate_of_change_cm_hr"] * 12 / 100.0)
    
    for h in range(24, 0, -1):
        t = now - timedelta(hours=h)
        # Smooth interpolation to current level
        frac = (24 - h) / 24.0
        lvl = round(base_level + (curr_level - base_level) * (frac ** 1.3), 2)
        points.append({
            "timestamp": t.strftime("%H:00"),
            "water_level_m": lvl,
            "warning_level_m": warning_mark,
            "danger_level_m": danger_mark,
            "discharge_cusecs": int(station["discharge_cusecs"] * (lvl / curr_level))
        })
        
    # Append current point
    points.append({
        "timestamp": now.strftime("%H:00"),
        "water_level_m": curr_level,
        "warning_level_m": warning_mark,
        "danger_level_m": danger_mark,
        "discharge_cusecs": station["discharge_cusecs"]
    })
    
    return {
        "station": station,
        "hydrograph": points
    }
