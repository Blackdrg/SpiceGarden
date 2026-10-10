# Security Architecture Report

## Executive Summary

SpiceGarden implements a defense-in-depth security architecture with Helmet CSP, CSRF protection, Argon2 password hashing, JWT authentication, RBAC with 8 roles, rate limiting, and compliance controls for SOC2, PCI-DSS, and GDPR.

**Key Facts (verified from source code):**
- Authentication: Argon2 + JWT with 30-day session duration
- Authorization: 8 roles with granular permissions matrix
- Rate Limiting: Per-endpoint limits (3-100 req/15min)
- PCI-DSS: Card data never touches servers (tokenization only)
- Compliance endpoints: SOC2, PCI-DSS, GDPR export/deletion

---

## 1. Security Middleware & HTTP Protection

**File:** `apps/backend/src/main.ts`

### Headers & Middleware
- **Helmet CSP**: `default-src 'self'`, `script-src 'self'`, `frame-ancestors 'none'` (lines 213-226)
- **HSTS**: `max-age=31536000`, `includeSubDomains`, `preload` (lines 227-232)
- **CSRF Protection**: `csrfProtection()` applied globally (line 233)
- **MongoDB Sanitization**: `express-mongo-sanitize` with custom compatibility (lines 168-202)
- **HPP**: HTTP Parameter Pollution protection (line 235)
- **Dangerous Methods Block**: TRACE, TRACK, DEBUG, CONNECT blocked (lines 238-244)
- **Body Limit**: 10kb (lines 246-247)

### Production Environment Validation (lines 56-86)
Required secrets validated at bootstrap:
- `JWT_SECRET`, `ENCRYPTION_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `CORS_ALLOWED_ORIGINS`

### Rate Limiting Configuration (lines 113-143)
| Endpoint Pattern | Limit | Window |
|-----------------|-------|--------|
| `/auth/otp` | 3 req | 10 min |
| `/auth/` | 5 req | 15 min (skip successful) |
| `/orders` | 10 req | 15 min |
| `/api/` | 100 req | 15 min |

---

## 2. Authentication

### JWT Authentication Guard
**File:** `apps/backend/src/security/jwt-auth.guard.ts`
- Extends `AuthGuard('jwt')` using Passport JWT strategy

### JWT Strategy
**File:** `apps/backend/src/services/auth/strategies/jwt.strategy.ts`
- Extracts JWT from `Authorization: Bearer` header (line 33)
- Requires `JWT_SECRET` from config (lines 24-36)
- JWT expiration enforced (`ignoreExpiration: false`) (line 34)

### Authentication Service
**File:** `apps/backend/src/services/auth/auth.service.ts`
- **Password Hashing**: Argon2 (line 37)
- **Password Verification**: Argon2 (line 41)
- **Session Management**: Creates sessions with device info and IP tracking (lines 44-55)
- **Access Token**: JWT with payload `{email, sub, role, status}` (line 76)
- **Refresh Token**: 40-byte crypto random hex (line 78)
- **Session Duration**: `SESSION_DURATION_DAYS` env var, default 30 days (line 45)

---

## 3. Authorization

### Role-Based Permissions Matrix
**File:** `apps/backend/src/security/permissions.ts`

| Role | Permissions |
|------|------------|
| `CUSTOMER` | `orders:read_own`, `orders:create`, `wallet:read_own`, `wallet:transact_own` |
| `RESTAURANT` | `restaurants:manage_own`, `orders:manage_assigned`, `kitchen:manage_own`, `menus:manage_own` |
| `KITCHEN_STAFF` | `kitchen:manage_own`, `orders:read_assigned` |
| `DELIVERY_PARTNER` | `deliveries:manage_assigned`, `orders:read_assigned` |
| `ADMIN` | `users:manage`, `restaurants:manage`, `orders:manage`, `payments:manage`, `support:manage`, `analytics:read`, `finance:read`, `notifications:manage`, `compliance:read` |
| `SUPER_ADMIN` | `*` (all permissions) |
| `SUPPORT_STAFF` | `support:manage`, `orders:read` |
| `FINANCE_STAFF` | `finance:read`, `payments:read`, `refunds:read` |

### Permission Guard
**File:** `apps/backend/src/security/permission.guard.ts`
- Requires authentication (`request.user`) (line 29)
- Enforces `ACTIVE` user status (line 33)
- Normalizes user role before permission check (line 41)
- `SUPER_ADMIN` bypasses all permission checks (lines 46-48)
- Throws `ForbiddenException` for: auth required, inactive account, missing role, invalid role, insufficient permissions

### Roles Guard
**File:** `apps/backend/src/security/roles.guard.ts`
- Enforces required roles via `@Roles()` decorator (line 19)
- Validates user status is `ACTIVE` (line 31)
- Exports `rolePermissions` for external access (line 12)

---

## 4. CSRF Protection

**File:** `apps/backend/src/security/csrf.middleware.ts`

- **Ignored Methods**: GET, HEAD, OPTIONS (lines 7-9)
- **Ignored Paths**: `/api/webhook`, `/payments/webhook` (lines 12-14)
- **Header**: `x-csrf-token` (line 17)
- **Cookie**: `_csrf` (line 18)
- **Production**: Both header and cookie required (lines 23-24)
- **Token Expiry**: Checked via JWT decode (lines 30-35)
- **Token Generation**: `crypto.randomBytes(32).toString('base64')` (line 49)

---

## 5. CORS & Origin Validation

**File:** `apps/backend/src/security/cors-origin.ts`
- Default allowed origins (dev): `http://localhost:3002`, `3003`, `3004` (line 1)
- Rejects wildcards (`*`) (lines 5-7)
- Validates URL protocol: `http:` or `https:` only (lines 11-12)
- Production requires explicit origins (lines 79-85)

---

## 6. Encryption & Data Protection

### Encryption Service
**File:** `apps/backend/src/security/encryption.service.ts`
- Algorithm: AES via CryptoJS (line 15)
- Requires `ENCRYPTION_SECRET` from environment (line 11)
- Methods: `encrypt()`, `decrypt()`, `encryptPiiFields()`, `decryptPiiFields()`

### Data Privacy Service
**File:** `apps/backend/src/services/privacy/data-privacy.service.ts`
- PII masking/unmasking for sensitive fields
- Protected deletion workflow with soft-delete support

---

## 7. Compliance Framework

### SOC2 Readiness
**File:** `apps/backend/src/compliance/soc2-readiness.service.ts`
- **Security Controls**: SEC-01 through SEC-05 (Access Control, Network Security, Data Encryption, Vulnerability Management, Security Incident Response)
- **Availability**: AVA-01 through AVA-03
- **Processing Integrity**: PI-01 through PI-03
- **Confidentiality**: CONF-01, CONF-02
- **Privacy**: PRI-01 through PRI-03

**Endpoint**: `GET /compliance/soc2`

### PCI-DSS Validation
**File:** `apps/backend/src/compliance/pci-dss-validation.service.ts`

| Requirement | Status | Notes |
|-------------|--------|-------|
| 1.1 Firewall | Compliant | K8s network policies, NGINX |
| 1.2 Password Policy | Compliant | Argon2, min length >= 8 |
| 2.1 No Card Storage | Compliant | Tokens only, never stored |
| 2.2 Encryption Transmission | Compliant | HTTPS, webhook signatures |
| 3.1 Data Retention | Compliant | 7 years for PII |
| 4.1 Network Encryption | Compliant | HTTPS/TLS 1.2+ |
| 4.2 No Default Credentials | Compliant | |
| 5.1 Anti-virus | Compliant | Container scanning, npm audit |
| 6.1 Vulnerability Scanning | Compliant | npm audit, OWASP ZAP, Dependabot |
| 6.2 System Updates | Compliant | CI/CD automated testing |
| 7.1 Least Privilege | Compliant | RBAC, JWT scopes |
| 8.1 Authentication | Compliant | JWT auth, session management |
| 8.2 MFA | **Non-Compliant** | Not implemented (depends on `MFA_REQUIRED` config) |
| 11.1 Security Testing | Partial | SAST/DAST automation recommended |
| 11.2 Penetration Testing | **Non-Compliant** | External pentest required annually |
| 11.3 Intrusion Detection | Partial | IDS/IPS recommended |

**Endpoint**: `GET /compliance/pci-dss`

### GDPR Compliance
**File:** `apps/backend/src/compliance/compliance.controller.ts`

| Endpoint | Purpose |
|----------|---------|
| `GET /compliance/gdpr/user/:userId/export` | GDPR data export (lines 123-138) |
| `POST /compliance/gdpr/user/:userId/deletion-request` | GDPR deletion request (lines 157-173) |
| `GET /compliance/user/:userId/pii-verification` | PII encryption verification (lines 238-248) |

- **Data Retention**: Session data 90 days, audit logs 3 years, user data 7 years after deletion, order data 10 years
- **PII Verification**: Checks for `U2FsdGVkX1+` (AES encryption) prefix
- **Grace Period**: 24 hours for deletion requests

### Secret Rotation
**File:** `apps/backend/src/compliance/secrets-rotation.service.ts`
- Tracked secrets: `JWT_SECRET`, `ENCRYPTION_SECRET`, `STRIPE_SECRET_KEY`, `DB_PASSWORD`, `GRAFANA_ADMIN_PASSWORD`
- Rotation period: 90 days (configurable)
- Generates audit trail

**Endpoint**: `GET /compliance/secrets/rotation-status`

---

## 8. Webhook Security

### Stripe Webhook Verification
**File:** `apps/backend/src/services/payments/gateways/stripe-gateway.service.ts`
- Uses `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET` (lines 126-137)

### Razorpay Webhook Verification
**File:** `apps/backend/src/services/payments/gateways/razorpay-gateway.service.ts`
- HMAC-SHA256 signature validation (lines 177-197)
- `crypto.createHmac('sha256', webhookSecret)`

### Duplicate Prevention
**File:** `apps/backend/src/services/payments/webhook/webhook.service.ts`
- Checks `PaymentWebhookEntity` by `gateway + webhookId` (lines 69-79)
- Checks `PaymentEventEntity` by `orderId` to prevent double-processing

---

## 9. Fraud Detection

### FraudHardeningService
**File:** `apps/backend/src/services/payments/fraud-hardening.service.ts`

| Check | Threshold | Risk Score |
|-------|-----------|------------|
| Velocity (transactions/hour) | Max 10 | +20 |
| Daily Total | $50,000 | +40 |
| Card Testing (small < $5) | > 5/hour | +30 |
| IP Reputation | Private IPs (`10.x`, `192.168.x`, `172.16.x`) | Flagged |
| Prepaid Card Detection | Any prepaid card | +10 |

- **Block Threshold**: 70 (configurable via `PAYMENT_FRAUD_BLOCK_THRESHOLD`)
- **Flag Types**: `velocity_abuse`, `card_testing`, `high_risk_card`, `suspicious_pattern`, `refund_abuse`, `chargeback_risk`, `other`

### PaymentHardeningService (Additional Layer)
**File:** `apps/backend/src/services/payments/payment-hardening.service.ts`

| Check | Condition | Risk Score |
|-------|-----------|------------|
| Amount > max | `amount > PAYMENT_MAX_SINGLE_AMOUNT` | +80 |
| Invalid amount | `amount <= 0 or not integer` | +100 |
| Daily transactions | > 10 | +30 |
| IP requests | > 5/hour | +25 |
| Test payment method | Blocked | +40 |

---

## 10. Database Security

### TypeORM Configuration
**File:** `apps/backend/src/db/db.module.ts`
- PostgreSQL with TypeORM (lines 115-125)
- MongoDB with Mongoose for reviews (lines 126-143)
- Credentials from environment variables (never hardcoded)

### Entity Security Patterns
**File:** `apps/backend/src/db/entities/user.entity.ts`
- `passwordHash` field uses Argon2 hashes (line 19)
- Role and status tracked for access control (lines 24-27)

**File:** `apps/backend/src/db/entities/session.entity.ts`
- `refreshToken` stored securely (line 26)

---

## 11. Input Validation

### Class Validator Usage
All DTOs validated with `class-validator` decorators:
- `@IsString()`, `@IsEmail()`, `@IsInt()`, `@IsEnum()`, `@IsOptional()`, `@IsUUID()`, `@Min()`, `@Max()`
- Global validation pipe in NestJS application setup

---

## 12. Security Checklist

| Control | Status | Implementation |
|---------|--------|----------------|
| Helmet CSP | Implemented | `default-src 'self'`, `frame-ancestors 'none'` |
| HSTS | Implemented | max-age 1 year, preload |
| CSRF Protection | Implemented | Header + cookie validation |
| CORS | Implemented | Origin whitelist, no wildcards in prod |
| Rate Limiting | Implemented | Per-endpoint ThrottlerModule |
| Password Hashing | Argon2 | `argon2.hash()` / `argon2.verify()` |
| JWT Auth | Implemented | Passport JWT strategy |
| RBAC | Implemented | 8 roles, permission matrix |
| RBAC Bypass | `SUPER_ADMIN` | Explicit bypass in permission guard |
| HTTPS/TLS | Enforced | HSTS + production TLS |
| Input Validation | Implemented | class-validator decorators |
| NoSQL Injection Prevention | Implemented | TypeORM parameterized queries |
| SQL Injection Prevention | Implemented | parameterized queries |
| MongoDB Sanitization | Implemented | `express-mongo-sanitize` |
| HPP Protection | Implemented | Enabled in main.ts |
| Dangerous Methods Block | Implemented | TRACE, TRACK, DEBUG, CONNECT |
| Body Size Limit | Implemented | 10kb limit |
| Audit Logging | Implemented | Audit events for all critical operations |
| Session Management | Implemented | Device/IP tracking, 30-day sessions |
| Refresh Tokens | Implemented | 40-byte crypto random, stored in DB |
| Webhook Signature Verification | Implemented | Stripe: `constructEvent()`, Razorpay: HMAC-SHA256 |
| PCI-DSS Compliance | Partial | No card storage, MFA non-compliant |
| GDPR Compliance | Implemented | Export, deletion, PII verification endpoints |
| SOC2 Readiness | Assessed | All trust services criteria evaluated |
| Encryption Service | Implemented | AES for PII fields |
| Secret Rotation | Implemented | 90-day rotation cycle |
| Fraud Detection | Implemented | Multi-layer velocity + pattern checks |
| Webhook Deduplication | Implemented | Database-level dedup |
| Production Environment Validation | Implemented | Bootstrap secret checks |
