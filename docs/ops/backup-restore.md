# Backup & Restore Guide

**Version:** 1.0.0

## 1. Manual backup
```bash
bash infra/scripts/backup.sh                 # Postgres + Mongo dump to ./backup
powershell -File infra/scripts/backup.ps1   # Windows equivalent
```

## 2. Verify backups
```bash
bash infra/scripts/backup-verification.sh    # integrity + recency check
```

## 3. Restore
```bash
bash infra/scripts/restore.sh                # interactive: pick backup set
# Production disaster path (validates + restores + reseeds):
bash infra/scripts/disaster-recovery.sh --production
```

## 4. Secrets
Secrets are NOT in DB backups. After restore:
```bash
powershell -File infra/scripts/generate-secrets.ps1   # or load existing
bash infra/scripts/load-secrets.sh
```
Then restart services so they pick up `./secrets/`.

## 5. Retention
- Daily backups retained 30 days; weekly 90 days; monthly 1 year (object store lifecycle).
- Legal hold (compliance) suspends deletion of records covered by `data_retention_policy`.

## 6. Rotation of backup creds
Backup storage creds rotated per Encryption & Key Rotation Policy; updated in CI secrets.
