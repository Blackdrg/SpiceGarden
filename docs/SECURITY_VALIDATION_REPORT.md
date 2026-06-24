# Security Validation Report

**Date:** 2026-06-23

---

## Security Controls in Code

**Source:** `apps/backend/src/main.ts:215-246`

| Control | Implementation | Status |
| ------- | -------------- | ------ |
| Helmet | CSP, HSTS, frameguard | Implemented in code |
| HPP | HTTP Parameter Pollution protection | Implemented in code |
| Mongo sanitization | `express-mongo-sanitize` | Implemented in code |
| CORS allow-list | `getAllowedOrigins()` | Implemented in code |
| Rate limiting | Redis-backed with memory fallback | Implemented in code |
| CSRF protection | Custom middleware | Implemented in code |
| Dangerous method blocking | TRACE/TRACK/DEBUG/CONNECT → 405 | Implemented in code |
| Password hashing | Argon2/Bcrypt | Implemented in code |

---

## Dependency Audit

**Command:** `npm audit --audit-level=moderate`

```
31 moderate severity vulnerabilities
0 high severity
0 critical severity
```

**Top vulnerabilities:**
- `js-yaml` ≤4.1.1 — DoS via merge key (dev toolchain only)
- `uuid` <11.1.1 — Buffer bounds check (transitive from webpack-dev-server)

**Impact:** Dev toolchain only. No production runtime dependencies flagged.

---

## Runtime Security Tests

| Test | Status | Reason |
| ---- | ------ | ------ |
| Security tests | Blocked | Requires running backend: `node infra/scripts/security-tests.js` |
| Penetration tests | Blocked | Requires running backend: `node infra/scripts/penetration-tests.js` |

**Evidence:** Backend not running on port 3001 in current environment.

---

## Secret Validation

**Command:** `node infra/scripts/validate-secrets.js`

```
Valid: 3/16 secrets
Warnings: 13
Critical missing: 0
```

**Valid secrets:**
- `jwt_secret` — 44 chars
- `encryption_secret` — 90 chars
- `db_password` — 44 chars

**Missing/Insecure:**
- `stripe_secret`, `stripe_webhook_secret` — insecure length
- `razorpay_*` — insecure length or missing
- `fcm_server_key`, `apns_*`, `sendgrid_api_key`, `google_maps_api_key`, `twilio_*` — insecure/incomplete

---

## Security Headers

The penetration test script checks for:
- `strict-transport-security`
- `content-security-policy`
- `x-content-type-options`
- `x-frame-options`
- `x-xss-protection`

**Status:** Configured in Helmet (`apps/backend/src/main.ts:215-228`) but runtime validation blocked.