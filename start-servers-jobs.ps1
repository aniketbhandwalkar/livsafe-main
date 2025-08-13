# Start both frontend and backend servers using PowerShell jobs
Write-Host "🚀 Starting LivSafe Development Servers (Background Jobs)..." -ForegroundColor Green

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

# Function to start server as background job
function Start-ServerJob {
    param(
        [string]$JobName,
        [string]$Path,
        [string]$Command
    )
    
    $scriptBlock = [scriptblock]::Create(@"
        Set-Location '$Path'
        $Command
"@)
    
    Start-Job -Name $JobName -ScriptBlock $scriptBlock
}

# Clean up any existing jobs
Get-Job | Where-Object { $_.Name -like "*Server*" } | Remove-Job -Force

Write-Host "📊 Starting Backend API Server..." -ForegroundColor Blue
$backendJob = Start-ServerJob -JobName "BackendServer" -Path $backendPath -Command "npm run dev"

Write-Host "🌐 Starting Frontend React Server..." -ForegroundColor Cyan
$frontendJob = Start-ServerJob -JobName "FrontendServer" -Path $frontendPath -Command "npm run dev"

Write-Host ""
Write-Host "🎉 Both servers are starting as background jobs!" -ForegroundColor Green
Write-Host "📊 Backend API: http://localhost:5000" -ForegroundColor Blue
Write-Host "🌐 Frontend App: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

# Monitor the jobs
Write-Host "📈 Job Status:" -ForegroundColor Yellow
Get-Job | Where-Object { $_.Name -like "*Server*" } | Format-Table Name, State, HasMoreData -AutoSize

Write-Host ""
Write-Host "📝 To see live output: " -ForegroundColor Gray
Write-Host "   Backend: Receive-Job BackendServer -Keep" -ForegroundColor Blue
Write-Host "   Frontend: Receive-Job FrontendServer -Keep" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏹️  To stop all servers: " -ForegroundColor Yellow
Write-Host "   Get-Job | Where-Object { \$_.Name -like '*Server*' } | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Red

# Monitor loop
Write-Host "🔄 Monitoring servers (Press Ctrl+C to stop monitoring, servers will continue running)..." -ForegroundColor Green
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Check job status
        $jobs = Get-Job | Where-Object { $_.Name -like "*Server*" }
        
        foreach ($job in $jobs) {
            $output = Receive-Job $job -Keep | Select-Object -Last 3
            if ($output) {
                Write-Host "[$($job.Name)] " -ForegroundColor $(if ($job.Name -like "*Backend*") { "Blue" } else { "Cyan" }) -NoNewline
                Write-Host ($output -join "; ")
            }
        }
        
        # Show current status
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - " -ForegroundColor Gray -NoNewline
        $runningJobs = ($jobs | Where-Object { $_.State -eq "Running" }).Count
        Write-Host "$runningJobs/2 servers running" -ForegroundColor $(if ($runningJobs -eq 2) { "Green" } else { "Yellow" })
    }
} catch {
    Write-Host ""
    Write-Host "⏸️  Monitoring stopped. Servers are still running in background." -ForegroundColor Yellow
    Write-Host "Use 'Get-Job' to check status or stop them with the command above." -ForegroundColor Gray
}
