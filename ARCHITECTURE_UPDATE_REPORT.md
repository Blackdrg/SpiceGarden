# Architecture Update Report

## Timestamp

2026-06-17 10:54:18 +05:30

## Diagrams Added

- `README.md` — appended `### System Architecture Flowchart`
- High-level system flow diagram
- Backend service architecture diagram
- Database and queue flow diagram
- Real-time delivery tracking flow diagram
- DevOps / deployment architecture diagram
- `SYSTEM_ARCHITECTURE.md` — detailed architecture explanation and supporting notes

## Verified Modules Used

### Frontend

- `apps/customer-web` — Next.js customer web app with `@spicegarden/ui`, `@spicegarden/shared`, Redux Toolkit, React Query, and Socket.IO client
- `apps/customer-mobile` — Expo / React Native customer mobile app
- `apps/restaurant-dashboard` — Next.js restaurant KDS and inventory dashboard
- `apps/delivery-partner` — Expo / React Native delivery partner app
- `apps/super-admin` — Next.js super-admin analytics and operations panel
- `packages/ui` — design tokens, components, icons, and analytics exports
- `packages/shared` — API helpers and constants
- `packages/api-types` — shared delivery type definitions
- `packages/proto` — gRPC port constants
- `packages/grpc-transport` — gRPC transport package

### Backend

- `apps/backend/src/app.module.ts` — root module imports
- `apps/backend/src/main.ts` — HTTP bootstrap, middleware, validation, metrics
- `apps/backend/src/main-grpc.ts` — gRPC server on `0.0.0.0:50051`
- Auth, Users, Restaurants, Menu, Orders, Checkout flow, Delivery, Driver Fleet, Notifications, Loyalty, Wallet, Payments, Search, Tracking, Analytics, AI, Admin, Compliance, Support, Audit Logs, Queue/BullMQ, WebSocket gateways, and RBAC/Guards modules
- `apps/backend/src/infra/tracking/tracking.gateway.ts`
- `apps/backend/src/services/restaurant/kds.gateway.ts`
- `apps/backend/src/infra/queue/queue.service.ts`
- `apps/backend/src/infra/queue/order.processor.ts`
- `apps/backend/src/services/payments/payments.service.ts`
- `apps/backend/src/services/payments/gateway-factory.service.ts`
- `apps/backend/src/services/payments/gateways/stripe-gateway.service.ts`
- `apps/backend/src/services/payments/gateways/razorpay-gateway.service.ts`
- `apps/backend/src/security/vault.service.ts`

### Data and Queue

- PostgreSQL via TypeORM
- MongoDB via Mongoose for `ReviewDocument`
- Redis via ioredis
- BullMQ queue with `ORDER_LIFECYCLE`
- Optional Vault integration

### Payment

- Stripe payment intents, confirmations, refunds, and webhooks
- Razorpay orders, confirmations, refunds, and webhooks
- COD gateway
- Payment provider services for Stripe Connect, Razorpay settlement, and driver payouts

### Observability

- Sentry
- LoggingModule
- `/metrics` via prom-client
- Prometheus
- Grafana
- Alertmanager
- OpenSearch
- OpenSearch Dashboards
- Filebeat

### DevOps

- `Dockerfile`
- `compose.dev.yaml`
- `compose.infra.yaml`
- `.github/workflows/ci-cd.yml`
- `.github/workflows/react-doctor.yml`
- `.github/workflows/rollback.yml`
- `infra/k8s/production-hardened.yaml`
- `infra/k8s/staging.yaml`
- `infra/k8s/cdn-ingress.yaml`
- `infra/k8s/secrets.yaml`
- `infra/prometheus/prometheus.yml`
- `infra/grafana/provisioning/datasources/datasources.yml`
- `infra/alertmanager/alertmanager.yml`

## Mermaid Validation Status

- Validation tool: `@mermaid-js/mermaid-cli` with Puppeteer
- Command used: `npx --yes -p puppeteer -p @mermaid-js/mermaid-cli mmdc -i <diagram>.mmd -o <diagram>.svg`
- Result: all five diagrams rendered successfully
- GitHub compatibility: diagrams use `flowchart`, `subgraph`, `classDef`, directional arrows, and labels supported by GitHub-native Mermaid rendering

## Architecture Assumptions

- Checkout is represented as an `OrderService + PaymentService` flow because no standalone backend Checkout module was found.
- Vault is represented as optional because `VaultService` exists, but Vault is not present as a Docker Compose service in the inspected compose files.
- File storage is not included because no S3, MinIO, or repository-backed file storage service was found.
- `@spicegarden/api-types` and `@spicegarden/grpc-transport` are included because the packages exist; app-level imports were not found during source scanning.
- The diagrams describe implemented repository structure, not claimed production readiness.

## README Sections Updated

- Appended `### System Architecture Flowchart`
- Added a short repository-backed explanation paragraph
- Added five Mermaid diagrams:
  1. High-Level System Flow
  2. Backend Service Architecture
  3. Database & Queue Flow
  4. Real-Time Delivery Tracking Flow
  5. DevOps / Deployment Architecture

## Confidence Level

HIGH for repository-backed structure and module presence.

MEDIUM for runtime behavior because some areas remain implementation or validation caveats: rate limiting, payment/webhook production configuration, RBAC route coverage, WebSocket synchronization, Kubernetes deployment validation, and load/stress validation.
