# Component Inventory

**Date:** 2026-06-26
**Scope:** SpiceGarden Component Catalog
**Classification:** Evidence-based

## Backend Components

### Controllers (from source analysis)

| File | Methods | Purpose |
|------|---------|---------|
| app.controller.ts | - | Root controller |
| apis.controller.ts | 3+ | Admin stats, orders |
| support.controller.ts | - | Support tickets |
| restaurant.controller.ts | 3 | Restaurant CRUD, ops |
| onboarding.controller.ts | - | Restaurant onboarding |
| business-engine.controller.ts | - | Business operations |
| restaurant-ops.controller.ts | - | Operations |
| KDS.gateway.ts | - | WebSocket kitchen display |
| payments.controller.ts | - | Payment processing |
| webhook.controller.ts | - | Payment webhooks |
| refund.controller.ts | - | Refund processing |
| wallet.controller.ts | - | Wallet operations |
| auth.controller.ts | - | Authentication |
| search.controller.ts | - | Search endpoint |
| address.controller.ts | - | Address management |
| payment-methods.controller.ts | - | Payment methods |
| user-profile.controller.ts | - | Profile management |

### Services (by directory)

| Directory | Service Count | Purpose |
|-----------|---------------|---------|
| services/auth | 1 (auth.service.ts) | Authentication |
| services/order | 1 | Order lifecycle |
| services/payments | 5+ | Payments, webhooks, gateways |
| services/payments/chargeback | 1 | Dispute handling |
| services/payments/gateways | 3 | Stripe, Razorpay, COD |
| services/payments/webhook | 2 | Webhook processing |
| services/restaurant | 5 | Restaurant ops, menu, onboarding |
| services/delivery | 2 | Delivery, enhanced delivery |
| services/wallet | 1 | Wallet management |
| services/notifications | 2 | Push, preferences |
| services/loyalty | 1 | Points, referrals |
| services/refund | 1 | Refunds |
| services/driver-fleet | 1 | Fleet management |
| services/gst | 1 | GST calculation |
| services/finance | 1 | Financial reports |
| services/support | 2 | Tickets, routing |
| services/search | 1 | Search |
| modules/driver-assignment | 3 | Dispatch, assignment |
| modules/ledger | 1 | Ledger entries |

## Frontend Components

### customer-web (Next.js)

#### Pages (21 routes)

| Route | File | Purpose |
|-------|------|---------|
| / | index.tsx | Home page |
| /auth | auth.tsx | Authentication |
| /auth/callback | auth/callback.tsx | OAuth callback |
| /cart | cart.tsx | Shopping cart |
| /checkout | checkout.tsx | Checkout |
| /history | history.tsx | Order history |
| /profile | profile.tsx | User profile |
| /tracking | tracking.tsx | Real-time tracking |
| /wallet | wallet.tsx | Wallet |
| /subscriptions | subscriptions.tsx | Subscription plans |
| /search | search.tsx | Search |
| /offers | offers.tsx | Offers |
| /notifications | notifications.tsx | Notifications |
| /menu | menu.tsx | Menu |
| /restaurant | restaurant.tsx | Restaurant page |
| /404 | 404.tsx | Error page |
| /addresses | addresses.tsx | Address management |
| /payment-methods | payment-methods.tsx | Payment methods |
| /reset-password | reset-password.tsx | Password reset |
| /legal/privacy | legal/privacy.tsx | Privacy policy |
| /legal/terms | legal/terms.tsx | Terms of service |
| /order-details | order-details.tsx | Order details |

#### Components (TBD - requires deeper analysis)

- Uses @spicegarden/ui shared components

### restaurant-dashboard

#### Pages

| Route | File | Purpose |
|-------|------|---------|
| / | index.tsx | Dashboard |
| /kds | kds/* | Kitchen Display System |

### super-admin

#### Pages

| Route | File | Purpose |
|-------|------|---------|
| / | index.tsx | Admin dashboard |
| /driver-fleet/* | driver-fleet/* | Fleet management |
| /analytics/* | analytics/* | Analytics |
| /loyalty/* | loyalty/* | Loyalty program |

## Shared UI Components

**Package:** `@spicegarden/ui`
**File Count:** 54 TSX files (per existing documentation)

**Not analyzed in detail** - package exists and builds correctly.

## Mobile Components

### customer-mobile

- ~14 screens
- Navigation via React Navigation
- Components: NativeBase or custom

### delivery-partner

- React Native components
- Navigation via React Navigation
- Location tracking components

## gRPC Components

**Package:** `@spicegarden/grpc-transport`

**Status:** STUBBED

**Files:**
- `packages/grpc-transport/src/index.ts` - Throws error (quarantined)

## React Doctor Issues

| App | Score | Warning Type | Count |
|-----|-------|--------------|-------|
| customer-mobile | 65/100 | - | 126 |
| customer-web | 63/100 | - | 32 |
| delivery-partner | 59/100 | - | 51 |
| restaurant-dashboard | 74/100 | - | 5 |
| super-admin | 62/100 | - | 10 |