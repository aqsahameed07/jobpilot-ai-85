@echo off
REM Quick Start Script for JobPilot Profile & Settings (Windows)

echo.
echo 🚀 JobPilot Profile ^& Settings - Quick Start
echo ============================================
echo.

REM Check if we're in the project root
if not exist "backend\package.json" (
    echo ❌ Please run this script from the jobPilot project root directory
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ❌ Please run this script from the jobPilot project root directory
    exit /b 1
)

echo 📦 Step 1: Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..

echo.
echo 📦 Step 2: Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)
echo ✅ Frontend dependencies installed
cd ..

echo.
echo ✅ Setup Complete!
echo.
echo 🎯 Next Steps:
echo 1. Update your .env files:
echo    - Backend: backend\.env (MongoDB URI, JWT_SECRET, etc.)
echo    - Frontend: frontend\.env (VITE_API_URL)
echo.
echo 2. Start the backend (in one terminal):
echo    cd backend ^& npm run dev
echo.
echo 3. Start the frontend (in another terminal):
echo    cd frontend ^& npm run dev
echo.
echo 4. Navigate to http://localhost:5173
echo 5. Login and go to /settings to test the new profile functionality
echo.
echo 📚 For detailed configuration, see: PROFILE_SETTINGS_CONFIG.md
echo.
pause
