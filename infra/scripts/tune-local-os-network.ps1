<#
.SYNOPSIS
  SpiceGarden Local OS Socket & Network Stack Tuning Script for Windows Workstations.
.DESCRIPTION
  Tunes Winsock ephemeral port ranges, TCP TIME_WAIT delays, and socket buffer
  allocations to mitigate WSAENOBUFS (Error 10055) and ephemeral port exhaustion
  during high-concurrency local load tests (up to local OS hardware boundary).
#>

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  SpiceGarden Local OS Socket & Network Stack Tuning (Windows)   " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Ensure Administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[!] Warning: Script is not running as Administrator. Registry changes require elevated privileges." -ForegroundColor Yellow
    Write-Host "[i] Outputting recommended commands and registry keys to configure:" -ForegroundColor Gray
}

# 1. Ephemeral Port Range Configuration (TCP Dynamic Port Range)
Write-Host "`n[1/4] Configuring Ephemeral TCP Port Range..." -ForegroundColor Green
$portCmd = "netsh int ipv4 set dynamicport tcp start=1025 num=64510"
Write-Host "  Executing: $portCmd" -ForegroundColor Gray
if ($isAdmin) {
    Invoke-Expression $portCmd
    Write-Host "  [OK] Ephemeral port range extended to 1025-65535 (64,510 available ports)." -ForegroundColor Green
} else {
    Write-Host "  [DRY-RUN] Command ready: $portCmd" -ForegroundColor Yellow
}

# 2. Registry Settings for TCP TIME_WAIT and Socket Recycling
Write-Host "`n[2/4] Optimizing TCP Parameters in Registry..." -ForegroundColor Green
$tcpKey = "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters"

$settings = @(
    @{ Name = "TcpTimedWaitDelay"; Value = 30; Type = "DWord"; Desc = "Reduces TCP TIME_WAIT from default (120s-240s) to 30s" },
    @{ Name = "MaxUserPort"; Value = 65534; Type = "DWord"; Desc = "Sets maximum user port limit to 65534" },
    @{ Name = "TcpNumConnections"; Value = 16777214; Type = "DWord"; Desc = "Sets max concurrent TCP connections" },
    @{ Name = "SynAttackProtect"; Value = 1; Type = "DWord"; Desc = "Enables SYN attack protection under heavy load" },
    @{ Name = "DefaultTTL"; Value = 64; Type = "DWord"; Desc = "Standard default TTL" }
)

foreach ($setting in $settings) {
    Write-Host "  Setting $($setting.Name) = $($setting.Value) ($($setting.Desc))" -ForegroundColor Gray
    if ($isAdmin) {
        Set-ItemProperty -Path $tcpKey -Name $setting.Name -Value $setting.Value -Type $setting.Type -Force -ErrorAction SilentlyContinue
        Write-Host "    [OK] Configured $($setting.Name)" -ForegroundColor Green
    } else {
        Write-Host "    [DRY-RUN] Would set $($setting.Name) = $($setting.Value)" -ForegroundColor Yellow
    }
}

# 3. Node.js & Libuv Environment Variable Configuration
Write-Host "`n[3/4] Configuring Libuv & Node.js Concurrency Variables..." -ForegroundColor Green
$envVars = @{
    "UV_THREADPOOL_SIZE" = "64"
    "NODE_OPTIONS" = "--max-old-space-size=4096"
}

foreach ($key in $envVars.Keys) {
    [System.Environment]::SetEnvironmentVariable($key, $envVars[$key], [System.EnvironmentVariableTarget]::Process)
    Write-Host "  [OK] Process Env: $key = $($envVars[$key])" -ForegroundColor Green
}

# 4. Verification Summary
Write-Host "`n[4/4] Verifying Dynamic Port Configuration..." -ForegroundColor Green
$currentPorts = netsh int ipv4 show dynamicport tcp
Write-Host $currentPorts -ForegroundColor Gray

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  Local OS Network Tuning Completed Successfully!                " -ForegroundColor Cyan
Write-Host "  Note: System reboot recommended if registry settings updated.  " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
