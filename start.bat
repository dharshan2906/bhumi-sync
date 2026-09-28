@echo off
setlocal enabledelayedexpansion
title BHUMI-SYNC Platform Launcher

echo ==============================================================================
echo   BHUMI-SYNC: AI-Powered Urban Land Record Harmonization Platform (SIH26013)
echo   Ministry of Rural Development - Government of India
echo ==============================================================================
echo.

:: 1. Check Python
echo [1/4] Checking Python installation...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found on your system PATH!
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    echo and ensure "Add Python to PATH" is checked during installation.
    pause
    exit /b 1
)
python --version

:: 2. Check Node.js and NPM
echo.
echo [2/4] Checking Node.js and npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/npm is not found on your system PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
node --version
npm --version

:: 3. Install Python Dependencies
echo.
echo [3/4] Verifying and installing Python dependencies...
python -m pip install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo [WARNING] Encountered an issue installing Python dependencies. Continuing...
) else (
    echo Python dependencies are up-to-date.
)

:: 4. Install Frontend Dependencies
echo.
echo [4/4] Verifying and installing Frontend NPM packages...
cd frontend
call npm install --silent
cd ..
echo Frontend dependencies are up-to-date.

:: 5. Launch Servers
echo.
echo ==============================================================================
echo  All prerequisites ready! Launching Backend (FastAPI) and Frontend (Vite)...
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://127.0.0.1:8000/api/docs
echo ==============================================================================
echo.

python run_servers.py

pause
