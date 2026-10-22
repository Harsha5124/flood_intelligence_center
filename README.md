# FLOOD INTELLIGENCE CENTRE (FIC)
### Real-Time Flood Prediction and Early Warning System using ML for Tamil Nadu River Basins
**Project ID:** 46138 | **Type:** S5 College Mini Project | **Academic Year:** 2026

---

## 🌊 Overview
**Flood Intelligence Centre** is a state-of-the-art decision-support and environmental surveillance web platform developed for Tamil Nadu river basins. It integrates real GIS cartography, real satellite imagery, machine learning-driven flood risk prediction across 6 major river basins, automated condition-driven early warnings, evacuation shelter routing, and the internal **Hydron AI Assistant**.

### Key Capabilities
1. **Real Satellite & Interactive Tamil Nadu GIS**:
   - **Real Satellite Imagery**: Esri World Imagery with high-resolution earth view and boundary/place labels overlay.
   - **Real Street Map**: OpenStreetMap street grid, highways, and district boundaries.
   - **Topographic Elevation Contours**: OpenTopoMap elevation and river contours.
   - **Dark Command Mode**: CartoDB Dark Matter tactical console mode.
   - **Custom Map API Key**: Built-in dialog to plug any private Mapbox Access Token (`pk.eyJ...`) with instant layer switching.
   - **One-Click Basin Jump**: Instant camera jump to `All TN`, `Adyar`, `Cooum`, `Cauvery`, `Vaigai`, `Thamirabarani`, or `Palar`.
2. **Machine Learning Pipeline (6 Modelled Basins)**:
   - Trained `HistGradientBoosting` classifier and water level regressor based on **56,976 daily records** (2000–2025) across all 6 major Tamil Nadu river basins:
     - **Adyar Basin** (Chembarambakkam Lake, Saidapet Bridge)
     - **Cooum Basin** (Poondi Reservoir, Aminjikarai Station)
     - **Cauvery Delta** (Mettur Dam / Stanley Reservoir, Upper & Grand Anicut)
     - **Vaigai Basin** (Vaigai Dam, Madurai Arapalayam Bridge)
     - **Thamirabarani Basin** (Papanasam Dam, Tirunelveli Sulochana Bridge)
     - **Palar Basin** (Kaveripakkam Big Lake, Ranipet Anicut)
   - **Audited Evaluation Metrics (2020–2025 Held-Out Test)**:
     - Classification ROC-AUC: **0.998**
     - Classification PR-AUC: **0.868**
     - Water Level Regressor MAE: **0.049 meters** ($R^2 = 0.943$)
3. **Accurate Live Sensors & Animated Wave Tank Gauge**:
   - Exact Central Water Commission (CWC) and Water Resources Department (WRD) Warning & Danger thresholds for every river.
   - **LiquidLevelGauge**: Animated CSS wave water tank gauge showing live depth, percentage capacity, and rate of rise vectors.
   - **Live Telemetry Stream**: Active micro-fluctuation sensor simulation (±0.02m) toggleable in real time.
4. **Condition-Driven Early Warnings**:
   - State machine (`NORMAL`, `WATCH`, `WARNING`, `CRITICAL`) with hysteresis and anti-flicker confirmation windows.
5. **Hydron AI Assistant**:
   - Authenticated internal conversational assistant grounded in real-time basin telemetry that answers hydrological queries across all 6 basins and politely refuses unrelated off-topic questions.
6. **Emergency Alert Broadcast**:
   - Instant operator broadcast capability to notify emergency responders and field units following ML prediction surges.
7. **What-If Scenario Simulator & Instant Recalculation**:
   - Interactive parametric testing for 24h precipitation cloudbursts, dam releases, soil saturation, and river stage with live Scikit-Learn recalculations.
8. **Futuristic Visual Identity**:
   - Deep navy background (`#070d18`), dark blue surfaces (`#0c1930`), electric blue highlights (`#0284c7`), cyan accents (`#06b6d4`), glassmorphism, and live IST clock.

---

## 📁 Project Architecture
```
flood_intelligence_centre/
├── frontend/                   # React 18 + Vite + Tailwind CSS + Leaflet + Lucide + Recharts
│   ├── src/
│   │   ├── components/         # LiquidLevelGauge, Navbar, Sidebar, LoginModal, NotificationDrawer, BasinOverviewModal
│   │   ├── pages/              # LandingPage, DashboardPage, LiveGisPage, PredictionsPage, WeatherPage, RiversPage, ReservoirsPage, WarningsPage, EvacuationPage, NotificationsPage, HistoryPage, SimulatorPage
│   │   ├── maps/               # InteractiveMap (Esri Satellite, OSM, Topo, Dark, Mapbox Key config)
│   │   ├── chatbot/            # Hydron AI Assistant drawer
│   │   └── services/           # API integration client
│   ├── package.json
│   └── vite.config.js
├── backend/                    # FastAPI High-Performance Backend
│   ├── app/
│   │   ├── routers/            # 12 REST API modules (auth, basins, gis, predictions, warnings, notifications, weather, rivers, reservoirs, evacuation, history, hydron, simulator)
│   │   ├── services/           # ML engine, Warning state machine, Notification engine, Hydron NLP
│   │   ├── config.py           # Settings and hydrological thresholds
│   │   ├── db.py               # SQLite self-contained database & seeds
│   │   └── main.py             # FastAPI entrypoint with CORS
│   └── requirements.txt
├── ml/                         # Machine Learning Pipeline
│   ├── model.joblib            # Trained scikit-learn classifier & regressor artifact
│   ├── metrics.json            # Documented evaluation metrics
│   ├── train.py                # Training pipeline script
│   └── inference.py            # Model inference runner
├── data/
│   ├── basin_daily.csv         # 56,976 historical daily telemetry records (2000–2025 across 6 basins)
│   ├── tn_basins.geojson       # Tamil Nadu river basins polygon coordinates
│   ├── stations.json           # Gauging stations, dams, and evacuation shelters
│   └── build_all_basins.py     # Multi-basin telemetry synthesis generator
├── flood_centre.db             # Pre-seeded SQLite database with admin & demo users
├── requirements.txt            # Python dependencies
├── start.sh                    # One-click startup script (macOS/Linux)
├── start.bat                   # One-click startup script (Windows)
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** (FastAPI, scikit-learn, pandas, numpy, uvicorn)
- **Node.js 18+** (React, Vite)

### 2. One-Click Setup & Run

**On macOS / Linux:**
```bash
# Make script executable and run
chmod +x start.sh
./start.sh
```

**On Windows:**
```cmd
start.bat
```

The script will automatically install missing Python and Node dependencies, start the FastAPI backend on port 8000, start the Vite frontend on port 5173, and launch the application!

---

### 3. Manual Step-by-Step Setup

If you prefer to run services manually in separate terminals:

**Terminal 1 — Backend:**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI backend
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
# Navigate to frontend and install npm dependencies
cd frontend
npm install

# Start Vite dev server
npm run dev -- --host 127.0.0.1 --port 5173
```

---

## 🌐 Application URLs
- **Frontend Web Application**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **FastAPI ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **API Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 🔐 Pre-Seeded Credentials

| Role | Email ID | Password | Access Level |
|---|---|---|---|
| **Super Admin / Operations Chief** | `admin@hydron.gov.in` | `Admin@1234` | Full Command & Dispatch |
| **Chief Hydrology Analyst** | `demo@hydron.app` | `Demo@1234` | Standard Monitoring |

*(Note: The login dialog has 1-Click buttons to automatically fill these credentials without typing).*
