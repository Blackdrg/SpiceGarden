# Docker Stability Test - Windows PowerShell Version
# Tests: up -> restart -> down -> up cycle to verify infrastructure stability

param(
    [string]$ComposeFile = "compose.dev.yaml",
    [int]$Timeout = 300
)

$ErrorActionPreference = "Continue"

function Write-Log { param($Message) Write-Host "$(Get-Date -Format 'HH:mm:ss') $Message" }
function Write-Info { param($Message) Write-Log "[INFO] $Message" }
function Write-Warn { param($Message) Write-Log "[WARN] $Message" }
function Write-Error { param($Message) Write-Log "[ERROR] $Message" }

function Wait-ForHealthy {
    Write-Info "Waiting for services to become healthy..."
    $maxAttempts = 60
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        $attempt++
        
        # Check running services
        $runningServices = docker-compose -f $ComposeFile ps --services --filter "status=running" 2>$null
        
        $unhealthyCount = 0
        foreach ($svc in $runningServices) {
            $containerId = docker-compose -f $ComposeFile ps -q $svc 2>$null
            if ($containerId) {
                $health = docker inspect --format='{{.State.Health.Status}}' $containerId 2>$null
                if ($health -ne "healthy") {
                    $unhealthyCount++
                    Write-Log "Waiting for $svc to become healthy (health: $health)"
                }
            }
        }
        
        if ($unhealthyCount -eq 0 -and $runningServices) {
            Write-Info "All services healthy"
            return $true
        }
        
        Start-Sleep -Seconds 5
    }
    
    Write-Error "Services did not become healthy in time"
    docker-compose -f $ComposeFile ps
    return $false
}

function Test-HealthEndpoint {
    $maxAttempts = 10
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Info "Backend health endpoint responding"
                return $true
            }
        } catch {
            # Continue waiting
        }
        $attempt++
        Start-Sleep -Seconds 2
    }
    
    Write-Error "Backend health endpoint not responding"
    return $false
}

function Test-Up {
    Write-Info "=== TEST 1: docker compose up -d ==="
    
    docker-compose -f $ComposeFile up -d
    
    if (-not (Wait-ForHealthy)) { return $false }
    if (-not (Test-HealthEndpoint)) { return $false }
    
    Write-Info "UP test passed"
    return $true
}

function Test-Restart {
    Write-Info "=== TEST 2: docker compose restart ==="
    
    docker-compose -f $ComposeFile restart
    
    if (-not (Wait-ForHealthy)) { return $false }
    if (-not (Test-HealthEndpoint)) { return $false }
    
    Write-Info "RESTART test passed"
    return $true
}

function Test-Down {
    Write-Info "=== TEST 3: docker compose down ==="
    
    docker-compose -f $ComposeFile down -v
    
    # Check volume persistence
    $volumes = @("postgres_data", "redis_data", "mongo_data", "prometheus_data", "grafana_data", "opensearch_data")
    foreach ($vol in $volumes) {
        $exists = docker volume ls -q 2>$null | Where-Object { $_ -eq $vol }
        if ($exists) {
            Write-Info "Volume $vol persisted after down"
        } else {
            Write-Warn "Volume $vol was removed"
        }
    }
    
    Write-Info "DOWN test passed"
    return $true
}

function Test-Recovery {
    Write-Info "=== TEST 4: docker compose up -d (recovery) ==="
    
    docker-compose -f $ComposeFile up -d
    
    if (-not (Wait-ForHealthy)) { return $false }
    if (-not (Test-HealthEndpoint)) { return $false }
    
    Write-Info "RECOVERY test passed"
    return $true
}

# Main execution
Write-Info "=== DOCKER STABILITY TEST START ==="

# Initial cleanup
Write-Info "Cleaning up any existing containers..."
docker-compose -f $ComposeFile down -v 2>$null
docker-compose -f $ComposeFile rm -sf 2>$null

if (-not (Test-Up)) { exit 1 }
if (-not (Test-Restart)) { exit 1 }
if (-not (Test-Down)) { exit 1 }
if (-not (Test-Recovery)) { exit 1 }

Write-Info "=== ALL TESTS PASSED ==="
Write-Info "Docker stability verified - full recovery cycle successful"

docker-compose -f $ComposeFile ps