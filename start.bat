@echo off
title Synapse - AI Knowledge Base
cd /d "%~dp0"

echo.
echo  ==============================
echo    Synapse - AI Knowledge Base
echo  ==============================
echo.

:: Check if .env exists, if not copy example
if not exist backend\.env (
    echo  [Setup] Copying .env.example to backend\.env ...
    copy .env.example backend\.env >nul
    echo  [!] Please edit backend\.env and add your ANTHROPIC_API_KEY
    echo      (or enter it later in the Settings page)
    echo.
)

:: Setup Python venv if missing
if not exist backend\.venv (
    echo  [Setup] Creating Python virtual environment...
    python -m venv backend\.venv
    echo  [Setup] Installing backend dependencies...
    backend\.venv\Scripts\pip install -r backend\requirements.txt --quiet
    echo  [OK] Backend ready.
    echo.
)

:: Setup node_modules if missing
if not exist frontend\node_modules (
    echo  [Setup] Installing frontend dependencies...
    cd frontend && npm install --silent && cd ..
    echo  [OK] Frontend ready.
    echo.
)

echo  [Start] Launching backend...
start "Synapse Backend" /min cmd /c "cd /d "%~dp0backend" && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo  [Start] Launching frontend...
start "Synapse Frontend" /min cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo  [Wait] Waiting for servers to start...
timeout /t 4 /nobreak >nul

echo  [Open] Opening Synapse in browser...
start http://localhost:5173

echo.
echo  Synapse is running!
echo    Frontend : http://localhost:5173
echo    API Docs : http://localhost:8000/api/docs
echo.
echo  Close this window to keep servers running in background.
echo  To stop: close the "Synapse Backend" and "Synapse Frontend" windows.
echo.
pause
