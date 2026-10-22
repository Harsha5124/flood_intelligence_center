from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db import init_db
from .routers import (
    auth, basins, gis, predictions, warnings, notifications, 
    weather, rivers, reservoirs, evacuation, history, hydron, simulator
)

app = FastAPI(
    title=settings.PROJECT_TITLE,
    description="Real-Time Flood Prediction and Early Warning System using ML for Tamil Nadu River Basins",
    version=settings.VERSION
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API v1 routers
prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=prefix)
app.include_router(basins.router, prefix=prefix)
app.include_router(gis.router, prefix=prefix)
app.include_router(predictions.router, prefix=prefix)
app.include_router(warnings.router, prefix=prefix)
app.include_router(notifications.router, prefix=prefix)
app.include_router(weather.router, prefix=prefix)
app.include_router(rivers.router, prefix=prefix)
app.include_router(reservoirs.router, prefix=prefix)
app.include_router(evacuation.router, prefix=prefix)
app.include_router(history.router, prefix=prefix)
app.include_router(hydron.router, prefix=prefix)
app.include_router(simulator.router, prefix=prefix)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/v1/health")
@app.get("/healthz")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected",
        "supported_basins": settings.PRIMARY_BASINS
    }

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_TITLE,
        "status": "active",
        "docs_url": "/docs",
        "health_check": "/api/v1/health"
    }
