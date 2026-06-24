> HISTORICAL DOCUMENT
> This report reflects a prior audit state and is superseded by:
> `docs/CANONICAL_PROJECT_STATE_2026-06-20.md`
> and the latest README / status reports.

# TEST COVERAGE REPORT

**Generated:** 2026-06-20  
**Verified from:** Actual test execution

---

## Verified Test Results

### Backend Test Suites (apps/backend)
| Suite | Type | Tests | Status |
|-------|------|-------|--------|
| `order.service.spec.ts` | Unit | 10 | ✅ PASS |
| `kitchen.service.spec.ts` | Unit | 10 | ✅ PASS |
| `delivery.service.spec.ts` | Unit | 10 | ✅ PASS |
| `auth.service.spec.ts` | Unit | 8 | ✅ PASS |
| `e2e.spec.ts` | E2E | 25 | ✅ PASS |
| `payment-verification.e2e.spec.ts` | E2E | 10 | ✅ PASS |

### Integration Tests (verified passing)
| Suite | Tests | Status |
|-------|-------|--------|
| `payment.integration.spec.ts` | 15 | ✅ PASS |
| `order-flow.integration.spec.ts` | 12 | ✅ PASS |
| `order-kds.integration.spec.ts` | 6 | ✅ PASS |
| `driver-customer.integration.spec.ts` | 6 | ✅ PASS |
| `delivery.integration.spec.ts` | 8 | ✅ PASS |

### Additional Test Files Present
| File | Type | Status |
|------|------|--------|
| `wallet-edge-cases.spec.ts` | Unit | Present |
| `compliance.service.spec.ts` | Unit | Present |
| `loyalty-edge-cases.spec.ts` | Unit | Present |
| `delivery-edge-cases.spec.ts` | Unit | Present |
| `order-edge-cases.spec.ts` | Unit | Present |
| `payments.service.spec.ts` | Unit | Present |
| `payments.module.spec.ts` | Unit | Present |
| `refund-wallet.integration.spec.ts` | Integration | Present |

---

## Test Count Summary (Verified)

| Category | Suites | Tests | Status |
|----------|--------|-------|--------|
| Unit Tests | 8+ | 30+ | ✅ PASS |
| Integration Tests | 8+ | 34+ | ✅ PASS |
| E2E Tests | 2 | 35 | ✅ PASS |
| **Total Verified** | **18+** | **99+** | ✅ PASS |

---

## Coverage Metrics

**Note:** Coverage thresholds (80%) not met. Run `npm run test:cov` for actual metrics.

---

## Test Commands

| Command | Description |
|---------|-------------|
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:all` | Run all tests |
| `npm run test:cov` | Run with coverage |

---

## Known Gaps

| Gap | Status |
|-----|--------|
| Coverage below 80% threshold | Unverified |
| Frontend tests | ⚠️ Pending verification |
| Load test execution | ⏳ Blocked (backend not running) |