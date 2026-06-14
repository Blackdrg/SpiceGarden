# SpiceGarden — Enterprise Food Delivery Platform

**Generated:** 2026-06-14  
**Scope:** SpiceGarden is an npm-workspace monorepo for a production-oriented food delivery platform with a NestJS backend, customer web and mobile apps, restaurant KDS/dashboard, super-admin console, delivery-partner app, Electron launcher, shared API/UI/proto packages, infrastructure manifests, observability, legal documents, UX documentation, and automation scripts.

This README restores the detailed repository guide from `git show 57e5bd0:README.md` and expands it with current source data from the backend, apps, infrastructure, CI/CD, observability, UX, legal, and load-test files. Secret values from local files are intentionally redacted.

---

## Repository Overview

SpiceGarden is organized as a full-stack food-delivery business engine: customers browse restaurants and place orders, restaurants manage kitchen queues and inventory, delivery partners accept and complete deliveries, and super-admin users monitor operations, driver fleets, loyalty, disputes, and platform metrics.

### Auto-generated repository inventory summary

| Metric | Value |
| :--- | :---: |
| Tracked files | 2,308 |
| Tracked directories | 392 |
| Markdown documents | 87 |
| TypeScript files | 593 |
| JavaScript files | 796 |
| Current modified files | 9 |
| Current deleted files | 1 |
| Current untracked files/folders | 13 |

### Workspace packages

| Path | Package name | Files | Dependencies | Scripts |
| :--- | :--- | :---: | :--- | :--- |
| `apps/backend` | `@spicegarden/backend` | 1,514 files | 57 deps | start, dev, build, lint, test, test:watch, test:cov, test:unit, test:integration, test:e2e, test:load, test:load:20k, test:load:breaking, test:chaos, test:all, test:mongo |
| `apps/customer-mobile` | `@spicegarden/customer-mobile` | 137 files | 26 deps | start, start:ci, android, ios, build, lint, test:unit, test:integration, test:e2e, test:all |
| `apps/customer-web` | `@spicegarden/customer-web` | 76 files | 26 deps | dev, build, start, lint, test:unit, test:integration, test:e2e, test:all |
| `apps/delivery-partner` | `@spicegarden/delivery-partner` | 75 files | 14 deps | start, android, ios, web, build, lint, test:unit, test:integration, test:e2e, test:all |
| `apps/driver-app` | `driver-app` | 2 files | 0 deps | none |
| `apps/launcher` | `spicegarden-launcher` | 85 files | 21 deps | dev, dev:main, dev:renderer, build, build:main, build:renderer, dist, dist:installer, dist:portable, lint, test:unit, test:integration, test:e2e, test:all |
| `apps/restaurant-dashboard` | `@spicegarden/restaurant-dashboard` | 33 files | 17 deps | dev, build, start, lint, test:unit, test:integration, test:e2e, test:all |
| `apps/super-admin` | `@spicegarden/super-admin` | 34 files | 18 deps | dev, build, start, lint, test:unit, test:integration, test:e2e, test:all |
| `packages/api-types` | `@spicegarden/api-types` | 3 files | 4 deps | build, type-check, lint |
| `packages/grpc-transport` | `grpc-transport` | 3 files | 0 deps | none |
| `packages/proto` | `proto` | 5 files | 0 deps | none |
| `packages/shared` | `@spicegarden/shared` | 12 files | 1 dep | build, dev, lint, test:unit, test:integration, test:e2e, test:all |
| `packages/ui` | `@spicegarden/ui` | 144 files | 1 dep | build, lint, test:unit, test:integration, test:e2e, test:all |
| `packages/ux` | `ux` | 13 files | 0 deps | none |

### Top-level folder map

| Folder | Description | Tracked files |
| :--- | :--- | :---: |
| `.github` | GitHub Actions workflows | 3 |
| `.kilo` | Kilo configuration | 1 |
| `.storybook` | Storybook configuration | 2 |
| `FrontendGaps` | Frontend test gap documentation | 2 |
| `__tests__` | Root test utilities | 1 |
| `apps` | Workspace applications | 1,956 |
| `docs` | Architecture and platform documentation | 11 |
| `infra` | Infrastructure and deployment assets | 67 |
| `k8s` | Repository Kubernetes folder | 1 |
| `legal` | Legal and contributor documents | 3 |
| `packages` | Shared packages | 180 |
| `scripts` | Repository scripts | 22 |
| `ux` | UX documentation | 20 |

### Commands, ports, and local rules

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Run all workspace dev scripts |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all packages |
| `npm run test:unit` | Run workspace unit tests |
| `npm run test:integration` | Run workspace integration tests |
| `npm run test:e2e` | Run workspace end-to-end tests |
| `npm run test:all` | Run all workspace tests |
| `docker-compose -f compose.dev.yaml up -d` | Start dev infrastructure |
| `docker-compose -f compose.dev.yaml down` | Stop dev infrastructure |
| `powershell -File infra/scripts/generate-secrets.ps1` | Generate local secrets on Windows |
| `node infra/scripts/fake-orders.js` | Run synthetic order tests |
| `node infra/scripts/breaking-point.js` | Run stress tests |
| `node infra/scripts/security-tests.js` | Run security vulnerability tests |
| `node infra/scripts/penetration-tests.js` | Run penetration tests |
| `npm run test:load` | Run k6 load tests for 10k users |
| `npm run test:load:20k` | Run k6 load tests for 20k users |
| `npm run test:chaos` | Run chaos experiments |

| Service | Port |
| :--- | :---: |
| Backend API | 3001 |
| Customer Web | 3002 |
| Restaurant Dashboard | 3003 |
| Super Admin | 3004 |
| Grafana | 3000 |
| Prometheus | 9090 |
| Alertmanager | 9093 |
| OpenSearch | 9200 |
| OpenSearch Dashboards | 5601 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| MongoDB | 27017 |

Feature-freeze rules from `AGENTS.md`: no new modules, no new AI features, no redesign, no extra dashboards, and no new frontend routes without explicit approval. Only bug fixing, reliability improvements, deployment fixes, and production hardening are permitted.

### File extension summary

| Extension | Count |
| :--- | :---: |
| `js` | 793 |
| `map` | 584 |
| `ts` | 457 |
| `tsx` | 136 |
| `md` | 87 |
| `json` | 49 |
| `yaml` | 21 |
| `webp` | 20 |
| `sh` | 16 |
| `xml` | 16 |
| `proto` | 14 |
| `yml` | 12 |
| `css` | 10 |
| `png` | 10 |
| `ps1` | 9 |
| `txt` | 7 |

---

## Technology Stack

### Root workspace

`package.json` defines an npm workspace with `apps/*` and `packages/*`, root scripts for `dev`, `build`, `lint`, and test suites, and root dependencies for `class-transformer`, `class-validator`, and `electron`. The CI pipeline uses Node.js `20.x` and `npm ci`.

### Backend runtime and dependencies

`apps/backend/package.json` declares a CommonJS NestJS app with TypeScript. Important runtime dependencies include NestJS runtime packages, Passport/JWT/OAuth, Argon2/Bcrypt, TypeORM/Postgres/Mongoose/MongoDB/ioredis, Helmet, express-rate-limit, HPP, mongo-sanitize, Stripe, prom-client, Sentry, Socket.IO, Jest, ts-jest, and k6.

### Frontend runtimes

| App | Runtime | Key dependencies | Notes |
| :--- | :--- | :--- | :--- |
| `apps/customer-web` | Next.js 15.5.6, React 19.2.7 | Redux Toolkit, React Query, Socket.IO client, `@spicegarden/ui` | Pages Router at `src/pages/`, 22 route files including legal routes |
| `apps/customer-mobile` | Expo 56.0.8, React Native 0.85.3 | React Navigation, Async Storage, Expo Location, Expo Notifications, SVG transformer | TypeScript rewrite note: 31 JS files deleted |
| `apps/restaurant-dashboard` | Next.js 15.5.6, React 19.2.7 | Socket.IO client, `@spicegarden/ui` | KDS + inventory dashboard |
| `apps/super-admin` | Next.js 15.5.6, React 19.2.7 | Recharts, Sentry Next.js, Socket.IO client, `@spicegarden/ui` | Analytics, driver fleet, loyalty, support/security dashboard |
| `apps/delivery-partner` | Expo 56.0.8, React Native 0.85.3 | React Navigation, Socket.IO client, Async Storage | Driver home, active delivery, earnings, shift, performance, map, help screens |
| `apps/launcher` | Electron 39.8.10 | React, Webpack 5, electron-builder, electron-store, systeminformation | Windows desktop launcher for local infrastructure |
| `packages/shared` | TypeScript | none beyond TypeScript | API client, constants, domain types |
| `packages/ui` | React UI package | `lucide-react` | Design tokens, components, icons, hooks |

---
## Backend

### Bootstrap: `apps/backend/src/main.ts`

The backend bootstraps either `LocalDevModule` or `AppModule` depending on `LOCAL_DB=sqlite` or missing `DB_HOST` in non-production, then applies security middleware, rate limiting, body-size limits, metrics, and validation.

```ts
const localMode = process.env.LOCAL_DB === 'sqlite' || (!process.env.DB_HOST && process.env.NODE_ENV !== 'production');
const app = await NestFactory.create(localMode ? LocalDevModule : AppModule, { rawBody: true });

app.use(helmet());
app.use(safeMongoSanitize);
app.use(hpp());

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api/', apiLimiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });
app.use('/auth/', authLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

app.use('/metrics', async (_req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('spicegarden_backend_local_mode=true\n');
});

app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
await app.listen(3001);
```

Reference: `apps/backend/src/main.ts:12`, `apps/backend/src/main.ts:69`, `apps/backend/src/main.ts:79`, `apps/backend/src/main.ts:88`, `apps/backend/src/main.ts:97`, `apps/backend/src/main.ts:100`, `apps/backend/src/main.ts:116`.

### AppModule imports

`apps/backend/src/app.module.ts` imports global and domain modules including `DbModule`, `SecurityModule`, `LoggingModule`, `QueueModule`, `TrackingModule`, `AuthServiceModule`, `OrderServiceModule`, `PaymentServiceModule`, `RestaurantServiceModule`, `SearchServiceModule`, `DeliveryServiceModule`, `DriverOpsModule`, `AdminServiceModule`, `NotificationModule`, `KitchenModule`, `DriverAssignmentModule`, `MetricsModule`, `ComplianceModule`, `AuditModule`, `WalletModule`, `GSTModule`, `FinanceModule`, `SupportModule`, `RefundModule`, `LoyaltyModule`, `DriverFleetModule`, `AnalyticsModule`, `ReviewServiceModule`, and `ApisModule`.

The tracked `apps/backend/src/modules/` boundary contains 17 TypeScript files across analytics, auth, driver-assignment, kitchen, ledger, notifications, orders, and realtime modules.

Reference: `apps/backend/src/app.module.ts:36`.

### Security middleware

| Control | Implementation |
| :--- | :--- |
| Helmet headers | `app.use(helmet())` |
| NoSQL injection | `mongoSanitize()` with compatibility wrapper for Express getter issues |
| HTTP parameter pollution | `app.use(hpp())` |
| General API rate limit | 100 requests per IP per 15 minutes on `/api/` |
| Auth rate limit | 10 requests per IP per 15 minutes on `/auth/` |
| Body limit | JSON and URL-encoded bodies limited to 10 KB |
| Nest throttler | `SecurityModule` configures `ttl: 60000`, `limit: 10` |
| Validation | Global `ValidationPipe` with whitelist and strict DTO behavior |
| Sentry | Optional Sentry request/tracing handlers when `SENTRY_DSN` is present |

Reference: `apps/backend/src/security/security.module.ts:11`, `apps/backend/src/main.ts:33`.

### Database and queue adapters

PostgreSQL is configured through TypeORM in `DbModule`; MongoDB is configured through Mongoose for reviews; Redis is connected through `RedisAdapter`; local development can use `LocalRepositoryModule` when `LOCAL_DB=sqlite` or `DB_HOST` is absent.

```ts
const localSqlite = process.env.LOCAL_DB === 'sqlite' || (!process.env.DB_HOST && process.env.NODE_ENV !== 'production');

TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST') || 'localhost',
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USER') || 'spicegarden',
    password: configService.get<string>('DB_PASS') || 'spicegarden_dev',
    database: configService.get<string>('DB_NAME') || 'spicegarden',
    entities,
    synchronize: true,
  }),
});
```

`RedisAdapter` connects to `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`, pings Redis on module init, and exposes `get`, `set`, `del`, `exists`, and `incr`.

Reference: `apps/backend/src/db/db.module.ts:93`, `apps/backend/src/db/db.module.ts:109`, `apps/backend/src/db/db.module.ts:128`, `apps/backend/src/db/redis.adapter.ts:15`.

### Database entities and schemas

`DbModule` registers 54 TypeORM entities, including users, restaurants, branches, orders, order items, menu/category/addon/variant/availability, inventory, recipes, batches, kitchen SLA, suppliers, driver assignment, driver score, delivery SLA, driver fraud, payment disputes, idempotency, payment validation/fraud/events, reviews, refunds, GST, support tickets, coupons, referrals, subscriptions, ledger entries, wallet transactions, and more.

MongoDB schema:

```ts
@Schema({ timestamps: true })
export class ReviewDocument extends Document {
  @Prop({ required: true }) userId!: string;
  @Prop({ required: true }) restaurantId!: string;
  @Prop({ required: true }) orderId!: string;
  @Prop({ required: true, min: 1, max: 5 }) rating!: number;
  @Prop() comment!: string;
  @Prop([String]) images!: string[];
}
```

Reference: `apps/backend/src/db/db.module.ts:50`, `apps/backend/src/db/schemas/review.schema.ts:4`.

---
## Per-App Technical Details

### Customer web: `apps/customer-web`

Customer web is a Next.js 15.5.6 Pages Router app on port 3002. It uses Redux Toolkit, React Query, Socket.IO, and `@spicegarden/ui`.

Routes include `/`, `/search`, `/restaurant`, `/menu`, `/cart`, `/checkout`, `/tracking`, `/order-details`, `/history`, `/profile`, `/auth`, `/wallet`, `/subscriptions`, `/offers`, `/addresses`, `/payment-methods`, `/notifications`, `/reset-password`, `/legal/terms`, and `/legal/privacy`.

Key implementation details:

- Home page renders categories, promo banner, recommended restaurants, and nav tabs.
- `src/pages/api/restaurants.ts` serves mock restaurants when backend data is unavailable.
- `packages/shared/api.ts` uses `NEXT_PUBLIC_API_URL || http://localhost:3001/api` and provides `authApi`, `restaurantsApi`, `ordersApi`, and `menuApi`.
- `packages/shared/constants.ts` exposes `API_URL = http://localhost:3001` and `SOCKET_URL = http://localhost:3001`.
- Cart state stores `CartItem`, restaurant ID, quantity updates, removals, and clear actions.

```ts
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  customization?: string;
  specialInstructions?: string;
}
```

Reference: `apps/customer-web/src/pages/index.tsx:34`, `apps/customer-web/src/redux/slices/cartSlice.ts:3`, `packages/shared/api.ts:1`, `packages/shared/constants.ts:1`.

### Customer mobile: `apps/customer-mobile`

Customer mobile is an Expo 56 / React Native 0.85.3 app. The TypeScript rewrite note from the gathered data: 31 JS files deleted.

Key screens: Auth, Home, Search, Restaurant, Cart, Checkout, Tracking, History, OrderDetails, Profile, Onboarding, Addresses, Notifications, PaymentMethods, MenuItemCustomization.

HomeScreen currently seeds three restaurants: Burger King, Pizza Hut, and Subway. AuthScreen validates email with `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. CheckoutScreen defines `CartItem` with `id`, `name`, `quantity`, `price` and `PaymentMethod = 'card' | 'upi' | 'cash'`.

```ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Tracking: { orderId?: string };
  OrderDetails: { orderId: string };
  Checkout: { cartItems: CartItem[] };
  Address: undefined;
  Home: undefined;
};
```

Reference: `apps/customer-mobile/src/screens/HomeScreen.tsx:26`, `apps/customer-mobile/src/screens/AuthScreen.tsx:31`, `apps/customer-mobile/src/screens/CheckoutScreen.tsx:11`, `apps/customer-mobile/src/navigation/types.ts:4`.
### Restaurant dashboard: `apps/restaurant-dashboard`

Restaurant dashboard is a Next.js 15.5.6 app on port 3003. It provides KDS and inventory views, connects to Socket.IO at `http://localhost:3001`, and listens for `newOrder` and `inventoryAlert`.

```ts
type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'pickedup' | 'delivered' | 'cancelled' | 'delayed' | 'completed';
type ServiceType = 'delivery' | 'dine-in' | 'dine_in' | 'takeaway';

function isDelayed(order: Order) {
  return order.status === 'preparing' && orderElapsed(order) > order.estPrepMins;
}

function demoOrder(id: string, overrides: Partial<Order> = {}): Order {
  return { id, orderNumber: `SG-${id.slice(-6).toUpperCase()}`, diner: 'Guest', serviceType: 'delivery', status: 'new', estPrepMins: 14, ...overrides };
}
```

Reference: `apps/restaurant-dashboard/src/pages/index.tsx:6`, `apps/restaurant-dashboard/src/pages/index.tsx:62`, `apps/restaurant-dashboard/src/pages/index.tsx:66`.

### Super admin: `apps/super-admin`

Super admin is a Next.js 15.5.6 app on port 3004. It uses Recharts, Sentry Next.js, Socket.IO, and `@spicegarden/ui`.

```ts
type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'pickedup' | 'delivered' | 'cancelled' | 'delayed' | 'completed' | 'placed' | 'confirmed' | 'received';
type ServiceType = 'dine-in' | 'dine_in' | 'takeaway' | 'delivery';

type LiveOrder = { id: string; amount: number; branch: string; eta: number; status: OrderStatus; serviceType?: ServiceType; timestamp?: number; createdAt?: string };
type BranchStatus = { name: string; status: 'operational' | 'delayed' | 'critical'; orderCount: number; avgPrepMins: number; driversAssigned: number };
type DisputeTicket = { id: string; type: 'refund' | 'support' | 'fraud'; user: string; amount?: number; severity: 'low' | 'medium' | 'high' | 'critical'; description: string; createdAt: string };
```

It fetches `/admin/stats` and `/orders` from `process.env.NEXT_PUBLIC_API_URL || http://localhost:3001/api` and subscribes to `statsUpdate`, `newOrderGlobal`, `kitchenUpdate`, `deliveryHeatmap`, and `revenueUpdate`.

Reference: `apps/super-admin/src/pages/index.tsx:9`, `apps/super-admin/src/pages/index.tsx:11`, `apps/super-admin/src/pages/index.tsx:178`.

### Delivery partner: `apps/delivery-partner`

Delivery partner is an Expo 56 / React Native 0.85.3 app. Screens include Home, Deliveries, Earnings, Profile, Login, Onboarding, Map, ActiveDelivery, ShiftManagement, Help, and Performance.

```ts
export interface DeliveryOrder {
  id: string;
  orderId: string;
  status: 'assigned' | 'accepted' | 'pickedUp' | 'onTheWay' | 'delivered' | 'failed';
  restaurant: { name: string; address: string; lat: number; lng: number };
  customer: { name: string; address: string; lat: number; lng: number; phone: string };
  amount: number;
  estimatedTimeMinutes: number;
  distanceKm: number;
  otpCode?: string;
}
```

API base resolves from `API_BASE_URL` / `NEXT_PUBLIC_API_URL`, production default `https://api.spicegarden.com`, or local `http://localhost:3001`.

Reference: `apps/delivery-partner/src/services/delivery-api.service.ts:4`, `apps/delivery-partner/src/services/delivery-api.service.ts:17`, `apps/delivery-partner/src/services/delivery-api.service.ts:32`.

### Launcher: `apps/launcher`

Launcher is an Electron Windows desktop app. It checks Docker and local ports, generates environment files, and starts/stops `compose.dev.yaml`.

`DockerManager` manages seven containers: postgres, redis, mongo, opensearch, prometheus, grafana, and alertmanager.

```ts
export interface DockerService {
  name: string;
  status: 'running' | 'stopped' | 'starting' | 'error';
  containerId?: string;
  port?: number;
  health?: 'healthy' | 'unhealthy' | 'unknown';
}
```

Reference: `apps/launcher/src/main/docker-manager.ts:6`, `apps/launcher/src/main/docker-manager.ts:23`, `apps/launcher/src/main/docker-manager.ts:39`, `apps/launcher/src/main/docker-manager.ts:103`.

---
## UX Design System

`packages/ui/tokens.ts` defines the shared design system used by the apps.

```ts
export const DESIGN_TOKENS = {
  colors: {
    primary: '#FF5A1F',
    secondary: '#111827',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    elevated: '#F5F5F5',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    premium: '#D4AF37',
    border: '#E5E7EB',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    headingXL: { fontSize: 48, fontWeight: 700, lineHeight: 1.2 },
    headingL: { fontSize: 36, fontWeight: 600, lineHeight: 1.3 },
    headingM: { fontSize: 28, fontWeight: 600, lineHeight: 1.4 },
    headingS: { fontSize: 24, fontWeight: 600, lineHeight: 1.4 },
    body: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 4, md: 8, button: 12, input: 14, card: 24, container: 28, full: 9999 },
  motion: { micro: 150, standard: 300, page: 450 },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.08)',
    medium: '0 4px 12px rgba(0,0,0,0.12)',
    large: '0 8px 24px rgba(0,0,0,0.16)',
    premiumFloat: '0 8px 24px rgba(255,90,31,0.25)',
  },
};

export const MOTION_EASING = {
  easeOutSoft: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  springSmooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};
```

`packages/ui/index.ts` exports Button, Card, Input, Skeleton, LoadingStates, LottieSuccessAnimation, Toast, Modal, SkeletonTemplates, OTPInput, SearchInput, Stepper, analytics, tokens, icons, useFlow, FlowManager, and ErrorBoundary.

Reference: `packages/ui/tokens.ts:3`, `packages/ui/tokens.ts:71`, `packages/ui/index.ts:1`.

---

## Database Architecture

### PostgreSQL

PostgreSQL is the relational store for users, restaurants, branches, orders, menu structures, inventory, drivers, payments, refunds, loyalty, support, GST, ledger, wallet, and SLA data. TypeORM is configured in `DbModule` with `synchronize: true` for development and uses `LocalRepositoryModule` fallback when local SQLite mode is active.

Primary PostgreSQL entities include:

| Domain | Entities |
| :--- | :--- |
| Identity and access | `UserEntity`, `SessionEntity`, `OtpEntity`, `DeviceFingerprintEntity`, `UserDeviceEntity` |
| Restaurants and menu | `RestaurantEntity`, `RestaurantBranchEntity`, `MenuCategoryEntity`, `MenuItemEntity`, `MenuVariantEntity`, `MenuAddonEntity`, `MenuItemAvailabilityEntity`, `RestaurantOnboardingEntity`, `RestaurantGSTEntity`, `GSTDetailEntity`, `HSNSACEntity` |
| Orders and delivery | `OrderEntity`, `OrderItemEntity`, `DriverEntity`, `DriverAssignmentEntity`, `DeliverySLAEntity`, `DriverScoreEntity`, `DriverFraudEntity`, `DriverDocumentEntity`, `DriverShiftEntity`, `DriverIncentiveEntity`, `DriverPenaltyEntity` |
| Payments and finance | `PaymentDisputeEntity`, `PaymentMethodEntity`, `StripeWebhookEntity`, `PaymentWebhookEntity`, `WebhookRetryQueueEntity`, `PaymentEventEntity`, `PaymentValidationEventEntity`, `PaymentFraudFlagEntity`, `IdempotencyEntity`, `RefundEntity`, `RefundApprovalEntity`, `PayoutReportEntity`, `CommissionRuleEntity`, `LedgerEntryEntity` |
| Wallet and loyalty | `WalletEntity`, `WalletTransactionEntity`, `CouponEntity`, `CouponUsageEntity`, `ReferralEntity`, `SubscriptionEntity` |
| Support and compliance | `AuditLogEntity`, `SupportTicketEntity`, `DisputeEntity`, `DeletionRequestEntity`, `DataExportRequestEntity` |
| Inventory and kitchen | `InventoryItemEntity`, `InventoryAlertEntity`, `RecipeEntity`, `BatchEntity`, `FoodPrepEntity`, `KitchenSLAEntity`, `SupplierEntity` |
| Geo and SLA | `SurgeZoneEntity`, `SLAAlertEntity` |

### MongoDB

MongoDB is configured through Mongoose for review documents. `ReviewDocument` stores `userId`, `restaurantId`, `orderId`, `rating`, `comment`, and `images`.

### Redis

Redis is provided by `compose.dev.yaml` and connected by `RedisAdapter` using `ioredis`. It is used as a runtime cache/key-value adapter with `get`, `set`, `del`, `exists`, and `incr`, with fallback mode if Redis is unavailable.

### Background queues

`QueueModule` exports `QueueService` and `OrderProcessor`. Notification queue and webhook retry queue services persist queue state through TypeORM entities such as `NotificationEntity`, `WebhookRetryQueueEntity`, and related status models.

Reference: `apps/backend/src/db/db.module.ts:93`, `apps/backend/src/db/redis.adapter.ts:15`, `apps/backend/src/infra/queue/queue.module.ts:5`, `apps/backend/src/db/schemas/review.schema.ts:4`.

---

## Business Engine

`BUSINESS_ENGINE.md` documents three real restaurants, live drivers, full order lifecycle, retention metrics, dashboards, and business API endpoints.

### Business components

| Component | Data |
| :--- | :--- |
| Restaurants | Spice Garden - Downtown (Pakistani cuisine), Spice Garden - Mall Road (Fast food), Spice Garden - Gulshan (Italian cuisine) |
| Live drivers | 3 active drivers with real-time GPS tracking and proximity assignment |
| Orders | Full lifecycle: `PLACED` → `RESTAURANT_ACCEPTED` → `PREPARING` → `READY` → `DRIVER_ASSIGNED` → `PICKED_UP` → `ON_THE_WAY` → `DELIVERED` |
| Metrics | GMV, active restaurants, online drivers, average prep/delivery time, uptime |
| Dashboards | `/admin/stats`, `/business/dashboard`, `/business/metrics`, KDS live orders |

`BusinessEngineService` exposes `BusinessMetrics`:

```ts
export interface BusinessMetrics {
  gmv: number;
  totalOrders: number;
  completedOrders: number;
  activeRestaurants: number;
  onlineDrivers: number;
  avgPrepTime: number;
  avgDeliveryTime: number;
}
```

Order flow: customer places order through `/api/orders`; backend pushes to KDS via WebSocket; after 1s simulation restaurant accepts; driver is assigned by proximity; driver and customer receive WebSocket updates; completion updates GMV and retention metrics.

Reference: `BUSINESS_ENGINE.md:5`, `BUSINESS_ENGINE.md:19`, `apps/backend/src/services/restaurant/business-engine.service.ts:15`, `apps/backend/src/services/restaurant/business-engine.service.ts:141`.

---

## Verified Documentation Update

Verified as of: 2026-06-14 20:59 IST

This section was appended after repository verification. Existing README lines were preserved; no existing README line was deleted or overwritten.

### Verification scope

The repository was audited across root manifests, backend modules, frontend apps, React Native apps, shared packages, Docker/Compose, Kubernetes, GitHub Actions, environment templates, security scripts, test scripts, dependency audit output, React Doctor output, and command logs.

### Current repository state

| Metric | Verified value |
| :--- | :---: |
| Tracked files | 2410 |
| Deleted tracked files | 0 |
| Untracked files/folders | 5 |
| Modified files | 51 |
| Actual repo files excluding generated/cache dirs | 1228 |
| React components | 110 |
| Services | 84 |
| Modules | 56 |
| Entities | 68 |
| Controllers | 41 |
| Routes/pages | 50 |
| Screens | 27 |
| Hooks | 17 |
| Tests | 80 |
| Infra scripts/files | 67 |
| Kubernetes manifests | 8 |
| Docker Compose files | 4 |

### Build status

Root build is currently failing.

| Command | Result |
| :--- | :--- |
| `npm run build` | Failed with exit code 1 |
| `apps/customer-mobile build` | Failed during `tsc --noEmit` |

Known build blockers:

- `apps/customer-mobile/src/screens/CartScreen.tsx`: `FastImage` is not exported from `react-native`.
- `apps/customer-mobile/src/screens/CartScreen.tsx`: `Image` JSX usage is invalid.
- `apps/customer-mobile/src/screens/SearchScreen.tsx`: duplicate `DESIGN_TOKENS` identifier.

### Test status

Root test scripts exit 0, but several workspaces rely on placeholder scripts or `--passWithNoTests`.

| Command | Result |
| :--- | :--- |
| `npm run test:unit` | Exit 0; backend 3 suites / 30 tests passed; customer-web no tests found; others echo placeholders |
| `npm run test:integration` | Exit 0; backend 8 suites / 34 tests passed; customer-web no tests found; others echo placeholders |
| `npm run test:e2e` | Exit 0; backend 2 suites / 35 tests passed; customer-web no tests found; others echo placeholders |

Direct Jest checks found additional failures:

| Workspace | Result |
| :--- | :--- |
| `apps/customer-mobile` | Failed; missing Detox config and e2e assertion failure |
| `apps/customer-web` | Failed without `--passWithNoTests` |
| `apps/restaurant-dashboard` | Failed; TypeScript e2e file could not parse |
| `apps/super-admin` | Passed; 2 suites / 20 tests |
| `apps/delivery-partner` | Failed; React Native Jest preset migration |
| `packages/ui` | Failed; ES module syntax could not parse |

### Dependency and security status

- `npm audit --json` found vulnerabilities including moderate `@expo/cli`, `@expo/config`, and `@expo/config-plugins`.
- `npm ls --workspaces --depth=0` reported extraneous `@emnapi/runtime@1.10.0`, extraneous `crc@`, and invalid `eslint-config-next@16.2.6` in restaurant-dashboard and super-admin.
- CI currently runs `npm audit --audit-level=moderate || true`, so audit failures do not fail the workflow.
- `.npmrc` disables audit and fund output with `audit=false` and `fund=false`.

### React Doctor status

React Doctor `v0.5.5` scanned 243 files in 48.2s and returned a critical 48/100 score with 217 issues.

Critical issue:

- `apps/customer-mobile/src/screens/CartScreen.tsx:156`: undefined JSX component `Image`, which can crash at runtime.

Other notable findings:

- Missing effect dependencies involving `socketRef.current`.
- Date/random values in JSX.
- Inline render functions.
- Client-side redirects in effects.
- React Native `Dimensions.get` instead of `useWindowDimensions`.
- Heavy `recharts` eager load.
- Data fetching inside effects.
- Derived values copied into state.
- Multiple setState calls in one effect.
- Unused files.
- TypeScript syntax in `jest.setup.js`.

### Backend readiness notes

- Backend route decorators were extracted into a temp inventory: `C:\Users\mehta\AppData\Local\Temp\kilo\endpoints.tsv` with 263 route decorators detected.
- Guards are present on many operational controllers, but `RolesGuard` is still placeholder RBAC.
- `QueueService` is an in-memory simulation and is not durable queue infrastructure.
- `TrackingGateway` and `KdsGateway` use `cors: { origin: '*' }`.
- Auth has a non-production fallback secret path when `JWT_SECRET` is absent or placeholder.
- Payment, delivery, dispatch, KDS, audit, metrics, logging, compliance, encryption, and Vault integration files exist.

### Frontend and shared package notes

- Customer web, restaurant dashboard, super-admin, customer mobile, and delivery partner route/screen inventories were verified.
- `packages/shared/constants.ts` hardcodes localhost API/socket URLs:
  - `API_URL = 'http://localhost:3001'`
  - `SOCKET_URL = 'http://localhost:3001'`
- `packages/shared/api.ts` defaults to `http://localhost:3001/api`.
- `packages/ui/index.ts` exports Button, Card, Input, Skeleton, LoadingStates, LottieSuccessAnimation, Toast, Modal, SkeletonTemplates, OTPInput, SearchInput, Stepper, analytics, tokens, icons, useFlow, FlowManager, and ErrorBoundary.

### Infra and deployment notes

- `validate-env-consistency.js` exited with code 1 and reported:
  - `[PRODUCTION] STRIPE_SECRET_KEY_FILE not configured`
  - `[STAGING] STRIPE_SECRET_KEY_FILE should reference staging secrets`
- `deployment-check.js` is a Bash script despite the `.js` extension and fails under Node.js with `Unexpected identifier 'pipefail'`.
- `deployment-check.sh` was not present in the repository.
- `Dockerfile` builds only the backend and does not build frontend/mobile apps.
- Docker production stage copies root `node_modules` into the final image.
- Docker user is named `nextjs`, despite the backend-only image.
- `infra/k8s/production-hardened.yaml` includes stronger hardening than `infra/k8s/backend-deployment.yaml`, including non-root user, read-only root filesystem, dropped capabilities, secrets/configmap, rolling update, probes, resources, anti-affinity, tolerations, PDB, HPA, and NetworkPolicy.

### Documentation outputs

This verification created or updated:

- `README_AUDIT_REPORT.md`
- `PROJECT_STATUS_REPORT.md`
- `PRODUCTION_GAP_CHECKLIST.md`
- Appended verified section in `README.md`

### Production readiness verdict

Not production-ready. The repository has substantial implementation and hardened infrastructure assets, but verified blockers remain: failing root build, React runtime crash risk, weak CI audit gate, dependency vulnerabilities, placeholder tests, placeholder RBAC, in-memory queue, wildcard socket CORS, localhost defaults, env validation failures, and incomplete deployment validation.


---

## Additional Verified Data Appendix UPDATED AFTER REPOSITORY VERIFICATION

Verified as of: 2026-06-14 21:12 IST

No secret values are included in this appendix. Local environment values are summarized only.

### Workspace manifest data

| Path | Package | Version | Dependency count | Scripts |
| :--- | :--- | :---: | :---: | :--- |
| `package.json` | `spicegarden` | `0.0.0` | 4 | `dev`, `build`, `lint`, `format`, `test:unit`, `test:integration`, `test:e2e`, `test:all` |
| `apps/backend/package.json` | `@spicegarden/backend` | `0.0.0` | 57 | `start`, `dev`, `build`, `lint`, `test`, `test:watch`, `test:cov`, `test:unit`, `test:integration`, `test:e2e`, `test:load`, `test:load:20k`, `test:load:breaking`, `test:chaos`, `test:all`, `test:mongo` |
| `apps/customer-mobile/package.json` | `@spicegarden/customer-mobile` | `1.0.0` | 26 | `start`, `start:ci`, `android`, `ios`, `build`, `lint`, `test:unit`, `test:integration`, `test:e2e`, `test:all` |
| `apps/customer-web/package.json` | `@spicegarden/customer-web` | `0.1.0` | 26 | `dev`, `build`, `start`, `lint`, `test:unit`, `test:integration`, `test:e2e`, `test:all` |
| `apps/delivery-partner/package.json` | `@spicegarden/delivery-partner` | `1.0.0` | 14 | `start`, `android`, `ios`, `web`, `build`, `lint`, `test:unit`, `test:integration`, `test:e2e`, `test:all` |
| `apps/launcher/package.json` | `spicegarden-launcher` | `1.0.0` | 21 | `dev`, `dev:main`, `dev:renderer`, `build`, `build:main`, `build:renderer`, `dist`, `dist:installer`, `dist:portable`, `lint`, `test:unit`, `test:integration`, `test:e2e`, `test:all` |
| `apps/restaurant-dashboard/package.json` | `@spicegarden/restaurant-dashboard` | `0.1.0` | 17 | `dev`, `build`, `start`, `lint`, `test:unit`, `test:integration`, `test:e2e`, `test:all` |
| `apps/super-admin/package.json` | `@spicegarden/super-admin` | `0.1.0` | 18 | `dev`, `build`, `start`, `lint`, `test:unit`, `test:integration`, `test:e2e`, `test:all` |
| `packages/api-types/package.json` | `@spicegarden/api-types` | `1.0.0` | 5 | `build`, `type-check`, `lint` |
| `packages/grpc-transport/package.json` | `@spicegarden/grpc-transport` | `1.0.0` | 5 | `build`, `type-check`, `lint` |
| `packages/proto/package.json` | `@spicegarden/proto` | `1.0.0` | 5 | `build`, `type-check`, `lint` |
| `packages/shared/package.json` | `@spicegarden/shared` | `0.0.0` | 2 | `build`, `dev`, `lint`, `test:unit`, `test:integration`, `test:e2e`, `test:all` |
| `packages/ui/package.json` | `@spicegarden/ui` | `0.1.0` | 2 | `build`, `lint`, `test:unit`, `test:integration`, `test:e2e`, `test:all` |

### Backend endpoint data

Route decorator inventory source: `C:\Users\mehta\AppData\Local\Temp\kilo\endpoints.tsv`.

| Method | Count |
| :--- | :---: |
| `GET` | 128 |
| `POST` | 99 |
| `PUT` | 29 |
| `DELETE` | 5 |
| `PATCH` | 2 |
| Total | 263 |

Top controllers by route count:

| Count | Controller |
| :---: | :--- |
| 25 | `apps/backend/src/modules/kitchen/kitchen.controller.ts` |
| 21 | `apps/backend/src/compliance/compliance.controller.ts` |
| 17 | `apps/backend/src/services/restaurant/restaurant-ops.controller.ts` |
| 15 | `apps/backend/src/modules/driver-assignment/driver-assignment.controller.ts` |
| 11 | `apps/backend/src/controllers/driver.controller.ts` |
| 11 | `apps/backend/src/services/driver-fleet/driver-fleet.controller.ts` |
| 10 | `apps/backend/src/services/wallet/wallet.controller.ts` |
| 10 | `apps/backend/src/services/loyalty/loyalty.controller.ts` |
| 9 | `apps/backend/src/services/restaurant/onboarding.controller.ts` |
| 9 | `apps/backend/src/services/delivery/driver-ops.controller.ts` |
| 8 | `apps/backend/src/services/support/support.controller.ts` |
| 8 | `apps/backend/src/modules/analytics/analytics.controller.ts` |
| 8 | `apps/backend/src/services/restaurant/business-engine.controller.ts` |
| 8 | `apps/backend/src/services/user/user-profile.controller.ts` |
| 7 | `apps/backend/src/services/refund/refund.controller.ts` |
| 7 | `apps/backend/src/services/notifications/queue/notification-queue.controller.ts` |
| 6 | `apps/backend/src/services/maps/maps.controller.ts` |
| 6 | `apps/backend/src/services/payment-provider/payment-provider.controller.ts` |
| 5 | `apps/backend/src/services/payments/chargeback/chargeback.controller.ts` |
| 5 | `apps/backend/src/services/restaurant/restaurant.controller.ts` |
| 5 | `apps/backend/src/services/finance/finance.controller.ts` |

### Backend module graph

`apps/backend/src/app.module.ts:36` imports the following modules:

| Module | Purpose |
| :--- | :--- |
| `DbModule` | TypeORM, Mongoose, Redis adapter, entity registration |
| `SecurityModule` | Throttler and encryption |
| `LoggingModule` | Logging support |
| `QueueModule` | Queue orchestration and order processor |
| `TrackingModule` | Socket.IO tracking gateway |
| `AuthServiceModule` | JWT/session/user auth |
| `OrderServiceModule` | Order lifecycle and idempotency |
| `PaymentServiceModule` | Payments, refunds, webhooks, chargebacks |
| `RestaurantServiceModule` | Restaurants, branches, menus, business engine |
| `SearchServiceModule` | Search |
| `DeliveryServiceModule` | Delivery and driver operations |
| `DriverOpsModule` | Driver operations |
| `AdminServiceModule` | Admin operations |
| `NotificationModule` | Notifications and queue |
| `KitchenModule` | Kitchen inventory, recipes, batches, food prep, SLA |
| `DriverAssignmentModule` | Driver assignment, routing, ETA, fraud, SLA |
| `MetricsModule` | Metrics endpoint and local metrics |
| `ComplianceModule` | GDPR/DPDP/SOC2/PCI retention, deletion, export |
| `AuditModule` | Audit logging |
| `WalletModule` | Wallet |
| `GSTModule` | GST |
| `FinanceModule` | Finance |
| `SupportModule` | Support and disputes |
| `RefundModule` | Refunds |
| `LoyaltyModule` | Loyalty |
| `DriverFleetModule` | Driver fleet |
| `AnalyticsModule` | Analytics |
| `ReviewServiceModule` | Reviews |
| `ApisModule` | API helper endpoints |

### Backend middleware and security controls

Verified in `apps/backend/src/main.ts`:

| Control | Verified behavior |
| :--- | :--- |
| Local DB mode | Uses `LocalDevModule` when `LOCAL_DB=sqlite` or no `DB_HOST` in non-production (`main.ts:12-15`). |
| Sentry | Optional request/tracing handlers when `SENTRY_DSN` exists (`main.ts:17-29`). |
| Mongo sanitization | Uses `mongo-sanitize` with compatibility fallback (`main.ts:33-67`). |
| Helmet | Enabled for all HTTP traffic (`main.ts:69-70`). |
| NoSQL injection guard | Applied through `safeMongoSanitize` (`main.ts:72`). |
| HTTP parameter pollution guard | `hpp()` applied (`main.ts:75`). |
| API rate limit | 100 requests per 15 minutes under `/api/` (`main.ts:78-86`). |
| Auth rate limit | 10 requests per 15 minutes under `/auth/` (`main.ts:88-94`). |
| Body size limit | JSON and URL-encoded bodies limited to `10kb` (`main.ts:96-98`). |
| Metrics endpoint | `/metrics` returns local-mode metric string (`main.ts:100-104`). |
| Validation pipe | Whitelist, forbid non-whitelisted, transform enabled (`main.ts:116-122`). |

### Shared package data

| File | Verified data |
| :--- | :--- |
| `packages/shared/constants.ts:1` | `API_URL = 'http://localhost:3001'` |
| `packages/shared/constants.ts:2` | `SOCKET_URL = 'http://localhost:3001'` |
| `packages/shared/api.ts:1` | `API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'` |
| `packages/shared/api.ts:21-34` | Refresh-token retry behavior on 401 responses |
| `packages/shared/api.ts:46-70` | Fetch wrapper with JSON headers, bearer token, error parsing, and JSON response |
| `packages/ui/index.ts:2-20` | Exports Button, Card, Input, Skeleton, LoadingStates, LottieSuccessAnimation, Toast, Modal, SkeletonTemplates, OTPInput, SearchInput, Stepper, analytics, tokens, motion easing, icons, useFlow, FlowManager, ErrorBoundary |
| `packages/ui/tokens.ts:3-95` | Defines design tokens, motion easing, dark-mode tokens, and reduced-motion context |

### Frontend route and screen inventory

| App | Verified routes/screens |
| :--- | :--- |
| Customer web | `addresses`, `auth`, `cart`, `checkout`, `history`, `index`, `legal/privacy`, `legal/terms`, `menu`, `notifications`, `offers`, `order-details`, `payment-methods`, `profile`, `reset-password`, `restaurant`, `search`, `subscriptions`, `tracking`, `wallet`, plus API routes |
| Restaurant dashboard | `index`, onboarding routes, orders/inventory API routes |
| Super admin | `analytics`, `driver-fleet`, `loyalty`, `index`, plus API routes |
| Customer mobile | `AddressesScreen`, `AuthScreen`, `CartScreen`, `CheckoutScreen`, `HistoryScreen`, `HomeScreen`, `MenuItemCustomizationScreen`, `NotificationsScreen`, `OnboardingScreen`, `OrderDetailsScreen`, `PaymentMethodsScreen`, `ProfileScreen`, `RestaurantScreen`, `SearchScreen`, `TrackingScreen` |
| Delivery partner | `ActiveDeliveryScreen`, `DeliveriesScreen`, `EarningsScreen`, `HelpScreen`, `HomeScreen`, `LoginScreen`, `MapScreen`, `OnboardingScreen`, `PerformanceScreen`, `ProfileScreen`, `ShiftManagementScreen` |

### Environment data summary

Local `.env` was summarized without printing secret values.

| Metric | Count |
| :--- | :---: |
| `.env` keys | 64 |
| Redacted non-empty values | 40 |
| Empty values | 19 |
| Placeholder values | 5 |

Environment templates:

| File | Key count |
| :--- | :---: |
| `.env.example` | 49 |
| `.env.staging.example` | 35 |
| `.env.production.example` | 40 |

### Infrastructure data

| File | Verified data |
| :--- | :--- |
| `compose.yaml` | 1 service |
| `compose.infra.yaml` | 27 services |
| `compose.dev.yaml` | 15 services; contains hard-coded local development secrets and should not be used as production evidence |
| `Dockerfile` | Backend-only image; builds `apps/backend`, copies backend dist and root `node_modules`, exposes port 3001 |
| `infra/k8s/backend-deployment.yaml` | 2 Kubernetes resource kinds; simpler deployment/service manifest |
| `infra/k8s/production-hardened.yaml` | 10 Kubernetes resource kinds; deployment, service, configmap, PDB, HPA, network policy, and hardening controls |
| `infra/k8s/staging.yaml` | 5 Kubernetes resource kinds |
| `infra/k8s/postgres-ha.yaml` | 4 Kubernetes resource kinds |
| `infra/k8s/redis-cluster.yaml` | 4 Kubernetes resource kinds |
| `infra/k8s/cdn-ingress.yaml` | 1 Kubernetes resource kind |
| `infra/k8s/configmap.yaml` | 1 Kubernetes resource kind |
| `infra/k8s/secrets.yaml` | 2 Kubernetes resource kinds |

### Validation command data

| Command | Result |
| :--- | :--- |
| `npm run build` | Failed; customer-mobile TypeScript/JSX errors |
| `npm run lint` | Exit 0; workspace lint scripts ran |
| `npm run test:unit` | Exit 0; backend 3 suites / 30 tests passed; many workspaces use placeholders or no tests |
| `npm run test:integration` | Exit 0; backend 8 suites / 34 tests passed; many workspaces use placeholders or no tests |
| `npm run test:e2e` | Exit 0; backend 2 suites / 35 tests passed; many workspaces use placeholders or no tests |
| `node infra/scripts/security-tests.js` | Exit 1; rate limiting vulnerable, 100 issues |
| `node infra/scripts/penetration-tests.js` | Exit 1; backend port 3001 was not reachable locally |
| `node infra/scripts/validate-env-consistency.js` | Exit 1; production and staging Stripe secret file issues |
| `node infra/scripts/deployment-check.js` | Exit 1; script is Bash but was executed by Node.js |
| `npx react-doctor@latest --verbose` | Exit 1; score 48/100, 217 issues, 3 bug errors |

### Dependency validation data

| Check | Result |
| :--- | :--- |
| `npm audit --json` | Found vulnerabilities, including moderate `@expo/cli`, `@expo/config`, and `@expo/config-plugins` |
| `npm ls --workspaces --depth=0 --json` | Found extraneous `@emnapi/runtime@1.10.0`, extraneous `crc@`, and invalid `eslint-config-next@16.2.6` in restaurant-dashboard and super-admin |
| `.npmrc` | `package-lock=true`, `legacy-peer-deps=true`, `audit=false`, `fund=false` |
| CI audit command | `npm audit --audit-level=moderate || true` |

### Known production blockers

| Blocker | Evidence |
| :--- | :--- |
| Build failure | `npm run build` failed in customer-mobile |
| Runtime crash risk | React Doctor undefined `Image` at `apps/customer-mobile/src/screens/CartScreen.tsx:156` |
| Placeholder tests | Many workspace test scripts echo placeholder messages |
| Placeholder RBAC | `apps/backend/src/security/roles.guard.ts` |
| In-memory queue | `apps/backend/src/infra/queue/queue.service.ts` |
| Wildcard CORS | `TrackingGateway` and `KdsGateway` use `cors: { origin: '*' }` |
| Localhost defaults | `packages/shared/constants.ts` and `packages/shared/api.ts` |
| Env validation failure | `validate-env-consistency.js` reported Stripe secret file issues |
| Weak CI audit gate | `.github/workflows/ci-cd.yml:21` |
| Broken deployment-check execution | `deployment-check.js` is Bash but runs under Node.js |

### README preservation status

Existing README lines remain intact. This appendix only adds verified data after the existing content.



---

## Expanded Project Data Appendix UPDATED AFTER REPOSITORY VERIFICATION

Verified as of: 2026-06-14 21:48 IST

### Security and cryptography data

| File | Verified data |
| :--- | :--- |
| `apps/backend/src/security/encryption.service.ts:10-15` | Reads `ENCRYPTION_SECRET` from config and fails startup if missing or contains `CHANGE_ME`. |
| `apps/backend/src/security/encryption.service.ts:18-23` | Provides AES encrypt/decrypt helpers using `crypto-js`. |
| `apps/backend/src/security/encryption.service.ts:31-58` | Provides field-level PII encrypt/decrypt helpers for selected object fields. |
| `apps/backend/src/common/errors/missing-env.error.ts:8-17` | Provides `requireEnv()` helper that throws `MissingEnvError` for missing or empty env vars. |
| `apps/backend/src/common/errors/missing-env.error.ts:20-30` | Provides `requireOneOf()` helper for fallback environment variables. |

### Finance, tax, and GST data

| File | Verified data |
| :--- | :--- |
| `apps/backend/src/services/finance/tax-reporting.service.ts:28-68` | Generates GST report with taxable value, CGST, SGST, IGST, total GST, invoice count, and HSN breakdown. |
| `apps/backend/src/services/finance/tax-reporting.service.ts:110-127` | Exports GSTR1-style invoice rows with invoice number, date, customer placeholder, taxable value, CGST/SGST/IGST rates, and total tax. |
| `apps/backend/src/services/finance/tax-reporting.service.ts:128-148` | Computes tax liability for a reporting month using order tax totals. |
| `apps/backend/src/services/finance/tax-reporting.service.ts:150-160` | Builds monthly tax summaries for the last 12 months by default. |
| `apps/backend/src/services/finance/tax-reporting.service.ts:137-142` | Tax payable/receivable currently uses the same total GST value and notes input credits are not modeled. |

### Next.js app configuration data

| File | Verified data |
| :--- | :--- |
| `apps/customer-web/next.config.js:5` | Transpiles `@spicegarden/ui` and `@spicegarden/shared`. |
| `apps/customer-web/next.config.js:6-11` | Uses `externalDir`, disables ESLint during builds, enables Turbopack, and leaves webpack config unchanged. |
| `apps/restaurant-dashboard/next.config.js:4` | Transpiles `@spicegarden/ui`. |
| `apps/restaurant-dashboard/next.config.js:5-11` | Uses `externalDir`, disables ESLint during builds, enables Turbopack, and leaves webpack config unchanged. |
| `apps/super-admin/next.config.js:4` | Transpiles `@spicegarden/ui`. |
| `apps/super-admin/next.config.js:5-11` | Uses `externalDir`, disables ESLint during builds, enables Turbopack, and leaves webpack config unchanged. |

### Customer web product data

| File | Verified data |
| :--- | :--- |
| `apps/customer-web/src/pages/index.tsx:47-87` | Home page loads restaurants from `/api/restaurants`, builds category buttons, and defines bottom nav tabs for Home, Search, Orders, and Account. |
| `apps/customer-web/src/pages/index.tsx:98-122` | Header displays user name, delivery location, and notification action. |
| `apps/customer-web/src/pages/index.tsx:133-148` | Category buttons include Burgers, Pizza, Drinks, Dessert, and Healthy. |
| `apps/customer-web/src/pages/tracking.tsx:25-95` | Tracking page reads order id from query or `localStorage`, loads order details through `ordersApi`, and maps statuses to ETA values. |
| `apps/customer-web/src/pages/tracking.tsx:98-179` | Tracking page renders status timeline, live tracking card, driver info, ETA, order details, and contact buttons. |
| `apps/customer-web/src/pages/subscriptions.tsx:22-60` | Subscriptions page defines SpiceGarden Prime and Weekly Meal Plan with benefits, billing, active state, and toggle behavior. |
| `apps/customer-web/src/hooks/useTracking.ts:39-68` | Tracking hook connects to `SOCKET_URL`, listens for `tracking:${driverId}`, dispatches location updates, and disconnects on cleanup. |
| `apps/customer-web/src/pages/index.module.css:1-120` | Home CSS module defines container, header, search bar, category carousel, promo banner, error, and retry styles. |
| `apps/customer-web/src/pages/tracking.module.css:1-120` | Tracking CSS module defines glassmorphism container, status steps, live tracking card, driver info, ETA, and button group styles. |

### Restaurant dashboard product data

| File | Verified data |
| :--- | :--- |
| `apps/restaurant-dashboard/src/pages/index.tsx:38-41` | Defines order status labels for new, accepted, preparing, ready, delayed, completed, picked up, delivered, and cancelled. |
| `apps/restaurant-dashboard/src/pages/index.tsx:49-60` | Seeds demo order items and inventory items for dashboard preview. |
| `apps/restaurant-dashboard/src/pages/index.tsx:107-147` | Implements new-order sound queue and Socket.IO connection to `http://localhost:3001`. |
| `apps/restaurant-dashboard/src/pages/index.tsx:152-260` | Implements order status transitions, inventory stock updates, delay detection, and sound alert behavior. |
| `apps/restaurant-dashboard/src/pages/index.tsx:260-545` | Renders kitchen queue, inventory panel, batch mode, delay flags, prep timers, and status actions. |

### API/proto/shared package data

| Package | Verified data |
| :--- | :--- |
| `packages/api-types` | Defines `DriverProfile`, `DeliveryOrder`, `EarningsSummary`, and `Location` interfaces in `packages/api-types/src/index.ts`. |
| `packages/proto` | Exports constants/types and defines `GRPC_PORT = 50051`, `GRPC_HOST = '0.0.0.0'`, `GRPC_URL`, and `PROTO_PACKAGE = 'spicegarden'` in `packages/proto/src/index.ts`. |
| `packages/grpc-transport` | Has build/type-check/lint scripts but no dependency count in its manifest. |
| `packages/shared` | Provides API client, auth API helpers, restaurant API helpers, order API helpers, and localhost default constants. |
| `packages/ui` | Provides shared components, icons, tokens, motion easing, analytics, flow utilities, and error boundary. |

### UX documentation data

| File | Verified data |
| :--- | :--- |
| `UX_PHASE_1_Figma_Architecture_PLAN.md:8-13` | Phase 1 gathered product surface, backend/API domain, platform responsibility, and no existing UX/Figma/motion assets. |
| `UX_PHASE_1_Figma_Architecture_PLAN.md:19-119` | Phase 1 planned 14 markdown deliverables covering overview, Figma workspace, design system, motion system, journeys, IA, screen architecture, component library, handoff checklist, and todo tracker. |
| `UX_PHASE_1_Figma_Architecture_PLAN.md:144-150` | Phase 1 acceptance criteria target 100-150 screen inventory, design tokens, motion system, component library, prototype flow plan, and developer handoff checklist. |
| `ux/phase-2/PHASE_2_COMPLETE.md:5-11` | Customer web priority flows marked complete: auth, home/search, restaurant/menu, cart/checkout, tracking, profile/orders. |
| `ux/phase-2/PHASE_2_COMPLETE.md:13-19` | Mobile essential flows marked complete: open app, order food, track order, pay, reorder. |
| `ux/phase-2/PHASE_2_COMPLETE.md:20-32` | KDS and driver app critical flows marked complete. |
| `ux/phase-2/PHASE_2_COMPLETE.md:44-51` | Optional items left for future phases: social login, item customization, advanced address/payment management, notification preferences, and push notifications. |

### Customer web React Doctor JSON data

`apps/customer-web/_cw_final.json` contains a per-project React Doctor scan:

| Metric | Value |
| :--- | :---: |
| Project | `@spicegarden/customer-web` |
| React version | `^19.2.7` |
| Next.js version | `15.5.6` |
| Framework | `nextjs` |
| TypeScript | true |
| TanStack Query | true |
| Source file count | 64 |
| Error count | 2 |
| Warning count | 62 |
| Affected file count | 31 |
| Total diagnostics | 64 |
| Score | 49 |
| Score label | Critical |
| Elapsed time | 15282.1693 ms |

Notable customer-web diagnostics from `_cw_final.json`:

| File | Rule | Severity | Category |
| :--- | :--- | :--- | :--- |
| `package.json` | `no-vulnerable-react-server-components` | error | Security |
| `src/pages/payment-methods.tsx` | `prefer-useReducer` | warning | Bugs |
| `src/pages/payment-methods.tsx` | `nextjs-no-client-side-redirect` | warning | Bugs |
| `src/pages/payment-methods.tsx` | `no-fetch-in-effect` | warning | Bugs |
| `src/hooks/useAnimation.ts` | `no-adjust-state-on-prop-change` | error | Bugs |
| `src/hooks/useOfflineQueue.js` | `async-await-in-loop` | warning | Performance |
| `src/hooks/useOfflineQueue.js` | `async-defer-await` | warning | Performance |
| `src/contexts/NetworkStatusContext.js` | `jsx-no-constructed-context-values` | warning | Performance |
| `package.json` | `unused-dependency` | warning | Maintainability |

### Automation script data

| File | Verified data |
| :--- | :--- |
| `scripts/clean-any.js:6-21` | Recursively replaces TypeScript `any` with `unknown` in `apps` and `packages`, skipping `node_modules`, `.git`, `dist`, `out`, and `build`. |
| `scripts/commit.js:4-24` | Attempts to commit each app directory, packages, root `package.json`, and scripts with chore commit messages. |


### Code quality marker sample

A project-only sample excluding `node_modules`, `dist`, `build`, `.next`, `ios`, and `android` found:

| Metric | Count |
| :--- | :---: |
| Sampled project files | 806 |
| `TODO` or `FIXME` markers | 15 |
| TypeScript `any` markers | 748 |
| `console.warn`, `console.log`, or `console.error` markers | 152 |

### CSS module data

| Metric | Count |
| :--- | :---: |
| Project CSS modules under `apps` and `packages` | 17 |
| Project CSS modules under `apps` | 17 |

### Additional production implications

| Area | Implication |
| :--- | :--- |
| Encryption | Startup fails if `ENCRYPTION_SECRET` is missing or placeholder, which is safer than silent fallback. |
| Tax/GST | GST reporting exists, but tax payable/receivable logic is simplified and should be reviewed with finance requirements. |
| Next builds | ESLint is ignored during Next builds, so lint failures can be hidden unless CI runs `npm run lint` separately. |
| Customer web | React Doctor JSON reports a critical score of 49 and flags a vulnerable React Server Components runtime through Next.js `15.5.6`. |
| UX docs | Phase 1 UX architecture and Phase 2 flow completion are documented, but optional future-phase items remain open. |
| Automation | `scripts/clean-any.js` is useful for type tightening but should be reviewed before bulk replacement. |
| Code quality | The sampled project still contains many `any` markers and console calls, indicating maintainability and logging cleanup work remains. |

