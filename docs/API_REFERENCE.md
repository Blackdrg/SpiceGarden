# API Reference

## Base URL

```
http://localhost:3001
```

## Authentication

Most endpoints require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Auth Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Email/password login with device tracking |
| POST | `/auth/register` | Customer registration (creates CUSTOMER role user) |
| POST | `/auth/refresh-token` | Refresh access token using refresh token |
| POST | `/auth/logout` | Session revocation |

### Auth Endpoints - Detailed

#### POST /auth/login
**Body:**
```json
{
  "email": "string",
  "password": "string",
  "deviceName": "string (optional)",
  "deviceType": "string (optional)"
}
```

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "id": "uuid",
    "fullName": "string",
    "email": "string",
    "role": "string",
    "status": "string"
  }
}
```

**Source:** `apps/backend/src/services/auth/auth.controller.ts:46`

#### POST /auth/register
**Body:**
```json
{
  "email": "string",
  "password": "string",
  "phone": "string",
  "fullName": "string",
  "deviceName": "string (optional)",
  "deviceType": "string (optional)"
}
```

**Response:** Same as login

**Source:** `apps/backend/src/services/auth/auth.controller.ts:58`

#### POST /auth/refresh-token
**Body:**
```json
{
  "refresh_token": "string",
  "deviceName": "string (optional)",
  "deviceType": "string (optional)"
}
```

**Source:** `apps/backend/src/services/auth/auth.controller.ts:80`

## Order Endpoints

| Method | Path | Guard | Role |
|--------|------|-------|------|
| POST | `/orders` | JwtAuthGuard | CUSTOMER |
| GET | `/orders` | JwtAuthGuard | CUSTOMER, ADMIN |
| GET | `/orders/:id` | JwtAuthGuard | All authenticated |
| PATCH | `/orders/:id/status` | JwtAuthGuard | RESTAURANT, KITCHEN_STAFF, DELIVERY_PARTNER |
| POST | `/orders/:id/cancel` | JwtAuthGuard | CUSTOMER, ADMIN |

**Source:** `apps/backend/src/services/order/order.controller.ts`

## Payment Endpoints

| Method | Path | Guard | Role |
|--------|------|-------|------|
| POST | `/payments/create-intent` | JwtAuthGuard, RolesGuard | CUSTOMER, ADMIN, SUPER_ADMIN |
| POST | `/payments/capture` | JwtAuthGuard | |
| POST | `/payments/confirm` | JwtAuthGuard | |
| GET | `/payments/:id/status` | JwtAuthGuard | |
| POST | `/payments/refund` | JwtAuthGuard | ADMIN, FINANCE_STAFF |

**Source:** `apps/backend/src/services/payments/payments.controller.ts`

**Features:**
- Fraud hardening on all payment operations
- Retry logic with exponential backoff
- Idempotency keys (`x-idempotency-key` header)
- Gateway selection via `gateway` query parameter (`stripe` or `razorpay`)

## Payment Webhooks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payments/webhooks/stripe` | Stripe signature | Stripe webhook handler |
| POST | `/payments/webhooks/razorpay` | Razorpay signature | Razorpay webhook handler |

**Source:** `apps/backend/src/services/payments/webhook.controller.ts`

## Chargeback Endpoints

| Method | Path | Guard | Role |
|--------|------|-------|------|
| POST | `/payments/chargebacks` | JwtAuthGuard | ADMIN, FINANCE_STAFF |
| GET | `/payments/chargebacks` | JwtAuthGuard | ADMIN, FINANCE_STAFF |
| PATCH | `/payments/chargebacks/:id` | JwtAuthGuard | ADMIN, FINANCE_STAFF |

**Source:** `apps/backend/src/services/payments/chargeback.controller.ts`

## Restaurant Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/restaurants` | None | Public restaurant listing |
| GET | `/restaurants/:id` | None | Restaurant detail |
| POST | `/restaurants` | JwtAuthGuard | Create restaurant |
| PUT | `/restaurants/:id` | JwtAuthGuard | Update restaurant |
| GET | `/restaurants/:id/menu` | None | Menu items |
| POST | `/restaurants/:id/menu/items` | JwtAuthGuard | Add menu item |
| PUT | `/restaurants/:id/menu/items/:itemId` | JwtAuthGuard | Update menu item |

**Source:** `apps/backend/src/services/restaurant/restaurant.controller.ts`

### Restaurant Business Engine

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/restaurants/business/metrics` | JwtAuthGuard | Business metrics |
| GET | `/restaurants/business/commission` | JwtAuthGuard | Commission reports |

**Source:** `apps/backend/src/services/restaurant/business-engine.controller.ts`

### Restaurant Onboarding

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/restaurants/onboarding` | JwtAuthGuard | Start onboarding |
| GET | `/restaurants/onboarding/:id` | JwtAuthGuard | Get onboarding status |
| PATCH | `/restaurants/onboarding/:id` | JwtAuthGuard | Update onboarding |

**Source:** `apps/backend/src/services/restaurant/onboarding.controller.ts`

### Restaurant Operations

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/restaurants/ops/orders/:id/accept` | JwtAuthGuard | Accept order |
| POST | `/restaurants/ops/orders/:id/reject` | JwtAuthGuard | Reject order |
| POST | `/restaurants/ops/orders/:id/ready` | JwtAuthGuard | Mark ready |

**Source:** `apps/backend/src/services/restaurant/restaurant-ops.controller.ts`

## Delivery Endpoints

| Method | Path | Guard | Role |
|--------|------|-------|------|
| POST | `/delivery/assign` | JwtAuthGuard | ADMIN |
| GET | `/delivery/orders/:id/assignment` | JwtAuthGuard | DELIVERY_PARTNER, ADMIN |
| POST | `/orders/:id/accept` | JwtAuthGuard | DELIVERY_PARTNER |
| POST | `/orders/:id/reject` | JwtAuthGuard | DELIVERY_PARTNER |
| PUT | `/orders/:id/status` | JwtAuthGuard | DELIVERY_PARTNER |
| POST | `/orders/:id/verify-otp` | JwtAuthGuard | DELIVERY_PARTNER, CUSTOMER |

**Source:** `apps/backend/src/services/delivery/delivery.controller.ts`, `apps/backend/src/services/delivery/driver-ops.controller.ts`

## Driver Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/drivers/onboarding` | None | Driver registration |
| GET | `/drivers/me` | JwtAuthGuard | Get current driver profile |
| POST | `/drivers/:id/availability` | JwtAuthGuard | Go online/offline |
| GET | `/drivers/:id/earnings` | JwtAuthGuard | Earnings summary |
| POST | `/drivers/:id/location` | JwtAuthGuard | Update location |

**Source:** `apps/backend/src/services/delivery/driver-ops.controller.ts`

## Payment Provider Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/payment-provider/gateways` | JwtAuthGuard | Configure gateway |
| GET | `/payment-provider/gateways` | JwtAuthGuard | List configured gateways |

**Source:** `apps/backend/src/services/payment-provider/payment-provider.controller.ts`

## Wallet Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/wallet` | JwtAuthGuard | Get wallet balance |
| GET | `/wallet/transactions` | JwtAuthGuard | Transaction history |
| POST | `/wallet/credit` | JwtAuthGuard, RolesGuard | Credit wallet (internal) |
| POST | `/wallet/debit` | JwtAuthGuard, RolesGuard | Debit wallet (internal) |

**Source:** `apps/backend/src/services/wallet/wallet.controller.ts`

## User Endpoints

### User Profile

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/profile` | JwtAuthGuard | Get profile |
| PUT | `/profile` | JwtAuthGuard | Update profile |

**Source:** `apps/backend/src/services/user/user-profile.controller.ts`

### Addresses

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/addresses` | JwtAuthGuard | List addresses |
| POST | `/addresses` | JwtAuthGuard | Create address |
| PUT | `/addresses/:id` | JwtAuthGuard | Update address |
| DELETE | `/addresses/:id` | JwtAuthGuard | Delete address |

**Source:** `apps/backend/src/services/users/address.controller.ts`

### Payment Methods

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/payment-methods` | JwtAuthGuard | List payment methods |
| POST | `/payment-methods` | JwtAuthGuard | Add payment method |
| DELETE | `/payment-methods/:id` | JwtAuthGuard | Remove payment method |

**Source:** `apps/backend/src/services/users/payment-methods.controller.ts`

## Kitchen Endpoints

| Method | Path | Guard | Role |
|--------|------|-------|------|
| GET | `/kitchen/orders` | JwtAuthGuard | RESTAURANT, KITCHEN_STAFF |
| POST | `/kitchen/orders/:id/ack` | JwtAuthGuard | Acknowledge order |
| POST | `/kitchen/orders/:id/prepare` | JwtAuthGuard | Start preparation |
| POST | `/kitchen/orders/:id/ready` | JwtAuthGuard | Mark ready |
| GET | `/kitchen/inventory` | JwtAuthGuard | Kitchen inventory |
| PUT | `/kitchen/inventory/:id` | JwtAuthGuard | Update inventory |

**Source:** `apps/backend/src/modules/kitchen/kitchen.controller.ts`

## GST Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/gst/calculate` | JwtAuthGuard | Calculate GST |
| GET | `/gst/hsn-sac` | JwtAuthGuard | List HSN/SAC codes |
| POST | `/gst/invoices` | JwtAuthGuard | Generate invoice |

**Source:** `apps/backend/src/services/gst/gst.controller.ts`

## Finance Endpoints

| Method | Path | Guard | Role |
|--------|------|-------|------|
| GET | `/finance/reconciliation` | JwtAuthGuard | FINANCE_STAFF, ADMIN |
| GET | `/finance/payouts` | JwtAuthGuard | FINANCE_STAFF, ADMIN |
| GET | `/finance/tax-report` | JwtAuthGuard | FINANCE_STAFF, ADMIN |

**Source:** `apps/backend/src/services/finance/finance.controller.ts`

## Support Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/support/tickets` | JwtAuthGuard | Create support ticket |
| GET | `/support/tickets` | JwtAuthGuard | List tickets |
| PATCH | `/support/tickets/:id` | JwtAuthGuard | Update ticket |
| POST | `/support/tickets/:id/close` | JwtAuthGuard | Close ticket |

**Source:** `apps/backend/src/services/support/support.controller.ts`

## Review Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/reviews` | JwtAuthGuard | Create review |
| GET | `/reviews/restaurant/:id` | None | List restaurant reviews |
| GET | `/reviews/order/:id` | JwtAuthGuard | Review for order |

**Source:** `apps/backend/src/services/review/review.controller.ts`

## Search Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/search/restaurants` | None | Search restaurants |
| GET | `/search/menu` | None | Search menu items |
| GET | `/search/suggestions` | None | Autocomplete suggestions |

**Source:** `apps/backend/src/services/search/search.controller.ts`

## Loyalty Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/loyalty/coupons` | JwtAuthGuard | Available coupons |
| POST | `/loyalty/coupons/:code/apply` | JwtAuthGuard | Apply coupon |
| POST | `/loyalty/referrals` | JwtAuthGuard | Create referral |
| GET | `/loyalty/referrals` | JwtAuthGuard | My referrals |

**Source:** `apps/backend/src/services/loyalty/loyalty.controller.ts`

## Refund Endpoints

| Method | Path | Guard | Role |
|--------|------|-------|------|
| POST | `/refunds` | JwtAuthGuard | Create refund request |
| GET | `/refunds` | JwtAuthGuard | My refunds |
| PATCH | `/refunds/:id` | JwtAuthGuard | Process refund |
| POST | `/refunds/:id/approve` | JwtAuthGuard, RolesGuard | ADMIN, FINANCE_STAFF |

**Source:** `apps/backend/src/services/refund/refund.controller.ts`

## Maps Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/maps/geocode` | JwtAuthGuard | Geocode address |
| GET | `/maps/distance-matrix` | JwtAuthGuard | Distance matrix |
| GET | `/maps/directions` | JwtAuthGuard | Directions |

**Source:** `apps/backend/src/services/maps/maps.controller.ts`

## Menu Customization Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/menu/customizations/:itemId` | None | Get customizations |
| POST | `/menu/customizations` | JwtAuthGuard | Add customization |
| PUT | `/menu/customizations/:id` | JwtAuthGuard | Update customization |

**Source:** `apps/backend/src/services/menu-customization/menu-customization.controller.ts`

## Notification Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| GET | `/notifications` | JwtAuthGuard | Get notifications |
| PATCH | `/notifications/:id/read` | JwtAuthGuard | Mark as read |
| GET | `/notifications/preferences` | JwtAuthGuard | Get preferences |
| PUT | `/notifications/preferences` | JwtAuthGuard | Update preferences |

**Source:** `apps/backend/src/services/notifications/notification-preferences.controller.ts`

## Analytics Endpoints

| Method | Path | Guard | Role | Description |
|--------|------|-------|------|-------------|
| GET | `/analytics/platform` | JwtAuthGuard | ADMIN, SUPER_ADMIN | Platform metrics |
| GET | `/analytics/orders` | JwtAuthGuard | ADMIN, SUPER_ADMIN | Order analytics |
| GET | `/analytics/revenue` | JwtAuthGuard | ADMIN, SUPER_ADMIN | Revenue analytics |
| GET | `/analytics/heatmap` | JwtAuthGuard | ADMIN, SUPER_ADMIN | Delivery heatmap |
| GET | `/analytics/top-dishes` | JwtAuthGuard | ADMIN, SUPER_ADMIN | Top dishes |

**Source:** `apps/backend/src/modules/analytics/analytics.controller.ts`

## Admin Endpoints

| Method | Path | Guard | Role | Description |
|--------|------|-------|------|-------------|
| GET | `/admin/users` | JwtAuthGuard | ADMIN, SUPER_ADMIN | List users |
| PATCH | `/admin/users/:id/role` | JwtAuthGuard | SUPER_ADMIN | Change user role |
| PATCH | `/admin/users/:id/status` | JwtAuthGuard | ADMIN, SUPER_ADMIN | Change user status |
| GET | `/admin/branches` | JwtAuthGuard | ADMIN, SUPER_ADMIN | List branches |
| GET | `/admin/system/health` | JwtAuthGuard | ADMIN, SUPER_ADMIN | System health |

**Source:** `apps/backend/src/services/admin/admin.controller.ts`

## Metrics Endpoint

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/metrics` | None | Prometheus metrics |

**Response:** `text/plain` - prom-client formatted metrics

**Source:** `apps/backend/src/main.ts:250`

## WebSocket Events

### TrackingGateway Namespace

**Client → Server:**
- `join` - Join room `{ room: string }`
- `ping` - Keep-alive ping
- `ack` - Message acknowledgement `{ messageId: string }`
- `message` - General message with optional ack
- `updateLocation` - Driver location update `{ driverId, lat, lng, heading?, speed? }`
- `kdsUpdate` - Kitchen display update `{ orderId, status, branchId, timestamp? }`
- `driverEvent` - Driver event `{ driverId, orderId?, event }`

**Server → Client:**
- `connected` - Connection confirmation
- `pong` - Ping response
- `locationUpdate` - Driver location broadcast `{ driverId, lat, lng, timestamp, messageId }`
- `kdsUpdate` - Kitchen update broadcast
- `driverEvent` - Driver event broadcast

### KdsGateway Namespace
- `newOrder` - New order incoming
- `inventoryAlert` - Inventory alert

### Admin Namespace
- `statsUpdate` - Platform stats update
- `newOrderGlobal` - New order notification
- `kitchenUpdate` - Kitchen status update
- `deliveryHeatmap` - Heatmap update
- `revenueUpdate` - Revenue update

### Driver Namespace
- `orderAssigned` - New order assignment
- `orderCancelled` - Order cancellation

## Customer Web API Routes

app/api/categories - GET restaurant categories
app/api/restaurants - GET restaurant listings
