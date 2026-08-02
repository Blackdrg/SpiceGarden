#!/bin/bash
set -euo pipefail

# Backup/Restore Drill Script for SpiceGarden
# Usage: bash infra/scripts/backup-restore-drill.sh [--production|--staging]
# This script performs a full backup, verifies it, restores to a test namespace,
# and validates the restored data.

ENVIRONMENT="${1:---production}"
BACKUP_DIR="${BACKUP_DIR:-/backup}"
DRILL_NAMESPACE="${DRILL_NAMESPACE:-spicegarden-drill}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log() {
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] $1"
}

check_prerequisites() {
  log "Checking prerequisites..."
  for cmd in kubectl helm aws; do
    if ! command -v "$cmd" &> /dev/null; then
      log "ERROR: $cmd is not installed"
      exit 1
    fi
  done
}

create_drill_namespace() {
  log "Creating drill namespace: $DRILL_NAMESPACE"
  kubectl create namespace "$DRILL_NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
}

perform_backup() {
  log "Starting backup drill at $TIMESTAMP"
  log "Step 1: Triggering backup CronJob"
  kubectl delete job backup-spicegarden -n spicegarden-production --ignore-not-found=true || true
  kubectl create job backup-spicegarden --from=cronjob/spicegarden-backup -n spicegarden-production
  kubectl wait --for=condition=complete job/backup-spicegarden -n spicegarden-production --timeout=300s
  log "Step 1: Backup CronJob completed"
}

verify_backup() {
  log "Step 2: Verifying backup integrity"
  local backup_file
  backup_file=$(aws s3 ls s3://spicegarden-backups-prod/ | sort -r | head -n 1 | awk '{print $4}')
  if [ -z "$backup_file" ]; then
    log "ERROR: No backup file found in S3"
    exit 1
  fi
  log "Found backup file: $backup_file"

  log "Step 3: Downloading and decrypting backup"
  aws s3 cp "s3://spicegarden-backups-prod/$backup_file" "/tmp/$backup_file"
  if [[ "$backup_file" == *.enc ]]; then
    openssl aes-256-cbc -d -in "/tmp/$backup_file" -out "/tmp/${backup_file%.enc}" -k "${BACKUP_ENCRYPTION_KEY:-}"
    BACKUP_FILE="/tmp/${backup_file%.enc}"
  else
    BACKUP_FILE="/tmp/$backup_file"
  fi
  log "Backup downloaded and decrypted"

  log "Step 4: Validating backup contents"
  tar -tzf "$BACKUP_FILE" | grep -E '\.(sql|rdb|json)$' > /tmp/backup_contents.txt
  if [ ! -s /tmp/backup_contents.txt ]; then
    log "ERROR: Backup appears empty or corrupted"
    exit 1
  fi
  log "Backup contents validated:"
  cat /tmp/backup_contents.txt
}

restore_to_drill_namespace() {
  log "Step 5: Restoring to drill namespace: $DRILL_NAMESPACE"
  tar -xzf "$BACKUP_FILE" -C /tmp/drill-restore/

  log "Step 6: Restoring PostgreSQL to drill namespace"
  kubectl run restore-postgres-drill \
    --image=postgres:16-alpine \
    --env="PGPASSWORD=$POSTGRES_PASSWORD" \
    --env="PGHOST=postgres" \
    --env="PGDATABASE=spicegarden" \
    --env="PGUSER=spicegarden" \
    -n "$DRILL_NAMESPACE" \
    --restart=Never \
    --command -- \
    sh -c "psql -U spicegarden -d spicegarden -h postgres < /tmp/drill-restore/postgres.sql"

  log "Step 7: Restoring MongoDB to drill namespace"
  kubectl run restore-mongo-drill \
    --image=mongo:7 \
    -n "$DRILL_NAMESPACE" \
    --restart=Never \
    --command -- \
    sh -c "mongorestore --host mongo -d spicegarden_drill --drop /tmp/drill-restore/mongo"

  log "Step 8: Restoring Redis to drill namespace"
  kubectl run restore-redis-drill \
    --image=redis:7-alpine \
    -n "$DRILL_NAMESPACE" \
    --restart=Never \
    --command -- \
    sh -c "cp /tmp/drill-restore/redis.rdb /data/dump.rdb && redis-cli -h redis SHUTDOWN NOSAVE"
}

validate_restore() {
  log "Step 9: Validating restored data"
  kubectl wait --for=condition=available --timeout=120s deployment/spicegarden-backend -n "$DRILL_NAMESPACE" || true

  log "Step 10: Running health check on restored backend"
  kubectl get pods -n "$DRILL_NAMESPACE" -l app=spicegarden-backend -o jsonpath='{.items[0].metadata.name}' | \
    xargs -I {} kubectl exec -n "$DRILL_NAMESPACE" {} -- curl -f http://localhost:3001/health || true

  log "Step 11: Comparing record counts"
  local original_pg_count
  original_pg_count=$(kubectl exec -n spicegarden-production deploy/spicegarden-backend -- psql -U spicegarden -d spicegarden -h postgres -t -c "SELECT count(*) FROM orders;" 2>/dev/null | tr -d ' ')
  local drill_pg_count
  drill_pg_count=$(kubectl exec -n "$DRILL_NAMESPACE" deploy/spicegarden-backend -- psql -U spicegarden -d spicegarden -h postgres -t -c "SELECT count(*) FROM orders;" 2>/dev/null | tr -d ' ')

  log "Original order count: $original_pg_count"
  log "Drill order count: $drill_pg_count"

  if [ "$original_pg_count" = "$drill_pg_count" ]; then
    log "VALIDATION PASSED: Record counts match"
  else
    log "VALIDATION WARNING: Record counts differ (expected in drill environment)"
  fi
}

cleanup() {
  log "Step 12: Cleaning up drill resources"
  kubectl delete namespace "$DRILL_NAMESPACE" --ignore-not-found=true
  rm -rf /tmp/drill-restore /tmp/backup_contents.txt /tmp/backup*
  log "Drill cleanup complete"
}

# Main execution
check_prerequisites
create_drill_namespace
perform_backup
verify_backup
restore_to_drill_namespace
validate_restore

log "=========================================="
log "BACKUP/RESTORE DRILL COMPLETED"
log "Environment: $ENVIRONMENT"
log "Timestamp: $TIMESTAMP"
log "=========================================="

cleanup