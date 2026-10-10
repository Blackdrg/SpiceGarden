# SpiceGarden Frontend and Mobile Documentation

**Version:** 0.0.0  
**Last Updated:** 2026-06-27

---

## Table of Contents

1. [Applications Overview](#applications-overview)
2. [Shared UI Library (`@spicegarden/ui`)](#shared-ui-library)
3. [Shared Package (`@spicegarden/shared`)](#shared-package)
4. [Customer Web Application](#customer-web)
5. [Restaurant Dashboard](#restaurant-dashboard)
6. [Super Admin](#super-admin)
7. [Customer Mobile](#customer-mobile)
8. [Delivery Partner](#delivery-partner)
9. [Launcher](#launcher)

---

## Applications Overview

| App | Framework | Router | Port | Status |
|-----|-----------|--------|------|--------|
| customer-web | Next.js 15 (Pages Router) | File-based | 3002 | 85% |
| restaurant-dashboard | Next.js 15 (Pages Router) | File-based | 3003 | 80% |
| super-admin | Next.js 15 (Pages Router) | File-based | 3004 | 78% |
| customer-mobile | Expo React Native (56) | React Navigation | N/A | 70% |
| delivery-partner | Expo React Native (56) | None (single screen) | N/A | 60% |
| launcher | Electron (39) | N/A | Desktop | 75% |

---

## Shared UI Library

**Package:** `@spicegarden/ui`  
**Path:** `packages/ui/`  
**Dependency:** `lucide-react`

### Components (22)
```
Button.tsx          # Styled button with variants
Card.tsx            # Card container
Cards.tsx           # Cards grid layout
Input.tsx           # Form input
Skeleton.tsx        # Loading placeholder
LoadingStates.tsx   # Loading state components
LottieSuccessAnimation.tsx  # Success animation
Toast.tsx           # Toast notification
Modal.tsx           # Modal dialog
SkeletonTemplates.tsx  # Skeleton patterns
OTPInput.tsx        # OTP input field
SearchInput.tsx     # Search input
Stepper.tsx         # Step navigation
ErrorBoundary.tsx   # React error boundary
FlowManager.tsx     # Multi-step flow manager
Dropdown.tsx        # Dropdown select
```

### Icons (50+)
- **Commerce (8):** Cart, CreditCard, Star, Heart, Package, ShoppingBag, Receipt, Tag
- **Delivery (1):** Truck
- **Kitchen (2):** ChefHat, Flame
- **Navigation (3):** Navigation, MapPin, Compass
- **System (3):** User, Bell, Settings, Home, Search, Menu, X, Plus, Minus, etc.
- **Admin (1):** Shield

### Support Files
- `index.ts` — barrel export
- `tokens.ts` — `DESIGN_TOKENS` (colors, spacing, typography, radius, motion, shadows, dark mode)
- `analytics.ts` — `trackEvent()`, `useAnalytics()`, `useWebVitals()` (LCP, FID, CLS)
- `useFlow.ts` — `useFlow` hook with analytics tracking

### Tests
- `Button.test.tsx`, `ButtonRegression.test.tsx`, `Input.test.tsx`, `useFlow.test.tsx`, `LoadingStates.test.tsx`

---

## Shared Package

**Package:** `@spicegarden/shared`  
**Path:** `packages/shared/`

### Files
```
index.ts           # Re-exports from ./types, ./constants, ./api
types.ts           # User, Order, Restaurant, MenuItem, AuthResponse, ApiError
constants.ts       # API_URL='http://localhost:3001', SOCKET_URL='http://localhost:3001'
api.ts             # Full API client factory with CSRF handling, auto-retry
analytics.ts       # AnalyticsEventType union (14 types), AnalyticsEvent interface
```

### API Client (`api.ts`)
- `api<T>()` — generic fetch with auto CSRF token, error handling
- `authApi` — login, register, refreshToken
- `restaurantsApi` — list, get, search
- `ordersApi` — list, get, create, track
- `menuApi` — list items, categories

### Tests
- `api.test.ts`, `constants.test.ts`

---

## Customer Web

**Framework:** Next.js 15 (Pages Router) + React 19  
**State:** Redux Toolkit (auth, cart) + React Query (addresses, notifications, payments, orders)  
**Realtime:** `socket.io-client` for live tracking  
**Port:** 3002

### Pages (21 routes)
| Page | Purpose | Auth |
|------|---------|------|
| `/` | Home, restaurant grid, categories, promo, bottom nav | Public |
| `/auth` | Login/Register form | Public |
| `/auth/callback` | OAuth callback | Public |
| `/reset-password` | 3-step password reset | Public |
| `/menu` | Menu with categories, local cart state | Public |
| `/cart` | Cart review | Public |
| `/checkout` | Address, payment, tip, promo, place order | Protected |
| `/tracking` | Live driver tracking via socket | Protected |
| `/history` | Order history, filter tabs, reorder | Protected |
| `/order-details` | Full order breakdown (SSR) | Protected |
| `/restaurant` | Restaurant page (hardcoded restaurantId) | Public |
| `/search` | Search with offline queue, filters | Public |
| `/profile` | Edit profile, logout | Protected |
| `/addresses` | CRUD addresses | Protected |
| `/payment-methods` | CRUD payment methods | Protected |
| `/wallet` | Balance, transactions | Protected |
| `/subscriptions` | Prime, meals | Protected |
| `/offers` | Promo codes, refer & earn | Public |
| `/notifications` | Notification preferences | Protected |
| `/legal/terms` | Terms | Public |
| `/legal/privacy` | Privacy policy | Public |

### Navigation
- Bottom tab nav (Home, Search, Cart/Orders, Profile) — implemented manually on each page
- Fixed-position `<nav>` with icon rows

### State Management
- **Redux Toolkit:** `authSlice` (setCredentials, logout, setUser), `cartSlice` (addToCart, removeFromCart, updateQuantity, clearCart)
- **React Query:** Addresses, notifications, payment methods
- **Context:** `NetworkStatusContext` (isOnline, lastOnline)

### Hooks
- `useAddresses` — CRUD via React Query
- `useMotion` — `prefers-reduced-motion`
- `useNetworkStatus` — `navigator.onLine` listeners
- `useOfflineQueue` — Request queue with retry
- `useTracking` — Socket.io driver tracking (useReducer)

### API Communication
- Direct `fetch()` + `@spicegarden/shared/api`
- Socket.io for real-time
- Credentials: `'include'` (cookies)

### Error Handling
- `ErrorBoundary` class component with Sentry
- `OfflineIndicator` component
- Next.js `_error.tsx`

### Sentry
- Client config: `sentry.client.config.ts`
- Server config: `sentry.config.ts`
- DSN from env, 5% traces/profiles

### Build Config
- `next.config.js` — transpiles `@spicegarden/ui`, `@spicegarden/shared`; turbopack enabled
- `middleware.ts` — Request ID injection via `x-request-id` header

---

## Restaurant Dashboard

**Framework:** Next.js 15 (Pages Router) + React 19  
**State:** `useReducer` + Redux (dummy)  
**Realtime:** `socket.io-client` for order/inventory updates  
**Port:** 3003

### Pages
| Page | Purpose | Auth |
|------|---------|------|
| `/` | KDS — Kitchen Display System | Public (internal) |
| `/onboarding` | 6-step restaurant onboarding | N/A |
| `/onboarding/business` | Step 1: Registration | N/A |
| `/onboarding/documents` | Step 2: Upload (stub) | N/A |
| `/onboarding/gst` | Step 3: GST config | N/A |
| `/onboarding/menu` | Step 4: Menu setup | N/A |
| `/onboarding/pricing` | Step 5: Pricing | N/A |
| `/onboarding/payout` | Step 6: Bank details | N/A |

### KDS Features
- Order lifecycle: new → accepted → preparing → ready → completed
- Batch mode grouping
- Inventory view with progress bars
- Sound alerts (base64 WAV)
- Order timer with DELAYED badge
- Socket.io events: `newOrder`, `inventoryAlert`

### State
- `useReducer` with `dashboardReducer` managing: orders, batchMode, inventory, activeTab, audioEnabled, activeSounds, lastAction

### API Routes
- `/api/orders` — mock orders
- `/api/inventory` — mock inventory

---

## Super Admin

**Framework:** Next.js 15 (Pages Router) + React 19  
**State:** `useReducer` + React Query  
**UI:** Recharts (AreaChart, BarChart)  
**Realtime:** `socket.io-client`  
**Port:** 3004

### Pages
| Page | Purpose |
|------|---------|
| `/` | Admin dashboard — Overview, Orders, Branches, Support |
| `/analytics` | Analytics overview — conversion, churn |
| `/analytics/customers` | Customer analytics — churn, repeat |
| `/analytics/top-dishes` | Top selling dishes table |
| `/driver-fleet/overview` | Driver fleet table — KYC, rating, deliveries |
| `/driver-fleet/incentives` | Incentives & bonuses (stub) |
| `/driver-fleet/penalties` | Penalty management |
| `/driver-fleet/earnings` | Earnings detail (stub) |
| `/driver-fleet/shifts` | Shift management (stub) |
| `/loyalty` | Loyalty dashboard (stub UI) |
| `/loyalty/coupons` | Coupons management (stub) |
| `/loyalty/referrals` | Referrals management (stub) |

### Dashboard Tabs
1. **Overview:** 6 KPI cards, revenue chart, live order feed, system alerts
2. **Live Orders:** Orders table, KPIs, status charts
3. **Branches:** Kitchen monitoring per branch
4. **Support & Security:** Tickets, refunds, fraud detection

### Socket Events
- `statsUpdate` — Dashboard stats
- `newOrderGlobal` — New order broadcast
- `kitchenUpdate` — Kitchen status
- `deliveryHeatmap` — Heatmap data
- `revenueUpdate` — Revenue streams

### Sentry
- Instrumentation via `@sentry/nextjs`
- `sentry.config.ts` server-side

---

## Customer Mobile

**Framework:** Expo React Native (56) + React Native Web  
**Navigation:** React Navigation (Native Stack + Bottom Tabs)  
**State:** Local state + AsyncStorage  
**Port:** N/A (Expo app)

### Screens (14)
| Screen | Purpose | Status |
|--------|---------|--------|
| `Auth` | Login/Register with animations | ✅ |
| `Onboarding` | 4-slide intro with Animated | ✅ |
| `Home` | Restaurant list, pull-to-refresh | ✅ |
| `Search` | Search with filters, skeleton | ✅ |
| `Cart` | Cart with haptics, secure storage | ✅ |
| `Checkout` | Address, payment, place order | ✅ |
| `History` | Order history, OrderCard, OrderTabs | ✅ |
| `Profile` | Profile management, logout | ✅ |
| `Addresses` | Saved addresses with location perm | ✅ |
| `PaymentMethods` | Card/UPI/Wallet | ✅ |
| `Notifications` | Push/Email/SMS toggles | ✅ |
| `MenuItemCustomization` | Add-ons, quantities, instructions | ✅ |
| `Restaurant` | Restaurant menu | ⚠️ Incomplete |
| `Tracking` | Order tracking | 🔴 Stub |

### Navigation Flow
- RootStack: Auth → Main → Tracking → OrderDetails → Checkout → Address
- Bottom Tabs: Home, Search, Cart, Profile
- Stack navigators for Checkout and Address

### Mobile Features
- `expo-location` — permission, current position, watch
- `expo-notifications` — register, schedule, response listeners
- `expo-haptics` — impact (Light/Medium/Heavy), notification (Success/Warning/Error), selection
- `AsyncStorage` — persistent auth, cart, addresses, orders
- `Animated` — fadeAnim, slideAnim, shakeAnim with Easing.quad
- 7-language i18n: en-IN, hi, pa, mr, gu, ta, te

### Services
- `location.service.ts` — expo-location wrapper
- `websocket.service.ts` — Socket.io with reconnect, queue, subscriptions
- `order.service.ts` — CRUD with retry, cache, reorder
- `push-notification.service.ts` — expo-notifications wrapper

### Hooks
- `useHaptics.ts` — haptic feedback wrapper
- `useOrderHistory.ts` — load, filter, paginate, refresh

---

## Delivery Partner

**Framework:** Expo React Native (56)  
**State:** useReducer + AsyncStorage  
**Port:** N/A

### Structure
- **Single file:** `App.tsx` (769 lines)
- Contains all screens, components, styles, and logic in one file

### Components (in-App.tsx)
- `DriverHeader` — Online/offline toggle, driver name, vehicle
- `DriverStats` — Today/pending/bonus earnings cards
- `DriverTabBar` — Home/Earnings tabs
- `HomeScreen` — Incoming orders, active delivery, issue reporting, activity log
- `EarningsScreen` — Today's earnings, stats grid, performance

### Features
- Incoming order card (reject/accept)
- 5-step delivery progress: assigned → pickup → drop → complete
- Navigation buttons (restaurant, customer)
- 6-digit OTP verification with auto-fill
- 6 issue types: road blocked, no response, battery low, food stuck, running late, wrong location
- Demo incoming order button (testing)
- Socket.io: `orderAssigned`, `orderCancelled`, location updates

### Services
- `delivery-api.service.ts` — Full API service class
- `location.service.ts` — expo-location wrapper
- `storage.service.ts` — AsyncStorage helpers

### State
- `AppState` / `AppAction` types
- `appReducer` state: isOnline, incomingOrder, activeDelivery, earnings, shift, deliveryOtp, log, etc.

---

## Launcher

**Framework:** Electron 39 + React (Webpack)  
**Platform:** Windows (NSIS installer)  
**Path:** `apps/launcher/`

### Structure
- `src/main/` — Electron main process TypeScript
- `src/renderer/` — React renderer (Webpack bundle)
- `src/assets/` — App assets

### Key Features
- `electron-store` — persistent settings
- `electron-updater` — auto-update mechanism
- `systeminformation` — system monitoring
- NSIS installer for Windows (ia32, portable)
- Auto-updates from configured feed
- App ID: `com.spicegarden.launcher`

### Build
- Main process: `tsc` to `dist/main/`
- Renderer: `webpack` with `ts-loader` + `css-loader` + `style-loader`
- Dev: `concurrently` runs main, renderer, electron with `wait-on`
