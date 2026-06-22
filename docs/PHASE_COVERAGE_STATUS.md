# Phase Coverage Status

**Date:** 2026-06-22
**Source:** `apps/backend` Jest coverage report from `npm run test:cov` (coverage-summary.json)

---

## Backend Coverage Summary

| Metric | Current | Target | Gap | Status |
|---|---|---|---|---|
| Statements | 68.41% (2524/3689) | 80% | -11.59% | **Broken / failing** |
| Branches | 43.29% (504/1164) | 80% | -36.71% | **Broken / failing** |
| Functions | 48.44% (249/514) | 80% | -31.56% | **Broken / failing** |
| Lines | 68.11% (2350/3450) | 80% | -11.89% | **Broken / failing** |

Coverage gate is enforced in `apps/backend/package.json` via:
```
"test:cov": "jest --coverage --coverageThreshold={\"global\":{\"branches\":80,\"functions\":80,\"lines\":80,\"statements\":80}}"
```

CI enforces this gate via `.github/workflows/ci-cd.yml` step "Run backend coverage gate".

---

## Module-Level Coverage Gaps

### High-coverage modules (≥90%)

| Module | Stmts | Branches | Funcs | Lines |
|---|---|---|---|---|
| `idempotency.entity.ts` | 100 | 100 | 100 | 100 |
| `idempotency.service.ts` | 100 | 83.33 | 100 | 100 |
| `payment-event.entity.ts` | 100 | 100 | 100 | 100 |
| `payment-fraud.entity.ts` | 100 | 100 | 100 | 100 |
| `shared/domain/order.interface.ts` | 100 | 100 | 100 | 100 |
| `shared/domain/user.interface.ts` | 100 | 100 | 100 | 100 |
| `retry.service.ts` | 98.07 | 87.5 | 100 | 97.91 |

### Low-coverage modules (<50%)

| Module | Stmts | Branches | Funcs | Lines |
|---|---|---|---|---|
| `services/payments/chargeback/chargeback.service.ts` | 43.75 | 21.56 | 25 | 42.30 |
| `services/payments/webhook/webhook.service.ts` | 46.59 | 38.55 | 43.47 | 46.03 |
| `services/notifications/notification.service.ts` | ~48.67 | — | — | — |

### Medium-coverage modules (50-90%)

| Module | Stmts | Branches | Funcs | Lines |
|---|---|---|---|---|
| `services/wallet/wallet.service.ts` | 85.58 | 68.57 | 68.75 | 85.32 |
| `services/payments/gateways/stripe-gateway.service.ts` | 83.33 | 57.14 | 85.71 | 82.50 |
| `services/payments/gateways/razorpay-gateway.service.ts` | 86.95 | 54.83 | 90 | 87.87 |
| `services/payments/gateways/cod-gateway.service.ts` | 84.21 | 50 | 85.71 | 82.35 |
| `services/payments/payments.service.ts` | 82.60 | 54.05 | 100 | 82.08 |
| `services/refund/refund.service.ts` | 75.16 | 40 | 73.33 | 74.82 |
| `services/wallet/wallet.controller.ts` | 72.72 | 0 | 27.27 | 70.96 |

---

## Coverage Trend

| Date | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| 2026-06-20 (earlier baseline) | 59.78% | 34.09% | 34.73% | 59.02% |
| PROD80 Phase 2 (claimed) | 64.55% | 39.66% | 41.76% | 64.04% |
| **2026-06-22 (verified)** | **68.41%** | **43.29%** | **48.44%** | **68.11%** |

Coverage has improved by ~8.6 percentage points in statements since the earlier baseline, but remains ~11.6 percentage points below the 80% target.

---

## CI Coverage Gate Status

| Gate | Threshold | Current | CI Status |
|---|---|---|---|
| Statements | 80% | 68.41% | **FAILING** |
| Branches | 80% | 43.29% | **FAILING** |
| Functions | 80% | 48.44% | **FAILING** |
| Lines | 80% | 68.11% | **FAILING** |

All four coverage gates are currently failing. The CI pipeline will reject any PR that does not bring coverage above these thresholds.

---

## Frontend / Mobile Coverage

No dedicated coverage reports were generated for frontend/mobile workspaces during this audit. Jest configs exist for each workspace but no coverage thresholds are enforced outside the backend.

| Workspace | Tests | Coverage Report |
|---|---|---|
| `@spicegarden/customer-web` | 11 | Not generated |
| `@spicegarden/restaurant-dashboard` | 9 | Not generated |
| `@spicegarden/super-admin` | 23 | Not generated |
| `@spicegarden/customer-mobile` | 33 | Not generated |
| `@spicegarden/delivery-partner` | 6 | Not generated |
| `@spicegarden/ui` | 28 | Not generated |
| `@spicegarden/shared` | 2 | Not generated |

---

## Remaining Gaps

1. **Branches coverage** is the most significant gap (43.29% vs 80% target). Adding tests for conditional logic in services like `refund.service.ts`, `webhook.service.ts`, and `chargeback.service.ts` would have the highest impact.
2. **Functions coverage** (48.44%) indicates many methods are untested. Focus on service classes with low function coverage.
3. **packages/ui build failure** blocks the full workspace build, though tests pass independently.
4. **Frontend/mobile coverage** is untracked; adding coverage gates to these workspaces would improve overall quality assurance.
