#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Prepend local scratch node if it exists
if [ -d "/Users/harshavardhannj/.gemini/antigravity-ide/scratch/tools/node/bin" ]; then
  export PATH="/Users/harshavardhannj/.gemini/antigravity-ide/scratch/tools/node/bin:$PATH"
fi

echo "=========================================================="
echo " Starting Flood Intelligence Centre (Tamil Nadu River Basins)"
echo " Project ID: 46138 | College Mini Project 2026MIN270"
echo "=========================================================="

# Check Python environment
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 could not be found. Please install Python 3.10+."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: node could not be found. Please install Node.js 18+."
    exit 1
fi

# Ensure frontend dependencies are installed
if [ ! -d "$DIR/frontend/node_modules" ]; then
    echo "[SETUP] Installing frontend npm dependencies..."
    cd "$DIR/frontend" && npm install && cd "$DIR"
fi

echo "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..."
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "[2/2] Starting Vite Frontend on http://127.0.0.1:5173..."
cd "$DIR/frontend"
npm run dev -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo " ✅ Flood Intelligence Centre is LIVE!"
echo " 🌐 Frontend Web App:     http://localhost:5173"
echo " 📚 Backend Swagger Docs: http://localhost:8000/docs"
echo " 🔐 Demo Admin:          admin@hydron.gov.in (Admin@1234)"
echo " 🔐 Demo Analyst:        demo@hydron.app (Demo@1234)"
echo "=========================================================="
echo "Press Ctrl+C to terminate both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM
wait
