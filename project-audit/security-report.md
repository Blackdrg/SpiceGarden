# SpiceGarden Security Audit Report

Generated: 2026-07-04
Evidence source: Direct inspection of apps/backend/src/security/, main.ts, and auth flows

## 1. Security Architecture Overview

The backend implements a defense-in-depth security model with multiple layers:

| Layer | Implementation | File |
|-------|---------------|------|
| Transport | Helmet (CSP, HSTS), HTTPS enforcement | main.ts:203-222 |
| Network | CORS origin validation, rate limiting | main.ts:196-201, 127-135 |
| Application | CSRF, HPP, Mongo sanitize, body size limits | main.ts:224-228, 238-239 |
| Authentication | JWT + OAuth (Google, Facebook) | security/jwt-auth.guard.ts, auth.controller.ts |
| Authorization | RBAC with 8 roles + granular permissions | security/roles.guard.ts, security/permission.guard.ts |
| Data | AES-256-GCM encryption, PII masking | security/encryption.service.ts |
| Secrets | Vault integration + local secret loader | security/vault.service.ts, infra/secret-loader.service.ts |
| Monitoring | Sentry error tracking, Prometheus metrics | main.ts:148-157, 250-267 |

## 2. Authentication Implementation

### 2.1 JWT Authentication
**File:** `apps/backend/src/security/jwt-auth.guard.ts`
- Extends `AuthGuard('jwt')`
- Passport JWT strategy for token validation
- Tokens stored in httpOnly cookies (access_token: 1h, refresh_token: 30 days)
- Refresh token rotation on each use

### 2.2 OAuth Integration
**File:** `apps/backend/src/services/auth/auth.controller.ts`

| Provider | Routes | Implementation |
|----------|--------|---------------|
| Google | `/auth/google`, `/auth/google/callback` | passport-google-oauth20 |
| Facebook | `/auth/facebook`, `/auth/facebook/callback` | passport-facebook |

OAuth callbacks:
- Exchange social token for access/refresh tokens
- Set httpOnly cookies
- Redirect to frontend with tokens

### 2.3 Password Security
- **Primary**: Argon2 (argon2@^0.40.0)
- **Fallback**: bcrypt (bcrypt@^6.0.0)
- **Reset flow**: Email-based with OTP code
- **Minimum password length**: 8 characters (enforced in auth.controller.ts:201)

### 2.4 Session Management
**File:** `apps/backend/src/db/entities/session.entity.ts`
- Sessions stored in database with device info
- Refresh token stored in session
- Session revocation on logout
- Session expiry tracked

## 3. Authorization Implementation

### 3.1 Role-Based Access Control
**File:** `apps/backend/src/security/roles.guard.ts`

| Role | Description |
|------|-------------|
| customer | End user placing orders |
| restaurant | Restaurant owner/manager |
| kitchen_staff | Kitchen operations staff |
| delivery_partner | Delivery driver |
| admin | Platform administrator |
| super_admin | Full platform access |
| support_staff | Customer support |
| finance_staff | Financial operations |

### 3.2 Permission-Based Access Control
**File:** `apps/backend/src/security/permissions.ts`

| Role | Permissions |
|------|-------------|
| customer | orders:read_own, orders:create, wallet:read_own, wallet:transact_own |
| restaurant | restaurants:manage_own, orders:manage_assigned, kitchen:manage_own, menus:manage_own |
| kitchen_staff | kitchen:manage_own, orders:read_assigned |
| delivery_partner | deliveries:manage_assigned, orders:read_assigned |
| admin | users:manage, restaurants:manage, orders:manage, payments:manage, support:manage, analytics:read, finance:read, notifications:manage, compliance:read |
| super_admin | `*` (all permissions) |
| support_staff | support:manage, orders:read |
| finance_staff | finance:read, payments:read, refunds:read |

**File:** `apps/backend/src/security/permission.guard.ts`
- Merges handler + class level permissions
- Super admin bypass
- Requires active user status

## 4. Input Validation

### 4.1 Global ValidationPipe
**File:** `apps/backend/src/main.ts:271-277`
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
)
```

### 4.2 Class Validator
- Used throughout DTOs and entities
- Decorators: @IsString, @IsEmail, @IsNumber, @IsEnum, @Length, @Min, @Max
- Enforced at controller level via ValidationPipe

## 5. Encryption

### 5.1 AES-256-GCM Encryption
**File:** `apps/backend/src/security/encryption.service.ts`
- Key derivation: scrypt (32 bytes)
- Methods:
  - `encrypt(text)` → returns iv.ciphertext.authtag (base64)
  - `decrypt(payload)` → returns plaintext
  - `encryptPiiFields(obj, fields[])` → encrypts specified fields
  - `decryptPiiFields(obj, fields[])` → decrypts specified fields

### 5.2 PII Field Encryption
- Applied to: email, phone, and other sensitive fields
- Compliance: GDPR, DPDP requirements

## 6. CSRF Protection

**File:** `apps/backend/src/security/csrf.middleware.ts`
- Cookie-based CSRF token
- Header validation: `x-csrf-token`
- Token format: base64.randombytes.base64({exp:timestamp})
- Cookie: httpOnly=false, sameSite=strict, secure in prod
- Ignores paths: `/api/webhook`, `/payments/webhook`, `/auth/login`, `/auth/register`

## 7. Rate Limiting

**File:** `apps/backend/src/main.ts:127-135`

| Namespace | Limit | Window | Skip Successful |
|-----------|-------|--------|----------------|
| AUTH_OTP | 3 requests | 10 minutes | No |
| AUTH | 5 requests | 15 minutes | Yes |
| ORDERS | 10 requests | 15 minutes | No |
| API | 100 requests | 15 minutes | No |

**Store:** Redis-backed with in-memory fallback (RedisRateLimitStore)

## 8. CORS Configuration

**File:** `apps/backend/src/security/cors-origin.ts`
- Production: explicit comma-separated origins only
- No wildcards allowed in production
- Development: defaults to localhost:3002,3003,3004
- Credentials: true
- Allowed headers: Content-Type, Authorization, X-Request-Id, Idempotency-Key, x-csrf-token
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS

## 9. Security Headers

**File:** `apps/backend/src/main.ts:203-222`

| Header | Value |
|--------|-------|
| Content-Security-Policy | default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' https: data:; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests |
| Strict-Transport-Security | max-age=31536000, includeSubDomains, preload |
| X-Powered-By | Disabled (`app.disable('x-powered-by')`) |

## 10. Method Restriction

**File:** `apps/backend/src/main.ts:230-236`
- Blocks: TRACE, TRACK, DEBUG, CONNECT
- Returns: 405 Method Not Allowed

## 11. Mongo Sanitization

**File:** `apps/backend/src/main.ts:160-192`
- express-mongo-sanitize with Express compatibility wrapper
- Sanitizes req.body, req.params, req.query
- Fallback for "Cannot set property" error

## 12. Secrets Management

### 12.1 Local Secret Loader
**File:** `apps/backend/src/infra/secret-loader.service.ts`
- Loads 18 secrets from `secrets/` directory
- Secret mappings: jwt_secret, encryption_secret, stripe_secret, razorpay_keys, etc.
- Supports `*_FILE` suffix for Docker secrets

### 12.2 Vault Integration
**File:** `apps/backend/src/security/vault.service.ts`
- Optional Vault integration (VAULT_ENABLED flag)
- 5-min cache for secrets
- Secret rotation support
- Fallback to local secrets if Vault disabled

## 13. Payment Security

### 13.1 Webhook Verification
**File:** `apps/backend/src/services/payments/webhook/webhook.controller.ts`
- Stripe: stripe-signature header verification
- Razorpay: x-razorpay-signature header verification
- Raw body required for signature validation

### 13.2 Fraud Detection
- Payment fraud flags in PaymentFraudFlagEntity
- FraudHardeningService integration in PaymentsController
- Risk scoring and blocking

### 13.3 Idempotency
- IdempotencyEntity for preventing duplicate payments
- Idempotency-Key header support
- Duplicate detection and response caching

## 14. Compliance Features

### 14.1 GDPR/DPDP
**File:** `apps/backend/src/compliance/compliance.controller.ts`
- Data export endpoints
- Deletion request endpoints
- Right to be forgotten
- Right to data portability
- Cancellation window (24 hours)

### 14.2 SOC2
- SOC2 readiness assessment
- Evidence report generation
- Trust services criteria evaluation

### 14.3 PCI-DSS
- PCI-DSS compliance status
- Payment flow validation
- SAQ metrics

### 14.4 Data Retention
- Retention statistics
- Policy application
- Audit logging

## 15. Security Gaps

| Gap | Severity | Evidence |
|------|----------|----------|
| No OpenAPI/Swagger UI accessible | Medium | No route registered for /api/docs |
| No API versioning | Medium | All routes under single namespace |
| Some controllers use untyped `any` for bodies | Medium | Multiple controllers |
| CSRF cookie httpOnly=false | Low | csrf.middleware.ts |
| No password complexity requirements | Low | auth.controller.ts only checks length ≥8 |
| No account lockout after failed login | Medium | No brute force protection beyond rate limiting |
| No email verification enforcement | Low | Users can register without verified email |
| No 2FA/MFA support | Medium | Only OTP for password reset, not login |
| No security.txt endpoint | Low | No /.well-known/security.txt |
| No Content-Type sniffing protection | Low | No X-Content-Type-Options: nosniff |
| No Referrer-Policy header | Low | Not in helmet config |
| No Permissions-Policy header | Low | Not in helmet config |
| No request ID/tracing correlation | Low | No X-Request-Id middleware |
| No response caching headers | Low | No Cache-Control on API responses |
| gRPC security not implemented | Low | Placeholder controllers only |