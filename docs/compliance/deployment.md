# Deployment & Configuration

## Environment Variables

| Variable                              | Purpose                                         |
| ------------------------------------- | ----------------------------------------------- |
| `BACKEND_URL` / `NEXT_PUBLIC_API_URL` | frontend → backend BFF proxy target             |
| `SWAGGER_ENABLED`                     | gate OpenAPI docs (default off in prod)         |
| `VAULT_*` / secret mounts             | encryption keys, payment tokens                 |
| `COMPLIANCE_SEED`                     | auto-seed legal documents on boot (recommended) |

## Docker / Kubernetes

- Build: `docker compose -f compose.dev.yaml` (Postgres/Redis/Mongo healthy).
- Manifests: `infra/k8s/production-hardened.yaml`, `staging.yaml`, `cdn-ingress.yaml`.
- Compliance routes are part of the single backend image; no separate deployable.

## Seeding Production Content

The legal seed is idempotent. On a fresh environment:

```
POST /legal/seed            # 18 documents (policies + agreements)
POST /legal/retention/seed  # default retention policies
```

Backends can call these automatically at startup when `COMPLIANCE_SEED=true`.

## Secrets

- Rotate via `SecretsRotationService` (PCI requirement).
- Card data never stored; only gateway tokens + last4.
- Legal records encrypted at rest (AES-256); audit records HMAC-signed.

## Verification Checklist (pre-launch)

- [ ] `npm run build` (all workspaces) → exit 0
- [ ] `npm run lint` → 0 errors
- [ ] `npm run test:unit` / `test:integration` / `test:e2e` → green
- [ ] Swagger generated with `SWAGGER_ENABLED=true`
- [ ] Migrations applied, zero drift
- [ ] Secrets rotated; production secrets in Vault
- [ ] Cookie banner geo behavior verified (EU/IN)
- [ ] Integrity scan returns 0 tampered
