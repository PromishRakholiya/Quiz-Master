@echo off
title Quiz System Startup
color 0A

echo ========================================
echo       🚀 QUIZ SYSTEM STARTUP 🚀
echo ========================================
echo.

REM Check if .env files exist
echo 📋 Checking environment files...
if not exist "frontend\.env" (
    echo ❌ frontend/.env not found! Creating...
    echo VITE_API_URL=http://localhost:5000/api > frontend\.env
    echo ✅ Created frontend/.env
) else (
    echo ✅ frontend/.env exists
)

if not exist "backend\.env" (
    echo ❌ backend/.env not found! Creating...
    (
    echo PORT=5000
    echo MONGODB_URI=mongodb://localhost:27017/quiz-system
    echo JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
    echo JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
    echo JWT_EXPIRES_IN=7d
    echo JWT_REFRESH_EXPIRES_IN=30d
    echo FRONTEND_URL=http://localhost:5173
    echo NODE_ENV=development
    ) > backend\.env
    echo ✅ Created backend/.env
) else (
    echo ✅ backend/.env exists
)

echo.
echo 📦 Installing dependencies...
echo Installing backend dependencies...
cd backend
call npm install --silent
cd ..

echo Installing frontend dependencies...
cd frontend  
call npm install --silent
cd ..

echo.
echo 🚀 Starting servers...
echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   ✅ QUIZ SYSTEM STARTED SUCCESSFULLY!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:5000
echo 📊 API Health: http://localhost:5000/api/health
echo.
echo Both servers are starting in separate windows.
echo Wait a few seconds, then visit: http://localhost:5173
echo.
echo Press any key to exit this window...
pause > nul
