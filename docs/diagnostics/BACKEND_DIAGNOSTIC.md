# Backend Diagnostic

**Generated:** 2026-06-24  
**Purpose:** Detailed backend subsystem analysis

## Module Inventory

| Module | Directory | Services | Controllers | Status |
|--------|-----------|----------|-------------|--------|
| Analytics | `src/modules/analytics/` | analytics.service.ts | analytics.controller.ts | Implemented |
| Auth | `src/modules/auth/` + `src/services/auth/` | auth.service.ts, jwt.strategy.ts, google.strategy.ts, facebook.strategy.ts | Minimal | Implemented, test-verified |
| Driver Assignment | `src/modules/driver-assignment/` | driver-assignment.service.ts, dispatch-engine.service.ts, eta-intelligence.service.ts | driver-assignment.controller.ts | Implemented |
| Kitchen | `src/modules/kitchen/` | kitchen.service.ts | kitchen.controller.ts | Implemented |
| Ledger | `src/modules/ledger/` | ledger.service.ts | None (service only) | Implemented |
| Notifications | `src/modules/notifications/` | Multiple notification services | None | Implemented, test-verified |
| Orders | `src/modules/orders/` | order.service.ts | None | Implemented, test-verified |
| Realtime | `src/modules/realtime/` | None | None | Implemented |

## Service Inventory

### Core Services
| Service | File | Lines | Status |
|---------|------|-------|--------|
| EncryptionService | `src/security/encryption.service.ts` | 55 | Implemented, test-verified |
| RedisRateLimitStore | `src/security/redis-rate-limit.store.ts` | - | Implemented |
| AppService | `src/app.service.ts` | - | Implemented |

### Domain Services
| Service | File | Status |
|---------|------|--------|
| AuthService | `src/services/auth/auth.service.ts` | Implemented, test-verified |
| OrderService | `src/services/order/order.service.ts` | Implemented, test-verified |
| PaymentService | `src/services/payments/payments.service.ts` | Implemented, test-verified |
| RestaurantService | `src/services/restaurant/restaurant.service.ts` | Implemented |
| DeliveryService | `src/services/delivery/delivery.service.ts` | Implemented, test-verified |
| DriverAssignmentService | `src/modules/driver-assignment/driver-assignment.service.ts` | Implemented |
| NotificationService | `src/services/notifications/notification.service.ts` | Implemented, test-verified |
| ProductionNotificationService | `src/services/notifications/production-notification.service.ts` | Implemented |
| WalletService | `src/services/wallet/wallet.service.ts` | Implemented, test-verified |
| AdminService | `src/services/admin/admin.service.ts` | Implemented |
| SupportService | `src/services/support/customer-support.service.ts` | Implemented |
| RefundService | `src/services/refund/refund.service.ts` | Implemented |
| LoyaltyService | `src/services/loyalty/loyalty.service.ts` | Implemented |
| SearchService | `src/services/search/search.service.ts` | Implemented |
| MenuCustomizationService | `src/services/menu-customization/menu-customization.service.ts` | Implemented |

## Entity Count

| Location | Count | Key Entities |
|----------|-------|--------------|
| `src/db/entities/` | 64 | User, Restaurant, Order, Payment, Driver, Wallet, etc. |
| `src/services/payments/` | 8 | PaymentFraud, PaymentValidation, PaymentEvent, Idempotency, WebhookRetryQueue, StripeWebhook, etc. |
| **Total** | **72** | - |

## API Controllers

Controllers are spread across service modules:
- Auth: `src/services/auth/`
- Order: `src/services/order/order.controller.ts`
- Payment: `src/services/payments/payments.controller.ts`
- Restaurant: `src/services/restaurant/restaurant.controller.ts`
- Admin: `src/services/admin/admin.controller.ts`
- Wallet: `src/services/wallet/wallet.controller.ts`
- Notification: `src/services/notifications/device.controller.ts`, `notification-preferences.controller.ts`
- Delivery: `src/modules/driver-assignment/driver-assignment.controller.ts`
- Analytics: `src/modules/analytics/analytics.controller.ts`

## Authentication & Security

| Control | Implementation | Evidence |
|---------|----------------|----------|
| JWT Authentication | Passport JWT strategy | `src/services/auth/jwt.strategy.ts` |
| OAuth2 Google/Facebook | Passport strategies | `src/services/auth/{google,facebook}.strategy.ts` |
| Helmet | Middleware configured | `main.ts:215` |
| HPP | Middleware configured | `main.ts:237` |
| Rate Limiting | Express rate-limit + Redis store | `main.ts:136-144` |
| CORS | Custom origin validation | `main.ts:208`, `cors-origin.ts` |
| CSRF Protection | Middleware implemented | `main.ts:235`, `csrf.middleware.ts` |
| MongoDB Sanitization | Custom middleware | `main.ts:172-204` |
| Request Validation | ValidationPipe | `main.ts:272-278` |
| Password Hashing | argon2, bcrypt | Package dependencies |
| Body Size Limit | Configurable (10kb default) | `main.ts:248` |

## Payments

| Gateway | File | Status |
|---------|------|--------|
| Stripe | `stripe-gateway.service.ts` | Implemented, test-verified |
| Razorpay | `razorpay-gateway.service.ts` | Implemented, test-verified |
| COD | `cod-gateway.service.ts` | Implemented, test-verified |
| Payment Hardening | `payment-hardening.service.ts` | Implemented |
| Fraud Detection | `fraud-hardening.service.ts` | Implemented |

## Delivery & Driver Assignment

| Component | File | Status |
|-----------|------|--------|
| DeliveryService | `delivery.service.ts` | Implemented, test-verified |
| DriverAssignmentService | `driver-assignment.service.ts` | Implemented |
| DispatchEngine | `dispatch-engine.service.ts` | Implemented |
| ETA Intelligence | `eta-intelligence.service.ts` | Implemented |

## Wallet & Refunds

| Component | File | Status |
|-----------|------|--------|
| WalletService | `wallet.service.ts` | Implemented, test-verified |
| RefundService | `refund.service.ts` | Implemented, test-verified |
| WalletController | `wallet.controller.ts` | Implemented |
| RefundController | `refund.controller.ts` | Implemented |

## Queues & Jobs

| Queue | Implementation | Status |
|-------|----------------|--------|
| Webhook Retry | `webhook-retry.service.ts` | Implemented |
| Notification Queue | `notification-queue.service.ts` | Implemented |
| BullMQ | Package dependency | Configured |

## WebSockets / Realtime

| Component | File | Status |
|-----------|------|--------|
| Tracking Gateway | `tracking.gateway.ts` | Implemented |
| Realtime Module | `realtime.module.ts` | Implemented |
| Socket.IO | Package dependency | Configured |

## Health & Metrics

| Endpoint | Implementation | Status |
|----------|----------------|--------|
| /health | Likely in controller | Unknown (not found in main files) |
| /metrics | Prometheus endpoint | Implemented, `main.ts:252` |

## Test Coverage Gaps

Per AGENTS.md and test execution, the following modules need additional coverage:
- Branches: 63% (target: 80%)
- Functions: 63% (target: 80%)
- Lines: ~80% (target: 80%)

## Runtime Blockers

| Blocker | Required For | Status |
|---------|--------------|--------|
| PostgreSQL | Database persistence | Blocked (no Docker) |
| MongoDB | Audit/compliance features | Blocked |
| Redis | Rate limiting, queues | Blocked |
| Backend running | Security tests | Blocked |
| Secrets configured | Production startup | Partially configured |

## Production Blockers

1. Coverage thresholds not met (branches, functions)
2. 31 moderate npm vulnerabilities
3. gRPC transport quarantined
4. Production secrets incomplete (3/16 valid)
5. Cannot validate full stack without Docker