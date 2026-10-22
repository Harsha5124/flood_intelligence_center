from fastapi import APIRouter
from pydantic import BaseModel
from ..db import get_db
from ..services.warning_engine import warning_engine

router = APIRouter(prefix="/warnings", tags=["Early Warnings"])

class EvaluateWarningRequest(BaseModel):
    basin_id: str = "adyar"
    current_level_m: float = 2.85
    rate_of_rise_cm_hr: float = 7.8
    rainfall_24h_mm: float = 68.5
    reservoir_storage_pct: float = 82.8
    ml_flood_probability: float = 0.45

@router.get("")
def get_warnings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, basin_id, severity, title, message, trigger_metric, trigger_value, recommended_action, status, created_at, acknowledged
    FROM alerts
    ORDER BY created_at DESC
    """)
    alerts = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return alerts

@router.post("/evaluate")
def evaluate_warnings(req: EvaluateWarningRequest):
    return warning_engine.evaluate_basin(
        basin_id=req.basin_id,
        current_level=req.current_level_m,
        rate_of_rise=req.rate_of_rise_cm_hr,
        rainfall_24h=req.rainfall_24h_mm,
        reservoir_pct=req.reservoir_storage_pct,
        ml_prob=req.ml_flood_probability
    )

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET acknowledged = 1 WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "alert_id": alert_id, "acknowledged": True}
