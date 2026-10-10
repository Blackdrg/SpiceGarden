# SpiceGarden Architecture Documentation

**Version:** 0.0.0  
**Last Updated:** 2026-06-27  
**Status:** Production (Partially Verified)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Monorepo Architecture](#monorepo-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Data Architecture](#data-architecture)
6. [Authentication Flow](#authentication-flow)
7. [Order Lifecycle](#order-lifecycle)
8. [Payment Flow](#payment-flow)
9. [Real-Time Architecture](#real-time-architecture)
10. [Queue Architecture](#queue-architecture)
11. [Deployment Architecture](#deployment-architecture)
12. [Observability Architecture](#observability-architecture)
13. [Security Architecture](#security-architecture)

---

## System Overview

SpiceGarden is a **modular monolith** NestJS backend serving 6 frontend channels. It uses polyglot persistence (PostgreSQL + MongoDB + Redis) and event-driven orchestration via BullMQ queues.

```
┌──────────────────┐    ┌─────────────────────────────────────────┐
│  customer-web    │    │   restaurant-dashboard                   │
│  :3002           │    │   :3003                                   │
├──────────────────┤    ├─────────────────────────────────────────┤
│  super-admin     │    │  customer-mobile (Expo)                  │
│  :3004           │    │  delivery-partner (Expo)                 │
└─────────┬────────┘    └─────────────────────┬───────────────────┘
          │                                      │
          │         ┌────────────────────────────▼─────────────────┐
          │         │          BACKEND (NestJS) :3001               │
          │         │  apps/backend/src/                            │
          │         │  • 14 feature modules                         │
          │         │  • 40+ controllers                             │
          │         │  • 130+ services                               │
          │         │  • 66 TypeORM entities                         │
          │         │  • 2 WebSocket gateways                        │
          │         │  • BullMQ queue workers                        │
          │         │  • RBAC + PBAC guards                          │
          │         └───────────────────────┬────────────────────────┘
          │                               │
    ┌─────▼──────┐            ┌───────────▼────────────┐
    │ PostgreSQL │            │  MongoDB 7              │
    │    :5432   │            │  :27017                 │
    │   TypeORM  │            │  Mongoose (reviews)     │
    └────────────┘            └────────────────────────┘
    ┌──────────────────┐
    │  Redis 7         │
    │  :6379           │
    │  Queue + Cache + │
    │  Rate Limit      │
    └──────────────────┘
```

---

## Monorepo Architecture

### Workspace Structure

| Workspace | Type | Port | Description |
|-----------|------|------|-------------|
| `@spicegarden/backend` | NestJS API | 3001 | Core backend |
| `@spicegarden/customer-web` | Next.js 15 | 3002 | Customer storefront |
| `@spicegarden/restaurant-dashboard` | Next.js 15 | 3003 | KDS + onboarding |
| `@spicegarden/super-admin` | Next.js 15 | 3004 | Admin console |
| `@spicegarden/customer-mobile` | Expo RN | — | Customer mobile app |
| `@spicegarden/delivery-partner` | Expo RN | — | Delivery partner app |
| `spicegarden-launcher` | Electron | — | Windows desktop launcher |
| `@spicegarden/ui` | Shared lib | — | React component library (20+ components) |
| `@spicegarden/shared` | Shared lib | — | API client, types, constants |
| `@spicegarden/api-types` | Shared lib | — | TypeScript interfaces |
| `@spicegarden/proto` | Shared lib | — | Protobuf definitions |
| `@spicegarden/grpc-transport` | Quarantined | — | Always throws `GrpcTransportUnavailableError` |

**Package Manager:** npm Workspaces (no turborepo, no nx, no lerna)

---

## Backend Architecture

### Module Structure

Root module `AppModule` imports 28+ feature modules.

| Module | Directory | Responsibility |
|--------|-----------|----------------|
| `AuthServiceModule` | `services/auth/` | JWT, OAuth2, session, password reset |
| `OrderServiceModule` | `services/order/` | Order creation, status transitions, refunds |
| `PaymentServiceModule` | `services/payments/` | Stripe, Razorpay, fraud, retry, webhooks |
| `WalletModule` | `services/wallet/` | Balance, transactions, COD |
| `RestaurantServiceModule` | `services/restaurant/` | CRUD, onboarding, branch, menu |
| `DeliveryServiceModule` | `services/delivery/` | Driver ops, onboarding, payout |
| `DriverOpsModule` | `services/delivery/` | Driver operations controller |
| `DriverFleetModule` | `services/driver-fleet/` |.shifts, earnings, incentives, penalties |
| `GSTModule` | `services/gst/` | HSN/SAC, calculation, invoice |
| `FinanceModule` | `services/finance/` | Reconciliation, tax reporting |
| `SupportModule` | `services/support/` | Tickets, routing, disputes |
| `RefundModule` | `services/refund/` | Refund request, approval, processing |
| `LoyaltyModule` | `services/loyalty/` | Coupons, referrals, cashback |
| `SearchModule` | `services/search/` | Restaurant/menu search |
| `ReviewModule` | `services/review/` | Review CRUD (MongoDB) |
| `AnalyticsModule` | `modules/analytics/` | Business analytics |
| `KitchenModule` | `modules/kitchen/` | Inventory, recipes, batches, SLA |
| `DriverAssignmentModule` | `modules/driver-assignment/` | Dispatch, ETA, fraud |
| `UserProfileModule` | `services/user/` | Addresses, payment methods |
| `AdminModule` | `services/admin/` | Dashboard, bans, stats |
| `ComplianceModule` | `compliance/` | GDPR, SOC2, PCI-DSS |
| `AuditModule` | `audit/` | Audit logging |
| `QueueModule` | `infra/queue/` | BullMQ job queues |
| `TrackingModule` | `infra/tracking/` | WebSocket tracking |
| `SecurityModule` | `security/` | Guards, rate limiting, CORS, CSRF |
| `LoggingModule` | `logging/` | Structured logging |
| `MetricsModule` | `metrics/` | Prometheus metrics |
| `PaymentProviderModule` | `services/payment-provider/` | Stripe Connect, Razorpay settlements |

### Application Entry

`apps/backend/src/main.ts`:
- Creates NestJS app with `rawBody: true` for webhook signature verification
- Validates production environment secrets on startup
- Configures Sentry if `SENTRY_DSN` is set
- Registers middleware: Helmet, cookie-parser, CSRF, mongo-sanitize, HPP, rate limiters
- Registers Prometheus metrics middleware
- Global validation pipe (whitelist, forbidNonWhitelisted, transform)
- Listens on port 3001

---

## Frontend Architecture

### customer-web (Next.js 15)
- **Router:** Pages Router (app router not used)
- **State:** Redux Toolkit (auth, cart) + React Query (addresses, notifications, payments) + Context (network status)
- **Realtime:** `socket.io-client` for live tracking
- **Pages:** 21 routes (home, menu, cart, checkout, tracking, history, profile, addresses, subscriptions, wallet, offers, etc.)
- **Middleware:** Request ID injection via `x-request-id` header
- **Error Boundary:** Sentry-based `ErrorBoundary` class component

### restaurant-dashboard (Next.js 15)
- **Router:** Pages Router
- **State:** `useReducer` inline in page components + Redux (dummy/placeholder)
- **Focus:** Kitchen Display System (KDS)
- **Pages:** KDS dashboard, onboarding wizard (6 steps)

### super-admin (Next.js 15)
- **Router:** Pages Router
- **State:** `useReducer` inline + React Query
- **UI:** Recharts for charts
- **Pages:** Overview, live orders, branches, driver fleet, loyalty, analytics, support tickets
- **Instrumentation:** OpenTelemetry + Sentry

### customer-mobile (Expo React Native)
- **Navigation:** React Navigation (Native Stack + Bottom Tabs)
- **Storage:** AsyncStorage
- **Screens:** 14 screens (Auth, Home, Cart, Profile, Tracking, History, Search, Checkout, Addresses, PaymentMethods, Notifications, Onboarding, MenuItemCustomization)
- **Mobile features:** expo-location, expo-notifications, expo-haptics
- **i18n:** 7 Indian locales (en-IN, hi, pa, mr, gu, ta, te)

### delivery-partner (Expo React Native)
- **Structure:** Monolithic `App.tsx` (769 lines)
- **State:** useReducer + AsyncStorage
- **Features:** OTP verification, earnings, order acceptance/rejection, issue reporting, location tracking

### launcher (Electron)
- **Main:** TypeScript + electron-store + electron-updater
- **Renderer:** Webpack + React
- **Target:** Windows desktop (NSIS installer)

---

## Data Architecture

### Polyglot Persistence
| Store | Version | Technology | Purpose |
|-------|---------|-----------|---------|
| Primary RDBMS | PostgreSQL 16 | TypeORM | All transactional data |
| Document DB | MongoDB 7 | Mongoose | Reviews only |
| Cache/Queue | Redis 7 | ioredis + BullMQ | Rate limiting, sessions, job queues |

### Database Configuration

`apps/backend/src/db/db.module.ts`:
- `TypeOrmModule.forRootAsync` for PostgreSQL with `synchronize: true`
- `MongooseModule.forRootAsync` for MongoDB
- `LocalRepositoryModule` fallback for `LOCAL_DB=sqlite` mode (in-memory mock)

---

## Authentication Flow

1. **Login/Register** → `POST /auth/login` or `/auth/register`
2. **Credential Validation** → `AuthService.validateUser()` argon2 password verification
3. **Session Creation** → `AuthService.login()` creates `SessionEntity` with refresh token
4. **Cookie Setting** → `access_token` (1h) + `refresh_token` (30d) as HTTP-only cookies
5. **Subsequent Requests** → `JwtAuthGuard` extracts JWT from cookie or `Authorization: Bearer` header
6. **Token Refresh** → `POST /auth/refresh-token` reads `refresh_token` cookie, rotates
7. **Logout** → `POST /auth/logout` revokes session, clears cookies

### Session Management
- `SessionEntity`: userId, deviceName, deviceType, ipAddress, refreshToken, expiresAt, isActive
- Refresh token rotated on each use
- Single session per device tracked

### OAuth2
- `GET /auth/google` → Passport `google` strategy
- `GET /auth/facebook` → Passport `facebook` strategy
- Callback endpoints set cookies and redirect to `FRONTEND_URL`

---

## Order Lifecycle

```
PLACED → PAYMENT_CONFIRMED → RESTAURANT_ACCEPTED → PREPARING → READY →
DRIVER_ASSIGNED → PICKED_UP → ON_THE_WAY → DELIVERED
Terminal states: CANCELLED, BATCHED
```

**Key characteristics:**
- Atomic cancellation with pessimistic locking
- Duplicate order prevention (5-minute window)
- Stuck order detection and recovery
- Kitchen delay notifications
- Batch mode grouping in KDS

**OrderController:**
- `POST /orders` — place order with idempotency key
- `GET /orders/:id` — get order with details
- `GET /orders/health` — health check

---

## Payment Flow

### Multi-Gateway Architecture

```
Customer → Backend → Gateway Factory → Stripe/Razorpay/COD
                                   ↓
                            Webhook → Backend → Order Status Update
```

### Payment Service Chain
1. `PaymentsController.createPaymentIntent()` → fraud check → idempotency check → retry → gateway
2. `PaymentService.createPaymentIntent()` → gateway factory
3. `GatewayFactory` → `StripeGateway` or `RazorpayGateway` or `CodGateway`
4. Webhook received → `WebhookService.processWebhook()` → signature verification → order status update
5. `RetryService` — exponential backoff for failed payments
6. `IdempotencyService` — 5-min staleness for duplicate prevention
7. `FraudHardeningService` — velocity, patterns, card testing detection

### Webhook Endpoints
- `POST /payments/webhook` — Stripe (`stripe-signature` header) + Razorpay (HMAC-SHA256)
- No authentication required; signature verification only

### Hardening
- `PAYMENT_FRAUD_BLOCK_THRESHOLD` (default 70)
- `PAYMENT_MAX_SINGLE_AMOUNT`, `PAYMENT_DAILY_LIMIT_PER_USER`, `PAYMENT_MAX_TRANSACTIONS_PER_HOUR`
- Block threshold for suspicious patterns

---

## Real-Time Architecture

### WebSocket Gateways

| Gateway | Namespace | Purpose |
|---------|-----------|---------|
| `TrackingGateway` | `/tracking` | Driver location tracking, order status updates |
| `KdsGateway` | `/kds` | Kitchen display real-time updates |

### Client Apps Using WebSockets
| App | Library | Events |
|-----|---------|--------|
| customer-web | `socket.io-client` | `tracking:{driverId}` |
| restaurant-dashboard | `socket.io-client` | `newOrder`, `inventoryAlert` |
| super-admin | `socket.io-client` | `statsUpdate`, `newOrderGlobal`, `kitchenUpdate`, `deliveryHeatmap`, `revenueUpdate` |
| delivery-partner | `socket.io-client` (via service) | `orderAssigned`, `orderCancelled` |
| customer-mobile | `socket.io-client` | Full message queue with acks |

### Room Pattern
- Driver tracking: room `driver:{driverId}`
- Kitchen orders: room `branch:{branchId}`
- Order tracking: room `order:{orderId}`

---

## Queue Architecture

### BullMQ Queues (Redis-backed)

| Queue Name | Consumer | Purpose |
|-----------|----------|---------|
| `ORDER_LIFECYCLE` | `OrderProcessor` | Process order state transitions |
| `NOTIFICATION_DELIVERY` | `NotificationQueue` | Push/SMS/Email delivery |
| `PAYMENT_RETRY` | — | Payment retries on failure |
| `WEBHOOK_RETRY` | — | Webhook delivery retries |

**Queue Configuration:**
- 3 retries with exponential backoff (initial delay 1000ms)
- Completed/failed jobs: 24h retention (1000 count limit)
- Concurrency: `QUEUE_CONCURRENCY` env var (default 5)
- `getQueueStats()` — monitoring per queue

**QueueService** (apps/backend/src/infra/queue/queue.service.ts):
- `enqueue<T>()` — generic job enqueue
- `enqueueOrderLifecycle()` — validated order status job
- `drainQueue()` — drain all jobs
- Graceful `OnModuleDestroy` cleanup

---

## Deployment Architecture

### Development (Docker Compose)
`compose.dev.yaml` — 13 services:
- postgres:5432, mongo:27017, redis:6379
- prometheus:9090, grafana:3000, opensearch:9200
- alertmanager:9093
- backend:3001, customer-web:3002, restaurant-dashboard:3003, super-admin:3004
- opensearch-dashboards:5601

**Security:** All containers `read_only: true`, `no-new-privileges`, resource limits.

### Production (Kubernetes)
| Manifest | Purpose |
|----------|---------|
| `production-hardened.yaml` | Backend deployment (3 replicas, HPA 3-20, PodDisruptionBudget, NetworkPolicy, probes, security context) |
| `postgres-ha.yaml` | PostgreSQL HA |
| `redis-cluster.yaml` | Redis cluster (6 replicas, HPA 6-12) |
| `cdn-ingress.yaml` | CDN + Ingress |
| `configmap.yaml` | ConfigMap |
| `secrets.yaml` | K8s secrets |

---

## Observability Architecture

### Metrics (Prometheus)
- Endpoint: `GET /metrics`
- `http_requests_total` (counter)
- `http_request_duration_seconds` (histogram)
- Node.js default metrics

### Logging
- Custom structured logging (not winston/pino)
- Sensitivity redaction: passwords, tokens, secrets, API keys, credit cards
- OpenSearch for log aggregation

### Error Tracking
- Sentry (backend + customer-web + restaurant-dashboard + UI package)
- `@sentry/nextjs` in Next.js apps, `@sentry/node` in backend

### Alerting
- 5 Prometheus alert rules (HighErrorRate, HighLatency, DatabaseDown, QueueFailures, PaymentFailures)
- Alertmanager → Slack (`#alerts`), PagerDuty

---

## Security Architecture

### Defense in Depth (7 layers)

| Layer | Mechanism | File |
|-------|-----------|------|
| 1 | Helmet CSP + HSTS | `main.ts` |
| 2 | CORS strict whitelist | `security/cors-origin.ts` |
| 3 | CSRF double-submit cookie | `security/csrf.middleware.ts` |
| 4 | Rate limiting (Redis-backed) | `security/redis-rate-limit.store.ts` |
| 5 | MongoDB sanitization + HPP | `main.ts` |
| 6 | JWT + RBAC + PBAC | `security/jwt-auth.guard.ts` |
| 7 | Argon2 password hashing + AES-256 encryption | `security/encryption.service.ts` |

### Authentication
- `JwtAuthGuard` — Passport JWT strategy, reads from cookie or Authorization header
- `RolesGuard` — checks `@Roles()` decorator
- `PermissionGuard` — checks `@Permissions()` decorator
- `@Roles()` and `@Permissions()` are class-level decorators

### CSRF
- Double-submit cookie pattern
- Generates random token, stores in non-HttpOnly cookie, validates via header
- Production-only enforcement; ignores webhooks/auth endpoints

### Rate Limiting
- Per-route configuration with Redis-backed store
- Memory fallback in development
- `/auth/otp`: 3/10min, `/auth/`: 5/15min, `/orders`: 10/15min, `/api/`: 100/15min

### Production Validation
- `MissingEnvError` thrown for unset secrets in production
- Wildcard CORS blocked in production
- JWT_SECRET requires 32+ chars
- ENCRYPTION_SECRET required

---

## Integration Points

| External Service | Protocol | Domain |
|-----------------|----------|--------|
| Stripe | HTTPS API + Webhooks | Payments |
| Razorpay | HTTPS API + Webhooks | Payments (INR) |
| Twilio | HTTPS API | SMS notifications |
| SendGrid | HTTPS API | Email notifications |
| Firebase FCM | HTTPS API | Push notifications |
| Google OAuth2 | OAuth2 | Social login |
| Facebook OAuth2 | OAuth2 | Social login |
| Google Maps | HTTPS API | Maps, ETA, surge zones |
| HashiCorp Vault | Optional HTTPS | Secret management |
