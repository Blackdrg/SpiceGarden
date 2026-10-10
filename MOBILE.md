# Mobile Documentation

SpiceGarden includes two React Native mobile applications built with Expo, targeting both iOS and Android platforms.

---

## Customer Mobile (`@spicegarden/customer-mobile`)

**Framework:** Expo 56.0.12, React Native 0.85.3, React 19.2.7  
**Package Name:** `@spicegarden/customer-mobile`

### Screens

| Screen | File | Purpose |
|--------|------|---------|
| Home | `HomeScreen.tsx` | Restaurant discovery and browsing |
| Search | `SearchScreen.tsx` | Search restaurants and menu items |
| Restaurant | `RestaurantScreen.tsx` | Restaurant details and menu |
| Menu Item Customization | `MenuItemCustomizationScreen.tsx` | Customize orders (addons, variants) |
| Cart | `CartScreen.tsx` | Shopping cart |
| Checkout | `CheckoutScreen.tsx` | Payment and delivery selection |
| Order Details | `OrderDetailsScreen.tsx` | Order tracking and details |
| Tracking | `TrackingScreen.tsx` | Real-time delivery tracking |
| History | `HistoryScreen.tsx` | Past orders |
| Profile | `ProfileScreen.tsx` | User profile management |
| Addresses | `AddressesScreen.tsx` | Address book |
| Payment Methods | `PaymentMethodsScreen.tsx` | Saved payment methods |
| Notifications | `NotificationsScreen.tsx` | In-app notification history |
| Onboarding | `OnboardingScreen.tsx` | App onboarding flow |
| Auth | `AuthScreen.tsx` | Login/Register |

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `OrderCard` | `components/OrderCard.tsx` | Order list item |
| `OrderTabs` | `components/OrderTabs.tsx` | Order status tabs |
| `LoadingState` | `components/LoadingState.tsx` | Loading indicator |
| `EmptyState` | `components/EmptyState.tsx` | Empty state placeholder |
| `SkeletonLoader` | `components/SkeletonLoader.tsx` | Skeleton loading UI |
| `OrderTimeline` | `components/OrderTimeline.tsx` | Order progress timeline |

### Navigation

- **React Navigation 6:** `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`
- Bottom tabs for main navigation (Home, Search, Cart, Profile)
- Stack navigation for detail screens

### Architecture

```
src/
├── screens/          # React components for each screen
├── components/       # Reusable UI components
├── navigation/       # Navigation configuration (if present)
├── contexts/         # React contexts (if present)
├── hooks/            # Custom hooks (if present)
├── services/         # API and external service clients
└── utils/            # Utility functions
```

### Offline Support

- **AsyncStorage** (`@react-native-async-storage/async-storage`): Local data persistence
- Offline detection via `NetworkStatusContext` (from shared packages)

### Notifications

- **Expo Notifications** (`expo-notifications`): Push notification handling
- **FCM:** Firebase Cloud Messaging for Android
- **APNs:** Apple Push Notification Service for iOS
- Notification preferences synced with backend via `/notification-preferences` API

### GPS and Location

- **Expo Location** (`expo-location`): Device location tracking
- Used for finding nearby restaurants and real-time delivery tracking
- Background location updates for delivery status

### Background Tasks

- Expo Location for background location tracking
- Notification handling in background/foreground states

### Permissions

- Location permission (`expo-location`)
- Notification permission (`expo-notifications`)
- Camera/media (if applicable for image upload)

### API Communication

- REST API via `@spicegarden/shared/api`
- WebSocket via `socket.io-client` for real-time tracking
- Base URL from environment config

---

## Delivery Partner (`@spicegarden/delivery-partner`)

**Framework:** Expo 56.0.12, React Native 0.85.3, React 19.2.7  
**Package Name:** `@spicegarden/delivery-partner`

### Features

| Feature | Implementation |
|---------|---------------|
| Delivery Orders | Accept/reject order assignments |
| Navigation | Route guidance to pickup/delivery |
| OTP Verification | Verify order OTP at delivery |
| Status Updates | Update delivery status (picked up, delivered) |
| Earnings | View earnings and payout history |
| Shift Management | Start/end work shifts |
| Availability | Toggle online/offline status |
| Real-time Tracking | Location updates via WebSocket |

### Architecture

```
src/
├── screens/          # Delivery-specific screens
├── components/       # Shared UI components
├── services/         # Delivery API client
├── navigation/       # Navigation configuration
└── utils/            # Utilities
```

### GPS and Location

- **Expo Location:** Continuous location tracking during active deliveries
- Location sent to backend via `/drivers/:id/location` endpoint
- WebSocket for live location streaming

### Background Tasks

- Background location updates during active delivery shifts
- Notification handling for new order assignments

### Notifications

- **Socket.IO:** Real-time new order push notifications
- Push notifications for order assignments and status changes

### Permissions

- Location (foreground and background)
- Notifications (post notifications)

---

## Shared Mobile Patterns

### UI Library

Both apps use `@spicegarden/ui` for consistent design:
- Shared button, input, card, loading, and error components
- `DESIGN_TOKENS` for consistent spacing, colors, typography

### State Management

- **React Query** (`@tanstack/react-query`): Server state
- **Redux Toolkit:** Client state (where applicable)
- **Native state:** `useState`, `useReducer` for local UI state

### Authentication

- JWT-based auth via backend `/auth/login` and `/auth/refresh-token`
- Token stored in secure storage (AsyncStorage with encryption where possible)

### WebSocket Integration

- `socket.io-client` for real-time updates
- Connection management with auto-reconnect

### Build Commands

```bash
# Start development server
npx expo start

# Run on Android
expo start --android

# Run on iOS
expo start --ios

# Type check
tsc --noEmit

# Lint
eslint .
```

### Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```
