# Backend

**Framework:** NestJS 11.1.27  
**Port:** 3001  
**Language:** TypeScript 5.x  
**ORM:** TypeORM 1.0.0 (PostgreSQL) + Mongoose 9.7.0 (MongoDB)  
**Queue:** BullMQ 5.78.1 (Redis)  
**Real-time:** Socket.IO 4.7.0  
**Entry Point:** `dist/src/main.js`

---

## Architecture Overview

The backend is a NestJS modular monolith exposing REST and WebSocket APIs. It follows a layered architecture with clear separation between controllers, services, data access, and infrastructure concerns.

```
apps/backend/src/
├── modules/           # Feature modules (analytics, auth, driver-assignment, kitchen, ledger, notifications, orders, realtime)
├── services/          # Business logic (60+ services across 18 domains)
├── db/                # TypeORM entities (66), migrations, data sources
├── controllers/       # Legacy/base controllers
├── security/          # Guards, middleware, encryption, vault
├── infra/             # Queue, tracking, secret loading, observability
├── compliance/        # SOC2, PCI-DSS, GDPR/DPDP validation
├── audit/             # Audit logging
├── logging/           # Structured logging
├── metrics/           # Prometheus metrics endpoint
├── shared/            # Domain interfaces (user.interface, etc.)
├── grpc/              # gRPC stubs (quarantined)
├── apis.controller.ts # Public API menu endpoints
├── apis.service.ts
├── app.module.ts      # Root module
└── main.ts            # Bootstrap
```

---

## Modules

| Module | Import Name | Purpose |
|--------|-------------|---------|
| Analytics | `AnalyticsModule` | Business intelligence and reporting |
| Auth | `AuthServiceModule` | Authentication, password reset, social login |
| Driver Assignment | `DriverAssignmentModule` | Dispatch engine, ETA intelligence, route optimization |
| Kitchen | `KitchenModule` | Kitchen display system, SLA tracking |
| Ledger | `LedgerModule` | Double-entry ledger, reconciliation |
| Notifications | `NotificationsModule` | Push, SMS, email, in-app notification orchestration |
| Orders | `OrdersModule` | Order lifecycle management |
| Realtime | `RealtimeModule` | Socket.IO gateway and event broadcasting |
| Admin Service | `AdminServiceModule` | Admin dashboard APIs |
| Compliance | `ComplianceModule` | SOC2, PCI-DSS, secrets rotation |
| Audit | `AuditModule` | Audit trail and logging |
| Metrics | `MetricsModule` | Prometheus metrics exposition |

---

## Controllers

### Public Endpoints (No Auth)

| Controller | Base Path | Endpoints |
|-----------|-----------|-----------|
| `ApisController` | `/apis` | `GET /apis`, `GET /apis/:menuId` |
| `AuthController` | `/auth` | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh-token`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/verify-reset-code`, `POST /auth/reset-password`, `GET /auth/google`, `GET /auth/google/callback`, `GET /auth/facebook`, `GET /auth/facebook/callback` |
| Payments Webhook | `/payments/webhook` | `POST /payments/webhook` (Stripe/Razorpay signature verified) |
| `MetricsController` | `/metrics` | `GET /metrics` (Prometheus exposition format) |

### Protected Endpoints (JWT + Roles Required)

| Controller | Base Path | Roles |
|-----------|-----------|-------|
| `OrderController` | `/orders` | CUSTOMER, ADMIN, SUPER_ADMIN, DELIVERY_PARTNER |
| `PaymentsController` | `/payments` | CUSTOMER, ADMIN, SUPER_ADMIN |
| `RestaurantController` | `/restaurants` | Mixed (public read, RESTAURANT/ADMIN write) |
| `WalletController` | `/wallet` | CUSTOMER (read), ADMIN/FINANCE (write) |
| `UserProfileController` | `/user` | CUSTOMER, RESTAURANT |
| `AddressController` | `/addresses` | CUSTOMER |
| `PaymentMethodsController` | `/payment-methods` | CUSTOMER |
| `ReviewController` | `/reviews` | CUSTOMER (create), PUBLIC (read) |
| `LoyaltyController` | `/loyalty` | CUSTOMER, ADMIN |
| `SupportController` | `/support` | SUPPORT_STAFF, ADMIN |
| `RefundController` | `/refunds` | CUSTOMER (create), ADMIN/FINANCE (process) |
| `DriverOpsController` | `/drivers` | DELIVERY_PARTNER, ADMIN, SUPER_ADMIN |
| `DriverFleetController` | `/fleet` | DELIVERY, ADMIN |
| `MapsController` | `/maps` | Varies by endpoint |
| `MenuCustomizationController` | `/menu-customization` | RESTAURANT, ADMIN |
| `AnalyticsController` | `/analytics` | ADMIN, RESTAURANT, FINANCE_STAFF |
| `AdminController` | `/admin` | ADMIN, SUPER_ADMIN |
| `FinanceController` | `/finance` | FINANCE_STAFF, ADMIN |
| `GSTController` | `/gst` | FINANCE_STAFF, ADMIN |
| `GeoController` | `/geo` | Varies |
| `SearchController` | `/search` | Mixed |
| `NotificationPrefsController` | `/notification-preferences` | CUSTOMER, RESTAURANT, DELIVERY_PARTNER |
| `DeviceController` | `/devices` | CUSTOMER, RESTAURANT, DELIVERY_PARTNER |
| `ComplianceController` | `/compliance` | ADMIN, SUPER_ADMIN |
| `LegalController` | `/legal` | ADMIN, SUPER_ADMIN |
| `PaymentProviderController` | `/payment-provider` | RESTAURANT, ADMIN |
| `ChargebackController` | `/chargebacks` | ADMIN, FINANCE_STAFF |
| `WebhookController` | `/payments/webhook` | Public (signature verified) |

---

## Services

### Core Business Services

| Service | Location | Responsibility |
|---------|----------|---------------|
| `AuthService` | `services/auth/` | Login, registration, JWT generation, password hashing (argon2/bcrypt), social auth |
| `PasswordResetService` | `services/auth/` | Forgot password flow, OTP verification, password reset |
| `OrderService` | `services/order/` | Order placement, lifecycle transitions, status queries |
| `PaymentService` | `services/payments/` | Payment intent creation, processing via gateway factory |
| `GatewayFactoryService` | `services/payments/` | Polymorphic payment gateway selection (Stripe, Razorpay, COD) |
| `StripeGatewayService` | `services/payments/gateways/` | Stripe API integration |
| `RazorpayGatewayService` | `services/payments/gateways/` | Razorpay API integration |
| `CODGatewayService` | `services/payments/gateways/` | Cash on Delivery processing |
| `FraudHardeningService` | `services/payments/` | Payment fraud detection and blocking |
| `PaymentHardeningService` | `services/payments/` | Payment security hardening |
| `IdempotencyService` | `services/payments/` | Idempotent payment operations |
| `RetryService` | `services/payments/` | Retry logic with backoff for payment operations |
| `WebhookService` | `services/payments/webhook/` | Stripe/Razorpay webhook processing |
| `WebhookRetryService` | `services/payments/webhook/` | Dead-letter queue for failed webhooks |
| `ChargebackService` | `services/payments/chargeback/` | Chargeback and dispute management |
| `RefundService` | `services/refund/` | Refund orchestration and approval workflows |
| `RestaurantService` | `services/restaurant/` | Restaurant listing, search, nearby geo-search |
| `OnboardingService` | `services/restaurant/` | Restaurant onboarding workflow |
| `RestaurantOpsService` | `services/restaurant/` | Restaurant operations management |
| `BranchManagementService` | `services/restaurant/` | Multi-branch management |
| `MenuModerationService` | `services/restaurant/` | Menu approval and moderation |
| `CommissionService` | `services/restaurant/` | Commission calculation |
| `PayoutService` | `services/restaurant/` | Payout processing |
| `BusinessEngineService` | `services/restaurant/` | Business rules engine |
| `DeliveryService` | `services/delivery/` | Delivery orchestration |
| `EnhancedDeliveryService` | `services/delivery/` | Enhanced delivery features |
| `DriverOnboardingService` | `services/delivery/` | Driver onboarding and document verification |
| `DriverPayoutService` | `services/delivery/` | Driver earnings and payout |
| `HeatmapService` | `services/delivery/` | Delivery demand heatmap |
| `DriverFleetService` | `services/driver-fleet/` | Fleet management |
| `SearchService` | `services/search/` | Full-text search and recommendations |
| `MapsService` | `services/maps/` | Google Maps integration, geocoding |
| `MenuCustomizationService` | `services/menu-customization/` | Menu item customization options |
| `LoyaltyService` | `services/loyalty/` | Coupons, referrals, cashback |
| `WalletService` | `services/wallet/` | Wallet balance, transactions, COD processing |
| `AdminService` | `services/admin/` | Admin dashboard data |
| `UserProfileService` | `services/user/` | User profile management |
| `AddressService` | `services/users/` | Address CRUD and defaults |
| `PaymentMethodsService` | `services/users/` | Payment method management |
| `FinanceService` | `services/finance/` | Financial reporting and analytics |
| `ReconciliationService` | `services/finance/` | Payment reconciliation |
| `TaxReportingService` | `services/finance/` | Tax and GST reporting |
| `GSTService` | `services/gst/` | GST calculation and HSN/SAC management |
| `ReviewService` | `services/review/` | Review and rating management |
| `SupportService` | `services/support/` | Customer support ticket routing |
| `CustomerSupportService` | `services/support/` | Support ticket operations |
| `TicketRoutingService` | `services/support/` | Intelligent ticket routing |
| `GeoService` | `services/geo/` | Geospatial queries |
| `EnhancedGeoService` | `services/geo/` | Enhanced geo-spatial features |
| `AnalyticsService` | `modules/analytics/` | Analytics aggregation |
| `DriverAssignmentService` | `modules/driver-assignment/` | Driver-to-order matching |
| `DispatchEngineService` | `modules/driver-assignment/` | Dispatch logic and optimization |
| `ETAIntelligenceService` | `modules/driver-assignment/` | ETA prediction and intelligence |
| `KitchenService` | `modules/kitchen/` | Kitchen display system logic |
| `LedgerService` | `modules/ledger/` | Double-entry ledger entries |
| `NotificationService` | `services/notifications/` | Notification dispatch |
| `ProductionNotificationService` | `services/notifications/` | Production notification handling |
| `NotificationQueueService` | `services/notifications/queue/` | Queued notification processing |
| `AIService` | `services/ai/` | AI feature service (if applicable) |

### Infrastructure Services

| Service | Location | Responsibility |
|---------|----------|---------------|
| `EncryptionService` | `security/` | AES encryption/decryption |
| `VaultService` | `security/` | Secrets vault integration |
| `SecretLoaderService` | `infra/` | File-based secret loading |
| `QueueService` | `infra/queue/` | BullMQ queue management and job processing |
| `OrderProcessor` | `infra/queue/` | Order lifecycle queue processor |
| `TrackingGateway` | `infra/tracking/` | WebSocket tracking gateway |
| `LoggerService` | `infra/observability/` | Structured logging |
| `MetricsService` | `metrics/` | Prometheus custom metrics |
| `LatencyMetricsInterceptor` | `metrics/` | HTTP latency tracking |
| `ComplianceService` | `compliance/` | Compliance validation |
| `SOC2ReadinessService` | `compliance/` | SOC2 compliance checks |
| `SecretsRotationService` | `compliance/` | Automatic secrets rotation |
| `PCIDSSValidationService` | `compliance/` | PCI-DSS compliance validation |
| `AuditService` | `audit/` | Audit logging |
| `DatabaseFailoverService` | `db/` | Database failover handling |
| `LoggingService` | `logging/` | Application logging |

---

## Entities

The backend uses 66 TypeORM entities for PostgreSQL relational data and Mongoose schemas for MongoDB document storage.

| Entity | Domain | Key Fields |
|--------|--------|-----------|
| `UserEntity` | Users | id, email, phone, passwordHash, fullName, role, status |
| `UserDeviceEntity` | Users | id, userId, deviceType, fcmToken, apnsToken |
| `UserSessionEntity` | Users | id, userId, refreshToken, expiresAt, deviceInfo |
| `RestaurantEntity` | Restaurants | id, name, slug, address, phone, isActive |
| `RestaurantBranchEntity` | Restaurants | id, restaurantId, branchName, address, location (JSONB), openingTime, closingTime |
| `OrderEntity` | Orders | id, userId, restaurantId, status, total, items (JSONB), createdAt, updatedAt |
| `OrderItemEntity` | Orders | id, orderId, menuItemId, name, quantity, price, modifiers |
| `MenuItemEntity` | Menu | id, restaurantId, name, description, price, image, categoryId |
| `MenuCategoryEntity` | Menu | id, restaurantId, name, description, sortOrder |
| `MenuAddonEntity` | Menu | id, menuItemId, name, price, type |
| `MenuItemAvailabilityEntity` | Menu | id, menuItemId, isAvailable, reason, date |
| `MenuVariantEntity` | Menu | id, menuItemId, name, price |
| `MenuModerationEntity` | Menu | id, menuItemId, status, reviewedBy, notes |
| `RecipeEntity` | Kitchen | id, menuItemId, ingredients, instructions |
| `FoodPrepEntity` | Kitchen | id, orderItemId, status, startedAt, completedAt |
| `InventoryItemEntity` | Inventory | id, restaurantId, name, inStock, threshold, unit |
| `InventoryAlertEntity` | Inventory | id, inventoryItemId, alertType, acknowledged |
| `SupplierEntity` | Inventory | id, name, contact, address |
| `BatchEntity` | Inventory | id, inventoryItemId, batchNumber, expiryDate |
| `WalletEntity` | Wallet | id, userId, balance, currency |
| `WalletTransactionEntity` | Wallet | id, walletId, type, amount, description, referenceId |
| `DriverEntity` | Delivery | id, userId, licenseNumber, vehicleType, kycStatus |
| `DriverAssignmentEntity` | Delivery | id, orderId, driverId, status, assignedAt |
| `DriverShiftEntity` | Delivery | id, driverId, startTime, endTime, earnings |
| `DriverDocumentEntity` | Delivery | id, driverId, type, url, expiryDate, verified |
| `DriverFraudEntity` | Delivery | id, driverId, incidentType, description, severity |
| `DriverScoreEntity` | Delivery | id, driverId, score, completedOrders, cancelledOrders |
| `DriverIncentiveEntity` | Delivery | id, driverId, type, amount, description, status |
| `DriverPenaltyEntity` | Delivery | id, driverId, reason, amount, status |
| `NotificationEntity` | Notifications | id, userId, type, title, body, data, status |
| `NotificationPreferenceEntity` | Notifications | id, userId, channel, enabled |
| `NotificationAnalyticsEntity` | Notifications | id, notificationId, openedAt, clickedAt |
| `DeviceFingerprintEntity` | Security | id, userId, fingerprint, ipAddress |
| `PaymentMethodEntity` | Payments | id, userId, type, provider, last4, expiry |
| `PaymentWebhookEntity` | Payments | id, gateway, eventType, payload, processed |
| `PaymentDisputeEntity` | Payments | id, paymentId, gateway, status, reason |
| `StripeWebhookEntity` | Payments | id, stripeEventId, type, processed |
| `WebhookRetryQueueEntity` | Payments | id, webhookId, retryCount, nextRetryAt, error |
| `OTPEntity` | Auth | id, email, code, expiresAt, used |
| `SessionEntity` | Auth | id, userId, refreshToken, expiresAt, deviceInfo |
| `AddressEntity` | Users | id, userId, label, address, city, lat, lng, isDefault |
| `SubscriptionEntity` | Users | id, userId, planId, status, startDate, endDate |
| `ReferralEntity` | Loyalty | id, referrerId, refereeId, code, status, reward |
| `CouponEntity` | Loyalty | id, code, discountType, value, minOrder, maxUses, expiresAt |
| `CouponUsageEntity` | Loyalty | id, couponId, userId, orderId, usedAt |
| `GSTDetailEntity` | Finance | id, restaurantId, gstin, pan, legalName |
| `RestaurantGSTEntity` | Finance | id, restaurantId, gstRate, hsnCode, sacCode |
| `HSN SACEntity` | Finance | id, code, description, rate |
| `SupportTicketEntity` | Support | id, customerId, orderId, type, status, priority |
| `RestaurantOnboardingEntity` | Restaurants | id, restaurantId, status, steps, submittedAt |
| `BranchControlEntity` | Restaurants | id, branchId, isOnline, autoAccept, maxOrders |
| `CommissionRuleEntity` | Finance | id, restaurantId, type, value, effectiveFrom |
| `PayoutReportEntity` | Finance | id, restaurantId, period, amount, status |
| `SLAAlertEntity` | Operations | id, entityType, entityId, alertType, threshold, triggeredAt |
| `KitchenSLAEntity` | Kitchen | id, orderId, branchId, estimatedMins, actualMins |
| `DeliverySLAEntity` | Delivery | id, orderId, driverId, estimatedMins, actualMins |
| `SurgeZoneEntity` | Geo | id, areaPolygon, surgeMultiplier, active |
| `RefundEntity` | Payments | id, orderId, userId, amount, reason, status |
| `RefundApprovalEntity` | Payments | id, refundId, approverId, status, notes |
| `AuditLogEntity` | Audit | id, userId, action, entityType, entityId, changes |
| `LedgerEntryEntity` | Finance | id, walletId, type, amount, description, balanceAfter |
| `DeletionRequestEntity` | Privacy | id, userId, status, requestedAt, processedAt |
| `DataExportRequestEntity` | Privacy | id, userId, status, requestedAt, downloadUrl |

---

## Middleware

| Middleware | Location | Purpose |
|-----------|----------|---------|
| `CSRFProtectionMiddleware` | `security/csrf.middleware.ts` | Validates CSRF tokens on state-changing requests |
| `RateLimitMiddleware` | `main.ts` (Redis-backed) | Per-route rate limiting with configurable windows |
| `MongoSanitizeMiddleware` | `main.ts` | Prevents MongoDB query injection |
| `HppMiddleware` | `main.ts` | HTTP Parameter Pollution protection |
| `CompressionMiddleware` | `main.ts` | Gzip response compression |
| `HelmetMiddleware` | `main.ts` | Security headers (CSP, HSTS, etc.) |
| `RequestTimeoutMiddleware` | `main.ts` | 30s request timeout to prevent Slowloris |
| `DangerousMethodBlocker` | `main.ts` | Blocks TRACE, TRACK, DEBUG, CONNECT |

---

## Guards

| Guard | Location | Purpose |
|-------|----------|---------|
| `JwtAuthGuard` | `security/jwt-auth.guard.ts` | Validates JWT access token from Authorization header or cookie |
| `RolesGuard` | `security/roles.guard.ts` | Enforces role requirements via `@Roles()` decorator |
| `PermissionGuard` | `security/permission.guard.ts` | Enforces granular permission requirements via `@Permissions()` decorator |

**Roles:** `customer`, `restaurant`, `kitchen_staff`, `delivery_partner`, `admin`, `super_admin`, `support_staff`, `finance_staff`

---

## Interceptors

| Interceptor | Location | Purpose |
|------------|----------|---------|
| `LatencyMetricsInterceptor` | `metrics/latency-metrics.interceptor.ts` | Records HTTP request duration for Prometheus histograms |

---

## Validation

- **Global ValidationPipe** in `main.ts` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- **class-validator** decorators on DTOs
- **class-transformer** for serialization
- **Docker swagger** (`@nestjs/swagger`) for API documentation generation

---

## Queues

| Queue | Processor | Purpose |
|-------|-----------|---------|
| `QueueService` | `infra/queue/` | BullMQ queue wrapper with Redis connection pooling |
| `OrderProcessor` | `infra/queue/order.processor.ts` | Order lifecycle event processing |
| `NotificationQueueService` | `services/notifications/queue/` | Queued notification dispatch |
| `WebhookRetryService` | `services/payments/webhook/` | Failed webhook retry queue |

---

## Schedulers

- **NestJS Schedule** (`@nestjs/schedule`) for periodic tasks
- Cron jobs configured via decorators

---

## External Integrations

| Integration | Purpose | Implementation |
|-------------|---------|---------------|
| Stripe | Payment processing | `stripe-gateway.service.ts` |
| Razorpay | Payment processing (INR) | `razorpay-gateway.service.ts` |
| Google Maps | Geocoding, routes, ETA | `maps.service.ts` |
| Twilio | SMS notifications | Via `NotificationService` |
| SendGrid | Email notifications | Via SMTP configuration |
| FCM | Firebase push notifications | Via `NotificationService` |
| APNs | Apple push notifications | Via `NotificationService` |
| Sentry | Error tracking | `main.ts` setup with DSN |
| Prometheus | Metrics | `prom-client` with Counter + Histogram |

---

## Security Services

| Service | Location | Purpose |
|---------|----------|---------|
| `EncryptionService` | `security/encryption.service.ts` | AES encryption/decryption for sensitive data |
| `VaultService` | `security/vault.service.ts` | External secrets vault integration |
| `SecretLoaderService` | `infra/secret-loader.service.ts` | File-based secret loading with rotation support |

---

## Request Lifecycle

```
Client Request
    │
    ▼
Express Middleware Stack
    ├── Helmet (security headers)
    ├── CSRF Protection
    ├── Mongo Sanitize
    ├── HPP
    ├── Compression
    ├── Rate Limiter (Redis-backed)
    ├── Dangerous Method Blocker
    ├── JSON Body Parser (10kb limit)
    ├── URL-encoded Body Parser
    └── Request Timeout (30s)
    │
    ▼
NestJS Guards
    ├── JwtAuthGuard
    ├── RolesGuard
    └── PermissionGuard
    │
    ▼
NestJS Interceptors
    ├── LatencyMetricsInterceptor
    └── (custom interceptors)
    │
    ▼
NestJS Pipes
    └── ValidationPipe (global)
    │
    ▼
Controller
    │
    ▼
Service Layer
    │
    ▼
Repository / TypeORM / Mongoose
    │
    ▼
Database
```
