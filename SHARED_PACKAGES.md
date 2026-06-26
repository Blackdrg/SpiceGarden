# Shared Packages Reference

## Overview

SpiceGarden has 5 shared packages in the `packages/` directory, consumed by multiple apps.

**Source:** `packages/ui/`, `packages/shared/`, `packages/api-types/`, `packages/proto/`, `packages/grpc-transport/`

---

## Package Inventory

| Package | Location | Purpose |
|---------|----------|---------|
| `@spicegarden/ui` | `packages/ui/` | Design system (components, icons, tokens) |
| `@spicegarden/shared` | `packages/shared/` | Types, constants, API client |
| `@spicegarden/api-types` | `packages/api-types/` | TypeScript interfaces |
| `@spicegarden/proto` | `packages/proto/` | Protocol buffer definitions |
| `@spicegarden/grpc-transport` | `packages/grpc-transport/` | **QUARANTINED** - placeholder stub |

---

## Package: `@spicegarden/ui` (Design System)

**File:** `packages/ui/index.ts`

### Exported Components

| Component | Purpose |
|-----------|---------|
| `Button` | Primary action button |
| `Card` | Card container |
| `Input` | Text input field |
| `Dropdown` | Select dropdown |
| `Skeleton`, `SkeletonTemplates`, `SkeletonCard` | Loading placeholders |
| `LoadingStates` | Loading state components |
| `LottieSuccessAnimation` | Success animation |
| `Toast` | Notification toast |
| `Modal` | Modal dialog |
| `OTPInput` | OTP input field |
| `SearchInput` | Search input with icon |
| `Stepper` | Multi-step progress |
| `FlowManager` + `useFlow` | Form flow management |
| `ErrorBoundary` | Error boundary wrapper |
| `Cards` | Card composition helpers |

### Exported Utilities

| Export | File | Purpose |
|--------|------|---------|
| `DESIGN_TOKENS` | `tokens.ts` | Design system tokens |
| `DARK_MODE_TOKENS` | `tokens.ts` | Dark theme tokens |
| `MOTION_EASING` | `tokens.ts` | Animation easing functions |
| `ReducedMotionContext` | `contexts/` | Reduced motion detection |
| `useReducedMotion` | `hooks/` | Hook for motion preferences |
| `trackEvent` | `analytics/` | Analytics tracking |
| `useAnalytics` | `hooks/` | Analytics hook |
| `useWebVitals` | `hooks/` | Web vitals hook |
| `sentry` | `sentry/` | Sentry configuration |

### Design Tokens

**Colors:**
```typescript
{
  primary: '#FF5A1F',
  secondary: '#111827',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  premium: '#D4AF37',
  border: '#E5E7EB'
}
```

**Spacing:**
```typescript
{ xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 }
```

**Typography:**
```typescript
{
  fontFamily: string,
  headingXL, headingL, headingM, headingS,
  body, bodyMedium,
  caption, captionM,
  smallLabel
}
```

**Radius:**
```typescript
{ sm: 4, md: 8, button: 12, input: 14, card: 24, container: 28 }
```

**Motion:**
```typescript
{ micro: 150, standard: 300, page: 450 }  // milliseconds
```

### Icon Categories

| Category | Icons |
|----------|-------|
| System | `RatingIcon`, `NotificationIcon`, `LocationIcon` |
| Navigation | `HomeIcon`, `SearchIcon`, `ProfileIcon` |
| Kitchen | `KitchenIcon`, `FireIcon` |
| Delivery | `DeliveryIcon` |
| Commerce | `WalletIcon`, `PaymentIcon`, `OrderIcon`, `HealthyIcon`, `PizzaIcon` |
| Admin | `AdminIcons` |

### Tests & Stories

| File | Purpose |
|------|---------|
| `__tests__/Button.test.tsx` | Button component tests |
| `__tests__/Input.test.tsx` | Input component tests |
| `__tests__/ButtonRegression.test.tsx` | Regression tests |
| `__tests__/useFlow.test.tsx` | Flow hook tests |
| `__tests__/LoadingStates.test.tsx` | Loading state tests |
| `*.stories.tsx` | Storybook stories |

---

## Package: `@spicegarden/shared`

**File:** `packages/shared/index.ts`

```typescript
export * from './types';
export * from './constants';
export * from './api';
```

### Constants

**File:** `packages/shared/constants.ts`

```typescript
export const API_URL = 'http://localhost:3001';
export const SOCKET_URL = 'http://localhost:3001';
```

### Types

**File:** `packages/shared/types.ts`

```typescript
interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  deletedAt?: Date;
}

interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  status: OrderStatus;
  total: number;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  isActive: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface ApiError {
  message: string;
  statusCode: number;
}
```

### Analytics Types

**File:** `packages/shared/analytics.ts`

```typescript
type AnalyticsEvent =
  | 'page_view'
  | 'click'
  | 'order_placed'
  | 'payment_success'
  | 'payment_failed'
  | 'search'
  | 'add_to_cart'
  | 'web_vital'
  | 'flow_started'
  | 'flow_step_completed'
  | 'flow_completed'
  | 'flow_error'
  | 'navigation_change'
  | 'api_request_success'
  | 'api_request_queued'
  | 'offline_action_synced';
```

### API Client

**File:** `packages/shared/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Core function
async function api<T>(endpoint: string, options?: RequestInit): Promise<T>

// Named API modules
const authApi: {
  login(email, password): Promise<AuthResponse>
  register(data): Promise<AuthResponse>
  refreshToken(token): Promise<AuthResponse>
}

const restaurantsApi: {
  list(params?): Promise<Restaurant[]>
  get(id): Promise<Restaurant>
  search(query): Promise<Restaurant[]>
}

const ordersApi: {
  list(): Promise<Order[]>
  get(id): Promise<Order>
  create(data): Promise<Order>
  track(id): Promise<Order>
}

const menuApi: {
  list(): Promise<MenuItem[]>
  categories(): Promise<Category[]>
}
```

**Features:**
- Automatic token refresh on 401
- New `ApiClient` class available
- Base URL configurable via `NEXT_PUBLIC_API_URL`

---

## Package: `@spicegarden/api-types`

**File:** `packages/api-types/src/index.ts`

```typescript
interface DriverProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  licenseNumber?: string;
  vehicleNumber: string;
  vehicleType: string;
  kycStatus: string;
  isOnline: boolean;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
}

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  restaurantName: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  customerLat: number;
  customerLng: number;
  restaurantLat: number;
  restaurantLng: number;
  total: number;
  paymentMethod: string;
  items: OrderItem[];
}

interface EarningsSummary {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalDeliveries: number;
  todayDeliveries: number;
  averagePerDelivery: number;
}

interface Location {
  lat: number;
  lng: number;
}
```

---

## Package: `@spicegarden/proto`

**Purpose:** Protocol buffer definitions for gRPC communication

### Contents (inferred)
- Proto definition files (`.proto`)
- Generated TypeScript/gRPC stubs

### Status
- Package exists but may not be actively used
- gRPC transport is quarantined (see `packages/grpc-transport`)

---

## Package: `@spicegarden/grpc-transport`

### Status: QUARANTINED

**Purpose:** gRPC transport layer (placeholder)

**File:** `packages/grpc-transport/src/index.ts`

Throws `GrpcTransportUnavailableError` - not implemented.

### Why Quarantined
- No active usage in production code
- Placeholder implementation
- API communication uses REST + WebSocket, not gRPC

---

## Cross-Package Dependencies

```
apps/customer-web
├── @spicegarden/ui
├── @spicegarden/shared
└── @spicegarden/api-types

apps/restaurant-dashboard
├── @spicegarden/ui
└── @spicegarden/shared

apps/super-admin
├── @spicegarden/ui
├── @spicegarden/shared
└── @spicegarden/api-types

apps/customer-mobile
├── @spicegarden/ui
├── @spicegarden/shared
└── @spicegarden/api-types

apps/delivery-partner
└── @spicegarden/api-types
```

---

## Package Version Strategy

| Package | Versioning | Notes |
|---------|-----------|-------|
| `@spicegarden/ui` | Independent | Design system updates |
| `@spicegarden/shared` | Independent | API client, types |
| `@spicegarden/api-types` | Independent | Type definitions |
| `@spicegarden/proto` | Independent | Proto schemas |
| `@spicegarden/grpc-transport` | Independent | Quarantined |

All internal packages use workspace protocol (`workspace:*`).

---

## Transpilation

**Next.js apps require transpilation of internal packages:**

```javascript
// next.config.js
{
  transpilePackages: [
    '@spicegarden/ui',
    '@spicegarden/shared',
    '@spicegarden/api-types'
  ]
}
```

This is necessary because the packages contain JSX/TSX that Next.js needs to compile.
