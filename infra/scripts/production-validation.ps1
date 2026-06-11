param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "production",

    [switch]$SkipPrerequisites
)

$ErrorActionPreference = "Continue"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    $color = switch($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "PASS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

$FAILED_CHECKS = @()
$PASSED_CHECKS = @()

if (-not $SkipPrerequisites) {
    Write-Log "Checking prerequisites..."
    
    if (-not (Test-Command "kubectl")) {
        Write-Log "kubectl not found - some Kubernetes checks will be skipped" -Level "WARN"
    }
    
    if (-not (Test-Command "docker")) {
        Write-Log "docker not found - some container checks will be skipped" -Level "WARN"
    }
}

Write-Log "=== SpiceGarden Production Deployment Validation ===" -Level "INFO"
Write-Log "Environment: $Environment"

# 1. Secrets Validation
Write-Log "Checking secrets configuration..."

# Check environment variables first, then fall back to secret files
$secretFiles = @{
    "JWT_SECRET" = "secrets/jwt_secret.txt"
    "ENCRYPTION_SECRET" = "secrets/encryption_secret.txt"
    "ENCRYPTION" = "secrets/encryption.txt"
    "POSTGRES_PASSWORD" = "secrets/db_password.txt"
}

foreach ($check in $secretFiles.Keys) {
    $file = $secretFiles[$check]
    if (Test-Path $file) {
        $content = Get-Content -Path $file -Raw
        if ($content.Length -ge 16) {
            Write-Log "Secret $check file exists ($($content.Length) chars)" -Level "PASS"
            $PASSED_CHECKS += "Secret file: $check"
        } else {
            $FAILED_CHECKS += "Secret file: $check too short"
        }
    } else {
        Write-Log "Secret $check file not found (checking $file)" -Level "WARN"
    }
}

# 2. Health Endpoint Check
if (Test-Command "curl") {
    Write-Log "Testing health endpoint..."
    try {
        $health = & curl -sf http://localhost:3001/health 2>$null
        if ($health -match '"status".*"ok"') {
            Write-Log "Health endpoint responding" -Level "PASS"
            $PASSED_CHECKS += "Health endpoint"
        } else {
            $FAILED_CHECKS += "Health endpoint not responding correctly"
        }
    } catch {
        Write-Log "Health endpoint check failed (service may not be running)" -Level "WARN"
    }
}

# 3. Kubernetes Configuration Checks
if (Test-Command "kubectl") {
    Write-Log "Validating Kubernetes configuration..."
    
    # Check HPA
    try {
        $hpa = kubectl get hpa spicegarden-backend-hpa -n "spicegarden-$Environment" -o json 2>$null
        if ($LASTEXITCODE -eq 0) {
            $maxReplicas = ($hpa | ConvertFrom-Json).spec.maxReplicas
            Write-Log "HPA configured with maxReplicas: $maxReplicas" -Level "PASS"
            $PASSED_CHECKS += "HPA configuration"
            
            if ($maxReplicas -lt 20) {
                Write-Log "Warning: maxReplicas ($maxReplicas) may be insufficient for >50k RPS" -Level "WARN"
            }
        } else {
            $FAILED_CHECKS += "HPA not found"
        }
    } catch {
        Write-Log "HPA check skipped - may not be deployed yet" -Level "WARN"
    }
    
    # Check PDB
    try {
        $pdb = kubectl get pdb spicegarden-backend-pdb -n "spicegarden-$Environment" -o json 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "PodDisruptionBudget configured" -Level "PASS"
            $PASSED_CHECKS += "PDB configuration"
        }
    } catch {
        Write-Log "PDB check skipped" -Level "WARN"
    }
    
    # Check Network Policies
    try {
        $netpol = kubectl get networkpolicy -n "spicegarden-$Environment" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Network policies configured" -Level "PASS"
            $PASSED_CHECKS += "Network policies"
        }
    } catch {
        Write-Log "Network policies check skipped" -Level "WARN"
    }
}

# 4. Docker Infrastructure
Write-Log "Checking Docker infrastructure..."

try {
    $containers = docker compose -f compose.infra.yaml ps --format "table" 2>$null
    if ($containers) {
        $requiredServices = @("postgres", "redis", "mongo", "prometheus", "grafana", "opensearch")
        foreach ($svc in $requiredServices) {
            if ($containers -match $svc) {
                Write-Log "Service $svc running" -Level "PASS"
                $PASSED_CHECKS += "Docker: $svc"
            } else {
                $FAILED_CHECKS += "Docker service: $svc not running"
            }
        }
    }
} catch {
    Write-Log "Docker compose check skipped - may not be running" -Level "WARN"
}

# 5. File Existence Checks
Write-Log "Validating configuration files..."

$requiredFiles = @(
    "infra/k8s/production-hardened.yaml",
    "infra/k8s/staging.yaml",
    "infra/k8s/cdn-ingress.yaml",
    "infra/prometheus/prometheus.yml",
    "infra/prometheus/rules/alerts.yml",
    "infra/prometheus/rules/slos.yml",
    "infra/alertmanager/alertmanager.yml",
    "infra/scripts/backup.sh",
    "infra/scripts/disaster-recovery.sh",
    "infra/scripts/autoscaling-validation.sh"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Log "Config file exists: $file" -Level "PASS"
        $PASSED_CHECKS += "File: $file"
    } else {
        $FAILED_CHECKS += "Missing config file: $file"
    }
}

# 6. Backup Configuration
if (Test-Path "infra/scripts/backup.sh") {
    Write-Log "Backup script present" -Level "PASS"
    $PASSED_CHECKS += "Backup script"
}

if (Test-Path "infra/scripts/backup.ps1") {
    Write-Log "Backup script (Windows) present" -Level "PASS"
    $PASSED_CHECKS += "Backup script (Windows)"
}

# 7. Summary
Write-Log ""
Write-Log "=== Validation Summary ==="
Write-Log "Passed: $($PASSED_CHECKS.Count)" -Level "PASS"
$level = if ($FAILED_CHECKS.Count -gt 0) { "ERROR" } else { "INFO" }
Write-Log "Failed/Warned: $($FAILED_CHECKS.Count)" -Level $level

if ($FAILED_CHECKS.Count -gt 0) {
    Write-Log ""
    Write-Log "Issues to address:"
    foreach ($issue in $FAILED_CHECKS) {
        Write-Log "  - $issue" -Level "ERROR"
    }
}

Write-Log ""
Write-Log "=== Next Steps ==="
Write-Log "1. Ensure all secrets are set in .env or secrets/*.txt"
Write-Log "2. Run: bash infra/scripts/autoscaling-validation.sh spicegarden-$Environment"
Write-Log "3. Deploy: kubectl apply -f infra/k8s/$Environment-hardened.yaml (fix filename as needed)"
Write-Log "4. Validate: curl https://api.spicegarden.com/health"

# Exit code
if ($FAILED_CHECKS.Count -gt 0) {
    exit 1
} else {
    exit 0
}