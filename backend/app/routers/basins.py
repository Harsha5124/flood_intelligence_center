from fastapi import APIRouter, HTTPException
from ..config import settings
from ..services.ml_engine import predict_basin_flood
from ..services.warning_engine import warning_engine
import json

router = APIRouter(prefix="/basins", tags=["River Basins"])

def get_basin_definitions():
    return [
        {
            "id": "adyar",
            "name": "Adyar River Basin",
            "modelled": True,
            "river_length_km": 42.5,
            "catchment_area_sqkm": 860.0,
            "major_rivers": ["Adyar", "Mambalam Canal", "Chembarambakkam Outfall"],
            "districts": ["Kancheepuram", "Chengalpattu", "Chennai"],
            "key_reservoir": "Chembarambakkam Lake",
            "center": {"lat": 12.98, "lon": 80.12},
            "current_rain_24h_mm": 68.5,
            "forecast_rain_24h_mm": 85.0,
            "river_level_m": 2.85,
            "warning_level_m": 2.50,
            "danger_level_m": 3.50,
            "rate_of_change_cm_hr": 7.8,
            "trend": "RISING",
            "risk_state": "WARNING",
            "risk_color": "#f97316",
            "description": "Crucial urban-estuarine drainage system passing through southern Chennai metropolis with high vulnerability to upstream Chembarambakkam reservoir release."
        },
        {
            "id": "cooum",
            "name": "Cooum River Basin",
            "modelled": True,
            "river_length_km": 72.0,
            "catchment_area_sqkm": 682.0,
            "major_rivers": ["Cooum", "Kesavaram Anicut Feeder"],
            "districts": ["Tiruvallur", "Kancheepuram", "Chennai"],
            "key_reservoir": "Poondi Reservoir",
            "center": {"lat": 13.08, "lon": 80.15},
            "current_rain_24h_mm": 38.0,
            "forecast_rain_24h_mm": 45.0,
            "river_level_m": 1.95,
            "warning_level_m": 2.20,
            "danger_level_m": 3.20,
            "rate_of_change_cm_hr": 1.5,
            "trend": "RISING",
            "risk_state": "WATCH",
            "risk_color": "#eab308",
            "description": "Originating in Tiruvallur district and flowing into the Bay of Bengal, traversing central Chennai with multiple urban bridge gauge bottlenecks."
        },
        {
            "id": "cauvery",
            "name": "Cauvery & Coleroon Basin",
            "modelled": True,
            "river_length_km": 805.0,
            "catchment_area_sqkm": 81155.0,
            "major_rivers": ["Cauvery", "Bhavani", "Amaravathi", "Coleroon", "Noyyal"],
            "districts": ["Salem", "Erode", "Karur", "Tiruchirappalli", "Thanjavur", "Mayiladuthurai"],
            "key_reservoir": "Mettur Dam (Stanley Reservoir)",
            "center": {"lat": 11.20, "lon": 78.25},
            "current_rain_24h_mm": 45.0,
            "forecast_rain_24h_mm": 60.0,
            "river_level_m": 4.80,
            "warning_level_m": 5.00,
            "danger_level_m": 6.50,
            "rate_of_change_cm_hr": 2.2,
            "trend": "RISING",
            "risk_state": "WATCH",
            "risk_color": "#eab308",
            "description": "The largest river basin in Tamil Nadu, sustaining the fertile delta with key regulating structures at Mettur Dam, Upper Anicut, and Grand Anicut (Kallanai)."
        },
        {
            "id": "vaigai",
            "name": "Vaigai River Basin",
            "modelled": True,
            "river_length_km": 258.0,
            "catchment_area_sqkm": 7031.0,
            "major_rivers": ["Vaigai", "Suruliyar", "Varahanadhi"],
            "districts": ["Theni", "Dindigul", "Madurai", "Sivaganga", "Ramanathapuram"],
            "key_reservoir": "Vaigai Dam",
            "center": {"lat": 9.95, "lon": 78.28},
            "current_rain_24h_mm": 32.0,
            "forecast_rain_24h_mm": 40.0,
            "river_level_m": 2.90,
            "warning_level_m": 3.20,
            "danger_level_m": 4.50,
            "rate_of_change_cm_hr": 1.4,
            "trend": "RISING",
            "risk_state": "WATCH",
            "risk_color": "#eab308",
            "description": "Vital southern basin flowing from the Western Ghats through Madurai city into Palk Strait, monitored via Vaigai Dam and Peranai Regulator."
        },
        {
            "id": "tamiraparani",
            "name": "Thamirabarani Basin",
            "modelled": True,
            "river_length_km": 128.0,
            "catchment_area_sqkm": 5969.0,
            "major_rivers": ["Thamirabarani", "Servalar", "Manimuthar", "Gadangandhi", "Chittar"],
            "districts": ["Tirunelveli", "Tenkasi", "Thoothukudi"],
            "key_reservoir": "Papanasam Dam & Manimuthar Dam",
            "center": {"lat": 8.69, "lon": 77.77},
            "current_rain_24h_mm": 54.0,
            "forecast_rain_24h_mm": 70.0,
            "river_level_m": 3.10,
            "warning_level_m": 3.50,
            "danger_level_m": 4.80,
            "rate_of_change_cm_hr": 3.5,
            "trend": "RISING",
            "risk_state": "WATCH",
            "risk_color": "#eab308",
            "description": "Perennial river in southern Tamil Nadu originating in Agasthyamalai, critical for Tirunelveli and Thoothukudi industrial and agricultural belts."
        },
        {
            "id": "palar",
            "name": "Palar River Basin",
            "modelled": True,
            "river_length_km": 348.0,
            "catchment_area_sqkm": 17871.0,
            "major_rivers": ["Palar", "Cheyyar", "Ponnai"],
            "districts": ["Vellore", "Ranipet", "Tirupathur", "Kancheepuram", "Chengalpattu"],
            "key_reservoir": "Palar Anicut System",
            "center": {"lat": 12.88, "lon": 79.49},
            "current_rain_24h_mm": 28.0,
            "forecast_rain_24h_mm": 35.0,
            "river_level_m": 2.30,
            "warning_level_m": 3.00,
            "danger_level_m": 4.20,
            "rate_of_change_cm_hr": 0.8,
            "trend": "STEADY",
            "risk_state": "NORMAL",
            "risk_color": "#22c55e",
            "description": "Northern basin draining eastern plateau runoff across northern districts with wide sandy floodplains into the Bay of Bengal."
        }
    ]

@router.get("")
def list_basins():
    basins = get_basin_definitions()
    # Augment primary basins with latest ML risk prediction
    for b in basins:
        if b["modelled"]:
            ml_pred = predict_basin_flood(
                basin_id=b["id"],
                rain_1d=b["current_rain_24h_mm"],
                rain_fcst_1d=b["forecast_rain_24h_mm"],
                level_m=b["river_level_m"],
                storage_pct=82.8 if b["id"] == "adyar" else 66.5
            )
            b["ml_prediction"] = ml_pred
            b["flood_probability_pct"] = ml_pred["flood_probability_pct"]
            b["risk_state"] = ml_pred["risk_category"]
            b["risk_color"] = ml_pred["risk_color"]
    return basins

@router.get("/{basin_id}")
def get_basin(basin_id: str):
    basins = get_basin_definitions()
    target = next((b for b in basins if b["id"].lower() == basin_id.lower()), None)
    if not target:
        raise HTTPException(status_code=404, detail="Basin not found")
        
    # Get associated stations and reservoirs
    stations_path = settings.DATA_DIR / "stations.json"
    stations = []
    reservoirs = []
    shelters = []
    if stations_path.exists():
        with open(stations_path, "r") as f:
            data = json.load(f)
            stations = [s for s in data.get("stations", []) if s.get("basin_id") == target["id"]]
            reservoirs = [r for r in data.get("reservoirs", []) if r.get("basin_id") == target["id"]]
            shelters = [sh for sh in data.get("evacuation_centres", []) if sh.get("basin_id") == target["id"]]
            
    target["stations"] = stations
    target["reservoirs"] = reservoirs
    target["evacuation_centres"] = shelters
    
    if target["modelled"]:
        target["ml_prediction"] = predict_basin_flood(
            basin_id=target["id"],
            rain_1d=target["current_rain_24h_mm"],
            rain_fcst_1d=target["forecast_rain_24h_mm"],
            level_m=target["river_level_m"]
        )
        
    return target
