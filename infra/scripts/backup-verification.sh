#!/bin/bash

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/tmp/backups}"
VERIFY_DIR="${VERIFY_DIR:-/tmp/backup-verification}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="spicegarden_backup_${TIMESTAMP}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-postgres}"
MONGO_CONTAINER="${MONGO_CONTAINER:-mongo}"
REDIS_CONTAINER="${REDIS_CONTAINER:-redis}"
MAX_BACKUP_AGE_DAYS="${MAX_BACKUP_AGE_DAYS:-7}"

log() {
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] $1"
}

error_exit() {
  log "ERROR: $1"
  exit 1
}

mkdir -p "$VERIFY_DIR"

log "=== Backup Verification Started ==="

LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/spicegarden_backup_*.tar.gz 2>/dev/null | head -1)
if [ -z "$LATEST_BACKUP" ]; then
  error_exit "No backup found in $BACKUP_DIR"
fi

log "Testing backup: $LATEST_BACKUP"
BACKUP_SIZE=$(stat -f%z "$LATEST_BACKUP" 2>/dev/null || stat --printf="%s" "$LATEST_BACKUP" 2>/dev/null)
log "Backup size: $BACKUP_SIZE bytes"

if [ "$BACKUP_SIZE" -lt 1024 ]; then
  error_exit "Backup file is too small ($BACKUP_SIZE bytes) - likely corrupted"
fi

if ! tar -tzf "$LATEST_BACKUP" >/dev/null 2>&1; then
  error_exit "Backup file is not a valid tar.gz archive"
fi

log "Backup archive integrity: OK"

TEMP_RESTORE="$VERIFY_DIR/restore_${TIMESTAMP}"
mkdir -p "$TEMP_RESTORE"

if ! tar -xzf "$LATEST_BACKUP" -C "$TEMP_RESTORE" 2>/dev/null; then
  error_exit "Failed to extract backup archive"
fi
log "Backup extraction: OK"

PG_DUMP=$(find "$TEMP_RESTORE" -name "*.sql" -o -name "*.dump" | head -1)
if [ -n "$PG_DUMP" ]; then
  log "PostgreSQL dump found: $(basename "$PG_DUMP")"
  PG_ROW_COUNT=$(grep -c "INSERT INTO" "$PG_DUMP" 2>/dev/null || echo 0)
  log "PostgreSQL INSERT statements: $PG_ROW_COUNT"
fi

MONGO_DUMP=$(find "$TEMP_RESTORE" -name "*.bson" -o -name "*.json" | head -1)
if [ -n "$MONGO_DUMP" ]; then
  log "MongoDB dump found: $(basename "$MONGO_DUMP")"
  MONGO_ROW_COUNT=$(wc -l < "$MONGO_DUMP" 2>/dev/null || echo 0)
  log "MongoDB document count (approx): $MONGO_ROW_COUNT"
fi

STALE_BACKUPS=$(find "$BACKUP_DIR" -name "spicegarden_backup_*.tar.gz" -mtime +$MAX_BACKUP_AGE_DAYS | wc -l)
if [ "$STALE_BACKUPS" -gt 0 ]; then
  log "WARNING: $STALE_BACKUPS backups older than $MAX_BACKUP_AGE_DAYS days"
fi

rm -rf "$TEMP_RESTORE"

log "=== Backup Verification Complete ==="
log "Result: PASS"
log "Backup $LATEST_BACKUP is valid and contains data"
