# API Reference

**Version:** 1.0.0
**Date:** 2026-06-26
**Base URL:** `http://localhost:3001`
**Classification:** Verified from source code

## Authentication

| Guard | Purpose |
|-------|---------|
| `JwtAuthGuard` | Validates JWT access token |
| `RolesGuard` | Enforces role requirements (`@Roles()`) |
| `PermissionGuard` | Enforces permission requirements (`@Permissions()`) |

## Rate Limits

| Pattern | Window | Max |
|---------|--------|-----|
| `/auth/otp` | 10 min | 3 |
| `/auth/*` | 15 min | 5 |
| `/orders/*` | 15 min | 10 |
| `/api/*` | 15 min | 100 |

## Endpoints

### Health
- `GET /` — Health check
- `GET /health` — Detailed health with timestamp
- `GET /metrics` — Prometheus exposition format

### Auth (`/auth`)
- `POST /auth/login` — `{ email, password }` → `{ accessToken, refreshToken, user }`
- `POST /auth/register` — `{ email, phone, fullName, password }` → `{ accessToken, refreshToken, user }`
- `POST /auth/refresh-token` — `{ refresh_token }` → `{ accessToken, refreshToken }`
- `POST /auth/logout` — `{ refresh_token }` → `{ revoked: true }`

### Orders (`/orders`)
- `POST /orders` — Place order (JWT + Roles, `x-idempotency-key?`)
- `GET /orders/health` — Order service health

### Payments (`/payments`)
- `POST /payments/create-intent` — Create intent (JWT, `x-idempotency-key?`, `?gateway=`)
- `POST /payments/refund` — Refund (JWT, `x-idempotency-key?`, `?gateway=`)
- `GET /payments/gateways` — List gateways
- `GET /payments/gateway/config` — Gateway configuration

### Webhooks (`/payments/webhook`)
- `POST /payments/webhook` — Process webhook (No auth, `stripe-signature` or `x-razorpay-signature`)
- `GET /payments/webhook/stats` — Webhook statistics

### Chargebacks (`/chargebacks`)
- `GET /chargebacks` — List disputes (ADMIN/FINANCE, `?status&startDate&endDate`)
- `GET /chargebacks/:disputeId` — Get dispute
- `GET /chargebacks/order/:orderId` — Get by order
- `POST /chargebacks/:disputeId/initiate-refund` — Refund won dispute
- `GET /chargebacks/stats/overview` — Statistics (`?startDate&endDate`)

### Payment Provider (`/payment-provider`)
- `POST /payment-provider/stripe-connect/onboard` — Stripe Connect onboarding (RESTAURANT/ADMIN)
- `GET /payment-provider/stripe-connect/status` — Stripe Connect status
- `POST /payment-provider/razorpay/settlement/onboard` — Razorpay fund account (RESTAURANT/ADMIN)
- `GET /payment-provider/razorpay/settlement/status` — Razorpay status
- `GET /payment-provider/restaurant/payout-history` — Payout history (`?limit`)
- `GET /payment-provider/restaurant/balance` — Account balance

### Restaurants (`/restaurants`)
- `GET /restaurants` — List all
- `GET /restaurants/search` — Search (`?q`)
- `GET /restaurants/nearby` — Geo search (`?lat&lng&radius?`)
- `GET /restaurants/:slug` — Details
- `PUT /restaurants/branch/:id/status` — Update status (RESTAURANT/ADMIN)

### Restaurant Operations (`/restaurant/ops`)
- `POST /restaurant/ops/onboarding` — Start onboarding
- `GET /restaurant/ops/onboarding/:id` — Progress
- `PUT /restaurant/ops/onboarding/:id/step` — Update step
- `POST /restaurant/ops/onboarding/:id/complete` — Complete
- `POST /restaurant/ops/onboarding/:id/reject` — Reject
- `PUT /restaurant/ops/gst/:restaurantId` — Configure GST
- `PUT /restaurant/ops/pricing/:restaurantId` — Setup pricing
- `PUT /restaurant/ops/payout/:restaurantId` — Setup payout
- `GET /restaurant/ops/analytics/overview` — Onboarding analytics
- `POST /restaurant/ops/moderation` — Submit for moderation
- `GET /restaurant/ops/moderation/pending` — Pending moderations
- `PUT /restaurant/ops/moderation/:id/review` — Review moderation
- `GET /restaurant/ops/payout/history` — Payout history
- `POST /restaurant/ops/payout/generate` — Generate report
- `POST /restaurant/ops/payout/:id/process` — Process payout
- `POST /restaurant/ops/branch` — Create branch
- `PUT /restaurant/ops/branch/:id` — Update branch
- `PUT /restaurant/ops/branch/:id/status` — Toggle status
- `GET /restaurant/ops/branch/:id` — Branch details
- `POST /restaurant/ops/commission` — Create commission rule
- `GET /restaurant/ops/commission/:restaurantId` — Get rules
- `POST /restaurant/ops/commission/calculate` — Calculate

### Restaurant Onboarding (`/restaurant-onboarding`)
- `POST /restaurant-onboarding/initialize/:restaurantId` — Initialize
- `PUT /restaurant-onboarding/step/:onboardingId` — Update step
- `GET /restaurant-onboarding/status/:restaurantId` — Status
- `POST /restaurant-onboarding/complete/:onboardingId` — Complete (ADMIN)
- `POST /restaurant-onboarding/reject/:onboardingId` — Reject (ADMIN)
- `PUT /restaurant-onboarding/gst/:restaurantId` — GST config
- `PUT /restaurant-onboarding/pricing/:restaurantId` — Pricing
- `PUT /restaurant-onboarding/payout/:restaurantId` — Payout
- `GET /restaurant-onboarding/analytics/overview` — Analytics

### Search (`/search`)
- `GET /search` — Search (`?q`)
- `GET /search/trending` — Trending
- `GET /search/recommended` — Personalized (JWT)

### Menus (`/menus`)
- `GET /menus/:restaurantId/items` — Menu items (`?category?`)
- `GET /menus/items/:itemId` — Item details
- `GET /menus/items/:itemId/addons` — Item addons
- `GET /menus/categories/:restaurantId` — Categories

### Admin (`/admin`)
- `GET /admin/dashboard` — Stats (`?branchId?`)
- `GET /admin/stats` — Full stats (`?branchId?`)
- `GET /admin/orders` — All orders (`?page?&limit?`)
- `POST /admin/users/ban` — Ban user `{ userId, reason }`

### Drivers (`/drivers` + `/orders`)
- `GET /drivers/me` — Own profile (DELIVERY_PARTNER)
- `GET /drivers/:id` — Driver by ID
- `GET /drivers/:id/earnings` — Earnings summary
- `POST /drivers/:id/location` — Update location `{ lat, lng, heading?, speed? }`
- `POST /drivers/:id/availability` — Toggle `{ isAvailable }`
- `GET /drivers/available` — Find nearby (`?lat&lng&radius?`)
- `POST /orders/:id/accept` — Accept order `{ driverId }`
- `POST /orders/:id/reject` — Reject order `{ driverId }`
- `PUT /orders/:id/status` — Update status `{ status, actualTimeMinutes?, failureReason? }`
- `POST /orders/:id/verify-otp` — Verify OTP `{ otp, driverId }`
- `POST /orders/:id/issues` — Report issue `{ issue, details }`

### Driver Operations (`/drivers`)
- `POST /drivers/onboarding` — Start onboarding
- `POST /drivers/documents` — Upload `{ driverId, type, url, expiryDate? }`
- `GET /drivers/documents/:driverId` — Documents
- `PUT /drivers/documents/:id/verify` — Verify `{ status, notes?, verifierId? }`
- `GET /drivers/onboarding/:id/status` — Onboarding status
- `POST /drivers/incentives/calculate` — Calculate `{ driverId, weekStart }`
- `POST /drivers/incentives` — Generate `{ driverId, type, amount, description }`
- `PUT /drivers/incentives/:id/approve` — Approve `{ approverId }`
- `GET /drivers/incentives/pending` — Pending (`?driverId?`)

### Driver Assignment (`/driver-assignment`)
- `POST /driver-assignment/assign/:orderId` — Auto-assign
- `POST /driver-assignment/batch-assign` — Batch `{ orderIds, driverId }`
- `PUT /driver-assignment/reassign/:assignmentId` — Reassign `{ newDriverId, reason? }`
- `GET /driver-assignment/driver/:driverId/assignments` — Assignments (`?status?`)
- `GET /driver-assignment/order/:orderId/assignments` — Order assignments
- `PUT /driver-assignment/:assignmentId/status` — Update `{ status, actualTimeMinutes? }`
- `PUT /driver-assignment/:assignmentId/route` — Route `{ start, end, waypoints }`
- `GET /driver-assignment/drivers/available` — Available (`?lat&lng&radius?`)
- `POST /driver-assignment/drivers/:driverId/score` — Update score
- `GET /driver-assignment/eta/:orderId/:driverId` — ETA
- `POST /driver-assignment/sla` — Record SLA
- `GET /driver-assignment/sla` — SLA metrics (`?driverId?&branchId?&metricName?&limit?`)
- `POST /driver-assignment/fraud` — Record fraud incident
- `GET /driver-assignment/drivers/:driverId/fraud` — Fraud history
- `GET /driver-assignment/fraud` — All incidents (`?driverId?&limit?`)

### Driver Fleet (`/fleet`)
- `POST /fleet/shifts/start` — Start shift `{ driverId }` (DELIVERY/ADMIN)
- `POST /fleet/shifts/end` — End shift `{ driverId, shiftId }` (DELIVERY/ADMIN)
- `GET /fleet/shifts/:driverId` — Shift history
- `POST /fleet/earnings` — Period earnings `{ driverId, start, end }`
- `POST /fleet/incentives/calculate` — Calculate `{ driverId }`
- `POST /fleet/penalties` — Issue penalty (ADMIN)
- `GET /fleet/performance` — Performance ranking
- `GET /fleet/performance/:driverId` — Driver performance
- `GET /fleet/schedule/:driverId` — Schedule
- `PUT /fleet/penalties/:id/approve` — Approve `{ approvedBy }` (ADMIN)
- `PUT /fleet/penalties/:id/waive` — Waive `{ waivedBy, reason }` (ADMIN)

### Wallet (`/wallet`)
- `GET /wallet` — Wallet (CUSTOMER)
- `GET /wallet/balance` — Balance (CUSTOMER)
- `GET /wallet/transactions` — History (`?limit?&offset?`)
- `POST /wallet/credit` — Credit (ADMIN/FINANCE) `{ amount, description, referenceId? }`
- `POST /wallet/debit` — Debit (ADMIN/FINANCE) `{ amount, description, referenceId? }`
- `POST /wallet/compensate` — Compensate `{ amount, reason }`
- `POST /wallet/cod/process` — COD process (CUSTOMER) `{ orderId, amount }`
- `POST /wallet/cod/confirm` — COD confirm (DELIVERY) `{ orderId, amount }`
- `POST /wallet/cod/refund` — COD refund (ADMIN/FINANCE) `{ orderId, amount, reason }`
- `POST /wallet/prevent-duplicate` — Duplicate check (CUSTOMER) `{ orderId, amount }`

### Addresses (`/addresses`)
- `GET /addresses` — List (JWT)
- `POST /addresses` — Create (JWT)
- `PUT /addresses/:id/default` — Set default (JWT)
- `DELETE /addresses/:id` — Delete (JWT)

### Payment Methods (`/payment-methods`)
- `GET /payment-methods` — List (JWT)
- `POST /payment-methods` — Add (JWT)
- `PUT /payment-methods/:id/default` — Set default (JWT)
- `DELETE /payment-methods/:id` — Delete (JWT)

### Notification Preferences (`/notification-preferences`)
- `GET /notification-preferences` — Get (JWT)
- `PUT /notification-preferences` — Update (JWT)

### Devices (`/devices`)
- `POST /devices/register` — Register `{ fcmToken?, apnsToken?, deviceInfo? }` (JWT)
- `DELETE /devices/unregister` — Unregister `{ fcmToken?, apnsToken? }` (JWT)

### Support (`/support`)
- `POST /support/disputes` — Raise `{ orderId, customerId, type, description }` (SUPPORT/ADMIN)
- `GET /support/disputes` — List (SUPPORT/ADMIN, `?status&customerId&restaurantId&driverId?`)
- `PUT /support/disputes/:id/review` — Review `{ reviewerId, status, notes? }`
- `POST /support/refunds` — Request `{ orderId, requestedBy, type, amount, reason }`
- `PUT /support/refunds/:id/process` — Process `{ processedBy, paymentReference? }`
- `GET /support/tickets/stats` — Queue stats
- `POST /support/tickets/:id/route` — Route ticket
- `POST /support/tickets/:id/escalate` — Escalate `{ level? }`

### Refunds (`/refunds`)
- `POST /refunds/request` — Create `{ orderId, requestedBy, amount, reason, requestType? }` (CUSTOMER/ADMIN)
- `PATCH /refunds/:approvalId/approve` — Approve `{ approverId, notes? }` (ADMIN/FINANCE)
- `PATCH /refunds/:approvalId/reject` — Reject `{ approverId, reason }` (ADMIN/FINANCE)
- `POST /refunds/:approvalId/process` — Process `{ processedBy, gateway? }` (ADMIN/FINANCE)
- `GET /refunds/:approvalId` — Get by ID (CUSTOMER/ADMIN/FINANCE)
- `GET /refunds/order/:orderId` — Get by order (CUSTOMER/ADMIN/FINANCE)
- `GET /refunds` — List by status (ADMIN/FINANCE, `?status?`)

### Reviews (`/reviews`)
- `POST /reviews` — Create `{ restaurantId, orderId, rating, comment?, images? }` (CUSTOMER)
- `GET /reviews/order/:orderId` — By order
- `GET /reviews/restaurant/:restaurantId` — By restaurant
- `GET /reviews/restaurant/:restaurantId/rating` — Average rating

### Loyalty (`/loyalty`)
- `POST /loyalty/coupons` — Create coupon (ADMIN)
- `POST /loyalty/coupons/apply` — Apply `{ code, userId, orderAmount, orderId? }` (CUSTOMER)
- `GET /loyalty/coupons` — List (ADMIN, `?filters`)
- `GET /loyalty/coupons/:id/analytics` — Analytics (ADMIN)
- `PUT /loyalty/coupons/:id/deactivate` — Deactivate (ADMIN)
- `POST /loyalty/referrals/code` — Generate `{ userId }` (CUSTOMER)
- `POST /loyalty/referrals/process` — Process `{ code, refereeId, firstOrderId }` (ADMIN)
- `GET /loyalty/referrals/:userId` — History (CUSTOMER)
- `POST /loyalty/cashback/process` — Process `{ userId, orderId, orderAmount }` (ADMIN/FINANCE)
- `GET /loyalty/cashback/:userId` — Summary (CUSTOMER)

### Finance (`/finance`)
- `GET /finance/gst/report` — GST report `?restaurantId&month&year` (FINANCE/ADMIN)
- `POST /finance/reconciliation/payments` — Reconcile `{ startDate, endDate }`
- `POST /finance/reconciliation/payouts` — Payouts `{ restaurantId, startDate, endDate }`
- `POST /finance/reconciliation/driver` — Driver `{ driverId, startDate, endDate }`
- `POST /finance/reconciliation/full` — Full `{ startDate, endDate }`

### GST (`/gst`)
- `POST /gst/calculate/:orderId` — Calculate (ADMIN/RESTAURANT)
- `GET /gst/invoice/:orderId` — Invoice (ADMIN/RESTAURANT/CUSTOMER)
- `GET /gst/rate-summary/:orderId` — Summary (ADMIN/RESTAURANT)
- `POST /gst/validate-gstin` — Validate `{ gstin }` (ADMIN/RESTAURANT)

### Kitchen (`/kitchen`)
- `POST /kitchen/inventory` — Create item (KITCHEN/RESTAURANT/ADMIN)
- `PUT /kitchen/inventory/:id/stock` — Update stock `{ quantityChange }`
- `PUT /kitchen/inventory/:id/wastage` — Record `{ wastedQuantity, reason? }`
- `GET /kitchen/inventory/low-stock/:branchId` — Low stock
- `POST /kitchen/inventory/low-stock/notify/:branchId` — Notify
- `POST /kitchen/recipes` — Create recipe
- `GET /kitchen/recipes/:id` — Get recipe
- `POST /kitchen/batches` — Create batch
- `PUT /kitchen/batches/:id/status` — Update status `{ status }`
- `POST /kitchen/food-prep` — Log prep
- `PUT /kitchen/food-prep/:id/quality` — Quality check
- `POST /kitchen/sla` — Record SLA
- `POST /kitchen/sla/avg-prep-time/:branchId` — Avg prep `{ prepTimeMinutes }, period?`
- `POST /kitchen/sla/late-prep/:branchId` — Late % `{ latePercentage }, period?`
- `POST /kitchen/sla/food-rejection/:branchId` — Rejection `{ rejectionRate }, period?`
- `POST /kitchen/sla/food-rejection/calculate/:branchId` — Calc rejection `period?`
- `POST /kitchen/sla/throughput/:branchId` — Throughput `{ ordersPerHour }, period?`
- `POST /kitchen/sla/throughput/calculate/:branchId` — Calc throughput `period?`
- `POST /kitchen/sla/record-all/:branchId` — Record all
- `GET /kitchen/sla/branch/:branchId` — Branch SLA `?metricName?&limit?`
- `GET /kitchen/sla/summary/:branchId` — SLA summary `period?`
- `POST /kitchen/suppliers` — Create supplier
- `GET /kitchen/suppliers/:id/inventory` — Supplier inventory
- `GET /kitchen/inventory/consumption/:branchId` — Trends `?days?`
- `GET /kitchen/inventory/forecast/:branchId` — Forecast `?daysAhead?`

### Analytics (`/analytics`)
- `GET /analytics/top-dishes` — `?restaurantId?&period?` (RESTAURANT/ADMIN)
- `GET /analytics/churn` — `?restaurantId?&period?`
- `GET /analytics/repeat-users` — `?restaurantId?&period?`
- `GET /analytics/conversion` — `?restaurantId?&period?`
- `GET /analytics/heatmap` — `?restaurantId?&period?`
- `GET /analytics/peak-hours` — `?restaurantId?&period?`
- `GET /analytics/restaurant/:id` — Full analytics
- `GET /analytics/platform` — Platform-wide (ADMIN/SUPER_ADMIN)

### Business Engine (`/business`)
- `GET /business/metrics` — Business metrics (ADMIN/SUPER_ADMIN)
- `GET /business/restaurants` — Active restaurants
- `GET /business/restaurants/:id/menu` — Menu
- `GET /business/drivers/live` — Live drivers (ADMIN/SUPER_ADMIN)
- `POST /business/drivers/:id/location` — Location `{ lat, lng, heading?, speed? }`
- `POST /business/drivers/:id/availability` — `{ isAvailable }`
- `GET /business/uptime` — System uptime

### Maps (`/maps`)
- `GET /maps/eta` — `?originLat&originLng&destLat&destLng`
- `GET /maps/surge-eta` — Surge ETA (same params)
- `POST /maps/reroute` — `{ origin, destination, waypoints? }`
- `GET /maps/heatmap` — `?north&south&east&west&zoom?`
- `GET /maps/surge-zones` — All surge zones
- `GET /maps/check-surge-zone` — `?lat&lng`

### AI (`/ai`)
- `GET /ai/recommendations` — Personalized (JWT)
- `POST /ai/chatbot` — `{ message }`
- `GET /ai/forecast` — `?branchId`

### Notification Queue (`/notification-queue`)
- `POST /notification-queue/queue` — Queue notification (ADMIN)
- `GET /notification-queue/:id` — Get by ID
- `GET /notification-queue` — By status `?status?`
- `GET /notification-queue/recipient/:recipientId` — By recipient `?recipientType`
- `POST /notification-queue/:id/cancel` — Cancel
- `GET /notification-queue/stats/overview` — Statistics
- `POST /notification-queue/process` — Process queue

### Legal (`/legal`)
- `GET /legal/privacy-policy` — Privacy policy
- `GET /legal/terms-of-service` — Terms of service
- `GET /legal/intellectual-property` — IP info

### Compliance (`/compliance`)
- `GET /compliance/soc2` — SOC2 readiness (SUPER_ADMIN)
- `GET /compliance/soc2/evidence` — SOC2 evidence
- `GET /compliance/pci-dss` — PCI-DSS status
- `GET /compliance/pci-dss/payment-flow` — Validate flow
- `GET /compliance/pci-dss/saq` — SAQ metrics
- `GET /compliance/secrets/rotation-status` — Rotation status
- `GET /compliance/secrets/proof` — Rotation proof
- `POST /compliance/secrets/rotate` — Rotate `?secrets?`
- `GET /compliance/retention-stats` — Retention stats (ADMIN/SUPER_ADMIN)
- `POST /compliance/retention/apply` — Apply policies
- `GET /compliance/gdpr/user/:userId/export` — GDPR export
- `GET /compliance/dpdp/user/:userId/export` — DPDP export
- `POST /compliance/gdpr/user/:userId/deletion-request` — GDPR deletion
- `POST /compliance/dpdp/user/:userId/deletion-request` — DPDP deletion
- `POST /compliance/gdpr/user/:userId/deletion-request/cancel` — Cancel GDPR
- `GET /compliance/user/:userId/deletion-status` — Deletion status
- `GET /compliance/user/:userId/export-history` — Export history
- `GET /compliance/user/:userId/pii-verification` — PII verification
- `GET /compliance/user/:userId/data-export` — Data export
- `POST /compliance/mask/pii` — Mask `{ data, fields }` (ADMIN)
- `POST /compliance/unmask/pii` — Unmask `{ data, fields }` (ADMIN)

## WebSocket Namespaces

### `/` (default) — TrackingGateway
- `connected` → `{ status, serverTime }`
- `join` ← `{ room }`
- `updateLocation` ← `{ driverId, lat, lng, heading?, speed? }`
- `locationUpdate` → `{ driverId, lat, lng, heading?, speed?, timestamp, messageId }`
- `driverAssigned` → `{ driverId, orderId }`
- `orderStatusUpdate` → `{ status, orderId }`
- `driverEvent` → `{ driverId, orderId?, event }`
- `ping/pong` — Heartbeat

### `/kds` — KdsGateway
- `newOrder` → Order data
- `updatePrepStatus` ← `{ orderId, status, branchId }`
- `orderStatusUpdated` → `{ orderId, status, branchId }`

### `/tracking`
- `locationUpdate` → Real-time driver location

### `/driver`
- `driverEvent` → Driver-specific events

### `/admin`
- `adminUpdate` → Dashboard data
- `systemAlert` → Alert data
