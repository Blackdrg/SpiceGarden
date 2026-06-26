# System Architecture

**Date:** 2026-06-26
**Scope:** SpiceGarden High-Level Architecture
**Classification:** Evidence-based

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Customers     │     │  Restaurants    │     │   Drivers       │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                  │
                          ┌───────▼────────┐
                          │   Backend      │
                          │   (NestJS)     │
                          │   Port 3001    │
                          └───────┬────────┘
                                  │
        ┌───────────────┬─────────┼─────────┬───────────────┐
        │               │         │         │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌▼──────┐ ┌▼─────────────┐
│  PostgreSQL  │ │   MongoDB   │ │ Redis │ │  OpenSearch   │
│  Port 5432   │ │  Port 27017 │ │ 6379  │ │   Port 9200    │
└──────────────┘ └──────────────┘ └───────┘ └───────────────┘
        │               │         │         │
        └───────────────┴─────────┴─────────┴───────┐
                                    │
                        ┌───────────▼───────────────┐
                        │     Observability         │
                        │  Prometheus (9090)        │
                        │  Grafana (3000)           │
                        │  Alertmanager (9093)      │
                        └───────────────────────────┘
```

## Backend Architecture

### Module Structure

From `src/app.module.ts`:

```
AppModule
├── ConfigModule (global)
├── DbModule
│   ├── PostgreSQL (TypeORM)
│   ├── MongoDB (Mongoose)
│   └── Redis (ioredis)
├── SecurityModule
│   ├── JWT Auth Guard
│   ├── Roles Guard
│   ├── Permissions Guard
│   ├── CSRF Middleware
│   ├── Helmet Security
│   ├── Rate Limiting
│   └── Encryption Service
├── LoggingModule
├── QueueModule (BullMQ)
├── TrackingModule (WebSocket)
├── AuthServiceModule
├── OrderServiceModule
├── PaymentServiceModule
├── RestaurantServiceModule
├── SearchServiceModule
├── DeliveryServiceModule
├── DriverOpsModule
├── AdminServiceModule
├── NotificationModule
├── KitchenModule
├── DriverAssignmentModule
├── MetricsModule (Prometheus)
├── ComplianceModule
├── AuditModule
├── WalletModule
├── GSTModule
├── FinanceModule
├── SupportModule
├── RefundModule
├── LoyaltyModule
├── DriverFleetModule
├── AnalyticsModule
├── ReviewServiceModule
├── UserProfileModule
└── ApisModule
```

## Frontend Architecture

### customer-web (Next.js 15.5.18)

```
src/
├── pages/           # 21 routes
│   ├── index.tsx    # Home
│   ├── auth/        # Authentication
│   ├── cart.tsx     # Cart
│   ├── checkout.tsx # Checkout
│   ├── tracking.tsx # Real-time tracking
│   └── wallet.tsx   # Wallet
├── redux/           # Redux Toolkit
│   └── slices/
├── hooks/           # Custom hooks
└── components/      # UI components
```

### restaurant-dashboard (Next.js)

- Kitchen Display System (KDS)
- Order management

### super-admin (Next.js)

- Analytics dashboard
- Driver fleet management
- Loyalty program management

## Mobile Architecture

### customer-mobile (Expo)

- 14 screens implemented
- Navigation via React Navigation
- expo-location, expo-notifications

### delivery-partner (Expo)

- React Native with native Android
- Location tracking
- Delivery flow

## Data Flow

### Order Flow

```
Customer → /orders → OrderService → PaymentService → Restaurant KDS
                                                ↓
                                            DriverAssignment → Driver
                                                ↓
                                        TrackingGateway → Customer
```

### Payment Flow

```
Customer → PaymentService → GatewayFactory → Stripe/Razorpay/COD
                           ↓
                    WebhookService (async) → OrderService
```

## Infrastructure

### Docker Compose Services

| Service | Purpose | Ports |
|---------|---------|-------|
| postgres | Primary DB | 5432 |
| redis | Cache/Queue | 6379 |
| mongo | Document store | 27017 |
| prometheus | Metrics | 9090 |
| grafana | Dashboards | 3000 |
| opensearch | Log search | 9200 |
| alertmanager | Alerts | 9093 |
| backend | API server | 3001 |

### Kubernetes Production

**Manifest:** `infra/k8s/production-hardened.yaml`

- 3 replicas (minAvailable: 2)
- HPA: min 3, max 20 (CPU 70%, Memory 80%)
- SecurityContext: non-root, read-only root, no-new-privileges
- NetworkPolicy: restricted ingress/egress
- PodDisruptionBudget: 1 max unavailable

## Observability Stack

### Prometheus Metrics

**Endpoint:** `/metrics`
**Format:** Prometheus text format (~64KB)

Metrics:
- `http_requests_total` - Request counter
- `http_request_duration_seconds` - Latency histogram

### Grafana Dashboard

**File:** `infra/grafana/dashboards/spicegarden.json`
**Panels:** 8 configured panels

### Alertmanager

**File:** `infra/alertmanager/alertmanager.yml`
**Integrations:** Slack, PagerDuty

### OpenSearch

**Purpose:** Log aggregation
**Template:** `infra/opensearch/index-templates/spicegarden-logs.json`