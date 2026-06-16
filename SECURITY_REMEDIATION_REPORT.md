# Security Remediation Report - SpiceGarden

Generated: 2026-06-17T03:45+05:30

## Status: VERIFIED ✅

### Fixes Applied

#### 1. Rate Limiting Protection Added
**File:** `apps/backend/src/services/auth/auth.controller.ts`
- Added `@UseGuards(ThrottlerGuard)` decorator at class level
- ThrottlerGuard from `@nestjs/throttler` now protects all auth endpoints
- Configuration: ttl: 60000ms, limit: 10 requests per IP

#### 2. Trust Proxy Configuration
**File:** `apps/backend/src/main.ts`
- Added configurable trust proxy handling through `TRUST_PROXY`
- Defaults to enabled for reverse proxy deployments
- Ensures client IP is properly extracted for throttling decisions

#### 3. Security Module Export
**File:** `apps/backend/src/security/security.module.ts`
- `ThrottlerGuard` now exported for use in controllers
- `SecretLoaderService` is now registered before encryption providers so secret files can populate runtime env vars

#### 4. CORS Hardening
**Files:** `apps/backend/src/security/cors-origin.ts`, `apps/backend/src/main.ts`
- Added exact-origin normalization and wildcard rejection
- Production defaults to no allowed origins unless `CORS_ALLOWED_ORIGINS` is explicitly configured
- HTTP CORS now uses strict allowed origins, credentials, methods, and headers
- Verified allowed origin returns `Access-Control-Allow-Origin`; disallowed origin does not

#### 5. WebSocket Hardening
**Files:** `apps/backend/src/infra/tracking/tracking.gateway.ts`, `apps/backend/src/services/restaurant/kds.gateway.ts`
- Added origin validation on WebSocket connections
- Added `maxHttpBufferSize` and disabled legacy Engine.IO v3
- Added room/branch/driver ID validation for socket messages and joins

#### 6. Secrets Validation
**Files:** `apps/backend/src/common/errors/missing-env.error.ts`, `apps/backend/src/main.ts`, payment gateway constructors
- Added centralized non-placeholder secret validation
- Production startup now requires core DB, Redis, JWT, encryption, Stripe, Razorpay, and CORS variables
- Removed hardcoded Stripe/Razorpay test placeholders from payment gateway constructors
- Fixed secret-file mapping for Stripe/Razorpay webhook and key env var names

### Remaining Security Issues

#### Full Security Script Verification
- **Status:** ✅ Verified
- `infra/scripts/security-tests.js` passed all tests with backend running
- SQL Injection: SECURE (0 issues)
- XSS: SECURE (0 issues)
- Rate Limiting: SECURE (92/100 requests rate-limited)
- Auth Bypass: SECURE (0 issues)
- Path Traversal: SECURE (0 issues)
- Total vulnerabilities found: 0

#### Dangerous HTTP Methods Protection
- **Status:** ✅ Added
- Added middleware to reject TRACE, TRACK, DEBUG, CONNECT methods
- Returns 405 Method Not Allowed for dangerous methods

#### Dependency Vulnerabilities
- **Status:** ⚠️ Partially resolved
- `npm audit` now reports 51 moderate vulnerabilities and 0 high/critical vulnerabilities
- Remaining issues are moderate transitive/dev dependency advisories in Expo, Jest, Sentry/OpenTelemetry, uuid, and launcher dependencies
- Dependency cleanup remains required before production release

#### Operational Secrets
- **Status:** ⚠️ Requires production provisioning
- Local `.env` now uses non-placeholder development values
- Production must provide real secrets through `secrets/` files or `_FILE` env vars

### Verification Commands

```bash
# Start backend (required for direct runtime checks)
cd apps/backend
npm run dev

# In another terminal - direct rate-limit check
1..14 | ForEach-Object { $statusCode=(curl.exe -s -o NUL -w '%{http_code}' -X POST http://localhost:3001/auth/login -H 'Content-Type: application/json' -d '{}'); Write-Output (('{0}:{1}' -f $_, $statusCode)) }

# Expected output after fix:
# 1-10: 404
# 11-14: 429

# CORS allowed-origin preflight
curl.exe -i -s -X OPTIONS http://localhost:3001/auth/login -H 'Origin: http://localhost:3002' -H 'Access-Control-Request-Method: POST'

# Expected: Access-Control-Allow-Origin: http://localhost:3002

# CORS rejected-origin preflight
curl.exe -i -s -X OPTIONS http://localhost:3001/auth/login -H 'Origin: http://evil.example' -H 'Access-Control-Request-Method: POST'

# Expected: no Access-Control-Allow-Origin header
```

### Security Test Prerequisites
The `infra/scripts/security-tests.js` script requires:
1. Backend running on port 3001
2. Redis available for rate limiting (if using Redis-backed store)
3. Environment configured with proper secrets
4. Full script rerun after production secrets are provisioned