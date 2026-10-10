# Mobile Architecture

## Overview

SpiceGarden has 2 Expo React Native mobile apps for customer and delivery partner experiences.

**Source:** `apps/customer-mobile/`, `apps/delivery-partner/`

---

## Application Inventory

| App | Package | SDK | Purpose |
|-----|---------|-----|---------|
| Customer Mobile | `@spicegarden/customer-mobile` | Expo 56 | Customer ordering on mobile |
| Delivery Partner | `@spicegarden/delivery-partner` | Expo 56 | Driver delivery app |

---

## Customer Mobile (`@spicegarden/customer-mobile`)

### Configuration

**File:** `apps/customer-mobile/src/config.ts`

```typescript
const API_URL = getApiUrl()
// Env: NEXT_PUBLIC_API_URL || production: 'https://api.spicegarden.com' || dev: 'http://localhost:3001'
const SOCKET_URL = getSocketUrl()
// Same pattern as API_URL

export const config = {
  api: { baseUrl: API_URL },
  socket: { baseUrl: SOCKET_URL },
  env: NODE_ENV
}
```

**File:** `apps/customer-mobile/src/constants/api.ts`
```typescript
const API_BASE_URL = getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001')
const API_URL = `${API_BASE_URL}/api`
const SOCKET_URL = API_BASE_URL
```

### Screens (14 total)

**Navigation Types:**
```typescript
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Tracking: { orderId?: string };
  OrderDetails: { orderId: string };
  Checkout: { cartItems: CartItem[] };
  Address: undefined;
  Home: undefined;
};

type TabParamList = {
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Profile: undefined;
};
```

| Screen | File | Purpose |
|--------|------|---------|
| `HomeScreen` | `screens/HomeScreen.tsx` | Restaurant list (animated) |
| `SearchScreen` | `screens/SearchScreen.tsx` | Search + filters |
| `RestaurantScreen` | `screens/RestaurantScreen.tsx` | Menu with categories |
| `MenuItemCustomizationScreen` | `screens/MenuItemCustomizationScreen.tsx` | Item customization |
| `AuthScreen` | `screens/AuthScreen.tsx` | Login/Register |
| `OnboardingScreen` | `screens/OnboardingScreen.tsx` | Initial onboarding |
| `CartScreen` | `screens/CartScreen.tsx` | Cart management |
| `CheckoutScreen` | `screens/CheckoutScreen.tsx` | Checkout flow |
| `AddressesScreen` | `screens/AddressesScreen.tsx` | Address CRUD |
| `PaymentMethodsScreen` | `screens/PaymentMethodsScreen.tsx` | Payment methods CRUD |
| `NotificationsScreen` | `screens/NotificationsScreen.tsx` | Notification preferences |
| `ProfileScreen` | `screens/ProfileScreen.tsx` | User profile |
| `HistoryScreen` | `screens/HistoryScreen.tsx` | Order history |
| `OrderDetailsScreen` | `screens/OrderDetailsScreen.tsx` | Order details |
| `TrackingScreen` | `screens/TrackingScreen.tsx` | Live order tracking |

### State Management

No Redux. State managed via:

| Mechanism | Usage |
|-----------|-------|
| `useState`/`useReducer` | Per-screen local state |
| `@react-navigation/native-stack` | Navigation state |
| `@react-navigation/bottom-tabs` | Tab state |
| `AsyncStorage` | Token persistence (`sg_user`) |
| `@tanstack/react-query` | Server state (imported, usage inferred) |

**Storage Keys:**
- `driver_token` - Auth token
- `driver_id` - Driver ID (delivery-partner uses same pattern)

### Navigation

**File:** `apps/customer-mobile/src/navigation/types.ts`

```
RootStack:
├── Auth Screen
├── Main Tabs
│   ├── Home
│   ├── Search
│   ├── Cart
│   └── Profile
├── Tracking (orderId?)
├── OrderDetails (orderId)
├── Checkout (cartItems)
└── Address
```

### Socket.IO Usage

**File:** `apps/customer-mobile/src/services/websocket.service.ts`

```typescript
class WebSocketService {
  private socket: Socket | null = null;
  
  connect(token: string) {
    this.socket = io(BACKEND_URL, {
      transports: ['websocket'],
      auth: { token }  // Note: auth in handshake
    });
  }
  
  // Features:
  // - Auto-reconnect with exponential backoff (max 10 attempts, maxDelay 30s)
  // - Message queue for offline messages
  // - Acknowledgement protocol
  // - Room subscriptions
}
```

### Utility Services

| Service | File | Purpose |
|---------|------|---------|
| `location.service.ts` | Location tracking | GPS, geocoding |
| `push-notification.service.ts` | Push notifications | FCM/APNS handling |
| `order.service.ts` | Order operations | CRUD + status tracking |
| `currency.ts` | Currency formatting | INR formatting |
| `validation.ts` | Form validation | Input validation |
| `secure-storage.ts` | Secure storage | Encrypted AsyncStorage |
| `order.utils.ts` | Order helpers | Status formatting, calculations |
| `safe-parse.ts` | JSON parsing | Safe JSON parsing |

### Components

| Component | Purpose |
|-----------|---------|
| `OrderCard.tsx` | Order display card |
| `OrderTabs.tsx` | Order state tabs |
| `OrderTimeline.tsx` | Order progress timeline |
| `LoadingState.tsx` | Loading spinner |
| `EmptyState.tsx` | Empty state placeholder |
| `SkeletonLoader.tsx` | Skeleton loading |

### Shared Dependencies

| Package | Usage |
|---------|-------|
| `@spicegarden/ui` | Design system components |
| `@spicegarden/shared` | API client, constants |
| `@spicegarden/api-types` | TypeScript interfaces |

---

## Delivery Partner (`@spicegarden/delivery-partner`)

### Configuration

**File:** `apps/delivery-partner/src/@types/module-declarations.d.ts`
- Environment variable declarations for TypeScript

### API Client

**File:** `apps/delivery-partner/src/services/delivery-api.service.ts`

```typescript
class DeliveryApiService {
  private baseUrl = API_BASE_URL;  // From env
  
  // No Axios - uses native fetch() throughout
  
  async login(email, password)
  async getProfile()
  async updateLocation(lat, lng)
  async updateAvailability(isAvailable)
  async getEarnings()
  async acceptOrder(orderId)
  async rejectOrder(orderId, reason)
  async updateOrderStatus(orderId, status)
  async verifyOTP(orderId, otp)
  async reportIssue(orderId, issue)
}
```

**Storage:**
- `AsyncStorage` for `driver_token` and `driver_id`

### Socket.IO Usage

```typescript
// Line 283 in delivery-api.service.ts
this.socket = io(API_BASE_URL, {
  transports: ['websocket'],
  auth: { token }
});

// Events
socket.on('orderAssigned', handleOrderAssigned)
socket.on('orderCancelled', handleOrderCancelled)
socket.on('connect', ...)
socket.on('disconnect', ...)
```

### TypeScript Interfaces

From `@spicegarden/api-types`:
- `DriverProfile` - Driver identity data
- `DeliveryOrder` - Order with geolocation + status
- `EarningsSummary` - Financial summary
- `Location` - `{ lat, lng }`

### Source Files

| File | Purpose |
|------|---------|
| `services/delivery-api.service.ts` | Main API client (337 lines) |
| `services/location.service.ts` | Location tracking |
| `services/storage.service.ts` | AsyncStorage wrapper |

---

## Cross-Cutting Mobile Patterns

### HTTP Client

**No Axios in either mobile app.** Both use native `fetch()`:

```typescript
const response = await fetch(`${API_BASE_URL}/api/endpoint`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### Authentication Flow

1. User enters credentials
2. `POST /api/auth/login` returns `{ access_token, refresh_token, user }`
3. Token stored in `AsyncStorage` as `driver_token`
4. All subsequent requests include `Authorization: Bearer` header
5. On 401: clear storage, redirect to Auth screen

### Location Tracking

| Feature | Implementation |
|---------|---------------|
| GPS | `expo-location` |
| Background tracking | Expo location background task |
| Geofencing | Not implemented (future) |
| Socket updates | Real-time location via WebSocket |

### Push Notifications

| Platform | Service |
|----------|---------|
| Android | Firebase Cloud Messaging (FCM) |
| iOS | Apple Push Notification Service (APNS) |
| Handler | `push-notification.service.ts` |

### Offline Handling

| Strategy | Implementation |
|----------|---------------|
| Request queue | `useOfflineQueue` (customer-mobile) |
| Retry | Auto-flush when online |
| Storage | AsyncStorage for pending requests |

### Environment Matrix

| Environment | API URL | Socket URL |
|-------------|---------|------------|
| Development | `http://localhost:3001` | `http://localhost:3001` |
| Staging | `https://staging-api.spicegarden.com` | `https://staging-api.spicegarden.com` |
| Production | `https://api.spicegarden.com` | `https://api.spicegarden.com` |

### Build & Deploy

| Platform | Tool | Output |
|----------|------|--------|
| Development | `npx expo start` | Expo Go app |
| Android Production | EAS Build | `.apk` / `.aab` |
| iOS Production | EAS Build | `.ipa` |
