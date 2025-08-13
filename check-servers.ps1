# Server Status Check Script
Write-Host "Checking server status..." -ForegroundColor Cyan

# Check Backend (Port 5000)
try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend Server: RUNNING on port 5000" -ForegroundColor Green
    Write-Host "   Environment: $($backendHealth.environment)" -ForegroundColor Gray
    Write-Host "   Timestamp: $($backendHealth.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend Server: NOT RUNNING on port 5000" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check Frontend (Port 5173)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend Client: RUNNING on port 5173" -ForegroundColor Green
        Write-Host "   Access at: http://localhost:5173" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Frontend Client: NOT RUNNING on port 5173" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTo start servers if they're not running:" -ForegroundColor Yellow
Write-Host "Backend: cd server && npm run dev" -ForegroundColor Gray
Write-Host "Frontend: cd client && npm run dev" -ForegroundColor Gray
