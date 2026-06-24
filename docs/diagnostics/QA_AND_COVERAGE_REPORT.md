# QA and Coverage Report

**Generated:** 2026-06-24  
**Purpose:** Test suite and coverage analysis

## Test Suite Inventory

### Backend (apps/backend)

| Suite Type | Files | Count | Status |
|------------|-------|-------|--------|
| Unit Tests | `*.spec.ts` in test/ | 62 files | **Test-verified** (911 passed, 6 failed) |
| Integration Tests | `*.integration.spec.ts` | 6 files | Present |
| E2E Tests | `*.e2e.spec.ts` | 3 files | Present |
| Load Tests | `test/load/*.js` | 2 files | Implemented, runtime blocked |

**Total Test Files: 62**

### Test Categories by File

| Category | File Count |
|----------|------------|
| Unit (service-level) | ~40 |
| Integration | ~6 |
| E2E | ~3 |
| Security | ~4 |
| Load | ~2 |
| Coverage gap fills | ~5 |

## Exact Test Counts

### Latest Test Run Output
```
Test Suites: 1 failed, 1 skipped, 60 passed, 61 of 62 total
Tests:       6 failed, 1 skipped, 911 passed, 918 total
```

| Status | Count |
|--------|-------|
| Passed | 911 |
| Failed | 6 |
| Skipped | 1 |
| Total | 918 |

### Failed Tests
- All failures in `mongo-connection.spec.ts` due to MongoDB not initialized

### Skipped Tests
- 1 skipped in `mongo-connection.spec.ts` (connection test)

## Frontend Tests

| App | Test Runner | Files | Status |
|-----|-------------|-------|--------|
| customer-web | Jest | `__tests__/` | Configured |
| restaurant-dashboard | Jest | `__tests__/` | Configured |
| super-admin | Jest | (none found) | Unknown |
| customer-mobile | Jest | `__tests__/` | Configured |
| delivery-partner | Jest | `src/services/__tests__/` | Configured |
| ui | Jest | `__tests__/` | Configured (4 files) |

## Coverage Metrics

### Backend Coverage Gate Configuration
```
Coverage thresholds (app/backend/package.json:13):
{
  "global": {
    "branches": 80,
    "functions": 80,
    "lines": 80,
    "statements": 80
  }
}
```

### Reported Coverage Status
- **Status**: Blocked - coverage gate failing
- **Branches**: 63% (below 80% threshold)
- **Functions**: 63% (below 80% threshold)
- **Lines**: ~80%
- **Statements**: ~80%

### Low Coverage Modules
Per test file analysis, these modules have dedicated coverage tests:
- `database-failover.service.ts`
- `security/permissions.ts`
- `security/encryption.service.ts`
- `security/cors-origin.ts`
- `infra/tracking/tracking.gateway.ts`
- `delivery.service.ts`
- `notification.service.ts`
- `production-notification.service.ts`
- `driver-assignment.service.ts`
- `wallet.service.ts`

## Load/Performance Tests

| Script | VUs | Status |
|--------|-----|--------|
| `test/load/10k-users.js` | 10,000 | Blocked (requires running backend) |
| `test/load/20k-users.js` | 20,000 | Blocked (requires running backend) |
| `test/load/breaking-point.js` | Variable | Blocked (requires running backend) |

## Security Tests

| Script | Type | Status |
|--------|------|--------|
| `infra/scripts/security-tests.js` | Security vulnerability | Blocked (requires localhost:3001) |
| `infra/scripts/penetration-tests.js` | Penetration testing | Blocked (requires localhost:3001) |

## CI Coverage Enforcement

Per `.github/workflows/ci-cd.yml`:
- Line 61-63: `npm run test:cov` runs as part of build-test job
- Coverage thresholds enforced via Jest configuration

## Mocked vs Live Integration

| Integration | Mocked Status | Live Required |
|-------------|---------------|---------------|
| Auth flow | Partially mocked | Database for full flow |
| Payment gateways | Test key placeholders | Live Stripe/Razorpay keys |
| Notifications | FCM placeholders | FCM/Twilio credentials |
| Geolocation | Implemented | Google Maps API key |
| SMTP | SendGrid placeholders | SMTP credentials |

## Test Commands

| Command | Description | Status |
|---------|-------------|--------|
| `npm run test:unit` | Unit tests only | Runnable |
| `npm run test:integration` | Integration tests | Runnable (skips mongo-connection) |
| `npm run test:e2e` | End-to-end tests | Runnable |
| `npm run test:cov` | Coverage with thresholds | Runnable, fails gates |
| `npm run test:load` | k6 load test | Blocked |
| `npm run test:chaos` | Chaos experiments | Blocked (requires cluster) |

## Gaps Summary

| Gap Type | Count | Notes |
|----------|-------|-------|
| Coverage below threshold | 2 (branches, functions) | Need additional tests |
| Security tests blocked | 2 | Requires backend runtime |
| Load tests blocked | 2 | Requires backend runtime |
| Integration tests partial | 1 | MongoDB suite fails/skip |

## Coverage Threshold Status

| Metric | Current | Required | Gap |
|--------|---------|----------|-----|
| Branches | ~63% | 80% | -17% |
| Functions | ~63% | 80% | -17% |
| Lines | ~80% | 80% | 0% |
| Statements | ~80% | 80% | 0%