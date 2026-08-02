# Backup and Recovery SOP

**Status:** DRAFT — First draft, not yet reviewed by operations.  
**Backend reference:** `infra/scripts/backup.sh:1-48`, `infra/scripts/disaster-recovery.sh:1-112`, `infra/scripts/backup-verification.sh:1-77`

---

## 1. Overview

The SpiceGarden platform performs automated backups of all three data stores (PostgreSQL, MongoDB, Redis) and provides a documented disaster recovery procedure.

## 2. Backup Components

### 2.1 PostgreSQL (Primary Database)
- **Script:** `infra/scripts/backup.sh:14-15`
- **Tool:** `docker exec postgres pg_dump -U spicegarden spicegarden`
- **Retention:** 30 days (`backup.sh:47-48`)
- **Output:** `spicegarden_backup_<TIMESTAMP>_postgres.sql`

### 2.2 MongoDB (Session Cache)
- **Script:** `infra/scripts/backup.sh:17-20`
- **Tool:** `docker exec mongo mongodump --db spicegarden`
- **Output:** `spicegarden_backup_<TIMESTAMP>_mongo/`

### 2.3 Redis (Cache & Queues)
- **Script:** `infra/scripts/backup.sh:22-25`
- **Tool:** `docker exec redis redis-cli SAVE` + `docker cp`
- **Output:** `spicegarden_backup_<TIMESTAMP>_redis.rdb`

## 3. Backup Process

1. All backups are compressed into a single `.tar.gz` archive (`backup.sh:28-29`)
2. If `BACKUP_ENCRYPTION_KEY` is set, the archive is encrypted with AES-256-CBC (`backup.sh:32-35`)
3. Permission set to 600 (owner read/write only) (`backup.sh:36,38`)
4. Uncompressed intermediate files are cleaned up (`backup.sh:42-43`)
5. Old backups (>30 days) are deleted (`backup.sh:47-48`)

## 4. Backup Verification

### Manual Verification
```bash
bash infra/scripts/backup-verification.sh
```

### Automated Checks
The verification script (`backup-verification.sh:1-77`) performs:
- Checks for the latest backup file existence
- Validates file size (>1024 bytes, `backup-verification.sh:36-38`)
- Tests tar.gz archive integrity (`backup-verification.sh:40-42`)
- Extracts and checks for PostgreSQL dump, MongoDB dump, Redis RDB files (`backup-verification.sh:54-66`)
- Alerts on stale backups (>7 days, `backup-verification.sh:68-71`)

### API Endpoint
Backup integrity can also be verified programmatically:
```
GET /v1/compliance/backup-integrity
```
**Backend reference:** `apps/backend/src/compliance/compliance.controller.ts:241-244` — `verifyBackupIntegrity()` endpoint (requires SUPER_ADMIN role).

## 5. Recovery Process

### Disaster Recovery Script
```bash
bash infra/scripts/disaster-recovery.sh --production
```

**Options:**
- `--production` or `--staging` — environment selection
- `--backup-date YYYYMMDD_HHMMSS` — specific backup timestamp

### Recovery Steps
1. **Prerequisites check** — verifies `kubectl`, `helm`, `openssl` installed (`disaster-recovery.sh:15-23`)
2. **Namespace creation** — creates K8s namespace for the environment (`disaster-recovery.sh:36-37`)
3. **Secret restoration** — applies K8s secrets manifest (`disaster-recovery.sh:40-41`)
4. **Backup download** — from S3 or local path (`disaster-recovery.sh:44-45`)
5. **Decryption** — AES-256-CBC decryption with `BACKUP_ENCRYPTION_KEY` (`disaster-recovery.sh:48-54`)
6. **PostgreSQL restore** — via temporary kubectl pod (`disaster-recovery.sh:59-64`)
7. **MongoDB restore** — via temporary kubectl pod (`disaster-recovery.sh:66-70`)
8. **Redis restore** — copies dump.rdb to Redis pod (`disaster-recovery.sh:72-76`)
9. **Validation** — health check on restored backend (`disaster-recovery.sh:81-93`)

## 6. Backup Schedule

| Component | Frequency | Retention | Script |
|---|---|---|---|
| PostgreSQL | Daily (cron) | 30 days | `backup.sh` |
| MongoDB | Daily (cron) | 30 days | `backup.sh` |
| Redis | Daily (cron) | 30 days | `backup.sh` |
| Combined archive | Daily | 30 days | `backup.sh` |
| Backup verification | Daily (post-backup cron) | — | `backup-verification.sh` |

## 7. Backup Security

- Archives are encrypted with AES-256-CBC if `BACKUP_ENCRYPTION_KEY` is set
- File permissions set to 600 (owner-only)
- Encryption key should be stored in HashiCorp Vault, not in `.env`
- S3 bucket should have server-side encryption (SSE) enabled

## 8. Contact

Backup/DR questions: ops@spicegarden.com

---

*This document is a DRAFT. For operational questions, contact ops@spicegarden.com.*
