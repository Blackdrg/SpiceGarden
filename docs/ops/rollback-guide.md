# Rollback Guide

**Version:** 1.0.0

## 1. Kubernetes rollback (preferred)
```bash
# List revisions
kubectl rollout history deployment/spicegarden-backend -n production
# Roll back to previous
kubectl rollout undo deployment/spicegarden-backend -n production
# Or to a specific revision
kubectl rollout undo deployment/spicegarden-backend -n production --to-revision=3
kubectl rollout status deployment/spicegarden-backend -n production
```

## 2. Image rollback
If a bad image was published, redeploy the last-known-good tag:
```bash
kubectl set image deployment/spicegarden-backend backend=registry/spicegarden-backend:<last-good-sha> -n production
```

## 3. Database rollback (use with caution)
- Migrations are forward-only. Do NOT reverse a migration unless data is recoverable from backup.
- If a migration corrupted data: restore from the latest backup (`docs/ops/backup-restore.md`), then re-apply safe migrations.
- Never rename migration classes — it breaks history tracking.

## 4. Frontend rollback
Frontends are static builds behind CDN/Ingress (`infra/k8s/cdn-ingress.yaml`). Redeploy prior image tag; CDN cache may need purge.

## 5. Post-rollback
- Verify `/health` and smoke order flow.
- Open a P1/MEDIUM incident; root-cause in post-mortem.
- Update `KNOWN_BLOCKERS_AND_GAPS.md` if systemic.
