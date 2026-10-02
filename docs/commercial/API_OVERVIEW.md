# SpiceGarden — API Surface Overview

## 1. Architecture & Protocol
SpiceGarden exposes a RESTful JSON API alongside a Socket.IO WebSocket gateway. All endpoints enforce global input validation via NestJS `ValidationPipe` with `class-validator` and standard exception filters for uniform error representations.

## 2. Core API Domains

### Authentication & User Accounts (`/auth`, `/users`)
- `POST /auth/register` — User registration (Customer, Vendor, Driver)
- `POST /auth/login` — Authentication and JWT token issuance
- `POST /auth/refresh-token` — Access token renewal
- `POST /auth/logout` — Session revocation and cookie clearing
- `GET /auth/me` — Current authenticated user profile
- `POST /auth/forgot-password` — Password reset OTP dispatch (Email/SMS)
- `POST /auth/verify-reset-code` — Password reset OTP verification
- `POST /auth/reset-password` — Password reset execution
- `GET /auth/google`, `GET /auth/google/callback` — Google OAuth flow
- `GET /auth/facebook`, `GET /auth/facebook/callback` — Facebook OAuth flow

### Restaurant & Menu Management (`/restaurants`, `/menu`, `/kitchen`)
- `GET /restaurants` — Paginated list of active restaurants with distance/rating filters
- `GET /restaurants/:id` — Restaurant profile and operational hours
- `GET /restaurants/:id/menu` — Structured categorized menu with modifiers
- `POST /menu/items` — Menu item creation with pricing and inventory status
- `GET /kitchen/orders` — Kitchen Display System (KDS) order feed
- `PATCH /kitchen/orders/:id/status` — Kitchen preparation status update (ACCEPTED, PREPARING, READY)

### Order Lifecycle (`/orders`)
- `POST /orders` — Order creation and preliminary tax/discount calculation
- `GET /orders/:id` — Order details and current state
- `GET /orders/user` — Paginated user order history
- `POST /orders/:id/cancel` — Order cancellation with automated refund logic
- `PATCH /orders/:id/status` — Administrative or driver state transition

### Payments & In-App Wallet (`/payments`, `/wallet`)
- `POST /payments/create-intent` — Payment intent initialization (Stripe / Razorpay)
- `POST /payments/webhook/stripe` — Cryptographic Stripe webhook listener
- `POST /payments/webhook/razorpay` — Cryptographic Razorpay webhook listener
- `GET /wallet/balance` — User or driver wallet balance
- `POST /wallet/topup` — Wallet credit top-up
- `GET /wallet/transactions` — Double-entry ledger transaction history

### Delivery Dispatch (`/delivery`, `/driver`)
- `POST /delivery/assign` — Driver assignment (automated or manual)
- `PATCH /delivery/:id/pickup` — Order pickup confirmation
- `PATCH /delivery/:id/complete` — Delivery completion with OTP / signature proof
- `GET /driver/shift` — Driver active shift and earnings summary

### Real-Time WebSocket Gateway (`/tracking`)
- `location_update` — High-frequency driver GPS coordinates
- `order_status_update` — Live push updates for order state transitions
- `join_order_room` — Real-time room subscription for order tracking
