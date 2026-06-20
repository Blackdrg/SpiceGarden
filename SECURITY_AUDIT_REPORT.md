# SECURITY AUDIT REPORT

**Audit Date:** 2026-06-20  
**Scope:** Backend security controls, infrastructure, runtime validation

---

## Security Controls Implemented

| Control | Status | Evidence |
|---------|--------|----------|
| JWT Auth | ✅ Implemented | `apps/backend/src/services/auth/auth.module.ts` |
| Password Hashing | ✅ Implemented | Argon2 used (`apps/backend/package.json:42`) |
| Rate Limiting | ✅ Implemented | `main.ts:136-144` |
| Helmet Headers | ✅ Implemented | `main.ts:215-234` |
| HPP Protection | ✅ Implemented | `main.ts:238` |
| NoSQL Sanitization | ✅ Implemented | `main.ts:170-204, 237` |
| CSRF Protection | ✅ Implemented | `main.ts:235` |
| CORS | ✅ Implemented | `getAllowedOrigins()` in `apps/backend/src/security/cors-origin.ts` |
| RBAC Guard | ⚠️ Partial | `roles.guard.ts` exists; controller coverage unverified |
| Production Validation | ✅ Implemented | `main.ts:57-87` |

---

## Rate Limiting Configuration

| Endpoint | Window | Max | Source |
|----------|--------|-----|--------|
| `/auth/otp` | 10 min | 3 | main.ts:140 |
| `/auth/` | 15 min | 5 | main.ts:141 |
| `/orders` | 15 min | 10 | main.ts:142 |
| `/api/` | 15 min | 100 | main.ts:143 |

**Rate Limit Bypass:** `LOAD_TEST_MODE=true` skips rate limiting in non-production

---

## CORS Configuration

- `getAllowedOrigins()` helper (`apps/backend/src/security/cors-origin.ts`)
- Credentials enabled
- Restricted methods/headers
- Validates `CORS_ALLOWED_ORIGINS` environment variable

---

## Security Tests Executed

| Test | Result | Notes |
|------|--------|-------|
| `node infra/scripts/security-tests.js` | ❌ FAIL | 100 rate-limiting issues; backend not running on port 3001 |
| `node infra/scripts/penetration-tests.js` | ❌ FAIL | 5 issues; backend not running; port 6379 visible |
| `npm audit --audit-level=moderate` | ❌ FAIL | 33 vulnerabilities: 32 moderate, 1 high |

---

## Infrastructure Security

### Docker Configuration
- Read-only containers for apps (`compose.dev.yaml:166`)
- `no-new-privileges` security option (`compose.dev.yaml:167`)
- Resource limits defined (`compose.dev.yaml:170-178`)
- Health checks for services (`compose.dev.yaml:158-163`)

### Kubernetes Hardening (`infra/k8s/production-hardened.yaml`)
- Security context with non-root user
- ReadOnly root filesystem
- Dropped capabilities
- NetworkPolicy restrictions
- HPA (autoscaling)
- PodDisruptionBudget

---

## Unresolved Findings

| Finding | Severity | Status |
|---------|----------|--------|
| Runtime security tests blocked | P0 | Backend not running on port 3001 |
| Penetration test failures | P0 | Backend unavailable |
| Dependency vulnerabilities | P0 | 33 findings (1 high, 32 moderate) |
| RBAC controller coverage unverified | P1 | Guard exists but coverage not audited |

---

## Configuration Issues

| Issue | Location | Required Fix |
|-------|----------|--------------|
| CORS env var mismatch | `.env.production.example` | Change `ALLOWED_ORIGINS` to `CORS_ALLOWED_ORIGINS` |
| Payment secret var mismatch | `.env.production.example`, `.env.staging.example` | Remove `_FILE` suffix; use direct vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, etc. |
| Legacy K8s port mismatch | `k8s/backend-deployment.yaml` | Container port uses 3000; backend listens on 3001 |
| Backend healthcheck path | `compose.dev.yaml` | Uses `/orders/health`; public health is `/health` |
| Grafana provisioning path | `compose.dev.yaml` | Mount path `/etc/grafana/dashboards` vs provisioning path `/etc/grafana/provisioning/dashboards` |

---

## Verification Required

1. Start backend: `cd apps/backend && npm run dev` (port 3001)
2. Run security tests: `node infra/scripts/security-tests.js`
3. Run penetration tests: `node infra/scripts/penetration-tests.js`
4. Audit RBAC coverage on protected controllers
5. Remediate npm audit vulnerabilities

---

*This report reflects verified evidence. Security controls are implemented; runtime validation has not succeeded.*