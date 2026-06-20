> HISTORICAL DOCUMENT
> This report reflects a prior audit state and is superseded by:
> `docs/CANONICAL_PROJECT_STATE_2026-06-20.md`
> and the latest README / status reports.

# ARCHITECTURE REPORT

**Generated:** 2026-06-20  
**Verified from:** Source code analysis

---

## Monorepo Structure

```
spicegarden/
├── apps/
│   ├── backend/          # NestJS API server (port 3001)
│   ├── customer-web/     # Next.js customer app (port 3002)
│   ├── restaurant-dashboard/ # Next.js restaurant app (port 3003)
│   ├── super-admin/      # Next.js admin portal (port 3004)
│   ├── customer-mobile/  # Expo React Native app
│   ├── delivery-partner/ # Expo driver app
│   └── launcher/         # Electron desktop app
└── packages/
    ├── ui/               # Shared React components, tokens
    ├── shared/           # API client, constants, domain types
    ├── proto/            # Protocol Buffer definitions
    ├── grpc-transport/   # gRPC client transport
    └── api-types/        # TypeScript API types
```

---

## Backend Module Map

**Source:** `apps/backend/src/app.module.ts:36`

| Module | Purpose | Status |
|--------|---------|--------|
| `DbModule` | TypeORM, Mongoose, Redis | ✅ Verified |
| `SecurityModule` | Throttler, encryption | ✅ Verified |
| `LoggingModule` | Logging support | ✅ Verified |
| `QueueModule` | BullMQ job processing | ✅ Verified |
| `TrackingModule` | Socket.IO tracking | ✅ Verified |
| `AuthServiceModule` | JWT, sessions, OAuth | ✅ Verified |
| `OrderServiceModule` | Order lifecycle | ✅ Verified |
| `PaymentServiceModule` | Payments, refunds | ✅ Verified |
| `RestaurantServiceModule` | Restaurants, menus | ✅ Verified |
| `SearchServiceModule` | Search | ✅ Verified |
| `DeliveryServiceModule` | Delivery orchestration | ✅ Verified |
| `DriverOpsModule` | Driver operations | ✅ Verified |
| `AdminServiceModule` | Admin panel | ✅ Verified |
| `NotificationModule` | Push/email | ✅ Verified |
| `KitchenModule` | KDS integration | ✅ Verified |
| `DriverAssignmentModule` | Driver matching | ✅ Verified |
| `MetricsModule` | Prometheus | ✅ Verified |
| `ComplianceModule` | GDPR/SOC2/PCI | ✅ Verified |
| `AuditModule` | Audit logging | ✅ Verified |
| `WalletModule` | Digital wallet | ✅ Verified |
| `GSTModule` | GST calculations | ✅ Verified |
| `FinanceModule` | Financial reports | ✅ Verified |
| `SupportModule` | Customer support | ✅ Verified |
| `RefundModule` | Refund processing | ✅ Verified |
| `LoyaltyModule` | Loyalty programs | ✅ Verified |
| `DriverFleetModule` | Fleet management | ✅ Verified |
| `AnalyticsModule` | Analytics | ✅ Verified |
| `ReviewServiceModule` | Reviews | ✅ Verified |
| `ApisModule` | Helper endpoints | ✅ Verified |

---

## Request Flow

```
Client Request
    ↓
Express Adapter (NestJS)
    ↓
Security Middleware (main.ts)
    ├── Helmet headers
    ├── mongo-sanitize (NoSQL injection)
    ├── hpp() (parameter pollution)
    └── Rate Limiters (API/Auth/Orders)
    ↓
ValidationPipe (whitelist, transform)
    ↓
JwtAuthGuard (if protected route)
    ↓
RolesGuard (if RBAC required)
    ↓
Controller
    ↓
Service
    ↓
Database (PostgreSQL/MongoDB/Redis)
```

---

## Auth Flow

```
POST /auth/register
    ↓
AuthController.register()
    ↓
UserEntity created
    ↓
JWT + Refresh Token generated
    ↓
Response: { access_token, refresh_token }

POST /auth/login
    ↓
AuthController.login()
    ↓
validateUser() → password check
    ↓
JWT + Refresh Token generated
    ↓
Response: { access_token, refresh_token }
```

---

## Order Flow

```
POST /orders
    ↓
OrderController
    ↓
OrderService.createOrder()
    ├─ ValidationPipe
    ├─ Idempotency check
    ├─ Item/total validation
    └─ OrderEntity saved
    ↓
DriverAssignmentModule.assign()
    ↓
KitchenModule.notify()
    ↓
WebSocket to Restaurant Dashboard
```

---

## Payment Flow

```
POST /payments/create-intent
    ↓
PaymentsController
    ↓
PaymentService.createIntent()
    ├─ FraudHardening check
    ├─ GatewayFactory.select() → Stripe/Razorpay/COD
    └─ Intent created
    ↓
Stripe/Razorpay API
    ↓
Webhook confirmation
    ↓
LedgerEntry created
    ↓
Notification dispatched
```

---

## Delivery Flow

```
Driver Assignment
    ↓
DriverAssignmentModule
    ├─ Find available drivers
    ├─ Proximity matching
    └─ DriverAssignmentEntity
    ↓
WebSocket notification to driver
```

---

## Database Architecture

| Database | Purpose | Entities |
|----------|---------|----------|
| PostgreSQL | Primary | 54+ entities in TypeORM |
| MongoDB | Documents | ReviewDocument schema |
| Redis | Cache/Queue | Used via ioredis adapter |

---

## API Inventory

### Auth Routes
| Route | Method | File |
|-------|--------|------|
| `/auth/register` | POST | auth.controller.ts:52 |
| `/auth/login` | POST | auth.controller.ts:40 |
| `/auth/refresh-token` | POST | auth.controller.ts:72 |
| `/auth/logout` | POST | auth.controller.ts:78 |

### Core Routes
| Prefix | Protection |
|--------|------------|
| `/api/` | Rate limited (100/15min) |
| `/auth/` | Rate limited (5/15min) |
| `/orders/` | Rate limited (10/15min) |
| `/metrics` | Public |

---

## Service Dependencies

### Backend → Databases
- `DbModule` connects to PostgreSQL, MongoDB, Redis
- `RedisRateLimitStore` for rate limiting (memory fallback)
- `LocalDevModule` for SQLite-only local development

### Frontend → Backend
- All frontends use `NEXT_PUBLIC_API_URL` or `API_URL`
- Socket.IO clients connect to `SOCKET_URL`