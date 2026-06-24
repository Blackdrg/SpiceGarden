# Clients Diagnostic

**Generated:** 2026-06-24  
**Purpose:** Frontend and mobile application analysis

## Customer Web (apps/customer-web)

| Attribute | Value |
|-----------|-------|
| Type | Next.js Web Application |
| Port | 3002 |
| Stack | React 19, TypeScript, Redux Toolkit, TanStack Query, Socket.IO Client |
| Status | Implemented, runtime-unverified |

### Routes / Pages

| Route | File | Status |
|-------|------|--------|
| `/` | index.tsx | Implemented |
| `/auth` | auth.tsx | Implemented |
| `/auth/callback` | auth/callback.tsx | Implemented |
| `/cart` | cart.tsx | Implemented |
| `/checkout` | checkout.tsx | Implemented |
| `/wallet` | wallet.tsx | Implemented |
| `/subscriptions` | subscriptions.tsx | Implemented |
| `/menu` | menu.tsx | Implemented |
| `/search` | search.tsx | Implemented |
| `/restaurant` | restaurant.tsx | Implemented |
| `/profile` | profile.tsx | Implemented |
| `/offers` | offers.tsx | Implemented |
| `/notifications` | notifications.tsx | Implemented |
| `/history` | history.tsx | Implemented |
| `/tracking` | tracking.tsx | Implemented |
| `/payment-methods` | payment-methods.tsx | Implemented |
| `/addresses` | addresses.tsx | Implemented |
| `/reset-password` | reset-password.tsx | Implemented |
| `/legal/terms` | legal/terms.tsx | Implemented |
| `/legal/privacy` | legal/privacy.tsx | Implemented |

**Page Count: 21 pages**

### Integration Status
- API client: Configured via NEXT_PUBLIC_API_URL
- Real-time: Socket.IO client configured
- State management: Redux Toolkit + TanStack Query

## Restaurant Dashboard (apps/restaurant-dashboard)

| Attribute | Value |
|-----------|-------|
| Type | Next.js Web Application |
| Port | 3003 |
| Stack | React 19, Socket.IO Client |
| Status | Implemented, runtime-unverified |

### Pages
- `/` (index.tsx)
- `/onboarding` (multiple sub-pages)

**Page Count: ~2 pages**

## Super Admin (apps/super-admin)

| Attribute | Value |
|-----------|-------|
| Type | Next.js Web Application |
| Port | 3004 |
| Stack | React 19, Recharts, Sentry |
| Status | Implemented, runtime-unverified |

### Pages
- `/` (index.tsx)
- `/analytics`

**Page Count: 2 pages**

## Customer Mobile (apps/customer-mobile)

| Attribute | Value |
|-----------|-------|
| Type | Expo/React Native |
| Stack | React Navigation, TypeScript |
| Status | Implemented, runtime-unverified |

### Screens (14 total)

| Screen | File |
|--------|------|
| HomeScreen | HomeScreen.tsx |
| CartScreen | CartScreen.tsx |
| SearchScreen | SearchScreen.tsx |
| RestaurantScreen | RestaurantScreen.tsx |
| ProfileScreen | ProfileScreen.tsx |
| PaymentMethodsScreen | PaymentMethodsScreen.tsx |
| OnboardingScreen | OnboardingScreen.tsx |
| NotificationsScreen | NotificationsScreen.tsx |
| MenuItemCustomizationScreen | MenuItemCustomizationScreen.tsx |
| CheckoutScreen | CheckoutScreen.tsx |
| AddressesScreen | AddressesScreen.tsx |
| TrackingScreen | TrackingScreen.tsx |
| HistoryScreen | HistoryScreen.tsx |
| OrderDetailsScreen | OrderDetailsScreen.tsx |

### Services
- `location.service.ts` - Geolocation
- `order.service.ts` - Order management
- `websocket.service.ts` - Real-time
- `push-notification.service.ts` - Notifications

### Integration Status
- API client: Configured via api.ts
- WebSockets: Implemented
- Navigation: React Navigation configured

## Delivery Partner (apps/delivery-partner)

| Attribute | Value |
|-----------|-------|
| Type | Expo/React Native |
| Port | 3005 |
| Status | Implemented, runtime-unverified |

### Source Structure
- `App.tsx` - Main entry
- `src/services/delivery-api.service.ts` - API client
- `src/services/location.service.ts` - Geolocation
- `src/services/storage.service.ts` - Secure storage
- `android/` - Native Android build config

### Android Native
- Full Gradle build configuration present
- Debug keystore present
- Native resources (icons, splash screens) present

## Driver App (apps/driver-app)

| Attribute | Value |
|-----------|-------|
| Type | Stub |
| Status | Stubbed / placeholder |

- No package.json - not a buildable package
- Only App.tsx and App.js placeholder files

## Launcher (apps/launcher)

| Attribute | Value |
|-----------|-------|
| Type | Electron Desktop |
| Status | Implemented, runtime-unverified |

### Source Files
- Electron main process
- React frontend
- Webpack build configured

## Shared Packages

| Package | Purpose | Status |
|---------|---------|--------|
| ui | React components | Implemented |
| shared | Utilities | Implemented |
| api-types | API contracts | Implemented |
| proto | Protobuf types | Implemented |
| grpc-transport | gRPC client | **Stubbed / placeholder** - throws GrpcTransportUnavailableError |

## Stubbed / Partial Features

| Feature | Location | Status |
|---------|----------|--------|
| gRPC transport | `packages/grpc-transport/src/index.ts` | Stubbed (quarantined) |
| Driver app | `apps/driver-app/` | Stubbed (no package.json) |
| FCM/APNs | `.env.example` | Placeholders, not validated |
| Geolocation | `delivery-partner/src/services/location.service.ts` | Implemented but not device-validated |

## Runtime Gaps

| Gap | Required | Status |
|-----|----------|--------|
| Mobile native builds | Expo/EAS build | Blocked (no validation) |
| Mobile device testing | Physical/simulator | Blocked (no device access) |
| Web runtime | Backend API | Blocked (no Docker) |
| Real-time via WebSockets | Socket.IO server | Blocked (no Docker) |

## Build Status

| App | Build Script | Status |
|-----|------------|--------|
| customer-web | `next build` | Implemented, not verified |
| restaurant-dashboard | `next build` | Implemented, not verified |
| super-admin | `next build` | Implemented, not verified |
| customer-mobile | `expo build` | Implemented, not verified |
| delivery-partner | `expo build` | Implemented, not verified |
| launcher | `electron-builder` | Implemented, not verified |
| ui | `tsc` | Implemented, not verified |