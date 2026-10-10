# SpiceGarden API Audit Report

Generated: 2026-07-04
Evidence source: Direct inspection of all controller files in apps/backend/src/

## 1. API Architecture

- **Framework**: NestJS 11.1 with decorator-based routing
- **Authentication**: JWT (Passport) + OAuth2 (Google, Facebook)
- **Authorization**: RBAC with 8 roles + granular permissions (@Roles, @Permissions decorators)
- **Validation**: class-validator via global ValidationPipe (whitelist, forbidNonWhitelisted, transform)
- **Rate Limiting**: 4 namespaces (AUTH_OTP: 3/10min, AUTH: 5/15min, ORDERS: 10/15min, API: 100/15min)
- **Documentation**: Swagger configured (@nestjs/swagger) but no UI route registered
- **Versioning**: None (single namespace)

## 2. Complete Endpoint Inventory

### 2.1 Authentication API (auth.controller.ts)

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| POST | `/auth/login` | None | 5/15min | Email/password login, sets httpOnly cookies |
| POST | `/auth/register` | None | 5/15min | Customer registration |
| POST | `/auth/refresh-token` | Cookie | 5/15min | Refresh access token from httpOnly cookie |
| POST | `/auth/logout` | Cookie | 5/15min | Revoke session, clear cookies |
| GET | `/auth/me` | JWT | 5/15min | Get current user profile |
| POST | `/auth/forgot-password` | None | 5/15min | Request password reset |
| POST | `/auth/verify-reset-code` | None | 5/15min | Verify reset code |
| POST | `/auth/reset-password` | None | 5/15min | Reset password with code |
| GET | `/auth/google` | OAuth | 5/15min | Google OAuth redirect |
| GET | `/auth/google/callback` | OAuth | 5/15min | Google OAuth callback |
| GET | `/auth/facebook` | OAuth | 5/15min | Facebook OAuth redirect |
| GET | `/auth/facebook/callback` | OAuth | 5/15min | Facebook OAuth callback |

### 2.2 Order API (order.controller.ts)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/orders` | JWT | customer,admin,super_admin | Place order with optional idempotency key |
| GET | `/orders/health` | None | Any | Health check |
| GET | `/orders/:id` | JWT | customer,admin,super_admin,delivery_partner | Get order with details |

### 2.3 Restaurant API (restaurant.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/restaurants` | None | List all restaurants |
| GET | `/restaurants/search` | None | Search restaurants by query |
| GET | `/restaurants/nearby` | None | Find nearby restaurants by lat/lng/radius |
| GET | `/restaurants/:slug` | None | Get restaurant details by slug |
| PUT | `/restaurants/branch/:id/status` | JWT | Update branch online status |

### 2.4 Admin API (admin.controller.ts)

| Method | Path | Auth | Roles | Permissions | Description |
|--------|------|------|-------|-------------|-------------|
| GET | `/admin/dashboard` | JWT | admin,super_admin | analytics:read | Dashboard stats |
| GET | `/admin/stats` | JWT | admin,super_admin | analytics:read | Full stats |
| GET | `/admin/orders` | JWT | admin,super_admin | orders:manage | Paginated orders |
| POST | `/admin/users/ban` | JWT | admin,super_admin | users:manage | Ban user |

### 2.5 Payments API (payments.controller.ts)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/payments/create-intent` | JWT | customer,admin,super_admin | Create payment intent with optional gateway |
| POST | `/payments/refund` | JWT | admin,super_admin,finance_staff | Refund payment |
| GET | `/payments/gateways` | JWT | customer,restaurant,admin,super_admin | List available gateways |
| GET | `/payments/gateway/config` | JWT | customer,restaurant,admin,super_admin | Gateway configuration |

### 2.6 Webhook API (webhook.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payments/webhook` | Signature | Handle Stripe/Razorpay webhooks |
| GET | `/payments/webhook/stats` | None | Webhook processing stats |

### 2.7 Payment Provider API (payment-provider.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payment-provider/stripe-connect/onboard` | JWT | Create Stripe Connect account |
| GET | `/payment-provider/stripe-connect/status` | JWT | Get Stripe Connect status |
| POST | `/payment-provider/razorpay/settlement/onboard` | JWT | Create Razorpay fund account |
| GET | `/payment-provider/razorpay/settlement/status` | JWT | Get Razorpay settlement status |
| GET | `/payment-provider/restaurant/payout-history` | JWT | Get payout history |
| GET | `/payment-provider/restaurant/balance` | JWT | Get account balance |

### 2.8 Chargeback API (chargeback.controller.ts)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/chargebacks/:disputeId` | JWT | admin,super_admin,finance_staff,customer | Get dispute by ID |
| GET | `/chargebacks/order/:orderId` | JWT | admin,super_admin,finance_staff,customer | Get disputes for order |
| GET | `/chargebacks` | JWT | admin,super_admin,finance_staff | List disputes with filters |
| POST | `/chargebacks/:disputeId/initiate-refund` | JWT | admin,super_admin,finance_staff | Initiate refund for won dispute |
| GET | `/chargebacks/stats/overview` | JWT | admin,super_admin,finance_staff | Dispute statistics |

### 2.9 Refund API (refund.controller.ts)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/refunds/request` | JWT | customer,admin,super_api | Create refund request |
| PATCH | `/refunds/:approvalId/approve` | JWT | admin,super_admin,finance_staff | Approve refund |
| PATCH | `/refunds/:approvalId/reject` | JWT | admin,super_admin,finance_staff | Reject refund |
| POST | `/refunds/:approvalId/process` | JWT | admin,super_admin,finance_staff | Process approved refund |
| GET | `/refunds/:approvalId` | JWT | admin,super_admin,finance_staff,customer | Get refund request |
| GET | `/refunds/order/:orderId` | JWT | admin,super_admin,finance_staff,customer | Get refunds for order |
| GET | `/refunds` | JWT | admin,super_admin,finance_staff | Get refunds by status |

### 2.10 Wallet API (wallet.controller.ts)

| Method | Path | Auth | Roles | Permissions | Description |
|--------|------|------|-------|-------------|-------------|
| GET | `/wallet` | JWT | customer | wallet:read_own | Get wallet |
| GET | `/wallet/balance` | JWT | customer | wallet:read_own | Get balance |
| GET | `/wallet/transactions` | JWT | customer | wallet:read_own | Get transactions |
| POST | `/wallet/credit` | JWT | admin,super_admin,finance_staff | finance:read | Credit wallet |
| POST | `/wallet/debit` | JWT | admin,super_admin,finance_staff | finance:read | Debit wallet |
| POST | `/wallet/compensate` | JWT | admin,super_admin,finance_staff | finance:read | Compensate user |
| POST | `/wallet/cod/process` | JWT | customer | wallet:transact_own | Process COD payment |
| POST | `/wallet/cod/confirm` | JWT | delivery_partner | deliveries:manage_assigned | Confirm COD collection |
| POST | `/wallet/cod/refund` | JWT | admin,super_admin,finance_staff | finance:read | Refund COD |
| POST | `/wallet/prevent-duplicate` | JWT | customer | wallet:transact_own | Prevent duplicate payment |

### 2.11 Support API (support.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/support/disputes` | JWT | Raise dispute |
| GET | `/support/disputes` | JWT | Get disputes with filters |
| PUT | `/support/disputes/:id/review` | JWT | Review dispute |
| POST | `/support/refunds` | JWT | Request refund |
| PUT | `/support/refunds/:id/process` | JWT | Process refund |
| GET | `/support/tickets/stats` | JWT | Get queue stats |
| POST | `/support/tickets/:id/route` | JWT | Route ticket |
| POST | `/support/tickets/:id/escalate` | JWT | Escalate ticket |

### 2.12 Search API (search.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/search` | None | Search restaurants/menus |
| GET | `/search/trending` | None | Get trending searches |
| GET | `/search/recommended` | JWT | Get personalized recommendations |

### 2.13 Review API (review.controller.ts)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/reviews` | JWT | customer,admin,super_admin | Create review |
| GET | `/reviews/order/:orderId` | None | Any | Find review by order |
| GET | `/reviews/restaurant/:restaurantId` | None | Any | Find reviews by restaurant |
| GET | `/reviews/restaurant/:restaurantId/rating` | None | Any | Get average rating |

### 2.14 User Profile API (user-profile.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/user/addresses` | JWT | Get user addresses |
| POST | `/user/addresses` | JWT | Create address |
| PUT | `/user/addresses/:id` | JWT | Update address |
| DELETE | `/user/addresses/:id` | JWT | Delete address |
| GET | `/user/payment-methods` | JWT | Get payment methods |
| POST | `/user/payment-methods` | JWT | Create payment method |
| DELETE | `/user/payment-methods/:id` | JWT | Delete payment method |
| PUT | `/user/payment-methods/:id/set-default` | JWT | Set default payment method |

### 2.15 Address API (address.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/addresses` | JWT | Get user addresses |
| POST | `/addresses` | JWT | Add address |
| PUT | `/addresses/:id/default` | JWT | Set default address |
| DELETE | `/addresses/:id` | JWT | Delete address |

### 2.16 Payment Methods API (payment-methods.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/payment-methods` | JWT | Get payment methods |
| POST | `/payment-methods` | JWT | Add payment method |
| PUT | `/payment-methods/:id/default` | JWT | Set default |
| DELETE | `/payment-methods/:id` | JWT | Delete |

### 2.17 Menu API (menu-customization.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/menus/:restaurantId/items` | None | Get menu items |
| GET | `/menus/items/:itemId` | None | Get item details |
| GET | `/menus/items/:itemId/addons` | None | Get item addons |
| GET | `/menus/categories/:restaurantId` | None | Get categories |

### 2.18 Driver Fleet API (driver-fleet.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/fleet/shifts/start` | JWT | Start driver shift |
| POST | `/fleet/shifts/end` | JWT | End driver shift |
| GET | `/fleet/shifts/:driverId` | JWT | Get shift history |
| POST | `/fleet/earnings` | JWT | Get earnings for period |
| POST | `/fleet/incentives/calculate` | JWT | Calculate incentives |
| POST | `/fleet/incentives` | JWT | Generate incentive |
| GET | `/fleet/performance` | JWT | Get performance ranking |
| GET | `/fleet/performance/:driverId` | JWT | Get driver performance |
| GET | `/fleet/schedule/:driverId` | JWT | Get driver schedule |
| PUT | `/fleet/penalties/:id/approve` | JWT | Approve penalty |
| PUT | `/fleet/penalties/:id/waive` | JWT | Waive penalty |

### 2.19 Driver Ops API (driver-ops.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/drivers/onboarding` | JWT | Start driver onboarding |
| POST | `/drivers/documents` | JWT | Upload document |
| GET | `/drivers/documents/:driverId` | JWT | Get documents |
| PUT | `/drivers/documents/:id/verify` | JWT | Verify document |
| GET | `/drivers/onboarding/:id/status` | JWT | Get onboarding status |
| POST | `/drivers/incentives/calculate` | JWT | Calculate weekly incentives |
| POST | `/drivers/incentives` | JWT | Generate incentive |
| PUT | `/drivers/incentives/:id/approve` | JWT | Approve incentive |
| GET | `/drivers/incentives/pending` | JWT | Get pending incentives |

### 2.20 Finance API (finance.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/finance/gst/report` | JWT | Generate GST report |
| POST | `/finance/reconciliation/payments` | JWT | Reconcile payments |
| POST | `/finance/reconciliation/payouts` | JWT | Reconcile payouts |
| POST | `/finance/reconciliation/driver` | JWT | Reconcile driver payments |
| POST | `/finance/reconciliation/full` | JWT | Run full reconciliation |

### 2.21 GST API (gst.controller.ts)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/gst/calculate/:orderId` | JWT | admin,restaurant | Calculate GST for order |
| GET | `/gst/invoice/:orderId` | JWT | admin,restaurant,customer | Generate GST invoice |
| GET | `/gst/rate-summary/:orderId` | JWT | admin,restaurant | Get GST rate summary |
| POST | `/gst/validate-gstin` | JWT | admin,restaurant | Validate GSTIN |

### 2.22 Loyalty API (loyalty.controller.ts)

| Method | Path | Auth | Roles | Permissions | Description |
|--------|------|------|-------|-------------|-------------|
| POST | `/loyalty/coupons` | JWT | admin,super_admin | orders:manage | Create coupon |
| POST | `/loyalty/coupons/apply` | JWT | customer | wallet:transact_own | Apply coupon |
| GET | `/loyalty/coupons` | JWT | admin,super_admin | orders:manage | Get all coupons |
| GET | `/loyalty/coupons/:id/analytics` | JWT | admin,super_admin | analytics:read | Coupon analytics |
| PUT | `/loyalty/coupons/:id/deactivate` | JWT | admin,super_admin | orders:manage | Deactivate coupon |
| POST | `/loyalty/referrals/code` | JWT | customer | orders:read_own | Generate referral code |
| POST | `/loyalty/referrals/process` | JWT | admin,super_admin | orders:manage | Process referral |
| GET | `/loyalty/referrals/:userId` | JWT | customer | orders:read_own | Get referral history |
| POST | `/loyalty/cashback/process` | JWT | admin,super_admin,finance_staff | finance:read | Process cashback |
| GET | `/loyalty/cashback/:userId` | JWT | customer | wallet:read_own | Get cashback summary |

### 2.23 Maps API (maps.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/maps/eta` | None | Calculate ETA |
| GET | `/maps/surge-eta` | None | Calculate surge-adjusted ETA |
| POST | `/maps/reroute` | None | Get rerouting options |
| GET | `/maps/heatmap` | None | Get delivery heatmap |
| GET | `/maps/surge-zones` | None | List active surge zones |
| GET | `/maps/check-surge-zone` | None | Check if in surge zone |

### 2.24 Analytics API (analytics.controller.ts)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/analytics/top-dishes` | JWT | restaurant,admin,super_admin | Top selling dishes |
| GET | `/analytics/churn` | JWT | restaurant,admin,super_admin | Churn analysis |
| GET | `/analytics/repeat-users` | JWT | restaurant,admin,super_admin | Repeat user analytics |
| GET | `/analytics/conversion` | JWT | restaurant,admin,super_admin | Conversion funnel |
| GET | `/analytics/heatmap` | JWT | restaurant,admin,super_admin | Delivery heatmap |
| GET | `/analytics/peak-hours` | JWT | restaurant,admin,super_admin | Peak hours analysis |
| GET | `/analytics/restaurant/:id` | JWT | restaurant,admin,super_admin | Full restaurant analytics |
| GET | `/analytics/platform` | JWT | admin,super_admin | Platform-wide analytics |

### 2.25 Kitchen API (kitchen.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/kitchen/inventory` | JWT | Create inventory item |
| PUT | `/kitchen/inventory/:id/stock` | JWT | Update inventory stock |
| PUT | `/kitchen/inventory/:id/wastage` | JWT | Record wastage |
| GET | `/kitchen/inventory/low-stock/:branchId` | JWT | Get low stock items |
| POST | `/kitchen/recipes` | JWT | Create recipe |
| GET | `/kitchen/recipes/:id` | JWT | Get recipe by ID |
| POST | `/kitchen/batches` | JWT | Create batch |
| PUT | `/kitchen/batches/:id/status` | JWT | Update batch status |
| POST | `/kitchen/food-prep` | JWT | Log food preparation |
| PUT | `/kitchen/food-prep/:id/quality` | JWT | Update food prep quality |
| POST | `/kitchen/sla` | JWT | Record kitchen SLA |
| POST | `/kitchen/sla/avg-prep-time/:branchId` | JWT | Record average prep time |
| POST | `/kitchen/sla/late-prep/:branchId` | JWT | Record late prep percentage |
| POST | `/kitchen/sla/food-rejection/:branchId` | JWT | Record food rejection rate |
| POST | `/kitchen/sla/throughput/:branchId` | JWT | Record throughput |
| GET | `/kitchen/sla/branch/:branchId` | JWT | Get SLA by branch |
| GET | `/kitchen/sla/summary/:branchId` | JWT | Get SLA summary |
| POST | `/kitchen/suppliers` | JWT | Create supplier |
| GET | `/kitchen/suppliers/:id/inventory` | JWT | Get supplier inventory |
| GET | `/kitchen/inventory/consumption/:branchId` | JWT | Get inventory consumption |
| GET | `/kitchen/inventory/forecast/:branchId` | JWT | Forecast inventory needs |

### 2.26 Compliance API (compliance.controller.ts)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/compliance/soc2` | JWT | super_admin | SOC2 readiness |
| GET | `/compliance/soc2/evidence` | JWT | super_admin | SOC2 evidence report |
| GET | `/compliance/pci-dss` | JWT | super_admin | PCI-DSS compliance |
| GET | `/compliance/secrets/rotation-status` | JWT | super_admin | Secrets rotation status |
| POST | `/compliance/secrets/rotate` | JWT | super_admin | Rotate secrets |
| GET | `/compliance/retention-stats` | JWT | admin,super_admin | Data retention stats |
| GET | `/compliance/gdpr/user/:userId/export` | JWT | customer,admin,super_admin | GDPR data export |
| GET | `/compliance/dpdp/user/:userId/export` | JWT | customer,admin,super_admin | DPDP data export |
| POST | `/compliance/gdpr/user/:userId/deletion-request` | JWT | customer,admin | GDPR deletion request |
| POST | `/compliance/mask/pii` | JWT | admin | Mask PII fields |
| POST | `/compliance/unmask/pii` | JWT | admin | Unmask PII fields |

### 2.27 Legal API (legal.controller.ts)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/legal/privacy-policy` | None | Return privacy policy JSON |
| GET | `/legal/terms-of-service` | None | Return terms of service JSON |
| GET | `/legal/intellectual-property` | None | Return IP/license info |

### 2.28 gRPC Controllers (placeholder)

| Controller | Path | Status |
|------------|------|--------|
| GrpcAuthController | `grpc/auth` | Placeholder |
| GrpcOrderController | `grpc/order` | Placeholder |

## 3. API Documentation Status

| Aspect | Status | Evidence |
|--------|--------|----------|
| Swagger decorators | ✅ Present | @ApiTags, @ApiOperation, @ApiResponse, @ApiBody, @ApiParam, @ApiQuery |
| Swagger UI | ❌ Missing | No route registered for /api/docs |
| OpenAPI spec | ❌ Missing | No JSON/YAML spec generated |
| Postman collection | ❌ Missing | Not found |

## 4. API Quality Assessment

| Metric | Value | Assessment |
|--------|-------|------------|
| Total endpoints | 150+ | Good coverage |
| Authenticated endpoints | ~85% | Strong auth posture |
| Rate-limited endpoints | ~100% | Comprehensive |
| Input-validated endpoints | ~70% | Some use `any` types |
| Swagger-decorated endpoints | ~60% | Decorators present but no UI |
| Consistent response format | ~80% | Varies by module |

## 5. API Gaps

| Gap | Severity | Impact |
|-----|----------|--------|
| No Swagger UI | HIGH | Developer experience |
| No API versioning | HIGH | Future breaking changes |
| Some `any` types | MEDIUM | Type safety |
| No Postman/OpenAPI export | MEDIUM | Integration testing |
| No request ID header | MEDIUM | Debugging |