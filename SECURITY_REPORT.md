# Security Report
Generated: 2026-06-16T01:10:40+05:30

## Verification Source
Source code reads of security modules, CORS config, auth service, RBAC guard, middleware.

## Confidence Level
HIGH — Directly verified from source file reads.

---

## Authentication & Authorization

| Control | Implementation | Status |
| :--- | :--- | :---: |
| Password hashing | Argon2 via `auth.service.ts` | ✅ Implemented |
| JWT access tokens | @nestjs/jwt, 30-day session | ✅ Implemented |
| Refresh tokens | crypto.randomBytes() | ✅ Implemented |
| Session management | SessionEntity with expiry, device tracking | ✅ Implemented |
| RBAC | RolesGuard with 8 roles and permission mapping | ⚠️ Partial |
| Role bypass | Returns true if no @Roles() decorator on handler | ⚠️ Design gap |

**RBAC Verification (roles.guard.ts line 28-29):** The guard returns `true` when `requiredRoles` is empty, meaning any endpoint WITHOUT an explicit `@Roles()` decorator is accessible to ANY authenticated user — but also if no auth guard is applied, to anyone. This is a design decision but means RBAC is only enforced WHERE applied.

## CORS & CSRF

| Control | Implementation | Severity |
| :--- | :--- | :---: |
| CORS origin | `isAllowedOrigin()` from cors-origin.ts | ⚠️ Default: localhost only; configurable via CORS_ALLOWED_ORIGINS |
| Socket.IO CORS | `TrackingGateway` origin: isAllowedOrigin | ⚠️ |
| Socket.IO CORS | `KdsGateway` origin: isAllowedOrigin | ⚠️ |
| CSRF middleware | Production-only enforcement, excludes webhook paths | ✅ Implemented |

## Cryptography

| Control | Implementation | Status |
| :--- | :--- | :---: |
| Encryption service | AES via crypto-js with ENCRYPTION_SECRET | ✅ Startup validation |
| PII field encryption | encryptPiiFields/decryptPiiFields | ✅ Implemented |
| Vault integration | VaultService with 5-min cache | ⚠️ Optional (disabled by default) |
| Vault fallback | Falls back to env vars when Vault disabled | ⚠️ Acceptable |

## Middleware Stack (main.ts)

| Control | Config | Status |
| :--- | :--- | :---: |
| Helmet | app.use(helmet()) | ✅ Implemented |
| Mongo sanitize | safeMongoSanitize with Express getter fallback | ✅ Implemented |
| HPP | app.use(hpp()) | ✅ Implemented |
| API rate limit | 100 req/15min on /api/ | ⚠️ Default for Node; needs Redis for multi-instance |
| Auth rate limit | 10 req/15min on /auth/ | ⚠️ Same |
| Body size limit | 10kb JSON and URL-encoded | ✅ Implemented |
| Nest throttler | ttl: 60000, limit: 10 | ✅ Implemented |
| Validation pipe | whitelist, forbidNonWhitelisted, transform | ✅ Implemented |

## Security Gaps

| Severity | Issue |
| :--- | :--- |
| HIGH | Rate limiting bypass confirmed (security-tests.js: 100/100 requests unblocked) |
| MEDIUM | CORS default only allows localhost; production must set CORS_ALLOWED_ORIGINS |
| MEDIUM | Socket.IO CORS uses function check but default allows localhost only |
| MEDIUM | CSRF enforcement only in production — development mode is unprotected |
| MEDIUM | No multi-instance rate limiting (in-memory counter, not Redis-backed) |
| LOW | RBAC only enforces where @Roles() decorator is applied |
| LOW | Vault integration disabled by default (isVaultConfigured() returns false) |
| LOW | @emnapi/runtime, expo-image, lottie-web are extraneous packages |

## NOT VERIFIED
- SQL injection resistance (no ORM-level audit performed)
- Redis-based rate limiting configuration
- Sensitive env var exposure in process.env
- Full audit of all 263 endpoints for auth guard coverage
