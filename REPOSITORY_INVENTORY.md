# SpiceGarden Repository Inventory

> Generated: 2026-06-19
> Verified from source code analysis

## Applications

### Backend (apps/backend)
- **Type**: NestJS API Server
- **Port**: 3001
- **Package**: TypeScript, Common.js
- **Features**: REST API, WebSocket, gRPC support

### Customer Web (apps/customer-web)
- **Type**: Next.js Web Application
- **Port**: 3002
- **Package**: TypeScript, React 19, Redux Toolkit, TanStack Query

### Restaurant Dashboard (apps/restaurant-dashboard)
- **Type**: Next.js Web Application
- **Port**: 3003
- **Package**: TypeScript, React 19, Socket.IO Client

### Super Admin (apps/super-admin)
- **Type**: Next.js Web Application
- **Port**: 3004
- **Package**: TypeScript, React 19, Recharts, Sentry

### Delivery Partner (apps/delivery-partner)
- **Type**: React Native Mobile Application
- **Package**: Expo, React Native, Jest

### Customer Mobile (apps/customer-mobile)
- **Type**: React Native Mobile Application
- **Package**: Expo, React Navigation, React Native Gesture Handler

### Launcher (apps/launcher)
- **Type**: Electron Desktop Application
- **Package**: Electron 39, React, Webpack

## Packages

### UI (packages/ui)
- **Type**: Shared React Component Library
- **Features**: Reusable UI components

### Shared (packages/shared)
- **Type**: Shared Utilities and Constants
- **Features**: Domain types, API utilities

### Proto (packages/proto)
- **Type**: Protocol Buffers Definitions
- **Features**: gRPC service definitions

### gRPC Transport (packages/grpc-transport)
- **Type**: gRPC Client Transport Layer
- **Features**: gRPC client communication

### API Types (packages/api-types)
- **Type**: TypeScript API Type Definitions
- **Features**: Shared type definitions across apps

## Services

### Authentication Service
- **Location**: `apps/backend/src/services/auth/`
- **Files**: auth.service.ts, auth.controller.ts, jwt.strategy.ts, google.strategy.ts, facebook.strategy.ts
- **Features**: JWT auth, OAuth2 (Google/Facebook), session management

### User Service
- **Location**: `apps/backend/src/services/user/`
- **Files**: user-profile.service.ts, user-profile.controller.ts

### Order Service
- **Location**: `apps/backend/src/services/order/`
- **Files**: order.service.ts, order.controller.ts

### Payment Service
- **Location**: `apps/backend/src/services/payments/`
- **Files**: payments.service.ts, payments.controller.ts, gateway-factory.service.ts
- **Gateways**: Stripe, Razorpay, COD
- **Features**: Payment intents, refunds, webhooks, fraud hardening

### Restaurant Service
- **Location**: `apps/backend/src/services/restaurant/`
- **Files**: restaurant.service.ts, restaurant.controller.ts, onboarding.service.ts
- **Features**: Restaurant management, branch control, menu moderation

### Delivery Service
- **Location**: `apps/backend/src/services/delivery/`
- **Files**: delivery service module

### Review Service
- **Location**: `apps/backend/src/services/review/`
- **Files**: review.service.ts, review.controller.ts

### Wallet Service
- **Location**: `apps/backend/src/services/wallet/`
- **Files**: wallet.service.ts, wallet.controller.ts

### Notification Service
- **Location**: `apps/backend/src/services/notifications/`
- **Files**: notification.service.ts, production-notification.service.ts

### Search Service
- **Location**: `apps/backend/src/services/search/`
- **Files**: search.service.ts, search.controller.ts

### Admin Service
- **Location**: `apps/backend/src/services/admin/`
- **Files**: admin.service.ts, admin.controller.ts

### Support Service
- **Location**: `apps/backend/src/services/support/`
- **Files**: customer-support.service.ts, ticket-routing.service.ts

### Refund Service
- **Location**: `apps/backend/src/services/refund/`
- **Files**: refund.service.ts, refund.controller.ts

### Menu Customization Service
- **Location**: `apps/backend/src/services/menu-customization/`
- **Files**: menu-customization.service.ts

### Loyalty Service
- **Location**: `apps/backend/src/services/loyalty/`
- **Files**: loyalty.service.ts, loyalty.controller.ts

### Driver Fleet Service
- **Location**: `apps/backend/src/services/driver-fleet/`

### Finance Service
- **Location**: `apps/backend/src/services/finance/`

### GST Service
- **Location**: `apps/backend/src/services/gst/`

### Payment Provider Service
- **Location**: `apps/backend/src/services/payment-provider/`

### Maps Service
- **Location**: `apps/backend/src/services/maps/`

### Geo Service
- **Location**: `apps/backend/src/services/geo/`

## Libraries

### Database Adapters
- **Location**: `apps/backend/src/db/`
- **PostgreSQL**: postgres.adapter.ts
- **MongoDB**: mongo.adapter.ts
- **Redis**: redis.adapter.ts

### Security
- **Location**: `apps/backend/src/security/`
- **Features**: Encryption, rate limiting, secrets loading

### Audit
- **Location**: `apps/backend/src/audit/`

### Compliance
- **Location**: `apps/backend/src/compliance/`

### Metrics
- **Location**: `apps/backend/src/metrics/`

### Logging
- **Location**: `apps/backend/src/logging/`

## Infrastructure

### Kubernetes
- **Directory**: `infra/k8s/`
- **Files**:
  - `production-hardened.yaml` - Production deployment (3-20 replicas, HPA, PDB, NetworkPolicy)
  - `staging.yaml` - Staging environment
  - `secrets.yaml` - Kubernetes secrets
  - `configmap.yaml` - Configuration
  - `postgres-ha.yaml` - PostgreSQL High Availability
  - `redis-cluster.yaml` - Redis Cluster
  - `backend-deployment.yaml` - Backend deployment
  - `cdn-ingress.yaml` - CDN/Ingress

### Prometheus
- **Directory**: `infra/prometheus/`
- **Files**: prometheus.yml, rules/alerts.yml, rules/slos.yml

### Grafana
- **Directory**: `infra/grafana/`
- **Files**: dashboards/spicegarden.json, provisioning/dashboards/provider.yml, provisioning/datasources/datasources.yml

### Alertmanager
- **Directory**: `infra/alertmanager/`
- **Files**: alertmanager.yml

### OpenSearch
- **Directory**: `infra/opensearch/`
- **Files**: index-templates/spicegarden-logs.json

### Filebeat
- **Directory**: `infra/filebeat/`
- **Files**: filebeat.yml

### Envoy
- **Directory**: `infra/envoy/`
- **Files**: envoy.yaml

## CI/CD

### Test Scripts
- `infra/scripts/fake-orders.js` - Fake order testing
- `infra/scripts/breaking-point.js` - Breaking point/load testing
- `infra/scripts/security-tests.js` - Security vulnerability tests
- `infra/scripts/penetration-tests.js` - Penetration tests
- `infra/scripts/deployment-check.js` - Deployment validation
- `infra/scripts/validate-env-consistency.js` - Environment validation
- `infra/scripts/autoscaling-validation.sh` - Autoscaling validation
- `infra/scripts/backup.ps1/sh` - Backup scripts
- `infra/scripts/disaster-recovery.ps1/sh` - Disaster recovery
- `infra/scripts/docker-stability-test.ps1/sh` - Docker stability tests

### Documentation
- `infra/docs/LOAD_BENCHMARKS.md`
- `infra/docs/MULTI_REGION_ARCHITECTURE.md`
- `infra/docs/API_VERSION_STRATEGY.md`
- `infra/DNS_FAILOVER.md`
- `infra/DOCKER_STABILITY.md`
- `infra/DEPLOYMENT_CHECKLIST.md`
- `infra/TESTING_PLAN.md`

## Database Entities (65 entities)

### Core Entities
- UserEntity
- SessionEntity
- OTPEntity
- UserDeviceEntity

### Restaurant Entities
- RestaurantEntity
- RestaurantBranchEntity
- MenuItemEntity
- MenuCategoryEntity
- MenuVariantEntity
- MenuAddonEntity
- MenuItemAvailabilityEntity

### Order Entities
- OrderEntity
- OrderItemEntity

### Payment Entities
- PaymentMethodEntity
- PaymentWebhookEntity
- StripeWebhookEntity
- PaymentFraudEntity
- PaymentValidationEntity
- PaymentEventEntity
- IdempotencyEntity
- WebhookRetryQueueEntity

### Financial Entities
- WalletEntity
- WalletTransactionEntity
- LedgerEntryEntity
- RefundEntity
- RefundApprovalEntity
- PayoutReportEntity

### Driver Entities
- DriverEntity
- DriverAssignmentEntity
- DriverFraudEntity
- DriverScoreEntity
- DriverIncentiveEntity
- DriverPenaltyEntity
- DriverDocumentEntity
- DriverShiftEntity

### Support Entities
- SupportTicketEntity
- NotificationEntity
- NotificationPreferenceEntity
- NotificationAnalyticsEntity

### Marketing Entities
- CouponEntity
- CouponUsageEntity
- ReferralEntity

### Compliance Entities
- AuditLogEntity
- DeviceFingerprintEntity
- DataExportRequestEntity
- DeletionRequestEntity

### Restaurant Operations
- RestaurantOnboardingEntity
- BranchControlEntity
- CommissionRuleEntity
- SurgeZoneEntity
- KitchenSLAEntity
- DeliverySLAEntity
- SLAAAlertEntity

### Inventory
- InventoryItemEntity
- InventoryAlertEntity
- RecipeEntity
- FoodPrepEntity
- BatchEntity

### Other Entities
- SubscriptionEntity
- RestaurantGSTEntity
- GSTDetailEntity
- HSN_SACEntity

## APIs

### Auth Routes
- `/auth/login`
- `/auth/signup`
- `/auth/callback` [Google/Facebook OAuth]
- `/auth/otp`

### Order Routes
- `/orders`
- `/order-details`

### Restaurant Routes
- `/restaurants`
- `/api/restaurants`
- `/api/categories`

### Other Routes
- `/search`
- `/cart`
- `/checkout`
- `/wallet`
- `/notifications`
- `/profile`
- `/addresses`
- `/payment-methods`

## Queues

### Queue Contracts
- Location: `apps/backend/src/shared/contracts/queues.ts`
- Uses BullMQ for job processing

### Webhook Retry Queue
- Location: `apps/backend/src/services/payments/webhook/webhook-retry.service.ts`

## Events

### Proto Events
- Location: `apps/backend/src/proto/`
- Categories: auth, orders, payments, refunds, restaurants, drivers, notifications, wallet, loyalty, search, analytics

## Workers

### Modules
- `apps/backend/src/modules/`
- Categories: kitchen, driver-assignment, ledger, orders, analytics, realtime

## Mobile Apps

### Customer Mobile
- Screens: Home, Cart, Search, Restaurant, Profile, Payment Methods, Onboarding, Notifications, Menu Item Customization, Checkout, Addresses, Auth, Tracking, History, Order Details

### Delivery Partner
- Main: App.tsx
- Screens: Delivery flow

## Dashboards

### Restaurant Dashboard
- Pages: Index, Onboarding (menu, business, gst, payout, documents, pricing), _app

### Super Admin
- Pages: Index, Analytics, Loyalty, Driver Fleet

## Admin Systems

### Super Admin Portal
- User Management
- Restaurant Management
- Analytics
- Driver Fleet Management
- Earnings/Commissions
- Coupons/Referrals

## Summary Statistics

| Category | Count |
|----------|-------|
| Applications | 7 |
| Packages | 5 |
| Backend Services | 15+ |
| Database Entities | 65 |
| Infrastructure Files | 35+ |
| Backend Source Files | 100+ |
| Frontend Pages (Web) | ~35 |
| Mobile Screens | 15+ |