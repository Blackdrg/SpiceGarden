# Security

## Authentication

### JWT Implementation

The backend uses Passport JWT strategy with NestJS guards.

- **Strategy:** `jwt` (Passport JWT)
- **Guard:** `JwtAuthGuard` extends `AuthGuard('jwt')`
- **Token Delivery:** `access_token` returned in response body, `refresh_token` set as httpOnly cookie
- **Token Refresh:** `POST /auth/refresh-token` reads refresh token from httpOnly cookie
- **Token Validation:** Signature verification with `JWT_SECRET`

### Cookie Security

```typescript
// Access token cookie
httpOnly: true
secure: isProduction
sameSite: 'lax'
maxAge: 60 * 60 * 1000 (1 hour)
path: '/'

// Refresh token cookie
httpOnly: true
secure: isProduction
sameSite: 'lax'
maxAge: sessionDurationDays * 24 * 60 * 60 * 1000
path: '/'
```

### Social Authentication

- **Google OAuth2:** `passport-google-oauth20`
- **Facebook OAuth2:** `passport-facebook`
- **Flow:** OAuth redirect → callback → JWT generation → cookie + redirect

### Password Security

- **Hashing:** Argon2 (primary) and bcrypt (fallback)
- **Minimum Length:** 8 characters (enforced)
- **Validation:** `class-validator` on registration/reset DTOs

### Session Management

- **Session Entity:** Persists refresh tokens with device info
- **Device Tracking:** `UserDeviceEntity`, `DeviceFingerprintEntity`
- **Session Revocation:** `POST /auth/logout` revokes refresh token
- **Duration:** Configurable via `SESSION_DURATION_DAYS` (default: 30 days)

---

## Authorization

### RBAC (Role-Based Access Control)

| Role | Description |
|------|-------------|
| `customer` | End customer |
| `restaurant` | Restaurant owner/staff |
| `kitchen_staff` | Kitchen operations staff |
| `delivery_partner` | Delivery driver |
| `admin` | Platform administrator |
| `super_admin` | Super administrator (bypasses permissions) |
| `support_staff` | Customer support agent |
| `finance_staff` | Finance team member |

### Guards

| Guard | Decorator | Purpose |
|-------|-----------|---------|
| `RolesGuard` | `@Roles()` | Requires specific role(s) |
| `PermissionGuard` | `@Permissions()` | Requires granular permissions |

### Permission Guard Logic

```typescript
if (role === UserRole.SUPER_ADMIN) {
  return true; // Bypass all permission checks
}
// Otherwise, check required permissions via hasRolePermission()
```

### Status Enforcement

Both guards check `user.status === UserStatus.ACTIVE` before granting access. Suspended or inactive accounts are rejected.

---

## CSRF Protection

### Middleware: `CSRFProtectionMiddleware`

```
Ignored paths: /api/webhook, /payments/webhook, /auth/login, /auth/register
```

### Mechanism

- **Token Format:** `{randomBytes}.{base64Payload}` (JSON payload with expiry)
- **Header:** `x-csrf-token`
- **Cookie:** `_csrf` (httpOnly: false, sameSite: strict)
- **Validation (Production):** Header must match cookie, token must not be expired, format must be valid
- **Token Expiry:** 1 hour (3600 seconds)

### Webhook Exemptions

Payment webhooks are exempt from CSRF checks as they use signature verification instead.

---

## CORS Configuration

### Origin Validation

```typescript
// cors-origin.ts
function normalizeOrigin(origin: string): string | null
function getAllowedOrigins(): string[]
function isAllowedOrigin(origin?: string): boolean
```

### Rules

- Origins loaded from `CORS_ALLOWED_ORIGINS` environment variable (comma-separated)
- Wildcards are rejected
- Protocol must be `http:` or `https:`
- Trailing slashes stripped
- Default dev origins: `http://localhost:3002,http://localhost:3003,http://localhost:3004`
- Production must explicitly list all origins

### CORS Headers

```javascript
origin: getAllowedOrigins()
credentials: true
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Idempotency-Key', 'x-csrf-token']
```

---

## Content Security Policy (CSP)

Configured via Helmet in `main.ts`:

```javascript
defaultSrc: ["'self'"]
scriptSrc: ["'self'"]
styleSrc: ["'self'", "'unsafe-inline'"]
imgSrc: ["'self'", 'data:', 'https:']
connectSrc: ["'self'", 'https:']
fontSrc: ["'self'", 'https:', 'data:']
objectSrc: ["'none'"]
frameAncestors: ["'none'"]
upgradeInsecureRequests: ['']
```

### HTTP Strict Transport Security (HSTS)

```javascript
maxAge: 31536000
includeSubDomains: true
preload: true
```

---

## Encryption

### AES Encryption Service

- **Service:** `EncryptionService` (`security/encryption.service.ts`)
- **Key:** `ENCRYPTION_SECRET` environment variable (32 chars required)
- **Usage:** Encrypts sensitive data at rest (PII, payment details)

### Secrets Vault

- **Service:** `VaultService` (`security/vault.service.ts`)
- **Usage:** External secrets vault integration for production

### Secret Loader

- **Service:** `SecretLoaderService` (`infra/secret-loader.service.ts`)
- **Mechanism:** Loads secrets from files (Docker secrets) or environment variables
- **Rotation:** Automatically handles secret rotation without restart

---

## Rate Limiting

### Implementation

- **Library:** `express-rate-limit`
- **Store:** Redis (`RedisRateLimitStore`) with memory fallback
- **Production:** Redis required (`RATE_LIMIT_REDIS_REQUIRED=true`)

### Rate Limiters

| Route Pattern | Window | Max Requests | Skip Success |
|--------------|--------|-------------|-------------|
| `/auth/otp` | 10 min | 3 | No |
| `/auth/*` | 15 min | 5 | Yes |
| `/orders/*` | 15 min | 10 | No |
| `/api/*` | 15 min | 100 | No |

### Redis Store Fallback

```
Redis available → Use Redis store
Redis unavailable → Use process-local memory store (production: error, dev: fallback)
```

### Key Generator

```typescript
`${req.method}:${route}:${ip}`
// route = first 3 path segments joined by ':'
// ip = req.ip || req.socket.remoteAddress || 'unknown'
```

---

## Input Security

### Middleware Stack (Order)

1. `helmet()` — Security headers
2. `csrfProtection()` — CSRF tokens
3. `mongoSanitize()` — MongoDB query injection prevention
4. `hpp()` — HTTP Parameter Pollution prevention
5. `compression()` — Gzip compression
6. Rate limiters — Per-route rate limiting
7. Dangerous method blocker — Blocks TRACE, TRACK, DEBUG, CONNECT
8. JSON body parser — 10kb limit (configurable via `BODY_SIZE_LIMIT`)
9. URL-encoded parser — 10kb limit
10. Request timeout — 30s (configurable via `REQUEST_TIMEOUT_MS`)

### MongoDB Sanitization

Prevents `$where`, `$regex`, and other MongoDB operator injections in request bodies.

### HTTP Parameter Pollution Prevention

Blocks duplicate query parameters (e.g., `?foo=1&foo=2`).

---

## Dependency Security

### npm Audit Results

- **High/Critical:** 0
- **Moderate:** 31 (dev toolchain only)
- **Recommendation:** Address moderate vulnerabilities in dev dependencies

---

## Compliance

### PCI-DSS Validation

- **Service:** `PCIDSSValidationService`
- **Scope:** Payment data handling compliance checks
- **Implementation:** Validation rules and reporting

### SOC2 Readiness

- **Service:** `SOC2ReadinessService`
- **Coverage:** Access control, audit logging, encryption verification

### GDPR/DPDP

- **Service:** `DataPrivacyService`
- **Features:** Deletion requests, data export requests
- **Entities:** `DeletionRequestEntity`, `DataExportRequestEntity`

---

## Production Security Validation

### Startup Checks (`main.ts`)

```typescript
validateProductionEnvironment(configService)
// Validates required secrets are present:
JWT_SECRET, ENCRYPTION_SECRET, DB_HOST, DB_USER, DB_PASS, DB_NAME,
MONGO_URI, REDIS_HOST, REDIS_PORT, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, CORS_ALLOWED_ORIGINS
```

### CORS Production Validation

- Wildcard origins are rejected
- Empty origins are rejected
- Must be comma-separated explicit origins

---

## Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS filter |
| `Strict-Transport-Security` | `max-age=31536000` | HTTPS enforcement |
| `Content-Security-Policy` | (see CSP section) | Resource loading restrictions |

---

## Secrets Management

### Development

- `.env` file with placeholders
- Warning comments on critical secrets (`JWT_SECRET`, `ENCRYPTION_SECRET`, payment keys)

### Production

- Docker secrets mounted as files
- Loaded via `SecretLoaderService`
- File path env vars: `JWT_SECRET_FILE`, `ENCRYPTION_SECRET_FILE`, etc.
- Automatic rotation without restart

### Generation

```bash
# Windows
powershell -File infra/scripts/generate-secrets.ps1

# Linux/macOS
bash infra/scripts/setup-secrets.sh
```
