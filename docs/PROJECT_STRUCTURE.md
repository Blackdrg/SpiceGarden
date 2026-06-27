# Project Structure

## Repository Root Layout

```
spicegarden/
├─ apps/                         # Application workspaces (6 apps)
│  ├─ backend/                   # NestJS API server
│  ├─ customer-web/              # Next.js storefront
│  ├─ restaurant-dashboard/      # Next.js kitchen dashboard
│  ├─ super-admin/               # Next.js admin console
│  ├─ customer-mobile/           # Expo React Native mobile app
│  ├─ delivery-partner/          # Expo React Native driver app
│  └─ launcher/                  # Electron Windows desktop launcher
├─ packages/                     # Shared library workspaces (5 packages)
│  ├─ ui/                        # React component library (@spicegarden/ui)
│  ├─ shared/                    # Shared TypeScript utilities (@spicegarden/shared)
│  ├─ api-types/                 # Shared API contracts (@spicegarden/api-types)
│  ├─ proto/                     # Protobuf type definitions (@spicegarden/proto)
│  └─ grpc-transport/            # Quarantined gRPC placeholder
├─ infra/                        # Infrastructure as code
│  ├─ backend/Dockerfile
│  ├─ customer-web/Dockerfile
│  ├─ restaurant-dashboard/Dockerfile
│  ├─ super-admin/Dockerfile
│  ├─ delivery-partner/Dockerfile
│  ├─ k8s/                       # Kubernetes manifests (8 files)
│  ├─ prometheus/                # Metrics config + alert rules + SLOs
│  ├─ grafana/                   # Dashboards + provisioning
│  ├─ alertmanager/              # Alert routing
│  ├─ opensearch/                # Index templates
│  ├─ filebeat/                  # Log shipping config
│  ├─ envoy/                     # Service mesh config
│  ├─ postgres/                  # init.sql + migrations + seed data
│  └─ scripts/                   # 36 operational scripts
├─ docs/                         # Documentation (81+ files)
├─ scripts/                      # Development utilities
├─ .github/workflows/            # CI/CD pipelines (3 files)
├─ compose.dev.yaml              # Docker Compose (13 services)
├─ tsconfig.json                 # TypeScript project references
└─ package.json                  # Root workspace config
```

## Workspace Inventory

### Applications

| Workspace | Name | Technology | Port | Status |
|-----------|------|-----------|------|--------|
| `apps/backend` | @spicegarden/backend | NestJS 11 + TypeORM + Socket.IO | 3001 | Active |
| `apps/customer-web` | @spicegarden/customer-web | Next.js 15 + React 19 + Redux Toolkit | 3002 | Active |
| `apps/restaurant-dashboard` | @spicegarden/restaurant-dashboard | Next.js 15 + React 19 + Socket.IO | 3003 | Active |
| `apps/super-admin` | @spicegarden/super-admin | Next.js 15 + React 19 + Recharts | 3004 | Active |
| `apps/customer-mobile` | @spicegarden/customer-mobile | Expo 56 + React Native 0.85 | Expo | Active |
| `apps/delivery-partner` | @spicegarden/delivery-partner | Expo 56 + React Native 0.85 | Expo | Active |
| `apps/launcher` | spicegarden-launcher | Electron 39 + TypeScript | N/A | Active |

### Packages

| Workspace | Name | Purpose |
|-----------|------|---------|
| `packages/ui` | @spicegarden/ui | Shared React component library (20+ components, 19 icons) |
| `packages/shared` | @spicegarden/shared | Shared TypeScript utilities (API client, types, constants) |
| `packages/api-types` | @spicegarden/api-types | Shared API contracts (4 interfaces) |
| `packages/proto` | @spicegarden/proto | TypeScript-based proto definitions (no .proto files) |
| `packages/grpc-transport` | @spicegarden/grpc-transport | **QUARANTINED** - throws GrpcTransportUnavailableError |

## Backend Module Structure

### NestJS Modules (27 total)

| Module | Location | Controllers | Services |
|--------|----------|-------------|----------|
| AppModule | `src/app.module.ts` | 1 | 1 |
| ApisModule | `src/apis.module.ts` | — | — |
| AuthServiceModule | `src/services/auth/` | 1 | 2 |
| OrderServiceModule | `src/services/order/` | 1 | 1 |
| PaymentServiceModule | `src/services/payments/` | 3 | 5+ |
| RestaurantServiceModule | `src/services/restaurant/` | 4 | 4+ |
| SearchServiceModule | `src/services/search/` | 1 | 1 |
| DeliveryServiceModule | `src/services/delivery/` | 2 | 3+ |
| DriverOpsModule | `src/services/delivery/` | 1 | 1 |
| AdminServiceModule | `src/services/admin/` | 1 | 1 |
| NotificationModule | `src/services/notifications/` | 3 | 3+ |
| KitchenModule | `src/modules/kitchen/` | 1 | 1 |
| DriverAssignmentModule | `src/modules/driver-assignment/` | 1 | 1 |
| MetricsModule | `src/metrics/` | 1 | 1 |
| ComplianceModule | `src/compliance/` | — | — |
| AuditModule | `src/audit/` | — | — |
| WalletModule | `src/services/wallet/` | 1 | 1 |
| GSTModule | `src/services/gst/` | 1 | 1 |
| FinanceModule | `src/services/finance/` | 1 | 2+ |
| SupportModule | `src/services/support/` | 1 | 1 |
| RefundModule | `src/services/refund/` | 1 | 1 |
| LoyaltyModule | `src/services/loyalty/` | 1 | 1 |
| DriverFleetModule | `src/services/driver-fleet/` | 1 | 1 |
| AnalyticsModule | `src/modules/analytics/` | 1 | 1 |
| ReviewServiceModule | `src/services/review/` | 1 | 1 |
| UserProfileModule | `src/services/user/` | 1 | 1 |
| SecurityModule | `src/security/` | — | 4 |
| QueueModule | `src/infra/queue/` | — | 1 |
| TrackingModule | `src/infra/tracking/` | — | 1 |
| DbModule | `src/db/` | — | — |
| LoggingModule | `src/logging/` | — | 1 |
| GrpcModule | `src/grpc/` | 2 | — |

### Controller Inventory (31 files)

| Controller | Module | Route Prefix | Purpose |
|------------|--------|--------------|---------|
| auth.controller.ts | auth | `auth` | Login, register, refresh, logout |
| order.controller.ts | order | `orders` | Order CRUD, status transitions |
| payments.controller.ts | payments | `payments` | Payment intents, capture, confirm |
| chargeback.controller.ts | payments/chargeback | `payments/chargebacks` | Chargeback management |
| webhook.controller.ts | payments/webhook | `payments/webhooks` | Stripe/Razorpay webhooks |
| restaurant.controller.ts | restaurant | `restaurants` | Restaurant CRUD, menus |
| business-engine.controller.ts | restaurant | `restaurants/business` | Business metrics |
| onboarding.controller.ts | restaurant | `restaurants/onboarding` | Restaurant onboarding |
| restaurant-ops.controller.ts | restaurant | `restaurants/ops` | Restaurant operations |
| review.controller.ts | review | `reviews` | Review CRUD |
| search.controller.ts | search | `search` | Menu/restaurant search |
| delivery.controller.ts | delivery | `delivery` | Delivery assignment, tracking |
| driver-ops.controller.ts | delivery | `drivers` | Driver operations |
| driver-fleet.controller.ts | driver-fleet | `drivers/fleet` | Fleet management |
| admin.controller.ts | admin | `admin` | Admin operations |
| ai.controller.ts | ai | `ai` | AI features (trace in code) |
| finance.controller.ts | finance | `finance` | Financial reports |
| gst.controller.ts | gst | `gst` | GST management |
| loyalty.controller.ts | loyalty | `loyalty` | Coupons, referrals |
| maps.controller.ts | maps | `maps` | Geocoding, distance matrix |
| menu-customization.controller.ts | menu-customization | `menu` | Menu customization |
| notification-preferences.controller.ts | notifications | `notifications/preferences` | Notification settings |
| device.controller.ts | notifications | `devices` | Device registration |
| notification-queue.controller.ts | notifications/queue | `notifications/queue` | Notification queue |
| support.controller.ts | support | `support` | Support tickets |
| user-profile.controller.ts | user | `profile` | User profile CRUD |
| address.controller.ts | users | `addresses` | Address CRUD |
| payment-methods.controller.ts | users | `payment-methods` | Payment methods CRUD |
| wallet.controller.ts | wallet | `wallet` | Wallet operations |
| refund.controller.ts | refund | `refunds` | Refund processing |
| kitchen.controller.ts | kitchen | `kitchen` | Kitchen operations |
| analytics.controller.ts | analytics | `analytics` | Analytics APIs |

### Entity Inventory (64 entities)

**Core Business:**
- `user` (8 roles, 3 statuses)
- `restaurant`, `restaurant-branch`, `restaurant-gst`, `restaurant-onboarding`
- `order`, `order-item`, `gst-detail`
- `menu-item`, `menu-category`, `menu-addon`, `menu-variant`, `menu-item-availability`, `menu-moderation`

**Delivery Ecosystem:**
- `driver`, `driver-document`, `driver-assignment`, `driver-shift`, `driver-score`, `driver-fraud`, `driver-incentive`, `driver-penalty`
- `delivery-sla`, `sla-alert`

**Payments & Finance:**
- `wallet`, `wallet-transaction`
- `payment-method`, `payment-webhook`, `payment-dispute`, `stripe-webhook`
- `ledger-entry`, `payout-report`, `refund`, `refund-approval`

**Customer Engagement:**
- `coupon`, `coupon-usage`, `subscription`, `referral`
- `review`, `support-ticket`, `notification`, `notification-preference`, `notification-analytics`
- `address`, `session`, `user-device`, `device-fingerprint`, `otp`

**Kitchen & Inventory:**
- `inventory-item`, `inventory-alert`, `batch`, `food-prep`, `recipe`, `kitchen-sla`, `supplier`, `branch-control`

**Compliance & Audit:**
- `audit-log`, `data-export-request`, `deletion-request`

**Infrastructure:**
- `webhook-retry-queue`, `payment-event`, `payment-fraud`, `payment-validation`, `idempotency`, `commission-rule`, `holiday-schedule`, `hsn-sac`, `surge-zone`

## Frontend Application Structure

### Customer Web (Next.js 15 - Port 3002)
- **Pages:** 21 routes (home, auth, menu, cart, checkout, history, tracking, search, addresses, profile, notifications, offers, subscriptions, wallet, payment-methods, legal/privacy, legal/terms, reset-password, auth/callback)
- **State:** Redux Toolkit (authSlice, cartSlice) + TanStack React Query
- **Realtime:** Socket.IO client for order tracking
- **API:** @spicegarden/shared/api (authApi, ordersApi, restaurantsApi, menuApi)
- **Offline:** OfflineQueue hook for resilience

### Restaurant Dashboard (Next.js 15 - Port 3003)
- **Pages:** KDS (index), onboarding flow (6 steps)
- **State:** useReducer (local) - Redux placeholder only
- **Realtime:** Socket.IO for KDS updates
- **Key Feature:** Kitchen Display System with batch mode, delay tracking, audio alerts, park orders

### Super Admin (Next.js 15 - Port 3004)
- **Pages:** Admin dashboard with Overview, Orders, Branches, Support tabs
- **State:** useReducer (local) - Redux placeholder only
- **Visualization:** Recharts (AreaChart, etc.)
- **Realtime:** Socket.IO for stats/live updates

### Customer Mobile (Expo - No fixed port)
- **Screens:** 15 screens (Auth, Home, Search, Restaurant, MenuItem, Cart, Checkout, Addresses, PaymentMethods, Profile, History, OrderDetails, Tracking, Notifications, Onboarding)
- **Navigation:** React Navigation (Native Stack + Bottom Tabs)
- **State:** Local useState/useReducer + AsyncStorage
- **Realtime:** Custom Socket.IO service with reconnection backoff
- **i18n:** 7 locales (en-IN, hi, pa, mr, gu, ta, te)

### Delivery Partner (Expo - No fixed port)
- **Services:** 3 service files (delivery-api, location, storage)
- **State:** Service-layer AsyncStorage only
- **Realtime:** Socket.IO for order assignment/cancellation
- **Location:** expo-location for GPS tracking + dual-write (Socket.IO + HTTP)

### Launcher (Electron - Desktop)
- **Main Process:** Docker lifecycle management, Node.js process management, environment generation
- **Renderer:** React dashboard with service status, system monitor
- **Auto-update:** electron-updater via GitHub Releases
- **IPC:** 15+ channels exposed via context bridge

## Package Inventory

### @spicegarden/ui (v0.1.0)
**Components:**
- `Button` (6 variants, 3 sizes)
- `Card` (3 variants)
- `Input` (labeled, error states)
- `Dropdown` (custom select)
- `Modal` + `BottomSheet`
- `Toast` (context-based notification system)
- `Stepper`, `OTPInput`, `SearchInput`
- `Skeleton`, `SkeletonTemplates` (domain-specific)
- `LoadingStates` (EmptyState, NetworkError)
- `LottieSuccessAnimation` (SVG-based)
- `FlowManager` (multi-step orchestration)
- `ErrorBoundary`
- `Cards`: `FoodCard`, `MenuCard`, `MapCard`, `TrackingCard`, `ReviewCard`
- `useFlow` hook
- `DESIGN_TOKENS`, `DARK_MODE_TOKENS`, `MOTION_EASING`
- `trackEvent`, `useAnalytics`, `useWebVitals`
- `icons/`: 19 domain icons (system, navigation, kitchen, delivery, commerce, admin)

### @spicegarden/shared (v0.0.0)
**Zero runtime dependencies.**
- `constants.ts`: API_URL, SOCKET_URL (hardcoded localhost)
- `types.ts`: User, Order, Restaurant, MenuItem, AuthResponse, ApiError
- `api.ts`: Central API client with auto token refresh (401 handling), authApi, restaurantsApi, ordersApi, menuApi
- `analytics.ts`: Analytics event types

### @spicegarden/api-types (v1.0.0)
**Zero dependencies.**
- `DriverProfile` interface
- `DeliveryOrder` interface
- `EarningsSummary` interface
- `Location` interface

### @spicegarden/proto (v1.0.0)
**Zero dependencies. No .proto files - hand-written TS interfaces.**
- `GRPCMetadata`, `ProtoDriver`, `ProtoOrder`
- gRPC connection constants (port 50051)

### @spicegarden/grpc-transport (v1.0.0)
- **QUARANTINED.** `createGrpcTransport()` throws `GrpcTransportUnavailableError`.

## Infrastructure Components

### Docker Compose (compose.dev.yaml - 13 services)
| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| postgres | postgres:16-alpine | 5432 | Primary relational DB |
| redis | redis:7-alpine | 6379 | Cache, sessions, BullMQ queue |
| mongo | mongo:7 | 27017 | Document DB (reviews, audit logs) |
| prometheus | prom/prometheus:v2.51.0 | 9090 | Metrics collection |
| grafana | grafana/grafana-enterprise:10.4.0 | 3000 | Metrics visualization |
| opensearch | opensearchproject/opensearch:2.15.0 | 9200 | Log aggregation |
| opensearch-dashboards | opensearchproject/opensearch-dashboards:2.15.0 | 5601 | Log visualization |
| alertmanager | prom/alertmanager:v0.27.0 | 9093 | Alert routing |
| backend | Multi-stage Dockerfile | 3001 | NestJS API |
| customer-web | Multi-stage Dockerfile | 3002 | Next.js storefront |
| restaurant-dashboard | Multi-stage Dockerfile | 3003 | Kitchen dashboard |
| super-admin | Multi-stage Dockerfile | 3004 | Admin console |
| delivery-partner | Multi-stage Dockerfile | 3005 | Driver app smoke |

### Kubernetes Manifests (8 files)
- `production-hardened.yaml` - Production deployment with hardening
- `staging.yaml` - Staging environment
- `postgres-ha.yaml` - PostgreSQL HA setup
- `redis-cluster.yaml` - Redis cluster
- `backend-deployment.yaml` - Backend deployment spec
- `cdn-ingress.yaml` - CDN/Ingress configuration
- `configmap.yaml` - ConfigMap
- `secrets.yaml` - Secrets template

### CI/CD workflows (.github/workflows/)
- `ci-cd.yml` - Main CI/CD pipeline (security audit, build-test, deploy-staging, deploy-production)
- `react-doctor.yml` - React Doctor quality checks
- `rollback.yml` - Rollback workflow

### Observability Stack
- **Prometheus** (9090) - Metrics via prom-client, custom http_requests_total, http_request_duration_seconds
- **Grafana** (3000) - Dashboards provisioned in infra/grafana/
- **Alertmanager** (9093) - Slack + PagerDuty routing
- **Sentry** - Error tracking with traces
- **OpenSearch** (9200) - Log aggregation via Filebeat
- **Filebeat** - Log shipping config

## Documentation Inventory

81 existing documentation files across `docs/`:

```
docs/
├─ architecture/          # 8 flow diagrams
├─ AUDIT/                 # 4 audit reports
├─ diagnostics/           # 10 diagnostic reports
├─ prod-readiness/        # 12 phase reports + command output
├─ production-readiness/  # 10 phase reports
├─ security/              # compliance + threat model
└─ 40+ individual reports (various statuses)
```

Many existing docs are historical/progress reports. This unified documentation set replaces them with current, evidence-based documentation.

## Version Inventory

| Component | Version | Source |
|-----------|---------|--------|
| Node.js | 20.x | tsconfig, CI workflow |
| TypeScript | 5.0-5.9 | tsconfig.json, app package.json files |
| NestJS | 11.1.27 | apps/backend/package.json |
| TypeORM | 1.0.0 | apps/backend/package.json |
| Mongoose | 9.7.0 | apps/backend/package.json |
| MongoDB | 7.3.0 | apps/backend/package.json |
| Redis (ioredis) | 5.10.1 | apps/backend/package.json |
| BullMQ | 5.78.1 | apps/backend/package.json |
| Socket.IO | 4.7.0 | apps/backend/package.json |
| Next.js | 15.5.18 | customer-web/package.json, overrides |
| React | 19.2.7 | customer-web/package.json |
| Expo | 56.0.12 | customer-mobile/package.json |
| React Native | 0.85.3 | customer-mobile/package.json |
| Electron | 39-42 | launcher/package.json, root package.json |
| Stripe | ^15.0.0 | apps/backend/package.json |
| Razorpay | (via payment provider) | apps/backend/package.json |
| Sentry | ^10.58.0 | apps/backend/package.json |
| Jest | ^29.7.0 | apps/backend/package.json |
| ESLint | 8.x | Multiple package.json files |
| Prometheus | v2.51.0 | compose.dev.yaml |
| Grafana | 10.4.0 | compose.dev.yaml |
| OpenSearch | 2.15.0 | compose.dev.yaml |
| PostgreSQL | 16-alpine | compose.dev.yaml |
