# REST → gRPC Migration Plan

## Overview
Replace SpiceGarden's REST APIs with gRPC while keeping the existing
Express + Socket.IO stack intact during the transition. Client apps
are migrated incrementally behind feature flags. No production downtime.

## Current state
- Backend: NestJS + Express on `:3001`
- Real-time: Socket.IO (kitchen + driver tracking)
- Clients: customer-web, customer-mobile, restaurant-dashboard, super-admin

## Target state
- Dual-transport: REST (`:3001`) + gRPC (`:50051`) in the same `AppModule`
- gRPC first for service-to-service and authenticated mobile traffic
- REST retained for: health checks, payment provider webhooks, OAuth redirects

## Delivery plan (no silos)

### Phase 0 — Done
- `apps/backend/src/proto/**/*.proto` (14 service files)
- `apps/backend/src/grpc/**/*.controller.ts` (14 gRPC controllers)
- `apps/backend/src/grpc/interceptors/grpc-jwt.interceptor.ts`
- `apps/backend/src/main.ts` serves both HTTP and gRPC
- `@grpc/grpc-js`, `@grpc/proto-loader` installed

### Phase 1 — Remaining
- Clean controller bugs in `AuthGrpcController`
- Add `@grpc/` metadata decorator for public vs authenticated RPCs
- Add `GrpcAuthHelper` to extract user info from JWT
- Gate `@nestjs/microservices` usage to `main-grpc.ts` and protobuf bootstrap
- Finish proto stubs package in `packages/proto`

### Phase 2 — Client switching
- Add shared feature flag `USE_GRPC=true|false`
- Add shared `ApiClient` wrapper (supersedes direct `fetch`):
  - customer-web: Next.js pages call new API
  - customer-mobile: React Native screens call new API
  - restaurant-dashboard: Next.js pages call new API
  - super-admin: Next.js pages call new API
- Envoy proxy for gRPC-Web (browser clients)

### Phase 3 — Cleanup
- Remove Express rate-limit from gRPC paths
- Drop `@nestjs/swagger` dependency
- Keep only health/metrics REST endpoints

## Communication
- When a client switches to gRPC, update its REDME/service README and
  send a 1-sentence note in the same PR. No separate tracking sheet.
