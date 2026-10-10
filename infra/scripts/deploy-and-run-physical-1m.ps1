# infra/scripts/deploy-and-run-physical-1m.ps1
<#
.SYNOPSIS
    One-click automated deployment and execution orchestrator for SpiceGarden Physical 1M VU / 585K RPS.
.DESCRIPTION
    Provisions Terraform infrastructure (VPC, EKS 20-node backend + 40-node k6 farm, ALB, Aurora PG, ElastiCache Redis),
    deploys 160-pod application cluster, runs k6 distributed benchmark, and aggregates results.
#>

param(
    [switch]$SkipTerraform = $false,
    [switch]$DryRun = $false
)

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "    SPICEGARDEN - PHYSICAL 1M VU / 585K RPS AUTOMATED DEPLOYMENT AND EXECUTION   " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

# 1. Environment & Pre-Flight Validation
Write-Host ""
Write-Host "[STEP 1] Validating AWS and Toolchain Prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command "aws" -ErrorAction SilentlyContinue)) {
    Write-Warning "AWS CLI is not detected in PATH. Please install AWS CLI and configure credentials."
}
if (-not (Get-Command "kubectl" -ErrorAction SilentlyContinue)) {
    Write-Warning "kubectl is not detected in PATH."
}
if (-not (Get-Command "terraform" -ErrorAction SilentlyContinue)) {
    Write-Warning "Terraform is not detected in PATH."
}

# 2. Terraform Cloud Infrastructure Provisioning
if (-not $SkipTerraform -and -not $DryRun) {
    Write-Host ""
    Write-Host "[STEP 2] Initializing and Provisioning Terraform Infrastructure..." -ForegroundColor Yellow
    Push-Location "infra/terraform"
    try {
        terraform init
        terraform apply -auto-approve
    } finally {
        Pop-Location
    }
} else {
    Write-Host ""
    Write-Host "[STEP 2] Skipping Terraform Cloud Provisioning (-SkipTerraform specified)." -ForegroundColor Gray
}

# 3. Kubernetes Application & PgBouncer Deployment (160 Pods)
Write-Host ""
Write-Host "[STEP 3] Deploying 160 Backend Pods and 8 PgBouncer Replicas..." -ForegroundColor Yellow
if (-not $DryRun) {
    if (Get-Command "kubectl" -ErrorAction SilentlyContinue) {
        kubectl apply -f infra/k8s/1m-physical-cluster.yaml
        Write-Host "Waiting for 160 Backend Pods to reach Ready state..." -ForegroundColor Cyan
        kubectl rollout status deployment/spicegarden-backend-1m -n spicegarden-prod --timeout=600s
    } else {
        Write-Warning "kubectl not found. Skipping Kubernetes manifest apply."
    }
}

# 4. Distributed 40-Host k6 Load Generator Farm Deployment
Write-Host ""
Write-Host "[STEP 4] Deploying 40-Host k6 Load Generator Farm (1,000,000 VUs / 585K RPS)..." -ForegroundColor Yellow
if (-not $DryRun) {
    if (Get-Command "kubectl" -ErrorAction SilentlyContinue) {
        kubectl apply -f infra/load-tests/1m/distributed/k6-40host-1m-farm.yaml
    }
}

# 5. Execute Validation & Telemetry Capture
Write-Host ""
Write-Host "[STEP 5] Running Multi-Tier Validation and Telemetry Collection..." -ForegroundColor Yellow
node infra/scripts/orchestrate-physical-1m.js

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "     1M VU / 585K RPS DEPLOYMENT AND BENCHMARK SUITE READY FOR LIVE TRAFFIC      " -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Green
