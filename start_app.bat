@echo off
echo Starting OnboardHub...

:: Start Backend
start "OnboardHub Backend" cmd /k "cd backend && npm start"

:: Start Frontend
start "OnboardHub Frontend" cmd /k "cd frontend && npm run dev"

echo Servers launched! 
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
pause
