# SpiceGarden Architecture Report

> Generated: 2026-06-19
> Verified from source code analysis

## Monorepo Architecture

```
spicegarden/
├── apps/
│   ├── backend/          # NestJS API server (port 3001)
│   ├── customer-web/     # Next.js customer app (port 3002)
│   ├── restaurant-dashboard/ # Next.js restaurant app (port 3003)
│   ├── super-admin/      # Next.js admin portal (port 3004)
│   ├── customer-mobile/  # React Native customer app
│   ├── delivery-partner/ # React Native driver app
│   └── launcher/         # Electron desktop app
└── packages/
    ├── ui/               # Shared React components
    ├── shared/           # Shared utilities and types
    ├── proto/            # Protocol Buffer definitions
    ├── grpc-transport/   # gRPC client transport
    └── api-types/        # shared API types
```

## Backend Architecture

### Application Bootstrap (`main.ts`)
- HTTP server on port 3001
- Security middleware: Helmet, HPP, MongoDB sanitization
- Rate limiting: Redis-backed with fallback to memory
- CORS: Configurable origins via `CORS_ALLOWED_ORIGINS`
- Trust proxy support for production
- Request logging middleware
- Health check endpoint at `/health` and `/metrics`

### Module Structure

| Module | Purpose | Status |
|--------|---------|--------|
| AuthServiceModule | JWT/OAuth2 authentication | ✅ Complete |
| OrderServiceModule | Order lifecycle management | ✅ Complete |
| PaymentServiceModule | Payment processing with Stripe/Razorpay | ✅ Complete |
| RestaurantServiceModule | Restaurant CRUD operations | ✅ Complete |
| SearchServiceModule | Restaurant/menu search | ✅ Complete |
| DeliveryServiceModule | Delivery orchestration | ✅ Complete |
| DriverOpsModule | Driver operations | ✅ Complete |
| AdminServiceModule | Admin panel API | ✅ Complete |
| NotificationModule | Push/email notifications | ✅ Complete |
| KitchenModule | Kitchen display system | ✅ Complete |
| DriverAssignmentModule | Driver assignment logic | ✅ Complete |
| MetricsModule | Prometheus metrics | ✅ Complete |
| ComplianceModule | Data compliance | ✅ Complete |
| AuditModule | Audit logging | ✅ Complete |
| WalletModule | Digital wallet | ✅ Complete |
| GSTModule | GST tax calculations | ✅ Complete |
| FinanceModule | Financial reporting | ✅ Complete |
| SupportModule | Customer support | ✅ Complete |
| RefundModule | Refund processing | ✅ Complete |
| LoyaltyModule | Loyalty programs | ✅ Complete |
| DriverFleetModule | Fleet management | ✅ Complete |
| AnalyticsModule | Analytics pipeline | ✅ Complete |
| ReviewServiceModule | Review system | ✅ Complete |

## Frontend Architecture

### Customer Web (Next.js 15)
- **Pages**: 21 routes including auth, checkout, cart, wallet, tracking
- **State**: Redux Toolkit + TanStack Query
- **Real-time**: Socket.IO client for order tracking
- **Build**: Production build successful (21 routes compiled)

### Restaurant Dashboard (Next.js 15)
- **Pages**: 10 routes including onboarding, menu management
- **Features**: Kitchen display integration, real-time updates

### Super Admin (Next.js 15)
- **Pages**: 12 routes for analytics, driver fleet, loyalty
- **Features**: Recharts for dashboards, Sentry integration

### Mobile Apps (React Native/Expo)
- **Customer Mobile**: 15+ screens with navigation
- **Delivery Partner**: Driver app for order management

## Mobile Architecture

### Customer Mobile
- **Navigation**: React Navigation (stack + bottom tabs)
- **Screens**: Home, Cart, Search, Restaurant, Profile, Checkout, Auth, Tracking, History, Order Details
- **Async Storage**: For local state persistence
- **Location**: Expo Location for GPS

### Delivery Partner
- **Main**: App.tsx with driver flow
- **Native Modules**: Async Storage, Expo components

## Shared Package Architecture

### @spicegarden/ui
- Shared React component library
- Reusable UI primitives

### @spicegarden/shared
- Domain types (User, Order interfaces)
- API utilities
- Constants

### @spicegarden/proto
- gRPC service definitions

### @spicegarden/grpc-transport
- gRPC client implementation

### @spicegarden/api-types
- TypeScript type definitions

## Infrastructure Architecture

### Kubernetes (production-hardened.yaml)
- **Replicas**: 3-20 (auto-scaling)
- **HPA**: CPU 70%, Memory 80% thresholds
- **PDB**: minAvailable: 2, maxUnavailable: 1
- **Security**: Non-root, readOnlyRootFilesystem, Seccomp
- **NetworkPolicy**: Ingress/Egress restrictions
- **Backup**: CronJob daily at 02:00 UTC

### Database Infrastructure
- **PostgreSQL**: Primary relational store
- **MongoDB**: Document store for logs/reviews
- **Redis**: Cache, rate limiting, queues

### Observability
- **Prometheus**: Metrics scraping (10s interval)
- **Grafana**: Dashboard provisioning
- **Alertmanager**: Alert routing
- **Sentry**: Error tracking

## Data Flow

```
User → Frontend (Customer Web/Mobile)
     → API Gateway (backend:3001)
     → Auth Guard → Controllers → Services
     → Database (PostgreSQL/MongoDB)
     → Notification Service (Push/WebSocket)
     → Payment Gateway (Stripe/Razorpay)
```

## Service Dependencies

### Core Dependencies
- AuthService → UserEntity, SessionEntity
- OrderService → PaymentService, NotificationService
- PaymentService → PaymentGatewayFactory, AuditService, LedgerService
- RestaurantService → BranchManagement, Onboarding, Payout

### Queue Flows
Based on `queues.ts`:
- `order_lifecycle`: Order state transitions
- `driver_assignment`: Driver matching
- `notifications`: Notification delivery
- `refunds`: Refund processing
- `analytics`: Event tracking

## Authentication Flows

### JWT Authentication
- Strategy: `apps/backend/src/services/auth/strategies/jwt.strategy.ts`
- Password hashing: Argon2
- Session management: 30-day expiry
- Token invalidation: Via session entity

### OAuth2 Flows
- Google OAuth2 via `@nestjs/passport`
- Facebook OAuth2 via `@nestjs/passport`
- Callback URLs validated by environment

## Payment Flows

### Gateways Supported
1. **Stripe** - `apps/backend/src/services/payments/gateways/stripe-gateway.service.ts`
2. **Razorpay** - `apps/backend/src/services/payments/gateways/razorpay-gateway.service.ts`
3. **COD** - `apps/backend/src/services/payments/gateways/cod-gateway.service.ts`

### Payment Flow Steps
1. Create payment intent (amount validation)
2. Fraud hardening checks
3. Gateway processing
4. Webhook confirmation
5. Ledger entry creation
6. Notification dispatch

## Order Flows

### Order Lifecycle (from order.service.ts)
1. **Place Order**: Validates items, totals, idempotency
2. **Payment Confirmation**: Links payment to order
3. **Driver Assignment**: Via driver-assignment module
4. **Kitchen Processing**: Via kitchen module
5. **Delivery**: Via delivery module
6. **Completion**: Delivered status, tip capture

### Status Transitions
- PLACED → RESTAURANT_ACCEPTED → PREPARING → DRIVER_ASSIGNED → PICKED_UP → ON_THE_WAY → DELIVERED
- States: CANCELLED, REFUNDED, FAILED

## Delivery Flows

### Driver Assignment
- Driver Assignment Module manages matching
- Real-time location updates via WebSocket

### Tracking
- Customer Web: `/tracking` page with real-time updates
- Delivery Partner: Location-based order status

## Database Relations

### Core Relations
- User 1→∞ Order (userId FK)
- Restaurant 1→∞ Order, MenuItem, Branch
- Order 1→∞ OrderItem
- Order 1→1 GSTDetail
- Driver 1→∞ Order, Assignment, Incentive, Penalty

## API Contracts

### REST Endpoints
- Auth: `/auth/*` - login, signup, OAuth callbacks
- Orders: `/orders/*` - CRUD, status updates
- Payments: `/payments/*` - intents, confirmations
- Restaurants: `/restaurants/*` - listing, details
- Search: `/search` - restaurant/menu search