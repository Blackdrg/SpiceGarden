# SpiceGarden Project Structure

**Version:** 0.0.0  
**Last Updated:** 2026-06-27

---

## Root Directory

```
C:\Users\mehta\Desktop\SpiceGarden\
├── .env.example                  # Environment template
├── .env                          # Local environment overrides
├── .env.staging.example          # Staging template
├── .env.production.example       # Production template
├── .dockerignore                 # Docker ignore
├── .eslintrc.cjs                 # ESLint root config
├── .gitignore                    # Git ignore
├── .npmrc                        # npm config
├── .markdownlint.json            # Markdown linting
├── .webhintrc.json              # Webhint config
├── Dockerfile                    # Root Dockerfile
├── compose.dev.yaml              # Development compose (13 services)
├── compose.debug.yaml            # Debug compose
├── compose.infra.yaml            # Infrastructure compose
├── compose.yaml                  # Base compose
├── package.json                  # Root workspace config
├── tsconfig.json                 # TypeScript project references
├── playwright.config.ts          # Playwright E2E config
├── AGENTS.md                     # Development commands
├── README.md                     # Project documentation
├── CONTRIBUTING.md               # Contribution guide
├── LICENSE                       # MIT License
```

---

## Applications (`apps/`)

```
apps/
├── backend/                      # NestJS API (port 3001)
│   ├── src/
│   │   ├── main.ts               # Entry point (269 lines)
│   │   ├── app.module.ts         # Root module (28 imports)
│   │   ├── apis.module.ts        # APIs module
│   │   ├── apis.controller.ts    # APIs controller
│   │   ├── apis.service.ts       # APIs service
│   │   ├── audit/                # Audit logging module
│   │   ├── common/errors/        # MissingEnvError
│   │   ├── compliance/           # SOC2, PCI-DSS, GDPR/DPDP
│   │   │   ├── compliance.module.ts
│   │   │   ├── compliance.controller.ts
│   │   │   ├── compliance.service.ts
│   │   │   ├── pci-dss-validation.service.ts
│   │   │   ├── secrets-rotation.service.ts
│   │   │   └── soc2-readiness.service.ts
│   │   ├── controllers/          # Legacy/plus controllers
│   │   │   └── driver.controller.ts
│   │   ├── db/
│   │   │   ├── db.module.ts      # TypeORM + Mongoose config
│   │   │   ├── db-repositories.module.ts
│   │   │   ├── local-repository.module.ts
│   │   │   ├── postgres.adapter.ts
│   │   │   ├── mongo.adapter.ts
│   │   │   ├── redis.adapter.ts
│   │   │   ├── database-failover.service.ts
│   │   │   ├── interfaces/       # Database adapter interface
│   │   │   ├── entities/         # 66 TypeORM entities
│   │   │   └── schemas/           # Mongoose schema (reviews)
│   │   ├── grpc/                  # gRPC stubs (quarantined)
│   │   ├── infra/
│   │   │   ├── queue/             # BullMQ queue service
│   │   │   │   ├── queue.module.ts
│   │   │   │   ├── queue.service.ts
│   │   │   │   └── order.processor.ts
│   │   │   ├── tracking/          # WebSocket tracking gateway
│   │   │   ├── logging/           # Structured logging
│   │   │   └── metrics/           # Prometheus metrics
│   │   ├── jobs/                  # Background jobs
│   │   │   └── retention-job.ts
│   │   ├── legal/                 # Legal document APIs
│   │   │   ├── legal.module.ts
│   │   │   └── legal.controller.ts
│   │   ├── logging/               # Logging module
│   │   ├── metrics/               # Metrics module
│   │   │   ├── metrics.module.ts
│   │   │   ├── metrics.service.ts
│   │   │   └── latency-metrics.interceptor.ts
│   │   ├── modules/
│   │   │   ├── analytics/         # Business analytics
│   │   │   ├── driver-assignment/ # Dispatch, ETA, fraud, SLA
│   │   │   └── kitchen/            # Kitchen operations
│   │   ├── security/              # Auth, RBAC, encryption, rate limiting
│   │   │   ├── security.module.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── permission.guard.ts
│   │   │   ├── permissions.ts
│   │   │   ├── roles.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   ├── csrf.middleware.ts
│   │   │   ├── cors-origin.ts
│   │   │   ├── redis-rate-limit.store.ts
│   │   │   ├── encryption.service.ts
│   │   │   └── vault.service.ts
│   │   ├── services/               # Business logic services
│   │   │   ├── admin/
│   │   │   ├── ai/
│   │   │   ├── auth/               # Auth service + strategies
│   │   │   ├── delivery/           # Delivery ops
│   │   │   ├── driver-fleet/       # Fleet management
│   │   │   ├── finance/            # Reconciliation, tax
│   │   │   ├── geo/                # Maps, ETA
│   │   │   ├── gst/                # GST calculation
│   │   │   ├── loyalty/            # Coupons, referrals
│   │   │   ├── maps/
│   │   │   ├── menu-customization/
│   │   │   ├── notifications/      # Push, SMS, Email
│   │   │   ├── order/              # Order lifecycle
│   │   │   ├── payments/           # Stripe, Razorpay, fraud, webhooks
│   │   │   ├── payment-provider/   # Stripe Connect, Razorpay settlements
│   │   │   ├── restaurant/         # CRUD, onboarding, KDS, business
│   │   │   ├── refund/             # Refund workflow
│   │   │   ├── review/             # Reviews (MongoDB)
│   │   │   ├── search/
│   │   │   ├── support/            # Tickets, disputes
│   │   │   ├── user/               # Profile, addresses
│   │   │   └── users/              # Payment methods
│   │   ├── shared/                 # Domain interfaces + contracts
│   │   └── types/                  # TypeScript declarations
│   │   ├── test/                   # 68+ test files + load + chaos
│   │   └── test/chaos/             # 6 chaos YAML + playbook
│   ├── tests/                      # Additional test utilities
│   ├── scripts/                    # Seed scripts
│   │   ├── seed.ts
│   │   └── seed-local.ts
│   ├── coverage/                   # Coverage reports
│   ├── dist/                       # Build output
│   └── package.json
│
├── customer-web/                   # Next.js storefront (port 3002)
│   ├── src/
│   │   ├── _app.tsx                # Root app (Redux + Query + ErrorBoundary)
│   │   ├── analytics.ts            # useAnalytics hook
│   │   ├── middleware.ts           # Request ID injection
│   │   ├── components/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── OfflineIndicator.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/
│   │   │   └── NetworkStatusContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAddresses.ts
│   │   │   ├── useMotion.ts
│   │   │   ├── useNetworkStatus.ts
│   │   │   ├── useOfflineQueue.ts
│   │   │   └── useTracking.ts
│   │   ├── pages/
│   │   │   ├── index.tsx           # Home
│   │   │   ├── auth.tsx            # Login/Register
│   │   │   ├── auth/callback.tsx
│   │   │   ├── reset-password.tsx
│   │   │   ├── menu.tsx
│   │   │   ├── cart.tsx
│   │   │   ├── checkout.tsx
│   │   │   ├── tracking.tsx
│   │   │   ├── history.tsx
│   │   │   ├── order-details.tsx
│   │   │   ├── restaurant.tsx
│   │   │   ├── search.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── addresses.tsx
│   │   │   ├── payment-methods.tsx
│   │   │   ├── wallet.tsx
│   │   │   ├── subscriptions.tsx
│   │   │   ├── offers.tsx
│   │   │   ├── notifications.tsx
│   │   │   ├── legal/terms.tsx
│   │   │   ├── legal/privacy.tsx
│   │   │   └── api/                # API routes (mock)
│   │   ├── redux/
│   │   │   ├── store.ts
│   │   │   └── slices/ (authSlice, cartSlice)
│   │   └── styles/
│   │       └── designTokens.module.css
│   ├── public/
│   ├── .github/workflows/
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── restaurant-dashboard/            # Next.js KDS (port 3003)
│   ├── src/
│   │   ├── _app.tsx
│   │   ├── pages/
│   │   │   ├── index.tsx           # KDS
│   │   │   ├── onboarding/         # 6-step wizard
│   │   │   └── api/                # API routes (mock)
│   │   └── redux/
│   │       └── store.ts
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── super-admin/                     # Next.js admin (port 3004)
│   ├── src/
│   │   ├── _app.tsx
│   │   ├── pages/
│   │   │   ├── index.tsx           # Dashboard
│   │   │   ├── api/admin/stats.ts
│   │   │   ├── api/orders.ts
│   │   │   ├── analytics/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── customers.tsx
│   │   │   │   └── top-dishes.tsx
│   │   │   ├── driver-fleet/       # Overview, incentives, penalties, earnings, shifts
│   │   │   └── loyalty/            # Dashboard, coupons, referrals
│   │   └── components/             # Dashboard components (20+)
│   │       ├── types.ts            # Types + reducer
│   │       ├── OverviewTab.tsx
│   │       ├── OrdersTab.tsx
│   │       ├── BranchesTab.tsx
│   │       ├── SupportTab.tsx
│   │       ├── KPICard.tsx
│   │       ├── RevenueChart.tsx
│   │       ├── OrdersCharts.tsx
│   │       ├── FraudDetection.tsx
│   │       ├── RefundManagement.tsx
│   │       └── ...
│   ├── instrumentation.ts          # OpenTelemetry + Sentry
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── customer-mobile/                 # Expo React Native
│   ├── src/
│   │   ├── @types/
│   │   ├── components/             # OrderCard, OrderTabs, etc.
│   │   ├── constants/              # API, i18n, storage keys
│   │   ├── hooks/                  # useHaptics, useOrderHistory
│   │   ├── navigation/
│   │   │   └── types.ts
│   │   ├── screens/                # 14 mobile screens
│   │   │   ├── AuthScreen.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── CartScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── TrackingScreen.tsx  # Stub
│   │   │   ├── HistoryScreen.tsx
│   │   │   ├── SearchScreen.tsx
│   │   │   ├── RestaurantScreen.tsx # Incomplete
│   │   │   ├── CheckoutScreen.tsx
│   │   │   ├── AddressesScreen.tsx
│   │   │   ├── PaymentMethodsScreen.tsx
│   │   │   ├── NotificationsScreen.tsx
│   │   │   ├── OnboardingScreen.tsx
│   │   │   └── MenuItemCustomizationScreen.tsx
│   │   ├── services/               # Location, WebSocket, Order, Push
│   │   ├── storage/                # AsyncStorage keys
│   │   ├── types/                  # TypeScript types
│   │   └── utils/                  # Currency, validation, navigation
│   ├── web/                        # Web variant build
│   ├── dist-web/                   # Compiled web
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── delivery-partner/                # Expo React Native
│   ├── src/
│   │   ├── @types/
│   │   ├── services/               # Location, Delivery API, Storage
│   │   └── App.tsx                 # ALL in one (769 lines)
│   ├── android/                    # Android native
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
│
└── launcher/                        # Electron Windows
    ├── src/
    │   ├── main/                   # TypeScript main process
    │   ├── renderer/               # React renderer
    │   └── assets/
    ├── webpack.renderer.config.js
    ├── jest.config.js
    ├── tsconfig.json
    └── package.json
```

---

## Shared Packages (`packages/`)

```
packages/
├── ui/                    # @spicegarden/ui — React component library
│   ├── src/
│   │   ├── index.ts          # Barrel export
│   │   ├── tokens.ts         # Design tokens
│   │   ├── analytics.ts      # Analytics hook, useWebVitals
│   │   ├── useFlow.ts        # Multi-step flow hook
│   │   ├── Button.tsx, Card.tsx, Input.tsx, Modal.tsx, Toast.tsx
│   │   ├── Skeleton.tsx, LoadingStates.tsx
│   │   ├── OTPInput.tsx, SearchInput.tsx, Stepper.tsx
│   │   ├── ErrorBoundary.tsx, FlowManager.tsx, Dropdown.tsx
│   │   └── icons/            # 50+ SVG icons
│   ├── __tests__/            # 5 test files
│   ├── jest.config.js
│   ├── jest.setup.ts
│   └── package.json
│
├── shared/                # @spicegarden/shared — Utilities + API client
│   ├── index.ts             # Re-exports
│   ├── types.ts             # Core domain types
│   ├── constants.ts         # API_URL, SOCKET_URL (localhost!)
│   ├── api.ts               # API client factory
│   ├── analytics.ts         # Event types
│   ├── __tests__/           # 2 test files
│   ├── jest.config.js
│   └── package.json
│
├── api-types/             # @spicegarden/api-types — Type contracts
│   ├── src/index.ts        # DriverProfile, DeliveryOrder, EarningsSummary
│   ├── package.json
│   └── tsconfig.json
│
├── proto/                 # @spicegarden/proto — Protobuf definitions
│   ├── src/index.ts        # GRPC_PORT, GRPC_HOST, GRPC_URL
│   ├── src/types.ts
│   ├── src/constants.ts    # GRPCMetadata, ProtoDriver, ProtoOrder
│   ├── package.json
│   └── tsconfig.json
│
├── grpc-transport/        # @spicegarden/grpc-transport — QUARANTINED
│   ├── src/index.ts        # Always throws GrpcTransportUnavailableError
│   ├── package.json
│   └── tsconfig.json
│
└── ux/                    # @spicegarden/ux — Design docs only
    └── phase-1/            # 13 markdown UX specs, Figma workspace structure
```

---

## Infrastructure (`infra/`)

```
infra/
├── backend/Dockerfile          # Backend Docker build
├── customer-web/Dockerfile
├── restaurant-dashboard/Dockerfile
├── super-admin/Dockerfile
├── delivery-partner/Dockerfile
├── k8s/                        # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── production-hardened.yaml
│   ├── postgres-ha.yaml
│   ├── redis-cluster.yaml
│   ├── cdn-ingress.yaml
│   ├── configmap.yaml
│   └── secrets.yaml
├── prometheus/
│   ├── prometheus.yml           # Production config
│   ├── prometheus.dev.yml       # Dev config
│   └── rules/
│       └── alerts.yml           # 5 alert rules
├── grafana/
│   ├── dashboards/
│   │   └── spicegarden.json     # Main dashboard
│   └── provisioning/             # Empty
├── alertmanager/
│   └── alertmanager.yml          # Slack + PagerDuty
├── opensearch/
│   └── index-templates/          # Index templates
├── filebeat/                     # Log shipping config
├── envoy/                         # Service mesh config
├── postgres/
│   ├── migrations/               # InitialSchema20240101000001 (up + down)
│   ├── seed/                     # 002 SQL seed files
│   └── init.sql                  # Container init
├── scripts/                      # 36 operational scripts
│   ├── backup.sh                 # Linux backup
│   ├── backup.ps1                # Windows backup
│   ├── backup-verification.sh
│   ├── breaking-point.js
│   ├── chaos-runner.js
│   ├── compose-protos.js
│   ├── deployment-check.js
│   ├── disaster-recovery.sh
│   ├── docker-stability-check.sh
│   ├── e2e-seed-fixtures.js
│   ├── fake-orders.js
│   ├── generate-secrets.ps1
│   ├── law-check.js
│   ├── load-secrets.sh
│   ├── load-secrets.ps1
│   ├── live-driver-simulation.js
│   ├── penetration-tests.js
│   ├── production-validation.sh
│   ├── quick-start.sh
│   ├── restore.sh
│   ├── security-tests.js
│   ├── setup-secrets.sh
│   ├── validate-env-consistency.js
│   ├── validate-secrets.js
│   └── verify-stack.js
└── src/                          # Infra source (if any)
```

---

## CI/CD

```
.github/
└── workflows/
    ├── ci-cd.yml                 # CI/CD pipeline (security, build, test, deploy)
    ├── react-doctor.yml          # React Doctor checks
    └── rollback.yml              # Rollback procedures
```

---

## Other Directories

```
docs/              # Documentation
├── architecture/
├── audIT/
├── diagnostics/
├── prod-readiness/
├── production-readiness/
└── security/

k8s/               # Root K8s manifests
├── backend-deployment.yaml
└── production-hardened.yaml

backup/            # SQL backups
├── spicegarden_backup_2026-06-13T14-03-51_postgres.sql
├── spicegarden_backup_2026-06-15T02-02-00_postgres.sql
└── spicegarden_backup_2026-06-15T02-10-02_postgres.sql

logs/              # Log output
secrets/           # Runtime secrets (gitignored)
reports/           # Test and security reports
scripts/           # Root scripts
├── dev/
├── architecture/
├── audIT/
├── diagnostics/
└── prod-readiness/

legal/             # Trademark search
.vscode/           # VSCode settings
__tests__/         # Root test utilities
├── auth-security.test.ts
└── test-utils.ts

.storybook/        # Storybook config
.kilo/             # Kilo config
.kilocode/         # KiloCode config
```

---

## Workspace Names

| Name | Path |
|------|------|
| `@spicegarden/backend` | `apps/backend` |
| `@spicegarden/customer-web` | `apps/customer-web` |
| `@spicegarden/restaurant-dashboard` | `apps/restaurant-dashboard` |
| `@spicegarden/super-admin` | `apps/super-admin` |
| `@spicegarden/customer-mobile` | `apps/customer-mobile` |
| `@spicegarden/delivery-partner` | `apps/delivery-partner` |
| `spicegarden-launcher` | `apps/launcher` |
| `@spicegarden/ui` | `packages/ui` |
| `@spicegarden/shared` | `packages/shared` |
| `@spicegarden/api-types` | `packages/api-types` |
| `@spicegarden/proto` | `packages/proto` |
| `@spicegarden/grpc-transport` | `packages/grpc-transport` |
