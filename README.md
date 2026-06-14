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
