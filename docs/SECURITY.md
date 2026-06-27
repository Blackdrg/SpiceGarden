# SpiceGarden Security Documentation

**Version:** 0.0.0  
**Last Updated:** 2026-06-27  
**Classification:** Internal — Engineering

---

## Table of Contents

1. [Security Architecture Overview](#security-architecture-overview)
2. [Authentication](#authentication)
3. [Authorization](#authorization)
4. [Transport Security](#transport-security)
5. [Secret Management](#secret-management)
6. [Data Protection](#data-protection)
7. [Input Validation](#input-validation)
8. [Payment Security](#payment-security)
9. [Webhook Security](#webhook-security)
10. [Rate Limiting](#rate-limiting)
11. [CSRF Protection](#csrf-protection)
12. [CORS](#cors)
13. [Content Security Policy](#content-security-policy)
14. [Database Security](#database-security)
15. [Redis Security](#redis-security)
16. [Audit Logging](#audit-logging)
17. [Compliance](#compliance)
18. [Security Checklist](#security-checklist)
19. [Known Issues](#known-issues)

---

## Security Architecture Overview

SpiceGarden implements **defense in depth** across 7 layers:

| Layer | Mechanism | File |
|-------|-----------|------|
| 1 | Helmet CSP + HSTS | `apps/backend/src/main.ts` |
| 2 | CORS strict whitelist | `apps/backend/src/security/cors-origin.ts` |
| 3 | CSRF double-submit cookie | `apps/backend/src/security/csrf.middleware.ts` |
| 4 | Rate limiting (Redis-backed) | `apps/backend/src/security/redis-rate-limit.store.ts` |
| 5 | MongoDB sanitization + HPP | `apps/backend/src/main.ts` |
| 6 | JWT + RBAC + PBAC | `apps/backend/src/security/jwt-auth.guard.ts` |
| 7 | Argon2 password hashing + AES-256 | `apps/backend/src/services/auth/auth.service.ts` + `apps/backend/src/security/encryption.service.ts` |

---

## Authentication

### JWT Authentication
- **Strategy:** Passport JWT (`passport-jwt`)
- **Token Extraction:** From `access_token` cookie OR `Authorization: Bearer` header
- **Guard:** `JwtAuthGuard` (`apps/backend/src/security/jwt-auth.guard.ts`)
- **Expiration:** 60 minutes (configurable via `JWT_EXPIRES_IN`)
- **Secret:** `JWT_SECRET` (required, 32+ chars in production)

### Password Hashing
- **Algorithm:** Argon2 (primary) + bcrypt fallback
- **File:** `apps/backend/src/services/auth/auth.service.ts:37-43`
- `hashPassword()` and `verifyPassword()` with constant-time comparison

### Session Management
- `SessionEntity` tracks: userId, deviceName, deviceType, ipAddress, refreshToken, expiresAt
- Refresh token rotates on each use
- Duration: 30 days (configurable via `SESSION_DURATION_DAYS`)
- Cookie flags: `httpOnly`, `secure` (production), `sameSite: 'lax'`

### OAuth2
- **Google:** `passport-google-oauth20` strategy
- **Facebook:** `passport-facebook` strategy
- Both use `AuthGuard('google')` / `AuthGuard('facebook')`
- Social login merges or creates `UserEntity`, then issues JWT + refresh token

### Password Reset
- Via `PasswordResetService` — generates 6-digit OTP
- Stored in `OtpEntity` with expiration
- Steps: forgot-password → verify-reset-code → reset-password
- Min password length: 8 characters

---

## Authorization

### Role-Based Access Control (RBAC)
**8 roles defined** in `UserRole` enum:

| Role | ID | Permissions |
|------|----|-------------|
| CUSTOMER | `customer` | `orders:read_own`, `orders:create`, `wallet:read_own`, `wallet:transact_own` |
| RESTAURANT | `restaurant` | `restaurants:manage_own`, `orders:manage_assigned`, `kitchen:manage_own`, `menus:manage_own` |
| KITCHEN_STAFF | `kitchen_staff` | `kitchen:manage_own`, `orders:read_assigned` |
| DELIVERY_PARTNER | `delivery_partner` | `deliveries:manage_assigned`, `orders:read_assigned` |
| ADMIN | `admin` | `users:manage`, `restaurants:manage`, `orders:manage`, `payments:manage`, `support:manage`, `analytics:read`, `finance:read`, `notifications:manage`, `compliance:read` |
| SUPER_ADMIN | `super_admin` | `*` (all permissions — bypasses all permission guards) |
| SUPPORT_STAFF | `support_staff` | `support:manage`, `orders:read` |
| FINANCE_STAFF | `finance_staff` | `finance:read`, `payments:read`, `refunds:read` |

### Permission-Based Access Control (PBAC)
- `PermissionGuard` checks `@Permissions()` decorator
- `@Roles()` and `@Permissions()` are class-level decorators applied above controller classes
- SUPER_ADMIN bypasses all `PermissionGuard` checks

### Implementation
```typescript
// apps/backend/src/security/roles.guard.ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
```

```typescript
// apps/backend/src/security/permission.guard.ts
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Permissions('deliveries:manage_assigned')
```

---

## Transport Security

### HTTPS Enforcement
- **Production:** `server.set('trust proxy', 1)` enables HSTS
- **Development:** HTTP on port 3001

### HSTS
```javascript
helmet({
  hsts: {
    maxAge: 31536000,    // 1 year
    includeSubDomains: true,
    preload: true,
  }
})
```

### X-Powered-By Header
- Disabled: `app.disable('x-powered-by')`

### Dangerous HTTP Methods
- `TRACE`, `TRACK`, `DEBUG`, `CONNECT` blocked (405 response)

---

## Secret Management

### Environment Variables
Production secrets **required** and validated on startup:
```typescript
requireSecrets([
  'JWT_SECRET', 'ENCRYPTION_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASS',
  'DB_NAME', 'MONGO_URI', 'REDIS_HOST', 'REDIS_PORT',
  'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET', 'CORS_ALLOWED_ORIGINS'
], configService);
```

`MissingEnvError` thrown if any required secret is unset or is a placeholder value.

### HashiCorp Vault (Optional)
`apps/backend/src/security/vault.service.ts`:
- Optional Vault integration for secrets
- 5-minute cache TTL
- Supports: JWT_SECRET, ENCRYPTION_SECRET, STRIPE_SECRET_KEY, RAZORPAY_KEY_SECRET

### Secrets in Kubernetes
- Stored in `infra/k8s/secrets.yaml`
- Mounted as env vars in production manifests
- `SecretsRotationService` for periodic rotation

---

## Data Protection

### Encryption
- **AES-256** via `crypto-js` for PII fields
- `ENCRYPTION_SECRET` environment variable required in production
- File: `apps/backend/src/security/encryption.service.ts`

### Password Hashing
- **Argon2** (memory-hard algorithm)
- bcrypt fallback available (`bcrypt` package)
- Constant-time comparison via `argon2.verify()`

### Logging Redaction
Custom `sanitizeForLog()` strips sensitive fields from logs:
- Passwords, tokens, secrets, API keys
- Credit cards (number, expiry, CVV/CVC)

---

## Input Validation

### Global Validation Pipe
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,          // strip non-whitelisted properties
  forbidNonWhitelisted: true, // 400 if non-whitelisted props present
  transform: true,           // auto-transform types
}));
```

### MongoDB Sanitization
`express-mongo-sanitize` prevents `$where` injection and operator-based NoSQL injection.

### HPP (HTTP Parameter Pollution)
`hpp()` middleware prevents parameter pollution attacks.

### Body Size Limits
```javascript
express.json({ limit: configService.get('BODY_SIZE_LIMIT', "10kb") })
express.urlencoded({ limit: "10kb", extended: true })
```

---

## Payment Security

### Gateway Security
- **Stripe:** Official SDK v2024-04-10. `stripe-signature` header verification on webhooks
- **Razorpay:** HMAC-SHA256 signature verification on webhooks
- **COD:** Mock implementation with local processing

### Fraud Prevention
`FraudHardeningService` (`apps/backend/src/services/payments/fraud-hardening.service.ts`):
- Risk scoring (0-100) based on velocity, patterns, card type
- Auto-block threshold: `PAYMENT_FRAUD_BLOCK_THRESHOLD` (default 70)
- IP reputation checking
- Card testing detection (small amounts in rapid succession)
- `PaymentFraudFlagEntity` tracks blocked users

### Amount Limits
```env
PAYMENT_MAX_SINGLE_AMOUNT=
PAYMENT_DAILY_LIMIT_PER_USER=
PAYMENT_MAX_TRANSACTIONS_PER_HOUR=
PAYMENT_MIN_AMOUNT=
```

### Idempotency
- `IdempotencyService` — prevents duplicate payment operations
- 5-minute staleness timeout
- Unique constraint on `[key, operation]`

### Retry Logic
- `RetryService` — exponential backoff for payment retries
- `StaleJobCleanup` — periodic cleanup of stale jobs

---

## Webhook Security

### Stripe Webhook
- Controller: `apps/backend/src/services/payments/webhooks/webhook.controller.ts`
- Endpoint: `POST /payments/webhook`
- Verification: `stripe.tools.verifyWebhookSignature()` with `STRIPE_WEBHOOK_SECRET`

### Razorpay Webhook
- HMAC-SHA256 signature verification via `RAZORPAY_WEBHOOK_SECRET`
- `sha.js` for HMAC generation

### Webhook Retry
- `WebhookRetryQueueEntity` with 3 max attempts
- Exponential backoff
- Duplicate detection via `webhookId` unique constraint

---

## Rate Limiting

### Redis-Backed Rate Limiting
`apps/backend/src/security/redis-rate-limit.store.ts`:
- Implements `express-rate-limit` `Store` interface
- Prefix: `spicegarden:ratelimit`
- Memory fallback in development (`fallbackToMemory: true`)

### Per-Route Limits

| Route | Max Requests | Window |
|-------|-------------|--------|
| `/auth/otp` | 3 | 10 minutes |
| `/auth/` | 5 | 15 minutes |
| `/orders` | 10 | 15 minutes |
| `/api/` | 100 | 15 minutes |

### Configuration
```env
RATE_LIMIT_AUTH_OTP_MAX=3
RATE_LIMIT_AUTH_OTP_WINDOW_MS=600000
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_ORDERS_MAX=10
RATE_LIMIT_ORDERS_WINDOW_MS=900000
RATE_LIMIT_API_MAX=100
RATE_LIMIT_API_WINDOW_MS=900000
RATE_LIMIT_REDIS_REQUIRED=false  # dev fallback
```

---

## CSRF Protection

**File:** `apps/backend/src/security/csrf.middleware.ts`

- **Pattern:** Double-submit cookie
- **Mechanism:**
  1. Server generates 32-byte random token
  2. Sets token as non-HttpOnly cookie
  3. Client must send token in `x-csrf-token` header
  4. Server validates cookie ↔ header match
- **Enforcement:** Production only
- **Ignored endpoints:** Safe methods (GET, HEAD, OPTIONS), webhooks, auth callbacks
- **Token expiration:** Validated via JWT-style payload parsing

---

## CORS

**File:** `apps/backend/src/security/cors-origin.ts`

```javascript
app.enableCors({
  origin: getAllowedOrigins(),   // strict whitelist, no wildcards
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-Id',
    'Idempotency-Key',
    'x-csrf-token'
  ],
})
```

**Allowed origins** come from `CORS_ALLOWED_ORIGINS` env var (comma-separated list).  
**Production validation** rejects wildcards and localhost ranges.

---

## Content Security Policy

**File:** `apps/backend/src/main.ts:200-219`

```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    }
  }
})
```

---

## Database Security

- **Connection pooling:** No explicit pool settings (relies on default TypeORM pool)
- **Credentials in env files:** `apps/backend/.env`, `compose.dev.yaml` (dev credentials differ from production)
- **Hardcoded fallbacks in `db.module.ts`:** `spicegarden` / `spicegarden_dev` (only for local SQLite)
- **SQL injection protection:** All queries use TypeORM parameterized queries (no raw string concatenation)
- **Audit logging:** All sensitive actions logged with user, IP, metadata

---

## Redis Security

- **Authentication:** `REDIS_PASSWORD` env var
- **K8s NetworkPolicy:** Restricted Redis access (internal only)
- **Rate limit prefix namespacing:** `spicegarden:{namespace}`
- **Memory safety:** Graceful fallback when Redis unavailable (no crashes)

---

## Audit Logging

**File:** `apps/backend/src/audit/audit.service.ts`

Captures:
- Action performed
- Performed by (userId, indexed)
- Entity type + entity ID
- Metadata (jsonb)
- IP address and user agent

Specialized audit methods:
- `logAuthEvent()` — login, logout, token refresh
- `logPaymentEvent()` — payment intents, confirmations, refunds
- `logWalletEvent()` — wallet transactions

---

## Compliance

### GDPR / DPDP
- `DeletionRequestEntity` — right to erasure with `scheduledDeletionDate`
- `DataExportRequestEntity` — data portability with export format/URL
- Both entities have uniqueness on `userId`

### SOC2 Readiness
- `soc2-readiness.service.ts` — compliance validation
- `audit.service.ts` — comprehensive audit trail
- `secrets-rotation.service.ts` — periodic secret rotation

### PCI-DSS
- `pci-dss-validation.service.ts` — validation service
- Payment data never stored (only Stripe/Razorpay payment intent IDs)
- Webhook signature verification ensures data integrity
- No credit card numbers stored in database

---

## Security Checklist

| Control | Status | Notes |
|---------|--------|-------|
| JWT authentication | ✅ | With refresh token rotation |
| Argon2 password hashing | ✅ | In auth service |
| CSRF protection | ✅ | Double-submit cookie pattern |
| CORS whitelist | ✅ | No wildcards in production |
| HSTS (1 year) | ✅ | Production only |
| CSP configured | ✅ | Strict policy |
| Rate limiting | ✅ | Redis-backed with memory fallback |
| Input validation | ✅ | Global `ValidationPipe` with whitelist |
| MongoDB sanitization | ✅ | NoSQL injection prevention |
| HPP protection | ✅ | Parameter pollution prevention |
| Encryption at rest | ✅ | AES-256 for PII |
| Audit logging | ✅ | All actions tracked |
| Secrets validation | ✅ | Production startup check |
| Webhook signature | ✅ | Stripe + Razorpay |
| Payment fraud detection | ✅ | Velocity, patterns, card testing |
| Idempotency keys | ✅ | 5-min staleness |
| GDPR erasure | ✅ | Scheduled deletion |
| Data export portability | ✅ | Multiple formats |
| K8s security context | ✅ | `runAsNonRoot`, read-only filesystem |
| NetworkPolicy | ✅ | Restrictive K8s defaults |

---

## Known Issues

1. **COD Logic Error:** In `wallet.service.ts:236-238`, COD collection credits the wallet instead of debiting it. This appears to be an inverted logic.

2. **APNs JWT Generation:** Uses `jsonwebtoken.sign` with ES256 algorithm; private key validated as string literal without format verification.

3. **Memory Fallback for Rate Limiting:** In distributed production with multiple pods, the in-memory fallback only limits locally, not globally. Production should use `RATE_LIMIT_REDIS_REQUIRED=true`.

4. **No Webhook IP Allowlisting:** Webhook endpoints rely solely on signature verification. No additional IP-range restriction for Stripe/Razorpay.

5. **Simple OTP:** Password reset uses 6-digit OTP without per-user rate limiting on the reset endpoint specifically (rate limited at `/auth/` bucket).

6. **`synchronize: true`:** TypeORM auto-sync schema at startup. This is safe in development but should be disabled in production to prevent data loss.

7. **`trust proxy`:** Set to `true` in production only. If load balancer IP is not trusted, `req.ip` may return incorrect values.

8. **Hardcoded API URLs:** Frontend apps use `http://localhost:3001` in shared constants. `packages/shared/constants.ts` has `API_URL = 'http://localhost:3001'`.
