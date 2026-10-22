import json
from fastapi import APIRouter, HTTPException
from ..config import settings
from .basins import get_basin_definitions

router = APIRouter(prefix="/gis", tags=["GIS & Mapping"])

@router.get("/basins-geojson")
def get_basins_geojson():
    geojson_path = settings.DATA_DIR / "tn_basins.geojson"
    if not geojson_path.exists():
        raise HTTPException(status_code=404, detail="tn_basins.geojson not found")
        
    with open(geojson_path, "r") as f:
        geojson = json.load(f)
        
    basin_defs = {b["id"]: b for b in get_basin_definitions()}
    
    # Augment features with live risk styling
    for feat in geojson.get("features", []):
        b_id = feat["properties"].get("id", "").lower()
        if b_id in basin_defs:
            b_info = basin_defs[b_id]
            feat["properties"]["risk_state"] = b_info["risk_state"]
            feat["properties"]["risk_color"] = b_info["risk_color"]
            feat["properties"]["current_rain"] = b_info["current_rain_24h_mm"]
            feat["properties"]["river_level"] = b_info["river_level_m"]
            feat["properties"]["warning_level"] = b_info["warning_level_m"]
            feat["properties"]["danger_level"] = b_info["danger_level_m"]
            feat["properties"]["trend"] = b_info["trend"]
        else:
            feat["properties"]["risk_state"] = "NORMAL"
            feat["properties"]["risk_color"] = "#22c55e"
            
    return geojson

@router.get("/features-geojson")
def get_features_geojson():
    stations_path = settings.DATA_DIR / "stations.json"
    if not stations_path.exists():
        return {"type": "FeatureCollection", "features": []}
        
    with open(stations_path, "r") as f:
        data = json.load(f)
        
    features = []
    
    # 1. Gauging Stations
    for s in data.get("stations", []):
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [s["lon"], s["lat"]]
            },
            "properties": {
                "id": s["id"],
                "type": "station",
                "name": s["name"],
                "river": s["river"],
                "basin_id": s["basin_id"],
                "current_level_m": s["current_level_m"],
                "warning_level_m": s["warning_level_m"],
                "danger_level_m": s["danger_level_m"],
                "trend": s["trend"],
                "status": s["status"],
                "discharge_cusecs": s["discharge_cusecs"],
                "color": "#ef4444" if s["status"] == "CRITICAL" else ("#f97316" if s["status"] == "WARNING" else ("#eab308" if s["status"] == "WATCH" else "#22c55e"))
            }
        })
        
    # 2. Reservoirs & Dams
    for r in data.get("reservoirs", []):
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [r["lon"], r["lat"]]
            },
            "properties": {
                "id": r["id"],
                "type": "reservoir",
                "name": r["name"],
                "district": r["district"],
                "basin_id": r["basin_id"],
                "storage_pct": r["storage_pct"],
                "storage_mcft": r["current_storage_mcft"],
                "capacity_mcft": r["total_capacity_mcft"],
                "inflow_cusecs": r["inflow_cusecs"],
                "outflow_cusecs": r["outflow_cusecs"],
                "status": r["status"],
                "gates_opened": r["gates_opened"],
                "color": "#06b6d4"
            }
        })

    # 3. Evacuation Shelters
    for sh in data.get("evacuation_centres", []):
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [sh["lon"], sh["lat"]]
            },
            "properties": {
                "id": sh["id"],
                "type": "shelter",
                "name": sh["name"],
                "address": sh["address"],
                "basin_id": sh["basin_id"],
                "capacity_persons": sh["capacity_persons"],
                "current_occupancy": sh["current_occupancy"],
                "phone": sh["phone"],
                "officer": sh["contact_officer"],
                "safe_elevation_m": sh["safe_elevation_m"],
                "facilities": sh["facilities"],
                "color": "#a855f7"
            }
        })

    return {"type": "FeatureCollection", "features": features}

@router.get("/risk-heatmap")
def get_risk_heatmap():
    """Generates dynamically weighted geographic flood risk heat coordinates."""
    points = [
        # Adyar floodplain hot zones
        {"lat": 13.0195, "lon": 80.2227, "name": "Saidapet Maraimalai Adigal Bridge", "intensity": 0.88, "risk": "WARNING", "radius": 24},
        {"lat": 13.0270, "lon": 80.2070, "name": "Jafferkhanpet Low Ground", "intensity": 0.75, "risk": "WATCH", "radius": 22},
        {"lat": 13.0185, "lon": 80.2410, "name": "Kotturpuram Riverbank", "intensity": 0.82, "risk": "WARNING", "radius": 24},
        {"lat": 13.0135, "lon": 80.1856, "name": "Nandambakkam Defense Colony", "intensity": 0.65, "risk": "WATCH", "radius": 20},
        {"lat": 12.9800, "lon": 80.2150, "name": "Velachery Lake Overflow Channel", "intensity": 0.70, "risk": "WATCH", "radius": 22},
        {"lat": 13.0084, "lon": 80.0543, "name": "Chembarambakkam Canal Spillway", "intensity": 0.85, "risk": "WARNING", "radius": 26},
        # Cooum floodplain hot zones
        {"lat": 13.0722, "lon": 80.2185, "name": "Aminjikarai Causeway", "intensity": 0.50, "risk": "WATCH", "radius": 18},
        {"lat": 13.0645, "lon": 80.1652, "name": "Maduravoyal Lowland", "intensity": 0.42, "risk": "NORMAL", "radius": 16},
        {"lat": 13.0800, "lon": 80.2700, "name": "Chintadripet Loop", "intensity": 0.55, "risk": "WATCH", "radius": 18},
        # Cauvery Delta zones
        {"lat": 10.8732, "lon": 78.5815, "name": "Upper Anicut (Mukkombu)", "intensity": 0.35, "risk": "NORMAL", "radius": 20},
        {"lat": 10.8329, "lon": 78.8197, "name": "Grand Anicut (Kallanai)", "intensity": 0.30, "risk": "NORMAL", "radius": 18},
        # Vaigai & Thamirabarani zones
        {"lat": 9.9320, "lon": 78.1065, "name": "Madurai Arapalayam Causeway", "intensity": 0.28, "risk": "NORMAL", "radius": 18},
        {"lat": 8.7289, "lon": 77.7281, "name": "Tirunelveli Sulochana Bridge", "intensity": 0.32, "risk": "NORMAL", "radius": 18}
    ]
    return points
