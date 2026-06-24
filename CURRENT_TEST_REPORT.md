> HISTORICAL DOCUMENT
> This report reflects a prior audit state and is superseded by:
> `docs/CANONICAL_PROJECT_STATE_2026-06-20.md`
> and the latest README / status reports.

# CURRENT_TEST_REPORT.md

**Generated:** 2026-06-18

## Test Execution Summary

### Unit Tests

```
npm run test:unit - PASSED
Total: 210 passed, 1 skipped
```

| Workspace | Suites | Tests | Status |
| :--- | :---: | :---: | :--- |
| backend | 3 | 30 | ✅ Pass |
| customer-mobile | 6 | 33 | ✅ Pass |
| customer-web | 3 | 11 | ✅ Pass |
| delivery-partner | 3 | 6 | ✅ Pass |
| launcher | 1 | 1 | ✅ Pass |
| restaurant-dashboard | 3 | 9 | ✅ Pass |
| super-admin | 4 | 23 | ✅ Pass |
| shared | 2 | 2 | ✅ Pass |
| ui | 5 | 28 | ✅ Pass |

### Backend Test Suites Detailed

| Suite | Tests | Status |
| :--- | :---: | :--- |
| order.service.spec.ts | - | ✅ Pass |
| kitchen.service.spec.ts | - | ✅ Pass |
| delivery.service.spec.ts | - | ✅ Pass |
| payment-verification.e2e.spec.ts | - | ✅ Pass |
| reliability.failure-recovery.spec.ts | - | ✅ Pass |
| order-edge-cases.spec.ts | - | ✅ Pass |
| auth.service.spec.ts | - | ✅ Pass |
| delivery-edge-cases.spec.ts | - | ✅ Pass |
| compliance.service.spec.ts | - | ✅ Pass |
| wallet-edge-cases.spec.ts | - | ✅ Pass |
| payments.module.spec.ts | - | ✅ Pass |
| payments.service.spec.ts | - | ✅ Pass |
| order-flow.integration.spec.ts | - | ✅ Pass |
| e2e.spec.ts | - | ✅ Pass |
| loyalty-edge-cases.spec.ts | - | ✅ Pass |
| payment.integration.spec.ts | - | ✅ Pass |
| auth.integration.spec.ts | - | ✅ Pass |
| delivery.integration.spec.ts | - | ✅ Pass |
| order-kds.integration.spec.ts | - | ✅ Pass |
| driver-customer.integration.spec.ts | - | ✅ Pass |
| payment-order.integration.spec.ts | - | ✅ Pass |
| refund-wallet.integration.spec.ts | - | ✅ Pass |
| nnotification.service.spec.ts | - | ✅ Pass |
| audit.service.spec.ts | - | ✅ Pass |

### Coverage Analysis

```
npm run test:cov --workspace=@spicegarden/backend
```

| Metric | Before | After | Target | Gap |
| :--- | :---: | :---: | :---: | :---: |
| Statements | 49.09% | 52.16% | 80% | -27.84% |
| Branches | 16.84% | 20.15% | 80% | -59.85% |
| Functions | 19.16% | 24.92% | 80% | -55.08% |
| Lines | 47.94% | 51.12% | 80% | -28.88% |

### Coverage by Module

| Module | Stmts | Branch | Funcs | Lines | Uncovered |
| :--- | :---: | :---: | :---: | :---: | :--- |
| db/entities | 89.83% | 85.71% | 9.52% | 91.11% | 12,24,75,39-40 |
| services/auth | 88.23% | 100% | 83.33% | 87.5% | 61-66 |
| services/wallet | 66.66% | 45.71% | 56.25% | 66.05% | 132,204-345 |
| compliance | 70.32% | 55.55% | 42.85% | 70.45% | 59-93,129-134,206-253,267 |
| services/order | 29.91% | 14.56% | 36.84% | 29.13% | 49-406,427,447,507-516 |
| services/payments | 25.55% | 0% | 4.34% | 21.42% | 13-308 |
| security | 21.21% | 0% | 0% | 17.24% | 10-53 |
| services/notifications | 10.44% | 0% | 0% | 7.81% | 10-271 |
| audit | 15.55% | 0% | 0% | 11.62% | 9-265 |

### Tests Added (Phase 2)

| Test File | Tests Added |
| :--- | :---: |
| encryption.service.spec.ts | 8 |
| notification.service.spec.ts | 11 |

### Test Coverage Gaps

**High Priority (needs more coverage):**
- `services/order/order.service.ts` - 29% statements
- `services/payments/*` - 25% statements
- `services/loyalty/loyalty.service.ts` - 35% statements
- `services/geo/geo.service.ts` - 20% statements
- `modules/ledger/ledger.service.ts` - 37% statements

### Test Script Status

| Workspace | test:unit | test:integration | test:e2e |
| :--- | :--- | :--- | :--- |
| backend | ✅ Real tests | ✅ Integration | ✅ E2E |
| customer-mobile | ✅ Real tests | Placeholder | Placeholder |
| customer-web | ✅ Real tests | Placeholder | Placeholder |
| delivery-partner | ✅ Real tests | Placeholder | Placeholder |
| launcher | ✅ Real tests | Placeholder | Placeholder |
| restaurant-dashboard | ✅ Real tests | Placeholder | Placeholder |
| super-admin | ✅ Real tests | Placeholder | Placeholder |
| api-types | Placeholder | Placeholder | Placeholder |
| grpc-transport | Placeholder | Placeholder | Placeholder |
| proto | Placeholder | Placeholder | Placeholder |
| shared | ✅ Real tests | Placeholder | Placeholder |
| ui | ✅ Real tests | Placeholder | Placeholder |

### Load Test Scripts

Location: `apps/backend/test/load/`

| File | Users | Status |
| :--- | :---: | :--- |
| 10k-users.js | 10,000 | Requires backend running |
| 20k-users.js | 20,000 | Requires backend running |

### Chaos Test Scripts

Location: `apps/backend/test/chaos/`

- Kubernetes chaos experiments (network partition, pod kill)
- Requires cluster access to execute