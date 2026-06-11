# Docker Stability Repair Script for Windows/WSL
# Repairs SIGBUS and containerd crash issues

param(
    [switch]$SkipWSLRepair,
    [switch]$SkipDockerReset
)

$ErrorActionPreference = "Continue"

function Write-Log { param($Message) Write-Host "$(Get-Date -Format 'HH:mm:ss') $Message" }
function Write-Info { param($Message) Write-Log "[INFO] $Message" }
function Write-Warn { param($Message) Write-Log "[WARN] $Message" }
function Write-Error { param($Message) Write-Log "[ERROR] $Message" }

# Check Docker Desktop
function Test-DockerDesktop {
    Write-Info "Checking Docker Desktop..."
    
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker not responding - may need restart or repair"
        return $false
    }
    
    Write-Info "Docker daemon is responsive"
    return $true
}

# Check and repair WSL
function Repair-WSL {
    if ($SkipWSLRepair) {
        Write-Info "Skipping WSL repair (flag set)"
        return
    }
    
    Write-Info "Checking WSL..."
    
    $wslStatus = wsl --status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "WSL issues detected, attempting repair..."
        
        # Shutdown WSL
        wsl --shutdown 2>&1 | Out-Null
        
        # Try to repair WSL
        try {
            wsl --repair --force 2>&1 | Out-Null
            Write-Info "WSL repair initiated"
        } catch {
            Write-Error "WSL repair failed - manual intervention required"
        }
    } else {
        Write-Info "WSL status OK"
    }
}

# Reset Docker to clean state
function Reset-Docker {
    if ($SkipDockerReset) {
        Write-Info "Skipping Docker reset (flag set)"
        return
    }
    
    Write-Info "Resetting Docker state..."
    
    # Clean up stopped containers and unused resources
    docker container prune -f 2>&1 | Out-Null
    docker network prune -f 2>&1 | Out-Null
    docker volume prune -f 2>&1 | Out-Null
    
    Write-Info "Docker cleanup completed"
}

# Verify named volumes exist
function Test-Volumes {
    Write-Info "Verifying Docker volumes..."
    
    $volumes = @("postgres_data", "redis_data", "mongo_data", "prometheus_data", "grafana_data", "opensearch_data")
    
    foreach ($vol in $volumes) {
        $exists = docker volume ls -q 2>&1 | Where-Object { $_ -eq $vol }
        if ($exists) {
            Write-Info "Volume $vol exists"
        } else {
            Write-Warn "Volume $vol will be created on compose up"
        }
    }
}

# Main execution
Write-Info "=== DOCKER STABILITY REPAIR ==="

if (-not (Test-DockerDesktop)) {
    Write-Warn "Docker Desktop may need manual restart"
    Write-Log "Try: Docker Desktop -> Troubleshoot -> Restart Docker Desktop"
}

Repair-WSL
Reset-Docker
Test-Volumes

Write-Info "=== REPAIR COMPLETE ==="
Write-Log ""
Write-Log "Next steps:"
Write-Log "  1. If WSL was repaired, restart your computer"
Write-Log "  2. Start Docker Desktop"
Write-Log "  3. Run: docker-compose -f compose.dev.yaml up -d"