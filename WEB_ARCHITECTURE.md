# Web Architecture

## Overview

SpiceGarden has 3 Next.js web applications serving different user personas.

**Source:** `apps/customer-web/`, `apps/restaurant-dashboard/`, `apps/super-admin/`

---

## Application Inventory

| App | Package | Port | Framework | Purpose |
|-----|---------|------|-----------|---------|
| Customer Web | `@spicegarden/customer-web` | 3002 | Next.js 15.5 + React 19.2 | Customer ordering interface |
| Restaurant Dashboard | `@spicegarden/restaurant-dashboard` | 3003 | Next.js 15.5 + React 19.2 | Kitchen & restaurant management |
| Super Admin | `@spicegarden/super-admin` | 3004 | Next.js 15.5 + React 19.2 | Platform administration |

---

## Customer Web (`@spicegarden/customer-web`)

### Configuration

**File:** `apps/customer-web/next.config.js`
- `transpilePackages`: `['@spicegarden/ui', '@spicegarden/shared']`
- `experimental.externalDir: true`
- Turbopack enabled
- `eslint.ignoreDuringBuilds: true`

### Provider Stack

**File:** `apps/customer-web/src/pages/_app.tsx`

```
Providers (outer → inner):
1. Redux Provider (store with auth + cart slices)
2. React Query Provider (QueryClient)
3. NetworkStatusProvider (online/offline detection)
4. ErrorBoundary (error catching)
```

### Custom Components

| Component | File | Purpose |
|-----------|------|---------|
| `ProtectedRoute` | `components/ProtectedRoute.tsx` | Auth guard for pages |
| `ErrorBoundary` | `components/ErrorBoundary.tsx` | Error catching wrapper |
| `OfflineIndicator` | `components/OfflineIndicator.tsx` | Network status banner |

### Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAuth` | `hooks/useAuth.ts` | Hydrate Redux auth from localStorage |
| `useOfflineQueue` | `hooks/useOfflineQueue.ts` | Queue requests when offline |
| `useTracking` | `hooks/useTracking.ts` | Socket.IO driver tracking |
| `useAddresses` | `hooks/useAddresses.ts` | Address CRUD (React Query) |
| `useNetworkStatus` | `hooks/useNetworkStatus.ts` | `navigator.onLine` tracking |
| `useMotion` | `hooks/useMotion.ts` | `prefersReducedMotion` media query |

### Analytics

**File:** `apps/customer-web/src/analytics/`
- `trackEvent()` - fires POST to `/api/analytics`
- Event types: `page_view`, `click`, `order_placed`, `payment_success`, `payment_failed`, `search`, `add_to_cart`, `web_vital`, `flow_*`, `navigation_change`

### Pages (24 total)

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | No | Homepage |
| `/search` | No | Restaurant/menu search |
| `/menu` | No | Menu browsing |
| `/restaurant` | No | Restaurant detail |
| `/cart` | No | Shopping cart |
| `/checkout` | Yes | Order checkout flow |
| `/auth` | No | Login/Register |
| `/auth/callback` | No | OAuth callback |
| `/profile` | Yes | User profile |
| `/history` | No | Order history |
| `/order-details` | Yes | Order detail |
| `/tracking` | Yes | Live order tracking |
| `/offers` | No | Promotions |
| `/wallet` | No | Wallet management |
| `/subscriptions` | Yes | Subscription management |
| `/notifications` | Yes | Notification center |
| `/addresses` | Yes | Address book |
| `/payment-methods` | Yes | Payment methods |
| `/reset-password` | No | Password reset (3-step) |
| `/legal/terms` | No | Terms of service |
| `/legal/privacy` | No | Privacy policy |

### State Management

**File:** `apps/customer-web/src/redux/store.ts`

```typescript
{
  auth: AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
  };
  cart: CartState {
    items: CartItem[];
    restaurantId: string | null;
  }
}
```

**Persistence:**
- Token: `localStorage` key `sg_token:v1`
- User: `localStorage` key `sg_user:v1`

### API Client

**Shared Package:** `packages/shared/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Core client with auto token refresh on 401
api<T>(endpoint, options)

// Named APIs
authApi: login, register, refreshToken
restaurantsApi: list, get, search
ordersApi: list, get, create, track
menuApi: list, categories
```

**Direct fetch pattern** (also used):
- `API_URL` from `@spicegarden/shared/constants`
- Manual `fetch()` with `Authorization: Bearer` header

### Socket.IO Usage

**File:** `apps/customer-web/src/hooks/useTracking.ts`

```typescript
const socket = io(SOCKET_URL, {
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});

// Events
socket.on(`tracking:${driverId}`, (data) => { ... })
socket.on('connect', ...)
socket.on('disconnect', ...)
socket.on('connect_error', ...)
```

---

## Restaurant Dashboard (`@spicegarden/restaurant-dashboard`)

### Configuration

**File:** `apps/restaurant-dashboard/next.config.js`
- Same transpilePackages pattern
- `experimental.externalDir: true`

### Provider Stack

- Redux store (dummy reducer - structure only)
- `ErrorBoundary`
- Sentry (`@sentry/nextjs`)

### State Management

All state in `useReducer(dashboardReducer, createInitialState)`:

```typescript
interface DashboardState {
  orders: Order[];
  batchMode: boolean;
  inventory: InventoryItem[];
  activeTab: string;
  audioEnabled: boolean;
  activeSounds: string[];
  lastAction: string;
}
```

### Pages (8 total)

| Route | Purpose |
|-------|---------|
| `/` | Kitchen Display System (KDS) - main dashboard |
| `/onboarding` | Onboarding landing |
| `/onboarding/business` | Step 1 |
| `/onboarding/gst` | Step 2 |
| `/onboarding/payout` | Step 3 |
| `/onboarding/documents` | Step 4 |
| `/onboarding/pricing` | Step 5 |
| `/onboarding/menu` | Step 6 |

### Socket.IO Usage

```typescript
const socket = io('http://localhost:3001', {
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});

// Events
socket.on('newOrder', handleNewOrder)
socket.on('inventoryAlert', handleInventoryAlert)
```

---

## Super Admin (`@spicegarden/super-admin`)

### Provider Stack

- Redux store (dummy reducer - structure only)
- `ErrorBoundary`
- `QueryClientProvider` (React Query)
- Sentry (`@sentry/nextjs`)

### State Management

```typescript
interface AdminDashboardState {
  stats: Stats;
  liveOrders: LiveOrder[];
  branches: BranchStatus[];
  tickets: DisputeTicket[];
  revenueData: Record<string, unknown>[];
  heatmapData: HeatmapPoint[];
  selectedTab: AdminTab;
  ticketFilter: TicketFilter;
  clientNow: number;
}
```

### Pages (15 total)

| Route | Purpose |
|-------|---------|
| `/` | Admin dashboard (Overview, Orders, Branches, Support tabs) |
| `/analytics` | Analytics overview |
| `/analytics/customers` | Customer analytics |
| `/analytics/top-dishes` | Top dishes analytics |
| `/driver-fleet/overview` | Fleet overview |
| `/driver-fleet/penalties` | Driver penalties |
| `/driver-fleet/shifts` | Driver shifts |
| `/driver-fleet/incentives` | Driver incentives |
| `/driver-fleet/earnings` | Driver earnings |
| `/loyalty` | Loyalty overview |
| `/loyalty/referrals` | Referrals management |
| `/loyalty/coupons` | Coupons management |

### Socket.IO Usage

```typescript
// Dynamic import
import('socket.io-client').then(({ io }) => ...)

const socket = io('http://localhost:3001', {
  path: '/socket.io/'
});

// Events
socket.on('statsUpdate', ...)
socket.on('newOrderGlobal', ...)
socket.on('kitchenUpdate', ...)
socket.on('deliveryHeatmap', ...)
socket.on('revenueUpdate', ...)
```

### Charts

- `recharts` library for data visualization
- `RevenueChart`, `OrdersCharts` components
- KPI cards with real-time updates

### Components

| Component | Purpose |
|-----------|---------|
| `OverviewTab`, `OrdersTab`, `BranchesTab`, `SupportTab` | Dashboard panels |
| `KPICard`, `DashboardCard`, `AdminButton` | Shared primitives |
| `RevenueChart`, `OrdersCharts` | Chart visualizations |
| `FraudDetection`, `RefundManagement`, `SupportTicketsPanel` | Specialized panels |

---

## Cross-Cutting Web Patterns

### HTTP Client

**No Axios used anywhere.** All apps use native `fetch()`:

```typescript
// Pattern used across all web apps
const response = await fetch(`${API_URL}/endpoint`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Environment Variables

| Variable | Consumer | Default |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | All web apps | `http://localhost:3001` |
| `NEXT_PUBLIC_SOCKET_URL` | Customer web | `http://localhost:3001` |

### Shared Design System

All three web apps import from `@spicegarden/ui`:
- Components: `Button`, `Card`, `Input`, `Modal`, `Toast`, `OTPInput`, `SearchInput`, `Stepper`
- Icons: `HomeIcon`, `SearchIcon`, `RatingIcon`, `NotificationIcon`, etc.
- Tokens: `DESIGN_TOKENS`, `DARK_MODE_TOKENS`
- Motion: `MOTION_EASING`, `useReducedMotion`

### Sentry Integration

- `customer-web`: Not integrated
- `restaurant-dashboard`: `@sentry/nextjs` in `_app.tsx`
- `super-admin`: `@sentry/nextjs` in `_app.tsx`
