#!/bin/bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backup}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="spicegarden_backup_${TIMESTAMP}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"

mkdir -p "${BACKUP_DIR}"

echo "Starting backup: ${BACKUP_NAME}"

# PostgreSQL Backup
echo "Backing up PostgreSQL..."
docker exec postgres pg_dump -U spicegarden spicegarden > "${BACKUP_DIR}/${BACKUP_NAME}_postgres.sql"

# MongoDB Backup
echo "Backing up MongoDB..."
docker exec mongo mongodump --db spicegarden --out /data/db/backup_${TIMESTAMP}
docker cp mongo:/data/db/backup_${TIMESTAMP} "${BACKUP_DIR}/${BACKUP_NAME}_mongo"

# Redis Backup
echo "Backing up Redis..."
docker exec redis redis-cli SAVE
docker cp redis:/data/dump.rdb "${BACKUP_DIR}/${BACKUP_NAME}_redis.rdb"

# Compress all backups
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
  -C "${BACKUP_DIR}" "${BACKUP_NAME}_postgres.sql" "${BACKUP_NAME}_mongo" "${BACKUP_NAME}_redis.rdb"

# Encrypt backup if key is provided
if [ -n "${ENCRYPTION_KEY}" ]; then
  echo "Encrypting backup..."
  openssl aes-256-cbc -salt -in "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" -out "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.enc" -k "${ENCRYPTION_KEY}"
  rm "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
  chmod 600 "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.enc"
else
  chmod 600 "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
fi

# Cleanup uncompressed files
rm "${BACKUP_DIR}/${BACKUP_NAME}_postgres.sql"
rm -rf "${BACKUP_DIR}/${BACKUP_NAME}_mongo" "${BACKUP_DIR}/${BACKUP_NAME}_redis.rdb"

echo "Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.enc${ENCRYPTION_KEY:+ (encrypted)}"

# Cleanup old backups (keep last 30 days)
find "${BACKUP_DIR}" -name "spicegarden_backup_*.tar.gz*" -mtime +30 -delete