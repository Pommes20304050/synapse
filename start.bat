@echo off
title Synapse - AI Knowledge Base
cd /d "%~dp0"

echo.
echo  ==============================
echo    Synapse - AI Knowledge Base
echo  ==============================
echo.
echo  WICHTIG: Nicht index.html direkt oeffnen!
echo  Die App braucht den Dev-Server (startet gleich automatisch).
echo.

:: Copy .env if missing
if not exist backend\.env (
    echo  [Setup] Erstelle backend\.env aus .env.example ...
    copy .env.example backend\.env >nul
    echo  [!] Tipp: API Key spaeter einfach in der App unter Settings eingeben.
    echo.
)

:: Create Python venv if missing
if not exist backend\.venv (
    echo  [Setup] Python Virtual Environment wird erstellt...
    python -m venv backend\.venv
    echo  [Setup] Backend-Abhaengigkeiten werden installiert...
    backend\.venv\Scripts\pip install -r backend\requirements.txt --quiet
    echo  [OK] Backend bereit.
    echo.
)

:: Install node_modules if missing
if not exist frontend\node_modules (
    echo  [Setup] Frontend-Abhaengigkeiten werden installiert...
    cd frontend && npm install --silent && cd ..
    echo  [OK] Frontend bereit.
    echo.
)

echo  [Start] Backend wird gestartet...
start "Synapse Backend" /min cmd /c "cd /d "%~dp0backend" && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo  [Start] Frontend wird gestartet...
start "Synapse Frontend" /min cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo  [Warte] Server starten...
timeout /t 4 /nobreak >nul

echo  [Browser] Oeffne Synapse...
start http://localhost:5173

echo.
echo  ============================================
echo   Synapse laeuft!
echo    App      : http://localhost:5173
echo    API Docs : http://localhost:8000/api/docs
echo  ============================================
echo.
echo  Dieses Fenster kann offen bleiben oder geschlossen werden.
echo  Zum Stoppen: "Synapse Backend" und "Synapse Frontend" Fenster schliessen.
echo.
pause
