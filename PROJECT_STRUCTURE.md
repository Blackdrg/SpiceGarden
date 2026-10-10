# Project Structure

**Version:** 1.0.0
**Date:** 2026-06-26
**Classification:** Evidence-based from source code

## Root Directory

```
spicegarden/
├-- package.json              # Root workspace config, npm scripts
├-- tsconfig.json             # TypeScript project references (12 workspaces)
├-- compose.yaml              # Minimal compose (single service)
├-- compose.dev.yaml          # Full development stack (13 services)
├-- compose.debug.yaml        # Debug compose variant
├-- compose.infra.yaml        # Infrastructure-only compose
├-- .env                      # Root environment variables
├-- .env.example              # Environment template (28 variables)
├-- .env.staging.example      # Staging environment template
├-- .env.production.example   # Production environment template
├-- node_modules/             # Root-level node_modules (1202 packages)
├-- README.md                 # Project overview
├-- AGENTS.md                 # Agent instructions
├-- ROADMAP.md                # Product roadmap
└-- [Documentation files]     # 100+ MD files (see Documentation section)
```

## Workspace: apps/ (Applications)

### apps/backend/ — NestJS API Server

```
apps/backend/
├── package.json              # @spicegarden/backend
├── tsconfig.json             # TypeScript config
├── tsconfig.build.json       # Build-specific TypeScript config
├── tsconfig.test.json        # Test TypeScript config
├── nest-cli.json             # NestJS CLI config
├── jest.config.js            # Jest configuration
├── .env                      # Development environment
├── standalone-package.json   # Self-contained package for deployment
├── src/
│   ├── main.ts               # Application bootstrap (NestFactory)
│   ├── app.module.ts         # Root module (35 imports)
│   ├── app.controller.ts     # Health check controller
│   ├── app.service.ts        # Health check service
│   │
│   ├── controllers/          # Legacy controllers
│   │   └── driver.controller.ts  # Driver + order delivery endpoints
│   │
│   ├── services/             # Business logic + API controllers
│   │   ├── auth/             # Authentication (JWT + OAuth2)
│   │   ├── order/            # Order management
│   │   ├── payments/         # Payment processing (Stripe/Razorpay/COD)
│   │   │   ├── gateways/     # Payment gateway implementations
│   │   │   ├── webhook/      # Webhook processing + retry
│   │   │   └── chargeback/   # Chargeback/dispute management
│   │   ├── restaurant/       # Restaurant operations
│   │   │   ├── onboarding/   # Restaurant onboarding flow
│   │   │   ├── kds.gateway.ts # Kitchen WebSocket gateway
│   │   │   └── business-engine/  # Business metrics engine
│   │   ├── search/           # Menu + restaurant search
│   │   ├── delivery/         # Delivery lifecycle
│   │   ├── admin/            # Admin dashboard API
│   │   ├── notifications/    # Notification service + queue
│   │   ├── wallet/           # Digital wallet management
│   │   ├── review/           # Customer reviews
│   │   ├── support/          # Support tickets + routing
│   │   ├── refund/           # Refund processing
│   │   ├── loyalty/          # Coupons + referrals + cashback
│   │   ├── finance/          # Tax reporting + reconciliation
│   │   ├── gst/              # GST calculation + invoices
│   │   ├── driver-fleet/     # Driver fleet management
│   │   ├── maps/             # ETA, rerouting, heatmap, surge zones
│   │   ├── ai/               # Recommendations, chatbot, demand forecast
│   │   ├── menu-customization/ # Menu variants, addons, categories
│   │   ├── user/             # User profile management
│   │   └── users/            # User addresses, payment methods
│   │
│   ├── modules/              # Feature modules
│   │   ├── auth/             # Auth module
│   │   ├── orders/           # Order module
│   │   ├── realtime/         # Realtime module (empty)
│   │   ├── kitchen/          # Kitchen inventory, recipes, SLA
│   │   ├── driver-assignment/ # Driver matching, ETA, SLA, fraud
│   │   ├── notifications/    # Notifications module
│   │   ├── ledger/           # Financial ledger
│   │   └── analytics/        # Business analytics
│   │
│   ├── db/                   # Database layer
│   │   ├── entities/         # 52 TypeORM entities
│   │   ├── schemas/          # Mongoose schemas
│   │   ├── interfaces/       # Database adapter interfaces
│   │   ├── db.module.ts      # DbModule (TypeORM + Mongoose)
│   │   ├── local-repository.module.ts # SQLite fallback
│   │   ├── db-repositories.module.ts
│   │   ├── postgres.adapter.ts
│   │   ├── mongo.adapter.ts
│   │   └── redis.adapter.ts
│   │
│   ├── security/             # Security module
│   │   ├── security.module.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   ├── roles.decorator.ts
│   │   ├── permission.guard.ts
│   │   ├── permissions.decorator.ts
│   │   ├── permissions.ts    # Role-permission matrix
│   │   ├── encryption.service.ts # AES-256 via CryptoJS
│   │   ├── cors-origin.ts    # Strict origin validation
│   │   ├── csrf.middleware.ts # CSRF protection
│   │   ├── redis-rate-limit.store.ts
│   │   └── vault.service.ts  # HashiCorp Vault integration
│   │
│   ├── infra/                # Infrastructure services
│   │   ├── queue/            # BullMQ job queue
│   │   ├── tracking/         # WebSocket tracking gateway
│   │   └── observability/    # Observability setup
│   │
│   ├── audit/                # Audit logging
│   ├── compliance/           # SOC2, PCI-DSS, GDPR/DPDP
│   ├── legal/                # Legal document APIs
│   ├── logging/              # Structured logging
│   ├── metrics/              # Prometheus metrics
│   ├── grpc/                 # gRPC controllers (stubs)
│   ├── gateway/              # WebSocket gateway module
│   ├── proto/                # Protobuf definitions
│   ├── shared/               # Shared domain interfaces
│   │   ├── domain/           # User, Order, Restaurant interfaces
│   │   └── contracts/        # Queue names, constants
│   └── types/                # Custom type declarations
│
├── test/                     # Integration, E2E, load, chaos tests
│   ├── load/                 # k6 load tests
│   │   ├── 10k-users.js
│   │   └── 20k-users.js
│   ├── chaos/                # Kubernetes chaos experiments
│   │   ├── chaos-postgres-*.yaml
│   │   ├── chaos-redis-*.yaml
│   │   └── chaos-websocket-delay.yaml
│   └── e2e.spec.ts
│
└── scripts/                  # Seed scripts
    └── seed-local.ts
```

### apps/customer-web/ — Next.js Storefront

```
apps/customer-web/
├── package.json              # @spicegarden/customer-web
├── tsconfig.json             # TypeScript config
├── next.config.js            # Next.js config (transpile @spicegarden/ui)
├── next-env.d.ts
├── eslint.config.js
├── jest.config.js
├── jest.setup.ts
├── sentry.client.config.ts   # Sentry client configuration
├── sentry.config.ts          # Sentry server configuration
├── public/                   # Static assets
├── src/
│   ├── pages/                # 21 routes (Pages Router)
│   │   ├── index.tsx         # Home page
│   │   ├── menu.tsx          # Restaurant menu
│   │   ├── cart.tsx          # Shopping cart
│   │   ├── checkout.tsx      # Checkout flow
│   │   ├── payment-methods.tsx
│   │   ├── wallet.tsx        # Digital wallet
│   │   ├── subscriptions.tsx
│   │   ├── tracking.tsx      # Order tracking
│   │   ├── order-details.tsx
│   │   ├── history.tsx       # Order history
│   │   ├── offers.tsx        # Promotions
│   │   ├── notifications.tsx
│   │   ├── profile.tsx       # User profile
│   │   ├── search.tsx        # Restaurant search
│   │   ├── restaurant.tsx    # Restaurant details
│   │   ├── addresses.tsx     # Address management
│   │   ├── auth.tsx          # Authentication
│   │   ├── auth/callback.tsx # OAuth callback
│   │   ├── reset-password.tsx
│   │   ├── legal/            # Terms, privacy
│   │   └── api/              # API route handlers
│   │
│   ├── components/           # Reusable UI components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   ├── redux/                # Redux Toolkit store
│   │   └── slices/           # authSlice.ts, cartSlice.ts
│   ├── styles/               # CSS modules
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
```

### apps/restaurant-dashboard/ — Kitchen Dashboard

```
apps/restaurant-dashboard/
├── package.json              # @spicegarden/restaurant-dashboard
├── tsconfig.json
├── next.config.js            # Transpile @spicegarden/ui
├── eslint.config.js
├── jest.config.js
├── sentry.config.ts
├── src/
│   ├── pages/
│   │   ├── _app.tsx          # App wrapper
│   │   ├── index.tsx         # Kitchen Display System (KDS)
│   │   └── onboarding/       # Restaurant onboarding flow
│   │       ├── index.tsx
│   │       ├── business.tsx
│   │       ├── gst.tsx
│   │       ├── menu.tsx
│   │       ├── documents.tsx
│   │       ├── pricing.tsx
│   │       └── payout.tsx
│   ├── redux/                # State management (useReducer)
│   ├── types/                # TypeScript types
│   └── pages/api/            # API route handlers
```

### apps/super-admin/ — Admin Console

```
apps/super-admin/
├── package.json              # @spicegarden/super-admin
├── tsconfig.json
├── next.config.js            # Transpile @spicegarden/ui
├── instrumentation.ts        # OpenTelemetry instrumentation
├── src/
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── index.tsx         # Overview dashboard
│   │   ├── analytics/        # Analytics pages
│   │   │   ├── index.tsx
│   │   │   ├── customers.tsx
│   │   │   └── top-dishes.tsx
│   │   ├── driver-fleet/     # Driver management
│   │   │   ├── overview.tsx
│   │   │   ├── shifts.tsx
│   │   │   ├── earnings.tsx
│   │   │   ├── incentives.tsx
│   │   │   └── penalties.tsx
│   │   ├── loyalty/          # Loyalty program management
│   │   │   ├── index.tsx
│   │   │   ├── coupons.tsx
│   │   │   └── referrals.tsx
│   │   └── api/              # API route handlers
│   │       └── admin/
│   ├── components/           # Shared components
│   ├── redux/                # State management (useReducer)
│   └── types/                # TypeScript types
```

### apps/customer-mobile/ — Customer Mobile App

```
apps/customer-mobile/
├── package.json              # @spicegarden/customer-mobile
├── App.tsx                   # Root component with navigation
├── App.js                    # Legacy entry point
├── tsconfig.json
├── metro.config.js
├── babel.config.js
├── eas.json                  # Expo Application Services config
├── app.config.js
├── src/
│   ├── screens/              # 14 screens
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── RestaurantScreen.tsx
│   │   ├── CartScreen.tsx
│   │   ├── CheckoutScreen.tsx
│   │   ├── PaymentMethodsScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── TrackingScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── OrderDetailsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── AddressesScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   └── OnboardingScreen.tsx
│   │
│   ├── navigation/           # React Navigation config
│   ├── components/           # Reusable components
│   ├── hooks/                # Custom hooks
│   ├── services/             # API + notification + storage services
│   ├── storage/              # AsyncStorage wrappers
│   ├── constants/            # App constants
│   ├── types/                # TypeScript types
│   │   └── @types/           # Custom type declarations
│   └── utils/                # Utility functions
```

### apps/delivery-partner/ — Delivery Partner App

```
apps/delivery-partner/
├── package.json              # @spicegarden/delivery-partner
├── App.tsx                   # Root component
├── App.js                    # Legacy entry
├── tsconfig.json
├── metro.config.js
├── babel.config.js
├── eas.json
├── app.config.js
├── src/
│   ├── services/
│   │   ├── location.service.ts     # GPS tracking
│   │   ├── delivery-api.service.ts # Order/delivery API
│   │   ├── storage.service.ts      # AsyncStorage wrapper
│   │   └── __tests/                # Unit + integration tests
│   ├── types/                # TypeScript interfaces
│   │   └── @types/           # Custom type declarations
│   └── utils/                # Utility functions
```

**Note**: `apps/driver-app/` exists as a directory with only `App.js` and `App.tsx`. It is NOT listed in root `package.json` workspaces. Minimal/placeholder implementation.

### apps/launcher/ — Electron Windows Launcher

```
apps/launcher/
├── package.json              # spicegarden-launcher
├── tsconfig.json             # TypeScript configs (main + renderer + test)
├── jest.config.js
├── eslint.config.js
├── webpack.renderer.config.js
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts           # Entry point
│   │   ├── preload.ts        # Preload script
│   │   └── __tests__/        # Main process tests
│   └── renderer/             # Renderer process
│       ├── pages/            # Window pages
│       ├── components/       # Renderer components
│       └── index.tsx         # Renderer entry
├── assets/                   # Icon assets
├── build/                    # Electron builder config
│   ├── builder-effective-config.yaml
│   └── builder-debug.yml
└── dist/                     # Built artifacts
```

## Workspace: packages/ (Shared Libraries)

### packages/shared/ — Shared Utilities

```
packages/shared/
├── package.json              # @spicegarden/shared
├── tsconfig.json
├── jest.config.js
├── src/
│   ├── index.ts              # Re-exports types, constants, api
│   ├── types.ts              # Shared TypeScript interfaces
│   ├── constants.ts          # App constants
│   ├── api.ts                # API client factory + pre-built clients
│   └── analytics.ts          # Analytics utilities
└── __tests__/                # Unit tests
```

### packages/ui/ — UI Component Library

```
packages/ui/
├── package.json              # @spicegarden/ui
├── tsconfig.json
├── jest.config.js
├── jest.setup.ts
├── sentry.client.ts
├── src/
│   ├── index.ts              # 20+ component exports
│   ├── tokens.ts             # Design tokens (colors, spacing, typography)
│   ├── icons.css             # Icon font styles
│   ├── Button.tsx            # Button component
│   ├── Card.tsx              # Card component
│   ├── Input.tsx             # Input component
│   ├── Modal.tsx             # Modal dialog
│   ├── Toast.tsx             # Toast notifications
│   ├── Skeleton.tsx          # Loading skeleton
│   ├── SkeletonTemplates.tsx # Pre-built skeleton layouts
│   ├── LoadingStates.tsx     # Loading state components
│   ├── LottieSuccessAnimation.tsx # Success animation
│   ├── OTPInput.tsx          # OTP input component
│   ├── SearchInput.tsx       # Search input with icon
│   ├── Stepper.tsx           # Multi-step stepper
│   ├── FlowManager.tsx       # Flow orchestration
│   ├── ErrorBoundary.tsx     # React error boundary
│   ├── useFlow.ts            # Flow management hook
│   ├── analytics.ts          # Analytics tracking
│   └── icons/                # 5 icon categories
│       ├── admin/            # Admin icons
│       ├── commerce/         # Commerce icons (cart, rupee, etc.)
│       ├── delivery/         # Delivery icons (bike, map, etc.)
│       ├── kitchen/          # Kitchen icons
│       ├── navigation/       # Navigation icons
│       └── system/           # System icons
├── icons/                    # Built icon assets
└── __tests__/, __mocks__/    # Tests + mocks
```

### packages/api-types/ — API Contract Types

```
packages/api-types/
├── package.json              # @spicegarden/api-types
├── tsconfig.json
└── src/
    └── index.ts              # Shared TypeScript interfaces
        ├── DriverProfile    # Driver profile interface
        ├── DeliveryOrder    # Delivery order interface
        ├── EarningsSummary  # Driver earnings summary
        └── Location         # Lat/lng coordinates
```

### packages/proto/ — Protobuf Definitions

```
packages/proto/
├── package.json              # @spicegarden/proto
├── tsconfig.json
└── src/
    ├── index.ts              # Exports + constants
    │   └── GRPC_PORT = 50051
    │   └── PROTO_PACKAGE = 'spicegarden'
    ├── constants.ts          # Protobuf constants
    └── types.ts              # Generated protobuf types
```

### packages/grpc-transport/ — Quarantined gRPC

```
packages/grpc-transport/
├── package.json              # @spicegarden/grpc-transport
└── src/
    └── index.ts              # Throws GrpcTransportUnavailableError
```

### packages/ux/ — UX Documentation

```
packages/ux/
└── phase-1/                  # UX documentation
    ├── 00_overview.md
    ├── 01_figma_workspace_structure.md
    ├── 02_design_system.md
    ├── 03_motion_design_system.md
    ├── 04_customer_journey.md
    ├── 05_customer_app_information_architecture.md
    ├── 06_customer_app_screen_architecture.md
    ├── 07_delivery_partner_screen_architecture.md
    ├── 08_restaurant_dashboard_screen_architecture.md
    ├── 09_admin_panel_screen_architecture.md
    ├── 10_landing_pages.md
    ├── 11_component_library_spec.md
    └── 12_developer_handoff_checklist.md
```

## Workspace: infra/ (Infrastructure)

```
infra/
├── README.md
├── DEPLOYMENT_CHECKLIST.md
├── DNS_FAILOVER.md
├── DOCKER_STABILITY.md
├── TESTING_PLAN.md
├── backend/Dockerfile        # Multi-stage Node 20 Alpine build
├── customer-web/Dockerfile
├── restaurant-dashboard/Dockerfile
├── super-admin/Dockerfile
├── delivery-partner/Dockerfile
├── k8s/
│   ├── production-hardened.yaml  # Production deployment (3 replicas, HPA, NetworkPolicy)
│   ├── staging.yaml             # Staging deployment
│   ├── backend-deployment.yaml  # Backend-specific deployment
│   ├── postgres-ha.yaml         # PostgreSQL HA setup
│   ├── redis-cluster.yaml       # Redis cluster setup
│   ├── cdn-ingress.yaml         # CDN + Ingress configuration
│   ├── configmap.yaml           # ConfigMap
│   ├── secrets.yaml             # Secrets manifest
│   └── postgres/
│       └── init.sql             # Database initialization script
├── prometheus/
│   ├── prometheus.yml           # Prometheus configuration
│   ├── prometheus.dev.yml       # Development Prometheus config
│   ├── rules/
│   │   ├── alerts.yml           # Alert rules
│   │   └── slos.yml             # SLO definitions
│   └── alerts.yml (legacy path)
├── grafana/
│   └── provisioning/
│       ├── dashboards/
│       │   └── provider.yml      # Dashboard provider config
│       └── datasources/
│           └── datasources.yml   # Datasource provisioning
├── alertmanager/
│   └── alertmanager.yml         # Alert routing (Slack, PagerDuty)
├── opensearch/
│   └── index-templates/         # Log index templates
├── filebeat/
│   └── filebeat.yml             # Log shipping configuration
├── envoy/
│   └── envoy.yaml               # Service mesh configuration
├── postgres/
│   └── init.sql                 # Database schema initialization
├── scripts/                     # 36 operational scripts
│   ├── verify-stack.js          # Stack verification
│   ├── fake-orders.js           # Fake order generation
│   ├── security-tests.js        # Security vulnerability tests
│   ├── penetration-tests.js     # Penetration testing
│   ├── chaos-runner.js          # Chaos engineering runner
│   ├── compile-protos.js        # Protobuf compilation
│   ├── backup.sh                # Database backup
│   ├── restore.sh               # Database restore
│   ├── disaster-recovery.sh     # Disaster recovery
│   ├── generate-secrets.ps1     # Secret generation (PowerShell)
│   ├── load-secrets.sh          # Secret loading
│   ├── validate-secrets.js      # Secret validation
│   ├── secrets-rotation.ps1.js  # Secret rotation
│   ├── live-driver-simulation.js # Driver simulation for testing
│   ├── breaking-point.js        # Breaking point tests
│   ├── deployment-check.js      # Deployment validation
│   ├── autoscaling-validation.sh # HPA validation
│   ├── e2e-seed-fixtures.js     # E2E test data seeding
│   ├── quick-start.sh           # Quick start script
│   ├── legal-check.js           # Legal compliance checks
│   └── ... (26 more scripts)
└── docs/                        # Infrastructure documentation
    ├── API_VERSION_STRATEGY.md
    ├── LOAD_BENCHMARKS.md
    └── MULTI_REGION_ARCHITECTURE.md
```

## Workspace: .github/ (CI/CD)

```
.github/
└── workflows/
    ├── ci-cd.yml            # Main CI/CD pipeline
    │   ├── security-audit  # npm audit + Snyk
    │   ├── build-test      # Lint, test, coverage, build, docker
    │   ├── deploy-staging  # Auto-deploy to staging
    │   └── deploy-production # Production deployment with smoke tests
    ├── react-doctor.yml     # React Doctor quality checks
    └── rollback.yml         # Deployment rollback workflow
```

## Workspace: apps/ (Applications Summary)

| Application | Path | Framework | Port | Pages/Screens | Status |
|-------------|------|-----------|------|---------------|--------|
| Backend | apps/backend | NestJS | 3001 | 40 controllers, 130 services | ✅ |
| Customer Web | apps/customer-web | Next.js 15 | 3002 | 21 pages | ✅ |
| Restaurant Dashboard | apps/restaurant-dashboard | Next.js 15 | 3003 | 8 pages + onboarding | ✅ |
| Super Admin | apps/super-admin | Next.js 15 | 3004 | 12 pages | ✅ |
| Customer Mobile | apps/customer-mobile | Expo 56 | - | 14 screens | ✅ |
| Delivery Partner | apps/delivery-partner | Expo 56 | - | 3 services | ✅ |
| Launcher | apps/launcher | Electron 39 | - | 2 main/renderer | ✅ |
| Driver App | apps/driver-app | Minimal | - | 2 files only | ⚠️ Not in workspaces |

## Workspace: packages/ (Packages Summary)

| Package | Path | Type | Exports | Status |
|---------|------|------|---------|--------|
| @spicegarden/ui | packages/ui | React components | Button, Card, Input, Modal, Toast, Skeleton, 50+ icons | ✅ |
| @spicegarden/shared | packages/shared | TS utilities | API client, types, constants, analytics | ✅ |
| @spicegarden/api-types | packages/api-types | TS interfaces | DriverProfile, DeliveryOrder, EarningsSummary | ✅ |
| @spicegarden/proto | packages/proto | Protobuf | GRPC constants, proto types | ✅ |
| @spicegarden/grpc-transport | packages/grpc-transport | gRPC stub | GrpcTransportUnavailableError | ⚠️ Quarantined |

## Backend Module Summary

| Module | Controllers | Services | Purpose |
|--------|------------|----------|---------|
| AuthService | AuthController | AuthService, Strategies | JWT + OAuth2 login |
| OrderService | OrderController | OrderService | Order lifecycle, status machine |
| PaymentService | PaymentsController, WebhookController, ChargebackController | PaymentService, GatewayFactory, StripeGateway, RazorpayGateway, CodGateway, WebhookService, RetryService, FraudHardeningService, IdempotencyService | Payment orchestration |
| RestaurantService | RestaurantController, RestaurantOpsController, BusinessEngineController, OnboardingController | RestaurantService, RestaurantOpsService, BusinessEngineService, RestaurantOnboardingService, MenuModerationService, PayoutService, BranchManagementService, CommissionService | Restaurant operations |
| SearchService | SearchController | SearchService | Menu + restaurant search |
| DeliveryService | DriverOpsController | DriverOnboardingService, DriverPayoutService | Driver lifecycle |
| AdminService | AdminController | AdminService | Admin dashboard API |
| NotificationModule | NotificationPreferencesController, DeviceController, NotificationQueueController | NotificationService, ProductionNotificationService, NotificationQueueService | Multi-channel notifications |
| KitchenModule | KitchenController | KitchenService | Inventory, recipes, batches, SLA |
| DriverAssignmentModule | DriverAssignmentController | DriverAssignmentService, ETAIntelligenceService | Driver matching, ETA, fraud |
| MetricsModule | MetricsController | MetricsService | Prometheus metrics |
| ComplianceModule | ComplianceController | ComplianceService, Soc2ReadinessService, PciDssValidationService, SecretsRotationService | Compliance, GDPR/DPDP |
| AuditModule | AuditController | AuditService | Audit logging |
| WalletModule | WalletController | WalletService | Wallet balance + transactions |
| GSTModule | GSTController | GSTService | GST calculation + invoices |
| FinanceModule | FinanceController | TaxReportingService, ReconciliationService | Financial reporting |
| SupportModule | SupportController | CustomerSupportService, TicketRoutingService | Support tickets |
| RefundModule | RefundController | RefundService | Refund workflow |
| LoyaltyModule | LoyaltyController | LoyaltyService | Coupons, referrals, cashback |
| DriverFleetModule | DriverFleetController | DriverFleetService | Fleet management, shifts, incentives |
| AnalyticsModule | AnalyticsController | AnalyticsService | Business analytics |
| ReviewServiceModule | ReviewController | ReviewService | Customer reviews |
| UserProfileModule | UserProfileController | UserProfileService | Profile + payment methods |
| ApisModule | ApisController | ApisService | Menu API |

## Database Entity Summary

| # | Entity | Table | Key Columns |
|---|--------|-------|-------------|
| 1 | UserEntity | users | id, email, phone, role, status |
| 2 | OrderEntity | orders | id, userId, restaurantId, status, grandTotal |
| 3 | OrderItemEntity | order_items | id, orderId, menuItemId, quantity, price |
| 4 | RestaurantEntity | restaurants | id, name, slug, location, status |
| 5 | RestaurantBranchEntity | restaurant_branches | id, restaurantId, address, lat, lng |
| 6 | RestaurantGSTEntity | restaurant_gst | id, restaurantId, gstin, legalName |
| 7 | RestaurantOnboardingEntity | restaurant_onboarding | id, restaurantId, step, data |
| 8 | MenuCategoryEntity | menu_categories | id, restaurantId, name, order |
| 9 | MenuItemEntity | menu_items | id, restaurantId, name, price, description |
| 10 | MenuAddonEntity | menu_addons | id, menuItemId, name, price, type |
| 11 | MenuVariantEntity | menu_variants | id, menuItemId, name, price, options |
| 12 | MenuItemAvailabilityEntity | menu_item_availability | id, menuItemId, branchId, isAvailable |
| 13 | MenuModerationEntity | menu_moderation | id, menuItemId, restaurantId, status, action |
| 14 | DriverEntity | drivers | id, userId, licenseNumber, kycStatus, currentLocation |
| 15 | DriverAssignmentEntity | driver_assignments | id, orderId, driverId, status, distance |
| 16 | DriverScoreEntity | driver_scores | id, driverId, rating, deliveries, onTimeRate |
| 17 | DriverDocumentEntity | driver_documents | id, driverId, type, url, expiryDate |
| 18 | DriverShiftEntity | driver_shifts | id, driverId, startedAt, endedAt |
| 19 | DriverPenaltyEntity | driver_penalties | id, driverId, type, amount, reason |
| 20 | DriverIncentiveEntity | driver_incentives | id, driverId, type, amount, status |
| 21 | DriverFraudEntity | driver_fraud | id, driverId, orderId, fraudType, severity |
| 22 | DeliverySLAEntity | delivery_slas | id, driverId, branchId, metricName, value |
| 23 | WalletEntity | wallets | id, userId, balance, currency |
| 24 | WalletTransactionEntity | wallet_transactions | id, walletId, type, amount, referenceId |
| 25 | AddressEntity | addresses | id, userId, label, addressLine, city, lat, lng |
| 26 | PaymentMethodEntity | payment_methods | id, userId, type, last4, brand, isDefault |
| 27 | PaymentDisputeEntity | payment_disputes | id, orderId, disputeId, status, amount |
| 28 | CouponEntity | coupons | id, code, type, value, maxUses, active |
| 29 | CouponUsageEntity | coupon_usage | id, couponId, userId, orderId, usedAt |
| 30 | ReferralEntity | referrals | id, referrerId, refereeId, code, status |
| 31 | SubscriptionEntity | subscriptions | id, userId, planId, status, startDate, endDate |
| 32 | NotificationEntity | notifications | id, recipientId, type, payload, status |
| 33 | NotificationPreferenceEntity | notification_preferences | id, userId, channel, enabled |
| 34 | UserDeviceEntity | user_devices | id, userId, fcmToken, deviceName, isActive |
| 35 | SupportTicketEntity | support_tickets | id, userId, issue, status, priority |
| 36 | RefundEntity | refunds | id, orderId, amount, reason, status, type |
| 37 | RefundApprovalEntity | refund_approvals | id, refundId, approverId, status, notes |
| 38 | SessionEntity | sessions | id, userId, refreshToken, deviceInfo, expiresAt |
| 39 | OTPEntity | otps | id, userId, code, purpose, expiresAt |
| 40 | AuditLogEntity | audit_logs | id, userId, action, resource, details, ipAddress |
| 41 | AuditLogEntity | audit_logs | (in MongoDB) | # Separate MongoDB store |
| 42 | DeviceFingerprintEntity | device_fingerprints | id, userId, fingerprint, lastSeen |
| 43 | RecipeEntity | recipes | id, branchId, menuItemId, ingredients, instructions |
| 44 | BatchEntity | batches | id, branchId, recipeId, quantity, status, preparedAt |
| 45 | FoodPrepEntity | food_preps | id, batchId, chefId, qualityCheck, preparedAt |
| 46 | KitchenSLAEntity | kitchen_slas | id, branchId, metricName, value, targetValue |
| 47 | InventoryItemEntity | inventory_items | id, branchId, name, quantity, unit, threshold |
| 48 | InventoryAlertEntity | inventory_alerts | id, inventoryItemId, type, threshold, active |
| 49 | SupplierEntity | suppliers | id, branchId, name, contact, items |
| 50 | LedgerEntryEntity | ledger_entries | id, type, amount, currency, referenceId, description |
| 51 | HolidayScheduleEntity | holiday_schedules | id, restaurantId, date, name, isClosed |
| 52 | SLAAlertEntity | sla_alerts | id, branchId, metricName, value, breached |
| 53 | SurgeZoneEntity | surge_zones | id, name, polygon, multiplier, active |
| 54 | HSNSACEntity | hsn_sac_codes | id, code, description, rate, category |
| 55 | GSTDetailEntity | gst_details | id, orderId, restaurantId, cgst, sgst, igst |
| 56 | IdempotencyEntity | idempotency_keys | idempotency_key, scope, user_id, payload_hash |
| 57 | PaymentValidationEventEntity | payment_validation_events | id, event_type, order_id, gateway, details |
| 58 | PaymentFraudFlagEntity | payment_fraud_flags | id, user_id, order_id, risk_score, flags |
| 59 | PaymentEventEntity | payment_events | id, event_type, order_id, gateway, payload |
| 60 | StripeWebhookEntity | stripe_webhooks | id, event_id, type, processed, payload |
| 61 | WebhookRetryQueueEntity | webhook_retry_queue | id, webhook_id, attempts, max_attempts |
| 62 | BranchControlEntity | branch_controls | id, branchId, isOnline, autoAccept, prepTime |
| 63 | DeletionRequestEntity | deletion_requests | id, userId, regulation, reason, status |
| 64 | DataExportRequestEntity | data_export_requests | id, userId, status, file_url |
| 65 | CommissionRuleEntity | commission_rules | id, restaurantId, type, value, validFrom, validTo |
