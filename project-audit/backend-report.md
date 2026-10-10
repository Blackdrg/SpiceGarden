# SpiceGarden Backend Audit Report

Generated: 2026-07-04
Evidence source: Direct inspection of apps/backend/src/

## 1. Application Overview

| Property | Value | Evidence |
|----------|-------|----------|
| Name | `@spicegarden/backend` | apps/backend/package.json |
| Framework | NestJS 11.1.27 | package.json @nestjs/core@11.1.27 |
| Runtime | Node.js ES2022, CommonJS | tsconfig.json target ES2022, module commonjs |
| Port | 3001 | main.ts:279 app.listen(3001) |
| ORM | TypeORM 0.2.45 + Mongoose 9.7.0 | package.json, data-source.ts |
| Status | Partially Implemented | 42 controllers, 68+ entities, comprehensive feature set |

## 2. Technology Stack

### Core Dependencies
- `@nestjs/core` 11.1.27
- `@nestjs/typeorm` ^11.0.1
- `@nestjs/mongoose` ^11.0.0
- `@nestjs/passport` ^11.0.5
- `@nestjs/jwt` ^11.0.2
- `@nestjs/swagger` ^11.2.7
- `@nestjs/throttler` ^6.0.0
- `@nestjs/schedule` ^6.1.3

### Database & Storage
- `typeorm` ^0.2.45
- `pg` ^8.11.0
- `sqlite3` 6.0.1 (local fallback)
- `mongodb` 7.3.0
- `mongoose` 9.7.0
- `ioredis` ^5.10.1
- `bullmq` ^5.78.1

### Security & Auth
- `passport` ^0.7.0
- `passport-jwt` ^4.0.1
- `passport-google-oauth20` ^2.0.0
- `passport-facebook` ^3.0.0
- `argon2` ^0.40.0
- `bcrypt` ^6.0.0
- `helmet` ^7.1.0
- `express-rate-limit` ^7.1.5

### Payments
- `stripe` ^15.0.0
- `multer` ^2.2.0 (via override)

### Realtime & Monitoring
- `socket.io` ^4.7.0
- `@sentry/node` ^10.58.0
- `prom-client` ^15.0.0

## 3. Complete Module Inventory

### 3.1 Root Module

**File:** `apps/backend/src/app.module.ts`
- Imports 35+ modules
- Global ConfigModule with envFilePath resolution

### 3.2 Module Tree

```
AppModule
├── DbModule (global)
│   └── RepositoriesModule (global, 68+ entities)
├── SecurityModule (global)
│   ├── EncryptionService
│   ├── ThrottlerModule
│   ├── PermissionGuard
│   └── RolesGuard
├── LoggingModule
├── QueueModule (global)
│   └── OrderProcessor
├── TrackingModule (global)
│   └── TrackingGateway (WebSocket)
├── AuthServiceModule
├── OrderServiceModule
├── PaymentServiceModule
├── RestaurantServiceModule
├── SearchServiceModule
├── DeliveryServiceModule
├── DriverOpsModule
├── AdminServiceModule
├── NotificationModule
├── KitchenModule
├── DriverAssignmentModule
├── MetricsModule
├── ComplianceModule
├── AuditModule
├── WalletModule
├── GSTModule
├── FinanceModule
├── SupportModule
├── RefundModule
├── LoyaltyModule
├── DriverFleetModule
├── AnalyticsModule
├── ReviewServiceModule
├── UserProfileModule
└── ApisModule
```

## 4. Complete Controller Inventory

### 4.1 Auth Controller
**File:** `apps/backend/src/services/auth/auth.controller.ts`
- Prefix: `auth`
- Auth: JWT + OAuth (Google/Facebook)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/login` | None | Email/password login, sets httpOnly cookies |
| POST | `/auth/register` | None | Customer registration |
| POST | `/auth/refresh-token` | Cookie | Refresh access token |
| POST | `/auth/logout` | Cookie | Revoke session, clear cookies |
| GET | `/auth/me` | JWT | Get current user profile |
| POST | `/auth/forgot-password` | None | Request password reset |
| POST | `/auth/verify-reset-code` | None | Verify reset code |
| POST | `/auth/reset-password` | None | Reset password with code |
| GET | `/auth/google` | OAuth | Google OAuth redirect |
| GET | `/auth/google/callback` | OAuth | Google OAuth callback |
| GET | `/auth/facebook` | OAuth | Facebook OAuth redirect |
| GET | `/auth/facebook/callback` | OAuth | Facebook OAuth callback |

### 4.2 Order Controller
**File:** `apps/backend/src/services/order/order.controller.ts`
- Prefix: `orders`
- Guards: JwtAuthGuard, RolesGuard

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| POST | `/orders` | JWT | customer,admin,super_admin | Place order with optional idempotency key |
| GET | `/orders/health` | None | Any | Health check |
| GET | `/orders/:id` | JWT | customer,admin,super_admin,delivery_partner | Get order with details |

### 4.3 Restaurant Controller
**File:** `apps/backend/src/services/restaurant/restaurant.controller.ts`
- Prefix: `restaurants`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/restaurants` | None | List all restaurants |
| GET | `/restaurants/search` | None | Search restaurants |
| GET | `/restaurants/nearby` | None | Find nearby by lat/lng/radius |
| GET | `/restaurants/:slug` | None | Get restaurant details |
| PUT | `/restaurants/branch/:id/status` | JWT | Update branch online status |

### 4.4 Admin Controller
**File:** `apps/backend/src/services/admin/admin.controller.ts`
- Prefix: `admin`
- Guards: JwtAuthGuard, RolesGuard, PermissionGuard

| Method | Route | Roles | Permissions | Description |
|--------|-------|-------|-------------|-------------|
| GET | `/admin/dashboard` | admin,super_admin | analytics:read | Dashboard stats |
| GET | `/admin/stats` | admin,super_admin | analytics:read | Full stats |
| GET | `/admin/orders` | admin,super_admin | orders:manage | Paginated orders |
| POST | `/admin/users/ban` | admin,super_admin | users:manage | Ban user |

### 4.5 Payments Controller
**File:** `apps/backend/src/services/payments/payments.controller.ts`
- Prefix: `payments`
- Features: Fraud checking, idempotency, retry logic

| Method | Route | Roles | Description |
|--------|-------|-------|-------------|
| POST | `/payments/create-intent` | customer,admin,super_admin | Create payment intent with optional gateway |
| POST | `/payments/refund` | admin,super_admin,finance_staff | Refund payment |
| GET | `/payments/gateways` | customer,restaurant,admin,super_admin | List available gateways |
| GET | `/payments/gateway/config` | customer,restaurant,admin,super_admin | Gateway configuration |

### 4.6 Payment Webhook Controller
**File:** `apps/backend/src/services/payments/webhook/webhook.controller.ts`
- Prefix: `payments/webhook`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/payments/webhook` | Signature | Handle Stripe/Razorpay webhooks |
| GET | `/payments/webhook/stats` | None | Webhook processing stats |

### 4.7 Payment Provider Controller
**File:** `apps/backend/src/services/payment-provider/payment-provider.controller.ts`
- Prefix: `payment-provider`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/payment-provider/stripe-connect/onboard` | Create Stripe Connect account |
| GET | `/payment-provider/stripe-connect/status` | Get Stripe Connect status |
| POST | `/payment-provider/razorpay/settlement/onboard` | Create Razorpay fund account |
| GET | `/payment-provider/razorpay/settlement/status` | Get Razorpay settlement status |
| GET | `/payment-provider/restaurant/payout-history` | Get payout history |
| GET | `/payment-provider/restaurant/balance` | Get account balance |

### 4.8 Chargeback Controller
**File:** `apps/backend/src/services/payments/chargeback/chargeback.controller.ts`
- Prefix: `chargebacks`

| Method | Route | Roles | Description |
|--------|-------|-------|-------------|
| GET | `/chargebacks/:disputeId` | admin,super_admin,finance_staff,customer | Get dispute by ID |
| GET | `/chargebacks/order/:orderId` | admin,super_admin,finance_staff,customer | Get disputes for order |
| GET | `/chargebacks` | admin,super_admin,finance_staff | List disputes with filters |
| POST | `/chargebacks/:disputeId/initiate-refund` | admin,super_admin,finance_staff | Initiate refund for won dispute |
| GET | `/chargebacks/stats/overview` | admin,super_admin,finance_staff | Dispute statistics |

### 4.9 Refund Controller
**File:** `apps/backend/src/services/refund/refund.controller.ts`
- Prefix: `refunds`

| Method | Route | Roles | Description |
|--------|-------|-------|-------------|
| POST | `/refunds/request` | customer,admin,super_admin | Create refund request |
| PATCH | `/refunds/:approvalId/approve` | admin,super_admin,finance_staff | Approve refund |
| PATCH | `/refunds/:approvalId/reject` | admin,super_admin,finance_staff | Reject refund |
| POST | `/refunds/:approvalId/process` | admin,super_admin,finance_staff | Process approved refund |
| GET | `/refunds/:approvalId` | admin,super_admin,finance_staff,customer | Get refund request |
| GET | `/refunds/order/:orderId` | admin,super_admin,finance_staff,customer | Get refunds for order |
| GET | `/refunds` | admin,super_admin,finance_staff | Get refunds by status |

### 4.10 Wallet Controller
**File:** `apps/backend/src/services/wallet/wallet.controller.ts`
- Prefix: `wallet`

| Method | Route | Roles | Permissions | Description |
|--------|-------|-------|-------------|-------------|
| GET | `/wallet` | customer | wallet:read_own | Get wallet |
| GET | `/wallet/balance` | customer | wallet:read_own | Get balance |
| GET | `/wallet/transactions` | customer | wallet:read_own | Get transactions |
| POST | `/wallet/credit` | admin,super_admin,finance_staff | finance:read | Credit wallet |
| POST | `/wallet/debit` | admin,super_admin,finance_staff | finance:read | Debit wallet |
| POST | `/wallet/compensate` | admin,super_admin,finance_staff | finance:read | Compensate user |
| POST | `/wallet/cod/process` | customer | wallet:transact_own | Process COD payment |
| POST | `/wallet/cod/confirm` | delivery_partner | deliveries:manage_assigned | Confirm COD collection |
| POST | `/wallet/cod/refund` | admin,super_admin,finance_staff | finance:read | Refund COD |
| POST | `/wallet/prevent-duplicate` | customer | wallet:transact_own | Prevent duplicate payment |

### 4.11 Support Controller
**File:** `apps/backend/src/services/support/support.controller.ts`
- Prefix: `support`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/support/disputes` | Raise dispute |
| GET | `/support/disputes` | Get disputes with filters |
| PUT | `/support/disputes/:id/review` | Review dispute |
| POST | `/support/refunds` | Request refund |
| PUT | `/support/refunds/:id/process` | Process refund |
| GET | `/support/tickets/stats` | Get queue stats |
| POST | `/support/tickets/:id/route` | Route ticket |
| POST | `/support/tickets/:id/escalate` | Escalate ticket |

### 4.12 Search Controller
**File:** `apps/backend/src/services/search/search.controller.ts`
- Prefix: `search`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/search` | None | Search restaurants/menus |
| GET | `/search/trending` | None | Get trending searches |
| GET | `/search/recommended` | JWT | Get personalized recommendations |

### 4.13 Review Controller
**File:** `apps/backend/src/services/review/review.controller.ts`
- Prefix: `reviews`

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| POST | `/reviews` | JWT | customer,admin,super_admin | Create review |
| GET | `/reviews/order/:orderId` | None | Any | Find review by order |
| GET | `/reviews/restaurant/:restaurantId` | None | Any | Find reviews by restaurant |
| GET | `/reviews/restaurant/:restaurantId/rating` | None | Any | Get average rating |

### 4.14 User Profile Controller
**File:** `apps/backend/src/services/user/user-profile.controller.ts`
- Prefix: `user`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/user/addresses` | Get user addresses |
| POST | `/user/addresses` | Create address |
| PUT | `/user/addresses/:id` | Update address |
| DELETE | `/user/addresses/:id` | Delete address |
| GET | `/user/payment-methods` | Get payment methods |
| POST | `/user/payment-methods` | Create payment method |
| DELETE | `/user/payment-methods/:id` | Delete payment method |
| PUT | `/user/payment-methods/:id/set-default` | Set default payment method |

### 4.15 Address Controller
**File:** `apps/backend/src/services/users/address.controller.ts`
- Prefix: `addresses`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/addresses` | Get user addresses |
| POST | `/addresses` | Add address |
| PUT | `/addresses/:id/default` | Set default address |
| DELETE | `/addresses/:id` | Delete address |

### 4.16 Payment Methods Controller
**File:** `apps/backend/src/services/users/payment-methods.controller.ts`
- Prefix: `payment-methods`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/payment-methods` | Get payment methods |
| POST | `/payment-methods` | Add payment method |
| PUT | `/payment-methods/:id/default` | Set default |
| DELETE | `/payment-methods/:id` | Delete |

### 4.17 Menu Customization Controller
**File:** `apps/backend/src/services/menu-customization/menu-customization.controller.ts`
- Prefix: `menus`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/menus/:restaurantId/items` | Get menu items |
| GET | `/menus/items/:itemId` | Get item details |
| GET | `/menus/items/:itemId/addons` | Get item addons |
| GET | `/menus/categories/:restaurantId` | Get categories |

### 4.18 Driver Fleet Controller
**File:** `apps/backend/src/services/driver-fleet/driver-fleet.controller.ts`
- Prefix: `fleet`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/fleet/shifts/start` | Start driver shift |
| POST | `/fleet/shifts/end` | End driver shift |
| GET | `/fleet/shifts/:driverId` | Get shift history |
| POST | `/fleet/earnings` | Get earnings for period |
| POST | `/fleet/incentives/calculate` | Calculate incentives |
| POST | `/fleet/incentives` | Generate incentive |
| GET | `/fleet/performance` | Get performance ranking |
| GET | `/fleet/performance/:driverId` | Get driver performance |
| GET | `/fleet/schedule/:driverId` | Get driver schedule |
| PUT | `/fleet/penalties/:id/approve` | Approve penalty |
| PUT | `/fleet/penalties/:id/waive` | Waive penalty |

### 4.19 Driver Ops Controller
**File:** `apps/backend/src/services/delivery/driver-ops.controller.ts`
- Prefix: `drivers`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/drivers/onboarding` | Start driver onboarding |
| POST | `/drivers/documents` | Upload document |
| GET | `/drivers/documents/:driverId` | Get documents |
| PUT | `/drivers/documents/:id/verify` | Verify document |
| GET | `/drivers/onboarding/:id/status` | Get onboarding status |
| POST | `/drivers/incentives/calculate` | Calculate weekly incentives |
| POST | `/drivers/incentives` | Generate incentive |
| PUT | `/drivers/incentives/:id/approve` | Approve incentive |
| GET | `/drivers/incentives/pending` | Get pending incentives |

### 4.20 Finance Controller
**File:** `apps/backend/src/services/finance/finance.controller.ts`
- Prefix: `finance`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/finance/gst/report` | Generate GST report |
| POST | `/finance/reconciliation/payments` | Reconcile payments |
| POST | `/finance/reconciliation/payouts` | Reconcile payouts |
| POST | `/finance/reconciliation/driver` | Reconcile driver payments |
| POST | `/finance/reconciliation/full` | Run full reconciliation |

### 4.21 GST Controller
**File:** `apps/backend/src/services/gst/gst.controller.ts`
- Prefix: `gst`

| Method | Route | Roles | Description |
|--------|-------|-------|-------------|
| POST | `/gst/calculate/:orderId` | admin,restaurant | Calculate GST for order |
| GET | `/gst/invoice/:orderId` | admin,restaurant,customer | Generate GST invoice |
| GET | `/gst/rate-summary/:orderId` | admin,restaurant | Get GST rate summary |
| POST | `/gst/validate-gstin` | admin,restaurant | Validate GSTIN |

### 4.22 Loyalty Controller
**File:** `apps/backend/src/services/loyalty/loyalty.controller.ts`
- Prefix: `loyalty`

| Method | Route | Roles | Permissions | Description |
|--------|-------|-------|-------------|-------------|
| POST | `/loyalty/coupons` | admin,super_admin | orders:manage | Create coupon |
| POST | `/loyalty/coupons/apply` | customer | wallet:transact_own | Apply coupon |
| GET | `/loyalty/coupons` | admin,super_admin | orders:manage | Get all coupons |
| GET | `/loyalty/coupons/:id/analytics` | admin,super_admin | analytics:read | Coupon analytics |
| PUT | `/loyalty/coupons/:id/deactivate` | admin,super_admin | orders:manage | Deactivate coupon |
| POST | `/loyalty/referrals/code` | customer | orders:read_own | Generate referral code |
| POST | `/loyalty/referrals/process` | admin,super_admin | orders:manage | Process referral |
| GET | `/loyalty/referrals/:userId` | customer | orders:read_own | Get referral history |
| POST | `/loyalty/cashback/process` | admin,super_admin,finance_staff | finance:read | Process cashback |
| GET | `/loyalty/cashback/:userId` | customer | wallet:read_own | Get cashback summary |

### 4.23 Maps Controller
**File:** `apps/backend/src/services/maps/maps.controller.ts`
- Prefix: `maps`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/maps/eta` | Calculate ETA |
| GET | `/maps/surge-eta` | Calculate surge-adjusted ETA |
| POST | `/maps/reroute` | Get rerouting options |
| GET | `/maps/heatmap` | Get delivery heatmap |
| GET | `/maps/surge-zones` | List active surge zones |
| GET | `/maps/check-surge-zone` | Check if in surge zone |

### 4.24 Analytics Controller
**File:** `apps/backend/src/modules/analytics/analytics.controller.ts`
- Prefix: `analytics`

| Method | Route | Roles | Description |
|--------|-------|-------|-------------|
| GET | `/analytics/top-dishes` | restaurant,admin,super_admin | Top selling dishes |
| GET | `/analytics/churn` | restaurant,admin,super_admin | Churn analysis |
| GET | `/analytics/repeat-users` | restaurant,admin,super_admin | Repeat user analytics |
| GET | `/analytics/conversion` | restaurant,admin,super_admin | Conversion funnel |
| GET | `/analytics/heatmap` | restaurant,admin,super_admin | Delivery heatmap |
| GET | `/analytics/peak-hours` | restaurant,admin,super_admin | Peak hours analysis |
| GET | `/analytics/restaurant/:id` | restaurant,admin,super_admin | Full restaurant analytics |
| GET | `/analytics/platform` | admin,super_admin | Platform-wide analytics |

### 4.25 Kitchen Controller
**File:** `apps/backend/src/modules/kitchen/kitchen.controller.ts`
- Prefix: `kitchen`

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/kitchen/inventory` | Create inventory item |
| PUT | `/kitchen/inventory/:id/stock` | Update inventory stock |
| PUT | `/kitchen/inventory/:id/wastage` | Record wastage |
| GET | `/kitchen/inventory/low-stock/:branchId` | Get low stock items |
| POST | `/kitchen/recipes` | Create recipe |
| GET | `/kitchen/recipes/:id` | Get recipe by ID |
| POST | `/kitchen/batches` | Create batch |
| PUT | `/kitchen/batches/:id/status` | Update batch status |
| POST | `/kitchen/food-prep` | Log food preparation |
| PUT | `/kitchen/food-prep/:id/quality` | Update food prep quality |
| POST | `/kitchen/sla` | Record kitchen SLA |
| POST | `/kitchen/sla/avg-prep-time/:branchId` | Record average prep time |
| POST | `/kitchen/sla/late-prep/:branchId` | Record late prep percentage |
| POST | `/kitchen/sla/food-rejection/:branchId` | Record food rejection rate |
| POST | `/kitchen/sla/throughput/:branchId` | Record throughput |
| GET | `/kitchen/sla/branch/:branchId` | Get SLA by branch |
| GET | `/kitchen/sla/summary/:branchId` | Get SLA summary |
| POST | `/kitchen/suppliers` | Create supplier |
| GET | `/kitchen/suppliers/:id/inventory` | Get supplier inventory |
| GET | `/kitchen/inventory/consumption/:branchId` | Get inventory consumption |
| GET | `/kitchen/inventory/forecast/:branchId` | Forecast inventory needs |

### 4.26 Compliance Controller
**File:** `apps/backend/src/compliance/compliance.controller.ts`
- Prefix: `compliance`

| Method | Route | Roles | Description |
|--------|-------|-------|-------------|
| GET | `/compliance/soc2` | super_admin | SOC2 readiness |
| GET | `/compliance/soc2/evidence` | super_admin | SOC2 evidence report |
| GET | `/compliance/pci-dss` | super_admin | PCI-DSS compliance |
| GET | `/compliance/pci-dss/payment-flow` | super_admin | Validate payment flow |
| GET | `/compliance/pci-dss/saq` | super_admin | PCI-DSS SAQ metrics |
| GET | `/compliance/secrets/rotation-status` | super_admin | Secrets rotation status |
| GET | `/compliance/secrets/proof` | super_admin | Secrets rotation proof |
| POST | `/compliance/secrets/rotate` | super_admin | Rotate secrets |
| GET | `/compliance/retention-stats` | admin,super_admin | Data retention stats |
| POST | `/compliance/retention/apply` | admin,super_admin | Apply retention policies |
| GET | `/compliance/gdpr/user/:userId/export` | customer,admin,super_admin | GDPR data export |
| GET | `/compliance/dpdp/user/:userId/export` | customer,admin,super_admin | DPDP data export |
| POST | `/compliance/gdpr/user/:userId/deletion-request` | customer,admin | GDPR deletion request |
| POST | `/compliance/dpdp/user/:userId/deletion-request` | customer,admin | DPDP deletion request |
| POST | `/compliance/gdpr/user/:userId/deletion-request/cancel` | customer,admin | Cancel GDPR deletion |
| GET | `/compliance/user/:userId/deletion-status` | admin,super_admin | Get deletion status |
| GET | `/compliance/user/:userId/export-history` | admin,super_admin | Get export history |
| GET | `/compliance/user/:userId/pii-verification` | admin,super_admin | Verify PII encryption |
| GET | `/compliance/user/:userId/data-export` | admin,super_admin | Export user data |
| POST | `/compliance/mask/pii` | admin | Mask PII fields |
| POST | `/compliance/unmask/pii` | admin | Unmask PII fields |

### 4.27 Legal Controller
**File:** `apps/backend/src/legal/legal.controller.ts`
- Prefix: `legal` (public)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/legal/privacy-policy` | Return privacy policy JSON |
| GET | `/legal/terms-of-service` | Return terms of service JSON |
| GET | `/legal/intellectual-property` | Return IP/license info |

### 4.28 Other Controllers

| Controller | Path | Prefix | Status |
|------------|------|--------|--------|
| MetricsController | apps/backend/src/metrics/metrics.controller.ts | `/metrics` | ✅ Prometheus metrics |
| GrpcAuthController | apps/backend/src/grpc/auth.controller.ts | `grpc` | Placeholder |
| GrpcOrderController | apps/backend/src/grpc/order.controller.ts | `grpc` | Placeholder |
| AppController | apps/backend/src/app.controller.ts | `app` | Health/status |
| ApisController | apps/backend/src/apis.controller.ts | `apis` | API info |
| Notification sub-controllers | apps/backend/src/services/notifications/ | Various | Device, preferences, queue |

## 5. Security Layer

### 5.1 Main Security Stack
**File:** `apps/backend/src/main.ts:1-282`

| Control | Implementation | Evidence |
|---------|---------------|----------|
| Helmet | Strict CSP, HSTS, no x-powered-by | main.ts:203-222 |
| CORS | Dynamic origin allowlist, explicit production origins | main.ts:196-201, cors-origin.ts |
| CSRF | Cookie + header validation, strict SameSite | main.ts:224, csrf.middleware.ts |
| Rate Limiting | 4 namespaces with Redis store | main.ts:127-135 |
| Method Restriction | Blocks TRACE/TRACK/DEBUG/CONNECT → 405 | main.ts:230-236 |
| Body Size Limit | 10kb default | main.ts:238 |
| Request Timeout | 30s default | main.ts:242-248 |
| Mongo Sanitize | With Express compatibility wrapper | main.ts:160-192 |
| HPP | HTTP Parameter Pollution prevention | main.ts:226 |
| Compression | gzip/brotli | main.ts:227 |

### 5.2 JWT Authentication
**File:** `apps/backend/src/security/jwt-auth.guard.ts`
- Extends AuthGuard('jwt')
- Token validation via Passport JWT strategy

### 5.3 OAuth
- Google OAuth2: passport-google-oauth20
- Facebook OAuth: passport-facebook
- Callback routes set httpOnly cookies and redirect to frontend

### 5.4 RBAC
**File:** `apps/backend/src/security/roles.guard.ts`

| Role | Permissions |
|------|-------------|
| customer | orders:read_own, orders:create, wallet:read_own, wallet:transact_own |
| restaurant | restaurants:manage_own, orders:manage_assigned, kitchen:manage_own, menus:manage_own |
| kitchen_staff | kitchen:manage_own, orders:read_assigned |
| delivery_partner | deliveries:manage_assigned, orders:read_assigned |
| admin | users:manage, restaurants:manage, orders:manage, payments:manage, support:manage, analytics:read, finance:read, notifications:manage, compliance:read |
| super_admin | `*` |
| support_staff | support:manage, orders:read |
| finance_staff | finance:read, payments:read, refunds:read |

### 5.5 Encryption
**File:** `apps/backend/src/security/encryption.service.ts`
- AES-256-GCM with scrypt-derived key (32 bytes)
- Methods: encrypt, decrypt, encryptPiiFields, decryptPiiFields
- Format: iv.base64.ciphertext.base64.authtag.base64

### 5.6 Vault Integration
**File:** `apps/backend/src/security/vault.service.ts`
- Vault integration flags: VAULT_ENABLED, VAULT_ADDR, VAULT_TOKEN, VAULT_SECRET_PATH
- 5-min cache, rotation support, fallback to local secrets

### 5.7 Secret Loader
**File:** `apps/backend/src/infra/secret-loader.service.ts`
- Loads 18 secrets from `secrets/` directory into process.env
- Supports `*_FILE` suffix for Docker secrets

### 5.8 Password Hashing
- Argon2 (primary)
- bcrypt (fallback/legacy)

## 6. Test Coverage

### Unit Tests (Verified via project-audit/logs/tests.log)
- **@spicegarden/backend**: 3 suites, 32 tests PASSED
  - test/order.service.spec.ts
  - test/kitchen.service.spec.ts
  - test/delivery.service.spec.ts

- **@spicegarden/customer-mobile**: 6 suites, 33 tests PASSED
- **@spicegarden/customer-web**: 3 suites, 11 tests PASSED
- **@spicegarden/delivery-partner**: 3 suites, 6 tests PASSED
- **spicegarden-launcher**: 1 suite, 1 test PASSED
- **@spicegarden/restaurant-dashboard**: 3 suites, 9 tests PASSED
- **@spicegarden/super-admin**: 4 suites, 23 tests PASSED
- **@spicegarden/shared**: 2 suites, 2 tests PASSED
- **@spicegarden/ui**: 5 suites, 28 tests PASSED

**Total: 35 test suites, 145 tests, 0 failures**

## 7. Build Validation (Verified via project-audit/logs/build.log)

| Workspace | Build Command | Status |
|-----------|--------------|--------|
| @spicegarden/backend | `tsc -p tsconfig.build.json` | ✅ PASS |
| @spicegarden/customer-mobile | `tsc --noEmit` | ✅ PASS |
| @spicegarden/customer-web | `next build` | ✅ PASS (21 pages, 287-302kB) |
| @spicegarden/delivery-partner | `tsc --noEmit` | ✅ PASS |
| @spicegarden/restaurant-dashboard | `next build` | ✅ PASS (10 pages, 333-336kB) |
| @spicegarden/super-admin | `next build` | ✅ PASS (14 pages, 335-343kB) |
| spicegarden-launcher | `tsc + webpack` | ✅ PASS (renderer.js 195kB) |
| @spicegarden/api-types | `tsc --noEmit` | ✅ PASS |
| @spicegarden/grpc-transport | `tsc --noEmit` | ✅ PASS |
| @spicegarden/proto | `tsc --noEmit` | ✅ PASS |
| @spicegarden/shared | `tsc` | ✅ PASS |
| @spicegarden/ui | `tsc` | ✅ PASS |

**All 12 workspaces build successfully.**

## 8. Lint Validation (Verified via project-audit/logs/lint.log)

| Workspace | Command | Status |
|-----------|---------|--------|
| @spicegarden/backend | `eslint .` | ✅ PASS |
| @spicegarden/customer-mobile | `eslint .` | ✅ PASS |
| @spicegarden/customer-web | `eslint src` | ✅ PASS |
| @spicegarden/delivery-partner | `eslint .` | ✅ PASS |
| spicegarden-launcher | `eslint .` | ✅ PASS |
| @spicegarden/restaurant-dashboard | `eslint src` | ✅ PASS |
| @spicegarden/super-admin | `eslint src` | ✅ PASS |
| @spicegarden/api-types | `eslint .` | ✅ PASS |
| @spicegarden/grpc-transport | `eslint .` | ✅ PASS |
| @spicegarden/proto | `eslint .` | ✅ PASS |
| @spicegarden/shared | `eslint .` | ✅ PASS |
| @spicegarden/ui | `eslint .` | ✅ PASS |

**All 12 workspaces pass lint with 0 errors.**

## 9. Dependency Audit (Verified via project-audit/logs/npm-audit.log)

| Severity | Count | Details |
|----------|-------|---------|
| Critical | 0 | None |
| High | 0 | None |
| Moderate | 12 | uuid <11.1.1 (missing buffer bounds check) |
| Low | 0 | None |

**All moderate vulnerabilities are in dev toolchain (webpack-dev-server, xcode, expo). No production vulnerabilities.**

## 10. Outdated Packages (Verified via project-audit/logs/outdated.log)

Notable outdated packages:
- `@types/node` 20.19.43 → 26.1.0
- `typescript` 5.2.2-5.9.3 → 6.0.3
- `next` 15.5.19 → 15.5.20 (latest 16.2.10)
- `stripe` 15.12.0 → 22.3.0
- `electron` 39.8.10 → 43.0.0
- `react-native` 0.85.3 → 0.86.0

All wanted versions are within current major versions. No breaking changes required for current functionality.

## 11. React Doctor (Verified via project-audit/logs/react-doctor.log)

| App | Score | Warnings |
|------|-------|----------|
| @spicegarden/customer-web | 95/100 | 1 warning |
| @spicegarden/delivery-partner | 89/100 | 2 warnings |
| @spicegarden/restaurant-dashboard | 95/100 | 1 warning |
| @spicegarden/super-admin | 73/100 | 1 warning (data fetching in useEffect, large component) |

Overall React health: GOOD (average 88/100)

## 12. Backend Status Assessment

**Status: Partially Implemented**

### Completed
- ✅ 42 controllers with 150+ REST endpoints
- ✅ 68+ TypeORM entities + 1 Mongoose schema
- ✅ JWT + OAuth authentication (Google, Facebook)
- ✅ RBAC with 8 roles and granular permissions
- ✅ AES-256-GCM encryption service
- ✅ Rate limiting (4 namespaces)
- ✅ CSRF, CORS, Helmet, HPP security stack
- ✅ BullMQ queue with Redis
- ✅ Socket.IO WebSocket gateway
- ✅ Stripe + Razorpay payment integration
- ✅ Webhook handling with signature verification
- ✅ Fraud detection and idempotency
- ✅ Refund management with approval workflow
- ✅ Wallet operations with COD support
- ✅ Kitchen Display System (KDS)
- ✅ Inventory management with forecasting
- ✅ Driver fleet management
- ✅ Compliance: GDPR, DPDP, SOC2, PCI-DSS
- ✅ PII encryption and masking
- ✅ Data retention policies
- ✅ Analytics (top dishes, churn, conversion, heatmap)
- ✅ Loyalty (coupons, referrals, cashback)
- ✅ Review/rating system
- ✅ Search with recommendations
- ✅ Maps/ETA/surge zones
- ✅ Prometheus metrics
- ✅ Sentry error tracking

### Missing/Broken
- ⚠️ No API documentation (Swagger UI not configured/accessible)
- ⚠️ No API versioning strategy
- ⚠️ Limited unit test coverage (32 tests for 42 controllers)
- ⚠️ No integration tests for many controllers
- ⚠️ No load test execution in CI (scripts exist but not automated)
- ⚠️ Some controllers use untyped `any` for request bodies
- ⚠️ Grpc controllers are placeholders
- ⚠️ Notification service implementation details not verified

## 13. Evidence References

| Component | File Path | Lines |
|-----------|-----------|-------|
| Main entry | apps/backend/src/main.ts | 1-282 |
| App module | apps/backend/src/app.module.ts | 1-78 |
| Auth controller | apps/backend/src/services/auth/auth.controller.ts | 1-271 |
| Order controller | apps/backend/src/services/order/order.controller.ts | 1-32 |
| Payments controller | apps/backend/src/services/payments/payments.controller.ts | 1-177 |
| Wallet controller | apps/backend/src/services/wallet/wallet.controller.ts | 1-138 |
| Compliance controller | apps/backend/src/compliance/compliance.controller.ts | 1-273 |
| Kitchen controller | apps/backend/src/modules/kitchen/kitchen.controller.ts | 1-204 |
| Security config | apps/backend/src/main.ts | 203-248 |
| Rate limiting | apps/backend/src/main.ts | 127-135 |
| Encryption | apps/backend/src/security/encryption.service.ts | - |
| RBAC | apps/backend/src/security/permissions.ts | - |
| Queue | apps/backend/src/infra/queue/queue.service.ts | - |
| WebSocket | apps/backend/src/infra/tracking/tracking.gateway.ts | - |
| Entities | apps/backend/src/db/entities/*.entity.ts | 72 files |
| Migrations | apps/backend/src/db/migrations/*.ts | 2 files |
| Test results | project-audit/logs/tests.log | 1-222 |
| Build log | project-audit/logs/build.log | 1-240 |
