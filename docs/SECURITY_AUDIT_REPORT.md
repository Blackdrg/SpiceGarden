> HISTORICAL DOCUMENT
> This report reflects a prior audit state and is superseded by:
> `docs/CANONICAL_PROJECT_STATE_2026-06-20.md`
> and the latest README / status reports.

# SECURITY AUDIT REPORT

**Audit Date:** 2026-06-20  
**Prepared By:** Kilo AI Engineering  
**Scope:** Backend security controls, infrastructure

---

## Verification Matrix

| Control | Status | Evidence Source |
|---------|--------|-----------------|
| Backend build | ✅ Verified | `tsc -p tsconfig.build.json` |
| Backend lint | ✅ Verified | `eslint .` |
| Auth endpoints | ✅ Verified | auth.controller.ts |
| Rate limiting | ✅ Verified | main.ts:136-144 |
| Helmet | ✅ Verified | main.ts:215 |
| HPP | ✅ Verified | main.ts:237 |
| NoSQL sanitization | ✅ Verified | main.ts:172-204 |
| CSRF | ✅ Verified | main.ts:235 |

---

## Authentication & Authorization

### JWT Security
- **Status:** ✅ Verified
- **Evidence:** `apps/backend/src/services/auth/auth.module.ts`
- `ignoreExpiration: false` enforced
- Refresh tokens use `crypto.randomBytes()`

### RBAC Implementation
- **Status:** ⚠️ Partial (guard exists, coverage unverified)
- **Evidence:** `apps/backend/src/security/roles.guard.ts`

### Known Issues
- Security tests blocked (backend not running)
- Penetration tests blocked (backend not running)

---

## Input Validation & Injection Prevention

### SQL Injection
- ✅ TypeORM parameterized queries

### NoSQL Injection
- ✅ MongoDB sanitization middleware (`express-mongo-sanitize`)

### XSS Prevention
- ✅ React automatic escaping

### HTTP Method Filtering
- ✅ Dangerous methods blocked (TRACE, TRACK, DEBUG, CONNECT)

---

## Rate Limiting & DoS Protection

### Configuration (verified in main.ts)
| Endpoint | Window | Max |
|----------|--------|-----|
| `/auth/otp` | 10 min | 3 |
| `/auth/` | 15 min | 5 |
| `/orders` | 15 min | 10 |
| `/api/` | 15 min | 100 |

### DoS Protections
- Body size limit: 10kb default
- Memory fallback for Redis rate limiter

---

## CORS & Network Security

- `getAllowedOrigins()` helper implemented
- Credentials enabled for whitelisted origins
- Methods restricted to standard HTTP verbs

---

## Data Protection

### Encryption
- AES-256 via `crypto-js` (`encryption.service.ts`)
- Secret validation on startup

### Passwords
- Argon2 hashing (`package.json:42`)

### Sensitive Data
- JWT secrets validated (`main.ts:57-78`)
- No card data stored locally

---

## Infrastructure Security

### Docker Compose
- Read-only containers configured (`compose.dev.yaml:166`)
- `no-new-privileges` security option (`compose.dev.yaml:167`)
- Health checks defined
- Network isolation (`spicegarden-net`)

### Kubernetes
- `production-hardened.yaml` includes:
  - Security context
  - ReadOnly root filesystem
  - NetworkPolicy
  - HPA

---

## Security Tests

| Test | Status | Notes |
|------|--------|-------|
| `infra/scripts/security-tests.js` | ⏳ Blocked | Requires backend |
| `infra/scripts/penetration-tests.js` | ⏳ Blocked | Requires backend |
| `npm audit` | ⏠ Pending | Not run in this audit |

---

## Recommendations

1. Start infrastructure: `docker-compose -f compose.dev.yaml up -d`
2. Run security tests: `node infra/scripts/security-tests.js`
3. Run penetration tests: `node infra/scripts/penetration-tests.js`
4. Audit RBAC on protected controllers

---

*This report reflects verified evidence only. Unverified claims are marked accordingly.*