# Security

## Security Posture

SpiceGarden implements defense-in-depth security across 12 distinct layers. All security controls are active by default in production and verified through automated tests.

## Security Layers

### 1. Helmet - Content Security Policy & Security Headers

**File:** `apps/backend/src/main.ts:213-232`

```typescript
app.use(helmet({
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
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

**Features:**
- Strict CSP with no inline scripts (except styles)
- HSTS with 1-year max-age, include subdomains, preload
- `frame-ancestors: 'none'` prevents clickjacking

### 2. CORS - Cross-Origin Resource Sharing

**File:** `apps/backend/src/security/cors-origin.ts`

- Strict origin whitelist with allowlist validation
- No wildcards in production (enforced by `MissingEnvError`)
- Allowed headers: Content-Type, Authorization, X-Request-Id, Idempotency-Key, x-csrf-token
- Credentials allowed

### 3. CSRF Protection

**File:** `apps/backend/src/security/csrf.middleware.ts`

- Double-submit cookie pattern
- Token validation on state-changing requests

### 4. HPP - HTTP Parameter Pollution

**File:** `apps/backend/src/main.ts:235`

- Express HPP middleware globally applied
- Protects against parameter pollution attacks

### 5. Mongo Sanitization

**File:** `apps/backend/src/main.ts:170-202`

- Custom middleware wrapping `express-mongo-sanitize`
- Handles Express compatibility issues with fallback sanitization
- Sanitizes `req.body`, `req.params`, `req.query`

### 6. Rate Limiting

**File:** `apps/backend/src/main.ts:135-143`

Redis-backed rate limiters per route pattern:

| Route | Max | Window |
|-------|-----|--------|
| `/auth/otp` | 3 | 10 min |
| `/auth/` | 5 | 15 min |
| `/orders` | 10 | 15 min |
| `/api/` | 100 | 15 min |

Disable via `LOAD_TEST_MODE=true` in non-production.

### 7. NestJS Throttler

**File:** `apps/backend/src/security/security.module.ts:17-20`

- Global throttle at module level
- Default: 10 requests per minute
- Load test mode: unlimited

### 8. HTTP Method Blocking

**File:** `apps/backend/src/main.ts:238-243`

Blocks dangerous HTTP methods:
- `TRACE`
- `TRACK`
- `DEBUG`
- `CONNECT`

### 9. Password Hashing

**Library:** argon2 (^0.40.0) + bcrypt (^6.0.0)

File: `apps/backend/src/services/auth/auth.service.ts`
- Argon2 primary hashing algorithm
- Bcrypt fallback available

### 10. AES-256 PII Encryption

**File:** `apps/backend/src/security/encryption.service.ts`

- Sensitive fields encrypted at rest
- 256-bit AES encryption
- Env var controlled secret

### 11. Secret Vault

**File:** `apps/backend/src/infra/secret-loader.service.ts`

- Secure secret loading from environment
- Fallback to vault service
- Production validation at bootstrap

### 12. Roles & Permissions (RBAC + PBAC)

**File:** `apps/backend/src/security/permissions.ts`

8 roles with granular permissions:

| Role | Permissions |
|------|-------------|
| `customer` | orders:read_own, orders:create, wallet:read_own, wallet:transact_own |
| `restaurant` | restaurants:manage_own, orders:manage_assigned, kitchen:manage_own, menus:manage_own |
| `kitchen_staff` | kitchen:manage_own, orders:read_assigned |
| `delivery_partner` | deliveries:manage_assigned, orders:read_assigned |
| `admin` | users:manage, restaurants:manage, orders:manage, payments:manage, support:manage, analytics:read, finance:read, notifications:manage, compliance:read |
| `super_admin` | `*` (all permissions) |
| `support_staff` | support:manage, orders:read |
| `finance_staff` | finance:read, payments:read, refunds:read |

**Enforcement:** `RolesGuard` + `PermissionGuard` + `@Roles()` + `@Permissions()` decorators

### 13. Device Fingerprinting

**File:** `apps/backend/src/db/entities/device-fingerprint.entity.ts`

- Device fingerprinting for fraud detection
- Session correlation

### 14. WebSocket Security

**File:** `apps/backend/src/infra/tracking/tracking.gateway.ts`

- Origin validation via `isAllowedOrigin()`
- Connection rate limiting (10 per minute per IP)
- Max HTTP buffer: 1024 bytes
- Room name regex validation: `^[a-zA-Z0-9:_-]{1,128}$`
- Driver ID regex validation: `^[a-zA-Z0-9_-]{1,128}$`
- Coordinate validation: lat [-90, 90], lng [-180, 180]

## Security Tests

**File:** `infra/scripts/security-tests.js`

Verified:
- SQL injection protection
- XSS protection
- Rate limiting enforcement
- Authentication bypass prevention
- Path traversal prevention
- CORS enforcement

**Result:** 0 vulnerabilities detected (verified via test output)

**File:** `infra/scripts/penetration-tests.js`

Verified:
- Port scan resistance
- Security headers validation
- CORS configuration
- HTTP method restrictions
- TLS configuration

**Result:** 0 issues detected

## Compliance

### GDPR/DPDP

**Module:** `src/compliance/`

Features:
- Data export request processing (`data-export-request.entity.ts`)
- Data deletion request processing (`deletion-request.entity.ts`)
- Privacy API endpoints

### PCI-DSS

Payment handling complies with PCI-DSS requirements through:
- Stripe/Razorpay tokenization (no raw card data stored)
- Webhook signature verification
- Idempotency keys
- Audit logging of all payment events

### SOC2

- Comprehensive audit logging (`audit-log.entity.ts`)
- MFA support (device tracking)
- Secrets rotation infrastructure
- Encryption at rest and in transit

## Production Environment Validation

**File:** `apps/backend/src/main.ts:56-86`

At bootstrap, production environment validates presence of:

```typescript
requireSecrets([
  'JWT_SECRET',
  'ENCRYPTION_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_PASS',
  'DB_NAME',
  'MONGO_URI',
  'REDIS_HOST',
  'REDIS_PORT',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'CORS_ALLOWED_ORIGINS',
], configService);
```

Also validates:
- No wildcards in `CORS_ALLOWED_ORIGINS`
- Required secrets are non-empty strings

## Security Headers

| Header | Value |
|--------|-------|
| Content-Security-Policy | default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' https: data:; object-src 'none'; frame-ancestors 'none' |
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload |
| X-Content-Type-Options | nosniff (via Helmet) |
| X-Frame-Options | DENY (via frame-ancestors: 'none') |
| X-XSS-Protection | 1; mode=block (via Helmet) |
| Referrer-Policy | no-referrer (via Helmet) |

## Authorization Flow

1. **JWT Token Validation** - `JwtAuthGuard` extracts and validates Bearer token
2. **Role Check** - `RolesGuard` validates user role against `@Roles()` decorator
3. **Permission Check** - `PermissionGuard` validates specific permissions via `@Permissions()` decorator
4. **Inheritance Check** - `hasRolePermission()` checks role ownership against resource

**Source:** `apps/backend/src/security/roles.guard.ts`, `apps/backend/src/security/permission.guard.ts`

## Known Security Considerations

1. **react/inline-style-prop ESLint rule missing definition** - 2 frontend files have this lint error, indicating incomplete ESLint configuration
2. **npm audit: 31 moderate vulnerabilities** (0 high/critical) - All in dev toolchain (jest, js-yaml, uuid via sockjs/xcode)
3. **Socket.IO JSON buffer limit** - Default 1024 bytes may be insufficient for large payloads
4. **gRPC transport quarantined** - No active gRPC security surface
5. **Redis rate limit fallback** - In non-production, rate limiting falls back to in-memory if Redis unavailable
