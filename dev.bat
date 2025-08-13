@echo off
echo Starting LivSafe Development Environment...
echo.

echo Starting Backend Server...
start "Backend API Server" cmd /k "cd /d E:\mse\livsafe-main\server && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend React Server" cmd /k "cd /d E:\mse\livsafe-main\client && npm run dev"

echo.
echo Both servers started in separate windows!
echo Backend API: http://localhost:5000
echo Frontend App: http://localhost:5174 (or 5173)
echo.
echo Wait a few seconds for both servers to fully start up...
echo Check both command prompt windows for any errors
pause
