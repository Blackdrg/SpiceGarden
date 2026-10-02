# SpiceGarden — Backup & Disaster Recovery Runbook

## 1. Backup Strategies

### PostgreSQL (Primary Relational Store)
- **Automated Backup Script:** [`infra/scripts/backup.sh`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/scripts/backup.sh) / [`infra/scripts/backup.ps1`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/scripts/backup.ps1).
- **Execution Method:** `pg_dump` with gzip compression and SHA256 checksum generation.
- **Trigger:**
  ```bash
  bash infra/scripts/backup.sh
  ```
- **Assumed Retention Policy:** Daily incremental snapshots retained for 30 days; monthly full backups retained for 12 months in cold S3/GCS bucket.

### MongoDB (Audit & Document Store)
- **Execution Method:** `mongodump` archiving to compressed BSON archives.
- **Trigger:** Configured in `infra/scripts/backup.sh`.

### Redis (Cache & Queues)
- **Persistence Strategy:** RDB periodic snapshots + AOF (Append-Only File) enabled with `fsync everysec`.
- **Note:** Queue state and locks are transient; critical order and transaction states reside primarily in PostgreSQL.

## 2. Disaster Recovery & Restoration

### Restoration Procedure
1. Execute the disaster recovery orchestration script:
   ```bash
   bash infra/scripts/disaster-recovery.sh --production
   ```
2. For database-specific manual restore:
   ```bash
   bash infra/scripts/restore.sh <path_to_backup_tar_gz>
   ```
3. Run TypeORM migration verification:
   ```bash
   cd apps/backend && npm run migration:run
   ```
4. Verify system health via `/health/readiness`.

## 3. Engineering Recovery Targets
- **Target Recovery Point Objective (RPO):** < 1 hour (engineered target via automated WAL / transaction log shipping; live staging drill pending, see [`DR_RESTORE_VALIDATION.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/docs/commercial/evidence/DR_RESTORE_VALIDATION.md)).
- **Target Recovery Time Objective (RTO):** < 15 minutes (engineered target for container orchestration restart and database restoration; live staging drill pending, see [`DR_RESTORE_VALIDATION.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/docs/commercial/evidence/DR_RESTORE_VALIDATION.md)).
