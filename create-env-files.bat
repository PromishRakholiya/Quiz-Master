@echo off
echo Creating environment files for Quiz System...

echo.
echo Creating frontend/.env...
echo VITE_API_URL=http://localhost:5000/api > frontend\.env
echo ✅ Created frontend/.env

echo.
echo Creating backend/.env...
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

echo.
echo 🎉 Environment files created successfully!
echo.
echo Next steps:
echo 1. Start backend: cd backend && npm start
echo 2. Start frontend: cd frontend && npm run dev
echo 3. Visit: http://localhost:5173
echo.
pause
