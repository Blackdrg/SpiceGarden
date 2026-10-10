# System Architecture

## High-Level Architecture

SpiceGarden follows a modular monolith pattern with event-driven workflows. The backend exposes REST and WebSocket APIs consumed by multiple frontend channels.

### Service Interaction Diagram

```mermaid
graph TB
    subgraph "Frontend Channels"
        CW[customer-web:3002]
        RD[restaurant-dashboard:3003]
        SA[super-admin:3004]
        CM[customer-mobile]
        DP[delivery-partner]
        LA[launcher]
    end

    subgraph "Backend: NestJS"
        API[REST API Layer]
        WS[Socket.IO Gateway]
    end

    subgraph "Data Stores"
        PG[(PostgreSQL<br/>Port 5432)]
        MO[(MongoDB<br/>Port 27017)]
        RE[(Redis<br/>Port 6379)]
    end

    subgraph "Observability"
        PR[Prometheus:9090]
        GR[Grafana:3000]
        AM[Alertmanager:9093]
        SE[Sentry]
        OS[OpenSearch:9200]
    end

    CW -->|REST| API
    RD -->|REST| API
    SA -->|REST| API
    CM -->|REST/WebSocket| API
    DP -->|REST/WebSocket| API
    LA -->|REST| API

    API -->|TypeORM| PG
    API -->|Mongoose| MO
    API -->|Cache/Queues| RE

    WS -->|Real-time| CW
    WS -->|Real-time| RD
    WS -->|Real-time| DP

    API -->|Metrics| PR
    GR -->|Query| PR
    API -->|Logs| OS
    API -->|Errors| SE
    PR -->|Alerts| AM
```

## Monorepo Structure

```mermaid
graph LR
    subgraph "Root (spicegarden)"
        ROOT[package.json<br/>npm workspaces]
        APPS[apps/]
        PKGS[packages/]
    end

    subgraph "Applications (apps/)"
        BE[backend<br/>NestJS:3001]
        CW[cusomer-web<br/>Next.js:3002]
        RD[restaurant-dashboard<br/>Next.js:3003]
        SA[super-admin<br/>Next.js:3004]
        CM[customer-mobile<br/>Expo 56]
        DP[delivery-partner<br/>Expo 56]
        LA[launcher<br/>Electron 39]
    end

    subgraph "Shared Packages (packages/)"
        UI[ui<br/>React components]
        SH[shared<br/>Utilities]
        AT[api-types<br/>Interfaces]
        PR[proto<br/>Protobuf]
        GT[grpc-transport<br/>Quarantined]
    end

    ROOT --> APPS
    ROOT --> PKGS
    APPS --> BE
    APPS --> CW
    APPS --> RD
    APPS --> SA
    APPS --> CM
    APPS --> DP
    APPS --> LA
```

## Data Flow

### Order Lifecycle

```mermaid
sequenceDiagram
    participant C as Customer
    participant API as Backend API
    participant Q as BullMQ Queue
    participant R as Restaurant
    participant D as Driver
    participant DB as PostgreSQL

    C->>API: POST /orders
    API->>DB: Create order (status: placed)
    API->>Q: Enqueue ORDER_LIFECYCLE job
    Q->>API: Process order confirmation
    API->>R: WebSocket notification
    R->>API: PUT /orders/:id/status (restaurant_accepted)
    API->>Q: Enqueue driver assignment
    Q->>API: Assign driver
    API->>D: WebSocket notification
    D->>API: Update location/status
    API->>DB: Update order (status: delivered)
    API->>C: WebSocket delivery confirmation
```

### Auth Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Backend
    participant DB as PostgreSQL
    participant JWT as JwtAuthGuard

    C->>API: POST /auth/login
    API->>DB: Validate credentials
    API->>API: Generate JWT token
    API-->>C: Return JWT + refresh token
    C->>API: API request with Bearer token
    JWT->>API: Validate JWT signature
    API-->>C: Protected resource
```

### Payment Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant API as Backend
    participant SP as Stripe/Razorpay
    participant DB as PostgreSQL
    participant WH as Webhook Handler

    C->>API: POST /payments
    API->>DB: Create payment record
    API->>SP: Create payment intent
    SP-->>API: Return client secret
    API-->>C: Return client secret
    C->>SP: Complete payment
    SP->>API: POST /webhook
    API->>WH: Verify webhook signature
    WH->>DB: Update order (payment_confirmed)
    WH->>API: Emit payment event
```

### Delivery Flow

```mermaid
sequenceDiagram
    participant D as Driver
    participant API as Backend
    participant WS as Socket.IO
    participant C as Customer

    D->>API: POST /drivers/:id/location
    API->>WS: Emit location update
    WS->>C: Receive real-time location
    D->>API: PUT /orders/:id/status
    API->>C: Emit status update
    C->>API: GET /orders/:id/tracking
```

### Notification Flow

```mermaid
sequenceDiagram
    participant E as Event Source
    participant NS as Notification Service
    participant Q as BullMQ Queue
    participant NP as Notification Processor
    participant CH as Channel (FCM/SMS/Email)

    E->>NS: Create notification
    NS->>Q: Enqueue NOTIFICATION_DELIVERY job
    Q->>NP: Process notification
    NP->>CH: Send via appropriate channel
    CH-->>NP: Delivery receipt
    NP->>DB: Log delivery status
```

## Queue Architecture (BullMQ)

```mermaid
graph LR
    subgraph "BullMQ Queues (Redis-backed)"
        OL[ORDER_LIFECYCLE<br/>Order state transitions]
        ND[NOTIFICATION_DELIVERY<br/>Push/SMS/Email dispatch]
        PR[PAYMENT_RETRY<br/>Payment retry logic]
        WR[WEBHOOK_RETRY<br/>Webhook retries]
    end

    subgraph "Queue Processors"
        OP[OrderProcessor<br/>infra/queue/order.processor.ts]
        NP[NotificationQueueProcessor<br/>services/notifications/queue]
        PP[PaymentProcessor<br/>services/payments]
        WP[WebhookProcessor<br/>services/payments/webhook]
    end

    OL --> OP
    ND --> NP
    PR --> PP
    WR --> WP
```

## WebSocket Architecture (Socket.IO)

```mermaid
graph TD
    subgraph "Socket.IO Gateways"
        TG[TrackingGateway<br/>/tracking namespace]
        KG[KdsGateway<br/>/kds namespace]
        AG[AdminGateway<br/>/admin namespace]
        DG[DriverGateway<br/>/driver namespace]
    end

    subgraph "Event Broadcasting"
        EM[Event emitters in services]
        E1[order events]
        E2[location updates]
        E3[driver status]
        E4[admin alerts]
    end

    EM --> E1 --> TG
    EM --> E2 --> TG
    EM --> E3 --> DG
    EM --> E4 --> AG
    EM --> KG
```

## Component Responsibilities

### Backend Modules

| Module | Responsibility | Key Services |
|--------|----------------|--------------|
| `AuthModule` | Authentication, JWT, OAuth2 | `auth.service.ts`, `password-reset.service.ts` |
| `OrderModule` | Order lifecycle management | `order.service.ts` |
| `PaymentModule` | Payments, refunds, chargebacks | `payments.service.ts`, `refund.service.ts` |
| `DeliveryModule` | Delivery orchestration | `delivery.service.ts`, `enhanced-delivery.service.ts` |
| `WalletModule` | Wallet operations | `wallet.service.ts` |
| `GSTModule` | Tax compliance | `gst.service.ts` |
| `NotificationModule` | Multi-channel notifications | `notification.service.ts`, `notification-preferences.service.ts` |
| `KitchenModule` | Kitchen operations, KDS | `kitchen.service.ts` |
| `DriverAssignmentModule` | Driver matching, dispatch | `driver-assignment.service.ts`, `dispatch-engine.service.ts` |
| `AdminModule` | Platform administration | `admin.service.ts` |
| `AnalyticsModule` | Metrics, reporting | `analytics.service.ts` |
| `ComplianceModule` | GDPR/DPDP, SOC2, PCI-DSS | `compliance.service.ts` |
| `AuditModule` | Audit logging | `audit.service.ts` |
| `ReviewModule` | Customer reviews | `review.service.ts` |
| `SupportModule` | Customer support | `customer-support.service.ts` |
| `SearchModule` | Restaurant/dish search | `search.service.ts` |
| `MapsModule` | Geocoding, routing | `maps.service.ts` |
| `FinanceModule` | Financial operations | `tax-reporting.service.ts`, `reconciliation.service.ts` |

### Infrastructure Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `DbModule` | `apps/backend/src/db/` | TypeORM/Mongoose connection management |
| `QueueModule` | `apps/backend/src/infra/queue/` | BullMQ queue orchestration |
| `TrackingModule` | `apps/backend/src/infra/tracking/` | WebSocket gateway configuration |
| `SecurityModule` | `apps/backend/src/security/` | Guards, encryption, rate limiting |
| `MetricsModule` | `apps/backend/src/metrics/` | Prometheus metrics collection |
| `LoggingModule` | `apps/backend/src/logging/` | Structured logging |
| `SecretLoaderService` | `apps/backend/src/infra/` | Runtime secret injection |

### Frontend Applications

| App | Port | Purpose | Key Features |
|-----|------|---------|--------------|
| `customer-web` | 3002 | Customer storefront | Restaurant browsing, cart, checkout, order tracking |
| `restaurant-dashboard` | 3003 | Kitchen/KDS | Order management, inventory, real-time updates |
| `super-admin` | 3004 | Admin console | Analytics, driver fleet, support tickets |
| `customer-mobile` | Expo | Customer mobile | Navigation, location, push notifications |
| `delivery-partner` | Expo | Driver app | Location tracking, order status, earnings |
| `launcher` | Electron | Desktop | System monitoring, service control |