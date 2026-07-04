# SpiceGarden Architecture Report

Generated: 2026-07-04
Evidence source: Direct inspection of app.module.ts, main.ts, and all module files

## 1. Overall Architecture

SpiceGarden follows a **client-server microservices-inspired architecture** within a monorepo:

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer / Ingress                  │
│                    (Nginx + Envoy + CDN)                     │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ customer-web │   │   restaurant  │   │   super-admin│
│   :3002      │   │  dashboard   │   │    :3004     │
│  Next.js 15  │   │   :3003      │   │  Next.js 15  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   customer   │   │   restaurant  │   │   super-admin│
│   mobile     │   │   dashboard   │   │  dashboard   │
│  (Expo 56)   │   │  (Expo 56)   │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Gateway                        │
│                 @spicegarden/backend (NestJS)                 │
│                          :3001                                │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Auth   │ │  Orders  │ │Payments  │ │Kitchen   │      │
│  │ Module   │ │ Module   │ │ Module   │ │ Module   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Delivery │ │  Wallet  │ │ Refund   │ │ Loyalty  │      │
│  │ Module   │ │ Module   │ │ Module   │ │ Module   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ... 35+ modules total                                       │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │   MongoDB    │   │     Redis    │
│    16        │   │      7       │   │      7       │
│  (TypeORM)   │   │  (Mongoose)  │   │  (BullMQ)    │
└──────────────┘   └──────────────┘   └──────────────┘
```

## 2. Backend Modular Architecture

### 2.1 Root Module
**File:** `apps/backend/src/app.module.ts`
- Imports 35+ feature modules
- Global modules: ConfigModule, DbModule, SecurityModule, LoggingModule, QueueModule, TrackingModule
- Feature modules: Auth, Order, Payment, Restaurant, Search, Delivery, Admin, Notification, Kitchen, DriverAssignment, Metrics, Compliance, Audit, Wallet, GST, Finance, Support, Refund, Loyalty, DriverFleet, Analytics, Review, UserProfile

### 2.2 Module Organization

| Pattern | Modules | Rationale |
|---------|---------|-----------|
| Services | auth, order, payments, restaurant, search, delivery, admin, wallet, refund, support, review, user, menu-customization, maps, finance, gst, loyalty, driver-fleet | Standard NestJS feature modules |
| Modules | kitchen, driver-assignment, analytics | More complex features with sub-structure |

### 2.3 Database Layer
- **TypeORM** for PostgreSQL (68+ entities)
- **Mongoose** for MongoDB (1 schema: ReviewDocument)
- **Adapters**: PostgresAdapter, MongoAdapter, RedisAdapter
- **Local fallback**: SQLite-based in-memory repository for development

### 2.4 Security Layer
- Global SecurityModule exports EncryptionService, ThrottlerModule, PermissionGuard, RolesGuard
- Guards: JwtAuthGuard, RolesGuard, PermissionGuard
- Decorators: @Roles(), @Permissions()

## 3. Frontend Architecture

### 3.1 Customer Web (Next.js 15.5)
- **Framework**: Next.js Pages Router
- **State**: Redux Toolkit (auth, cart) + React Query (server state)
- **Styling**: CSS Modules
- **Real-time**: Socket.IO client
- **Error Tracking**: Sentry (@sentry/nextjs)
- **Analytics**: Custom implementation

### 3.2 Restaurant Dashboard (Next.js 15.5)
- **Framework**: Next.js Pages Router
- **State**: useReducer + dummy Redux
- **Styling**: CSS Modules
- **Real-time**: Socket.IO client
- **Key Feature**: Kitchen Display System (KDS) with WebSocket updates

### 3.3 Super Admin (Next.js 15.5)
- **Framework**: Next.js Pages Router
- **State**: useReducer + dummy Redux
- **Styling**: CSS Modules
- **Real-time**: Socket.IO client
- **Key Features**: Analytics, driver fleet, loyalty management

### 3.4 Mobile Apps (Expo 56)
- **Framework**: React Native + Expo
- **Navigation**: React Navigation (NativeStack + BottomTabs)
- **Storage**: AsyncStorage
- **Real-time**: Socket.IO client
- **Native**: expo-location, expo-notifications, expo-haptics

## 4. Shared Packages Architecture

### 4.1 @spicegarden/ui
- **Type**: Design system + component library
- **Exports**: 19 components/hooks modules
- **Design Tokens**: DESIGN_TOKENS (colors, spacing, typography, radius, motion, shadows)
- **Dark Mode**: Defined but not wired
- **Icons**: 18 custom Lucide wrappers
- **Storybook**: Configured (14 stories)
- **Tests**: 5 suites, 28 tests

### 4.2 @spicegarden/shared
- **Type**: Business logic utilities
- **Exports**: types, constants, api, analytics
- **API Client**: Shared fetch wrapper with auth refresh, CSRF protection
- **Issue**: Uses NEXT_PUBLIC_API_URL, ties to Next.js

## 5. Data Flow

```
Client App
    │
    ▼
API Gateway (Nginx/Envoy)
    │
    ▼
NestJS Backend
    │
    ├──► JWT Auth Guard
    ├──► Rate Limiter
    ├──► CSRF Middleware
    ├──► ValidationPipe
    │
    ▼
Controller Layer
    │
    ▼
Service Layer (Business Logic)
    │
    ├──► Fraud Service
    ├──► Idempotency Service
    ├──► Notification Service
    │
    ▼
Repository Layer (TypeORM/Mongoose)
    │
    ▼
Database
    ├──► PostgreSQL (Primary)
    ├──► MongoDB (Reviews - future)
    └──► Redis (Queue, Cache, Rate Limiting)

Background Jobs (BullMQ)
    │
    ▼
Order Processor → Notification Service → WebSocket Gateway → Clients
```

## 6. Infrastructure Architecture

### 6.1 Development
- Docker Compose: 13 services (postgres, redis, mongo, prometheus, grafana, opensearch, alertmanager, backend, customer-web, restaurant-dashboard, super-admin, delivery-partner)
- Volume mounts for hot reloading
- Environment via .env files

### 6.2 Production
- Docker multi-stage build (backend only)
- Kubernetes manifests: staging, production-hardened
- ConfigMaps and Secrets
- CDN/Ingress configuration
- No blue-green or canary deployment defined

### 6.3 Monitoring Stack
- **Metrics**: Prometheus + Grafana
- **Logs**: Filebeat → OpenSearch
- **Errors**: Sentry
- **APM**: Not configured
- **Tracing**: Not configured

## 7. Security Architecture

| Layer | Controls |
|-------|----------|
| Transport | Helmet (CSP, HSTS) |
| Network | CORS, rate limiting |
| Application | CSRF, HPP, Mongo sanitize, body limits |
| Auth | JWT + OAuth2 (Google, Facebook) |
| Authz | RBAC (8 roles) + granular permissions |
| Data | AES-256-GCM encryption, PII masking |
| Secrets | Vault + local secret loader |
| Monitoring | Sentry, Prometheus |

## 8. Gap Analysis

| Gap | Severity | Impact |
|-----|----------|--------|
| No API versioning | High | Breaking changes will break clients |
| No distributed tracing | Medium | Difficult to debug microservice flows |
| No circuit breakers | Medium | Cascade failures possible |
| No blue-green deployment | High | Risky deployments |
| No automated backups | High | Data loss risk |
| N+1 queries in OrderService | Medium | Performance degradation |
| No 2FA/MFA | High | Account takeover risk |
| No email verification enforcement | Medium | Fake accounts |