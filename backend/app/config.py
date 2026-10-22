import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
ML_DIR = BASE_DIR / "ml"
DB_PATH = BASE_DIR / "flood_centre.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Flood Intelligence Centre"
    PROJECT_TITLE: str = "Real-Time Flood Prediction and Early Warning System for Tamil Nadu River Basins"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "flood_intelligence_centre_secret_2026_tn")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATA_DIR: Path = DATA_DIR
    ML_DIR: Path = ML_DIR
    DATABASE_PATH: Path = DB_PATH
    
    # Modelled Basins for ML Inference
    PRIMARY_BASINS: list[str] = ["adyar", "cooum", "cauvery", "vaigai", "tamiraparani", "palar"]
    
    # Basin warning & danger marks (meters)
    RIVER_THRESHOLDS: dict[str, dict[str, float]] = {
        "adyar": {"warning": 2.50, "danger": 3.50, "bankfull": 4.20},
        "cooum": {"warning": 2.20, "danger": 3.20, "bankfull": 3.90},
        "cauvery": {"warning": 5.00, "danger": 6.50, "bankfull": 7.50},
        "vaigai": {"warning": 3.20, "danger": 4.50, "bankfull": 5.20},
        "tamiraparani": {"warning": 3.50, "danger": 4.80, "bankfull": 5.60},
        "palar": {"warning": 3.00, "danger": 4.20, "bankfull": 5.00}
    }

settings = Settings()
