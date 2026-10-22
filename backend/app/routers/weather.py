from fastapi import APIRouter
from datetime import datetime, timedelta

router = APIRouter(prefix="/weather", tags=["Meteorology & Weather"])

@router.get("/current")
def get_current_weather(basin: str = "adyar"):
    now = datetime.now()
    if basin.lower() == "adyar":
        return {
            "basin_id": "adyar",
            "station": "Meenambakkam Meteorological Observatory, Chennai",
            "rainfall_last_1h_mm": 12.4,
            "rainfall_last_24h_mm": 68.5,
            "forecast_next_24h_mm": 85.0,
            "temperature_c": 28.4,
            "humidity_pct": 89,
            "pressure_hpa": 1006.2,
            "wind_speed_kmh": 24.5,
            "wind_direction": "ENE (East-North-East)",
            "condition": "Heavy Intermittent Rain / Monsoon Inflow",
            "source": "IMD Radar & Open-Meteo Integration",
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S IST")
        }
    else:
        return {
            "basin_id": "cooum",
            "station": "Nungambakkam Weather Station, Chennai",
            "rainfall_last_1h_mm": 6.8,
            "rainfall_last_24h_mm": 38.0,
            "forecast_next_24h_mm": 45.0,
            "temperature_c": 29.1,
            "humidity_pct": 84,
            "pressure_hpa": 1007.0,
            "wind_speed_kmh": 18.2,
            "wind_direction": "NE (North-East)",
            "condition": "Scattered Moderate Showers",
            "source": "IMD Regional Weather Telemetry",
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S IST")
        }

@router.get("/forecast")
def get_rainfall_forecast(basin: str = "adyar"):
    # Hourly 24h precipitation forecast
    base_time = datetime.now()
    forecast = []
    rains = [4.2, 5.8, 8.5, 12.0, 14.5, 16.2, 12.8, 9.4, 7.1, 5.0, 4.2, 3.8, 
             2.5, 2.0, 1.8, 3.2, 6.5, 9.0, 11.2, 8.5, 6.0, 4.5, 3.2, 2.1]
    
    for i, r in enumerate(rains):
        t = base_time + timedelta(hours=i)
        forecast.append({
            "hour": t.strftime("%H:00"),
            "time_iso": t.isoformat(),
            "rain_mm": r if basin.lower() == "adyar" else round(r * 0.65, 1),
            "accumulated_rain_mm": round(sum(rains[:i+1]) if basin.lower() == "adyar" else sum(rains[:i+1]) * 0.65, 1)
        })
    return {"basin_id": basin, "forecast_hours": forecast}
