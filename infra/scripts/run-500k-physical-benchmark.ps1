<#
.SYNOPSIS
  SpiceGarden 500K Physical Benchmark Execution Wrapper (Windows PowerShell)
.DESCRIPTION
  Orchestrates pre-flight tuning, capacity model validation, distributed 500K physical
  benchmark, 30-minute hold, dual-run reproduction parity, chaos matrix, and DR drills.
#>

param (
    [switch]$DryRun,
    [switch]$LiveCloud,
    [string]$TargetUrl = "http://localhost:3001"
)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  SpiceGarden 500K Physical Benchmark Master Automation Suite   " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$env:TARGET_URL = $TargetUrl
if ($LiveCloud) {
    $env:LIVE_AWS = "true"
}

# 1. Local Network Tuning
Write-Host "`n[Step 1/6] Running Local OS Network Tuning..." -ForegroundColor Green
powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "tune-local-os-network.ps1")

# 2. Capacity Model Validation
Write-Host "`n[Step 2/6] Validating 500K Analytical Capacity Model..." -ForegroundColor Green
node (Join-Path $PSScriptRoot "validate-500k-capacity-model.js")

# 3. Master 500K Benchmark Execution
Write-Host "`n[Step 3/6] Executing Master 500K Benchmark..." -ForegroundColor Green
$benchArgs = @()
if ($DryRun) { $benchArgs += "--dry-run" }
node (Join-Path $PSScriptRoot "run-500k-physical-benchmark.js") @benchArgs

# 4. Reproduction & Parity Validation
Write-Host "`n[Step 4/6] Executing Dual-Run Reproduction & Parity Suite..." -ForegroundColor Green
node (Join-Path $PSScriptRoot "run-500k-reproduction-suite.js")

# 5. Cloud Chaos Matrix
Write-Host "`n[Step 5/6] Executing Cloud Chaos Engineering Matrix..." -ForegroundColor Green
node (Join-Path $PSScriptRoot "run-500k-cloud-chaos-matrix.js")

# 6. Disaster Recovery Drill
Write-Host "`n[Step 6/6] Executing Multi-Region Disaster Recovery Drill..." -ForegroundColor Green
node (Join-Path $PSScriptRoot "run-500k-dr-drill.js")

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  All 500K Validation & Benchmark Suites Completed Successfully! " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
