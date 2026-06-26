# Backend Architecture

## Overview

SpiceGarden backend is a NestJS 11.1 application with a modular architecture, following Domain-Driven Design principles.

**Source:** `apps/backend/src/`

---

## Application Bootstrap

**File:** `apps/backend/src/main.ts`

### Initialization Order

1. **Config Validation** - Production secrets validated (lines 56-86)
2. **Helmet CSP** - Security headers configured (lines 213-226)
3. **HSTS** - HTTPS enforcement (lines 227-232)
4. **CSRF Protection** - `csrfProtection()` applied (line 233)
5. **CORS** - Origin validation (cors-origin.ts)
6. **MongoDB Sanitization** - NoSQL injection prevention (lines 168-202)
7. **HPP** - HTTP Parameter Pollution protection (line 235)
8. **Dangerous Methods Block** - TRACE/TRACK/DEBUG/CONNECT blocked (lines 238-244)
9. **Body Limit** - 10kb (lines 246-247)
10. **Rate Limiting** - ThrottlerModule configured (lines 113-143)
11. **Sentry** - Error tracking
12. **Prometheus Metrics** - `/metrics` endpoint
13. **App Module** - Root module bootstrapped

---

## Module Architecture

### Root Module

**File:** `apps/backend/src/app.module.ts`

Imports 35+ modules including security, database, queue, and all domain modules.

### Module Categories

#### Infrastructure Modules

| Module | File | Purpose |
|--------|------|---------|
| `SecurityModule` | `apps/backend/src/security/security.module.ts` | Guards, throttling |
| `DatabaseModule` | `apps/backend/src/db/db.module.ts` | TypeORM + Mongoose |
| `QueueModule` | `apps/backend/src/infra/queue/queue.module.ts` | BullMQ workers |
| `ConfigModule` | (NestJS built-in) | Environment config |

#### Domain Modules

| Module | Directory | Purpose |
|--------|-----------|---------|
| `AuthModule` | `services/auth/` | JWT, OTP, sessions |
| `UserModule` | `services/users/` | User CRUD, addresses |
| `RestaurantModule` | `services/restaurant/` | Restaurant, menu, onboarding |
| `OrderModule` | `services/order/` | Order lifecycle |
| `DriverModule` | `services/delivery/` | Driver management |
| `DriverFleetModule` | `services/driver-fleet/` | Fleet operations |
| `DriverAssignmentModule` | `modules/driver-assignment/` | Assignment logic |
| `PaymentModule` | `services/payments/` | Payment orchestration |
| `PaymentProviderModule` | `services/payment-provider/` | Stripe Connect, Razorpay |
| `RefundModule` | `services/refund/` | Refund workflows |
| `WalletModule` | `services/wallet/` | Wallet operations |
| `NotificationModule` | `services/notifications/` | Multi-channel notifications |
| `SupportModule` | `services/support/` | Support tickets |
| `ReviewModule` | `services/review/` | Restaurant reviews |
| `SearchModule` | `services/search/` | Menu/restaurant search |
| `MenuCustomizationModule` | `services/menu-customization/` | Menu, addons, variants |
| `AIModule` | `services/ai/` | Recommendations, chatbot |
| `MapsModule` | `services/maps/` | ETA, rerouting, heatmaps |
| `LoyaltyModule` | `services/loyalty/` | Coupons, referrals, cashback |
| `FinanceModule` | `services/finance/` | GST, reconciliation |
| `GSTModule` | `services/gst/` | GST calculation, invoices |
| `KitchenModule` | `services/kitchen/` | Inventory, recipes, SLA |
| `AnalyticsModule` | `modules/analytics/` | Business analytics |
| `AdminModule` | `services/admin/` | Admin operations |
| `ComplianceModule` | `compliance/` | SOC2, PCI-DSS, GDPR |
| `LegalModule` | `legal/` | Terms, privacy policies |

#### WebSocket Modules

| Gateway | Namespace | File |
|---------|-----------|------|
| `TrackingGateway` | `/` | `infra/tracking/tracking.gateway.ts` |
| `KdsGateway` | `/kds` | `services/restaurant/kds.gateway.ts` |

---

## Database Architecture

### PostgreSQL (TypeORM)

**Configuration:** `apps/backend/src/db/db.module.ts`

| Setting | Value |
|---------|-------|
| Driver | `pg` (node-postgres) |
| ORM | TypeORM |
| Connection | `DB_HOST:PORT/DB_NAME` |
| Entities | 67 TypeORM entities |
| Migrations | Schema via init.sql + entities |

### MongoDB (Mongoose)

**Configuration:** `apps/backend/src/db/db.module.ts`

| Setting | Value |
|---------|-------|
| Driver | Mongoose |
| Schema | Review-related (MongoDB flexible schema) |
| URI | `MONGO_URI` env var |

### Redis

| Use Case | Implementation |
|----------|---------------|
| Caching | IORedis client |
| Rate Limiting | ThrottlerModule Redis store |
| Queue Backend | BullMQ |
| Socket.IO Adapter | Redis for horizontal scaling |

---

## Service Layer Pattern

All modules follow consistent pattern:
```
module/
├── module.ts              # Module definition
├── controller.ts          # HTTP endpoints
├── service.ts             # Business logic
├── dto/                   # Data transfer objects
│   ├── create-*.dto.ts
│   └── update-*.dto.ts
├── entities/              # (or shared db/entities)
└── interfaces/
```

---

## Security Architecture

### Guards (Middleware)

| Guard | File | Purpose |
|-------|------|---------|
| `JwtAuthGuard` | `security/jwt-auth.guard.ts` | JWT validation |
| `RolesGuard` | `security/roles.guard.ts` | Role enforcement |
| `PermissionGuard` | `security/permission.guard.ts` | Permission matrix |
| `ThrottlerGuard` | (NestJS built-in) | Rate limiting |

### Decorators

| Decorator | Purpose |
|-----------|---------|
| `@Roles(role)` | Require specific role |
| `@Permissions(perm)` | Require specific permission |
| `@Public()` | Bypass auth guard |

### Interceptors/Global Pipes

| Component | Purpose |
|-----------|---------|
| ValidationPipe | class-validator DTOs |
| TransformationPipe | class-transformer |
| TimeoutInterceptor | Request timeouts |

---

## Queue Architecture

### BullMQ Workers

| Queue | Processor | Purpose |
|-------|-----------|---------|
| `order-lifecycle` | `order.processor.ts` | Order status transitions |
| `notification-delivery` | `notification.processor.ts` | Multi-channel delivery |
| `payment-retry` | `payment-retry.processor.ts` | Retry failed payments |
| `webhook-retry` | `webhook-retry.processor.ts` | Retry failed webhooks |

### Queue Features

- Exponential backoff retry
- Job deduplication via IDs
- Priority queues
- Scheduled/delayed jobs
- Auto-cleanup (1 day, 1000 jobs)

---

## WebSocket Architecture

### TrackingGateway (`/`)

**Features:**
- Driver location broadcasting
- Order status updates
- Rate-limited connections
- Room-based subscriptions

**Events:**
| Event | Direction | Purpose |
|-------|-----------|---------|
| `tracking:{driverId}` | Server → Client | Driver location |
| `order:update` | Server → Client | Order status change |
| `driver:status` | Server → Client | Driver lifecycle |
| `connect` | Client → Server | Connection establish |

### KdsGateway (`/kds`)

**Features:**
- Kitchen Display System
- Real-time order flow
- Prep status tracking

**Events:**
| Event | Direction | Purpose |
|-------|-----------|---------|
| `newOrder` | Server → Client | New order received |
| `inventoryAlert` | Server → Client | Low stock warning |
| `order:update` | Server → Client | Status change |

---

## Notification Architecture

**File:** `apps/backend/src/services/notifications/notification.service.ts`

### Channels

| Channel | Implementation |
|---------|---------------|
| Push | FCM (Android), APNS (iOS) |
| SMS | Twilio |
| Email | SendGrid / SMTP |
| In-App | Database + WebSocket |

### Flow

1. Business event triggers notification
2. `NotificationService.create()` creates DB record
3. Queue job enqueued to `notification-delivery`
4. `NotificationProcessor` handles delivery per channel
5. Delivery status recorded in `notification_analytics`

---

## Payment Architecture

### Gateway Pattern

**Interface:** `payment-gateway.interface.ts`

| Gateway | File | Integration |
|---------|------|-------------|
| Stripe | `gateways/stripe-gateway.service.ts` | npm `stripe` package |
| Razorpay | `gateways/razorpay-gateway.service.ts` | Raw `fetch()` |
| COD | `gateways/cod-gateway.service.ts` | Internal mock |

### Flow

1. `POST /payments/create-intent` → `PaymentService.createPaymentIntent()`
2. Fraud check via `FraudHardeningService`
3. Idempotency key validation
4. Gateway selection via factory
5. Payment intent created on gateway
6. Webhook endpoint for async confirmation
7. Ledger entry creation on success

---

## Compliance Modules

### SOC2 (`compliance.service.ts`)

- SEC-01 to SEC-05: Security controls
- AVA-01 to AVA-03: Availability
- PI-01 to PI-03: Processing integrity
- CONF-01/02: Confidentiality
- PRI-01 to PRI-03: Privacy

### PCI-DSS (`pci-dss-validation.service.ts`)

- **Compliant:** No card storage, HTTPS, password policy, least privilege
- **Non-compliant:** MFA (configurable), external pentesting

### GDPR (`compliance.service.ts`)

- Data export: `exportUserData()`
- Deletion: `requestUserDataDeletion()`
- PII verification: `verifyPiiEncryption()`
- Retention: Session 90d, audit 3y, user 7y after deletion, orders 10y

---

## Error Handling

### Global Filters

| Filter | Purpose |
|--------|---------|
| `HttpExceptionFilter` | Standard HTTP errors |
| `PrismaExceptionFilter` | Database errors |

### Custom Exceptions

| Exception | File | Purpose |
|-----------|------|---------|
| `MissingEnvError` | `common/errors/missing-env.error.ts` | Missing required env vars |

---

## Monitoring Integration

**File:** `apps/backend/src/infra/monitoring/` or main.ts

- **Prometheus:** `/metrics` endpoint
- **Sentry:** `@sentry/node` + `@sentry/tracing`
- **Health:** `/health` endpoint
- **Custom Metrics:**
  - `http_request_duration_seconds` (histogram)
  - `queue_failures_total` (counter)
  - `payment_failures_total` (counter)
  - `socket_failures_total` (counter)
