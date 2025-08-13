# Simple script to start both frontend and backend
Write-Host "Starting LivSafe Development Environment..." -ForegroundColor Green
Write-Host ""

# Start Backend Server in background
Write-Host "Starting Backend Server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-WindowStyle", "Normal",
    "-Command", 
    "cd 'E:\mse\livsafe-main\server'; Write-Host 'Backend Server Starting...' -ForegroundColor Blue; npm run dev"
) -WindowStyle Normal

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Frontend Server in background  
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit", 
    "-WindowStyle", "Normal",
    "-Command",
    "cd 'E:\mse\livsafe-main\client'; Write-Host 'Frontend Server Starting...' -ForegroundColor Cyan; npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "Both servers started in separate windows!" -ForegroundColor Green
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Blue  
Write-Host "Frontend App: http://localhost:5174 (or 5173)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait a few seconds for both servers to fully start up..." -ForegroundColor Yellow
Write-Host "Check both PowerShell windows for any errors" -ForegroundColor Gray
