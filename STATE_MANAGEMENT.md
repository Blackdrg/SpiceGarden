# State Management Reference

## Overview

SpiceGarden frontend uses different state management patterns per app, with Redux Toolkit in web apps and local state in mobile apps.

**Source:** Frontend app source files

---

## Customer Web (`@spicegarden/customer-web`)

### Stack: Redux Toolkit + React Query

#### Redux Store

**File:** `apps/customer-web/src/redux/store.ts`

```typescript
{
  auth: AuthState;
  cart: CartState;
}
```

#### Auth Slice

**File:** `apps/customer-web/src/redux/slices/authSlice.ts`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Actions
setCredentials({ user, token })
logout()
refreshToken()
updateUser(user)
```

**Persistence:**
- Token: `localStorage` key `sg_token:v1`
- User: `localStorage` key `sg_user:v1`

#### Cart Slice

**File:** `apps/customer-web/src/redux/slices/cartSlice.ts`

```typescript
interface CartState {
  items: CartItem[];
  restaurantId: string | null;
}
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  customization?: string;
  specialInstructions?: string;
}

// Actions
addToCart(item)       // Clears cart if different restaurant
removeFromCart(id)
updateQuantity({ id, quantity })
clearCart()
```

**Business Rule:** Adding from different restaurant clears cart automatically.

#### React Query Usage

**File:** `packages/shared/api.ts`

```typescript
// Core client with auto-token refresh
api<T>(endpoint, options)

// Named APIs
authApi: login, register, refreshToken
restaurantsApi: list, get, search
ordersApi: list, get, create, track
menuApi: list, categories
```

**Used in pages:**
- `history.tsx`: `useQuery` for orders list
- `order-details.tsx`: `useQuery` for single order
- `notifications.tsx`: `useQuery` for notifications
- `payment-methods.tsx`: `useQuery` for payment methods
- `addresses.tsx`: `useQuery` for addresses
- `tracking.tsx`: `useQuery` + Socket.IO for live tracking

#### Network Status

**File:** `apps/customer-web/src/contexts/NetworkStatusContext.tsx`

```typescript
interface NetworkContextValue {
  isOnline: boolean;
  lastOnline: Date | null;
}

// Uses navigator.onLine + online/offline events
```

---

## Restaurant Dashboard (`@spicegarden/restaurant-dashboard`)

### Stack: useReducer (local state) + Socket.IO

#### Dashboard State

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

**Reducer:** `dashboardReducer` with `createInitialState`

**No persistent state management library** - all state in local reducer.

#### Socket.IO State

```typescript
// Real-time updates from server
socket.on('newOrder', (order) => {
  dispatch(addOrder(order));
});
socket.on('inventoryAlert', (alert) => {
  dispatch(addAlert(alert));
});
```

---

## Super Admin (`@spicegarden/super-admin`)

### Stack: useReducer (local state) + React Query

#### Admin Dashboard State

**File:** `apps/super-admin/src/components/types.ts`

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

**Reducer:** `adminDashboardReducer`

**Types defined:**
- `OrderStatus`, `ServiceType`, `LiveOrder`, `BranchStatus`
- `DisputeTicket`, `HeatmapPoint`, `Stats`
- `AdminTab`, `TicketFilter`

#### React Query Usage

```typescript
// Data fetching for analytics, stats, orders
const { data: stats } = useQuery({
  queryKey: ['admin-stats'],
  queryFn: () => fetch('/api/admin/stats').then(r => r.json())
});
```

#### Socket.IO State

```typescript
socket.on('statsUpdate', (data) => {
  dispatch(updateStats(data));
});
socket.on('newOrderGlobal', (order) => {
  dispatch(addGlobalOrder(order));
});
socket.on('kitchenUpdate', (data) => {
  dispatch(updateKitchen(data));
});
socket.on('deliveryHeatmap', (data) => {
  dispatch(updateHeatmap(data));
});
socket.on('revenueUpdate', (data) => {
  dispatch(updateRevenue(data));
});
```

---

## Mobile Apps (Customer + Delivery Partner)

### Stack: useState/useReducer (per-screen) + AsyncStorage

#### Customer Mobile

No global state management. Each screen manages its own state:

```typescript
// CartScreen.tsx
const [cartItems, setCartItems] = useState([]);
const [total, setTotal] = useState(0);

// CheckoutScreen.tsx
const [orderData, setOrderData] = useState(null);
```

**AsyncStorage for persistence:**
- `sg_user` - User data
- Auth token implicitly stored by shared mocks

#### Delivery Partner

**File:** `apps/delivery-partner/src/services/delivery-api.service.ts`

```typescript
class DeliveryApiService {
  private token: string | null = null;
  private driverId: string | null = null;
  
  // Load from AsyncStorage on init
  async init() {
    this.token = await AsyncStorage.getItem('driver_token');
    this.driverId = await AsyncStorage.getItem('driver_id');
  }
  
  // State maintained in class instance
}
```

---

## State Management Pattern Comparison

| App | Global Store | Server State | Local State | Persistence |
|-----|-------------|--------------|-------------|-------------|
| Customer Web | Redux Toolkit | React Query | useState/useReducer | localStorage |
| Restaurant Dashboard | None (useReducer) | fetch() + Socket | useReducer | Session only |
| Super Admin | None (useReducer) | React Query | useReducer | Session only |
| Customer Mobile | None | React Query (imported) | useState/useReducer | AsyncStorage |
| Delivery Partner | None | fetch() | Class instance | AsyncStorage |

---

## Offline Queue (Customer Web)

**File:** `apps/customer-web/src/hooks/useOfflineQueue.ts`

```typescript
// Queues requests when offline
// Auto-flushes when back online
// Used in search, cart, checkout flows
```

**Features:**
- Request queuing when `isOnline === false`
- Auto-retry on reconnection
- Queue priority (FIFO)

---

## Design System State

**Package:** `@spicegarden/ui`

```typescript
// Design tokens (static)
DESIGN_TOKENS: {
  colors: { primary: '#FF5A1F', secondary: '#111827', ... },
  spacing: { xs: 4, sm: 8, md: 16, ... },
  typography: { headingXL: ..., body: ..., ... },
  radius: { sm: 4, md: 8, ... },
  motion: { micro: 150, standard: 300, ... }
}

// Reduced motion context
const { prefersReducedMotion } = useReducedMotion();
```

---

## Socket.IO State Integration

| App | Socket Events | State Integration |
|-----|---------------|-------------------|
| Customer Web | `tracking:${driverId}`, `connect`, `disconnect` | useTracking hook → Redux update |
| Restaurant Dashboard | `newOrder`, `inventoryAlert` | Direct dispatch to useReducer |
| Super Admin | `statsUpdate`, `newOrderGlobal`, `kitchenUpdate`, `deliveryHeatmap`, `revenueUpdate` | Direct dispatch to useReducer |
| Customer Mobile | `orderAssigned`, `orderCancelled` | WebSocketService callbacks |
| Delivery Partner | `orderAssigned`, `orderCancelled` | DeliveryApiService callbacks |

---

## Analytics State

**File:** `apps/customer-web/src/analytics/` (imported in _app.tsx)

```typescript
trackEvent(event, properties?)
// Events: page_view, click, order_placed, payment_success,
//         payment_failed, search, add_to_cart, web_vital,
//         flow_started, flow_step_completed, flow_completed, flow_error,
//         navigation_change
```

**Backend endpoint:** `POST /api/analytics`

---

## Data Flow Patterns

### Customer Web
```
User Action
  → Redux dispatch (if cart/auth)
  → React Query mutation (if API call)
  → fetch() via @spicegarden/shared/api
  → Backend API
  → Response → React Query cache update
  → Redux state update (if needed)
```

### Restaurant Dashboard
```
WebSocket event
  → useReducer dispatch
  → State update
  → Component re-render
```

### Super Admin
```
Page load
  → React Query fetch
  → Cache population
  → Socket.IO for real-time
  → useReducer for UI state
```
