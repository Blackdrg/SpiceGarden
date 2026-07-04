# SpiceGarden Mobile Audit Report

Generated: 2026-07-04
Evidence source: Direct inspection of apps/customer-mobile/ and apps/delivery-partner/

## 1. Customer Mobile Application

### 1.1 Overview
| Property | Value | Evidence |
|----------|-------|----------|
| Path | apps/customer-mobile | Directory listing |
| Framework | Expo SDK 56 | package.json |
| Language | TypeScript 5.9 | tsconfig.json |
| Navigation | React Navigation (NativeStack + BottomTabs) | App.tsx |
| Storage | AsyncStorage | src/constants/api.ts |
| Realtime | Socket.IO client | src/services/websocket.service.ts |
| Native | expo-location, expo-notifications, expo-haptics, expo-status-bar | package.json |
| Status | Partially Implemented | 15 screens, 6 test suites |

### 1.2 Screen Inventory

| Screen | File | Purpose |
|--------|------|---------|
| OnboardingScreen | src/screens/OnboardingScreen.tsx | Welcome/onboarding |
| AuthScreen | src/screens/AuthScreen.tsx | Login/Register with validation |
| HomeScreen | src/screens/HomeScreen.tsx | Restaurant list (hardcoded demo data) |
| SearchScreen | src/screens/SearchScreen.tsx | Search with filters |
| RestaurantScreen | src/screens/RestaurantScreen.tsx | Restaurant detail |
| MenuItemCustomizationScreen | src/screens/MenuItemCustomizationScreen.tsx | Item customization |
| CartScreen | src/screens/CartScreen.tsx | Cart management |
| CheckoutScreen | src/screens/CheckoutScreen.tsx | Checkout flow |
| OrderDetailsScreen | src/screens/OrderDetailsScreen.tsx | Order detail |
| TrackingScreen | src/screens/TrackingScreen.tsx | Live tracking |
| HistoryScreen | src/screens/HistoryScreen.tsx | Order history |
| ProfileScreen | src/screens/ProfileScreen.tsx | User profile |
| AddressesScreen | src/screens/AddressesScreen.tsx | Address management |
| PaymentMethodsScreen | src/screens/PaymentMethodsScreen.tsx | Payment methods |
| NotificationsScreen | src/screens/NotificationsScreen.tsx | Notifications |

### 1.3 Component Inventory

| Component | File | Purpose |
|-----------|------|---------|
| OrderCard | src/components/OrderCard.tsx | Order item display |
| OrderTabs | src/components/OrderTabs.tsx | Tab navigation for orders |
| OrderTimeline | src/components/OrderTimeline.tsx | Order progress timeline |
| SkeletonLoader | src/components/SkeletonLoader.tsx | Loading skeleton |
| LoadingState | src/components/LoadingState.tsx | Generic loading state |
| EmptyState | src/components/EmptyState.tsx | Empty data display |

### 1.4 State Management
- **Local State**: useReducer + useState in screens
- **No Redux/Zustand**: State is local per screen or passed via navigation params
- **Persistent**: AsyncStorage for cart, orders cache, auth token

### 1.5 API Integration
- **Service Layer**: order.service.ts, location.service.ts, push-notification.service.ts, websocket.service.ts
- **Retry Logic**: fetchWithRetry() with exponential backoff (3 retries)
- **Caching**: Orders cached in AsyncStorage with 5-minute TTL
- **WebSocket**: WebSocketService class with reconnection, message queuing, ack mechanism, room subscriptions

### 1.6 Authentication
- **Token Storage**: AsyncStorage keys `sg_token`, `sg_user`
- **Login**: Direct fetch() to /auth/login or /auth/register
- **Device metadata**: deviceName: 'mobile', deviceType: 'mobile'
- **No route guards**: Navigation-based (Auth stack vs Main stack)

### 1.7 Error Handling
- Form validation: Email regex, password length check
- Error states: error string in component state, error banners
- Shake animation: Error-triggered visual feedback
- Network retry: Exponential backoff in order.service.ts

### 1.8 Test Coverage
| Suite | File | Tests | Status |
|-------|------|-------|--------|
| E2E Flow | __tests__/e2e-flow.test.js | 6 | ✅ PASS |
| App | __tests__/App.test.js | 2 | ✅ PASS |
| Auth Flow | __tests__/auth-flow.integration.test.js | 8 | ✅ PASS |
| Cart Screen | __tests__/screens/CartScreen.test.js | 4 | ✅ PASS |
| Navigation | __tests__/mobile-navigation.test.js | 2 | ✅ PASS |
| Home Screen | __tests__/screens/HomeScreen.test.js | 6 | ✅ PASS |

## 2. Delivery Partner Application

### 2.1 Overview
| Property | Value | Evidence |
|----------|-------|----------|
| Path | apps/delivery-partner | Directory listing |
| Framework | Expo SDK 56 | package.json |
| Language | TypeScript 5.9 | tsconfig.json |
| Storage | AsyncStorage | src/services/delivery-api.service.ts |
| Realtime | Socket.IO client | App.tsx |
| Native | expo-location, expo-status-bar | package.json |
| Status | Minimal Implementation | Monolithic App.tsx, 3 test suites |

### 2.2 Screen Inventory (Inline in App.tsx)

| Screen | Purpose |
|--------|---------|
| HomeScreen | Incoming orders, active delivery, progress tracker |
| EarningsScreen | Today's earnings, pending, bonus, performance stats |

### 2.3 Component Inventory (Inline)
- DetailRow, EarnRow, StatCard, DriverHeader, DriverStats, DriverTabBar

### 2.4 State Management
- **Local**: useReducer(appReducer, initial) - full app state
- **State includes**: isOnline, incomingOrder, activeDelivery, earnings, shift, deliveryOtp, log, activeScreen, locationPermission
- **No external state management**

### 2.5 API Integration
- **Service Layer**: delivery-api.service.ts - DeliveryApiService class
- **Methods**: login, registerDriver, getProfile, updateLocation, toggleOnline, getEarnings, acceptOrder, rejectOrder, updateOrderStatus, verifyOTP, reportIssue
- **WebSocket**: connectWebSocket() - listens for orderAssigned, orderCancelled
- **Token Storage**: AsyncStorage (driver_token, driver_id, sg_driver_data)

### 2.6 Authentication
- **Token-based**: Bearer token stored in AsyncStorage
- **Login**: /api/auth/login → stores token + driverId
- **Logout**: Clears AsyncStorage + disconnects WebSocket

### 2.7 Error Handling
- Error states: otpError string, log array for activity tracking
- Alert dialogs: Alert.alert() for confirmations
- Location permission handling: granted/denied/pending states

### 2.8 Test Coverage
| Suite | File | Tests | Status |
|-------|------|-------|--------|
| Delivery API | src/services/__tests/delivery-api.service.test.ts | 2 | ✅ PASS |
| Delivery Flow | src/services/__tests/delivery-flow.e2e.test.ts | 2 | ✅ PASS |
| Storage | src/services/__tests/storage.integration.test.ts | 2 | ✅ PASS |

## 3. Mobile Cross-Cutting Concerns

### 3.1 Shared UI System
- Both apps use DESIGN_TOKENS from @spicegarden/ui
- No direct component imports from @spicegarden/ui (only tokens)

### 3.2 Realtime
- Socket.IO client for WebSocket communication
- Reconnection logic built into WebSocketService

### 3.3 Offline Support
- AsyncStorage caching
- Order cache with TTL
- No offline queue (unlike customer-web)

### 3.4 Native Features
- expo-location: GPS tracking for drivers
- expo-notifications: Push notifications
- expo-haptics: Haptic feedback
- expo-status-bar: Status bar management

## 4. Mobile Gaps

| Gap | Severity | Evidence |
|-----|----------|----------|
| No navigation library in delivery-partner | Medium | App.tsx uses inline tab-based UI |
| No offline queue | Medium | Unlike customer-web |
| No push notification implementation | Medium | expo-notifications installed but not implemented |
| No camera integration | Low | No camera usage detected |
| No maps integration | Medium | ETA shown but no native maps |
| Hardcoded demo data in customer-mobile | Medium | HomeScreen.tsx |
| Monolithic App.tsx (delivery-partner) | Medium | 871 lines inline component |
| No biometric auth | Low | No fingerprint/face ID |