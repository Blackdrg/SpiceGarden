# SpiceGarden API Documentation

**Version:** 0.0.0  
**Base URL:** `http://localhost:3001` (development) / production host  
**Auth:** JWT tokens issued via `access_token` HTTP-only cookies. Refresh tokens via `refresh_token` cookies. All protected endpoints require `JwtAuthGuard`.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Authorization](#authorization)
3. [Common Patterns](#common-patterns)
4. [Auth Endpoints](#auth-endpoints)
5. [Order Endpoints](#order-endpoints)
6. [Payment Endpoints](#payment-endpoints)
7. [Refund Endpoints](#refund-endpoints)
8. [Restaurant Endpoints](#restaurant-endpoints)
9. [Restaurant Operations Endpoints](#restaurant-operations-endpoints)
10. [Search Endpoints](#search-endpoints)
11. [Review Endpoints](#review-endpoints)
12. [Discount and Loyalty Endpoints](#discount-and-loyalty-endpoints)
13. [Analytics Endpoints](#analytics-endpoints)
14. [Driver Assignment Endpoints](#driver-assignment-endpoints)
15. [Driver Fleet Endpoints](#driver-fleet-endpoints)
16. [Wallet Endpoints](#wallet-endpoints)
17. [Admin Endpoints](#admin-endpoints)
18. [Support Endpoints](#support-endpoints)
19. [Finance Endpoints](#finance-endpoints)
20. [Payment Provider Endpoints](#payment-provider-endpoints)
21. [Business Engine Endpoints](#business-engine-endpoints)
22. [GST Endpoints](#gst-endpoints)
23. [Maps Endpoints](#maps-endpoints)
24. [User Profile Endpoints](#user-profile-endpoints)
25. [Metrics Endpoints](#metrics-endpoints)
26. [Notification Endpoints](#notification-endpoints)
27. [Payment Webhook Endpoints](#payment-webhook-endpoints)
28. [Legal Endpoints](#legal-endpoints)

---

## Authentication

### Cookie-Based Auth
- Access token: `access_token` cookie (HTTP-only, 1 hour, `SameSite: lax`)
- Refresh token: `refresh_token` cookie (HTTP-only, 30 days configurable via `SESSION_DURATION_DAYS`)
- Refresh via `POST /auth/refresh-token` (reads `refresh_token` from cookie, rotates)

### OAuth2
- `GET /auth/google` → Google OAuth2 login
- `GET /auth/facebook` → Facebook OAuth2 login
- Callbacks redirect to `FRONTEND_URL` with cookies set

---

## Authorization

### Roles
| Role | Description |
|------|-------------|
| `customer` | End user placing orders |
| `restaurant` | Restaurant owner/manager |
| `kitchen_staff` | Kitchen staff managing orders |
| `delivery_partner` | Delivery executive |
| `admin` | Platform administrator |
| `super_admin` | Full platform access |
| `support_staff` | Support ticket management |
| `finance_staff` | Finance, reconciliation, refunds |

### Guards
- `JwtAuthGuard` — validates JWT from cookie or `Authorization: Bearer` header
- `RolesGuard` — checks `@Roles()` decorator against authenticated user role
- `PermissionGuard` — checks `@Permissions()` decorator against role-permission map

### Permission Mapping
| Role | Permissions |
|------|-------------|
| `customer` | `orders:read_own`, `orders:create`, `wallet:read_own`, `wallet:transact_own` |
| `restaurant` | `restaurants:manage_own`, `orders:manage_assigned`, `kitchen:manage_own`, `menus:manage_own` |
| `delivery_partner` | `deliveries:manage_assigned`, `orders:read_assigned` |
| `admin` | `users:manage`, `restaurants:manage`, `orders:manage`, `payments:manage`, `support:manage`, `analytics:read`, `finance:read`, `notifications:manage`, `compliance:read` |
| `super_admin` | `*` (all permissions) |
| `support_staff` | `support:manage`, `orders:read` |
| `finance_staff` | `finance:read`, `payments:read`, `refunds:read` |

---

## Common Patterns

### Rate Limiting
| Route | Limit | Window |
|-------|-------|--------|
| `/auth/otp` | 3 requests | 10 minutes |
| `/auth/` | 5 requests | 15 minutes |
| `/orders` | 10 requests | 15 minutes |
| `/api/` | 100 requests | 15 minutes |

### Headers
- `x-idempotency-key` — required for idempotent payment operations
- `x-csrf-token` — required for state-changing requests in production
- `Idempotency-Key` — alternative idempotency header
- `X-Request-Id` — request tracing

### Response Conventions
- Success: `200 OK` with JSON body
- Validation errors: `400 Bad Request`
- Auth errors: `401 Unauthorized`
- Permission errors: `403 Forbidden`
- Not found: `404 Not Found`
- Conflicts: `409 Conflict`

---

## Auth Endpoints

**Base path:** `/auth`  
**Controller:** `apps/backend/src/services/auth/auth.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/auth/login` | None | — | Email/password login. Body: `{email, password, deviceName?, deviceType?}`. Returns user info + sets cookies. |
| POST | `/auth/register` | None | — | Register new customer. Body: `{email, phone, fullName, password, deviceName?, deviceType?}`. Returns user info + sets cookies. |
| POST | `/auth/refresh-token` | None | — | Refresh access token via `refresh_token` cookie. Returns `{refresh_token}` + new cookie. |
| POST | `/auth/logout` | None | — | Revoke session + clear cookies. Returns `{revoked: true}`. |
| GET | `/auth/me` | ✅ | Authenticated | Get current user. Returns `{user: {id, email, fullName, role, status}}`. |
| POST | `/auth/forgot-password` | None | — | Initiate password reset. Body: `{email}`. Always returns generic message. |
| POST | `/auth/verify-reset-code` | None | — | Verify OTP code. Body: `{email, code}`. Returns `{valid: true}` or 400. |
| POST | `/auth/reset-password` | None | — | Reset password. Body: `{email, code, password}`. Min 8 chars. |
| GET | `/auth/google` | None | — | Redirect to Google OAuth2. |
| GET | `/auth/facebook` | None | — | Redirect to Facebook OAuth2. |

---

## Order Endpoints

**Base path:** `/orders`  
**Controller:** `apps/backend/src/services/order/order.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/orders` | ✅ | `customer`, `admin`, `super_admin` | Place order. Body: order items, address, payment method. Header: `x-idempotency-key` optional. Returns order. |
| GET | `/orders/health` | None | — | Health check. Returns `{status, timestamp}`. |
| GET | `/orders/:id` | ✅ | `customer`, `admin`, `super_admin`, `delivery_partner` | Get order details with items, driver, payment. |

**Order Status Enum (app services/order/order.interface.ts):**  
`PLACED` → `PAYMENT_CONFIRMED` → `RESTAURANT_ACCEPTED` → `PREPARING` → `READY` → `DRIVER_ASSIGNED` → `PICKED_UP` → `ON_THE_WAY` → `DELIVERED`  
Transitions: `CANCELLED`, `BATCHED`

---

## Payment Endpoints

**Base path:** `/payments`  
**Controller:** `apps/backend/src/services/payments/payments.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/payments/create-intent` | ✅ | `customer`, `admin`, `super_admin` | Create payment intent. Body: `{amount, currency?, userId, orderId?, paymentMethodId?}`. Header: `x-idempotency-key`. Query: `gateway` optional. Returns `{clientSecret, gateway}`. |
| POST | `/payments/refund` | ✅ | `admin`, `super_admin`, `finance_staff` | Refund payment. Body: `{paymentIntentId, amount, userId, reason?}`. Header: `x-idempotency-key`. Query: `gateway` optional. |
| GET | `/payments/gateways` | ✅ | `customer`, `restaurant`, `admin`, `super_admin` | List available gateways. Returns `['stripe', 'razorpay']`. |
| GET | `/payments/gateway/config` | ✅ | `customer`, `restaurant`, `admin`, `super_admin` | Get gateway config. Returns `{primaryGateway, availableGateways, stripeEnabled, razorpayEnabled}`. |

### Payment Gates
- **Stripe:** Primary by default. `stripe-gateway.service.ts`
- **Razorpay:** Secondary (INR). `razorpay-gateway.service.ts`
- **COD:** Cash on Delivery. `cod.service.ts`

---

## Refund Endpoints

**Base path:** `/refunds`  
**Controller:** `apps/backend/src/services/refund/refund.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/refunds/request` | ✅ | `customer`, `admin`, `super_admin` | Create refund request. Body: `{orderId, requestedBy, amount, reason, requestType?}`. |
| PATCH | `/refunds/:approvalId/approve` | ✅ | `admin`, `super_admin`, `finance_staff` | Approve refund. Body: `{approverId, notes?}`. |
| PATCH | `/refunds/:approvalId/reject` | ✅ | `admin`, `super_admin`, `finance_staff` | Reject refund. Body: `{approverId, reason}`. |
| POST | `/refunds/:approvalId/process` | ✅ | `admin`, `super_admin`, `finance_staff` | Process refund. Body: `{processedBy, gateway?}`. |
| GET | `/refunds/:approvalId` | ✅ | `admin`, `super_admin`, `finance_staff`, `customer` | Get refund request details. |
| GET | `/refunds/order/:orderId` | ✅ | `admin`, `super_admin`, `finance_staff`, `customer` | Get refunds for order. |
| GET | `/refunds` | ✅ | `admin`, `super_admin`, `finance_staff` | List refunds by status. Query: `status?` (pending, approved, rejected, processed, failed). |

---

## Restaurant Endpoints

**Base path:** `/restaurants`  
**Controller:** `apps/backend/src/services/restaurant/restaurant.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/restaurants` | None | — | List all restaurants. |
| GET | `/restaurants/search` | None | — | Search restaurants. Query: `q` (search term). |
| GET | `/restaurants/nearby` | None | — | Find nearby restaurants. Query: `lat`, `lng`, `radius?`. |
| GET | `/restaurants/:slug` | None | — | Restaurant details by slug. |
| PUT | `/restaurants/branch/:id/status` | ✅ | `restaurant`, `admin` | Update branch online status. Body: `{isOnline}`. |

---

## Restaurant Operations Endpoints

**Base path:** `/restaurant/ops`  
**Controller:** `apps/backend/src/services/restaurant/business-engine.controller.ts` + `restaurant.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/restaurant/ops/metrics` | ✅ | Admin/SuperAdmin | KDS metrics. |
| GET | `/restaurant/ops/restaurants` | ✅ | Admin/SuperAdmin | Restaurant operations data. |
| GET | `/restaurant/ops/drivers/live` | ✅ | Admin/SuperAdmin | Live driver tracking. |
| POST | `/restaurant/ops/drivers/:id/location` | ✅ | Admin/SuperAdmin | Update driver location. |
| POST | `/restaurant/ops/drivers/:id/availability` | ✅ | Admin/SuperAdmin | Update driver availability. |
| GET | `/restaurant/ops/dashboard` | ✅ | Admin/SuperAdmin | Restaurant dashboard data. |
| GET | `/restaurant/ops/uptime` | ✅ | Admin/SuperAdmin | Restaurant uptime stats. |
| POST | `/restaurant/ops/onboarding` | ✅ | Admin/SuperAdmin | Start restaurant onboarding. |
| GET | `/restaurant/ops/onboarding/:id` | ✅ | Admin/SuperAdmin | Get onboarding status. |
| PUT | `/restaurant/ops/onboarding/:id/step` | ✅ | Admin/SuperAdmin | Update onboarding step. |
| POST | `/restaurant/ops/onboarding/:id/complete` | ✅ | Admin/SuperAdmin | Complete onboarding. |
| POST | `/restaurant/ops/moderation` | ✅ | Admin/SuperAdmin | Menu moderation action. |
| GET | `/restaurant/ops/moderation/pending` | ✅ | Admin/SuperAdmin | Pending moderation items. |
| PUT | `/restaurant/ops/moderation/:id/review` | ✅ | Admin/SuperAdmin | Review moderation item. |
| GET | `/restaurant/ops/payout/history` | ✅ | Admin/SuperAdmin | Payout history. |
| POST | `/restaurant/ops/payout/generate` | ✅ | Admin/SuperAdmin | Generate payout. |
| POST | `/restaurant/ops/payout/:id/process` | ✅ | Admin/SuperAdmin | Process payout. |
| POST | `/restaurant/ops/branch` | ✅ | Admin/SuperAdmin | Create branch. |
| PUT | `/restaurant/ops/branch/:id` | ✅ | Admin/SuperAdmin | Update branch. |
| PUT | `/restaurant/ops/branch/:id/status` | ✅ | Admin/SuperAdmin | Branch status. |
| GET | `/restaurant/ops/branch/:id` | ✅ | Admin/SuperAdmin | Get branch details. |
| POST | `/restaurant/ops/commission` | ✅ | Admin/SuperAdmin | Create commission rule. |
| GET | `/restaurant/ops/commission/:restaurantId` | ✅ | Admin/SuperAdmin | Get commission rules. |
| POST | `/restaurant/ops/commission/calculate` | ✅ | Admin/SuperAdmin | Calculate commission. |

---

## Search Endpoints

**Base path:** `/search`  
**Controller:** `apps/backend/src/services/search/search.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/search` | None | — | Search. Query: `q` (term). |
| GET | `/search/trending` | None | — | Get trending searches. |
| GET | `/search/recommended` | ✅ | Authenticated | Get recommended for user. |

---

## Review Endpoints

**Base path:** `/reviews`  
**Controller:** `apps/backend/src/services/review/review.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/reviews` | ✅ | `customer`, `admin`, `super_admin` | Create review. Body: `{restaurantId, orderId, rating, comment?, images?}`. |
| GET | `/reviews/order/:orderId` | ✅ | Authenticated | Get review by order. |
| GET | `/reviews/restaurant/:restaurantId` | None | — | Get restaurant reviews. |
| GET | `/reviews/restaurant/:restaurantId/rating` | None | — | Get restaurant average rating. |

---

## Discount and Loyalty Endpoints

**Base path:** `/loyalty`  
**Controller:** `apps/backend/src/services/loyalty/loyalty.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/loyalty/coupons` | ✅ | `admin`, `super_admin` | Create coupon. Body: `{code, type, discountValue, validFrom, validUntil, usageLimit?, scope?}`. |
| POST | `/loyalty/coupons/apply` | ✅ | `customer`, `admin`, `super_admin` | Apply coupon. Body: `{code, orderId, userId}`. |
| GET | `/loyalty/coupons` | ✅ | Authenticated | List active coupons. |
| GET | `/loyalty/coupons/:id/analytics` | ✅ | `admin`, `super_admin`, `restaurant` | Coupon analytics. |
| PUT | `/loyalty/coupons/:id/deactivate` | ✅ | `admin`, `super_admin` | Deactivate coupon. |
| POST | `/loyalty/referrals/code` | ✅ | `customer`, `admin`, `super_admin` | Generate referral code. |
| POST | `/loyalty/referrals/process` | ✅ | `customer`, `admin`, `super_admin` | Process referral. Body: `{code, refereeId}`. |
| GET | `/loyalty/referrals/:userId` | ✅ | `customer`, `admin`, `super_admin` | Get user referrals. |
| POST | `/loyalty/cashback/process` | ✅ | `admin`, `super_admin` | Process cashback. Body: `{userId, amount, orderId}`. |
| GET | `/loyalty/cashback/:userId` | ✅ | `customer`, `admin`, `super_admin` | Get cashback history. |

---

## Analytics Endpoints

**Base path:** `/analytics`  
**Controller:** `apps/backend/src/modules/analytics/analytics.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/analytics/top-dishes` | ✅ | `restaurant`, `admin`, `super_admin` | Top dishes. Query: `restaurantId?`, `period?` (days). |
| GET | `/analytics/churn` | ✅ | `restaurant`, `admin`, `super_admin` | Churn analysis. Query: `restaurantId?`, `period?`. |
| GET | `/analytics/repeat-users` | ✅ | `restaurant`, `admin`, `super_admin` | Repeat user analytics. Query: `restaurantId?`, `period?`. |
| GET | `/analytics/conversion` | ✅ | `restaurant`, `admin`, `super_admin` | Conversion funnel. Query: `restaurantId?`, `period?`. |
| GET | `/analytics/heatmap` | ✅ | `restaurant`, `admin`, `super_admin` | Delivery heatmap. Query: `restaurantId?`, `period?`. |
| GET | `/analytics/peak-hours` | ✅ | `restaurant`, `admin`, `super_admin` | Peak hours analysis. Query: `restaurantId?`, `period?`. |
| GET | `/analytics/restaurant/:id` | ✅ | `restaurant`, `admin`, `super_admin` | Full restaurant analytics. |
| GET | `/analytics/platform` | ✅ | `admin`, `super_admin` | Platform-wide analytics. |

---

## Driver Assignment Endpoints

**Base path:** `/driver-assignment`  
**Controller:** `apps/backend/src/modules/driver-assignment/driver-assignment.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/driver-assignment/assign/:orderId` | ✅ | `delivery_partner`, `admin`, `super_admin` | Assign driver to order. |
| POST | `/driver-assignment/batch-assign` | ✅ | `delivery_partner`, `admin`, `super_admin` | Batch assign orders. Body: `{orderIds[], driverId}`. |
| PUT | `/driver-assignment/reassign/:assignmentId` | ✅ | `delivery_partner`, `admin`, `super_admin` | Reassign order. Body: `{newDriverId, reason?}`. |
| GET | `/driver-assignment/driver/:driverId/assignments` | ✅ | `delivery_partner`, `admin`, `super_admin` | Driver assignments. Query: `status?`. |
| GET | `/driver-assignment/order/:orderId/assignments` | ✅ | `delivery_partner`, `admin`, `super_admin` | Order assignments. |
| PUT | `/driver-assignment/:assignmentId/status` | ✅ | `delivery_partner`, `admin`, `super_admin` | Update assignment status. Body: `{status, actualTimeMinutes?}`. |
| PUT | `/driver-assignment/:assignmentId/route` | ✅ | `delivery_partner`, `admin`, `super_admin` | Update route data. Body: `{start, end, waypoints[]}`. |
| GET | `/driver-assignment/drivers/available` | ✅ | `delivery_partner`, `admin`, `super_admin` | Available drivers. Query: `lat`, `lng`, `radius?` (default 5km). |
| POST | `/driver-assignment/drivers/:driverId/score` | ✅ | `delivery_partner`, `admin`, `super_admin` | Update driver score. |
| GET | `/driver-assignment/eta/:orderId/:driverId` | ✅ | `delivery_partner`, `admin`, `super_admin` | Calculate ETA. |
| POST | `/driver-assignment/sla` | ✅ | `delivery_partner`, `admin`, `super_admin` | Record delivery SLA. Body: `{driverId, branchId, metricName, value, unit, targetValue?, targetUnit?, measurementPeriod?}`. |
| GET | `/driver-assignment/sla` | ✅ | `delivery_partner`, `admin`, `super_admin` | Get SLA metrics. Query: `driverId?`, `branchId?`, `metricName?`, `limit?` (100). |
| POST | `/driver-assignment/fraud` | ✅ | `delivery_partner`, `admin`, `super_admin` | Record fraud incident. Body: `{driverId, orderId, branchId, fraudType, evidence, severity}`. |
| GET | `/driver-assignment/drivers/:driverId/fraud` | ✅ | `delivery_partner`, `admin`, `super_admin` | Driver fraud history. |
| GET | `/driver-assignment/fraud` | ✅ | `delivery_partner`, `admin`, `super_admin` | All fraud incidents. Query: `driverId?`, `limit?` (50). |

---

## Driver Fleet Endpoints

**Base path:** `/drivers`  
**Controller:** `apps/backend/src/services/driver-fleet/driver-fleet.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/drivers/me` | ✅ | `delivery_partner`, `admin`, `super_admin` | Get own driver profile. |
| GET | `/drivers/:id` | ✅ | `delivery_partner`, `admin`, `super_admin` | Get driver by ID. |
| GET | `/drivers/:id/earnings` | ✅ | `delivery_partner`, `admin`, `super_admin` | Driver earnings details. |
| POST | `/drivers/:id/location` | ✅ | `delivery_partner`, `admin`, `super_admin` | Update driver location. Body: `{lat, lng}`. |
| POST | `/drivers/:id/availability` | ✅ | `delivery_partner`, `admin`, `super_admin` | Toggle availability. Body: `{status}`. |
| GET | `/drivers/available` | ✅ | `admin`, `super_admin` | List available drivers. Query: `lat?`, `lng?`, `radius?`. |

---

## Wallet Endpoints

**Base path:** `/wallet`  
**Controller:** `apps/backend/src/services/wallet/wallet.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/wallet/` | ✅ | `customer`, `admin`, `super_admin` | Get wallet. |
| GET | `/wallet/balance` | ✅ | `customer`, `admin`, `super_admin` | Get wallet balance. |
| GET | `/wallet/transactions` | ✅ | `customer`, `admin`, `super_admin` | Get transaction history. |
| POST | `/wallet/credit` | ✅ | `customer`, `admin`, `super_admin` | Credit wallet. Body: `{amount, description?}`. |
| POST | `/wallet/debit` | ✅ | `customer`, `admin`, `super_admin` | Debit wallet. Body: `{amount, description?}`. |
| POST | `/wallet/compensate` | ✅ | `customer`, `admin`, `super_admin` | Wallet compensation. |
| POST | `/wallet/cod/process` | ✅ | `customer`, `admin`, `super_admin` | Process COD payment. |
| POST | `/wallet/cod/confirm` | ✅ | `customer`, `admin`, `super_admin` | Confirm COD collection. |
| POST | `/wallet/cod/refund` | ✅ | `customer`, `admin`, `super_admin` | COD refund. |
| POST | `/wallet/prevent-duplicate` | ✅ | `customer`, `admin`, `super_admin` | Prevent duplicate payment. |

---

## Admin Endpoints

**Base path:** `/admin`  
**Controller:** `apps/backend/src/services/admin/admin.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/admin/dashboard` | ✅ | `admin`, `super_admin` | Admin dashboard stats. |
| GET | `/admin/stats` | ✅ | `admin`, `super_admin` | Platform statistics. |
| GET | `/admin/orders` | ✅ | `admin`, `super_admin` | All orders. |
| POST | `/admin/users/ban` | ✅ | `admin`, `super_admin` | Ban user. Body: `{userId}`. |

---

## Support Endpoints

**Base path:** `/support`  
**Controller:** `apps/backend/src/services/support/support.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/support/disputes` | ✅ | `admin`, `super_admin`, `support_staff` | Raise dispute. Body: `{orderId, customerId, type, description}`. |
| GET | `/support/disputes` | ✅ | `admin`, `super_admin`, `support_staff` | Get disputes. Query: `status?`, `customerId?`, `restaurantId?`, `driverId?`. |
| PUT | `/support/disputes/:id/review` | ✅ | `admin`, `super_admin`, `support_staff` | Review dispute. Body: `{reviewerId, status, notes?}`. |
| POST | `/support/refunds` | ✅ | `admin`, `super_admin`, `support_staff` | Request refund. Body: `{orderId, requestedBy, type, amount, reason}`. |
| PUT | `/support/refunds/:id/process` | ✅ | `admin`, `super_admin`, `support_staff` | Process refund. Body: `{processedBy, paymentReference?}`. |
| GET | `/support/tickets/stats` | ✅ | `admin`, `super_admin`, `support_staff` | Support ticket stats. |
| POST | `/support/tickets/:id/route` | ✅ | `admin`, `super_admin`, `support_staff` | Route ticket. |
| POST | `/support/tickets/:id/escalate` | ✅ | `admin`, `super_admin`, `support_staff` | Escalate ticket. Body: `{level?}` (default 1). |

---

## Finance Endpoints

**Base path:** `/finance`  
**Controller:** `apps/backend/src/services/finance/finance.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/finance/gst/report` | ✅ | `finance_staff`, `admin`, `super_admin` | GST report. Query: `restaurantId`, `month`, `year`. |
| POST | `/finance/reconciliation/payments` | ✅ | `finance_staff`, `admin`, `super_admin` | Reconcile payments. Body: `{startDate, endDate}`. |
| POST | `/finance/reconciliation/payouts` | ✅ | `finance_staff`, `admin`, `super_admin` | Reconcile payouts. Body: `{restaurantId, startDate, endDate}`. |
| POST | `/finance/reconciliation/driver` | ✅ | `finance_staff`, `admin`, `super_admin` | Reconcile driver payments. Body: `{driverId, startDate, endDate}`. |
| POST | `/finance/reconciliation/full` | ✅ | `finance_staff`, `admin`, `super_admin` | Full reconciliation. Body: `{startDate, endDate}`. |

---

## Payment Provider Endpoints

**Base path:** `/payment-provider`  
**Controller:** `apps/backend/src/services/payment-provider/payment-provider.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/payment-provider/stripe-connect/onboard` | ✅ | `restaurant`, `admin`, `super_admin` | Stripe Connect onboarding. |
| GET | `/payment-provider/stripe-connect/status` | ✅ | `restaurant`, `admin`, `super_admin` | Stripe Connect status. |
| POST | `/payment-provider/razorpay/settlement/onboard` | ✅ | `restaurant`, `admin`, `super_admin` | Razorpay settlement onboarding. |
| GET | `/payment-provider/razorpay/settlement/status` | ✅ | `restaurant`, `admin`, `super_admin` | Razorpay settlement status. |
| GET | `/payment-provider/restaurant/payout-history` | ✅ | `restaurant`, `admin`, `super_admin` | Restaurant payout history. |
| GET | `/payment-provider/restaurant/balance` | ✅ | `restaurant`, `admin`, `super_admin` | Restaurant balance. |

---

## Business Engine Endpoints

**Base path:** `/business`  
**Controller:** `apps/backend/src/services/restaurant/business-engine.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/business/metrics` | ✅ | `admin`, `super_admin` | Business metrics. |
| GET | `/business/restaurants` | ✅ | `admin`, `super_admin` | Restaurant data. |
| GET | `/business/restaurants/:id/menu` | ✅ | `admin`, `super_admin` | Restaurant menu. |
| GET | `/business/drivers/live` | ✅ | `admin`, `super_admin` | Live driver data. |
| POST | `/business/drivers/:id/location` | ✅ | `admin`, `super_admin` | Update driver location. Body: `{lat, lng}`. |
| POST | `/business/drivers/:id/availability` | ✅ | `admin`, `super_admin` | Update availability. |
| GET | `/business/dashboard` | ✅ | `admin`, `super_admin` | Business dashboard. |
| GET | `/business/uptime` | ✅ | `admin`, `super_admin` | Uptime metrics. |

---

## GST Endpoints

**Base path:** `/gst`  
**Controller:** `apps/backend/src/services/gst/gst.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/gst/calculate/:orderId` | ✅ | `customer`, `admin`, `super_admin` | Calculate GST for order. |
| GET | `/gst/invoice/:orderId` | ✅ | `customer`, `admin`, `super_admin` | Get GST invoice. |
| GET | `/gst/rate-summary/:orderId` | ✅ | `customer`, `admin`, `super_admin` | Get GST rate summary. |
| POST | `/gst/validate-gstin` | ✅ | `customer`, `admin`, `super_admin` | Validate GSTIN. Body: `{gstin}`. |

---

## Maps Endpoints

**Base path:** `/maps`  
**Controller:** `apps/backend/src/services/maps/maps.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/maps/eta` | None | — | Get ETA. Query: `origin`, `destination`. |
| GET | `/maps/surge-eta` | None | — | Surge-aware ETA. |
| POST | `/maps/reroute` | None | — | Reroute. Body: `{driverId, orderId, newRoute?}`. |
| GET | `/maps/heatmap` | None | — | Delivery heatmap data. Query: `bounds?`. |
| GET | `/maps/surge-zones` | None | — | Surge zone list. |
| GET | `/maps/check-surge-zone` | None | — | Check if location in surge zone. Query: `lat`, `lng`. |

---

## User Profile Endpoints

**Base path:** `/user`  
**Controller:** `apps/backend/src/services/user/user-profile.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/user/addresses` | ✅ | Authenticated | List user addresses. |
| POST | `/user/addresses` | ✅ | Authenticated | Create address. Body: `{label, addressLine, city, state, postalCode, location?, isDefault?}`. |
| PUT | `/user/addresses/:id` | ✅ | Authenticated | Update address. Body: `{label, addressLine, city, state, postalCode, location?, isDefault?}`. |
| DELETE | `/user/addresses/:id` | ✅ | Authenticated | Delete address. |
| GET | `/user/payment-methods` | ✅ | Authenticated | List payment methods. |
| POST | `/user/payment-methods` | ✅ | Authenticated | Add payment method. Body: `{type, cardLast4?, cardBrand?, cardExpiry?, upiId?, isDefault?}`. |
| DELETE | `/user/payment-methods/:id` | ✅ | Authenticated | Delete payment method. |
| PUT | `/user/payment-methods/:id/set-default` | ✅ | Authenticated | Set default payment method. |

---

## Metrics Endpoints

**Base path:** `/metrics`  
**Provider:** `apps/backend/src/main.ts` + `metrics.module.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/metrics` | ✅ | `admin`, `super_admin` with `analytics:read` | Prometheus metrics text. |

**Prometheus metrics collected:**
- `http_requests_total` (counter: method, route, status_code)
- `http_request_duration_seconds` (histogram: method, route, status_code)
- Node.js default metrics (CPU, memory, event loop, etc.)

---

## Notification Endpoints

**Base path:** `/notifications`  
**Controller:** `apps/backend/src/services/notifications/notification.controller.ts`  
**Preferences Controller:** `apps/backend/src/services/notifications/notification-preferences.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/notifications/send-push` | ✅ | `admin`, `super_admin` | Send push notification. |
| GET | `/notifications` | ✅ | Authenticated | List user notifications. |
| PUT | `/notifications/:id/read` | ✅ | Authenticated | Mark notification as read. |
| GET | `/notification-preferences` | ✅ | Authenticated | Get notification preferences. |
| PUT | `/notification-preferences` | ✅ | Authenticated | Update notification preferences. Body: `{pushOrders, pushPromotions, pushDeliveryUpdates, emailOrders, emailPromotions, smsDeliveryUpdates}`. |

---

## Payment Webhook Endpoints

**Base path:** `/payments/webhook`  
**Controller:** `apps/backend/src/services/payments/webhook/webhook.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/payments/webhook` | None | — | Payment gateway webhook. Verifies signature (Stripe: `stripe-signature`, Razorpay: HMAC-SHA256). |
| GET | `/payments/webhook/stats` | None | — | Webhook processing stats. |

---

## Legal Endpoints

**Base path:** `/legal`  
**Controller:** `apps/backend/src/legal/legal.controller.ts`

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/legal/privacy-policy` | None | — | Privacy policy text. |
| GET | `/legal/terms-of-service` | None | — | Terms of service text. |
| GET | `/legal/intellectual-property` | None | — | IP policy text. |

---

## WebSocket Namespaces

The backend exposes Socket.IO gateways for real-time communication.

### Tracking Gateway
**Namespace:** `/tracking`  
**Gateway:** `apps/backend/src/infra/tracking/tracking.gateway.ts`

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | Join room `driver:{driverId}` or `order:{orderId}` |
| `leave` | Client → Server | Leave room |
| `location:update` | Client → Server | Driver updates location. Body: `{lat, lng, heading, speed}`. |
| `driver:status` | Client → Server | Driver status update. Body: `{status}`. |
| `driver:assigned` | Server → Client | New order assigned to driver. |
| `driver:delivery-update` | Server → Client | Delivery status changed. |
| `order:status-changed` | Server → Client | Customer/driver get order status change. |

### KDS Gateway
**Namespace:** `/kds`  
**Gateway:** `apps/backend/src/services/restaurant/kds.gateway.ts`

| Event | Direction | Description |
|-------|-----------|-------------|
| `join` | Client → Server | Join room `branch:{branchId}` |
| `newOrder` | Server → Client | New order for kitchen. Body: `{orderId, items, branchId}`. |
| `updatePrepStatus` | Client → Server | Update preparation status. Body: `{orderId, status, prepTimeMinutes?}`. |
| `inventoryAlert` | Server → Client | Low stock alert. Body: `{inventoryItemId, currentLevel, thresholdLevel}`. |
| `orderStatusUpdated` | Server → Client | Order status broadcast. |
