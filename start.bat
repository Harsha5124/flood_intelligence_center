@echo off
echo ==========================================================
echo  Starting Flood Intelligence Centre (Tamil Nadu River Basins)
echo  Project ID: 46138 | College Mini Project 2026MIN270
echo ==========================================================

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] python is not installed or not in PATH. Please install Python 3.10+.
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] node is not installed or not in PATH. Please install Node.js 18+.
    pause
    exit /b 1
)

if not exist frontend\node_modules (
    echo [SETUP] Installing frontend npm dependencies...
    cd frontend && npm install && cd ..
)

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000...
start "FIC Backend" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"

echo [2/2] Launching Vite Frontend on http://127.0.0.1:5173...
start "FIC Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo ==========================================================
echo  Flood Intelligence Centre is running!
echo  Frontend URL:     http://localhost:5173
echo  Backend Swagger:  http://localhost:8000/docs
echo  Demo Admin:       admin@hydron.gov.in (Admin@1234)
echo ==========================================================
pause
