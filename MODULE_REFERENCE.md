# Module Reference

**Date:** 2026-06-26
**Scope:** SpiceGarden Backend Modules
**Classification:** Evidence-based

## Module Inventory (14 Modules)

### 1. ConfigModule

**Type:** Global configuration
**Purpose:** Environment variable management
**File:** Built-in NestJS module

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [path.resolve(process.cwd(), '../../.env'), path.resolve(process.cwd(), '.env')],
})
```

### 2. DbModule

**Type:** Global database
**Purpose:** Database connections
**File:** `src/db/db.module.ts`

**Providers:**
- PostgreSQL (TypeORM)
- MongoDB (Mongoose)
- Redis (ioredis)

### 3. SecurityModule

**Type:** Security controls
**File:** `src/security/security.module.ts`

**Exports:**
- JwtAuthGuard
- RolesGuard
- PermissionsGuard
- CsrfMiddleware
- EncryptionService
- RedisRateLimitStore
- VaultService

### 4. LoggingModule

**Type:** Structured logging
**File:** `src/logging/logging.module.ts`

**Exports:**
- LoggingService

### 5. QueueModule

**Type:** Background jobs
**File:** `src/infra/queue/queue.module.ts`

**Imports:**
- BullMQ (bullmq package)

**Exports:**
- Queue providers

### 6. TrackingModule

**Type:** Real-time tracking
**File:** `src/infra/tracking/tracking.module.ts`

**Exports:**
- TrackingGateway (WebSocket)
- MapsService

### 7. AuthServiceModule

**Type:** Authentication
**File:** `src/services/auth/auth.module.ts`

**Controllers:**
- AuthController

**Providers:**
- AuthService

### 8. OrderServiceModule

**Type:** Order management
**File:** `src/services/order/order.module.ts`

**Controllers:**
- OrderController

**Providers:**
- OrderService

### 9. PaymentServiceModule

**Type:** Payment processing
**File:** `src/services/payments/payments.module.ts`

**Controllers:**
- PaymentsController
- WebhookController

**Providers:**
- PaymentService
- WebhookService
- GatewayFactory
- IdempotencyService
- RetryService

### 10. RestaurantServiceModule

**Type:** Restaurant operations
**File:** `src/services/restaurant/restaurant.module.ts`

**Controllers:**
- RestaurantController
- RestaurantOpsController
- OnboardingController
- BusinessEngineController

**Providers:**
- RestaurantService
- BranchManagementService
- OnboardingService
- BusinessEngineService
- KDSService

### 11. SearchServiceModule

**Type:** Search functionality
**File:** `src/services/search/search.module.ts`

**Controllers:**
- SearchController

**Providers:**
- SearchService

### 12. DeliveryServiceModule

**Type:** Delivery management
**File:** `src/services/delivery/delivery.module.ts`

**Controllers:**
- DeliveryController

**Providers:**
- DeliveryService

### 13. AdminServiceModule

**Type:** Admin operations
**File:** `src/services/admin/admin.module.ts`

**Providers:**
- Admin services

### 14. NotificationModule

**Type:** Notifications
**File:** `src/services/notifications/notification.module.ts`

**Providers:**
- NotificationService
- ProductionNotificationService

## Cross-Domain Modules

### AnalyticsModule

**File:** `src/modules/analytics/analytics.module.ts`
**Purpose:** Analytics and metrics

### DriverAssignmentModule

**File:** `src/modules/driver-assignment/driver-assignment.module.ts`
**Purpose:** Driver dispatch logic

### KitchenModule

**File:** `src/modules/kitchen/kitchen.module.ts`
**Purpose:** Kitchen display system

### LedgerModule

**File:** `src/modules/ledger/ledger.module.ts`
**Purpose:** Double-entry accounting

### ComplianceModule

**File:** `src/compliance/compliance.module.ts`
**Purpose:** Legal/compliance checks

### AuditModule

**File:** `src/audit/audit.module.ts`
**Purpose:** Audit trail

## Module Summary

| Module | Controllers | Services | Entities | Status |
|--------|-------------|----------|----------|--------|
| Auth | 1 | 1 | - | ✅ |
| Order | 1 | 1 | 1+ | ✅ |
| Payment | 2 | 4+ | 3 | ✅ |
| Restaurant | 3 | 4 | - | ✅ |
| Search | 1 | 1 | - | ✅ |
| Delivery | 1 | 1 | - | ✅ |
| Admin | 0 | 1+ | - | ✅ |
| Notification | 0 | 2 | - | ✅ |
| Kitchen | 0 | 1 | - | ✅ |
| Driver Assignment | 0 | 1 | - | ✅ |
| Ledger | 0 | 1 | - | ✅ |
| Compliance | 0 | 1 | - | ✅ |
| Audit | 0 | 1 | - | ✅ |
| Wallet | 1 | 1 | - | ✅ |
| GST | 0 | 1 | - | ✅ |
| Finance | 0 | 1 | - | ✅ |
| Support | 1 | 2 | - | ✅ |
| Refund | 1 | 1 | - | ✅ |
| Loyalty | 0 | 1 | - | ✅ |
| Driver Fleet | 0 | 1 | - | ✅ |

Total: 21 modules including cross-domain services