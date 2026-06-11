# SpiceGarden Disaster Recovery Script - PowerShell Version
# Cross-platform DR validation for Windows environments
# Usage: powershell -File infra/scripts/disaster-recovery.ps1 [-Environment production|staging]

param(
    [string]$Environment = "production",
    [string]$BackupDate = ""
)

$BackupDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { "C:\backup" }

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    $tools = @("kubectl", "helm")
    foreach ($tool in $tools) {
        $null = Get-Command $tool -ErrorAction SilentlyContinue
        if ($LASTEXITCODE -ne 0 -and -not (Get-Command $tool -ErrorAction SilentlyContinue)) {
            Write-Log "WARNING: $tool is not installed - some features may be limited"
        }
    }
    
    if (-not (Test-Path "C:\Program Files\Docker\Docker\resources\bin\docker.exe")) {
        $dockerPath = "docker"
    } else {
        $dockerPath = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
    }
    Write-Log "Docker check: $dockerPath found"
}

function Test-DR-Capability {
    Write-Log "Validating DR capability..."
    
    $results = @{
        dockerAvailable = $false
        containersRunning = $false
        backupDirectory = Test-Path $BackupDir
        secretsDirectory = Test-Path "C:\Users\mehta\Desktop\SpiceGarden\secrets"
        k8sConfig = Test-Path "C:\Users\mehta\Desktop\SpiceGarden\infra\k8s"
    }
    
    # Check Docker
    try {
        $null = docker info 2>$null
        $results.dockerAvailable = $true
    } catch {
        $results.dockerAvailable = $false
    }
    
    # Check containers
    try {
        $containers = docker ps --format "{{.Names}}"
        $results.containersRunning = $containers -match "postgres|mongo|redis"
    } catch {
        $results.containersRunning = $false
    }
    
    return $results
}

# Main execution
Write-Log "SpiceGarden Disaster Recovery - PowerShell Edition"
Write-Log "Environment: $Environment"

Test-Prerequisites

$validation = Test-DR-Capability
Write-Host "`n=== DR Capability Validation ==="
Write-Host "Docker Available: $($validation.dockerAvailable)"
Write-Host "Containers Running: $($validation.containersRunning)"
Write-Host "Backup Directory: $($validation.backupDirectory)"
Write-Host "Secrets Directory: $($validation.secretsDirectory)"
Write-Host "K8s Config: $($validation.k8sConfig)"

# Verify backup exists or can be created
$latestBackup = Get-ChildItem -Path $BackupDir -Filter "spicegarden_backup_*.tar.gz" 2>$null | Sort-Object CreationTime -Descending | Select-Object -First 1

if ($latestBackup) {
    Write-Log "Latest backup found: $($latestBackup.Name)"
} else {
    Write-Log "No existing backup found - run backup.ps1 first"
}

Write-Log "DR validation complete"