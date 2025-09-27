@echo off
title Frontend Test
color 0B

echo ========================================
echo      🧪 FRONTEND SYNTAX TEST 🧪
echo ========================================
echo.

echo 📋 Testing frontend build...
cd frontend

echo Checking for syntax errors...
call npm run build 2>&1 | findstr /C:"error" /C:"Error" /C:"ERROR"

if %errorlevel% equ 0 (
    echo ❌ Build errors found! Check the output above.
    echo.
    echo 🔧 Common fixes:
    echo   1. Check App.jsx for syntax errors
    echo   2. Ensure all imports are correct
    echo   3. Verify JSX tags are properly closed
    echo   4. Check for missing semicolons or brackets
) else (
    echo ✅ No build errors found!
    echo.
    echo 🎉 Frontend syntax is correct!
    echo You can now run: npm run dev
)

echo.
echo Starting development server...
call npm run dev

cd ..
pause
