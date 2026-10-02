# SpiceGarden — Security Overview

## 1. Authentication Architecture
- **JWT & Session Management:** Signed JSON Web Tokens with short-lived access tokens (1 hour) and sliding-window refresh tokens (30 days) stored in httpOnly, secure cookies.
- **Session Revocation:** Centralized session invalidation in Redis/PostgreSQL on logout, password reset, or administrative account suspension.
- **Password Security:** Multi-pass Argon2 and Bcrypt hashing with cryptographically secure random per-user salts.
- **Social Authentication:** OAuth2 workflows for Google and Facebook with validated callback token exchange.

## 2. Authorization & Role-Based Access Control (RBAC)
- Enforced at the controller and route level via `@Roles()` and `@Permissions()` decorators backed by `RolesGuard` and `PermissionsGuard`.
- Roles supported: `SUPER_ADMIN`, `RESTAURANT_OWNER`, `DELIVERY_PARTNER`, `CUSTOMER`.
- Tenant isolation prevents cross-tenant data leakage between distinct restaurant vendors.

## 3. Network & Transport Security
- **Security Headers:** `helmet` enabled globally with strict HTTP Strict Transport Security (HSTS), Content Security Policy (CSP), frameguard, and X-Content-Type-Options.
- **CORS Configuration:** Dynamic origin verification against an environment-governed whitelist (`CorsOriginService`).
- **CSRF Protection:** Custom `CsrfMiddleware` protecting mutating endpoints (POST, PUT, DELETE, PATCH).

## 4. Data Protection & Cryptography
- **At-Rest Protection:** AES-256-GCM symmetric encryption for sensitive stored secrets, payment gateway tokens, and confidential user settings (`EncryptionService`).
- **Injection Prevention:** TypeORM parameterization for SQL queries; `mongo-sanitize` for NoSQL document filters.
- **Parameter Pollution:** `hpp` middleware enabled globally.

## 5. Security Posture Statement
> **Automated Security Controls — VERIFIED** via 1,235 automated unit/integration tests, strict static TypeScript analysis, and automated vulnerability checks. Independent third-party penetration testing has not been completed within the current verification scope and is recommended in target production hosting environments.
