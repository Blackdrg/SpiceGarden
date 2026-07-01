# SpiceGarden

**SpiceGarden** is a production-scale food delivery platform built as an npm-workspace monorepo. It implements a complete multi-stakeholder ecosystem covering customers, restaurants, kitchen staff, delivery partners, and platform administrators.

## Project Overview

A unified food delivery platform connecting customers with restaurants through real-time order management, payments, delivery tracking, and notifications. The platform supports multiple user roles with granular authorization controls.

## Architecture Summary

The platform uses a modular monolith architecture centered on NestJS with polyglot persistence (PostgreSQL + MongoDB + Redis) and multi-channel frontends (Next.js web, Expo React Native mobile, Electron desktop).

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
│       BACKEND: NestJS API Gateway      │
│       Port 3001                         │
│       apps/backend                      │
└─────────────────────┬───────────────────┘
                      │
         ┌─────┬──────┼──────┬────────────┐
         │     │      │      │            │
    ┌────▼───┐ │ ┌────▼───┐ ┌▼───┐ ┌──────▼──────┐
    │PostgreSQL│ ││MongoDB │ │Redis│ │OpenSearch   │
    │Port 5432│ ││Port 27017│ │Port│ │Port 9200    │
    └────────┘ │ └─────────┘ └────┘ └─────────────┘
         │     │
         │┌────▼─────────────┐
         ││OBSERVABILITY      │
         ││Prometheus (9090)  │
         ││Grafana (3000)     │
         ││Alertmanager (9093) │
         ││Sentry (errors)    │
         │└──────────────────┘
```

## Features

### Core Features
| Domain | Implementation |
|--------|---------------|
| **Order Management** | Full lifecycle: placed → confirmed → preparing → ready → dispatched → delivered/cancelled |
| **Payments** | Stripe, Razorpay, COD gateways with webhooks, fraud detection, idempotency, retries, chargebacks |
| **Delivery Tracking** | Real-time driver location, ETA calculation, route optimization, SLA monitoring |
| **Notifications** | Push (FCM/APNs), SMS (Twilio), Email (SendGrid/Sendmail), in-app with preferences |
| **Loyalty** | Coupons, referrals, cashback processing |
| **Wallet** | Balance management, transactions, COD processing, double-payment prevention |
| **GST Compliance** | HSN/SAC codes, GST calculation, invoice generation, reconciliation |
| **Admin Console** | Analytics, driver fleet management, loyalty programs, support tickets |

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | NestJS | 11.1.27 |
| Language | TypeScript | 5.x |
| ORM | TypeORM | 1.0.0 |
| Document DB | MongoDB + Mongoose | 9.7.0 / 7.3.0 |
| Cache/Queue | Redis + BullMQ | 5.10.1 / 5.78.1 |
| WebSocket | Socket.IO | 4.7.0 |
| Web Frontend | Next.js | 15.5.18 |
| Mobile | Expo React Native | 56.0.12 |
| Desktop | Electron | 39.8.10 |
| State Management | Redux Toolkit | 2.2.0 |
| Server State | TanStack React Query | 5.0.0 |
| Charts | Recharts | 2.12.0 |
| Payments | Stripe + Razorpay | 15.0.0 |
| Auth | Passport JWT + OAuth2 | - |
| Monitoring | Prometheus + Grafana | v2.51.0 / v10.4.0 |
| Logging | OpenSearch | 2.15.0 |
| Error Tracking | Sentry | 10.58.0 |

## Repository Structure

```
spicegarden/
├─ apps/
│  ├─ backend/             # NestJS API (port 3001)
│  │  ├─ src/
│  │  │  ├─ modules/       # Feature modules (auth, orders, payments, delivery)
│  │  │  ├─ services/      # Business logic services (58+ services)
│  │  │  ├─ db/            # TypeORM entities (66 entities), schemas
│  │  │  ├─ security/      # Auth guards, encryption, rate limiting
│  │  │  ├─ infra/         # Queue, tracking, observability
│  │  │  ├─ controllers/ # API controllers (41 controllers)
│  │  │  ├─ compliance/    # SOC2, PCI-DSS, GDPR/DPDP
│  │  │  ├─ audit/         # Audit logging
│  │  │  ├─ logging/       # Structured logging
│  │  │  ├─ metrics/       # Prometheus metrics
│  │  │  └─ shared/        # Domain interfaces
│  ├─ customer-web/        # Next.js storefront (port 3002)
│  ├─ restaurant-dashboard/# Next.js kitchen dashboard (port 3003)
│  ├─ super-admin/         # Next.js admin console (port 3004)
│  ├─ customer-mobile/     # Expo React Native
│  ├─ delivery-partner/    # Expo React Native
│  └─ launcher/            # Electron Windows launcher
├─ packages/
│  ├─ ui/                  # Shared React component library (@spicegarden/ui)
│  ├─ shared/              # Shared TypeScript utilities (@spicegarden/shared)
│  ├─ api-types/           # Shared API contracts (@spicegarden/api-types)
│  ├─ proto/               # Protobuf definitions (@spicegarden/proto)
│  └─ grpc-transport/      # Quarantined placeholder (@spicegarden/grpc-transport)
└─ infra/
   ├─ k8s/                 # Kubernetes manifests
   ├─ prometheus/           # Metrics configuration
   ├─ grafana/              # Dashboards provisioning
   ├─ backend/              # Dockerfiles
   └─ scripts/              # 18 operational scripts
```

## Monorepo Layout

The project uses npm workspaces with 7 apps and 5 shared packages:

| Package | Purpose | Entry Point |
|---------|---------|-------------|
| `@spicegarden/backend` | NestJS API server | `dist/src/main.js` |
| `@spicegarden/customer-web` | Customer storefront | Next.js |
| `@spicegarden/restaurant-dashboard` | Kitchen dashboard | Next.js |
| `@spicegarden/super-admin` | Admin console | Next.js |
| `@spicegarden/customer-mobile` | Customer mobile app | Expo |
| `@spicegarden/delivery-partner` | Driver app | Expo |
| `spicegarden-launcher` | Windows desktop launcher | Electron |
| `@spicegarden/ui` | Shared React components | `index.js` |
| `@spicegarden/shared` | Shared utilities | `dist/index.js` |
| `@spicegarden/api-types` | TypeScript interfaces | `src/index.ts` |
| `@spicegarden/proto` | Protobuf definitions | `src/index.ts` |
| `@spicegarden/grpc-transport` | Quarantined placeholder | `src/index.ts` |

## Quick Start

```bash
# Clone repository
git clone <repository-url> spicegarden
cd spicegarden

# Install dependencies
npm ci

# Start development infrastructure
docker-compose -f compose.dev.yaml up -d

# Start backend (from repository root)
npm run dev --workspace=@spicegarden/backend

# Start frontends
npm run dev --workspace=@spicegarden/customer-web
npm run dev --workspace=@spicegarden/restaurant-dashboard
npm run dev --workspace=@spicegarden/super-admin
```

## Development Setup

### Prerequisites
- Node.js 20.x
- npm 10+
- Docker & Docker Compose (for infrastructure)
- PostgreSQL 16, MongoDB 7, Redis 7 (or use Docker Compose)

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required: DB_USER, DB_PASS, JWT_SECRET, ENCRYPTION_SECRET
# Optional: STRIPE_SECRET_KEY, RAZORPAY_KEY_ID, FCM_SERVER_KEY
```

### Running Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# All tests
npm run test:all

# Load tests (k6)
npm run test:load:1k          # 1,000 virtual users
npm run test:load:5k          # 5,000 virtual users
npm run test:load:10k         # 10,000 virtual users
npm run test:load:20k         # 20,000 virtual users (up to 1m)

# Security tests
node infra/scripts/security-tests.js
node infra/scripts/penetration-tests.js
```

## Docker Setup

### Development Environment
```bash
docker-compose -f compose.dev.yaml up -d
```

Services started:
- `postgres:5432` - PostgreSQL database
- `mongo:27017` - MongoDB document store
- `redis:6379` - Redis cache/queue
- `prometheus:9090` - Metrics endpoint
- `grafana:3000` - Dashboards
- `opensearch:9200` - Log aggregation
- `alertmanager:9093` - Alert routing
- `backend:3001` - API server
- `customer-web:3002` - Customer frontend
- `restaurant-dashboard:3003` - Restaurant frontend
- `super-admin:3004` - Admin frontend

### Production Build
```bash
docker-compose -f compose.dev.yaml build
docker-compose -f compose.dev.yaml up -d
```

## Kubernetes Deployment

### Staging
```bash
kubectl apply -f infra/k8s/staging.yaml -n spicegarden-staging
```

### Production (Hardened)
```bash
kubectl apply -f infra/k8s/production-hardened.yaml -n spicegarden-production
kubectl apply -f infra/k8s/cdn-ingress.yaml -n spicegarden-production
```

Production hardening includes:
- 3 replicas with rolling updates
- PodDisruptionBudget (minAvailable: 2)
- HorizontalPodAutoscaler (min 3, max 20 at 70% CPU / 80% memory)
- SecurityContext: runAsNonRoot, runAsUser 1001, readOnlyRootFilesystem
- NetworkPolicy restricted ingress/egress
- Daily backup CronJob at 2AM

## Environment Variables Summary

### Required Backend Variables
| Variable | Purpose | Required |
|----------|---------|----------|
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_USER` | PostgreSQL username | Yes |
| `DB_PASS` | PostgreSQL password | Yes |
| `DB_NAME` | PostgreSQL database | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Yes |
| `ENCRYPTION_SECRET` | AES-256 encryption key | Yes |

### Optional/Integration Variables
| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe payment gateway |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook validation |
| `RAZORPAY_KEY_ID` | Razorpay INR payments |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `FCM_SERVER_KEY` | Firebase push notifications |
| `GOOGLE_MAPS_API_KEY` | Maps and ETA calculation |
| `TWILIO_ACCOUNT_SID` | SMS notifications |

## Testing Commands

| Test Type | Command | Description |
|-----------|---------|-------------|
| Unit | `npm run test:unit` | Jest unit tests |
| Integration | `npm run test:integration` | Database/integration tests |
| E2E | `npm run test:e2e` | End-to-end tests |
| Load | `npm run test:load` | k6 10k VU test |
| Load 20k | `npm run test:load:20k` | k6 20k VU test |
| Chaos | `npm run test:chaos` | Kubernetes chaos experiments |
| Security | `node infra/scripts/security-tests.js` | Vulnerability scan |
| Penetration | `node infra/scripts/penetration-tests.js` | Security audit |

## Monitoring

- **Prometheus**: Metrics at `/metrics` endpoint
- **Grafana**: Dashboards provisioned in `infra/grafana/`
- **Alertmanager**: Slack + PagerDuty routing
- **Sentry**: Error tracking with distributed traces
- **OpenSearch**: Log aggregation and search

### Custom Metrics
- `http_requests_total` - Request counter by method, route, status
- `http_request_duration_seconds` - Latency histogram
- Default Node.js metrics via prom-client

## Security

| Control | Implementation |
|---------|----------------|
| HTTP Security | helmet (CSP, HSTS, XSS protection) |
| CORS | Strict whitelist (no wildcards) |
| CSRF | Double-submit cookie pattern |
| Input Sanitization | mongo-sanitize |
| Parameter Pollution | hpp middleware |
| Rate Limiting | Redis-backed express-rate-limit |
| Password Hashing | Argon2 / bcrypt |
| PII Encryption | AES-256 via EncryptionService |
| Auth Guards | JwtAuthGuard, RolesGuard, PermissionGuard |

## Load Testing

k6 load tests with stages from 1k to 1m virtual users:

```javascript
// Stages configuration (infra/load-tests/)
{ duration: '2m', target: 1000 },    // Ramp-up to 1k VUs
{ duration: '30m', target: 1000 },  // Hold at 1k
{ duration: '2m', target: 0 }        // Ramp-down
```

Available scenarios:
- `test:load:1k` through `test:load:1m` - Scaling load tests
- `test:load:websocket` - WebSocket stress test
- `test:load:database` - Database stress test
- `test:load:payment` - Payment flow stress test
- `test:load:security` - Security under load

## Production Deployment

### Infrastructure Requirements
- Kubernetes cluster (1.28+)
- PostgreSQL 16 with HA setup
- MongoDB 7 replica set recommended
- Redis cluster for scaling
- Object storage for static assets

### Deployment Checklist
1. Configure secrets in `infra/k8s/secrets.yaml`
2. Update environment variables
3. Run database migrations: `npm run migration:run`
4. Deploy: `kubectl apply -f infra/k8s/production-hardened.yaml`
5. Verify: `npm run verify:stack`

## License

MIT License. See `LEGAL.md` for details.

## Contribution

See `CONTRIBUTING.md` for contribution guidelines. Code follows established patterns in each workspace.

## Roadmap

See `ROADMAP.md` for feature roadmap.

## Known Limitations

1. **gRPC Transport**: Quarantined/stubbed. Production uses REST/WebSocket only.
2. **React Doctor Scores**: Customer-mobile (65/100), customer-web (63/100), delivery-partner (59/100), restaurant-dashboard (74/100), super-admin (62/100).
3. **npm audit**: 31 moderate vulnerabilities in dev toolchain (0 high/critical).

## Production Readiness Status

| Check | Status |
|-------|--------|
| Build | ✅ 12 workspaces, exit code 0 |
| Lint | ✅ 0 errors across all workspaces |
| Unit Tests | ✅ 542 passed, 0 failed (28 suites) |
| Backend Coverage | ✅ Statements 91.28% / Branches 81.1% / Functions 91.22% / Lines 91.21% |
| Security Tests | ✅ 0 vulnerabilities |
| Penetration Tests | ✅ 0 issues |
| Stack Boot | ✅ PASS (backend, grafana, prometheus, opensearch reachable) |
| Production Readiness | ⚠️ 75% PARTIAL (Phase 1 complete, Phase 2 in progress) |