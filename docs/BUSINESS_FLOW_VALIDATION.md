# Business Flow Validation

**Date:** 2026-06-22
**Auditor:** Kilo (automated repo audit)
**Scope:** Auth, order lifecycle, payment, refund, wallet, delivery, tracking, notification flows

---

## Validation Levels

| Level | Definition |
|---|---|
| Unit tested | Individual functions/methods tested in isolation with mocks. |
| Integration tested | Multiple components tested together, often with testcontainers or in-memory DB. |
| E2E tested | Full flow tested through API endpoints, simulating real client requests. |
| Runtime validated | Flow executed against a running stack with real infrastructure. |
| Production validated | Flow executed in production with real providers (Stripe, Twilio, etc.). |

---

## Flow Validation Matrix

| Flow | Unit | Integration | E2E | Runtime | Production | Evidence |
|---|---|---|---|---|---|---|
| Authentication | Yes | Yes | Yes | **Local only** | No | `test/auth.integration.spec.ts` (6 tests), `test/auth.service.spec.ts`, `test/auth.controller.spec.ts` |
| Registration | Yes | Yes | Yes | **Local only** | No | `test/e2e.spec.ts` includes signup flow |
| Restaurant catalog browse | Yes | Partial | No | **Local only** | No | Backend services/controllers/entities present; reduced smoke browsed |
| Cart / checkout | Yes | Partial | No | **Local only** | No | Frontend slices present; backend cart service present |
| Order placement | Yes | Yes | Yes | **Local only** | No | `test/order-flow.integration.spec.ts`, `test/e2e.spec.ts` (12 tests including complete order flow) |
| Order lifecycle (Kitchen) | Yes | Yes | Yes | **Local only** | No | `test/kitchen.service.spec.ts`, `test/order-kds.integration.spec.ts` |
| Delivery assignment | Yes | Yes | Partial | **Blocked** | No | `test/delivery.integration.spec.ts`, `test/delivery.service.spec.ts`, `test/driver-customer.integration.spec.ts` (4 tests) |
| Live order tracking | Yes | Partial | No | **Blocked** | No | Backend tracking modules + mobile WebSocket service present |
| Payment (mock) | Yes | Yes | Yes | **Local only** | No | `test/payment.integration.spec.ts`, `test/payments.module.spec.ts`, `test/payment-order.integration.spec.ts` |
| Payment (live Stripe) | No | No | No | **Blocked** | No | No Stripe secrets; `stripe-gateway.service.ts` uses mocks |
| Payment (live Razorpay) | No | No | No | **Blocked** | No | No Razorpay secrets; `razorpay-gateway.service.ts` uses mocks |
| Refund | Yes | Yes | Yes | **Local only** | No | `test/refund-wallet.integration.spec.ts`, `test/refund.service.spec.ts` |
| Wallet | Yes | Yes | Yes | **Local only** | No | `test/refund-wallet.integration.spec.ts`, wallet service tests |
| Notifications (mock) | Yes | Partial | No | **Local only** | No | `test/nnotification.service.spec.ts` (3 tests; 48.67% stmt coverage) |
| Notifications (live) | No | No | No | **Blocked** | No | No Twilio/FCM/SendGrid/APNS secrets |
| Admin analytics | Yes | Partial | No | **Local only** | No | Analytics module/controller + super-admin pages present |
| GST/tax | Yes | Partial | No | **Local only** | No | `apps/backend/src/services/finance/tax-reporting.service.ts` (98.46% stmt coverage) |
| Compliance | Yes | Partial | No | **Blocked** | No | Compliance modules/entities present; no external validation |
| Audit logging | Yes | Yes | No | **Local only** | No | `test/audit.service.spec.ts` (1 test) |
| RBAC | Yes | Partial | No | **Local only** | No | `apps/backend/src/security/roles.guard.ts`; `test/rbac-coverage.spec.ts`, `test/security-guards.spec.ts` present |
| WebSocket tracking | Yes | Partial | No | **Blocked** | No | Backend Socket.IO gateway + mobile WebSocket client present |
| Driver-customer matching | Yes | Yes | No | **Local only** | No | `test/driver-customer.integration.spec.ts` (4 tests) |

---

## Evidence Details

### Authentication Flow
- **Backend:** `apps/backend/src/services/auth/auth.service.ts`, `apps/backend/src/controllers/auth.controller.ts`
- **Tests:** `test/auth.integration.spec.ts` (backend integration tests)
- **Runtime:** Local NestJS dev mode; `/auth/login` CORS preflight verified
- **Gap:** No live OAuth (Google/Facebook) validation

### Order Lifecycle
- **Backend:** `apps/backend/src/services/order/order.service.ts`, `apps/backend/src/modules/kitchen/`
- **Tests:** `test/order.service.spec.ts`, `test/order-flow.integration.spec.ts`, `test/order-kds.integration.spec.ts`, `test/kitchen.service.spec.ts`
- **Runtime:** Local only; KDS (Kitchen Display System) integration tested in `test/restaurant-dashboard/__tests__/kds.e2e.test.tsx`

### Payment Flow
- **Backend:** `apps/backend/src/services/payments/gateways/` (stripe, razorpay, COD), `apps/backend/src/services/payments/webhook/`
- **Tests:** `test/payment.integration.spec.ts`, `test/payment-order.integration.spec.ts`, `test/payments.module.spec.ts`
- **Runtime:** Local only with mocks; no live gateway validation
- **Gap:** No Stripe/Razorpay live validation; webhook handling at 46.59% statement coverage

### Delivery Flow
- **Backend:** `apps/backend/src/services/delivery/`, `apps/backend/src/modules/driver-assignment/`
- **Tests:** `test/delivery.integration.spec.ts`, `test/delivery.service.spec.ts`
- **Runtime:** Blocked — requires running backend + mobile apps + Redis

### Notification Flow
- **Backend:** `apps/backend/src/services/notifications/notification.service.ts`
- **Tests:** `test/nnotification.service.spec.ts` (3 tests; 48.67% stmt coverage)
- **Runtime:** Blocked — no Twilio/FCM/SendGrid/APNS secrets

---

## Blocked / Unproven Flows

| Flow | Blocker |
|---|---|
| Live Stripe payment | No Stripe API secrets |
| Live Razorpay payment | No Razorpay API secrets |
| Live notifications | No Twilio/FCM/SendGrid/APNS secrets |
| Live mobile order tracking | No device/emulator validation |
| Live delivery partner location | No device/emulator validation |
| Live WebSocket order tracking | No running backend + Redis + mobile client |
| Full observability stack | Docker daemon unavailable |
| Kubernetes deployment | No cluster API |

---

## Fixtures and Scripts

| Script | Purpose |
|---|---|
| `infra/scripts/e2e-seed-fixtures.js` | Repeatable E2E customer/restaurant/driver/order payloads |
| `infra/scripts/security-tests.js` | SQL injection, XSS, rate limiting, auth bypass, path traversal tests |
| `infra/scripts/penetration-tests.js` | Port scan, security headers, CORS, HTTP methods |
| `infra/scripts/verify-stack.js` | Stack verification script |
| `infra/scripts/validate-env-consistency.js` | Environment file consistency check |
| `infra/scripts/validate-secrets.js` | Secret validation |
| `node infra/scripts/fake-orders.js` | Fake order generation for testing |
| `node infra/scripts/breaking-point.js` | Breaking point load test |
