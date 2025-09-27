@echo off
title FINAL CONNECTION FIX
color 0E

echo ========================================
echo     🔧 FINAL CONNECTION FIX 🔧
echo ========================================
echo.

echo 📋 Step 1: Creating environment files...

REM Create frontend .env
echo Creating frontend/.env...
echo VITE_API_URL=http://localhost:5000/api > frontend\.env
echo ✅ Created frontend/.env

REM Create backend .env
echo Creating backend/.env...
(
echo PORT=5000
echo MONGODB_URI=mongodb://localhost:27017/quiz-system
echo JWT_SECRET=quiz_system_jwt_secret_2024_change_in_production
echo JWT_REFRESH_SECRET=quiz_system_refresh_secret_2024_change_in_production
echo JWT_EXPIRES_IN=7d
echo JWT_REFRESH_EXPIRES_IN=30d
echo FRONTEND_URL=http://localhost:5173
echo NODE_ENV=development
) > backend\.env
echo ✅ Created backend/.env

echo.
echo 📋 Step 2: Verifying files...
if exist "frontend\.env" (
    echo ✅ frontend/.env exists
    echo Content:
    type frontend\.env
) else (
    echo ❌ frontend/.env creation failed
)

echo.
if exist "backend\.env" (
    echo ✅ backend/.env exists
) else (
    echo ❌ backend/.env creation failed
)

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
echo Starting backend in new window...
start "Quiz Backend Server" cmd /k "cd /d %CD%\backend && echo Starting backend server... && npm start"

echo Waiting for backend to start...
timeout /t 8 /nobreak > nul

echo.
echo 📋 Step 5: Testing backend connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -TimeoutSec 10; if ($response.StatusCode -eq 200) { Write-Host '✅ Backend is responding correctly!' -ForegroundColor Green; $content = $response.Content; Write-Host 'Response:' $content -ForegroundColor Cyan } else { Write-Host '❌ Backend returned status:' $response.StatusCode -ForegroundColor Red } } catch { Write-Host '❌ Backend is not responding. Make sure it started correctly.' -ForegroundColor Red; Write-Host 'Error:' $_.Exception.Message -ForegroundColor Yellow }"

echo.
echo 📋 Step 6: Starting frontend server...
echo Starting frontend in new window...
start "Quiz Frontend Server" cmd /k "cd /d %CD%\frontend && echo Starting frontend server... && npm run dev"

echo.
echo ========================================
echo      ✅ SETUP COMPLETE!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5000
echo 📊 API Health: http://localhost:5000/api/health
echo.
echo 🎯 What was fixed:
echo   ✅ Created frontend/.env with API URL
echo   ✅ Created backend/.env with all settings
echo   ✅ Installed all dependencies
echo   ✅ Started backend server
echo   ✅ Tested API connectivity
echo   ✅ Started frontend server
echo.
echo 📝 Both servers are now running in separate windows.
echo Wait 10-15 seconds, then visit: http://localhost:5173
echo.
echo The "Failed to fetch" error should be completely gone!
echo.
pause
