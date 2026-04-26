@echo off
echo Starting AI Bias Audit Platform...

REM Start Backend
start "FastAPI Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

REM Start Frontend
start "Vite Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo Both servers are starting!
echo Backend will be at: http://localhost:8000
echo Frontend will be at: http://localhost:5173
