# Start both frontend and backend servers simultaneously
Write-Host "🚀 Starting LivSafe Development Servers..." -ForegroundColor Green

# Function to start a process in a new window
function Start-ServerInNewWindow {
    param(
        [string]$Title,
        [string]$Path,
        [string]$Command,
        [string]$Color
    )
    
    Write-Host "Starting $Title..." -ForegroundColor $Color
    
    # Start the process in a new PowerShell window
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$Path'; Write-Host '🟢 $Title Server Started' -ForegroundColor $Color; $Command"
    ) -WindowStyle Normal
}

# Check if both directories exist
$backendPath = "E:\mse\livsafe-main\server"
$frontendPath = "E:\mse\livsafe-main\client"

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

# Start Backend Server (Port 5000)
Start-ServerInNewWindow -Title "Backend API" -Path $backendPath -Command "npm run dev" -Color "Blue"

# Wait a moment before starting frontend
Start-Sleep -Seconds 2

# Start Frontend Server (Port 5173)
Start-ServerInNewWindow -Title "Frontend React" -Path $frontendPath -Command "npm run dev" -Color "Cyan"

Write-Host ""
Write-Host "🎉 Both servers are starting up!" -ForegroundColor Green
Write-Host "📊 Backend API: http://localhost:5000" -ForegroundColor Blue
Write-Host "🌐 Frontend App: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏹️  To stop servers: Close the individual PowerShell windows or press Ctrl+C in each" -ForegroundColor Yellow
Write-Host "📝 Check the individual windows for any startup errors" -ForegroundColor Gray

# Keep this script window open for monitoring
Write-Host ""
Write-Host "Press any key to exit this monitor window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
