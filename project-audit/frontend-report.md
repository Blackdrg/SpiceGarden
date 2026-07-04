# SpiceGarden Frontend Audit Report

Generated: 2026-07-04
Evidence source: Direct inspection of apps/customer-web/, apps/restaurant-dashboard/, apps/super-admin/

## 1. Customer Web Application

### 1.1 Overview
| Property | Value | Evidence |
|----------|-------|----------|
| Path | apps/customer-web | Directory listing |
| Framework | Next.js 15.5.19 | package.json |
| Language | TypeScript 5 | tsconfig.json |
| UI | React 19 + @spicegarden/ui | package.json, source imports |
| State | Redux Toolkit + React Query | src/redux/, src/pages/_app.tsx |
| Port | 3002 | next.config.js |
| Status | Partially Implemented | 21 pages, 3 test suites |

### 1.2 Route/Page Inventory

| Route | File | Method | Auth | Description |
|-------|------|--------|------|-------------|
| / | src/pages/index.tsx | GET | None | Home - restaurant list, categories, promo banner |
| /auth | src/pages/auth.tsx | GET | None | Login/Register with Google/Facebook OAuth |
| /auth/callback | src/pages/auth/callback.tsx | GET | None | OAuth callback handler |
| /search | src/pages/search.tsx | GET | None | Search with filters, offline queue |
| /restaurant | src/pages/restaurant.tsx | GET | None | Restaurant detail + menu |
| /menu | src/pages/menu.tsx | GET | None | Menu items with categories |
| /cart | src/pages/cart.tsx | GET | None | Cart with quantity controls, bill details |
| /checkout | src/pages/checkout.tsx | GET | None | Checkout with promo, address, tip |
| /order-details | src/pages/order-details.tsx | GET | None | Order detail view |
| /tracking | src/pages/tracking.tsx | GET | None | Live tracking via WebSocket |
| /history | src/pages/history.tsx | GET | None | Order history with filters |
| /profile | src/pages/profile.tsx | GET | None | Profile edit, account info, logout |
| /addresses | src/pages/addresses.tsx | GET | None | Address management |
| /payment-methods | src/pages/payment-methods.tsx | GET | None | Payment methods |
| /notifications | src/pages/notifications.tsx | GET | None | Notifications |
| /offers | src/pages/offers.tsx | GET | None | Offers |
| /subscriptions | src/pages/subscriptions.tsx | GET | None | Subscriptions |
| /wallet | src/pages/wallet.tsx | GET | None | Wallet |
| /reset-password | src/pages/reset-password.tsx | GET | None | Password reset |
| /legal/privacy | src/pages/legal/privacy.tsx | GET | None | Privacy policy |
| /legal/terms | src/pages/legal/terms.tsx | GET | None | Terms of service |

### 1.3 State Management
- **Redux Store**: authSlice (setCredentials, logout, setUser), cartSlice (addToCart, removeFromCart, updateQuantity, clearCart)
- **React Query**: Server state for addresses, restaurants
- **Local State**: useReducer in checkout, profile, search, history, order-details, tracking

### 1.4 API Integration
- Primary: `@tanstack/react-query` + `@spicegarden/shared/api`
- Direct fetch: `src/hooks/useAddresses.ts` uses raw `fetch()`
- Offline Queue: `src/hooks/useOfflineQueue.ts`

### 1.5 Error Handling
- Sentry `ErrorBoundary` wrapping entire app
- `OfflineIndicator` component
- Per-page error states via useReducer

### 1.6 Test Coverage
| Suite | File | Tests | Status |
|-------|------|-------|--------|
| Cart slice | __tests__/cart-slice.test.ts | 6 | ✅ PASS |
| Checkout E2E | __tests__/checkout.e2e.test.tsx | 2 | ✅ PASS |
| API Integration | __tests__/api.integration.test.ts | 3 | ✅ PASS |

## 2. Restaurant Dashboard Application

### 2.1 Overview
| Property | Value | Evidence |
|----------|-------|----------|
| Path | apps/restaurant-dashboard | Directory listing |
| Framework | Next.js 15.5.19 | package.json |
| Language | TypeScript 5 | tsconfig.json |
| State | useReducer + dummy Redux | src/pages/_app.tsx |
| Realtime | Socket.IO client | src/pages/index.tsx |
| Port | 3003 | next.config.js |
| Status | Partially Implemented | 10 pages, 3 test suites |

### 2.2 Route/Page Inventory

| Route | File | Description |
|-------|------|-------------|
| / | src/pages/index.tsx | Kitchen Dashboard (KDS) - 726 line monolithic component |
| /onboarding | src/pages/onboarding/index.tsx | Multi-step onboarding (6 steps) |
| /onboarding/business | src/pages/onboarding/business.tsx | Business info step |
| /onboarding/documents | src/pages/onboarding/documents.tsx | Document upload step |
| /onboarding/gst | src/pages/onboarding/gst.tsx | GST configuration |
| /onboarding/menu | src/pages/onboarding/menu.tsx | Menu setup |
| /onboarding/pricing | src/pages/onboarding/pricing.tsx | Pricing configuration |
| /onboarding/payout | src/pages/onboarding/payout.tsx | Payout setup |

### 2.3 Key Components (inline in index.tsx)
- DashboardHeader - Order count, batch mode, audio toggle
- StatusRibbon - Status badges (NEW, ACKD, COOKING, etc.)
- KitchenOrdersView - StatsRow, BatchOrderSections, FlatOrderGrid
- OrderCard - Individual order card with actions
- InventoryView - Stock levels, progress bars

### 2.4 WebSocket Integration
- Events: `newOrder`, `inventoryAlert`
- Dynamic import of `socket.io-client`
- No retry logic for failed API calls

### 2.5 Test Coverage
| Suite | File | Tests | Status |
|-------|------|-------|--------|
| Kitchen dashboard | __tests__/kitchen-dashboard.test.tsx | 3 | ✅ PASS |
| KDS E2E | __tests__/kds.e2e.test.tsx | 3 | ✅ PASS |
| API Integration | __tests__/api.integration.test.ts | 3 | ✅ PASS |

## 3. Super Admin Application

### 3.1 Overview
| Property | Value | Evidence |
|----------|-------|----------|
| Path | apps/super-admin | Directory listing |
| Framework | Next.js 15.5.19 | package.json |
| Language | TypeScript 5 | tsconfig.json |
| State | useReducer + dummy Redux | src/pages/_app.tsx |
| Realtime | Socket.IO client | src/pages/index.tsx |
| Charts | recharts 2.15.4 | src/pages/analytics/* |
| Port | 3004 | next.config.js |
| Status | Partially Implemented | 14 pages, 4 test suites |

### 3.2 Route/Page Inventory

| Route | File | Description |
|-------|------|-------------|
| / | src/pages/index.tsx | Admin Dashboard - Overview, Orders, Branches, Support |
| /analytics | src/pages/analytics/index.tsx | Platform analytics overview |
| /analytics/top-dishes | src/pages/analytics/top-dishes.tsx | Top dishes analytics |
| /analytics/customers | src/pages/analytics/customers.tsx | Customer analytics (churn, repeat) |
| /driver-fleet/overview | src/pages/driver-fleet/overview.tsx | Driver fleet management |
| /driver-fleet/earnings | src/pages/driver-fleet/earnings.tsx | Driver earnings |
| /driver-fleet/shifts | src/pages/driver-fleet/shifts.tsx | Shift management |
| /driver-fleet/penalties | src/pages/driver-fleet/penalties.tsx | Penalty management |
| /driver-fleet/incentives | src/pages/driver-fleet/incentives.tsx | Incentive management |
| /loyalty | src/pages/loyalty/index.tsx | Loyalty overview |
| /loyalty/coupons | src/pages/loyalty/coupons.tsx | Coupon management |
| /loyalty/referrals | src/pages/loyalty/referrals.tsx | Referral management |

### 3.3 WebSocket Events
- `statsUpdate`
- `newOrderGlobal`
- `kitchenUpdate`
- `deliveryHeatmap`
- `revenueUpdate`

### 3.4 Test Coverage
| Suite | File | Tests | Status |
|-------|------|-------|--------|
| Admin flow E2E | __tests__/admin-flow.e2e.test.ts | 8 | ✅ PASS |
| Analytics E2E | __tests__/analytics.e2e.test.tsx | 4 | ✅ PASS |
| Components | __tests__/*.test.ts | 6 | ✅ PASS |
| API Integration | __tests__/api.integration.test.ts | 5 | ✅ PASS |

## 4. Frontend Cross-Cutting Concerns

### 4.1 Shared UI System
All three web apps use `@spicegarden/ui`:
- Button, Card, Input, Modal, Toast, Skeleton, LoadingStates
- DESIGN_TOKENS for consistent styling
- useToast for notifications
- ToastProvider for context

### 4.2 Shared API Client
- `@spicegarden/shared/api.ts` - fetch wrapper with auto-refresh, CSRF
- Only used by customer-web (other apps use own implementations)

### 4.3 Error Tracking
- All three apps integrate `@sentry/nextjs`
- ErrorBoundary component in @spicegarden/ui

### 4.4 Responsive Design
- CSS Modules with responsive class naming
- Bottom navigation for mobile
- Grid layouts for cards/orders

### 4.5 Performance
- React Query caching
- Skeleton loaders
- Next.js Image optimization (partial)
- No lazy loading for routes

### 4.6 React Doctor Scores
| App | Score | Warnings |
|------|-------|----------|
| customer-web | 95/100 | 1 (fetch in useEffect) |
| restaurant-dashboard | 95/100 | 1 (unused recharts) |
| super-admin | 73/100 | 1 (large component, fetch in useEffect) |
| delivery-partner | 89/100 | 2 (large component, unused recharts) |

## 5. Frontend Gaps

| Gap | Severity | Apps Affected |
|-----|----------|---------------|
| No auth guards in restaurant-dashboard/super-admin | High | 2 apps |
| Dummy Redux stores | Medium | 2 apps |
| Hardcoded demo data in places | Medium | 3 apps |
| Inconsistent state management | Medium | All apps |
| No .env.example files | Low | All apps |
| Large monolithic components | Medium | 2 apps |
| No lazy route loading | Low | 3 apps |