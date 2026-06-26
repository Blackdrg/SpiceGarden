# Routes Reference

## Overview

SpiceGarden backend exposes 80+ REST API endpoints organized in 35+ controllers across NestJS modules.

**Source:** `apps/backend/src/**/*.controller.ts`

---

## API Prefix

All endpoints are prefixed with `/api` (configured in app.controller.ts or main.ts routing).

---

## Authentication & Authorization

| Symbol | Meaning |
|--------|---------|
| 🔓 | Public - no auth required |
| 🔒 | Authenticated - JWT required |
| 👑 | Admin/SuperAdmin only |
| 🏪 | Restaurant role |
| 🚗 | Delivery partner role |
| 👨‍🍳 | Kitchen staff |
| 💰 | Finance staff |
| 🎧 | Support staff |

---

## Module: Auth (`/auth`)

**File:** `apps/backend/src/services/auth/auth.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/auth/register` | 🔓 | Register new user |
| POST | `/auth/login` | 🔓 | Login with email/phone + password |
| POST | `/auth/otp/send` | 🔓 | Send OTP to email/phone |
| POST | `/auth/otp/verify` | 🔓 | Verify OTP |
| POST | `/auth/refresh` | 🔒 | Refresh access token |
| POST | `/auth/logout` | 🔒 | Logout (invalidate session) |
| GET | `/auth/profile` | 🔒 | Get current user profile |
| PUT | `/auth/profile` | 🔒 | Update current user profile |

---

## Module: Users (`/users`)

**File:** `apps/backend/src/services/users/users.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/users` | 👑 | List all users |
| GET | `/users/:id` | 🔒 | Get user by ID |
| PUT | `/users/:id` | 👑 | Update user |
| DELETE | `/users/:id` | 👑 | Delete user (soft) |
| POST | `/users/:id/ban` | 👑 | Ban user |
| POST | `/users/:id/unban` | 👑 | Unban user |

---

## Module: Addresses (`/addresses`)

**File:** `apps/backend/src/services/users/address.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/addresses` | 🔒 | Get user addresses |
| POST | `/addresses` | 🔒 | Create address |
| GET | `/addresses/:id` | 🔒 | Get address by ID |
| PUT | `/addresses/:id` | 🔒 | Update address |
| DELETE | `/addresses/:id` | 🔒 | Delete address |

---

## Module: Payment Methods (`/payment-methods`)

**File:** `apps/backend/src/services/users/payment-methods.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/payment-methods` | 🔒 | Get user payment methods |
| POST | `/payment-methods` | 🔒 | Add payment method |
| GET | `/payment-methods/:id` | 🔒 | Get payment method |
| PUT | `/payment-methods/:id` | 🔒 | Update payment method |
| DELETE | `/payment-methods/:id` | 🔒 | Delete payment method |

---

## Module: Restaurants (`/restaurants`)

**File:** `apps/backend/src/services/restaurant/restaurant.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/restaurants` | 🔓 | Search/list restaurants |
| GET | `/restaurants/nearby` | 🔓 | Find nearby restaurants |
| GET | `/restaurants/:id` | 🔓 | Get restaurant details |
| GET | `/restaurants/:id/menu` | 🔓 | Get restaurant menu |

---

## Module: Restaurant Operations (`/restaurants`)

**File:** `apps/backend/src/services/restaurant/restaurant-ops.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| PUT | `/restaurants/:id/onboarding` | 🏪 | Update onboarding step |
| POST | `/restaurants/:id/branches` | 🏪 | Add branch |
| PUT | `/restaurants/branches/:id` | 🏪 | Update branch |
| DELETE | `/restaurants/branches/:id` | 🏪 | Delete branch |
| PUT | `/restaurants/:id/gst` | 🏪 | Update GST details |
| GET | `/restaurants/:id/commission` | 👑 | Get commission rules |
| PUT | `/restaurants/:id/commission` | 👑 | Update commission rules |
| GET | `/restaurants/:id/payouts` | 🏪 | Get payout history |
| POST | `/restaurants/:id/moderate` | 👑 | Moderate restaurant |
| GET | `/restaurants/:id/analytics` | 🏪 | Get restaurant analytics |

---

## Module: Menu (`/menu`)

**File:** `apps/backend/src/services/menu-customization/menu-customization.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/menu/categories` | 🔓 | Get all menu categories |
| POST | `/menu/categories` | 🏪 | Create category |
| PUT | `/menu/categories/:id` | 🏪 | Update category |
| DELETE | `/menu/categories/:id` | 🏪 | Delete category |
| GET | `/menu/items` | 🔓 | Get menu items |
| GET | `/menu/items/:id` | 🔓 | Get menu item details |
| POST | `/menu/items` | 🏪 | Create menu item |
| PUT | `/menu/items/:id` | 🏪 | Update menu item |
| DELETE | `/menu/items/:id` | 🏪 | Delete menu item |
| PUT | `/menu/items/:id/availability` | 🏪 | Update availability |
| POST | `/menu/items/:id/addons` | 🏪 | Add addon |
| PUT | `/menu/addons/:id` | 🏪 | Update addon |
| DELETE | `/menu/addons/:id` | 🏪 | Delete addon |
| POST | `/menu/items/:id/variants` | 🏪 | Add variant |
| PUT | `/menu/variants/:id` | 🏪 | Update variant |
| DELETE | `/menu/variants/:id` | 🏪 | Delete variant |

---

## Module: Menu Moderation (`/menu`)

**File:** `apps/backend/src/services/menu-moderation/menu-moderation.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/menu/moderation/pending` | 👑 | Get pending items |
| PUT | `/menu/moderation/:id/approve` | 👑 | Approve item |
| PUT | `/menu/moderation/:id/reject` | 👑 | Reject item |

---

## Module: Search (`/search`)

**File:** `apps/backend/src/services/search/search.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/search/restaurants` | 🔓 | Search restaurants |
| GET | `/search/menu` | 🔓 | Search menu items |

---

## Module: Orders (`/orders`)

**File:** `apps/backend/src/services/order/order.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/orders` | 🔒 | Create order |
| GET | `/orders` | 🔒 | Get user orders |
| GET | `/orders/:id` | 🔒 | Get order details |
| PUT | `/orders/:id/status` | 🔒 | Update order status |
| POST | `/orders/:id/cancel` | 🔒 | Cancel order |
| POST | `/orders/:id/confirm` | 🔒 | Confirm order |
| GET | `/orders/:id/tracking` | 🔒 | Get order tracking |

---

## Module: Kitchen (`/kitchen`)

**File:** `apps/backend/src/services/kitchen/kitchen.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/kitchen/orders` | 👨‍🍳 | Get kitchen orders |
| PUT | `/kitchen/orders/:id/status` | 👨‍🍳 | Update kitchen status |
| GET | `/kitchen/inventory` | 🏪 | Get inventory items |
| PUT | `/kitchen/inventory/:id` | 🏪 | Update inventory |
| POST | `/kitchen/inventory` | 🏪 | Create inventory item |
| GET | `/kitchen/recipes` | 🏪 | Get recipes |
| POST | `/kitchen/recipes` | 🏪 | Create recipe |
| PUT | `/kitchen/recipes/:id` | 🏪 | Update recipe |
| GET | `/kitchen/sla` | 👨‍🍳 | Get kitchen SLA metrics |
| POST | `/kitchen/batches` | 👨‍🍳 | Create batch |
| PUT | `/kitchen/food-prep/:id` | 👨‍🍳 | Update food prep status |

---

## Module: Drivers (`/drivers`)

**File:** `apps/backend/src/controllers/driver.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/drivers/me` | 🚗 | Get own driver profile |
| PUT | `/drivers/me` | 🚗 | Update driver profile |
| POST | `/drivers/location` | 🚗 | Update driver location |
| POST | `/drivers/availability` | 🚗 | Toggle availability |
| GET | `/drivers/earnings` | 🚗 | Get earnings summary |

**File:** `apps/backend/src/services/delivery/driver-ops.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/drivers/onboarding` | 🚗 | Driver onboarding |
| POST | `/drivers/documents` | 🚗 | Upload KYC documents |
| GET | `/drivers/documents` | 🚗 | Get driver documents |
| GET | `/drivers/score` | 🚗 | Get driver scorecard |

**File:** `apps/backend/src/services/driver-fleet/driver-fleet.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/drivers/fleet` | 👑 | List all drivers |
| GET | `/drivers/:id/shifts` | 🚗 | Get driver shifts |
| POST | `/drivers/shifts` | 🚗 | Start shift |
| PUT | `/drivers/shifts/:id/end` | 🚗 | End shift |
| GET | `/drivers/:id/earnings` | 🚗 | Get earnings details |
| POST | `/drivers/:id/penalties` | 👑 | Issue penalty |
| GET | `/drivers/:id/incentives` | 🚶 | Get incentives |
| POST | `/drivers/incentives/:id/approve` | 💰 | Approve incentive payout |
| PUT | `/drivers/:id/fraud-check` | 👑 | Run fraud check |

---

## Module: Driver Assignment (`/driver-assignment`)

**File:** `apps/backend/src/modules/driver-assignment/driver-assignment.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/driver-assignment/assign` | 👑 | Assign driver to order |
| GET | `/driver-assignment/eta` | 🔒 | Get delivery ETA |
| PUT | `/driver-assignment/sla/:orderId` | 👑 | Update SLA |
| GET | `/driver-assignment/fraud/:driverId` | 👑 | Get driver fraud flags |
| POST | `/driver-assignment/:id/verify` | 👑 | Verify delivery |

---

## Module: Payments (`/payments`)

**File:** `apps/backend/src/services/payments/payments.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/payments/create-intent` | 💰 | Create payment intent |
| POST | `/payments/confirm` | 💰 | Confirm payment |
| GET | `/payments/gateways` | 🔒 | Get available gateways |
| GET | `/payments/gateway/config` | 🔒 | Get gateway config |
| POST | `/payments/refund` | 💰 | Process refund |
| GET | `/payments/:id/status` | 🔒 | Get payment status |

**File:** `apps/backend/src/services/payments/webhook/webhook.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/payments/webhook` | 🔓 | Stripe/Razorpay webhook |

---

## Module: Refunds (`/refunds`)

**File:** `apps/backend/src/services/refund/refund.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/refunds/request` | 🔒 | Request refund |
| GET | `/refunds/:id` | 🔒 | Get refund details |
| GET | `/refunds/order/:orderId` | 🔒 | Get refunds for order |
| GET | `/refunds` | 💰 | List refunds |
| PATCH | `/refunds/:id/approve` | 💰 | Approve refund |
| PATCH | `/refunds/:id/reject` | 💰 | Reject refund |
| POST | `/refunds/:id/process` | 💰 | Process approved refund |

---

## Module: Wallet (`/wallet`)

**File:** `apps/backend/src/services/wallet/wallet.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/wallet` | 🔒 | Get wallet details |
| GET | `/wallet/balance` | 🔒 | Get wallet balance |
| GET | `/wallet/transactions` | 🔒 | Get transaction history |
| POST | `/wallet/credit` | 💰 | Credit wallet (admin) |
| POST | `/wallet/debit` | 💰 | Debit wallet (admin) |
| POST | `/wallet/compensate` | 💰 | Compensate user |
| POST | `/wallet/cod/process` | 💰 | Process COD payment |
| POST | `/wallet/cod/confirm` | 🚗 | Confirm COD collection |
| POST | `/wallet/cod/refund` | 💰 | Refund COD |
| POST | `/wallet/prevent-duplicate` | 🔒 | Check for duplicate payment |

---

## Module: Notifications (`/notifications`)

**File:** `apps/backend/src/services/notifications/notification.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/notifications` | 🔒 | Get user notifications |
| POST | `/notifications/:id/read` | 🔒 | Mark as read |
| POST | `/notifications/read-all` | 🔒 | Mark all as read |
| GET | `/notifications/preferences` | 🔒 | Get notification preferences |
| PUT | `/notifications/preferences` | 🔒 | Update preferences |
| POST | `/notifications/send` | 🎧 | Send notification (support) |

---

## Module: Notification Queue (`/notification-queue`)

**File:** `apps/backend/src/services/notifications/queue/notification-queue.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/notification-queue` | 🎧 | Queue notification |
| GET | `/notification-queue/stats` | 🎧 | Get queue stats |

---

## Module: Support (`/support`)

**File:** `apps/backend/src/services/support/support.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/support/tickets` | 🔒 | Create support ticket |
| GET | `/support/tickets` | 🎧 | List support tickets |
| GET | `/support/tickets/:id` | 🔒 | Get ticket details |
| PUT | `/support/tickets/:id` | 🎧 | Update ticket |
| GET | `/support/disputes` | 🎧 | List disputes |
| POST | `/support/refunds` | 🎧 | Process support refund |

---

## Module: Reviews (`/reviews`)

**File:** `apps/backend/src/services/review/review.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/reviews` | 🔒 | Create review |
| GET | `/reviews/restaurant/:id` | 🔓 | Get restaurant reviews |
| GET | `/reviews/order/:id` | 🔒 | Get order review |

---

## Module: Analytics (`/analytics`)

**File:** `apps/backend/src/modules/analytics/analytics.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/analytics/overview` | 👑 | Business overview |
| GET | `/analytics/orders` | 👑 | Order analytics |
| GET | `/analytics/revenue` | 👑 | Revenue analytics |
| GET | `/analytics/drivers` | 👑 | Driver analytics |
| GET | `/analytics/restaurants` | 👑 | Restaurant analytics |

---

## Module: Admin (`/admin`)

**File:** `apps/backend/src/services/admin/admin.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/admin/dashboard` | 👑 | Admin dashboard |
| GET | `/admin/stats` | 👑 | Get admin stats |
| GET | `/admin/orders` | 👑 | List all orders |
| GET | `/admin/users` | 👑 | List all users |
| POST | `/admin/users/:id/ban` | 👑 | Ban user |
| POST | `/admin/users/:id/unban` | 👑 | Unban user |

---

## Module: Finance (`/finance`)

**File:** `apps/backend/src/services/finance/finance.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/finance/gst-report` | 💰 | Get GST report |
| GET | `/finance/reconciliation` | 💰 | Get reconciliation report |
| GET | `/finance/payouts` | 💰 | Get payout history |

---

## Module: GST (`/gst`)

**File:** `apps/backend/src/services/gst/gst.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/gst/calculate` | 🔒 | Calculate GST |
| GET | `/gst/order/:id` | 🔒 | Get order GST details |
| POST | `/gst/invoice/:id` | 🔒 | Generate GST invoice |
| GET | `/gst/hsn-codes` | 🔒 | Search HSN/SAC codes |

---

## Module: Compliance (`/compliance`)

**File:** `apps/backend/src/compliance/compliance.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/compliance/soc2` | 👑 | SOC2 readiness |
| GET | `/compliance/pci-dss` | 👑 | PCI-DSS validation |
| GET | `/compliance/secrets/rotation-status` | 👑 | Secret rotation status |
| POST | `/compliance/secrets/rotate` | 👑 | Rotate secrets |
| GET | `/compliance/retention-stats` | 👑 | Data retention stats |
| GET | `/compliance/gdpr/user/:userId/export` | 👑 | GDPR data export |
| POST | `/compliance/gdpr/user/:userId/deletion-request` | 👑 | GDPR deletion request |
| GET | `/compliance/user/:userId/pii-verification` | 👑 | PII encryption verification |

---

## Module: Legal (`/legal`)

**File:** `apps/backend/src/legal/legal.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/legal/terms` | 🔓 | Terms of service |
| GET | `/legal/privacy` | 🔓 | Privacy policy |
| GET | `/legal/refund` | 🔓 | Refund policy |

---

## Module: Loyalty (`/loyalty`)

**File:** `apps/backend/src/services/loyalty/loyalty.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/loyalty/coupons` | 🔒 | Get available coupons |
| POST | `/loyalty/coupons/apply` | 🔒 | Apply coupon |
| GET | `/loyalty/referrals` | 🔒 | Get referral status |
| POST | `/loyalty/referrals` | 🔒 | Create referral |
| GET | `/loyalty/cashback` | 🔒 | Get cashback balance |

---

## Module: AI (`/ai`)

**File:** `apps/backend/src/services/ai/ai.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/ai/recommendations` | 🔒 | Get recommendations |
| POST | `/ai/chatbot` | 🔒 | Chatbot query |
| GET | `/ai/forecast/demand` | 🏪 | Demand forecast |

---

## Module: Maps (`/maps`)

**File:** `apps/backend/src/services/maps/maps.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/maps/eta` | 🔒 | Get ETA |
| POST | `/maps/reroute` | 🚗 | Reroute driver |
| GET | `/maps/heatmap` | 👑 | Get delivery heatmap |
| GET | `/maps/surge-zones` | 🔒 | Get active surge zones |

---

## Module: User Profile (`/profile`)

**File:** `apps/backend/src/services/user/user-profile.controller.ts`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/profile` | 🔒 | Get user profile |
| PUT | `/profile` | 🔒 | Update profile |
| GET | `/profile/addresses` | 🔒 | Get addresses |
| GET | `/profile/payment-methods` | 🔒 | Get payment methods |
| POST | `/profile/avatar` | 🔒 | Upload avatar |

---

## Health Check

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/health` | 🔓 | Health check endpoint |

---

## Total Endpoint Count

| Category | Count |
|----------|-------|
| Auth | 8 |
| Users | 5 |
| Addresses | 5 |
| Payment Methods | 5 |
| Restaurants | 3 |
| Restaurant Ops | 8 |
| Menu | 14 |
| Menu Moderation | 3 |
| Search | 2 |
| Orders | 7 |
| Kitchen | 12 |
| Drivers | 5 |
| Driver Ops | 5 |
| Driver Fleet | 8 |
| Driver Assignment | 5 |
| Payments | 6 |
| Webhooks | 1 |
| Refunds | 7 |
| Wallet | 10 |
| Notifications | 4 |
| Notification Queue | 2 |
| Support | 5 |
| Reviews | 3 |
| Analytics | 5 |
| Admin | 6 |
| Finance | 3 |
| GST | 4 |
| Compliance | 8 |
| Legal | 3 |
| Loyalty | 5 |
| AI | 3 |
| Maps | 4 |
| Profile | 4 |
| Health | 1 |
| **TOTAL** | **~160** |
