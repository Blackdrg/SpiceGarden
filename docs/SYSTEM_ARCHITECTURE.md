# Architecture

## System Overview

SpiceGarden is a modular monolith built on NestJS, serving as a multi-stakeholder food delivery platform. The architecture follows hexagonal/onion principles with clear module boundaries, polyglot persistence, and event-driven background processing.

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND CHANNELS                        │
│  customer-web:3002  │ restaurant-dashboard:3003            │
│  super-admin:3004   │ customer-mobile (Expo)              │
│  delivery-partner (Expo) │ launcher (Electron)             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS / WSS
┌────────────────────▼────────────────────────────────────────┐
│              BACKEND: NestJS API Gateway                    │
│                    Port 3001                                │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Auth      │ │    Orders   │ │    Payments         │   │
│  │   Module    │ │   Module    │ │    Module           │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ Restaurant  │ │  Delivery   │ │    Kitchen          │   │
│  │   Module    │ │   Module    │ │    Module           │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Wallet    │ │    GST      │ │    Finance          │   │
│  │   Module    │ │   Module    │ │    Module           │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Loyalty   │ │ Notifications│ │   Analytics         │   │
│  │   Module    │ │   Module    │ │    Module           │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Support   │ │    Review   │ │   Compliance        │   │
│  │   Module    │ │   Module    │ │   Module            │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │    Queue    │ │  Tracking   │ │    Metrics          │   │
│  │  (BullMQ)   │ │ Gateway     │ │ (Prometheus)        │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
       ┌─────────────┼─────────────┬──────────────┐
       │             │             │              │
 ┌─────▼─────┐ ┌─────▼─────┐ ┌───▼──────┐ ┌────▼─────────┐
 │ PostgreSQL │ │  MongoDB  │ │  Redis   │ │ OpenSearch   │
 │   Port     │ │  Port     │ │  Port    │ │  Port        │
 │   5432     │ │  27017    │ │  6379    │ │  9200        │
 └───────────┘ └───────────┘ └─────────┘ └──────────────┘
```

## Request Lifecycle

### HTTP Request Flow

1. **Ingress** → Express middleware stack
2. **Security layer** → Helmet CSP + HSTS, HPP, mongo-sanitize, CSRF double-submit
3. **CORS** → Strict origin whitelist (no wildcards in production)
4. **Rate limiting** → Redis-backed rate limiters (configurable per route)
5. **Body parsing** → JSON/URL-encoded with configurable size limits
6. **Metrics** → Prometheus counter + histogram middleware
7. **NestJS guards** → JwtAuthGuard, RolesGuard, PermissionGuard
8. **Validation** → DTO validation with `whitelist: true`, `forbidNonWhitelisted: true`
9. **Controller** → Route handler
10. **Service** → Business logic
11. **Repository** → TypeORM data access
12. **Response** → JSON response with Prometheus metrics

### WebSocket Request Flow

1. **Connection** → TrackingGateway handles `OnGatewayConnection`
2. **Origin check** → CORS origin validation
3. **Rate limit** → Connection attempt rate limiting per IP
4. **Auth** → Socket.IO auth option (token)
5. **Namespace** → `/tracking`, `/kds`, `/admin`, `/driver`
6. **Room join** → `join` event with regex-validated room names
7. **Message handling** → `@SubscribeMessage` decorated handlers
8. **Acknowledgement** → Built-in ack protocol with timeout

### Webhook Flow

1. **Ingress** → Raw body preservation for signature verification
2. **Signature verification** → Stripe/Razorpay webhook secret validation
3. **Idempotency** → IdempotencyService prevents duplicate processing
4. **Retry queue** → WebhookRetryQueue entity for failed webhooks
5. **Payment hardening** → Fraud checks, amount validation
6. **Event emission** → Order status transitions via QueueService

## Module Boundaries

### Service Modules (24 directories)

| Module | Responsibility | Key Entities |
|--------|----------------|--------------|
| `auth` | Authentication, JWT, sessions, OAuth2 | UserEntity, SessionEntity, OTPEntity |
| `order` | Order lifecycle, status transitions | OrderEntity, OrderItemEntity |
| `payments` | Payment gateway abstraction | PaymentWebhookEntity, PaymentMethodEntity |
| `payment-provider` | Gateway implementations | Stripe, Razorpay, COD |
| `restaurant` | Restaurant CRUD, menus, onboarding | RestaurantEntity, RestaurantBranchEntity |
| `search` | Menu/restaurant search | (MongoDB schema) |
| `delivery` | Driver assignment, ETA, tracking | DriverAssignmentEntity, DriverEntity |
| `driver-fleet` | Fleet management, scoring, incentives | DriverScoreEntity, DriverIncentiveEntity, DriverFraudEntity |
| `kitchen` | Kitchen operations, SLA, inventory | BatchEntity, KitchenSlaEntity, InventoryItemEntity |
| `notifications` | Multi-channel notifications | NotificationEntity, NotificationPreferenceEntity |
| `wallet` | Wallet balance, transactions | WalletEntity, WalletTransactionEntity |
| `gst` | HSN/SAC codes, GST calculation | GSTDetailEntity, HsnSacEntity |
| `finance` | Reconciliation, reporting | LedgerEntryEntity, PayoutReportEntity |
| `support` | Ticket routing, disputes | SupportTicketEntity, DisputeEntity |
| `loyalty` | Coupons, referrals, cashback | CouponEntity, CouponUsageEntity, ReferralEntity |
| `refund` | Refund processing | RefundEntity, RefundApprovalEntity |
| `review` | Restaurant/menu reviews | (MongoDB schema) |
| `admin` | Admin operations | - |
| `ai` | AI features | - |
| `user` | User profile management | UserEntity |
| `privacy` | GDPR/DPDP compliance | DataExportRequestEntity, DeletionRequestEntity |
| `geo` | Geocoding, distance matrix | - |
| `maps` | Google Maps integration | - |
| `menu-customization` | Menu item customization | MenuAddonEntity, MenuVariantEntity |

### Feature Modules (8 directories)

| Module | Responsibility |
|--------|----------------|
| `analytics` | Platform metrics, top dishes, churn, heatmap, peak hours |
| `auth` | Auth module (alternative to service module) |
| `driver-assignment` | Intelligent driver dispatch logic |
| `kitchen` | Kitchen module (alternative to service module) |
| `ledger` | Financial ledger entries |
| `notifications` | Notifications module (alternative to service module) |
| `orders` | Orders module (alternative to service module) |
| `realtime` | Realtime module (alternative to WebSocket gateway) |

## Data Persistence Strategy

### Polyglot Persistence

| Database | Technology | Purpose | Entities/Schemas |
|----------|-----------|---------|------------------|
| PostgreSQL 16 | TypeORM 1.0 | Primary relational store | 64 entities |
| MongoDB 7 | Mongoose 9.7 | Document store | Reviews, audit logs |
| Redis 7 | ioredis 5.10 | Cache, sessions, rate limiting, BullMQ queue | Session keys, rate limit counters, BullMQ job data |

### Database Adapters

- `postgres.adapter.ts` - PostgreSQL connection with configuration
- `redis.adapter.ts` - Redis connection for cache and queue

### Caching Strategy

- **Redis** for:
  - Rate limit store (configurable namespace per feature)
  - Session data
  - BullMQ job queue backend
- No explicit application-level cache decoration observed (no `@Cacheable` patterns)

## Background Processing

### BullMQ Queues

Defined in `src/shared/contracts/queues.ts`:

```typescript
export const QUEUE_NAMES = {
  ORDER_LIFECYCLE: 'order_lifecycle',
  DRIVER_ASSIGNMENT: 'driver_assignment',
  NOTIFICATIONS: 'notifications',
  REFUNDS: 'refunds',
  ANALYTICS: 'analytics',
};
```

**Queue Configuration:**
- Default attempts: 3
- Backoff: exponential, base delay 1000ms
- Remove on complete: age 86400s, count 1000
- Remove on failed: age 86400s, count 1000
- Concurrency: configurable via `QUEUE_CONCURRENCY` env var (default 5)
- Lock duration: 60000ms

**Registered Workers:**
- `ORDER_LIFECYCLE` → `OrderProcessor.processOrderLifecycle()`

## Realtime Architecture

### Socket.IO Gateway

**TrackingGateway** (`src/infra/tracking/tracking.gateway.ts`)
- Namespace: `/` (broadcast gateway)
- Supported namespaces: `/tracking`, `/kds`, `/admin`, `/driver`
- Events handled:
  - `ping` / `pong` - Keep-alive
  - `join` - Join room (regex-validated names)
  - `ack` - Message acknowledgement
  - `message` - General message with ack protocol
  - `updateLocation` - Driver location update (validated coordinates)
  - `kdsUpdate` - Kitchen display update
  - `driverEvent` - Driver-specific events

**Connection Security:**
- Origin validation via `isAllowedOrigin()`
- Rate limiting: max 10 connections per minute per IP
- Max HTTP buffer size: 1024 bytes (configurable)
- Ping interval: 10s, Ping timeout: 20s
- WebSocket-only transport (no long-polling fallback)

**Acknowledgement Protocol:**
- Messages can request ack via `requireAck` flag
- Pending acks stored in Map with timeout (default 5000ms)
- Failed acks returned as `{ status: 'timeout' }`

## Security Architecture

### Security Layers

1. **Helmet CSP + HSTS** - Content Security Policy with strict directives
2. **CORS** - Strict origin whitelist (no wildcards in production)
3. **CSRF** - Double-submit cookie pattern
4. **HPP** - HTTP Parameter Pollution protection
5. **Mongo Sanitization** - Prevents NoSQL injection
6. **Rate Limiting** - Redis-backed per-route limiters
7. **Throttler** - NestJS global throttler
8. **Method blocking** - TRACE, TRACK, DEBUG, CONNECT blocked
9. **JWT Auth** - Passport JWT strategy with guard
10. **RBAC** - 8 roles with permission-based guards
11. **AES-256 Encryption** - PII field encryption
12. **Secrets validation** - Production env validation at bootstrap

### Authentication

- **JWT** with refresh tokens
- **OAuth2** Google, Facebook (passport-google-oauth20, passport-facebook)
- **Session management** with device tracking
- **Device fingerprinting** for fraud detection
- **OTP** for phone verification

## gRPC Status

The `packages/grpc-transport` workspace is **QUARANTINED**.
- `createGrpcTransport()` throws `GrpcTransportUnavailableError`
- All `.proto` definitions in `packages/proto` are hand-written TypeScript interfaces
- No actual protoc compilation pipeline exists
- Production flows use REST/WebSocket exclusively
