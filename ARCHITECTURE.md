# System Architecture

**Version:** 1.0.0
**Date:** 2026-06-26
**Classification:** Evidence-based from source code

## Architectural Style

SpiceGarden uses a **Modular Monolith** architecture built on NestJS. While deployed as a single Node.js process, the codebase is organized into 14 feature modules with clear boundaries, enabling future extraction into microservices if needed.

## High-Level System Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                          │
│  ┌─────────────┐  ┌─────────────────┐  ┌───────────────────────────┐  │
│  │ customer-   │  │ restaurant-     │  │ super-admin               │  │
│  │ web         │  │ dashboard       │  │                           │  │
│  │ (Next.js)   │  │ (Next.js)       │  │ (Next.js)                 │  │
│  │   :3002     │  │   :3003         │  │   :3004                   │  │
│  └──────┬──────┘  └────────┬────────┘  └───────────┬───────────────┘  │
│         │                  │                         │                  │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌───────────▼───────────────┐  │
│  │ customer-  │  │ delivery-       │  │ launcher                  │  │
│  │ mobile     │  │ partner         │  │ (Electron)                │  │
│  │ (Expo)     │  │ (Expo)          │  │                           │  │
│  └──────┬──────┘  └────────┬────────┘  └───────────┬───────────────┘  │
│         │                  │                         │                  │
└─────────┼──────────────────┼─────────────────────────┼──────────────────┘
          │                  │                         │
          └──────────────────┴─────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API GATEWAY   │
                    │   NestJS :3001  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
    │ PostgreSQL│        │ MongoDB │        │  Redis  │
    │   TypeORM  │        │ Mongoose│        │ ioredis  │
    │   :5432    │        │ :27017  │        │ :6379    │
    └───────────┘        └─────────┘        └─────────┘
                             │
                    ┌────────▼────────┐
                    │ BullMQ Queues    │
                    │ (Redis backed)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Observability    │
                    │ Prometheus :9090 │
                    │ Grafana :3000    │
                    │ Alertmanager     │
                    │ :9093            │
                    │ Sentry           │
                    │ OpenSearch :9200 │
                    └──────────────────┘
```

## Backend Module Architecture

### Module Dependency Graph

```
AppModule
├── ConfigModule (global)
├── DbModule (global: TypeORM + Mongoose)
│   ├── TypeOrmModule.forRootAsync
│   ├── MongooseModule.forRootAsync
│   └── MongooseModule.forFeature([ReviewSchema])
├── SecurityModule (global)
│   ├── ThrottlerModule
│   ├── SecretLoaderService
│   ├── EncryptionService
│   ├── PermissionGuard
│   └── RolesGuard
├── LoggingModule (global exports)
├── QueueModule (global exports)
│   ├── QueueService (BullMQ)
│   └── OrderProcessor
├── TrackingModule (global exports)
│   └── TrackingGateway (WebSocket)
├── AuthServiceModule
│   ├── AuthController
│   ├── AuthService
│   └── AuthStrategiesModule
├── OrderServiceModule
│   ├── OrderController
│   └── OrderService
├── PaymentServiceModule
│   ├── PaymentsController
│   ├── PaymentsService
│   ├── PaymentHardeningService
│   ├── FraudHardeningService
│   ├── RetryService
│   ├── IdempotencyService
│   ├── GatewayFactoryService
│   ├── StripeGatewayService
│   ├── RazorpayGatewayService
│   ├── CodGatewayService
│   ├── WebhookController -> WebhookService
│   ├── WebhookRetryModule -> WebhookRetryService
│   └── ChargebackModule -> ChargebackService
├── RestaurantServiceModule
│   ├── RestaurantController
│   ├── RestaurantService
│   ├── RestaurantOpsController -> RestaurantOpsService
│   ├── BusinessEngineController -> BusinessEngineService
│   ├── OnboardingController -> RestaurantOnboardingService
│   ├── MenuModerationService
│   ├── PayoutService
│   ├── BranchManagementService
│   └── CommissionService
├── SearchServiceModule
│   ├── SearchController
│   └── SearchService
├── DeliveryServiceModule
│   ├── DeliveryModule (services)
│   ├── EnhancedDeliveryModule
│   └── DriverOpsController -> DriverOnboardingService, DriverPayoutService
├── AdminServiceModule
│   ├── AdminController
│   └── AdminService
├── NotificationModule
│   ├── NotificationController
│   ├── DeviceController
│   ├── NotificationPreferencesController
│   ├── NotificationQueueController -> NotificationQueueService
│   ├── NotificationService
│   └── ProductionNotificationService
├── KitchenModule
│   ├── KitchenController
│   └── KitchenService
├── DriverAssignmentModule
│   ├── DriverAssignmentController
│   ├── DriverAssignmentService
│   └── ETAIntelligenceService
├── MetricsModule
│   ├── MetricsController
│   └── MetricsService
├── ComplianceModule
│   ├── ComplianceController
│   ├── ComplianceService
│   ├── Soc2ReadinessService
│   ├── PciDssValidationService
│   └── SecretsRotationService
├── AuditModule
│   ├── AuditController
│   └── AuditService
├── WalletModule
│   ├── WalletController
│   └── WalletService
├── GSTModule
│   ├── GSTController
│   └── GSTService
├── FinanceModule
│   ├── FinanceController
│   ├── TaxReportingService
│   └── ReconciliationService
├── SupportModule
│   ├── SupportController
│   ├── CustomerSupportService
│   └── TicketRoutingService
├── RefundModule
│   ├── RefundController
│   └── RefundService
├── LoyaltyModule
│   ├── LoyaltyController
│   └── LoyaltyService
├── DriverFleetModule
│   ├── DriverFleetController
│   └── DriverFleetService
├── AnalyticsModule
│   ├── AnalyticsController
│   └── AnalyticsService
├── ReviewServiceModule
│   ├── ReviewController
│   └── ReviewService
├── UserProfileModule
│   └── UserProfileController -> UserProfileService
├── ApisModule
│   ├── ApisController
│   └── ApisService
├── LegalModule
│   └── LegalController
├── GatewayModule (empty - placeholder)
└── GrpcModule
    ├── GrpcAppModule
    ├── OrderGrpcController @GrpcMethod
    └── AuthGrpcController @GrpcMethod (STUB)
```

## Data Flow Patterns

### Order Lifecycle Flow

```
Customer (Web/Mobile)
    │
    ▼
[POST /orders] AuthMiddleware → RateLimit → Validation
    │
    ▼
OrderService.placeOrder()
    │
    ├─► Validate items & totals
    ├─► Create OrderEntity (status: PLACED)
    ├─► Enqueue ORDER_LIFECYCLE job
    └─► Return order
    │
    ▼ (async via BullMQ)
OrderProcessor.processOrderLifecycle()
    │
    ├─► PaymentService.createPaymentIntent()
    │       ├─► FraudHardeningService.checkPaymentFraud()
    │       ├─► IdempotencyService.validateOrCreate()
    │       └─► GatewayFactory → Stripe/Razorpay/COD
    │
    ├─► (on success) OrderEntity.status = PAYMENT_CONFIRMED
    ├─► NotificationService.notifyOrderUpdate()
    │
    ├─► Restaurant KDS (WebSocket push)
    │       └─► KdsGateway → kitchen staff
    │
    ├─► DriverAssignmentService.assignDriverToOrder()
    │       ├─► Find available drivers (geo-radius query)
    │       ├─► Create DriverAssignmentEntity
    │       └─► TrackingGateway.publishToRoom('order:${id}')
    │
    └─► (on delivery) OrderEntity.status = DELIVERED
```

### Payment Flow

```
Customer → [POST /payments/create-intent]
    │
    ▼
FraudHardeningService.checkPaymentFraud()
    ├─► IP velocity check
    ├─► Amount anomaly check
    └─► User history check
    │
    ▼ (if allowed)
IdempotencyService.validateOrCreate()
    │
    ▼
GatewayFactory.getGateway()
    │
    ├──► StripeGateway.createPaymentIntent()
    ├──► RazorpayGateway.createPaymentIntent()
    └──► CodGateway.createPaymentIntent()
    │
    ▼
Return { clientSecret, gateway }

Webhook Flow:
    Stripe/Razorpay → [POST /payments/webhook]
        │
        ▼
    WebhookService.processWebhook()
        ├─► Verify signature
        ├─► Parse event
        ├─► Update OrderEntity.paymentStatus
        ├─► LedgerService.recordEntry()
        └─► Enqueue WEBHOOK_RETRY (on failure)
```

### Authentication Flow

```
Client → [POST /auth/login]
    │
    ▼
AuthService.validateUser()
    ├─► Find UserEntity by email
    ├─► Compare password (argon2/bcrypt)
    └─► Set req.user
    │
    ▼
AuthService.login()
    ├─► Generate accessToken (JWT, 7d expiry)
    ├─► Generate refreshToken (40 chars, random)
    ├─► Create SessionEntity
    └─► Return { accessToken, refreshToken, user }

Refresh:
    [POST /auth/refresh-token]
        ├─► Find SessionEntity by refreshToken
        ├─► Validate session not expired
        ├─► Generate new accessToken
        └─► Return tokens

Guards:
    JwtAuthGuard → Passport JWT strategy
    RolesGuard → @Roles() decorator
    PermissionGuard → @Permissions() decorator
```

### Real-time Tracking Flow

```
Driver App → WebSocket (client)
    │
    ▼
TrackingGateway.handleLocationUpdate()
    ├─► Validate driverId pattern
    ├─► Validate lat/lng bounds
    └─► server.to(`tracking:${driverId}`).emit('locationUpdate')
    │
    ▼
Customer Web/Mobile (subscribed to `tracking:${driverId}`)
    └─► Receives { lat, lng, heading, speed, timestamp }

Order Status Updates:
    └─► server.to(`order:${orderId}`).emit('orderStatusUpdate')
```

## Frontend Architecture

### customer-web (Next.js)
- **Pages Router** (Next.js 15 Pages Router, not App Router)
- **State**: Redux Toolkit (slices: auth, cart) + TanStack React Query
- **Networking**: Socket.IO client for real-time
- **UI**: `@spicegarden/ui` shared component library
- **Error Handling**: ErrorBoundary + offline indicator
- **Analytics**: Custom analytics hooks

### restaurant-dashboard (Next.js)
- **Pages Router**
- **State**: useReducer
- **Real-time**: Socket.IO client for KDS updates
- **Features**: Kitchen Display System, inventory management, audio alerts

### super-admin (Next.js)
- **Pages Router**
- **State**: useReducer
- **Real-time**: Socket.IO client for live stats
- **Features**: Analytics dashboard, driver fleet, loyalty, support tickets

### customer-mobile (Expo)
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **Screens**: 14 implemented
- **Location**: expo-location
- **Notifications**: expo-notifications

### delivery-partner (Expo)
- **Navigation**: React Navigation
- **Location**: expo-location
- **Real-time**: Socket.IO client
- **Features**: Delivery flow, OTP verification, earnings

## Data Persistence Strategy

### PostgreSQL (TypeORM)
**Purpose**: Primary relational store for structured, transactional data.

**52 Entities** managed via TypeORM with:
- UUID primary keys
- Enum types for statuses/roles
- Decimal precision for monetary values
- Simple-JSON for flexible metadata
- Automatic timestamps (createdAt, updatedAt, deletedAt)
- `synchronize: true` in development (auto-schema sync)

### MongoDB (Mongoose)
**Purpose**: Document store for flexible schemas and audit data.

**Single schema registered in DbModule**:
- `ReviewDocument` - Customer reviews with media

Direct MongoDB connections via `mongo-sanitize` for injection protection.

### Redis
**Purpose**: Multi-role cache and queue infrastructure.

**Usage**:
- Rate limiting store (RedisRateLimitStore)
- BullMQ job queue backend
- Session cache (planned)
- WebSocket message queue

## Security Architecture Layers

1. **Network Layer**: Helmet security headers, HSTS, CSP
2. **Transport Layer**: CORS strict whitelist, CSRF double-submit
3. **Input Layer**: MongoDB sanitization, HPP, body size limits
4. **Application Layer**: JWT guards, RBAC + PBAC, rate limiting
5. **Data Layer**: AES-256 PII encryption, password hashing (argon2)
6. **Runtime Layer**: Methods denylist (TRACE, TRACK, DEBUG, CONNECT)

## Deployment Architecture

### Development
- Docker Compose with 13 services on `spicegarden-net` bridge network
- Health checks for all data services
- Backend depends on postgres, mongo, redis (healthy)

### Production (Kubernetes)
- Namespace-per-environment (spicegarden-staging, spicegarden-production)
- Secrets via Kubernetes secrets + ConfigMap
- Rolling updates with maxSurge=1, maxUnavailable=0
- PodAntiAffinity for high availability
- HPA for autoscaling
- NetworkPolicy for zero-trust network segmentation
- Daily backup CronJob

## Scalability Considerations

- **Stateless backend**: Multiple replicas behind load balancer
- **Database**: PostgreSQL read replicas (configured via K8s manifests)
- **Redis**: Cluster mode supported (`redis-cluster.yaml`)
- **WebSocket**: Socket.IO adapter for multi-instance scaling
- **Queue**: BullMQ with Redis provides at-least-once processing
- **Static Assets**: CDN-ingress.yaml includes CDN + Ingress configuration

## Event-Driven Architecture

### WebSocket Events
- `locationUpdate` - Driver location push
- `orderStatusUpdate` - Order state changes
- `driverAssigned` - Assignment notifications
- `kdsUpdate` - Kitchen display updates
- `newOrder` - Incoming orders to kitchen
- `driverEvent` - Driver lifecycle events

### Queue Events (BullMQ)
- `ORDER_LIFECYCLE` - Order processing pipeline
- `NOTIFICATION_DELIVERY` - Notification dispatch
- `PAYMENT_RETRY` - Failed payment retries
- `WEBHOOK_RETRY` - Failed webhook redelivery

## Observability

### Metrics (Prometheus)
Exposed at `/metrics` via prom-client:
- `http_requests_total{method, route, status_code}`
- `http_request_duration_seconds{method, route, status_code}`
- Node.js built-in metrics (event loop, memory, GC)

### Logging
Structured logging via `LoggingModule` with Sensitive Data sanitization support via `sanitizeForLog()`.

### Tracing
- Sentry spans for backend operations
- Express error handler integration

### Alerting
Alertmanager configured with:
- Slack webhook integration
- PagerDuty routing key support
- Inhibit rules (critical > warning)
- Group wait: 30s, Repeat interval: 3h
