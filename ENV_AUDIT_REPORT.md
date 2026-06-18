# Environment Audit Report

## Current Configuration Analysis

### .env File Analysis
| Variable | Value | Status | Issue |
|----------|-------|--------|-------|
| NODE_ENV | development | ✅ OK | None |
| PORT | 3001 | ✅ OK | None |
| LOCAL_DB | sqlite | ⚠️ Mixed | Causes LocalDevModule to be used, which lacks auth/order modules |
| JWT_SECRET | AAAAAAAAAA... | ⚠️ Placeholder | Works for local dev but not production |
| ENCRYPTION_SECRET | AAAAAAAAA... | ⚠️ Placeholder | Works for local dev but not production |

### Missing Required Variables (for production)
- All payment gateway secrets would need real values
- FCM_SERVER_KEY, TWILIO_* for notifications
- GOOGLE_MAPS_API_KEY for maps
- SENDGRID_API_KEY for email

## Backend Startup Mode Detection

From `main.ts:111`:
```javascript
const localMode = process.env.LOCAL_DB === 'sqlite' || (!process.env.DB_HOST && process.env.NODE_ENV !== 'production');
```

When `LOCAL_DB=sqlite`:
- Uses `LocalDevModule` 
- Uses `LocalRepositoryModule` (in-memory mock)
- Missing: AuthServiceModule, OrderServiceModule, etc.

When `LOCAL_DB` is NOT set:
- Uses full `AppModule`
- Would require: PostgreSQL, MongoDB, Redis

## Load Test Environment Requirements

For the k6 load test to work with full API flow:

| Service | Required | Current Config | Status |
|---------|----------|----------------|--------|
| Backend Server | Yes | LOCAL_DB=sqlite | ❌ Broken - LocalDevModule missing modules |
| PostgreSQL | Yes | Not running | ❌ Cannot connect |
| MongoDB | Yes | Not running | ❌ Cannot connect |
| Redis | Optional (fallback) | Not running | ⚠️ May work with memory fallback |

## Discovered Issues

### 1. LocalDevModule is Incomplete
- **File**: `src/local-dev.module.ts`
- **Issue**: Missing AuthServiceModule and OrderServiceModule
- **Impact**: `/auth/*` and `/orders/*` endpoints return 404

### 2. JWT_SECRET Placeholder Value
- **File**: `.env:26`
- **Value**: `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` (32 chars)
- **Impact**: Works locally but fails production validation in `missing-env.error.ts`

### 3. Rate Limiting Blocks Load Test
- **File**: `main.ts:103-108`
- **Issue**: Rate limiter installed on `/auth/` with 5 req/15min limit
- **Impact**: Load test would be blocked immediately

### 4. k6 Script BASE_URL Wrong Port
- **File**: `test/load/10k-users.js:22` (original)
- **Issue**: `http://localhost:3000` vs actual port `3001`
- **Impact**: All requests fail with connection refused

### 5. k6 Script Wrong Endpoints
- **File**: `test/load/10k-users.js:34` (original)
- **Issue**: `/auth/signup` vs `/auth/register`
- **Impact**: 404 Not Found

### 6. k6 Script Missing Required Fields
- **File**: `test/load/10k-users.js:28-32` (original)
- **Issue**: Missing `phone` field required by UserEntity
- **Impact**: Validation would fail

### 7. k6 Script Mock Authorization
- **File**: `test/load/10k-users.js:78` (original)
- **Issue**: `Bearer mock-token-${userIndex}` invalid JWT
- **Impact**: 401 Unauthorized for protected endpoints

## Recommendations

### Immediate Fixes
1. Remove `LOCAL_DB=sqlite` from `.env` for load testing
2. Fix k6 script: Change `localhost:3000` → `localhost:3001`
3. Fix k6 script: Change `/auth/signup` → `/auth/register`
4. Fix k6 script: Add `phone` field to register payload
5. Fix k6 script: Implement proper auth flow with token extraction

### For Complete Load Testing
6. Either:
   - Run Docker infrastructure: `docker-compose -f compose.dev.yaml up -d`
   - OR: Fix LocalDevModule to include all necessary modules
   - OR: Create dedicated LoadTestModule