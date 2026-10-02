# SPICEGARDEN FULL FEATURE MASTER MATRIX
**Release Baseline:** `v1.0.0-rc1` | **Commit:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`

| Component / Feature | Test Type | Expected Behavior | Actual Behavior | Status | Evidence | Defect ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer Registration / Login** | E2E / API | Issues valid JWT access token + refresh cookie | JWT returned with user profile payload | **PASS** | `test/auth.service.spec.ts` | None |
| **Restaurant & Dish Search** | UI / API | Sub-50ms elastic search with auto-suggest | Instant filtered results rendered in DOM | **PASS** | `customer-web/search` session | None |
| **Cart & Basket Modifiers** | UI / State | Calculates subtotal, GST, discounts, and delivery fee | Exact sum matched with item options | **PASS** | `packages/ui/__tests__/useFlow.test.tsx` | None |
| **Checkout & Address Selection**| E2E / UI | Selects saved address, calculates delivery ETA | Address persisted, tip slider responsive | **PASS** | `customer-web/checkout` session | None |
| **Stripe Card Payment Intent** | API / Gateway | Generates client secret, validates intent status | Tokenized intent confirmed, order created | **PASS** | `test/stripe-gateway.spec.ts` | None |
| **Razorpay UPI Checkout** | API / Gateway | Validates signature and verifies order amount | Signature verified, order marked PAID | **PASS** | `test/razorpay-gateway.spec.ts` | None |
| **Cash on Delivery (COD)** | Workflow / API | Assigns OTP for delivery rider confirmation | OTP generated, verified on handover | **PASS** | `test/cod-gateway.spec.ts` | None |
| **Live Order Tracking (Customer)**| Real-Time / WS| Displays animated driver location & status steps | Real-time WebSocket updates without reload | **PASS** | `customer-web/tracking` session | None |
| **Kitchen Display System (KDS)**| UI / WS | Real-time ticket queue with sound alerts | Sound toggle + status bump buttons active | **PASS** | `apps/restaurant-dashboard` tests | None |
| **KDS Inventory Management** | UI / State | Stock level toggle and 86'd item disabling | Instantly disables item on customer catalog | **PASS** | `kds.e2e.test.tsx` | None |
| **Driver Shift Toggle** | Mobile / API | Shifts between Online and Offline status | Driver availability updated in Redis | **PASS** | `apps/delivery-partner` tests | None |
| **Driver Turn-by-Turn Navigation**| Mobile / Map | Route polyline and distance calculation | Accurate ETA rendered in driver UI | **PASS** | `test/maps.service.spec.js` | None |
| **Driver OTP Delivery Handover**| Mobile / API | Validates 4-digit customer OTP before completion | State changes to DELIVERED upon OTP match | **PASS** | `delivery-flow.e2e.test.ts` | None |
| **Admin Executive Dashboard** | UI / API | Aggregates platform GMV, active fleet, orders | Dynamic chart and summary cards rendered | **PASS** | `super-admin/analytics` tests | None |
| **Fraud Detection & Security** | Security / Admin| Auto-flags abnormal transaction velocity | Fraud card displays block reason & action | **PASS** | `FraudDetection.tsx` tests | None |
| **Refund Management & Wallet** | Financial / API| Approves refund and credits customer wallet | Transaction recorded in ledger journal | **PASS** | `refund-wallet.integration.spec.ts` | None |
| **Electron Launcher Dashboard** | Desktop / IPC | Starts, stops, and monitors 8 microservices | Clean IPC bridge, health meters live | **PASS** | `environment-manager.test.ts` | None |
