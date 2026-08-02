# Secrets Rotation SOP

**Status:** DRAFT — First draft, not yet reviewed by security operations.  
**Backend reference:** `apps/backend/src/compliance/secrets-rotation.service.ts:1-200`, `infra/scripts/secrets-rotation.ps1.js:1-181`

---

## 1. Overview

SpiceGarden rotates secrets on a 90-day schedule to maintain forward secrecy and reduce the impact of credential compromise. Secrets are stored in `./secrets/` directory (gitignored) and managed via the secrets rotation script.

## 2. Secrets Requiring Rotation

| Secret Name | Purpose | Rotation SLA |
|---|---|---|
| `jwt_secret` | JWT signing key (`JWT_SECRET`) | 90 days |
| `encryption` | Data encryption key (`ENCRYPTION_SECRET`) | 90 days |
| `db_password` | Database password (`DB_PASS`) | 90 days |
| `stripe` | Stripe API key (`STRIPE_SECRET_KEY`) | 90 days |
| `grafana` | Grafana admin password | 90 days |

**Backend reference:** `apps/backend/src/compliance/secrets-rotation.service.ts:31-37` — `getSecretsRequiringRotation()`.

## 3. Rotation Triggers

| Trigger | Action |
|---|---|
| 90-day schedule (automated) | Secrets flagged for rotation |
| Suspected compromise | Immediate rotation (anytime) |
| Personnel change | Rotation of personnel-accessible secrets |
| PCI DSS requirement | Quarterly rotation of payment-related secrets |

## 4. Rotation Process

### Manual Rotation
```bash
node infra/scripts/secrets-rotation.ps1.js rotate jwt_secret encryption db_password
```

### Programmatic Rotation (API)
```
POST /v1/compliance/secrets/rotate?secrets=jwt_secret,encryption,db_password
```
**Backend reference:** `apps/backend/src/compliance/compliance.controller.ts:95-108` — `rotateSecrets()` endpoint (requires SUPER_ADMIN + `compliance:read`).

### Automated Checks

| Command | Purpose |
|---|---|
| `POST /v1/compliance/secrets/rotate` | Rotate specified secrets |
| `GET /v1/compliance/secrets/rotation-status` | List secrets requiring rotation + validation |
| `GET /v1/compliance/secrets/proof` | Rotation history and proof of capability |

**Backend references:**
- `compliance.controller.ts:79-85` — `getSecretsRotationStatus()`
- `compliance.controller.ts:90-93` — `getSecretsRotationProof()`

## 5. Rotation Steps

1. **Generate new secret:** `crypto.randomBytes(32).toString('base64url')` (`secrets-rotation.ps1.js:28-31`)
2. **Write to secrets directory:** `secrets/<secret_name>.txt` (`secrets-rotation.ps1.js:33-49`)
3. **Update K8s manifest:** Base64-encode and update `infra/k8s/sealed-secrets.yaml` (`secrets-rotation.ps1.js:52-68`)
4. **Record in history:** `secrets/rotation-history.json` with SHA-256 hash of old and new values (`secrets-rotation.ps1.js:70-108`)
5. **Re-deploy:** K8s pods pick up new secrets on restart
6. **Verify:** Health check to confirm service recovery

## 6. Secret Storage

| Location | Description |
|---|---|
| `./secrets/<name>.txt` | Plain-text secret files (gitignored, `secrets/` is in `.gitignore`) |
| `secrets/rotation-history.json` | Rotation audit log with timestamps and hashes |
| `infra/k8s/sealed-secrets.yaml` | Kubernetes sealed secrets (encrypted) |
| HashiCorp Vault | Primary secret management (referenced by config) |

**Backend reference:** `apps/backend/src/infra/secret-loader.service.ts:1-90` — `SecretLoaderService` reads secrets from both K8s secrets and environment variables.

## 7. Validation

Before rotation, validate capability:
```bash
node infra/scripts/secrets-rotation.ps1.js validate
```

Returns:
- `secretsDirectory` — secrets directory exists
- `rotationScript` — script exists
- `cryptoModule` — crypto.randomBytes available
- `writeAccess` — write to secrets directory
- `k8sManifestExists` — sealed-secrets.yaml exists

**Backend reference:** `secrets-rotation.service.ts:48-74` — `validateRotationCapability()`.

## 8. Incident Response for Compromised Secrets

If a secret is suspected of compromise:
1. Immediately rotate via `POST /v1/compliance/secrets/rotate`
2. Check for unauthorized access in audit logs
3. Notify affected parties if PII was exposed
4. Document in the security incident register

## 9. Contact

Secrets rotation questions: security@spicegarden.com

---

*This document is a DRAFT. Secrets rotation must be performed by authorized personnel only.*
