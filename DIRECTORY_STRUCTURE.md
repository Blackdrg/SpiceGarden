# Directory Structure

**Date:** 2026-06-26
**Scope:** SpiceGarden Monorepo Structure
**Classification:** Evidence-based

## Root Directory

```
SpiceGarden/
├── apps/                    # Applications
├── packages/                # Shared packages
├── infra/                   # Infrastructure
├── .github/                 # GitHub workflows
├── compose.dev.yaml         # Docker Compose (9 services)
├── package.json             # Root: workspaces, scripts
├── tsconfig.json            # TypeScript base config
├── .env.example             # Environment template
└── README.md                # Project overview
```

## Applications (`apps/`)

### Backend (`/apps/backend/`)

```
src/
├── app.module.ts            # Main module (19 imports)
├── main.ts                  # Bootstrap (security, metrics, CORS)
├── main-grpc.ts             # gRPC server entry
├── apis.module.ts           # External APIs module
├── apis.controller.ts       # API controller
├── app.controller.ts        # App controller
├── app.service.ts           # App service
├── types/                   # Type declarations
│   ├── bullmq.d.ts
│   ├── crypto-js.d.ts
│   ├── global.d.ts
│   ├── node.d.ts
│   ├── passport-*.d.ts
│   └── sentry-node.d.ts
├── security/                # All security controls
│   ├── security.module.ts
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   ├── permissions.guard.ts
│   ├── cors-origin.ts
│   ├── csrf.middleware.ts
│   ├── redis-rate-limit.store.ts
│   └── vault.service.ts
├── db/                      # Database layer
│   ├── db.module.ts
│   ├── db-repositories.module.ts
│   ├── postgres.adapter.ts
│   ├── mongo.adapter.ts
│   ├── redis.adapter.ts
│   ├── entities/            # TypeORM entities
│   └── schemas/             # Mongoose schemas
├── services/                # Business logic
│   ├── auth/                # Authentication
│   ├── order/               # Order management
│   ├── payments/            # Payment processing
│   ├── restaurant/          # Restaurant operations
│   ├── delivery/            # Delivery management
│   ├── wallet/              # Wallet/guild
│   ├── loyalty/             # Loyalty program
│   ├── notifications/       # Push/email
│   ├── support/             # Support tickets
│   ├── search/              # Search functionality
│   ├── gst/                 # GST/tax
│   ├── finance/             # Financial reporting
│   ├── refund/              # Refund processing
│   └── driver-fleet/        # Fleet management
├── modules/                 # Cross-domain modules
│   ├── driver-assignment/   # Driver dispatch
│   ├── ledger/              # Accounting ledger
│   ├── realtime/            # WebSocket module
│   ├── kitchen/             # Kitchen operations
│   └── analytics/           # Analytics
├── infra/                   # Infrastructure services
│   ├── queue/               # BullMQ queues
│   ├── tracking/            # Tracking gateway
│   └── observability/       # Logging/metrics
├── audit/                   # Audit trail
├── compliance/              # Compliance checks
├── logging/                 # Structured logging
├── metrics/                 # Prometheus metrics
├── gateway/                 # API gateway
└── grpc/                    # gRPC services
```

### customer-web (`/apps/customer-web/`)

```
src/
├── pages/                   # 21 routes
│   ├── index.tsx            # Home
│   ├── auth.tsx             # Auth
│   ├── cart.tsx             # Cart
│   ├── checkout.tsx         # Checkout
│   ├── history.tsx          # History
│   ├── profile.tsx          # Profile
│   ├── tracking.tsx         # Tracking
│   ├── wallet.tsx           # Wallet
│   ├── subscriptions.tsx    # Subscriptions
│   ├── search.tsx           # Search
│   ├── offers.tsx           # Offers
│   ├── notifications.tsx    # Notifications
│   ├── _app.tsx             # App wrapper (Redux, React Query)
│   ├── legal/               # Privacy/Terms
│   ├── auth/callback.tsx    # OAuth callback
│   ├── order-details.tsx    # Order details
│   └── addresses.tsx        # Addresses
├── redux/                   # Redux Toolkit
│   └── store.ts             # Store config
├── components/              # UI components
├── hooks/                   # Custom hooks
├── contexts/                # React contexts
└── analytics/               # Analytics integration
```

### restaurant-dashboard (`/apps/restaurant-dashboard/`)

```
src/
├── pages/
│   ├── index.tsx            # Dashboard
│   └── kds/                 # Kitchen display
├── redux/
├── components/
└── __tests__/               # E2E tests
```

### super-admin (`/apps/super-admin/`)

```
src/
├── pages/
│   ├── index.tsx            # Admin dashboard
│   ├── analytics/           # Analytics pages
│   ├── driver-fleet/        # Fleet management
│   └── loyalty/             # Loyalty program
├── redux/
├── components/
└── __tests__/               # E2E tests
```

### customer-mobile (`/apps/customer-mobile/`)

```
src/
├── screens/                 # ~14 screens
├── services/                # API services
├── navigation/              # Navigation setup
├── hooks/                   # Custom hooks
├── constants/               # Constants
└── __tests__/               # Tests
```

### delivery-partner (`/apps/delivery-partner/`)

```
src/
├── services/
│   ├── delivery-api.service.ts
│   ├── location.service.ts
│   └── storage.service.ts
├── __tests__/               # Tests
└── android/                 # Native Android
```

## Packages (`packages/`)

```
packages/
├── ui/                      # Shared React components
│   ├── src/
│   └── package.json
├── shared/                  # Utilities
│   ├── api.ts
│   ├── constants.ts
│   ├── types.ts
│   └── index.ts
├── api-types/               # API contracts
├── proto/                   # Protobuf
└── grpc-transport/          # Stubbed (quarantined)
```

## Infrastructure (`infra/`)

```
infra/
├── k8s/                      # Kubernetes manifests
│   ├── production-hardened.yaml
│   ├── staging.yaml
│   ├── cdn-ingress.yaml
│   ├── backend-deployment.yaml
│   ├── redis-cluster.yaml
│   └── postgres-ha.yaml
├── prometheus/                 # Metrics
│   ├── prometheus.yml
│   ├── prometheus.dev.yml
│   └── rules/
├── grafana/                    # Dashboards
│   ├── dashboards/spicegarden.json
│   └── provisioning/
├── alertmanager/               # Alerts
│   └── alertmanager.yml
├── postgres/                   # Database
│   ├── init.sql
│   ├── migrations/
│   └── seed/
├── opensearch/                 # Logging
│   └── index-templates/
├── envoy/                      # Proxy
│   └── envoy.yaml
├── scripts/                    # 14 scripts
│   ├── security-tests.js
│   ├── penetration-tests.js
│   ├── verify-stack.js
│   ├── backup.sh
│   ├── disaster-recovery.sh
│   ├── load-secrets.sh
│   ├── generate-secrets.ps1
│   └── autoscaling-validation.sh
└── docs/                       # Documentation
    ├── LOAD_BENCHMARKS.md
    ├── MULTI_REGION_ARCHITECTURE.md
    └── API_VERSION_STRATEGY.md
```

## GitHub Workflows (`.github/`)

```
.github/
└── workflows/
    ├── ci-cd.yml            # CI/CD pipeline
    ├── react-doctor.yml     # Frontend quality
    └── rollback.yml         # Deployment rollback
```

## File Counts

| Directory | TypeScript Files | Test Files |
|-----------|------------------|------------|
| apps/backend/src | ~150 | ~68 |
| apps/customer-web/src | ~40 | 4 |
| apps/restaurant-dashboard/src | ~20 | 1 |
| apps/super-admin/src | ~20 | 1 |
| apps/delivery-partner/src | ~10 | 3 |
| packages/ | ~20 | ~5 |

## Build Artifacts

| App | Output Directory |
|-----|------------------|
| backend | `apps/backend/dist/` |
| customer-web | `apps/customer-web/.next/` |
| restaurant-dashboard | `apps/restaurant-dashboard/.next/` |
| super-admin | `apps/super-admin/.next/` |
| delivery-partner | `apps/delivery-partner/dist-web/` |