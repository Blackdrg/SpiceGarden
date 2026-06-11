# SpiceGarden Backup Script - PowerShell Version
# Cross-platform backup for Windows environments
# Usage: powershell -File infra/scripts/backup.ps1

param(
    [string]$BackupDir = "C:\backup"
)

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupName = "spicegarden_backup_$Timestamp"

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

Write-Host "Starting backup: $BackupName"

# PostgreSQL Backup
Write-Host "Backing up PostgreSQL..."
$pgDump = "C:\Program Files\PostgreSQL\bin\pg_dump.exe"
if (Test-Path $pgDump) {
    & $pgDump -U spicegarden -d spicegarden | Out-File -FilePath "$BackupDir\$BackupName-postgres.sql"
} else {
    Write-Host "PostgreSQL client not found, using docker exec..."
    docker exec postgres pg_dump -U spicegarden spicegarden > "$BackupDir\$BackupName-postgres.sql"
}

# MongoDB Backup
Write-Host "Backing up MongoDB..."
docker exec mongo mongodump --db spicegarden --out /data/db/backup_$Timestamp
docker cp "mongo:/data/db/backup_$Timestamp" "$BackupDir\$BackupName-mongo"

# Redis Backup
Write-Host "Backing up Redis..."
docker exec redis redis-cli SAVE
docker cp "redis:/data/dump.rdb" "$BackupDir\$BackupName-redis.rdb"

# Compress all backups
Write-Host "Compressing backups..."
tar -czf "$BackupDir\$BackupName.tar.gz" -C $BackupDir "$BackupName-postgres.sql" "$BackupName-mongo" "$BackupName-redis.rdb"

# Cleanup uncompressed files
Remove-Item "$BackupDir\$BackupName-postgres.sql" -Force
Remove-Item "$BackupDir\$BackupName-mongo" -Recurse -Force
Remove-Item "$BackupDir\$BackupName-redis.rdb" -Force

Write-Host "Backup completed: $BackupDir\$BackupName.tar.gz"

# Cleanup old backups (keep last 7 days)
Get-ChildItem -Path $BackupDir -Filter "spicegarden_backup_*.tar.gz" | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-7) } | Remove-Item

Write-Host "Backup process finished successfully!"