# System Architecture Report

Generated: 2026-06-17T21:30+05:30  
Evidence: backend modules, controllers, services, entities, infra manifests, package manifests, frontend route/screen inventory.

## Architecture Summary

SpiceGarden is a monorepo with a NestJS backend, multiple React/Next.js frontends, a React Native customer mobile app, shared TypeScript packages, a launcher app, PostgreSQL/MongoDB/Redis infrastructure, BullMQ queues, Socket.IO realtime channels, and Kubernetes deployment manifests.

## Core Components

| Component | Evidence | Role |
| :--- | :--- | :--- |
| Backend | `apps/backend/src/app.module.ts`, `main.ts`, `main-grpc.ts` | NestJS REST API, WebSocket gateway, gRPC bootstrap, security middleware, queues |
| PostgreSQL | `compose.yaml`, `compose.dev.yaml`, `infra/k8s/production-hardened.yaml` | TypeORM relational data for users, restaurants, orders, payments, wallets, etc. |
| MongoDB | `apps/backend/src/db/db.module.ts` | Mongoose review collection |
| Redis | `apps/backend/src/security/security.module.ts`, compose manifests | BullMQ queue and optional rate-limit store |
| BullMQ | `apps/backend/src/infra/queue/queue.service.ts`, `order.processor.ts` | Async order lifecycle processing |
| Socket.IO | `apps/backend/src/infra/tracking/tracking.gateway.ts` | Realtime order, delivery, restaurant, and tracking events |
| Customer web | `apps/customer-web/src/pages` | Next.js customer storefront |
| Customer mobile | `apps/customer-mobile/src/screens` | React Native customer app |
| Delivery partner | `apps/delivery-partner/src/screens` | React Native delivery partner app |
| Restaurant dashboard | `apps/restaurant-dashboard/src/pages` | Next.js restaurant operations dashboard |
| Super admin | `apps/super-admin/src/pages` | Next.js admin dashboard |
| Shared packages | `packages/shared`, `packages/api-types`, `packages/proto`, `packages/grpc-transport`, `packages/ui` | Domain types, API types, gRPC/proto utilities, UI primitives |

## Backend Architecture

The backend is wired in `apps/backend/src/app.module.ts` with:

- `DbModule`
- `SecurityModule`
- `UsersModule`
- `RestaurantModule`
- `OrderModule`
- `PaymentsModule`
- `NotificationModule`
- `QueueModule`
- `TrackingModule`
- `MetricsModule`
- `LegalModule`
- `GstModule`
- `RefundModule`
- `ChargebackModule`
- `SupportModule`
- `LoyaltyModule`
- `MapsModule`
- `MenuCustomizationModule`
- `DriverAssignmentModule`
- `KitchenModule`
- `RestaurantOperationsModule`
- `RestaurantOnboardingModule`
- `BusinessEngineModule`
- `FinanceModule`
- `WalletModule`
- `ReviewModule`
- `AdminModule`
- `DriverControllerModule`
- `PaymentProviderModule`
- `DriverOpsModule`
- `DriverFleetModule`
- `SearchModule`

## Database Architecture

- TypeORM entities live under `apps/backend/src/db/entities`.
- `db.module.ts` imports 40 entity files into PostgreSQL plus Mongoose for reviews.
- Important relational domains: users, restaurants, orders, payments, wallets, addresses, payment methods, loyalty, support, refunds, chargebacks, driver assignment, kitchen, restaurant operations, finance, menu customization, search, maps, and admin.
- Mongo is used for reviews through `ReviewSchema`.

## Realtime Architecture

`TrackingGateway` defines Socket.IO namespaces:

- `/tracking` for customer order tracking
- `/restaurant` for restaurant dashboard updates
- `/super-admin` for admin updates
- `/delivery` for delivery partner updates

Event evidence includes order status changes, restaurant dashboard, admin dashboard, delivery lifecycle, and customer order tracking handlers.

## Deployment Architecture

- Dockerfile builds the backend only, using `node:20-alpine`, copying root `node_modules`, running as non-root user `nextjs`, exposing `3001`, and healthchecking `/health`.
- `compose.dev.yaml` starts PostgreSQL, Redis, Mongo, Prometheus, Grafana, OpenSearch, and Alertmanager for local development.
- `compose.infra.yaml` includes backend, PostgreSQL, Redis, Mongo, Prometheus, Grafana, OpenSearch, Alertmanager, Filebeat, Sentry, and secret mounts.
- Kubernetes manifests exist for staging and production-hardened deployments, including HPA, PDB, NetworkPolicy, backup CronJob, PVC, Ingress, and config/secrets.

## Known Architecture Gaps

- Backend Dockerfile only builds the backend; frontend build/deploy artifacts are not represented in the root Dockerfile.
- Production hardening exists in manifests, but feature freeze prevents adding new modules or routes.
- Security audit found unguarded controller groups and simplified payment/fraud limits.
- React Doctor current scans show maintainability warnings and a few errors across frontend apps.
