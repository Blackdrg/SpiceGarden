# Technical Debt

**Date:** 2026-06-26
**Scope:** SpiceGarden Technical Debt Analysis
**Classification:** Evidence-based

## Summary

| Category | Count | Priority |
|----------|-------|----------|
| TODOs | 1 | Medium |
| FIXMEs | 0 | - |
| console.log | 17 | Low |
| Unused exports | UNKNOWN | - |
| Duplicate logic | UNKNOWN | - |
| Memory leaks in tests | 1 warning | Medium |

## Known Technical Debt Items

### 1. TODO (Medium Priority)

**File:** `apps/backend/scripts/seed.ts:3`
```typescript
// TODO: Implement deterministic seeding logic here.
```

**Impact:** Seed script incomplete; requires manual implementation

**Recommendation:** Implement deterministic seeding for test data

### 2. Test Memory Leak Warning

**Location:** `apps/backend/test/` (Jest configuration)
**Issue:** Worker process failed to exit gracefully
**Evidence:** "A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown."

**Recommendation:** Review test teardown with `--detectOpenHandles`

### 3. gRPC Transport Stub

**Status:** Stubbed/Quarantined
**File:** `packages/grpc-transport/src/index.ts`
**Evidence:** Module intentionally throws error on import

**Recommendation:** Either implement gRPC transport or remove package

### 4. React Doctor Scores

| App | Score | Warnings | Status |
|-----|-------|----------|--------|
| customer-mobile | 65/100 | 126 warnings | Phase 2 |
| customer-web | 63/100 | 32 warnings | Phase 2 |
| delivery-partner | 59/100 | 51 warnings | Phase 2 |
| restaurant-dashboard | 74/100 | 5 warnings | Phase 2 |
| super-admin | 62/100 | 10 warnings | Phase 2 |

**Evidence:** Files `_doctor_*.json` in each app directory

### 5. Moderate npm Audit Vulnerabilities

**Count:** 31 moderate
**Source:** Dev toolchain (js-yaml, uuid via @expo/*)
**Impact:** 0 high/critical; dev-only

**Recommendation:** Update dev dependencies during routine maintenance

## Coverage Gaps (Not Debt - Monitoring)

These modules have lower coverage but are functional:

| Module | Branch Coverage | Notes |
|--------|-----------------|-------|
| security/vault.service.ts | 59.25% | Secret management edge cases |
| services/payments/gateways | 55% | Payment provider error paths |
| services/payments/webhook | 65.06% | Webhook error handling |

## Code Quality Findings

### console.log Usage

All instances are in operational contexts (logging, not debugging):

| File | Context |
|------|---------|
| src/main.ts:263 | Metrics logging |
| src/db/db.module.ts:135 | Connection confirmation |
| src/logging/logging.service.ts | Structured logging |
| src/db/redis.adapter.ts | Connection logging |
| src/main-grpc.ts:24 | Server startup |
| services/*/ | Operational output |

## Recommendations

1. **P1:** Address React Doctor warnings in Phase 2
2. **P2:** Implement gRPC transport or remove stubbed package
3. **P2:** Fix test teardown cleanup
4. **P3:** Implement deterministic seeding logic
5. **P3:** Routine npm audit fix for dev toolchain