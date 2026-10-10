# System Integration Inventory — SpiceGarden RC-1.0.0

**Repository:** SpiceGarden Multi-Tenant Food Delivery Monorepo  
**Release Candidate:** `v1.0.0-rc1` / RC-1.0.0  
**Commit:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Audit Date:** 2026-09-29  

---

## 1. Applications Inventory

| Application | Path | Type / Framework | Port / Target | Key Responsibilities |
|---|---|---|---|---|
| **Backend API Gateway & Core** | `apps/backend` | NestJS 11 / Express / Node.js 20+ | Port 3001 | REST API, WebSocket Gateway, Auth, RBAC, Business Logic, Payment Orchestration, Queue Management, DB Connectivity |
| **Customer Web** | `apps/customer-web` | Next.js 15.5.18 / React 19 / TypeScript | Port 3002 | Customer storefront, restaurant search, menu discovery, cart, checkout, live tracking, order history, wallet management |
| **Restaurant Dashboard** | `apps/restaurant-dashboard` | Next.js 15.5.18 / React 19 / TypeScript | Port 3003 | Kitchen Display System (KDS), menu manager, order acceptance/prep state, inventory toggles, restaurant profile |
| **Super Admin Portal** | `apps/super-admin` | Next.js 15.5.18 / React 19 / TypeScript | Port 3004 | Platform governance, tenant/restaurant management, driver fleet management, analytics, system audit logs, loyalty controls |
| **Customer Mobile App** | `apps/customer-mobile` | React Native / Expo 57 / TypeScript | iOS / Android | Native mobile ordering, push notifications, GPS restaurant discovery, realtime socket tracking |
| **Delivery Partner Mobile App**| `apps/delivery-partner` | React Native / Expo 57 / TypeScript | iOS / Android | Order dispatch reception, GPS routing, delivery status transitions, earnings & shift tracking |
| **Electron Launcher** | `apps/launcher` | Electron 42.4 / React / Webpack | Desktop App | Operational status desktop cockpit, local cluster launcher, environment status monitor |

---

## 2. Shared Packages Inventory

| Package | Path | Type | Purpose / Exports |
|---|---|---|---|
| `@spicegarden/shared` | `packages/shared` | TypeScript Library | Common domain models, constants, utility functions, validation schemas, API helpers |
| `@spicegarden/ui` | `packages/ui` | React Component Library | Shared design system components (Button, Input, Card, Modal, Flow, Badge, Skeleton) |
| `@spicegarden/api-types` | `packages/api-types` | TypeScript Definitions | Shared DTOs, API request/response contracts across frontends and backend |
| `@spicegarden/grpc-transport`| `packages/grpc-transport` | TypeScript Transport | gRPC client definitions and serialization layer for inter-service communication |
| `@spicegarden/proto` | `packages/proto` | Protocol Buffers | Protobuf schema definitions for high-performance internal microservices |
| `@spicegarden/ux` | `packages/ux` | Design System Assets | Tokens, styling guidelines, and theme definitions |

---

## 3. Infrastructure & Deployment Assets

| Category | Path / Files | Description |
|---|---|---|
| **Kubernetes (Production & Staging)** | `infra/k8s/production-hardened.yaml`<br>`infra/k8s/staging.yaml`<br>`infra/k8s/cdn-ingress.yaml`<br>`infra/k8s/redis-cluster.yaml`<br>`infra/k8s/mongo-cluster.yaml`<br>`infra/k8s/postgres-ha.yaml` | Production-ready K8s manifests with resource limits, HPA, liveness/readiness probes, pod disruption budgets, security contexts |
| **Containerization** | `compose.dev.yaml`<br>`compose.prod.yaml`<br>`compose.infra.yaml`<br>`Dockerfile` | Multi-stage Dockerfiles and container-compose configurations for development and production infrastructure |
| **Automation & Operational Scripts** | `infra/scripts/backup.sh`, `backup.ps1`<br>`infra/scripts/restore.sh`<br>`infra/scripts/disaster-recovery.sh`<br>`infra/scripts/autoscaling-validation.sh`<br>`infra/scripts/fake-orders.js`<br>`infra/scripts/breaking-point.js`<br>`infra/scripts/verify-stack.js`<br>`infra/scripts/validate-env-consistency.js` | Automated infrastructure scripts for DB backup, DR restoration, autoscaling verification, fake order generation, stack health checks |
| **Load Testing Suites** | `infra/load-tests/stage-1-1k.js`<br>`infra/load-tests/stage-2-5k.js`<br>`infra/load-tests/stage-3-10k.js`<br>`infra/load-tests/stage-4-20k.js`<br>`infra/load-tests/websocket-stress.js`<br>`infra/load-tests/database-stress.js` | k6 load test scripts covering staged concurrency from 1,000 to 20,000 VUs, WebSocket stress, and payment stress |

---

## 4. System Integrations & Connections

| Component / Subsystem | Integration Point / Protocol | Implementation Details | Connection Status |
|---|---|---|---|
| **Relational Database** | PostgreSQL 15+ (TypeORM / `pg`) | Connection pooling (max 50), migrations, ACID transactions, row-level locks, foreign keys, composite indexes | **VERIFIED IN-CODE & TESTS** |
| **Document / Event Store**| MongoDB 7.0+ (Mongoose) | Audit logs, telemetry, unstructured tracking data, event archives | **VERIFIED IN-CODE & TESTS** |
| **Caching & Fast KV** | Redis 7+ (`ioredis`) | Session cache, auth rate-limit store, pub/sub for Socket.IO adapter, distributed locks | **VERIFIED IN-CODE & TESTS** |
| **Job Queue & Workers** | BullMQ 5.78+ | Order fulfillment queue, notification dispatch worker, refund queue, email worker with retry & exponential backoff | **VERIFIED IN-CODE & TESTS** |
| **Realtime Gateway** | Socket.IO 4.8.3 (`@nestjs/websockets`) | TrackingGateway for live driver GPS broadcasting, order status updates, room authorization | **VERIFIED IN-CODE & TESTS** |
| **Payment Gateways** | Stripe SDK & Razorpay SDK + COD | Factory pattern (`GatewayFactoryService`), HMAC SHA256 webhook signature verification, Idempotency entity | **VERIFIED IN-CODE (Mocks/Contract)** |
| **Push Notifications** | FCM (Firebase) & APNs | ProductionNotificationService with batch sending, retry logic, and user preference filtering | **VERIFIED IN-CODE (Mocks/Contract)** |
| **Email / SMS** | SendGrid / Twilio integrations | NotificationService templated alerts for order confirmation, password reset, and 2FA | **VERIFIED IN-CODE (Mocks/Contract)** |
| **Authentication & RBAC**| JWT + Passport + Argon2 / Bcrypt | Access & Refresh tokens, RolesGuard, PermissionsGuard, Cookie/Header dual extraction | **VERIFIED IN-CODE & TESTS** |
