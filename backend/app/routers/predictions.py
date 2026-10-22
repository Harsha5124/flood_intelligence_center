from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from ..services.ml_engine import predict_basin_flood, get_model_evaluation
from ..db import get_db

router = APIRouter(prefix="/predictions", tags=["ML Flood Prediction"])

class CustomPredictionRequest(BaseModel):
    basin_id: str = "adyar"
    rain_1d: float = 25.0
    rain_3d: float = 50.0
    rain_7d: float = 80.0
    rain_14d: float = 120.0
    rain_fcst_1d: float = 55.0
    soil: float = 0.60
    storage_pct: float = 82.5
    level_m: float = 2.45
    d_level: float = 0.25
    tide_m: float = 0.35
    month: Optional[int] = None

@router.get("/latest")
def get_latest_prediction(basin: str = "adyar"):
    b = basin.lower()
    telemetry_profiles = {
        "adyar": {
            "rain_1d": 68.5, "rain_3d": 110.0, "rain_7d": 165.0, "rain_14d": 240.0,
            "rain_fcst_1d": 85.0, "soil": 0.74, "storage_pct": 82.8, "level_m": 2.85, "d_level": 0.35, "tide_m": 0.42
        },
        "cooum": {
            "rain_1d": 38.0, "rain_3d": 65.0, "rain_7d": 95.0, "rain_14d": 150.0,
            "rain_fcst_1d": 45.0, "soil": 0.62, "storage_pct": 66.5, "level_m": 1.95, "d_level": 0.15, "tide_m": 0.35
        },
        "cauvery": {
            "rain_1d": 22.4, "rain_3d": 52.0, "rain_7d": 88.0, "rain_14d": 140.0,
            "rain_fcst_1d": 35.0, "soil": 0.58, "storage_pct": 83.6, "level_m": 3.80, "d_level": 0.10, "tide_m": 0.10
        },
        "vaigai": {
            "rain_1d": 18.0, "rain_3d": 40.0, "rain_7d": 68.0, "rain_14d": 110.0,
            "rain_fcst_1d": 25.0, "soil": 0.52, "storage_pct": 68.4, "level_m": 2.10, "d_level": 0.05, "tide_m": 0.05
        },
        "tamiraparani": {
            "rain_1d": 28.5, "rain_3d": 58.0, "rain_7d": 92.0, "rain_14d": 135.0,
            "rain_fcst_1d": 40.0, "soil": 0.61, "storage_pct": 74.5, "level_m": 2.45, "d_level": 0.12, "tide_m": 0.20
        },
        "palar": {
            "rain_1d": 14.5, "rain_3d": 32.0, "rain_7d": 55.0, "rain_14d": 90.0,
            "rain_fcst_1d": 20.0, "soil": 0.45, "storage_pct": 75.9, "level_m": 1.85, "d_level": 0.04, "tide_m": 0.15
        }
    }
    
    t = telemetry_profiles.get(b, telemetry_profiles["adyar"])
    return predict_basin_flood(
        basin_id=b if b in telemetry_profiles else "adyar",
        rain_1d=t["rain_1d"],
        rain_3d=t["rain_3d"],
        rain_7d=t["rain_7d"],
        rain_14d=t["rain_14d"],
        rain_fcst_1d=t["rain_fcst_1d"],
        soil=t["soil"],
        storage_pct=t["storage_pct"],
        level_m=t["level_m"],
        d_level=t["d_level"],
        tide_m=t["tide_m"]
    )

@router.post("/calculate")
def calculate_prediction(req: CustomPredictionRequest):
    pred = predict_basin_flood(
        basin_id=req.basin_id,
        rain_1d=req.rain_1d,
        rain_3d=req.rain_3d,
        rain_7d=req.rain_7d,
        rain_14d=req.rain_14d,
        rain_fcst_1d=req.rain_fcst_1d,
        soil=req.soil,
        storage_pct=req.storage_pct,
        level_m=req.level_m,
        d_level=req.d_level,
        tide_m=req.tide_m,
        month=req.month
    )
    
    # Log prediction into DB
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO predictions (basin_id, rainfall_24h, forecast_rain, river_level, predicted_level, flood_probability, risk_category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (req.basin_id, req.rain_1d, req.rain_fcst_1d, req.level_m, pred["predicted_level_m"], pred["flood_probability"], pred["risk_category"]))
        conn.commit()
        conn.close()
    except Exception:
        pass
        
    return pred

@router.get("/metrics")
def get_metrics():
    return get_model_evaluation()
