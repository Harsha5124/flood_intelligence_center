from fastapi import APIRouter
import pandas as pd
from ..config import settings

router = APIRouter(prefix="/history", tags=["Historical Analytics"])

@router.get("/events")
def get_historical_events():
    return [
        {
            "id": "event-2015",
            "name": "December 2015 Chennai Mega Flood",
            "date": "2015-12-01",
            "peak_rainfall_24h_mm": 494.0,
            "peak_chembarambakkam_outflow_cusecs": 29000,
            "max_adyar_level_m": 4.85,
            "affected_basins": ["Adyar", "Cooum", "Kosasthalaiyar"],
            "severity": "CATASTROPHIC",
            "summary": "Record northeast monsoon cloudburst causing massive reservoir spillover. Over 1.8 million people displaced in Adyar floodplain.",
            "key_lessons": "Implementation of automated reservoir pre-release guidelines and continuous gauging stations."
        },
        {
            "id": "event-2023",
            "name": "December 2023 Cyclone Michaung",
            "date": "2023-12-04",
            "peak_rainfall_24h_mm": 380.0,
            "peak_chembarambakkam_outflow_cusecs": 8500,
            "max_adyar_level_m": 3.75,
            "affected_basins": ["Adyar", "Cooum", "Palar"],
            "severity": "CRITICAL",
            "summary": "Slow-moving cyclone off Chennai coast dumping intense downpours for 36 consecutive hours.",
            "key_lessons": "Controlled reservoir outflow prevented peak tidal clash; improved early warning alerts saved riverside communities."
        },
        {
            "id": "event-2024",
            "name": "November 2024 Severe Depressive Monsoon",
            "date": "2024-11-15",
            "peak_rainfall_24h_mm": 195.0,
            "peak_chembarambakkam_outflow_cusecs": 3500,
            "max_adyar_level_m": 2.90,
            "affected_basins": ["Adyar", "Cooum"],
            "severity": "HIGH",
            "summary": "Intense urban waterlogging in Velachery, Mudichur, and Tambaram catchments, handled with early pump dewatering.",
            "key_lessons": "Real-time AI flood predictions provided 18-hour advance window to clear river choke points."
        }
    ]

@router.get("/records")
def get_historical_records(basin: str = "adyar", limit: int = 50):
    csv_path = settings.DATA_DIR / "basin_daily.csv"
    if not csv_path.exists():
        return []
        
    df = pd.read_csv(csv_path)
    filtered = df[df["basin"].str.lower() == basin.lower()].tail(limit)
    return filtered.to_dict(orient="records")
