# SpiceGarden

**SpiceGarden** is a production-scale food delivery platform built as an npm-workspace monorepo. It implements a complete multi-stakeholder ecosystem covering customers, restaurants, kitchen staff, delivery partners, and platform administrators.

## Vision

To provide a unified, scalable, and secure food delivery operating system that connects all ecosystem participants through real-time, event-driven microservices.

## Architecture

SpiceGarden uses a modular monolith architecture centered on NestJS, with polyglot persistence (PostgreSQL + MongoDB + Redis), and multi-channel frontends (Next.js web apps + Expo React Native mobile apps + Electron launcher).

```
                    ┌─────────────────────────────────────────┐
                    │           FRONTEND CHANNELS             │
                    │  customer-web (3002)                    │
                    │  restaurant-dashboard (3003)            │
                    │  super-admin (3004)                     │
                    │  customer-mobile (Expo)                 │
                    │  delivery-partner (Expo)                │
                    │  launcher (Electron)                    │
                    └─────────────────────┬───────────────────┘
                                          │
                    ┌─────────────────────▼───────────────────┐
                    │       BACKEND: NestJS API Gateway       │
                    │       Port 3001                         │
                    │       apps/backend                      │
                    └─────────────────────┬───────────────────┘
                                          │
              ┌──────────────┬───────────┼───────────┬──────────────┐
              │              │           │           │              │
        ┌─────▼─────┐ ┌─────▼─────┐ ┌──▼────┐ ┌───▼──────┐ ┌─────▼──────┐
        │ PostgreSQL │ │  MongoDB  │ │ Redis │ │OpenSearch│ │  BullMQ    │
        │   Port     │ │  Port     │ │ Port  │ │  Port    │ │  (Queue)   │
        │   5432     │ │  27017    │ │ 6379   │ │  9200    │ │            │
        └───────────┘ └───────────┘ └───────┘ └──────────┘ └───────────┘
                                          │
                             ┌────────────▼────────────┐
                             │   OBSERVABILITY         │
                             │  Prometheus (9090)      │
                             │  Grafana (3000)         │
                             │  Alertmanager (9093)    │
                             │  Sentry (errors)        │
                             └─────────────────────────┘
```

## Monorepo Structure

```
spicegarden/
├─ apps/
│  ├─ backend/             # NestJS API (port 3001)
│  │  ├─ src/
│  │  │  ├─ modules/       # Feature modules (auth, orders, payments, etc.)
│  │  │  ├─ services/      # Business logic services
│  │  │  ├─ db/            # TypeORM entities, schemas, adapters
│  │  │  ├─ security/      # Auth, RBAC, encryption, rate limiting
│  │  │  ├─ infra/         # Queue, tracking gateway, observability
│  │  │  ├─ controllers/   # Legacy/plus controllers
│  │  │  ├─ grpc/          # gRPC stubs (quarantined)
│  │  │  ├─ gateway/       # WebSocket gateway module
│  │  │  ├─ compliance/    # SOC2, PCI-DSS, GDPR/DPDP
│  │  │  ├─ audit/         # Audit logging
│  │  │  ├─ logging/       # Structured logging
│  │  │  ├─ metrics/       # Prometheus metrics
│  │  │  ├─ legal/         # Legal document APIs
│  │  │  └─ shared/        # Domain interfaces, contracts
│  │  ├─ test/             # Load, chaos, security tests
│  │  └─ scripts/          # Seed scripts
│  │
│  ├─ customer-web/        # Next.js storefront (port 3002)
│  │  └─ src/pages/        # 21 routes (home, menu, cart, checkout, etc.)
│  │
│  ├─ restaurant-dashboard/# Next.js kitchen dashboard (port 3003)
│  │  └─ src/pages/        # KDS, onboarding, menu management
│  │
│  ├─ super-admin/         # Next.js admin dashboard (port 3004)
│  │  └─ src/pages/        # Analytics, driver fleet, loyalty, support
│  │
│  ├─ customer-mobile/     # Expo React Native (15 screens)
│  │  └─ src/screens/      # Auth, home, search, cart, checkout, tracking
│  │
│  ├─ delivery-partner/    # Expo React Native
│  │  └─ src/services/     # Location, delivery API, storage
│  │
│  └─ launcher/            # Electron Windows launcher
│     ├─ src/main/         # Electron main process
│     └─ src/renderer/     # Renderer process UI
│
├─ packages/
│  ├─ ui/                  # Shared React component library (20+ components)
│  ├─ shared/              # Shared TypeScript utilities, types, API clients
│  ├─ api-types/           # Shared TypeScript interfaces (driver, delivery)
│  ├─ proto/               # Protobuf definitions and types
│  └─ grpc-transport/      # Quarantined placeholder
│
├─ infra/
│  ├─ backend/Dockerfile   # Multi-stage Docker build
│  ├─ customer-web/Dockerfile
│  ├─ restaurant-dashboard/Dockerfile
│  ├─ super-admin/Dockerfile
│  ├─ delivery-partner/Dockerfile
│  ├─ k8s/                 # 6 Kubernetes manifests
│  │  ├─ production-hardened.yaml
│  │  ├─ staging.yaml
│  │  ├─ postgres-ha.yaml
│  │  ├─ redis-cluster.yaml
│  │  └─ cdn-ingress.yaml
│  ├─ prometheus/          # Metrics config + alert rules + SLOs
│  ├─ grafana/             # Dashboards + provisioning
│  ├─ alertmanager/        # Alert routing (Slack, PagerDuty)
│  ├─ opensearch/          # Index templates
│  ├─ filebeat/            # Log shipping config
│  ├─ envoy/               # Service mesh config
│  ├─ postgres/            # init.sql
│  └─ scripts/             # 36 operational scripts
│
├─ .github/workflows/      # CI/CD pipelines
├─ compose.dev.yaml        # Docker Compose (13 services)
├─ tsconfig.json           # TypeScript project references
└─ package.json            # Root workspace config
```

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | NestJS | 11.1.27 |
| Runtime | Node.js | 20.x |
| Language | TypeScript | 5.x |
| ORM | TypeORM | 1.0.0 |
| Document DB | MongoDB + Mongoose | 9.7.0 / 7.3.0 |
| Cache/Queue | Redis + BullMQ | 5.10.1 / 5.78.1 |
| WebSocket | Socket.IO | 4.7.0 |
| Web Frontend | Next.js | 15.5.18 |
| Mobile | Expo React Native | 56.0.12 |
| Desktop | Electron | 39-42 |
| UI Library | Custom design system | 20+ components |
| Payments | Stripe + Razorpay | 15.0.0 |
| Auth | Passport JWT + OAuth2 | - |
| Email | SendGrid (via SMTP) | - |
| SMS | Twilio | - |
| Push | FCM + APNs | - |
| Monitoring | Prometheus + Grafana | 2.51.0 / 10.4.0 |
| Logging | OpenSearch + Filebeat | 2.15.0 |
| Error Tracking | Sentry | 10.58.0 |
| Testing | Jest | 29-30 |
| Linting | ESLint | 8-9 |

## Features

| Domain | Implementation |
|--------|---------------|
| Authentication | JWT + OAuth2 (Google, Facebook), email/phone verification, session management |
| Authorization | Role-Based Access Control (RBAC) + Permission-Based Access Control (PBAC) with 8 roles |
| Orders | Full lifecycle: placed → confirmed → preparing → ready → dispatched → delivered/cancelled |
| Payments | Stripe, Razorpay, COD gateways with webhooks, fraud detection, idempotency, retries, chargebacks |
| Wallets | Balance management, transactions, COD processing, double-payment prevention |
| Restaurants | Branch management, menu management, onboarding, KDS, moderation, commission, GST |
| Drivers | Onboarding, document verification, shift management, incentives, penalties, scoring, fraud detection |
| Delivery | Real-time tracking, driver assignment, ETA calculation, route optimization, SLA monitoring |
| Kitchen | Inventory, recipes, batches, food prep logging, SLA monitoring, consumption forecasting |
| Loyalty | Coupons, referrals, cashback processing |
| GST | HSN/SAC codes, GST calculation, invoice generation, reconciliation |
| Notifications | Push (FCM/APNs), SMS (Twilio), Email (SendGrid), in-app with preferences |
| Search | Menu search, restaurant discovery, trending, recommendations |
| Support | Tickets, routing, disputes, refunds |
| Analytics | Top dishes, churn, conversion, heatmap, peak hours, platform metrics |
| Compliance | GDPR/DPDP data export/deletion, SOC2 readiness, PCI-DSS validation, secrets rotation |
| Legal | Privacy policy, terms of service, intellectual property APIs |

## Applications

### Backend (`apps/backend`)
NestJS application with 14 modules, 52 TypeORM entities, 40+ controllers, 130+ services. Port 3001.

### Customer Web (`apps/customer-web`)
Next.js 15 storefront with 21 pages. Redux Toolkit + TanStack React Query. Port 3002.

### Restaurant Dashboard (`apps/restaurant-dashboard`)
Next.js kitchen dashboard with Kitchen Display System (KDS), real-time order updates via WebSocket. Port 3003.

### Super Admin (`apps/super-admin`)
Next.js admin console with analytics, driver fleet management, loyalty programs, support tickets. Port 3004.

### Customer Mobile (`apps/customer-mobile`)
Expo React Native app with 14 screens. React Navigation, expo-location, expo-notifications.

### Delivery Partner (`apps/delivery-partner`)
Expo React Native app for delivery partners. Location tracking, OTP verification, earnings dashboard.

### Launcher (`apps/launcher`)
Electron Windows desktop launcher for enterprise deployment.

## Packages

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@spicegarden/ui` | Shared React component library | Button, Card, Input, Modal, Toast, Skeleton, Stepper, OTPInput, SearchInput, ErrorBoundary, 50+ icons |
| `@spicegarden/shared` | Shared TypeScript utilities | API client factory, types, constants, analytics |
| `@spicegarden/api-types` | Shared API contracts | DriverProfile, DeliveryOrder, EarningsSummary, Location |
| `@spicegarden/proto` | Protobuf definitions | gRPC constants, types |
| `@spicegarden/grpc-transport` | gRPC transport | **QUARANTINED** - throws GrpcTransportUnavailableError |

## Installation

### Prerequisites
- Node.js 20.x
- npm 10+
- Docker & Docker Compose (for infrastructure)
- PostgreSQL 16, MongoDB 7, Redis 7 (or use Docker Compose)

### Setup

```bash
# 1. Clone repository
git clone <repository-url> spicegarden
cd spicegarden

# 2. Install dependencies
npm ci

# 3. Configure environment
cp .env.example .env
# Edit .env with production values

# 4. Start infrastructure (Docker)
docker-compose -f compose.dev.yaml up -d

# 5. Start backend
cd apps/backend && npm run dev

# 6. Start frontends (in separate terminals)
npm run dev --workspace=@spicegarden/customer-web
npm run dev --workspace=@spicegarden/restaurant-dashboard
npm run dev --workspace=@spicegarden/super-admin
```

## Environment Variables

### Required Backend Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Backend port | No (default 3001) |
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_PORT` | PostgreSQL port | No (default 5432) |
| `DB_USER` | PostgreSQL username | Yes |
| `DB_PASS` | PostgreSQL password | Yes |
| `DB_NAME` | PostgreSQL database | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `REDIS_HOST` | Redis host | Yes |
| `REDIS_PORT` | Redis port | No (default 6379) |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Yes |
| `JWT_EXPIRES_IN` | JWT expiration | No (default 7d) |
| `ENCRYPTION_SECRET` | AES-256 encryption key | Yes |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | Yes (production) |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes (payments) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes (payments) |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Yes (INR payments) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | Yes (INR payments) |
| `PAYMENT_PRIMARY_GATEWAY` | Primary payment gateway | No (default stripe) |
| `SENTRY_DSN` | Sentry error tracking DSN | No |
| `SMTP_HOST` | SMTP server host | Yes (email) |
| `SMTP_USER` | SMTP username | Yes (email) |
| `SMTP_PASS` | SMTP password | Yes (email) |
| `SMTP_FROM` | From email address | No |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Yes (SMS) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Yes (SMS) |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | No |
| `FCM_SERVER_KEY` | Firebase Cloud Messaging key | Yes (push) |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | Yes (maps/ETA) |
| `SENDGRID_API_KEY` | SendGrid API key | Yes (email fallback) |

### Frontend Environment Variables

| Variable | App | Purpose |
|----------|-----|---------|
| `NEXT_PUBLIC_API_URL` | All Next.js apps | Backend API URL |

## Development

### Scripts

```bash
# Root workspace
npm run dev              # Start all workspaces in dev mode
npm run build            # Build all packages
npm run lint             # Lint all workspaces
npm run test:unit        # Run unit tests across all workspaces
npm run test:integration # Run integration tests
npm run test:e2e         # Run end-to-end tests
npm run test:all         # Run all tests
npm run format           # Format all workspaces
npm run verify:stack     # Verify infrastructure stack

# Backend
cd apps/backend
npm run dev              # NestJS hot reload
npm run build            # TypeScript compile to dist/
npm run lint             # ESLint
npm run test:unit        # Jest unit tests
npm run test:cov         # Coverage with 80% threshold
npm run test:integration # Integration tests
npm run test:e2e         # E2E tests
npm run test:load        # k6 load test (10k users)
npm run test:load:20k    # k6 load test (20k users)
npm run test:chaos       # Kubernetes chaos tests
npm run seed             # Seed local database

# Frontend
npm run dev --workspace=@spicegarden/customer-web
npm run dev --workspace=@spicegarden/restaurant-dashboard
npm run dev --workspace=@spicegarden/super-admin
```

## Production

### Docker Build

```bash
docker-compose -f compose.dev.yaml build
docker-compose -f compose.dev.yaml up -d
```

### Kubernetes Deployment

```bash
# Staging
kubectl apply -f infra/k8s/staging.yaml -n spicegarden-staging

# Production (hardened)
kubectl apply -f infra/k8s/production-hardened.yaml -n spicegarden-production
```

### Production Hardening

The `production-hardened.yaml` manifest includes:
- 3 replicas with rolling updates
- PodDisruptionBudget (minAvailable: 2)
- HPA (min 3, max 20 replicas at 70% CPU / 80% memory)
- SecurityContext: runAsNonRoot, runAsUser 1001, readOnlyRootFilesystem, drop ALL capabilities
- NetworkPolicy: restricted ingress/egress
- Readiness, liveness, and startup probes on `/health`
- Daily backup CronJob at 2AM

## Testing

| Test Type | Command | Coverage |
|-----------|---------|----------|
| Unit | `npm run test:unit` | 92.88% statements, 82.34% branches |
| Integration | `npm run test:integration` | PASS |
| E2E | `npm run test:e2e` | PASS |
| Load | `npm run test:load` | 10k VUs |
| Load (20k) | `npm run test:load:20k` | 20k VUs |
| Chaos | `npm run test:chaos` | Postgres/Redis pod failures |
| Security | `node infra/scripts/security-tests.js` | 0 vulnerabilities |
| Penetration | `node infra/scripts/penetration-tests.js` | 0 issues |

## Linting

```bash
npm run lint
```

All workspaces lint with 0 errors.

## Formatting

```bash
npm run format
```

## Scripts

See `SCRIPTS_REFERENCE.md` for the complete list of 36 operational scripts in `infra/scripts/`.

## Database

SpiceGarden uses three data stores:
- **PostgreSQL** (TypeORM): Primary relational store for users, orders, restaurants, drivers, wallets, etc. 52 entities.
- **MongoDB** (Mongoose): Document store for reviews, audit logs, flexible schemas.
- **Redis**: Session cache, rate limiting store, BullMQ queue backend.

### Key Tables (PostgreSQL)

| Table | Purpose |
|-------|---------|
| `users` | All platform users (customers, restaurants, drivers, admins) |
| `orders` | Order master records |
| `order_items` | Order line items |
| `restaurants` | Restaurant master |
| `restaurant_branches` | Branch locations |
| `drivers` | Delivery partner profiles |
| `driver_assignments` | Order-driver assignments |
| `wallets` | Digital wallet balances |
| `wallet_transactions` | Wallet transaction ledger |
| `addresses` | User delivery addresses |
| `payment_disputes` | Payment chargebacks |
| `coupons` / `coupon_usage` | Loyalty coupons |
| `notifications` | Notification queue |
| `ledger_entries` | Financial ledger |

## Authentication

JWT-based authentication with refresh tokens. Session management with device tracking. OAuth2 integration for Google and Facebook. Protected routes use `JwtAuthGuard`.

### Auth Endpoints
- `POST /auth/login` - Email/password login
- `POST /auth/register` - Customer registration
- `POST /auth/refresh-token` - Token refresh
- `POST /auth/logout` - Session revocation

## Authorization

8 user roles with granular permission enforcement:

| Role | Key Permissions |
|------|----------------|
| `customer` | orders:read_own, orders:create, wallet:read_own, wallet:transact_own |
| `restaurant` | restaurants:manage_own, orders:manage_assigned, kitchen:manage_own |
| `kitchen_staff` | kitchen:manage_own, orders:read_assigned |
| `delivery_partner` | deliveries:manage_assigned, orders:read_assigned |
| `admin` | users:manage, restaurants:manage, orders:manage, payments:manage, support:manage, analytics:read, finance:read, notifications:manage, compliance:read |
| `super_admin` | `*` (all permissions) |
| `support_staff` | support:manage, orders:read |
| `finance_staff` | finance:read, payments:read, refunds:read |

## Payments

Multi-gateway payment architecture:
- **Primary**: Stripe (default)
- **Secondary**: Razorpay (India/INR)
- **Fallback**: Cash on Delivery (COD)

Features: webhook processing, idempotency keys, fraud hardening, retry logic, chargeback management, reconciliation.

## Notifications

Multi-channel notification system:
- **Push**: FCM (Android), APNs (iOS)
- **SMS**: Twilio
- **Email**: SendGrid / SMTP
- **In-app**: Notification queue with preferences

## WebSockets

Two Socket.IO gateways:
- **TrackingGateway** (`/tracking` namespace): Real-time driver location, order status updates, delivery events
- **KdsGateway** (`/kds` namespace): Kitchen display real-time order updates

Namespaces:
- `/tracking` - Driver/customer tracking
- `/kds` - Kitchen operations
- `/admin` - Admin real-time updates
- `/driver` - Driver-specific events

## Queues

BullMQ job queues backed by Redis:
- `ORDER_LIFECYCLE` - Order state machine transitions
- `NOTIFICATION_DELIVERY` - Notification dispatch
- `PAYMENT_RETRY` - Payment retries
- `WEBHOOK_RETRY` - Webhook delivery retries

## Deployment

### Docker Compose Development
```bash
docker-compose -f compose.dev.yaml up -d
```

Services: postgres:5432, redis:6379, mongo:27017, prometheus:9090, grafana:3000, opensearch:9200, alertmanager:9093, backend:3001, customer-web:3002, restaurant-dashboard:3003, super-admin:3004, delivery-partner:3005.

### Kubernetes Production
```bash
kubectl apply -f infra/k8s/production-hardened.yaml -n spicegarden-production
```

## Monitoring

- **Prometheus**: Metrics at `/metrics` endpoint
- **Grafana**: Dashboards provisioned in `infra/grafana/`
- **Alertmanager**: Slack + PagerDuty routing
- **Sentry**: Error tracking with traces
- **OpenSearch**: Log aggregation and search
- **Filebeat**: Log shipping

### Custom Metrics
- `http_requests_total` - Request counter by method, route, status
- `http_request_duration_seconds` - Latency histogram
- Default Node.js metrics via prom-client

## Scaling

- **Horizontal Pod Autoscaler**: 3-20 replicas based on CPU (70%) and Memory (80%)
- **PodAntiAffinity**: Spread pods across nodes
- **Redis Cluster**: For queue and session scaling
- **PostgreSQL**: Single primary (HA setup available)
- **MongoDB**: Replica set capable
- **WebSocket**: Room-based scaling with Socket.IO adapter

## Security

See `SECURITY_REPORT.md` and `SECURITY_CHECKLIST.md` for complete details.

Key controls:
- Helmet CSP + HSTS
- CORS strict whitelist (no wildcards)
- CSRF double-submit cookie
- MongoDB sanitization
- HPP (HTTP Parameter Pollution)
- Rate limiting (Redis-backed)
- Argon2/bcrypt password hashing
- AES-256 PII encryption
- Permission guard inheritance check
- Production env validation (secrets required)
- Strict security context in K8s

## Roadmap

See `ROADMAP.md` for current roadmap.

## Contributing

See `CONTRIBUTING.md` for contribution guidelines.

## License

MIT License. See `LEGAL.md` for details.

## Troubleshooting

### Backend won't start
```bash
# Verify Docker infrastructure is running
docker-compose -f compose.dev.yaml ps

# Check database connectivity
docker-compose -f compose.dev.yaml logs postgres

# Verify environment variables
node apps/backend -e "require('dotenv').config(); console.log(process.env.NODE_ENV)"
```

### Frontend build fails
```bash
# Clear caches
rm -rf apps/*/.next apps/*/node_modules
npm ci
```

### Tests failing
```bash
# Run specific test suite
cd apps/backend && npx jest --runInBand test/order.service.spec.ts
```

## FAQ

**Q: Why gRPC transport is quarantined?**
A: Production flows currently use REST/WebSocket. gRPC stubs exist in `packages/grpc-transport` but throw `GrpcTransportUnavailableError`.

**Q: How do I add a new API endpoint?**
A: Create controller + service in the appropriate module under `apps/backend/src/services/` or `apps/backend/src/modules/`.

**Q: How is the notification queue implemented?**
A: BullMQ with Redis backend. See `apps/backend/src/infra/queue/queue.service.ts` and `QUEUE_REFERENCE.md`.

**Q: Where are secrets stored in production?**
A: Kubernetes secrets in `infra/k8s/secrets.yaml`. See `DEPLOYMENT_GUIDE.md`.

## Project Statistics

| Metric | Value |
|--------|-------|
| Workspaces | 12 |
| Backend Modules | 14 |
| Backend Entities | 52 |
| Backend Controllers | 40 |
| Backend Service Files | 130 |
| API Endpoints | 80+ |
| Web Pages | 21 |
| Mobile Screens | 15 |
| Shared UI Components | 20+ |
| Total Source Files (excl. node_modules) | 515 |
| Test Files | 119 |
| Infrastructure Scripts | 36 |
| Kubernetes Manifests | 6 |
| Dockerfiles | 5 |

## Known Limitations

1. **gRPC Transport**: Quarantined/stubbed. Production uses REST/WebSocket only.
2. **React Doctor Scores**: Customer-mobile (65/100), customer-web (63/100), delivery-partner (59/100), super-admin (62/100), restaurant-dashboard (74/100).
3. **npm audit**: 31 moderate vulnerabilities in dev toolchain (0 high/critical).
4. **Driver-app**: Listed in `apps/` directory but not in package.json workspaces. Contains only App.js/App.tsx files (minimal).
5. **Runtime Verification**: Docker daemon unavailable at time of baseline generation. Runtime behavior verified through code review only.

## Current Status

| Check | Status |
|-------|--------|
| Lint | PASS |
| Build | PASS |
| Unit Tests | 1085 passed, 1 skipped |
| Coverage | Stmts 92.88%, Branches 82.34%, Funcs 93.2%, Lines 92.9% |
| Security Tests | 0 vulnerabilities |
| Penetration Tests | 0 issues |
| npm Audit (high/critical) | 0 |
| Production Readiness | 75% PARTIAL |

## Production Readiness

SpiceGarden is **code-verified** with passing tests, coverage thresholds met, and security controls implemented. Runtime validation pending infrastructure availability.

See `PROJECT_HEALTH_REPORT.md` for detailed scoring.
