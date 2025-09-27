@echo off
title Setup Verification
color 0A

echo ========================================
echo      🔍 SETUP VERIFICATION 🔍
echo ========================================
echo.

echo 📋 Checking environment files...

REM Check frontend .env
if exist "frontend\.env" (
    echo ✅ frontend/.env exists
    echo    Content:
    type frontend\.env | findstr /C:"VITE_API_URL"
    if errorlevel 1 (
        echo ❌ VITE_API_URL not found in frontend/.env
        echo    Adding VITE_API_URL...
        echo VITE_API_URL=http://localhost:5000/api >> frontend\.env
        echo ✅ Fixed frontend/.env
    )
) else (
    echo ❌ frontend/.env missing - creating...
    echo VITE_API_URL=http://localhost:5000/api > frontend\.env
    echo ✅ Created frontend/.env
)

echo.

REM Check backend .env
if exist "backend\.env" (
    echo ✅ backend/.env exists
) else (
    echo ❌ backend/.env missing - creating...
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
    echo ✅ Created backend/.env
)

echo.
echo 📋 Checking dependencies...

echo Checking backend dependencies...
cd backend
if exist "node_modules" (
    echo ✅ Backend node_modules exists
) else (
    echo ❌ Backend dependencies missing - installing...
    call npm install --silent
    if %errorlevel% equ 0 (
        echo ✅ Backend dependencies installed
    ) else (
        echo ❌ Backend npm install failed
    )
)
cd ..

echo Checking frontend dependencies...
cd frontend
if exist "node_modules" (
    echo ✅ Frontend node_modules exists
) else (
    echo ❌ Frontend dependencies missing - installing...
    call npm install --silent
    if %errorlevel% equ 0 (
        echo ✅ Frontend dependencies installed
    ) else (
        echo ❌ Frontend npm install failed
    )
)
cd ..

echo.
echo 📋 Testing backend connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -TimeoutSec 5; Write-Host '✅ Backend is running and responding' -ForegroundColor Green } catch { Write-Host '❌ Backend is not running. Start it with: cd backend && npm start' -ForegroundColor Yellow }"

echo.
echo 📋 Testing frontend...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 5; Write-Host '✅ Frontend is running and responding' -ForegroundColor Green } catch { Write-Host '❌ Frontend is not running. Start it with: cd frontend && npm run dev' -ForegroundColor Yellow }"

echo.
echo ========================================
echo        🎯 VERIFICATION COMPLETE
echo ========================================
echo.
echo 📝 Summary:
echo   ✅ Environment files configured
echo   ✅ Dependencies checked/installed
echo   ✅ Server connectivity tested
echo.
echo 🚀 If both servers are running, visit:
echo   Frontend: http://localhost:5173
echo   Backend Health: http://localhost:5000/api/health
echo.
echo 💡 If connection errors persist:
echo   1. Run: fix-connection-permanently.bat
echo   2. Restart both servers
echo   3. Clear browser cache
echo.
pause
