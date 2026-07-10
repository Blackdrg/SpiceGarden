# SpiceGarden Database Setup Script
# Run this in PowerShell as Administrator
# Usage: .\setup-database.ps1

param(
    [switch]$SkipInstall,
    [switch]$SkipInit
)

$ErrorActionPreference = "Stop"
$PGSQL_VERSION = "16"
$PGSQL_URL = "https://get.enterprisedb.com/postgresql/postgresql-16.14-2-windows-x64.exe"
$PGSQL_INSTALLER = "$env:TEMP\postgresql-16-installer.exe"
$PGSQL_DATA = "C:\Program Files\PostgreSQL\$PGSQL_VERSION\data"
$DB_NAME = "spicegarden"
$DB_USER = "spicegarden"
$DB_PASS = "spicegarden_dev_password"

Write-Host "=== SpiceGarden Database Setup ===" -ForegroundColor Green

function Test-Admin {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Admin)) {
    Write-Host "ERROR: This script must be run as Administrator. Right-click PowerShell and 'Run as Administrator'." -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] Checking PostgreSQL installation..."
$pgBin = "C:\Program Files\PostgreSQL\$PGSQL_VERSION\bin\pg_ctl.exe"

if (-not (Test-Path $pgBin) -and -not $SkipInstall) {
    Write-Host "  PostgreSQL not found. Downloading..." -ForegroundColor Yellow
    if (-not (Test-Path $PGSQL_INSTALLER)) {
        Write-Host "  Downloading PostgreSQL $PGSQL_VERSION installer..."
        try {
            Invoke-WebRequest -Uri $PGSQL_URL -OutFile $PGSQL_INSTALLER -UseBasicParsing -TimeoutSec 120
            Write-Host "  Download complete: $((Get-Item $PGSQL_INSTALLER).Length / 1MB) MB"
        } catch {
            Write-Host "  Download failed: $_" -ForegroundColor Red
            Write-Host "  Try downloading manually from: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads" -ForegroundColor Yellow
            exit 1
        }
    }
    
    Write-Host "  Running installer (silent)..." -ForegroundColor Yellow
    Write-Host "  This will take 2-5 minutes..." -ForegroundColor Yellow
    
    $arguments = @(
        "--mode", "unattended",
        "--superpassword", $DB_PASS,
        "--install_runtimes", "0"
    )
    
    Start-Process -FilePath $PGSQL_INSTALLER -ArgumentList $arguments -Wait -NoNewWindow
    Start-Sleep -Seconds 10
    
    if (-not (Test-Path $pgBin)) {
        Write-Host "  Installation may not have completed. Check the installer output above." -ForegroundColor Red
        exit 1
    }
    Write-Host "  PostgreSQL installed successfully!" -ForegroundColor Green
} elseif (Test-Path $pgBin) {
    Write-Host "  PostgreSQL already installed." -ForegroundColor Green
} else {
    Write-Host "  Skipping install (--SkipInstall)." -ForegroundColor Yellow
}

$env:Path = "C:\Program Files\PostgreSQL\$PGSQL_VERSION\bin;" + $env:Path

Write-Host "[2/5] Checking PostgreSQL service..."
$serviceName = "postgresql-$PGSQL_VERSION"
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if (-not $service) {
    Write-Host "  PostgreSQL service not found. Initializing data directory..." -ForegroundColor Yellow
    
    if (-not $SkipInit) {
        $dataDir = "C:\Program Files\PostgreSQL\$PGSQL_VERSION\data"
        if (-not (Test-Path $dataDir)) {
            New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
            & initdb -D $dataDir -U $DB_USER --locale=en_US.UTF-8 -E UTF8 2>&1 | Out-Null
            Write-Host "  Data directory initialized." -ForegroundColor Green
        }
    }
    
    Write-Host "  Starting PostgreSQL..." -ForegroundColor Yellow
    & pg_ctl -D "C:\Program Files\PostgreSQL\$PGSQL_VERSION\data" -l "C:\Program Files\PostgreSQL\$PGSQL_VERSION\data\logfile" start 2>&1 | Out-Null
    Start-Sleep -Seconds 5
} else {
    if ($service.Status -ne 'Running') {
        Write-Host "  Starting PostgreSQL service..." -ForegroundColor Yellow
        Start-Service -Name $serviceName
        Start-Sleep -Seconds 5
    } else {
        Write-Host "  PostgreSQL is already running." -ForegroundColor Green
    }
}

Write-Host "[3/5] Verifying PostgreSQL is accepting connections..."
$maxRetries = 10
$retryCount = 0
$connected = $false

while (-not $connected -and $retryCount -lt $maxRetries) {
    try {
        $env:PGPASSWORD = $DB_PASS
        $result = & psql -U $DB_USER -d postgres -c "SELECT 1;" -t 2>&1
        if ($LASTEXITCODE -eq 0) {
            $connected = $true
            break
        }
    } catch {
        $retryCount++
        Write-Host "  Waiting for PostgreSQL... (attempt $retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $connected) {
    Write-Host "  Cannot connect to PostgreSQL. Please check manually:" -ForegroundColor Red
    Write-Host "  psql -U $DB_USER -d postgres" -ForegroundColor Yellow
    exit 1
}
Write-Host "  PostgreSQL is accepting connections!" -ForegroundColor Green

Write-Host "[4/5] Creating database '${DB_NAME}'..."
$env:PGPASSWORD = $DB_PASS
$dbExists = & psql -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" 2>&1
if ($dbExists -ne "1") {
    & psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1 | Out-Null
    Write-Host "  Database '$DB_NAME' created." -ForegroundColor Green
} else {
    Write-Host "  Database '$DB_NAME' already exists." -ForegroundColor Green
}

Write-Host "[5/5] Running TypeORM migrations..."
$env:PGPASSWORD = $DB_PASS
Push-Location "apps\backend"
try {
    npm run migration:run 2>&1 | ForEach-Object { Write-Host "  $_" }
    Write-Host "  Migrations complete!" -ForegroundColor Green
} catch {
    Write-Host "  Migration command failed. You can run manually with:" -ForegroundColor Yellow
    Write-Host "  cd apps/backend && npm run migration:run" -ForegroundColor Yellow
}
Pop-Location

Write-Host ""
Write-Host "=== Database Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "To start the backend server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Database credentials:" -ForegroundColor Cyan
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  Database: $DB_NAME" -ForegroundColor White
Write-Host "  User: $DB_USER" -ForegroundColor White
Write-Host "  Password: $DB_PASS" -ForegroundColor White
