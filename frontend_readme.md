# SpiceGarden Frontend Documentation

## Overview

SpiceGarden is a food delivery platform with a **monorepo architecture** managing 4 separate frontend applications plus shared packages. All apps are orchestrated via npm workspaces defined in the root `package.json`.

**Repository Structure:** npm workspaces with `apps/*` and `packages/*`

---

## Table of Contents

1. [Shared Packages](#shared-packages)
2. [Customer Web](#customer-web)
3. [Customer Mobile](#customer-mobile)
4. [Restaurant Dashboard](#restaurant-dashboard)
5. [Super Admin](#super-admin)
6. [Architecture Patterns](#architecture-patterns)

---

## Shared Packages

### @spicegarden/ui

**Location:** `packages/ui/`
**Version:** 0.1.0
**Purpose:** Shared UI component library across all frontend apps

#### Component Library Files

| File | Description |
|------|-------------|
| `packages/ui/index.ts` | Main entry point / barrel export |
| `packages/ui/index.js` | JS entry point |
| `packages/ui/tokens.ts` / `tokens.js` | Design tokens (colors, spacing, typography, radii) |
| `packages/ui/Button.tsx` / `Button.js` | Button component with variants (primary, secondary, outline, danger) |
| `packages/ui/Card.tsx` / `Card.js` | Card container component with title, subtitle, elevation |
| `packages/ui/Input.tsx` / `Input.js` | Text input component |
| `packages/ui/Skeleton.tsx` / `Skeleton.js` | Skeleton loading placeholder |
| `packages/ui/SkeletonTemplates.tsx` / `SkeletonTemplates.js` | Pre-built skeleton templates |
| `packages/ui/LoadingStates.tsx` / `LoadingStates.js` | Loading state components |
| `packages/ui/Modal.tsx` / `Modal.js` | Modal dialog component |
| `packages/ui/OTPInput.tsx` / `OTPInput.js` | OTP input field component |
| `packages/ui/SearchInput.tsx` / `SearchInput.js` | Search input component |
| `packages/ui/Stepper.tsx` / `Stepper.js` | Multi-step progress indicator |
| `packages/ui/Toast.tsx` / `Toast.js` | Toast notification component |
| `packages/ui/LottieSuccessAnimation.tsx` / `LottieSuccessAnimation.js` | Lottie animation for success states |
| `packages/ui/useFlow.ts` / `useFlow.js` | Hook for managing flow/wizard state |
| `packages/ui/ErrorBoundary.tsx` / `ErrorBoundary.js` | Error boundary with Sentry integration |
| `packages/ui/sentry.client.ts` / `sentry.client.js` | Sentry client initialization |

#### Hooks in @spicegarden/ui

| File | Description |
|------|-------------|
| `packages/ui/src/useNetworkStatus.ts` | Network online/offline detection hook |
| `packages/ui/src/useNavigationState.ts` | Navigation state management hook |

#### Icons in @spicegarden/ui

Icons are organized by domain in `packages/ui/icons/`:

| Category | Files | Description |
|----------|-------|-------------|
| **system** | `LocationIcon.tsx`, `RatingIcon.tsx`, `NotificationIcon.tsx` | System-level UI icons |
| **navigation** | `SearchIcon.tsx`, `ProfileIcon.tsx`, `HomeIcon.tsx` | Navigation icons |
| **kitchen** | `KitchenIcon.tsx`, `FireIcon.tsx` | Kitchen/restaurant icons |
| **delivery** | `DeliveryIcon.tsx` | Delivery driver icons |
| **commerce** | `WalletIcon.tsx`, `PaymentIcon.tsx`, `OrderIcon.tsx`, `CartIcon.tsx` | E-commerce icons |
| **admin** | `AdminIcons.tsx` | Admin dashboard icons |

All icons export as React components using `react-native-svg` / SVG paths. Type definitions in `packages/ui/icons/types.ts`.

#### Tests in @spicegarden/ui

- `packages/ui/__tests__/Button.test.tsx`
- `packages/ui/__tests__/Button.test.js`
- `packages/ui/__tests__/Card.test.js`
- `packages/ui/__tests__/Input.test.tsx`
- `packages/ui/__tests__/Input.test.js`
- `packages/ui/__tests__/Skeleton.test.js`
- `packages/ui/__tests__/LottieSuccessAnimation.test.js`
- `packages/ui/__tests__/useFlow.test.tsx`
- `packages/ui/__tests__/useFlow.test.js`
- `packages/ui/__tests__/FlowManager.test.js`
- `packages/ui/__tests__/LoadingStates.test.tsx`

#### Storybook Stories

- `packages/ui/Input.stories.tsx`
- `packages/ui/Modal.stories.tsx`
- `packages/ui/OTPInput.stories.tsx`
- `packages/ui/ReviewCard.stories.tsx`
- `packages/ui/SearchInput.stories.tsx`
- `packages/ui/SkeletonTemplates.stories.tsx`
- `packages/ui/Stepper.stories.tsx`
- `packages/ui/TrackingCard.stories.tsx`
- `packages/ui/MapCard.stories.tsx`
- `packages/ui/MenuCard.stories.tsx`

**Dependencies:** `lucide-react` (icons)

---

### @spicegarden/api-types

**Location:** `packages/api-types/`
**Version:** 1.0.0
**Purpose:** Shared TypeScript type definitions for API contracts

#### Type Definitions (`packages/api-types/src/index.ts`)

| Interface | Fields | Purpose |
|-----------|--------|---------|
| `DriverProfile` | id, name, email, phone, vehicleType, licenseNumber, vehicleNumber, rating, totalDeliveries, isOnline, isAvailable, kycStatus | Driver entity schema |
| `DeliveryOrder` | id, orderId, status, restaurant (name, address, lat, lng), customer (name, address, lat, lng, phone), amount, estimatedTimeMinutes, distanceKm, otpCode | Delivery order schema |
| `EarningsSummary` | availableBalance, pendingBalance, lifetimeEarnings, weeklyEarnings, todayEarnings | Driver earnings schema |
| `Location` | lat, lng | Geo coordinate schema |

---

## Customer Web

**Location:** `apps/customer-web/`
**Package Name:** `@spicegarden/customer-web`
**Version:** 0.1.0
**Port:** 3002
**Tech Stack:** Next.js 16.2.7, React 19.2, Redux Toolkit, TanStack Query, Socket.io Client, CSS Modules, Sentry

### Tech Stack Details

| Dependency | Version | Purpose |
|------------|---------|---------|
| `next` | ^16.2.7 | React framework (SSR/SSG) |
| `react` / `react-dom` | ^19.2.7 | UI library |
| `@reduxjs/toolkit` | ^2.2.0 | State management |
| `react-redux` | ^9.1.0 | React-Redux bindings |
| `@tanstack/react-query` | ^5.0.0 | Server state / data fetching |
| `socket.io-client` | ^4.7.0 | Real-time WebSocket communication |
| `@spicegarden/ui` | * | Shared UI components |
| `lottie-react` | ^2.4.1 | Lottie animations |
| `lottie-web` | ^5.13.0 | Lottie web player |
| `node-notifier` | 6.0.0 | Desktop notifications |

**Dev Dependencies:** Jest 29, Testing Library, ESLint, TypeScript 5

### Configuration Files

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js config with `transpilePackages` for `@spicegarden/ui` and `@spicegarden/shared`, turbopack enabled |
| `tsconfig.json` | TypeScript config with `@/*` path alias to `./src/*`, strict mode, JSX: react-jsx |
| `sentry.properties` | Sentry error tracking config |

### Source File Structure

```
apps/customer-web/src/
├── _app.tsx                    # Root app with Redux, QueryClient, NetworkStatusProvider, OfflineIndicator, Sentry
├── analytics.ts                # Analytics tracking utility (trackEvent, useAnalytics hook)
├── middleware.ts               # Next.js middleware (x-request-id header injection)
├── components/
│   ├── ErrorBoundary.tsx       # Sentry-powered error boundary
│   └── OfflineIndicator.tsx    # Fixed offline banner with retry button
├── contexts/
│   └── NetworkStatusContext.tsx # React context for online/offline state
├── hooks/
│   ├── useAuth.ts              # Auth state hydration from localStorage
│   ├── useOfflineQueue.ts      # Offline request queue with network detection
│   ├── useTracking.ts          # Socket.io real-time driver tracking hook
│   ├── useNetworkStatus.ts     # Browser online/offline detection hook
│   ├── useMotion.ts            # prefers-reduced-motion detection hook
│   └── useAnimation.ts         # Enter/hover animation hooks with reduced-motion support
├── pages/
│   ├── api/
│   │   ├── categories.ts       # Mock API: categories list
│   │   └── restaurants.ts      # Mock API: restaurants list
│   ├── auth/
│   │   └── callback.tsx        # OAuth callback handler (JWT parsing, Redux dispatch)
│   ├── legal/
│   │   ├── terms.tsx           # Terms of Service page
│   │   └── privacy.tsx         # Privacy Policy page with data retention table
│   ├── _app.tsx                # App wrapper (in pages dir for Next.js)
│   ├── index.tsx               # Home page (restaurant listing, categories, promos, search)
│   ├── auth.tsx                # Login/Register page (email/password + Google/FB social)
│   ├── menu.tsx                # Menu browsing page (categories, cart, checkout)
│   ├── restaurant.tsx          # Restaurant detail page (menu items, add to cart)
│   ├── cart.tsx                # Shopping cart page (quantity controls, bill details)
│   ├── checkout.tsx            # Checkout page (address, payment, tip, promo codes)
│   ├── search.tsx              # Search/Discover restaurants page (filters, offline queue)
│   ├── history.tsx             # Order history page (status filters, reorder)
│   ├── order-details.tsx       # Individual order details page
│   ├── tracking.tsx            # Live order tracking page (driver location via socket)
│   ├── wallet.tsx              # Wallet page (balance, transactions, add/withdraw)
│   ├── offers.tsx              # Offers & promos page (copy codes, refer & earn)
│   ├── subscriptions.tsx       # Subscription management page
│   ├── notifications.tsx       # Notification preferences page (push/email/SMS toggles)
│   ├── payment-methods.tsx     # Saved payment methods CRUD
│   ├── addresses.tsx           # Saved delivery addresses CRUD
│   ├── reset-password.tsx      # Multi-step password reset (email → code → new password)
│   └── *.module.css            # CSS Modules for scoped styling
├── redux/
│   ├── store.ts                # Redux store (configureStore with auth + cart slices)
│   └── slices/
│       ├── authSlice.ts        # Auth state (user, token, isAuthenticated + setCredentials, logout, refreshToken, updateUser)
│       └── cartSlice.ts        # Cart state (items[], restaurantId + addToCart, removeFromCart, updateQuantity, clearCart)
└── types/
    └── sentry.d.ts             # Sentry type declarations
```

### Page Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `pages/index.tsx` | Home page with restaurant listing, categories, promo banner |
| `/auth` | `pages/auth.tsx` | Login/Register with social OAuth placeholders |
| `/auth/callback` | `pages/auth/callback.tsx` | OAuth token callback handler |
| `/menu` | `pages/menu.tsx` | Menu items with category filtering and cart |
| `/restaurant` | `pages/restaurant.tsx` | Restaurant detail with menu items |
| `/cart` | `pages/cart.tsx` | Shopping cart with quantity controls |
| `/checkout` | `pages/checkout.tsx` | Checkout with address, payment, tip, promo codes |
| `/search` | `pages/search.tsx` | Restaurant search with filters |
| `/history` | `pages/history.tsx` | Order history with status filters |
| `/order-details` | `pages/order-details.tsx` | Order detail view |
| `/tracking` | `pages/tracking.tsx` | Live driver tracking with socket.io |
| `/wallet` | `pages/wallet.tsx` | Wallet balance and transaction history |
| `/offers` | `pages/offers.tsx` | Promotional offers and referral codes |
| `/subscriptions` | `pages/subscriptions.tsx` | Subscription plan management |
| `/notifications` | `pages/notifications.tsx` | Notification preferences |
| `/payment-methods` | `pages/payment-methods.tsx` | Saved payment methods |
| `/addresses` | `pages/addresses.tsx` | Saved delivery addresses |
| `/reset-password` | `pages/reset-password.tsx` | Password reset flow |
| `/legal/terms` | `pages/legal/terms.tsx` | Terms of Service |
| `/legal/privacy` | `pages/legal/privacy.tsx` | Privacy Policy |

### Key Features

- **Real-time tracking:** Socket.io connection for live driver location updates
- **Offline support:** Network status context, offline queue for API requests, offline indicator banner
- **State management:** Redux Toolkit for auth and cart, TanStack Query for server state
- **Error tracking:** Sentry ErrorBoundary with React error reporting
- **Animations:** Lottie for success animations, CSS animations for transitions
- **Accessibility:** ARIA labels, keyboard navigation, reduced motion support
- **Design system:** Uses `@spicegarden/ui` tokens for consistent spacing, colors, typography

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3002 |
| `npm run build` | Production build |
| `npm run lint` | ESLint on src/ |
| `npm run test:unit` | Jest unit tests (order/kitchen/delivery service specs) |
| `npm run test:integration` | Jest integration tests |
| `npm run test:e2e` | Jest e2e tests |
| `npm run test:all` | All tests combined |

---

## Customer Mobile

**Location:** `apps/customer-mobile/`
**Package Name:** `@spicegarden/customer-mobile`
**Version:** 1.0.0
**Tech Stack:** Expo 56, React Native 0.85, TypeScript 5.9, React Navigation 6

### Tech Stack Details

| Dependency | Version | Purpose |
|------------|---------|---------|
| `expo` | ^56.0.8 | React Native framework |
| `react-native` | ^0.85.3 | Native UI library |
| `@react-navigation/native` | ^6.1.8 | Navigation core |
| `@react-navigation/bottom-tabs` | ^6.5.11 | Bottom tab navigator |
| `@react-navigation/native-stack` | ^6.9.14 | Stack navigator |
| `@react-navigation/stack` | ^6.4.1 | Legacy stack navigator |
| `expo-constants` | ~56.0.18 | App constants |
| `expo-haptics` | ~56.0.3 | Haptic feedback |
| `expo-location` | ~56.0.17 | GPS location services |
| `expo-notifications` | ~56.0.17 | Push notifications |
| `expo-status-bar` | ~56.0.4 | Status bar control |
| `react-native-svg` | ^15.15.5 | SVG rendering |
| `react-native-svg-transformer` | ^1.5.3 | SVG import support |
| `react-native-web` | ^0.21.2 | Web platform support |
| `@react-native-async-storage/async-storage` | 2.2.0 | Async local storage |

**Dev Dependencies:** Babel 7, ESLint 8, TypeScript 5.9

### Source File Structure

```
apps/customer-mobile/src/
├── App.tsx / App.js            # Root application entry point
├── config.ts                   # App configuration
├── @types/
│   ├── module-declarations.d.ts # Module type declarations
│   └── react-navigation.d.ts    # React Navigation type declarations
├── constants/
│   ├── api.ts                  # API endpoint constants
│   ├── i18n.ts / i18n.js       # Internationalization config
│   ├── order.constants.ts      # Order status/type constants
│   ├── strings.ts / strings.js # Localized string constants
│   └── storage.keys.ts / storage.keys.js # Storage key constants
├── navigation/
│   └── types.ts / types.js     # Navigation type definitions
├── screens/
│   ├── HomeScreen.tsx / .js    # Home dashboard
│   ├── AuthScreen.tsx / .js    # Login/Register screen
│   ├── OnboardingScreen.tsx / .js # User onboarding
│   ├── SearchScreen.tsx / .js  # Restaurant search
│   ├── RestaurantScreen.tsx / .js # Restaurant detail
│   ├── MenuItemCustomizationScreen.tsx # Item customization
│   ├── CartScreen.tsx / .js    # Shopping cart
│   ├── CheckoutScreen.tsx / .js # Checkout flow
│   ├── PaymentMethodsScreen.tsx # Payment management
│   ├── AddressesScreen.tsx     # Address management
│   ├── OrderDetailsScreen.tsx / .js # Order details
│   ├── TrackingScreen.tsx / .js # Live order tracking
│   ├── HistoryScreen.tsx / .js # Order history
│   ├── NotificationsScreen.tsx # Notification settings
│   └── ProfileScreen.tsx / .js # User profile
├── components/
│   ├── OrderCard.tsx / .js     # Order list item component
│   ├── OrderTabs.tsx / .js     # Order status tab filter
│   ├── OrderTimeline.tsx       # Order progress timeline
│   ├── SkeletonLoader.tsx / .js # Skeleton loading UI
│   ├── LoadingState.tsx / .js  # Loading state component
│   └── EmptyState.tsx / .js    # Empty state placeholder
├── hooks/
│   ├── useOrderHistory.ts / .js # Order history data hook
│   └── useHaptics.ts           # Haptic feedback hook
├── services/
│   ├── order.service.ts / .js  # Order API service
│   ├── websocket.service.ts / .js # WebSocket service
│   └── push-notification.service.ts # Push notification handler
├── utils/
│   ├── order.utils.ts / .js    # Order utility functions
│   ├── validation.ts / .js     # Form validation utilities
│   ├── currency.ts / .js       # Currency formatting
│   ├── navigation.ts           # Navigation helpers
│   ├── secure-storage.ts / .js # Secure token storage
│   └── safe-parse.ts / .js     # Safe JSON parsing
├── storage/
│   └── storageKeys.ts          # Storage key constants (separate from constants/storageKeys)
└── tests/
    └── __tests__/               # Test directory
```

### Key Features

- **Platform:** iOS / Android via Expo (also supports web via react-native-web)
- **Navigation:** Bottom tabs + stack navigation
- **Push Notifications:** Expo notifications service
- **Location:** Expo location for GPS tracking
- **Haptics:** Haptic feedback on interactions
- **WebSocket:** Real-time order tracking
- **Dual file format:** Both `.ts` and `.js` versions of most files (migration in progress)

### Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run start:ci` | Start in CI mode (non-interactive) |
| `npm run android` | Open on Android emulator |
| `npm run ios` | Open on iOS simulator |
| `npm run build` | TypeScript type check |
| `npm run lint` | ESLint |

---

## Restaurant Dashboard

**Location:** `apps/restaurant-dashboard/`
**Package Name:** `@spicegarden/restaurant-dashboard`
**Version:** 0.1.0
**Port:** 3003
**Tech Stack:** Next.js 16.2.7, React 19.2, Socket.io Client, CSS Modules, Sentry

### Tech Stack Details

| Dependency | Version | Purpose |
|------------|---------|---------|
| `next` | ^16.2.7 | React framework |
| `react` / `react-dom` | ^19.2.7 | UI library |
| `socket.io-client` | ^4.7.0 | Real-time order/inventory updates |
| `@spicegarden/ui` | * | Shared UI components |

### Configuration Files

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js config with `transpilePackages` for `@spicegarden/ui` |
| `ts` | TypeScript config |

### Source File Structure

```
apps/restaurant-dashboard/src/
├── pages/
│   ├── _app.tsx               # App wrapper with Redux, QueryClient, Sentry ErrorBoundary
│   ├── index.tsx              # Kitchen Display System (KDS) main page
│   ├── index.module.css       # KDS styles
│   ├── onboarding/
│   │   ├── index.tsx          # Onboarding wizard (6-step progress bar)
│   │   ├── business.tsx       # Business registration form
│   │   ├── documents.tsx      # Document upload (FSSAI, GST, license, etc.)
│   │   ├── gst.tsx            # GST configuration form
│   │   ├── gst.module.css     # GST form styles
│   │   ├── menu.tsx           # Menu setup (categories + items)
│   │   ├── pricing.tsx        # Pricing configuration (delivery/packaging fee, commission)
│   │   └── payout.tsx         # Bank payout settings (account, IFSC)
│   ├── api/
│   │   ├── orders.ts          # Mock API: kitchen orders
│   │   └── inventory.ts       # Mock API: inventory items
│   └── *.module.css           # CSS Module styles
├── redux/
│   └── store.ts               # Redux store (dummy reducer placeholder)
└── types/
    └── sentry.d.ts            # Sentry type declarations
```

### Page Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `pages/index.tsx` | Kitchen Display System (KDS) |
| `/onboarding` | `pages/onboarding/index.tsx` | Onboarding wizard |
| `/onboarding/business` | `pages/onboarding/business.tsx` | Business info step |
| `/onboarding/documents` | `pages/onboarding/documents.tsx` | Document upload step |
| `/onboarding/gst` | `pages/onboarding/gst.tsx` | GST configuration step |
| `/onboarding/menu` | `pages/onboarding/menu.tsx` | Menu setup step |
| `/onboarding/pricing` | `pages/onboarding/pricing.tsx` | Pricing configuration step |
| `/onboarding/payout` | `pages/onboarding/payout.tsx` | Bank payout step |

### Kitchen Display System (KDS) Features

The main `pages/index.tsx` file is a comprehensive 547-line Kitchen Display System with:

- **Order Management:** Accept, start prep, mark ready, serve, park, delay
- **Status Tracking:** New → Accepted → Preparing → Ready → Delayed → Completed
- **Batch Mode:** Group orders by status for bulk kitchen management
- **Inventory Tracking:** Stock levels with low-stock alerts and progress bars
- **Real-time Updates:** Socket.io connection for new orders and inventory alerts
- **Audio Alerts:** New order sound notifications with mute toggle
- **Prep Timers:** Elapsed time tracking with delay detection
- **Service Types:** Delivery, Dine-In, Takeaway with color-coded labels
- **Order Cards:** Detailed order cards with items, modifiers, notes, timer progress

### Onboarding Flow

6-step wizard for restaurant onboarding:
1. **Business Info** → Legal name, trade name, GSTIN, business type, registration date
2. **Documents** → Upload FSSAI, GST certificate, business license, bank statement, cancelled cheque
3. **GST Config** → GSTIN, legal name, trade name, address, state code
4. **Menu Setup** → Create categories and add menu items with pricing
5. **Pricing** → Delivery fee, packaging fee, minimum order, commission rate
6. **Payout** → Bank account details for weekly payouts

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3003 |
| `npm run build` | Production build |
| `npm run lint` | ESLint on src/ |

---

## Super Admin

**Location:** `apps/super-admin/`
**Package Name:** `@spicegarden/super-admin`
**Version:** 0.1.0
**Port:** 3004
**Tech Stack:** Next.js 16.2.7, React 19.2, Recharts, Socket.io Client, CSS Modules, Sentry

### Tech Stack Details

| Dependency | Version | Purpose |
|------------|---------|---------|
| `next` | ^16.2.7 | React framework |
| `react` / `react-dom` | ^19.2.7 | UI library |
| `socket.io-client` | ^4.7.0 | Real-time platform updates |
| `@sentry/nextjs` | ^10.57.0 | Error tracking |
| `recharts` | ^2.12.0 | Data visualization charts |
| `@spicegarden/ui` | * | Shared UI components |

### Configuration Files

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js config with `transpilePackages` for `@spicegarden/ui` |
| `ts` | TypeScript config |

### Source File Structure

```
apps/super-admin/src/
├── pages/
│   ├── _app.tsx               # App wrapper with Redux, QueryClient, Sentry
│   ├── index.tsx              # Main admin dashboard (670 lines)
│   ├── AdminDashboard.module.css # Dashboard styles
│   ├── analytics/
│   │   ├── index.tsx          # Analytics overview page
│   │   ├── top-dishes.tsx     # Top selling dishes table
│   │   └── customers.tsx      # Customer analytics (churn, repeat)
│   ├── driver-fleet/
│   │   ├── overview.tsx       # Driver fleet management table
│   │   ├── shifts.tsx         # Shift management (placeholder)
│   │   ├── earnings.tsx       # Driver earnings (placeholder)
│   │   ├── incentives.tsx     # Incentives & bonuses (placeholder)
│   │   └── penalties.tsx      # Penalty management with form
│   ├── loyalty/
│   │   ├── index.tsx          # Loyalty & growth engine overview
│   │   ├── coupons.tsx        # Coupon creation and management
│   │   └── referrals.tsx      # Referral management
│   └── api/
│       └── admin/
│           └── stats.ts       # Admin stats API route
├── redux/
│   └── store.ts               # Redux store (dummy reducer placeholder)
├── types/
│   └── sentry.d.ts            # Sentry type declarations
└── __tests__/e2e/             # E2E test directory
```

### Page Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `pages/index.tsx` | Main admin dashboard |
| `/analytics` | `pages/analytics/index.tsx` | Analytics overview with KPI cards |
| `/analytics/top-dishes` | `pages/analytics/top-dishes.tsx` | Top selling dishes ranking |
| `/analytics/customers` | `pages/analytics/customers.tsx` | Customer churn & repeat analysis |
| `/driver-fleet` | `pages/driver-fleet/overview.tsx` | Driver fleet management table |
| `/driver-fleet/shifts` | `pages/driver-fleet/shifts.tsx` | Shift scheduling (placeholder) |
| `/driver-fleet/earnings` | `pages/driver-fleet/earnings.tsx` | Driver earnings (placeholder) |
| `/driver-fleet/incentives` | `pages/driver-fleet/incentives.tsx` | Incentive programs (placeholder) |
| `/driver-fleet/penalties` | `pages/driver-fleet/penalties.tsx` | Penalty issuance form |
| `/loyalty` | `pages/loyalty/index.tsx` | Loyalty & growth engine overview |
| `/loyalty/coupons` | `pages/loyalty/coupons.tsx` | Coupon CRUD management |
| `/loyalty/referrals` | `pages/loyalty/referrals.tsx` | Referral tracking |

### Dashboard Features

The main dashboard (`pages/index.tsx`) is a 670-line comprehensive admin panel with:

- **Tab-based Navigation:** Overview, Live Orders, Kitchen Monitor, Support & Security
- **Real-time KPIs:** Revenue, orders, drivers online, refunds, disputes, fraud alerts (6 KPI cards)
- **Revenue Charts:** 24h Area chart + Orders line chart (Recharts)
- **Live Order Feed:** Real-time socket stream of orders with amount/branch/ETA
- **Order Status Breakdown:** Bar chart by status + AOV area chart
- **Delivery Heatmap:** Grid-based heatmap visualization of service area demand
- **Branch Monitoring:** Per-branch cards with prep time, driver coverage, status badges
- **Support Tickets:** Ticket management with severity levels, refund approval workflow
- **Fraud Detection:** Fraud block alerts with investigate/block IP actions
- **System Alerts:** Branch status alerts (delayed/critical kitchens)

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3004 |
| `npm run build` | Production build |
| `npm run lint` | ESLint on src/ |

---

## Electron Launcher

**Location:** `apps/launcher/`
**Purpose:** Desktop application launcher for SpiceGarden services

### Files

| File | Purpose |
|------|---------|
| `apps/launcher/src/renderer/styles.css` | Global styles for launcher UI |
| `apps/launcher/eslint.config.js` | ESLint configuration |

### Launcher UI Features (`styles.css`)

- Dark gradient background (`#1e293b` → `#0f172a`)
- Dashboard layout with 3 sections:
  - **Quick Actions** — colored action buttons (green, gray, amber)
  - **Services Section** — service cards with status badges and port info
  - **System Monitor** — monitor cards with real-time metrics
- Service cards: status badges, port display, hover transitions
- Monitor cards: emerald accent color, centered metric display
- CSS Grid responsive layouts (`auto-fit`, `minmax`)

---

## Delivery Partner App (Referenced)

**Location:** `apps/delivery-partner/` (referenced in eslint config and e2e setup)
**Note:** This app exists in the workspace but its source files were not in the initial scope. It has:
- `eslint.config.js` and `jest.config.js`
- `detox.config.js` for E2E testing

---

## Build & Development Workflow

### Root-Level Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start ALL app dev servers (via workspaces) |
| `npm run build` | Build ALL packages |
| `npm run lint` | Lint ALL packages |
| `npm run format` | Format ALL packages |
| `npm run test:unit` | Unit tests across workspaces |
| `npm run test:integration` | Integration tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run test:all` | All test suites combined |

### Package-Level Scripts (Per App)

| App | Dev Port | Lint Command |
|-----|----------|-------------|
| customer-web | 3002 | `eslint src` |
| customer-mobile | N/A (Expo) | `eslint .` |
| restaurant-dashboard | 3003 | `eslint src` |
| super-admin | 3004 | `eslint src` |
| @spicegarden/ui | N/A | `echo "lint placeholder"` |
| @spicegarden/api-types | N/A | `eslint .` |

### Shared Package Scripts

| Package | Scripts |
|---------|---------|
| **@spicegarden/ui** | `build` (tsc), `lint`, `test:unit/integration/e2e/all` |
| **@spicegarden/api-types** | `build` (tsc --noEmit), `type-check`, `lint` |

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | Next.js | 16.2.7 |
| **UI Library** | React | 19.2.7 |
| **Mobile Framework** | React Native | 0.85.3 |
| **Mobile Tooling** | Expo | 56.0.8 |
| **Desktop** | Electron | 42.4.0 |
| **State Management** | Redux Toolkit | 2.2.0 |
| **Server State** | TanStack Query | 5.0.0 |
| **Real-time** | Socket.io Client | 4.7.0 |
| **Charts** | Recharts | 2.12.0 |
| **Animations** | lottie-react, lottie-web | 2.4.1, 5.13.0 |
| **Notifications** | expo-notifications | ~56.0.17 |
| **Icons** | lucide-react | 1.17.0 |
| **Error Tracking** | @sentry/nextjs | 10.57.0 |
| **Testing** | Jest | 29.7.0 |
| **E2E Mobile** | Detox | (configured) |
| **Language** | TypeScript | 5.0.0–5.9.3 |

---

## File Organization Principles

### Monorepo Conventions

1. **Shared packages** in `packages/` — consumed by all apps via `@spicegarden/*` workspace references
2. **App-specific code** in `apps/` — each app is self-contained
3. **Source root** is `src/` for all apps (except mobile which uses root-level `App.tsx`)
4. **CSS modules** co-located with components: `ComponentName.module.css`
5. **API routes** in `pages/api/` (Next.js convention)
6. **Tests** in `__tests__/` directories and `*.test.ts`/`*.test.js` files
7. **Public assets** in `public/` (Next.js) or root `assets/` (mobile)
8. **Environment files** are gitignored (`.env.*.local`)
9. **Build output** in `.next/`, `coverage/`, `node_modules/` (all gitignored)

### Naming Conventions

| Pattern | Example |
|---------|---------|
| Component files | `PascalCase.tsx` |
| Page files | `kebab-case.tsx` or `PascalCase.tsx` |
| CSS modules | `ComponentName.module.css` |
| Hook files | `camelCase.ts` with `use` prefix |
| Slice files | `camelSlice.ts` (Redux convention) |
| API routes | `kebab-case.ts` (Next.js convention) |
| Test files | `*.test.ts` or `*.spec.ts` |
| E2E tests | `*.e2e.test.js` |
| Config files | `*.config.js/ts/cjs` |

### Styling Approach by App

Each app uses a different styling strategy:

| App | Styling Method | CSS Files |
|-----|---------------|-----------|
| **@spicegarden/ui** | CSS-in-JS (inline styles via `style={}` prop) + injected keyframes | No .css files — all styles are JS objects |
| **customer-web** | CSS Modules (`.module.css`) + inline styles | 5 module.css files |
| **restaurant-dashboard** | CSS Modules (`.module.css`) + inline styles | 2 module.css files |
| **super-admin** | CSS Modules (`.module.css`) — primary use + inline styles | 1 AdminDashboard.module.css |
| **customer-mobile** | StyleSheet.create() (React Native) | No .css files |
| **launcher** | Plain CSS + global styles | 1 styles.css file |

### CSS Module Files — Full Inventory

#### Customer Web CSS Modules

| File | Classes | Purpose |
|------|---------|---------|
| `apps/customer-web/src/pages/index.module.css` | 20 classes | Home page: container, header, searchBar, categoryContainer, promoBanner, restaurantItemGrid, nav/tabBar |
| `apps/customer-web/src/pages/offers.module.css` | 15 classes | Offers: container, cardList, discountBadge, codeBlock, bottomNav, tabItem |
| `apps/customer-web/src/pages/subscriptions.module.css` | 18 classes | Subscriptions: cardList, priceWrapper, statusBadge (active/inactive), benefits, bottomNav, navItem |
| `apps/customer-web/src/pages/tracking.module.css` | 23 classes | Tracking: glassmorphism container, statusStep icons, liveTrackingCard, orderDetailsCard, fadeIn animation |
| `apps/customer-web/src/pages/reset-password.module.css` | 12 classes | Reset password: container, header, error/success banners, input, backButton |

#### Restaurant Dashboard CSS Modules

| File | Classes | Purpose |
|------|---------|---------|
| `apps/restaurant-dashboard/src/pages/index.module.css` | 60+ classes | KDS: rootContainer, headerBar, statusRibbon, soundContainer, orderCard, timerSection, progressBar, inventoryGrid, navBar |
| `apps/restaurant-dashboard/src/pages/onboarding/gst.module.css` | 9 classes | GST form: container, maxWidth, heading, subtitle, formGroup, input, actions, backButton |

#### Super Admin CSS Modules

| File | Classes | Purpose |
|------|---------|---------|
| `apps/super-admin/src/pages/AdminDashboard.module.css` | 80+ classes | Dashboard: sidebar, kpiGrid, chartsContainer, orderTable, branchesGrid, ticket system, heatmap, fraud/refund cards |

#### Launcher CSS

| File | Classes | Purpose |
|------|---------|---------|
| `apps/launcher/src/renderer/styles.css` | 40+ classes | Electron launcher: dashboard with gradient background, quick actions, services grid, system monitor cards |

### CSS Variable Tokens (CSS Modules)

Customer-web CSS modules reference CSS custom properties that map to design tokens:

```css
/* Available CSS variables in customer-web modules */
--spacing-md        /* 16px */
--spacing-lg        /* 24px */
--spacing-xl        /* 32px */
--spacing-sm        /* 8px */
--spacing-xs        /* 4px */
--font-family       /* 'Inter', system-ui, sans-serif */
--color-background  /* #F9FAFB */
--color-surface     /* #FFFFFF */
--color-text-primary  /* #111827 */
--color-text-secondary /* #6B7280 */
--color-primary     /* #FF5A1F */
--color-danger      /* #EF4444 */
--color-success     /* #10B981 */
--color-border      /* #E5E7EB */
--radius-md         /* 8px */
--radius-sm         /* 4px */
--shadow-small      /* 0 1px 3px rgba(0,0,0,0.08) */
```

### Keyframe Animations

| Animation | Location | Description |
|-----------|----------|-------------|
| `sg-shimmer` | `packages/ui/Skeleton.tsx` | Skeleton loading shimmer (200% gradient scroll) |
| `pulse` | `packages/ui/LoadingStates.tsx` | Loading state pulse (opacity 0.6→1) |
| `fadeIn` + `slideUp` | `packages/ui/Modal.tsx` | Modal open animation |
| `slideIn` | `packages/ui/Toast.tsx` | Toast notification slide-in |
| `fadeIn` | `packages/ui/LottieSuccessAnimation.tsx` | Success animation fade-in |
| `kdsPulse` | `restaurant-dashboard/index.module.css` | KDS new order alert pulse (scale 1→1.04) |

### CSS-in-JS Pattern

The `@spicegarden/ui` package uses **inline style objects** (CSS-in-JS) exclusively — no CSS files. Every component computes styles from `DESIGN_TOKENS`:

```tsx
// Example: Button component styling pattern
style={{
  backgroundColor: getBgColor(),  // token-based color
  borderRadius: `${DESIGN_TOKENS.radius.button}px`,
  transition: `all ${DESIGN_TOKENS.motion.micro}ms ${MOTION_EASING.easeOutSoft}`,
  boxShadow: variant === 'primary' ? DESIGN_TOKENS.shadows.small : 'none',
}}
```

This pattern is also used extensively in app-level components (especially super-admin and restaurant-dashboard onboarding pages) where styles are defined inline via `style={{}}` props rather than CSS modules.

### cafed00d-style Notes

The CSS modules use **BEM-like naming** conventions:
- `index.module.css`: `.rootContainer`, `.headerBar`, `.statusRibbon`, `.orderCard`, `.progressFillDelayed`
- `AdminDashboard.module.css`: `.sidebar`, `.kpiCard`, `.chartWrapper`, `.ticketItem`, `.branchPrepBar`
- KDS styles use dark theme colors (#1a1a2e, #2a2a4a, #f04e31, #00ff88)
- Admin styles use light theme (#f0f2f5, white cards, #1e2a3a sidebar)
- Customer-web uses light theme with CSS custom properties referencing design tokens

---

## UI Component Reference

### @spicegarden/ui Component Library

All UI components are located in `packages/ui/` and exported via `packages/ui/index.ts`.

| Component | File | Variants/Modes | Key Features |
|-----------|------|----------------|--------------|
| **Button** | `Button.tsx` | primary, secondary, ghost, destructive, loading, outline | Sizes sm/md/lg, isLoading, disabled, ariaLabel, className |
| **Card** | `Card.tsx` | default, elevated, list; isElevated | Title, subtitle, children, custom style |
| **Input** | `Input.tsx` | text (extends HTML input) | Label, error, helperText, forwardRef, focus ring |
| **Skeleton** | `Skeleton.tsx` | text, circular, rectangular | SkeletonCard, SkeletonList, shimmer animation |
| **LoadingStates** | `LoadingStates.tsx` | card, list, text | EmptyState, NetworkError, LoadingState with pulse |
| **Modal** | `Modal.tsx` | sm, md, lg | isOpen, onClose, title, showCloseButton, body scroll lock |
| **BottomSheet** | `Modal.tsx` | (extends Modal) | Snap points, slide-up animation, "Done" button |
| **Stepper** | `Stepper.tsx` | numeric | min/max/step, label, disabled state |
| **OTPInput** | `OTPInput.tsx` | length 4 or 6 | Auto-focus, paste support, error state, keyboard nav |
| **SearchInput** | `SearchInput.tsx` | text | Search icon prefix, onSearch callback, Enter key |
| **Toast** | `Toast.tsx` | success, error, info | ToastProvider context, showToast/hideToast, InlineAlert |
| **LottieSuccessAnimation** | `LottieSuccessAnimation.tsx` | SVG-based | Configurable width/height/speed/loop |
| **ErrorBoundary** | `ErrorBoundary.tsx` | React class | Sentry integration, retry button |
| **useFlow** | `useFlow.ts` | idle, in_progress, success, error | Multi-step flow with analytics tracking |

### Icon Library

Icons are organized by domain in `packages/ui/icons/`:

| Category | Icons |
|----------|-------|
| **system** | LocationIcon, RatingIcon, NotificationIcon |
| **navigation** | SearchIcon, ProfileIcon, HomeIcon |
| **kitchen** | KitchenIcon, FireIcon |
| **delivery** | DeliveryIcon |
| **commerce** | WalletIcon, PaymentIcon, OrderIcon, CartIcon |

### Design Token Exports

```typescript
// packages/ui/tokens.ts
DESIGN_TOKENS = {
  colors: { primary, secondary, background, surface, elevated, textPrimary, textSecondary, textInverse, success, danger, warning, premium, border, dangerDark, neutral },
  icon: { primary, secondary, muted, danger, success, warning },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  typography: { fontFamily, headingXL/L/M/S, body, bodyMedium, caption, captionM, smallLabel },
  radius: { sm: 4, md: 8, button: 12, input: 14, card: 24, container: 28, full: 9999 },
  motion: { micro: 150, standard: 300, page: 450 },
  shadows: { small, medium, large, premiumFloat },
};
MOTION_EASING = { easeOutSoft, easeInOut, springSmooth };
DARK_MODE_TOKENS = { colors: { primary, secondary, background, surface, elevated, textPrimary, textSecondary, textInverse, border } };
```

### Storybook Stories

Component stories for development/testing:
- `Input.stories.tsx`, `Modal.stories.tsx`, `OTPInput.stories.tsx`
- `ReviewCard.stories.tsx`, `SearchInput.stories.tsx`, `SkeletonTemplates.stories.tsx`
- `Stepper.stories.tsx`, `TrackingCard.stories.tsx`, `MapCard.stories.tsx`, `MenuCard.stories.tsx`

### Test Coverage

Unit tests in `packages/ui/__tests__/`:
- `Button.test.tsx` / `.test.js`
- `Card.test.js`
- `Input.test.tsx` / `.test.js`
- `Skeleton.test.js`
- `LottieSuccessAnimation.test.js`
- `useFlow.test.tsx` / `.test.js`
- `FlowManager.test.js`
- `LoadingStates.test.tsx`

---

## Architecture Patterns

### Monorepo Structure

```
spicegarden/
├── package.json              # Root workspace config
├── apps/
│   ├── customer-web/         # Next.js PWA (port 3002)
│   ├── customer-mobile/      # Expo/React Native app
│   ├── restaurant-dashboard/ # Next.js KDS (port 3003)
│   ├── super-admin/          # Next.js Admin (port 3004)
│   └── launcher/             # Electron desktop launcher
├── packages/
│   ├── ui/                   # @spicegarden/ui shared components
│   └── api-types/            # @spicegarden/api-types shared types
└── infra/                    # Deployment scripts
```

### State Management

- **customer-web:** Redux Toolkit (auth + cart slices) + TanStack Query
- **restaurant-dashboard:** Redux Toolkit (placeholder dummy reducer)
- **super-admin:** Redux Toolkit (placeholder dummy reducer)
- **customer-mobile:** No Redux (uses local state + hooks)

### Real-time Communication

All web apps use `socket.io-client` connecting to backend at `http://localhost:3001`:
- **customer-web:** `useTracking` hook for driver location (`tracking:{driverId}` events)
- **restaurant-dashboard:** Socket for new orders (`newOrder`), inventory alerts (`inventoryAlert`)
- **super-admin:** Socket for platform stats (`statsUpdate`), global orders (`newOrderGlobal`), kitchen updates, heatmap, revenue

### Design Tokens

Shared via `@spicegarden/ui/tokens`:
- Colors: primary (#FF5A1F), secondary (#111827), background (#F9FAFB), surface (#FFFFFF), elevated (#F5F5F5), textPrimary (#111827), textSecondary (#6B7280), textInverse (#FFFFFF), success (#10B981), danger (#EF4444), warning (#F59E0B), premium (#D4AF37), border (#E5E7EB), dangerDark (#c62828), neutral (#9CA3AF)
- Spacing: xs (4), sm (8), md (16), lg (24), xl (32), xxl (48)
- Typography: fontFamily ('Inter'), headingXL/L/M/S, body, bodyMedium, caption, captionM, smallLabel
- Radii: sm (4), md (8), button (12), input (14), card (24), container (28), full (9999)
- Motion: micro (150ms), standard (300ms), page (450ms)
- Shadows: small, medium, large, premiumFloat
- Dark mode tokens supported
- Reduced motion context available

### Authentication

- Token stored in `localStorage` (`sg_token` / `sg_token:v1`)
- User data stored in `localStorage` (`sg_user`)
- Auth slice handles setCredentials/logout/refreshToken/updateUser
- API calls use Bearer token in Authorization header
- Demo token (`demo-token`) used for mock data fallback

### Error Handling

- Sentry integration across all web apps
- Error boundaries in `@spicegarden/ui` and per-app
- Middleware injects `x-request-id` for request tracing
- NetworkError component in LoadingStates for connection issues

### API Integration

- `@spicegarden/shared/constants` for `API_URL` and `SOCKET_URL`
- `@spicegarden/shared/api` for typed API clients (ordersApi, authApi)
- Mock API routes in `pages/api/` for development

---

## Environment Setup

1. Copy `.env.example` to `.env`
2. Generate secrets: `powershell -File infra/scripts/generate-secrets.ps1`
3. Start infrastructure: `docker-compose -f compose.dev.yaml up -d`
4. Run all dev servers: `npm run dev`

## Port Assignments

| App | Port |
|-----|------|
| customer-web | 3002 |
| restaurant-dashboard | 3003 |
| super-admin | 3004 |
| backend | 3001 |
| Grafana | 3000 |
| Prometheus | 9090 |
| OpenSearch | 9200 |

## Environment Variables

### .env Files by App

| App | Env Files |
|-----|-----------|
| **customer-web** | `.env.development.local`, `.env.staging.local`, `.env.production.local` |
| **restaurant-dashboard** | `.env.development.local`, `.env.staging.local`, `.env.production.local` |
| **super-admin** | `.env.development.local`, `.env.staging.local`, `.env.production.local` |
| **customer-mobile** | Uses `globalThis.process.env` (Expo managed) |

### Key Environment Variables

| Variable | Used By | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | All web apps | Backend API base URL (default: `http://localhost:3001/api`) |
| `NEXT_PUBLIC_SOCKET_URL` | All web apps | Socket.io server URL (default: `http://localhost:3001`) |
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT` | All web apps | Analytics tracking endpoint (default: `/api/analytics`) |
| `NEXT_PUBLIC_SENTRY_DSN` | restaurant-dashboard, super-admin | Sentry error tracking DSN |
| `API_URL` | customer-mobile | Mobile API base URL |
| `SOCKET_URL` | customer-mobile | Mobile Socket.io URL |
| `NODE_ENV` | All apps | Environment mode (development/staging/production) |

### URL Resolution Logic

Both web and mobile apps fall back to sensible defaults:
- **Development:** `http://localhost:3001`
- **Production:** `https://api.spicegarden.com`

---

## Testing Infrastructure

### Jest Configurations

| App | Config File | Environment |
|-----|-------------|-------------|
| **customer-web** | `jest.config.js` | `jest-environment-jsdom` (via next/jest) |
| **customer-mobile** | `jest.config.js` + `jest.config.simple.js` | Default (node) |
| **restaurant-dashboard** | `jest.config.js` | Default |
| **super-admin** | `jest.config.js` | Default |
| **backend** | `jest.config.js` | Default |

### E2E Test Files

| File | Framework | Scope |
|------|-----------|-------|
| `apps/customer-mobile/e2e/App.e2e.test.js` | **Detox** | Mobile app launch, auth flow, navigation, offline state, cart operations, restaurant browsing |
| `apps/restaurant-dashboard/__tests__/e2e/kitchen-flow.test.ts` | **Jest + custom** | Kitchen order workflow |

### Detox E2E Test Coverage (Customer Mobile)

- App launch & welcome screen
- Authentication flow (login, register, validation)
- Navigation (home, cart, search)
- Offline state handling
- Cart operations
- Restaurant browsing & search

### Test Scripts

| App | Command |
|-----|---------|
| **customer-web** | `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`, `npm run test:all` |
| **restaurant-dashboard** | `npm run test:all` (echo placeholder) |
| **super-admin** | `npm run test:all` (echo placeholder) |
| **customer-mobile** | `npm run test:unit`, `npm run test:integration`, `npm run test:e2e` (all echo placeholders) |

---

## ESLint & Code Quality

### Root ESLint Config

**File:** `eslint.config.cjs` (flat config, ESLint 9+)

| Setting | Value |
|---------|-------|
| TypeScript parser | `@typescript-eslint/parser` |
| JSX support | ecmaFeatures: { jsx: true } |
| Globals | browser, node, jest, console, fetch, setTimeout, etc. |
| React version | detect |
| Ignored paths | node_modules, dist, build, coverage, .next, test files, *.js (globally) |

### Per-App ESLint Configs

| App | Config File |
|-----|-------------|
| **customer-web** | `eslint.config.js` |
| **customer-mobile** | `eslint.config.js` |
| **restaurant-dashboard** | `eslint.config.js` |
| **super-admin** | `eslint.config.js` |
| **launcher** | `eslint.config.js` |
| **delivery-partner** | `eslint.config.js` |

### Special ESLint Overrides

- `packages/shared/**/*.{ts,tsx}` — relaxed unused-vars and explicit-any rules
- `packages/ui/**/*.{ts,tsx}` — relaxed hooks and prop-types rules
- Backend entry files — relaxed no-var-requires
- `*.js` files globally ignored in root config

---

## Internationalization (i18n)

### Customer Mobile i18n System

**File:** `apps/customer-mobile/src/constants/i18n.ts`

| Feature | Details |
|---------|---------|
| Supported locales | `en-IN`, `hi`, `pa`, `mr`, `gu`, `ta`, `te` (7 Indian languages) |
| Context | `LocaleProvider` + `useLocale()` hook |
| Currency formatting | `formatLocalizedCurrency()` — INR via `Intl.NumberFormat` |
| Date formatting | `formatLocalizedDate()` — locale-aware short date |
| Time formatting | `formatLocalizedTime()` — locale-aware 12/24hr time |

### Mobile Strings System

**File:** `apps/customer-mobile/src/constants/strings.ts`

Organized string constants by domain:
- `orderHistory` — loading, empty, error, retry, status labels, reorder
- `cart` — title, empty state, checkout, alerts, sign-in prompts
- `accessibility` — ARIA labels for all interactive elements
- `navigation` — route name constants

---

## PWA Configuration (Customer Web)

### Web App Manifest

**File:** `apps/customer-web/public/manifest.json`

| Property | Value |
|----------|-------|
| Name | "SpiceGarden - Food Delivery" |
| Short name | "SpiceGarden" |
| Display | standalone |
| Background | #F9FAFB |
| Theme | #FF5A1F (primary orange) |
| Icons | 7 sizes: 72x72 through 512x512 PNG |

### Public Assets

| Path | Purpose |
|------|---------|
| `apps/customer-web/public/icons/.gitkeep` | PWA icon directory placeholder |
| `apps/customer-web/public/manifest.json` | PWA manifest for installability |

---

## UX Design System Documentation

### UX Phase 1 Plan (`UX_PHASE_1_Figma_Architecture_PLAN.md`)

Planned design system architecture covering 14 specification documents:

| # | Document | Content |
|---|----------|---------|
| 1 | `00_overview.md` | UX goals, principles, accessibility + performance targets |
| 2 | `01_figma_workspace_structure.md` | Figma project folders, file naming, pages convention |
| 3 | `02_design_system.md` | Color tokens (light + dark), typography (Inter + Poppins + Roboto Mono), 8px spacing, border radius, shadow system, semantic token mapping |
| 4 | `03_motion_design_system.md` | Timing (Micro 150–200ms, Standard 250–350ms, Page 400–500ms), easing presets, motion recipes for landing/checkout/cart/tracking/loading |
| 5 | `04_customer_journey.md` | First-time user journey, reorder, scheduled orders, subscription upsell, coupon failures |
| 6 | `05_customer_app_information_architecture.md` | Bottom nav: Home, Search, Orders, Subscription, Profile |
| 7 | `06_customer_app_screen_architecture.md` | Screen taxonomy: Auth (12+), Home (15+), Search (10), Menu (20+), Cart (12), Tracking (10+), Profile (15) |
| 8 | `07_delivery_partner_screen_architecture.md` | Delivery partner screens (40+), accept/reject, GPS nav, proof of delivery |
| 9 | `08_restaurant_dashboard_screen_architecture.md` | Kitchen workflow, menu management, inventory sync, analytics |
| 10 | `09_admin_panel_screen_architecture.md` | Admin dashboard, promotions, analytics, disputes, fraud detection |
| 11 | `10_landing_pages.md` | Customer conversion + Admin/Restaurant landing pages |
| 12 | `11_component_library_spec.md` | 10 component specs: Buttons, Cards, Modals/Sheets, Inputs, OTP, Toast, Food/Menu cards, Map cards, Tracking cards, Review cards, Skeleton/loading |
| 13 | `12_developer_handoff_checklist.md` | Token handoff, prop naming, screen spec formatting, pixel-perfect requirements |
| 14 | `UX_PHASE_1_TODO.md` | Progress tracker |

**Target:** 100–150 screen inventory, design tokens, motion system, component library, clickable prototype plan, developer handoff checklist.

### UX Phase 2 Complete (`ux/phase-2/PHASE_2_COMPLETE.md`)

All priority flows implemented:

| Domain | Features | Status |
|--------|----------|--------|
| **Customer Web** | Auth, Home/Search, Restaurant/Menu, Cart/Checkout, Tracking, Profile/Orders | ✅ Complete |
| **Mobile App** | App open, order food, track order, pay, reorder | ✅ Complete |
| **KDS Dashboard** | Real-time order queue, sound alerts, delay flags, prep timers, bulk handling | ✅ Complete |
| **Driver App** | Accept, navigate, pickup, deliver, earnings | ✅ Complete |

**Deferred to future phases:**
- Social login (Google/Facebook)
- Item customization / special instructions / menu images
- Advanced address/payment management
- Notification preferences
- Push notifications for order updates

---

## Navigation Architecture

### Customer Mobile Navigation Structure

**File:** `apps/customer-mobile/App.tsx`

```
RootStackNavigator (headerShown: false)
├── Auth Screen (unauthenticated)
├── Main Tab Navigator (authenticated)
│   ├── Home Tab → HomeScreen (🏠)
│   ├── Search Tab → HomeScreen (🔍)  // same component, different view
│   ├── Cart Tab → CartScreen (🛒)
│   └── Profile Tab → ProfileScreen (👤)
├── Tracking Screen (standalone, from any tab)
└── OrderDetails Screen → HistoryScreen (standalone)
```

**Note:** Search tab reuses `HomeScreen` component (not a separate screen).

### Customer Web Navigation

Bottom tab navigation implemented inline in each page:
- Home (`/`) → Search (`/search`) → Orders (`/history`) → Account (`/profile`)
- Additional routes: Menu, Cart, Checkout, Tracking, Wallet, Offers, Subscriptions, Notifications, Payment Methods, Addresses, Reset Password

### Restaurant Dashboard Navigation

Bottom tab navigation:
- Kitchen (🔥) → Inventory (📦)

### Super Admin Navigation

Sidebar navigation:
- Dashboard (📊) → Live Orders (🛵) → Kitchen Monitor (🏪) → Support & Security (🛡️)

---

## Additional Configuration

### Next.js Config (all web apps)

All three Next.js apps share identical config pattern:

```javascript
// next.config.js (customer-web, restaurant-dashboard, super-admin)
{
  transpilePackages: ['@spicegarden/ui', ...],
  experimental: { externalDir: true },
  turbopack: {},
  webpack: (config) => config,
}
```

### Middleware (customer-web only)

**File:** `apps/customer-web/src/middleware.ts`

- Injects `x-request-id` header (UUID) on all non-API requests
- Matcher: `/((?!api|_next/static|_next/image|favicon.ico).*)`

---

## Analytics & Telemetry

### Analytics System

**Source:** `packages/ui/analytics.ts` + `apps/customer-web/src/analytics.ts`

| Export | Purpose |
|--------|---------|
| `trackEvent(event)` | Fire-and-forget analytics POST to `/api/analytics` |
| `useAnalytics()` | Auto-track `page_view` on mount |
| `useWebVitals()` | Track LCP, FID, CLS via PerformanceObserver |
| `useFlow(...)` | Track multi-step flow progress (started, step_completed, completed, error) |

**Tracked Event Types:**
`page_view`, `click`, `order_placed`, `payment_success`, `payment_failed`, `search`, `add_to_cart`, `web_vital`, `flow_started`, `flow_step_completed`, `flow_completed`, `flow_error`, `navigation_change`

### Sentry Error Tracking

| App | Sentry Integration |
|-----|-------------------|
| **customer-web** | `ErrorBoundary.tsx` + `@sentry/nextjs` types |
| **restaurant-dashboard** | `Sentry.init()` in `_app.tsx` + `Sentry.ErrorBoundary` |
| **super-admin** | `Sentry.init()` in `_app.tsx` + `Sentry.ErrorBoundary` |

All use `@sentry/nextjs` with `traceSampleRate: 0.0` and `profilesSampleRate: 0.0` (disabled in dev, enabled via env in production).
