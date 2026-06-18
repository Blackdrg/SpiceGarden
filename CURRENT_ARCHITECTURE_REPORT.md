# CURRENT_ARCHITECTURE_REPORT.md

**Generated:** 2026-06-18

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SpiceGarden Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Customer   │    │   Delivery   │    │  Restaurant  │ │
│  │     Web      │    │   Partner    │    │   KDS/Dash   │ │
│  │  (Next.js)   │    │ (React Native)│    │   (Next.js)  │ │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘ │
│         │                   │                     │         │
│         └──────────────┬────┴─────────────────────┘         │
│                        │                                     │
│              ┌─────────▼─────────┐                          │
│              │   Backend API     │                          │
│              │   (NestJS 3001)   │                          │
│              └─────────┬─────────┘                          │
│                        │                                     │
│         ┌────────────┼────────────┐                         │
│         │            │            │                          │
│    ┌────▼───┐   ┌────▼───┐   ┌────▼───┐                     │
│    │Redis   │   │MongoDB │   │Postgres  │                     │
│    │(6379)  │   │(27017) │   │(5432)    │                     │
│    └────────┘   └─────────┘   └──────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Backend Modules

| Module | File | Routes | Purpose |
| :--- | :--- | :---: | :--- |
| DbModule | `src/db/db.module.ts` | - | TypeORM, Mongoose, Redis connection |
| SecurityModule | `src/security/security.module.ts` | - | Throttler, encryption |
| LoggingModule | `src/logging/logging.module.ts` | - | Structured logging |
| QueueModule | `src/infra/queue/queue.module.ts` | - | BullMQ queues |
| TrackingModule | `src/infra/tracking/tracking.module.ts` | - | WebSocket tracking |
| AuthServiceModule | `src/services/auth/auth.module.ts` | 25 | JWT, OAuth, sessions |
| OrderServiceModule | `src/services/order/order.module.ts` | 17 | Order lifecycle |
| PaymentServiceModule | `src/services/payments/payments.module.ts` | 20+ | Stripe/Razorpay, webhooks |
| RestaurantServiceModule | `src/services/restaurant/restaurant.module.ts` | 25 | Restaurant ops, menus |
| DeliveryServiceModule | `src/services/delivery/delivery.module.ts` | 9 | Delivery lifecycle |
| DriverOpsModule | `src/services/delivery/driver-ops.module.ts` | 9 | Driver operations |
| KitchenModule | `src/modules/kitchen/kitchen.module.ts` | 25 | Kitchen SLA, recipes |
| DriverAssignmentModule | `src/modules/driver-assignment/driver-assignment.module.ts` | 15 | Driver routing |
| MetricsModule | `src/metrics/metrics.module.ts` | - | Prometheus metrics |
| ComplianceModule | `src/compliance/compliance.module.ts` | 21 | GDPR/DPDP/PCI |
| AuditModule | `src/audit/audit.module.ts` | 1 | Audit logging |
| WalletModule | `src/services/wallet/wallet.module.ts` | 10 | Wallet & transactions |
| GSTModule | `src/services/gst/gst.module.ts` | - | GST compliance |
| FinanceModule | `src/services/finance/finance.module.ts` | 8 | Financial reporting |
| SupportModule | `src/services/support/support.module.ts` | 8 | Support tickets |
| LoyaltyModule | `src/services/loyalty/loyalty.module.ts` | 10 | Coupons, referrals |
| AnalyticsModule | `src/modules/analytics/analytics.module.ts` | 8 | Business analytics |

## Database Schema

### PostgreSQL Entities (54 total)

**Identity & Access:** UserEntity, SessionEntity, OtpEntity, DeviceFingerprintEntity, UserDeviceEntity

**Restaurants & Menu:** RestaurantEntity, RestaurantBranchEntity, MenuCategoryEntity, MenuItemEntity, MenuVariantEntity, MenuAddonEntity, MenuItemAvailabilityEntity, RestaurantOnboardingEntity, RestaurantGSTEntity, GSTDetailEntity, HSNSACEntity

**Orders & Delivery:** OrderEntity, OrderItemEntity, DriverEntity, DriverAssignmentEntity, DeliverySLAEntity, DriverScoreEntity, DriverFraudEntity, DriverDocumentEntity, DriverShiftEntity, DriverIncentiveEntity, DriverPenaltyEntity

**Payments & Finance:** PaymentDisputeEntity, PaymentMethodEntity, StripeWebhookEntity, PaymentWebhookEntity, WebhookRetryQueueEntity, PaymentEventEntity, PaymentValidationEventEntity, PaymentFraudFlagEntity, IdempotencyEntity, RefundEntity, RefundApprovalEntity, PayoutReportEntity, CommissionRuleEntity, LedgerEntryEntity

**Wallet & Loyalty:** WalletEntity, WalletTransactionEntity, CouponEntity, CouponUsageEntity, ReferralEntity, SubscriptionEntity

**Support & Compliance:** AuditLogEntity, SupportTicketEntity, DisputeEntity, DeletionRequestEntity, DataExportRequestEntity

**Inventory & Kitchen:** InventoryItemEntity, InventoryAlertEntity, RecipeEntity, BatchEntity, FoodPrepEntity, KitchenSLAEntity, SupplierEntity

### MongoDB Collections

- `reviews` - ReviewDocument (userId, restaurantId, orderId, rating, comment, images)

## API Contract

### REST Endpoints (263 total)

| Method | Count |
| :--- | :---: |
| GET | 128 |
| POST | 99 |
| PUT | 29 |
| DELETE | 5 |
| PATCH | 2 |

### WebSocket Events

| Gateway | Events |
| :--- | :--- |
| TrackingGateway | `orderLocationUpdate`, `driverPosition` |
| KdsGateway | `newOrder`, `orderUpdate`, `inventoryAlert` |
| Socket.IO | Standard order/delivery lifecycle events |

## Security Controls

| Control | Implementation |
| :--- | :--- |
| Helmet | `app.use(helmet())` in main.ts:172 |
| NoSQL Injection | `mongo-sanitize` with compatibility wrapper |
| HTTP Parameter Pollution | `hpp()` in main.ts:173 |
| Rate Limiting | express-rate-limit + Redis backing store |
| CORS | Origin whitelist from `CORS_ALLOWED_ORIGINS` |
| JWT Auth | Passport-JWT strategy |
| Input Validation | class-validator with ValidationPipe |

## Infrastructure Architecture

```
                    ┌─────────────────┐
                    │   Namespace     │
                    │   kube-system   │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Monitoring  │      │    Data      │      │ Application  │
│  Namespace   │      │   Storage    │      │  Namespace   │
│              │      │              │      │              │
├─Prometheus   ├─┐    ├─PostgreSQL    ├─┐   ├─Backend      ├─┐
├─Grafana      ├─┤    ├─Redis         ├─┤   ├─Frontend Apps├─┤
├─Alertmanager ├─┤    ├─MongoDB       ├─┤   ├─Ingress      ├─┤
├─OpenSearch   ├─┘    └─OpenSearch    ├─┘   └─CDN          ├─┘
└──────────────┘         └──────────────┘      └──────────────┘
```

## Deployment Architecture

Production uses hardened Kubernetes manifests with:
- Non-root containers (uid/gid 1001)
- Read-only root filesystem
- Dropped capabilities (ALL)
- NetworkPolicies for ingress/egress
- PodDisruptionBudget for HA
- HorizontalPodAutoscaler (3-20 replicas)