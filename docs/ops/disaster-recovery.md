# Disaster Recovery Plan (DRP)

**Version:** 1.0.0
**Owner:** Platform Engineering
**RPO target:** 15 min (DB) · **RTO target:** 60 min (core), 4 h (full)

## 1. Scope
Covers loss of: single node, AZ, region, primary datastore (Postgres/Mongo/Redis), or full cluster.

## 2. Backup strategy (see `backup-restore.md`)
- **Postgres:** logical dump (`pg_dump`) on schedule; stored in `./backup/` (gitignored) + object store.
- **Mongo:** `mongodump` of audit/event stores.
- **Redis:** AOF/RDB snapshot; acceptable to rebuild cache from DB.
- **Secrets:** `./secrets/` — never in backups in plaintext; reseed via `generate-secrets.ps1`.

## 3. Recovery triggers
| Event | Trigger | Runbook |
|-------|---------|----------|
| DB corruption | `/health` 500 + migration drift | `infra/scripts/disaster-recovery.sh --production` |
| Lost AZ | k8s nodes NotReady | failover to secondary AZ (multi-AZ deploy) |
| Region down | cloud region outage | DNS cutover to DR region |
| Secrets leak | confirmed exposure | rotate all (`secrets-rotation.ps1.js`) + break-glass |

## 4. Recovery procedure (production)
```bash
bash infra/scripts/disaster-recovery.sh --production
# Validates backup, restores Postgres + Mongo, reseeds legal/compliance docs,
# re-runs pending migrations idempotently, restarts services.
```
Post-restore: `node infra/scripts/verify-stack.js` must return all-green.

## 5. Validation
- `infra/scripts/backup-verification.sh` confirms backup integrity.
- Quarterly DR drill (restore to staging, run smoke order flow).

## 6. Comms
- Incident Response Policy owns notification.
- User comms template in `docs/ops/incident-playbook.md`.
