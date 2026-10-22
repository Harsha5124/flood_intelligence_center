from fastapi import APIRouter
from pydantic import BaseModel
from ..services.ml_engine import predict_basin_flood
from ..services.warning_engine import warning_engine

router = APIRouter(prefix="/simulator", tags=["What-If Simulator"])

class ScenarioRequest(BaseModel):
    basin_id: str = "adyar"
    rainfall_scenario_mm: float = 120.0
    reservoir_discharge_cusecs: float = 6500.0
    upstream_soil_saturation: float = 0.85
    gauge_water_level_m: float = 2.80

@router.post("/run")
def run_scenario(req: ScenarioRequest):
    # Map reservoir outflow to storage percentage approximation
    sim_storage_pct = min(100.0, 70.0 + (req.reservoir_discharge_cusecs / 300.0))
    
    # Run ML prediction with simulated scenario values
    pred = predict_basin_flood(
        basin_id=req.basin_id,
        rain_1d=req.rainfall_scenario_mm * 0.75,
        rain_3d=req.rainfall_scenario_mm * 1.2,
        rain_7d=req.rainfall_scenario_mm * 1.8,
        rain_14d=req.rainfall_scenario_mm * 2.5,
        rain_fcst_1d=req.rainfall_scenario_mm,
        soil=req.upstream_soil_saturation,
        storage_pct=sim_storage_pct,
        level_m=req.gauge_water_level_m,
        d_level=req.gauge_water_level_m - 2.0
    )
    
    # Warning engine evaluation for scenario
    rate_sim = (req.rainfall_scenario_mm / 15.0) + (req.reservoir_discharge_cusecs / 1000.0)
    eval_state = warning_engine.evaluate_basin(
        basin_id=req.basin_id,
        current_level=pred["predicted_level_m"],
        rate_of_rise=rate_sim,
        rainfall_24h=req.rainfall_scenario_mm,
        reservoir_pct=sim_storage_pct,
        ml_prob=pred["flood_probability"]
    )
    
    return {
        "scenario": {
            "basin_id": req.basin_id,
            "rainfall_scenario_mm": req.rainfall_scenario_mm,
            "reservoir_discharge_cusecs": req.reservoir_discharge_cusecs,
            "soil_saturation": req.upstream_soil_saturation,
            "gauge_level_m": req.gauge_water_level_m
        },
        "ml_result": pred,
        "warning_evaluation": eval_state
    }
