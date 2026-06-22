# Phase 2 — Backend Coverage Hardening Report

**Date:** 2026-06-22
**Status:** PARTIAL — Coverage improved but below 80% thresholds.

---

## 1. Coverage Baseline vs Current

| Metric | Baseline (Phase 0) | Current | Delta | Target | Status |
|--------|-------------------|---------|-------|--------|--------|
| Statements | 59.78% | 64.55% | +4.77% | ≥80% | ❌ Below |
| Branches | 34.09% | 39.66% | +5.57% | ≥65% | ❌ Below |
| Functions | 34.73% | 41.76% | +7.03% | ≥75% | ❌ Below |
| Lines | 59.02% | 64.04% | +5.02% | ≥80% | ❌ Below |

---

## 2. Tests Added in This Session

| File | Tests Added | Coverage Target |
|------|------------|----------------|
| `test/stripe-gateway.spec.ts` | 10 | `stripe-gateway.service.ts`: 83.33% stmts, 57.14% branches |
| `test/razorpay-gateway.spec.ts` | 13 | `razorpay-gateway.service.ts`: 86.95% stmts, 54.83% branches |
| `test/webhook.service.spec.ts` | +4 expanded | `webhook.service.ts`: 46.59% stmts, 38.55% branches |
| `test/cod-gateway.spec.ts` | 11 | `cod-gateway.service.ts`: 84.21% stmts, 50% branches |
| `test/retry-service.spec.ts` | 10 | `retry.service.ts`: 98.07% stmts, 87.5% branches |
| `test/chargeback.service.spec.ts` | 4 | `chargeback.service.ts`: 43.75% stmts, 21.56% branches |
| `test/delivery.service.spec.ts` | +5 | `delivery.service.ts`: 72.58% stmts, 48% branches |
| `test/nnotification.service.spec.ts` | +3 | `notification.service.ts`: 48.67% stmts, 36.58% branches |

---

## 3. Lowest-Coverage Business-Critical Modules (Unchanged)

| Module | Stmts | Branches | Funcs | Lines |
|--------|-------|----------|-------|-------|
| `services/geo/geo.service.ts` | 20% | 0% | 0% | 17.77% |
| `modules/driver-assignment/dispatch-engine.service.ts` | 17.07% | 0% | 0% | 15% |
| `modules/driver-assignment/eta-intelligence.service.ts` | 25.53% | 0% | 0% | 22.22% |
| `modules/ledger/ledger.service.ts` | 36.84% | 0% | 0% | 29.41% |
| `infra/tracking/tracking.gateway.ts` | 38.56% | 38.02% | 35.71% | 38% |
| `services/loyalty/loyalty.service.ts` | 35.46% | 20.83% | 28.57% | 38.65% |
| `services/notifications/production-notification.service.ts` | 7.81% | 0% | 0% | 4.83% |
| `services/payments/webhook/webhook.service.ts` | 46.59% | 38.55% | 43.47% | 46.03% |
| `services/notifications/notification.service.ts` | 46.01% | 36.58% | 34.37% | 30.2% |
| `services/delivery/enhanced-delivery.service.ts` | 47.92% | 40% | 44.82% | 50% |
| `services/delivery/delivery.service.ts` | 53.22% | 20% | 30% | 52.63% |
| `modules/driver-assignment/driver-assignment.service.ts` | 50% | 28.57% | 31.25% | 49.16% |
| `db/database-failover.service.ts` | 17.46% | 0% | 15.38% | 15% |

---

## 4. CI Gate Status

Current `npm run test:cov` script defines `branches:80, functions:80, lines:80, statements:80` but:
- This script is **not** run in CI.
- CI uses `--passWithNoTests`, which means coverage thresholds are **not enforced** in automation.

**Recommended:** Update CI to run `test:cov` and fail on threshold misses.

---

## 5. Recommended Next Steps for Coverage

1. **Payment webhooks** — Add 6–8 tests for Razorpay event branches (`payment.failed`, `refund.processed`, `refund.failed`) and error paths in `processWebhook`.
2. **COD gateway** — Add 3–4 tests for cash-on-delivery fallback logic (~26% coverage currently).
3. **Delivery service** — Add 4–5 branch-coverage tests (~50% currently).
4. **Retry service** — Add tests for retry logic (~17% coverage).
5. **Tracking gateway** — Add WebSocket event/branch tests (~38% coverage).
6. **Enable CI coverage gate** — Update `.github/workflows/ci-cd.yml` to run `test:cov` and fail on threshold.

---

## 6. Overall Test Count

| Scope | Count | Status |
|-------|-------|--------|
| Backend total | 386 tests | 379 pass, 6 fail (Mongo offline), 1 skip |
| Root unit tests | 134 pass | All workspaces |
| New gateway/webhook tests | 60 | stripe(10) + razorpay(13) + webhook(+4) + COD(11) + retry(10) + chargeback(4) + delivery(+5) + notification(+3) |
| Total backend passing | 379 | Pass (Mongo tests excluded by default) |
