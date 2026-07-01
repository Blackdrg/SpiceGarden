# Frontend Documentation

SpiceGarden includes three Next.js web applications and two React Native mobile applications. All web apps share the `@spicegarden/ui` component library and follow consistent state management patterns.

---

## Customer Web (`@spicegarden/customer-web`)

**Port:** 3002  
**Framework:** Next.js 15.5.18, React 19.2.7  
**State:** Redux Toolkit + TanStack React Query  
**Deployment:** Docker + NGINX

### Pages / Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | `index.tsx` | Homepage, restaurant discovery |
| `/menu` | `menu.tsx` | Menu browsing |
| `/restaurant` | `restaurant.tsx` | Restaurant details |
| `/cart` | `cart.tsx` | Shopping cart |
| `/checkout` | `checkout.tsx` | Order checkout |
| `/payment-methods` | `payment-methods.tsx` | Payment method management |
| `/tracking` | `tracking.tsx` | Real-time order tracking |
| `/order-details` | `order-details.tsx` | Order history/details |
| `/profile` | `profile.tsx` | User profile |
| `/addresses` | `addresses.tsx` | Address management |
| `/wallet` | `wallet.tsx` | Wallet and transactions |
| `/history` | `history.tsx` | Order history |
| `/search` | `search.tsx` | Search |
| `/notifications` | `notifications.tsx` | Notifications |
| `/offers` | `offers.tsx` | Offers and promotions |
| `/subscriptions` | `subscriptions.tsx` | Subscriptions |
| `/auth` | `auth.tsx` | Login/Register |
| `/auth/callback` | `auth/callback.tsx` | Social auth callback |
| `/reset-password` | `reset-password.tsx` | Password reset |
| `/legal/terms` | `legal/terms.tsx` | Terms of service |
| `/legal/privacy` | `legal/privacy.tsx` | Privacy policy |

### State Management

- **Redux Toolkit** (client state): Auth (`authSlice`), Cart (`cartSlice`)
- **TanStack React Query** (server state): API data fetching, caching, background refetch
- **Context API**: `NetworkStatusProvider` for online/offline detection

### Architecture

```
src/
├── pages/           # Next.js Pages Router pages
├── components/      # Shared components (ProtectedRoute, ErrorBoundary, OfflineIndicator)
├── contexts/        # React contexts (NetworkStatusContext)
├── redux/           # Redux store and slices
│   ├── store.ts
│   └── slices/
│       ├── authSlice.ts
│       └── cartSlice.ts
├── styles/          # CSS modules
└── analytics/       # Analytics initialization
```

### API Communication

- Direct `fetch` calls via `@spicegarden/shared/api` client
- Environment: `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001`)
- WebSocket: `socket.io-client` for real-time updates
- Authentication: JWT token from Redux store or httpOnly cookies

### Authentication

- JWT access token (short-lived) + refresh token (long-lived, httpOnly cookie)
- Social login: Google, Facebook (OAuth2 redirect flow)
- Protected routes via `ProtectedRoute` component
- Session refresh handled automatically via Redux

### Error Handling

- `ErrorBoundary` component catches React errors
- Sentry integration (`@sentry/nextjs`) for error tracking
- `OfflineIndicator` for connectivity status
- Toast notifications via `@spicegarden/ui`

### Build Process

- **Framework:** Next.js with custom webpack config
- **Transpile:** `@spicegarden/ui`, `@spicegarden/shared`
- **Experimental:** `externalDir: true`, `turbopack`
- **Lint:** ESLint with Next.js plugin
- **Docker:** Multi-stage build in `infra/customer-web/Dockerfile`

---

## Restaurant Dashboard (`@spicegarden/restaurant-dashboard`)

**Port:** 3003  
**Framework:** Next.js 15.5.18, React 19.2.7  
**State:** Redux Toolkit + TanStack React Query  
**Features:** Kitchen Display System (KDS), order management, inventory tracking

### Pages / Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | `index.tsx` | Main dashboard (KDS + Inventory tabs) |

### Architecture

```
src/
├── pages/
│   ├── index.tsx        # Main KDS dashboard
│   ├── _app.tsx         # App wrapper
│   ├── _document.tsx    # Custom document
│   └── _error.tsx       # Error page
└── __tests__/           # Unit tests
```

### Key Features

- **Kitchen Display System (KDS):** Real-time order queue with status transitions (new → accepted → preparing → ready → pickedup → delivered)
- **Inventory Management:** Stock tracking with low-stock alerts
- **Batch Mode:** Accept multiple orders simultaneously
- **Audio Alerts:** New order notification sounds (toggleable)
- **Socket.IO:** Real-time updates for new orders and status changes
- **Reducer-based state:** `useReducer` with `AdminDashboardReducer` pattern

### State Management

- **Redux Toolkit:** Global state
- **TanStack React Query:** Server state
- **useReducer:** Complex local dashboard state

### API Communication

- `fetch` with `NEXT_PUBLIC_API_URL`
- Socket.IO client for real-time events: `connect`, `disconnect`, `statsUpdate`, `newOrderGlobal`, `kitchenUpdate`, `deliveryHeatmap`, `revenueUpdate`

---

## Super Admin (`@spicegarden/super-admin`)

**Port:** 3004  
**Framework:** Next.js 15.5.18, React 19.2.7  
**State:** Redux Toolkit + TanStack React Query  
**Features:** Platform analytics, dispute management, branch monitoring

### Pages / Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | `index.tsx` | Admin dashboard with multiple tabs |
| `/*` | `_app.tsx` | App wrapper |

### Architecture

```
src/
├── pages/
│   ├── index.tsx        # Admin dashboard (Overview, Orders, Branches, Support tabs)
│   └── _app.tsx         # App wrapper
└── components/          # Dashboard components (BranchesTab, OrdersTab, OverviewTab, SupportTab)
```

### Key Features

- **Overview Tab:** Stats, revenue data, branch status
- **Orders Tab:** Live order monitoring with WebSocket updates
- **Branches Tab:** Branch status management and heatmap
- **Support Tab:** Dispute and ticket management
- **Recharts:** Data visualization for revenue, orders, heatmap
- **Socket.IO:** Real-time `statsUpdate`, `newOrderGlobal`, `kitchenUpdate`, `deliveryHeatmap`, `revenueUpdate`

### State Management

- **Redux Toolkit:** Global state
- **TanStack React Query:** Server state
- **useReducer:** Complex dashboard state with `adminDashboardReducer`

### API Communication

- `fetch` with `NEXT_PUBLIC_API_URL`
- Socket.IO for real-time platform updates

---

## Shared Frontend Patterns

### Component Library (`@spicegarden/ui`)

Shared across all apps:
- Primitives: `Button`, `Input`, `Card`, `Modal`, `Toast`, `Stepper`, `OTPInput`, `SearchInput`, `Skeleton`
- Specialized: `FlowManager`, `LottieSuccessAnimation`, `LoadingStates`, `SkeletonTemplates`, `ErrorBoundary`
- Icons: `RatingIcon`, `NotificationIcon`, `LocationIcon`, `SearchIcon`, `ProfileIcon`, `DeliveryIcon`, `WalletIcon`, `PaymentIcon`, `OrderIcon`, `CartIcon`, `HealthyIcon`, `DessertIcon`, `DrinkIcon`, `BurgerIcon`, `PizzaIcon`
- Constants: `DESIGN_TOKENS`

### Authentication Pattern

```
1. User submits credentials
2. API returns { access_token, refresh_token, user }
3. Access token stored in Redux authSlice
4. Refresh token set as httpOnly cookie by backend
5. On 401, trigger silent refresh via /auth/refresh-token (cookie-based)
6. On logout, clear Redux state + backend revokes refresh token
```

### Error Handling Pattern

```
1. API error caught in service/component
2. Sentry captures error if DSN configured
3. Toast notification shown to user
4. Fallback UI rendered if recovery not possible
5. ErrorBoundary catches unhandled React errors
```

---

## Build and Deployment

| App | Dockerfile | Port | Replicas (Prod) |
|-----|-----------|------|----------------|
| customer-web | `infra/customer-web/Dockerfile` | 3002 | 2 |
| restaurant-dashboard | `infra/restaurant-dashboard/Dockerfile` | 3003 | 2 |
| super-admin | `infra/super-admin/Dockerfile` | 3004 | 1 |

All frontends:
- Health check: `curl -f http://localhost:3000/`
- Read-only filesystem in production
- `no-new-privileges` security option
- Proxied through NGINX in production
