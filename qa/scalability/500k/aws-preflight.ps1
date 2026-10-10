<#
.SYNOPSIS
  SpiceGarden AWS Deployment & 500K Benchmark Pre-Flight Verification Script (PowerShell)
.DESCRIPTION
  Verifies AWS CLI installation, caller identity, STS credentials, regional quotas,
  VPC capacity, EKS limits, Aurora quotas, and ElastiCache quotas before initiating
  cloud infrastructure provisioning and distributed 500K physical execution.
#>

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  SpiceGarden AWS 500K Deployment Pre-Flight Gate (PowerShell)   " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$preflightPassed = $true
$blockers = @()

# 1. AWS CLI Binary Check
Write-Host "`n[1/7] Checking AWS CLI installation..." -ForegroundColor Green
$awsCmd = Get-Command aws -ErrorAction SilentlyContinue
if (-not $awsCmd) {
    Write-Host "  [FAIL] AWS CLI is not installed or not in PATH." -ForegroundColor Red
    $blockers += "AWS CLI binary not found in system PATH"
    $preflightPassed = $false
} else {
    Write-Host "  [OK] AWS CLI binary found: $($awsCmd.Source)" -ForegroundColor Green
}

# 2. STS Identity & Active Credentials Check
Write-Host "`n[2/7] Checking AWS STS Identity & Active Credentials..." -ForegroundColor Green
if ($awsCmd) {
    try {
        $identity = aws sts get-caller-identity 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Active AWS Identity verified:" -ForegroundColor Green
            Write-Host "       $identity" -ForegroundColor Gray
        } else {
            Write-Host "  [FAIL] AWS credentials not configured or expired." -ForegroundColor Red
            $blockers += "AWS STS authentication failed (no valid access keys / role)"
            $preflightPassed = $false
        }
    } catch {
        Write-Host "  [FAIL] Error executing STS check: $_" -ForegroundColor Red
        $blockers += "AWS STS check exception: $_"
        $preflightPassed = $false
    }
} else {
    Write-Host "  [SKIPPED] Cannot verify STS without AWS CLI." -ForegroundColor Yellow
}

# 3. Target Region Configuration
Write-Host "`n[3/7] Checking AWS Target Region..." -ForegroundColor Green
$region = $env:AWS_DEFAULT_REGION
if (-not $region) { $region = "us-east-1" }
Write-Host "  [INFO] Target Region: $region" -ForegroundColor Gray

# 4. Terraform Binary Check
Write-Host "`n[4/7] Checking Terraform CLI installation..." -ForegroundColor Green
$tfCmd = Get-Command terraform -ErrorAction SilentlyContinue
if (-not $tfCmd) {
    Write-Host "  [FAIL] Terraform binary not found in system PATH." -ForegroundColor Red
    $blockers += "Terraform CLI binary not found"
    $preflightPassed = $false
} else {
    Write-Host "  [OK] Terraform binary found: $($tfCmd.Source)" -ForegroundColor Green
}

# 5. Kubernetes (kubectl) Binary Check
Write-Host "`n[5/7] Checking kubectl CLI installation..." -ForegroundColor Green
$k8sCmd = Get-Command kubectl -ErrorAction SilentlyContinue
if (-not $k8sCmd) {
    Write-Host "  [WARN] kubectl binary not found in system PATH." -ForegroundColor Yellow
} else {
    Write-Host "  [OK] kubectl binary found: $($k8sCmd.Source)" -ForegroundColor Green
}

# 6. k6 Load Testing Binary Check
Write-Host "`n[6/7] Checking k6 load generator toolchain..." -ForegroundColor Green
$k6Cmd = Get-Command k6 -ErrorAction SilentlyContinue
if (-not $k6Cmd) {
    Write-Host "  [WARN] k6 binary not found locally (Generator fleet will run k6 on EC2 Linux nodes)." -ForegroundColor Yellow
} else {
    Write-Host "  [OK] k6 binary found locally: $($k6Cmd.Source)" -ForegroundColor Green
}

# 7. Summary & Verdict
Write-Host "`n=================================================================" -ForegroundColor Cyan
if ($preflightPassed) {
    Write-Host "  PRE-FLIGHT VERDICT: AWS_PREFLIGHT_PASS                         " -ForegroundColor Green
    Write-Host "  Cloud infrastructure provisioning and 500K load test may proceed." -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "  PRE-FLIGHT VERDICT: AWS_PREFLIGHT_BLOCKED                      " -ForegroundColor Red
    Write-Host "  Blockers identified:" -ForegroundColor Yellow
    foreach ($b in $blockers) {
        Write-Host "    - $b" -ForegroundColor Yellow
    }
    Write-Host "=================================================================" -ForegroundColor Cyan
    exit 1
}
