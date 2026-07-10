param(
    [switch]$SkipDownload,
    [switch]$SkipInit
)

$ErrorActionPreference = "Stop"
$PGSQL_VERSION = "16"
$PORTABLE_DIR = "$env:USERPROFILE\pgsql-portable"
$DATA_DIR = "$PORTABLE_DIR\data"
$DB_NAME = "spicegarden"
$DB_USER = "spicegarden"
$DB_PASS = "spicegarden_dev_password"

Write-Host "=== SpiceGarden Portable Database Setup ===" -ForegroundColor Green
Write-Host "  Install dir: $PORTABLE_DIR"
Write-Host ""

function Test-Portable {
    return (Test-Path "$PORTABLE_DIR\pg_ctl.exe") -or (Test-Path "$PORTABLE_DIR\bin\pg_ctl.exe")
}

if (-not (Test-Portable) -and -not $SkipDownload) {
    Write-Host "[1/4] Downloading PostgreSQL portable..." -ForegroundColor Yellow
    
    if (-not (Test-Path $PORTABLE_DIR)) {
        New-Item -ItemType Directory -Path $PORTABLE_DIR -Force | Out-Null
    }
    
    $url = "https://github.com/EnterpriseDB/postgres_server_binaries/archive/refs/tags/REL_16_14_2.zip"
    $zip = "$env:TEMP\pgsql-portable-16.zip"
    
    Write-Host "  Downloading PostgreSQL 16 portable binaries..."
    Write-Host "  NOTE: If download fails, manually download from: https://github.com/EnterpriseDB/postgres_server_binaries/releases"
    Write-Host "  URL: $url"
    Write-Host ""
    Write-Host "  For manual setup:"
    Write-Host "  1. Download the REL_16_XX zip from https://github.com/EnterpriseDB/postgres_server_binaries/releases"
    Write-Host "  2. Extract to: $PORTABLE_DIR"
    Write-Host "  3. Run this script with -SkipDownload"
    Write-Host ""
    
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $wc = New-Object System.Net.WebClient
        $wc.DownloadFile($url, $zip)
        Write-Host "  Downloaded: $((Get-Item $zip).Length / 1MB) MB"
        
        Write-Host "  Extracting..." -ForegroundColor Yellow
        Expand-Archive -Path $zip -DestinationPath $PORTABLE_DIR -Force
        $extracted = Get-ChildItem $PORTABLE_DIR -Directory | Where-Object { $_.Name -like "postgres_server_binaries*" } | Select-Object -First 1
        if ($extracted) {
            $binDir = Get-ChildItem $extracted.FullName -Directory | Where-Object { $_.Name -like "pgsql*" } | Select-Object -First 1
            if ($binDir) {
                Get-ChildItem $binDir.FullName | Move-Item -Destination $PORTABLE_DIR -Force
            }
        }
        Write-Host "  PostgreSQL extracted successfully!" -ForegroundColor Green
    } catch {
        Write-Host "  Automated download failed: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "MANUAL SETUP REQUIRED:" -ForegroundColor Yellow
        Write-Host "  1. Open browser and go to: https://github.com/EnterpriseDB/postgres_server_binaries/releases" -ForegroundColor Yellow
        Write-Host "  2. Download REL_16_XX zip (choose the Windows x64 version)" -ForegroundColor Yellow
        Write-Host "  3. Extract the zip contents directly into: $PORTABLE_DIR" -ForegroundColor Yellow
        Write-Host "  4. Run: .\setup-portable-database.ps1 -SkipDownload" -ForegroundColor Yellow
        exit 1
    }
} elseif (Test-Portable) {
    Write-Host "[1/4] PostgreSQL portable already installed." -ForegroundColor Green
} else {
    Write-Host "[1/4] Skipping download (-SkipDownload)." -ForegroundColor Yellow
    Write-Host "  Note: PostgreSQL binaries must be in $PORTABLE_DIR" -ForegroundColor Yellow
}

$pgBin = if (Test-Path "$PORTABLE_DIR\bin") { "$PORTABLE_DIR\bin" } else { $PORTABLE_DIR }
$pgCtl = Join-Path $pgBin "pg_ctl.exe"

if (-not (Test-Path $pgCtl)) {
    Write-Host "ERROR: pg_ctl.exe not found. Ensure PostgreSQL binaries are extracted to $PORTABLE_DIR" -ForegroundColor Red
    exit 1
}

$env:Path = $pgBin + ";" + $env:Path

Write-Host "[2/5] Initializing data directory..." -ForegroundColor Yellow
if (-not $SkipInit -or -not (Test-Path "$DATA_DIR\PG_VERSION")) {
    if (-not (Test-Path $DATA_DIR)) {
        New-Item -ItemType Directory -Path $DATA_DIR -Force | Out-Null
    }
    & initdb -D $DATA_DIR -U $DB_USER --locale=en_US.UTF-8 -E UTF8 2>&1 | Out-Null
    Write-Host "  Data directory initialized." -ForegroundColor Green
} else {
    Write-Host "  Data directory already exists." -ForegroundColor Green
}

Write-Host "[3/5] Starting PostgreSQL..." -ForegroundColor Yellow
$logFile = "$DATA_DIR\logfile"
if (-not (Test-Path (Get-Item $logFile).Directory)) {
    New-Item -ItemType Directory -Path (Split-Path $logFile) -Force | Out-Null
}

# Configure pg_hba to allow trust auth for localhost (no password needed for setup)
$pgHba = "$DATA_DIR\pg_hba.conf"
$pgConf = "$DATA_DIR\postgresql.conf"
$hbaContent = Get-Content $pgHba -Raw
if ($hbaContent -notmatch "trust") {
    $hbaContent = $hbaContent -replace "scram-sha-256", "trust"
    Set-Content -Path $pgHba -Value $hbaContent -NoNewline
}

# Ensure listen address is set
$confContent = Get-Content $pgConf -Raw
if ($confContent -notmatch "listen_addresses") {
    Add-Content -Path $pgConf -Value "`nlisten_addresses = 'localhost'`nport = 5432`n"
}

& $pgCtl -D $DATA_DIR -l $logFile start 2>&1 | Out-Null
Start-Sleep -Seconds 5

$env:PGPASSWORD = $DB_PASS
if (-not (& psql -U $DB_USER -d postgres -c "SELECT 1;" -t 2>&1)) {
    Write-Host "  PostgreSQL started (connection check will retry)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

Write-Host "[4/5] Creating database '${DB_NAME}'..." -ForegroundColor Yellow
$env:PGPASSWORD = $DB_PASS
$dbExists = & psql -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" 2>$null
if ($dbExists -ne "1") {
    & psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1 | Out-Null
    Write-Host "  Database created." -ForegroundColor Green
} else {
    Write-Host "  Database already exists." -ForegroundColor Green
}

Write-Host "[5/5] Applying schema..." -ForegroundColor Yellow
$schema = @"
CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
"@
$schema | & psql -U $DB_USER -d $DB_NAME 2>&1 | Out-Null
Write-Host "  Schema applied." -ForegroundColor Green

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Database: $DB_NAME" -ForegroundColor Cyan
Write-Host "User: $DB_USER" -ForegroundColor Cyan
Write-Host "Password: $DB_PASS" -ForegroundColor Cyan
Write-Host "Host: localhost" -ForegroundColor Cyan
Write-Host "Port: 5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "PostgreSQL binary: $PORTABLE_DIR" -ForegroundColor Cyan
Write-Host "Data directory: $DATA_DIR" -ForegroundColor Cyan
Write-Host ""
Write-Host "To manage PostgreSQL:" -ForegroundColor Cyan
Write-Host "  Start:  `$pgCtl -D `"$DATA_DIR`" -l `"$logFile`" start" -ForegroundColor White
Write-Host "  Stop:   `$pgCtl -D `"$DATA_DIR`" stop" -ForegroundColor White
Write-Host "  Status: `$pgCtl -D `"$DATA_DIR`" status" -ForegroundColor White

Write-Host ""
Write-Host "Add to PATH for convenience:" -ForegroundColor Cyan
Write-Host "  `$env:Path = `"$pgBin;`$env:Path`"" -ForegroundColor White
Write-Host ""
Write-Host "Now run in apps/backend:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
