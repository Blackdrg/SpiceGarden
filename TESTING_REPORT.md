# Testing Report
Generated: 2026-06-16T01:10:40+05:30

## Verification Source
Live command outputs from npx jest, npm run lint, npx tsc, npm test scripts.

## Confidence Level
HIGH — Direct command output captured.

---

## Backend Test Results (Verified)

### Unit + Integration + E2E Combined
Command: `Set-Location apps/backend; npx jest --testPathPattern="\.spec\.ts$" --passWithNoTests`

```
Test Suites: 1 failed, 1 skipped, 24 passed, 25 of 26 total
Tests:       6 failed, 1 skipped, 211 passed, 218 total
Time:        91.026 s
```

**Passing suites (24):**
- test/auth.service.spec.ts ✅
- test/auth.integration.spec.ts ✅
- test/compliance.service.spec.ts ✅
- test/delivery.service.spec.ts ✅
- test/delivery-edge-cases.spec.ts ✅
- test/delivery.integration.spec.ts ✅
- test/driver-customer.integration.spec.ts ✅
- test/e2e.spec.ts ✅
- test/kitchen.service.spec.ts ✅
- test/loyalty-edge-cases.spec.ts ✅
- test/order-edge-cases.spec.ts ✅
- test/order-flow.integration.spec.ts ✅
- test/order-kds.integration.spec.ts ✅
- test/order.service.spec.ts ✅
- test/payment-order.integration.spec.ts ✅
- test/payment.integration.spec.ts ✅
- test/payment-verification.e2e.spec.ts ✅
- test/payments.module.spec.ts ✅
- test/payments.service.spec.ts ✅
- test/refund-wallet.integration.spec.ts ✅
- test/reliability.failure-recovery.spec.ts ✅
- test/wallet-edge-cases.spec.ts ✅
- test/nnotification.service.spec.ts ✅
- test/audit.service.spec.ts ✅ (untracked)

**Failing suite (1):**
- test/mongo-connection.spec.ts ❌ — MongoDB connection timeout (6 failures)

**Skipped suite (1):**
- test/load (NOT VERIFIED which suite)

## Lint Status (Verified)

All 7 workspace lint commands completed with exit 0 and no ESLint errors:
- @spicegarden/backend ✅
- @spicegarden/customer-web ✅
- @spicegarden/restaurant-dashboard ✅
- @spicegarden/super-admin ✅
- @spicegarden/customer-mobile ✅
- @spicegarden/delivery-partner ✅
- spicegarden-launcher ✅
- @spicegarden/ui ✅
- @spicegarden/shared ✅
- @spicegarden/grpc-transport ✅

## TypeScript Status (Verified)

| Workspace | Result |
| :--- | :--- |
| @spicegarden/backend | ✅ tsc --noEmit passed |
| @spicegarden/customer-mobile | ✅ tsc --noEmit passed |
| @spicegarden/delivery-partner | ✅ tsc --noEmit passed |

## Placeholder / Echo Tests

| Workspace | Script | Behavior |
| :--- | :--- | :--- |
| apps/restaurant-dashboard | test:unit | echo "no unit tests" |
| apps/restaurant-dashboard | test:integration | echo "no integration tests" |
| apps/restaurant-dashboard | test:e2e | echo "no e2e tests" |
| apps/super-admin | test:unit | echo "no unit tests" |
| apps/super-admin | test:integration | echo "no integration tests" |
| apps/super-admin | test:e2e | echo "no e2e tests" |
| apps/customer-web | test:integration | echo "no integration tests" |
| apps/customer-web | test:e2e | echo "no e2e tests" |

## Test Coverage

| Metric | Backend |
| :--- | :---: |
| Statements | NOT VERIFIED |
| Branches | NOT VERIFIED |
| Functions | NOT VERIFIED |
| Lines | NOT VERIFIED |

**Note:** `npm run test:cov` not executed in this session. Previous reports show ~47% statement coverage — below typical 80% threshold.

## Load Testing

| Script | Status |
| :--- | :--- |
| npm run test:load | FAILED — metric conflict in 10k-users.js |
| npm run test:load:20k | NOT VERIFIED |
| npm run test:chaos | NOT VERIFIED |

## Integration/E2E Gaps

| Workspace | Gap |
| :--- | :--- |
| customer-web | No integration or e2e tests (placeholder scripts) |
| restaurant-dashboard | No integration or e2e tests |
| super-admin | No integration or e2e tests |
| customer-mobile | Test infrastructure exists but not verified in this session |
| delivery-partner | Test infrastructure exists but not verified in this session |
| launcher | Test infrastructure exists but not verified in this session |
| packages/ui | Test infrastructure exists but not verified |
| packages/shared | Test infrastructure exists but not verified |

---

## 2026-06-17 Repository-Wide Audit Update

### Verified root gates

| Command | Result |
| :--- | :--- |
| `npm run build` | Exit `0` |
| `npm run lint` | Exit `0` |
| `npm run test:unit` | Exit `0` |
| `npm run test:integration` | Exit `0` |
| `npm run test:e2e` | Exit `0` |
| `npm run test` | Exit `0` |
| `npm audit --audit-level=high` | Exit `0`; 0 high, 0 critical |
| `npm audit` | Exit `1`; 31 moderate findings remain |

### Test file inventory

| Area | Test files |
| :--- | ---: |
| Total tracked test files | 185 |
| Backend | 139 |
| Customer web | 3 |
| Customer mobile | 11 |
| Delivery partner | 3 |
| Restaurant dashboard | 3 |
| Super admin | 4 |
| Launcher | 5 |
| Packages | 14 |

### Skipped test evidence

- `apps/backend/test/db-migrate.spec.ts:50` contains `it.skip('requires docker, bash, and scripts/db.sh', () => undefined);`.

### Current test readiness

- Root build, lint, unit, integration, e2e, and aggregate test gates passed in this session.
- Load testing was not rerun in this pass.
