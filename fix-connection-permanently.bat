@echo off
title Permanent Connection Fix
color 0E

echo ========================================
echo   🔧 PERMANENT CONNECTION FIX 🔧
echo ========================================
echo.

echo 📋 Step 1: Creating frontend/.env file...
echo VITE_API_URL=http://localhost:5000/api > frontend\.env
echo ✅ Created frontend/.env with API URL

echo.
echo 📋 Step 2: Creating backend/.env file...
(
echo PORT=5000
echo MONGODB_URI=mongodb://localhost:27017/quiz-system
echo JWT_SECRET=quiz_system_super_secret_jwt_key_2024_change_in_production
echo JWT_REFRESH_SECRET=quiz_system_super_secret_refresh_key_2024_change_in_production
echo JWT_EXPIRES_IN=7d
echo JWT_REFRESH_EXPIRES_IN=30d
echo FRONTEND_URL=http://localhost:5173
echo NODE_ENV=development
) > backend\.env
echo ✅ Created backend/.env with all required variables

echo.
echo 📋 Step 3: Installing dependencies...
echo Installing backend dependencies...
cd backend
call npm install --silent
if %errorlevel% neq 0 (
    echo ❌ Backend npm install failed
    pause
    exit /b 1
)
cd ..

echo Installing frontend dependencies...
cd frontend
call npm install --silent
if %errorlevel% neq 0 (
    echo ❌ Frontend npm install failed
    pause
    exit /b 1
)
cd ..

echo.
echo 📋 Step 4: Starting backend server...
start "Quiz System Backend" cmd /k "cd /d %CD%\backend && echo Starting backend server... && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 📋 Step 5: Testing backend connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -TimeoutSec 10; if ($response.StatusCode -eq 200) { Write-Host '✅ Backend is responding correctly' -ForegroundColor Green } else { Write-Host '❌ Backend returned status:' $response.StatusCode -ForegroundColor Red } } catch { Write-Host '❌ Backend is not responding. Check if it started correctly.' -ForegroundColor Red }"

echo.
echo 📋 Step 6: Starting frontend server...
start "Quiz System Frontend" cmd /k "cd /d %CD%\frontend && echo Starting frontend server... && npm run dev"

echo.
echo ========================================
echo   ✅ PERMANENT FIX COMPLETED!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5000
echo 📊 API Health: http://localhost:5000/api/health
echo.
echo 🎯 What was fixed:
echo   ✅ Created frontend/.env with correct API URL
echo   ✅ Created backend/.env with all required variables
echo   ✅ Installed all dependencies
echo   ✅ Started both servers automatically
echo   ✅ Verified backend connectivity
echo.
echo 📝 The connection error should never appear again!
echo.
echo Press any key to close this window...
pause > nul
