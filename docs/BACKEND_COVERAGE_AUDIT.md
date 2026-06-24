# Backend Coverage Audit

**Date:** 2026-06-23  
**Threshold:** 80% (global)

---

## Coverage Summary

| Metric | Current | Target | Delta | Status |
| ------ | ------- | ------ | ----- | ------ |
| Statements | 80.02% | 80% | +0.02% | ❌ FAILS |
| Branches | 63.05% | 80% | -16.95% | ❌ FAILS |
| Functions | 63.22% | 80% | -16.78% | ❌ FAILS |
| Lines | 79.82% | 80% | -0.18% | ❌ FAILS |

**Source:** `apps/backend/coverage/coverage-summary.json` (generated from actual test run)

---

## Business-Critical Modules Below 80%

### Delivery & Assignment (critical path)

| File | Lines | Branches | Funcs | Notes |
| ---- | ----- | -------- | ----- | ----- |
| `dispatch-engine.service.ts` | 15% | 0% | 0% | Driver dispatch logic largely untested |
| `driver-assignment.service.ts` | 49% | 28% | 31% | Core assignment flows need tests |
| `enhanced-delivery.service.ts` | 50% | 40% | 45% | Enhanced delivery features partial |
| `delivery.service.ts` | 79% | 60% | 70% | Near-target but branches lacking |

### Payment & Refund (financial)

| File | Lines | Branches | Funcs | Notes |
| ---- | ----- | -------- | ----- | ----- |
| `webhook.service.ts` | 46% | 39% | 43% | Webhook handling partial |
| `payments.service.ts` | 82% | 54% | 100% | Functions OK, branches need work |
| `chargeback.service.ts` | 42% | 22% | 25% | Chargeback flows need tests |
| `gateway-factory.service.ts` | 27% | 0% | 33% | Factory logic untested |

### Notification & Communication

| File | Lines | Branches | Funcs | Notes |
| ---- | ----- | -------- | ----- | ----- |
| `notification.service.ts` | 49% | 37% | 65% | Core notifications partial |
| `production-notification.service.ts` | 5% | 0% | 0% | Production provider code untested |
| `notification-preferences.service.ts` | 23% | 0% | 0% | Preferences logic untested |

### Analytics & Loyalty

| File | Lines | Branches | Funcs | Notes |
| ---- | ----- | -------- | ----- | ----- |
| `loyalty.service.ts` | 39% | 21% | 28% | Loyalty program partial |
| `ledger.service.ts` | 29% | 0% | 0% | Financial ledger largely untested |

### Infrastructure & Tracking

| File | Lines | Branches | Funcs | Notes |
| ---- | ----- | -------- | ----- | ----- |
| `tracking.gateway.ts` | 38% | 38% | 36% | WebSocket tracking partial |
| `logging.service.ts` | 12% | 0% | 0% | Logging infrastructure untested |

---

## Coverage-Gated Files (Passing)

| File | Lines | Status |
| ---- | ----- | ------ |
| `auth.service.ts` | 100% | ✅ PASS |
| `wallet.service.ts` | 85% | ✅ PASS |
| `order.service.ts` | 70% | ✅ PASS (above threshold) |
| `tax-reporting.service.ts` | 100% | ✅ PASS |
| `encryption.service.ts` | 91% | ✅ PASS |
| `roles.guard.ts` | 92% | ✅ PASS |

---

## CI Coverage Gate

**Status:** Failed

The CI workflow `.github/workflows/ci-cd.yml:61-63` runs `npm run test:cov` which exits with code 1 due to threshold failures.

**Blocks:** PR merges to main branch until fixed.