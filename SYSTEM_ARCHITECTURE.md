# SpiceGarden System Architecture

## Overview

SpiceGarden is an npm-workspace monorepo for a multi-sided food delivery platform. The current architecture is centered on a NestJS backend, multiple frontend surfaces, shared TypeScript packages, Redis-backed BullMQ queues, Socket.IO real-time gateways, Stripe and Razorpay payment integrations, and Docker/Kubernetes deployment assets.

The architecture is repository-backed: the diagrams and notes below are based on `apps/*`, `packages/*`, `apps/backend/src`, `infra/*`, Docker/Kubernetes manifests, GitHub Actions workflows, README diagnostics, and repository reports.

## Verified Architecture Summary

| Layer | Verified components |
| :--- | :--- |
| User layer | Customer Web, Customer Mobile, Delivery Partner App, Restaurant Dashboard, Super Admin Panel |
| Frontend layer | Next.js 15 apps, Expo / React Native apps, `@spicegarden/ui`, `@spicegarden/shared`, `@spicegarden/api-types`, `@spicegarden/proto`, `@spicegarden/grpc-transport` |
| Backend layer | NestJS backend on port `3001`; modular services for auth, users, restaurants, menu, orders, checkout flow, delivery, driver fleet, notifications, loyalty, wallet, payments, search, tracking, analytics, AI, admin, compliance, support, audit logs, queue processing, WebSocket gateways, and RBAC guards |
| Data layer | PostgreSQL via TypeORM, MongoDB via Mongoose for review documents, Redis via ioredis, BullMQ queue, optional Vault integration |
| Real-time layer | Socket.IO / WebSockets with `/tracking`, `/kds`, `/admin`, and `/driver` namespaces |
| Payment layer | Stripe and Razorpay gateways through the Payments module; COD gateway also exists |
| Observability layer | Sentry, LoggingModule, `/metrics`, prom-client, Prometheus, Grafana, OpenSearch, OpenSearch Dashboards, Filebeat, Alertmanager |
| DevOps layer | Dockerfile, Docker Compose files, Kubernetes manifests, GitHub Actions CI/CD workflows |

## Request Flow

1. A customer uses Customer Web, Customer Mobile, Restaurant Dashboard, Delivery Partner App, or Super Admin Panel.
2. Web apps run on Next.js and consume shared UI, shared API helpers, shared constants, and shared type packages where imported.
3. Mobile apps run on Expo / React Native and use local API/socket configuration plus navigation and storage services.
4. Frontend requests reach the NestJS backend through the HTTP API entrypoint on port `3001`.
5. `apps/backend/src/main.ts` applies CORS, Helmet, HTTP parameter pollution protection, rate limit middleware, body limits, and a global validation pipe.
6. Backend modules route requests to domain services such as Auth, Orders, Payments, Restaurants, Delivery, Notifications, Analytics, Admin, Compliance, Support, and Audit.
7. Domain services persist relational data through TypeORM/PostgreSQL, review documents through Mongoose/MongoDB, and queue jobs through Redis/BullMQ.
8. Real-time updates are emitted through Socket.IO gateways for tracking, KDS, admin, and driver namespaces.
9. Payment requests are handled by the Payments module and dispatched to Stripe or Razorpay based on the configured gateway.
10. Observability signals are emitted through Sentry, LoggingModule, `/metrics`, Prometheus, Grafana, OpenSearch, and Alertmanager.

## Auth Flow

1. Auth is implemented in `apps/backend/src/services/auth/`.
2. `JwtAuthGuard` and `RolesGuard` exist in `apps/backend/src/security/`.
3. `RolesGuard` maps roles to permission arrays and permits unguarded handlers when no `@Roles()` decorator is present.
4. `SecurityModule` registers `ThrottlerModule`, `SecretLoaderService`, and `EncryptionService`.
5. `main.ts` adds production startup validation for JWT, encryption, database, Redis, Stripe, Razorpay, and CORS secrets.
6. `VaultService` exists as optional secret lookup support and falls back to local secrets when Vault is not enabled.
7. Auth-related gRPC methods exist in `AuthGrpcController`, backed by `main-grpc.ts` on port `50051`.

Important caveat: auth and RBAC exist in code, but route-level RBAC coverage and production hardening should still be audited before treating the platform as production-ready.

## Payment Flow

1. Frontend checkout flow reaches the backend through `OrderService` and `PaymentService`.
2. No standalone backend Checkout module was found; checkout is represented as the combined order/payment flow.
3. `PaymentService` uses `PaymentGatewayFactory`.
4. `PaymentGatewayFactory` selects Stripe by default or Razorpay when `PAYMENT_PRIMARY_GATEWAY=razorpay`.
5. `StripeGateway` creates payment intents, retrieves payment details, confirms payments, refunds payments, and verifies Stripe webhooks.
6. `RazorpayGateway` creates Razorpay orders, retrieves order/payment details, confirms paid/captured orders, refunds payments, and verifies Razorpay webhook signatures.
7. `CODGateway` exists for cash-on-delivery behavior.
8. Payment events are connected to idempotency, webhook handling, refunds, chargebacks, GST, finance, ledger, and audit data.
9. `PaymentProviderModule` contains Stripe Connect, Razorpay settlement, and driver payout provider services.

Payment providers are real integrations in code, but production readiness depends on validated secrets, webhook reachability, idempotency behavior, and reconciliation testing.

## Delivery Lifecycle

1. Customer Web or Customer Mobile creates an order through the Orders API.
2. `OrderService` persists the order in PostgreSQL through TypeORM.
3. The order enters the order lifecycle queue using BullMQ and Redis.
4. `OrderProcessor` updates order status and notifies the user through `NotificationService`.
5. `KitchenModule` and `KdsGateway` push new order and prep status updates to Restaurant Dashboard through `/kds`.
6. Restaurant Dashboard receives KDS updates and can send prep status updates back through the KDS path.
7. `DriverAssignmentModule` uses driver and geo data to assign delivery work.
8. `Driver Fleet`, `Driver Ops`, `Delivery`, `Maps`, and `Geo` modules support availability, KYC, routing, ETA, and driver state.
9. Delivery Partner App receives delivery assignments and sends location updates through Socket.IO.
10. `TrackingGateway` receives `updateLocation` events and broadcasts `locationUpdate` events to subscribed customers and delivery partners.
11. `NotificationModule` sends push, SMS, email, and APNs updates where configured.

## Real-Time Tracking Flow

| Namespace | Purpose | Verified source |
| :--- | :--- | :--- |
| `/tracking` | Driver/customer location updates and tracking events | `apps/backend/src/infra/tracking/tracking.gateway.ts` |
| `/kds` | Kitchen Display System events | `apps/backend/src/services/restaurant/kds.gateway.ts` |
| `/admin` | Admin socket namespace | `SocketNamespace` in `tracking.gateway.ts` |
| `/driver` | Driver socket namespace | `SocketNamespace` in `tracking.gateway.ts` |

Key events include:

- `updateLocation`
- `locationUpdate`
- `kdsUpdate`
- `driverEvent`
- `newOrder`
- `orderStatusUpdated`

## Scaling Design

1. Dockerfile builds a backend-only image from `apps/backend`.
2. Docker Compose supports local development and infrastructure stacks.
3. Kubernetes manifests provide staging and production deployment paths.
4. `production-hardened.yaml` defines a hardened backend deployment with:
   - non-root user
   - dropped capabilities
   - read-only root filesystem
   - liveness, readiness, and startup probes
   - resource requests and limits
   - pod anti-affinity
   - PodDisruptionBudget
   - HorizontalPodAutoscaler from 3 to 20 replicas
   - NetworkPolicy for ingress and egress
   - backup CronJob and PVC
5. `cdn-ingress.yaml` and the production ingress use nginx ingress with TLS annotations.
6. GitHub Actions handles audit, build/test, Docker build, GHCR publish, staging deployment, production deployment, rollout checks, HPA verification, and backup CronJob verification.

Important caveat: Kubernetes manifests exist, but deployment validation against a real cluster is not fully proven in the repository diagnostics.

## Infrastructure Explanation

### Docker

- `Dockerfile` uses `node:20-alpine`.
- It builds `apps/backend` and exposes port `3001`.
- The production stage runs as non-root user `nextjs`.
- Healthcheck targets `/health`.

### Docker Compose

- `compose.dev.yaml` starts local infrastructure such as PostgreSQL, Redis, MongoDB, Prometheus, Grafana, OpenSearch, OpenSearch Dashboards, and Alertmanager.
- `compose.infra.yaml` includes backend, PostgreSQL, Redis, MongoDB, Prometheus, Grafana, OpenSearch, OpenSearch Dashboards, Alertmanager, Filebeat, Sentry, and Sentry worker.
- Docker secrets are used for database, JWT, Stripe, Grafana, OpenSearch, and Sentry secrets.

### Kubernetes

- `infra/k8s/staging.yaml` provides staging deployment.
- `infra/k8s/production-hardened.yaml` provides hardened production resources.
- `infra/k8s/secrets.yaml` provides Kubernetes secret templates.
- `infra/k8s/postgres-ha.yaml`, `redis-cluster.yaml`, `backend-deployment.yaml`, `configmap.yaml`, and `cdn-ingress.yaml` provide supporting deployment resources.

### CI/CD

- `.github/workflows/ci-cd.yml` defines security audit, build/test, Docker build/push, staging deployment, and production deployment jobs.
- `.github/workflows/react-doctor.yml` and `.github/workflows/rollback.yml` add additional CI/CD support.

## Service Responsibilities

| Service / module | Responsibility |
| :--- | :--- |
| `AuthServiceModule` | JWT, Passport, sessions, user auth |
| `UserModule` / user-profile/address controllers | User profiles, addresses, payment methods |
| `RestaurantServiceModule` | Restaurants, branches, menu, moderation, onboarding, KDS |
| `OrderServiceModule` / `modules/orders` | Order lifecycle, order items, checkout flow |
| `PaymentServiceModule` | Payment intents, confirmations, refunds, idempotency, webhooks, fraud/payment hardening |
| `PaymentProviderModule` | Stripe Connect, Razorpay settlement, driver payouts |
| `DeliveryServiceModule` / `DriverOpsModule` | Delivery orchestration, driver operations |
| `DriverFleetModule` | Driver fleet state, KYC, incentives, documents |
| `DriverAssignmentModule` | Proximity dispatch and ETA intelligence |
| `KitchenModule` | Kitchen workflow, prep, SLA, inventory, recipes, batches |
| `NotificationModule` | FCM, SMS, email, APNs, notification preferences |
| `TrackingModule` | Socket.IO tracking gateway |
| `SearchServiceModule` | Restaurant/menu search |
| `WalletModule` | Wallet balances and wallet transactions |
| `LoyaltyModule` | Loyalty, coupons, referrals, subscriptions |
| `AdminServiceModule` | Admin stats and operational dashboards |
| `AnalyticsModule` | Platform and business metrics |
| `AI` | Recommendations, chatbot responses, demand forecasting |
| `ComplianceModule` | Data retention and compliance checks |
| `SupportModule` | Support workflows |
| `AuditModule` | Audit logs and payment event audit |
| `GSTModule` | GST details and restaurant GST |
| `FinanceModule` / `LedgerModule` | Finance, ledger, payout reports |
| `RefundModule` | Refund approvals and refund reports |
| `ReviewServiceModule` | Review documents |
| `QueueModule` | BullMQ queue and order lifecycle worker |
| `MetricsModule` | `/metrics` and prom-client integration |
| `LoggingModule` | Backend logging and sanitization |
| `SecurityModule` | Throttler, encryption, secret loader, RBAC/JWT support |
| `GrpcModule` / `AppGrpcModule` | gRPC auth and order services on port `50051` |

## Database Responsibilities

| Store | Verified responsibility |
| :--- | :--- |
| PostgreSQL | Primary relational store for users, sessions, audit logs, restaurants, branches, menus, inventory, drivers, orders, order items, subscriptions, recipes, batches, kitchen SLA, supplier data, driver assignment, SLA alerts, payment disputes, idempotency, payment validation/fraud/events, GST, support, refunds, loyalty, wallet, ledger, and payout data |
| MongoDB | `ReviewDocument` via Mongoose |
| Redis | ioredis cache/session support and BullMQ queue backend |
| BullMQ | Redis-backed queue processing, including `ORDER_LIFECYCLE` |
| Vault | Optional secret lookup and rotation integration |

No repository-backed file storage service such as S3 or MinIO was found during verification.

## Observability Responsibilities

| Component | Responsibility |
| :--- | :--- |
| Sentry | App-level error tracking when `SENTRY_DSN` is configured |
| LoggingModule | Backend logging and sanitization |
| `/metrics` | Metrics endpoint via prom-client |
| Prometheus | Scrapes `spicegarden:3001` at `/metrics` |
| Grafana | Dashboards provisioned from `infra/grafana/` |
| Alertmanager | Slack and PagerDuty alert routing |
| OpenSearch | Log aggregation target |
| OpenSearch Dashboards | Log UI |
| Filebeat | Log shipping to OpenSearch |

## Known Architecture Caveats

- No standalone backend Checkout module was found; checkout is implemented through Orders + Payments.
- No repository-backed S3/MinIO/file storage service was found.
- `@spicegarden/api-types` and `@spicegarden/grpc-transport` exist as shared packages, but app-level imports were not found for those packages in the scanned frontend source.
- `VaultService` exists, but Vault is not present as a Docker Compose service in the inspected compose files.
- Dockerfile is backend-only and does not build or serve frontend/mobile apps.
- Kubernetes manifests exist, but deployment validation against a real cluster is not fully proven.
- Payment, auth, RBAC, rate limiting, and WebSocket synchronization should be treated as implementation areas that still need production validation.
