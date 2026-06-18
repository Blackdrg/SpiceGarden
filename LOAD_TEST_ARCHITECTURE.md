# LOAD_TEST_ARCHITECTURE

Generated: 2026-06-18 18:26 IST

## Verified target URLs

| Component | Configured URL | Verified evidence | Status |
|---|---:|---|---|
| Backend API | `http://localhost:3001` | `curl.exe http://localhost:3001/health` now returns HTTP 200 after fixing `LocalRepositoryModule` provider nesting | PASS for health only |
| Customer web | `http://localhost:3002` in `compose.dev.yaml`; `NEXT_PUBLIC_API_URL=http://localhost:3001` in `apps/customer-web/.env.development.local` | `curl.exe http://localhost:3002/` failed to connect | FAIL |
| Restaurant dashboard | `http://localhost:3003` in `compose.dev.yaml`; `NEXT_PUBLIC_API_URL=http://localhost:3001` in `apps/restaurant-dashboard/.env.development.local` | `curl.exe http://localhost:3003/` failed to connect | FAIL |
| Super admin | `http://localhost:3004` in `compose.dev.yaml`; `NEXT_PUBLIC_API_URL=http://localhost:3001` in `apps/super-admin/.env.development.local` | `curl.exe http://localhost:3004/` failed to connect | FAIL |
| Delivery partner | `http://localhost:3005` in `compose.dev.yaml` | `curl.exe http://localhost:3005/` failed to connect | FAIL |
| Production API gateway | `https://api.spicegarden.com` in `compose.dev.yaml`, frontend env files, and `infra/k8s/production-hardened.yaml` ingress | DNS resolves to `54.237.57.21`; HTTPS handshake fails with `SEC_E_ILLEGAL_MESSAGE` | FAIL |
| Customer production URL | `https://customer.spicegarden.com` | DNS resolves to `54.237.57.21`; HTTPS handshake fails | FAIL |
| Restaurant production URL | `https://restaurant.spicegarden.com` | DNS resolves to `54.237.57.21`; HTTPS handshake fails | FAIL |
| Admin production URL | `https://admin.spicegarden.com` | DNS resolves to `54.237.57.21`; HTTPS handshake fails | FAIL |

## Backend URL

- Local backend target used by K6: `http://localhost:3001`
- Backend controller entrypoint: `apps/backend/src/main.ts`
- Local startup: `npm --workspace @spicegarden/backend run dev`
- Current result: health endpoint reachable; full API modules are not mounted in local dev mode.

## Frontend URL

- Local customer web compose port: `http://localhost:3002`
- Local restaurant dashboard compose port: `http://localhost:3003`
- Local super-admin compose port: `http://localhost:3004`
- Local delivery-partner compose port: `http://localhost:3005`
- Production frontend URLs are referenced in compose/frontend env files but not currently reachable from this workstation.

## API gateway

- Production ingress host: `api.spicegarden.com`
- Config file: `infra/k8s/production-hardened.yaml`
- Ingress backend: service `spicegarden-backend`, port `80`, targetPort `3001`
- Local compose has no API gateway service; frontends point directly to backend at `http://localhost:3001`.

## Auth service

- Controller: `apps/backend/src/services/auth/auth.controller.ts`
- Register: `POST /auth/register`
- Login: `POST /auth/login`
- JWT strategy: `apps/backend/src/services/auth/strategies/jwt.strategy.ts`
- Refresh token flow: `AuthService.login()` returns a `refresh_token`, but no HTTP refresh endpoint exists.

## Database

- PostgreSQL compose: `postgres:16-alpine`, local port `5432`, database `spicegarden`
- PostgreSQL Kubernetes: `infra/k8s/postgres-ha.yaml`, StatefulSet `postgres`, service `postgres:5432`
- MongoDB compose: `mongo:7`, local port `27017`, URI `mongodb://mongo:27017/spicegarden`
- TypeORM entities include users, orders, restaurants, menu items, sessions, payments, refunds, and queues.
- Local dev fallback uses `LocalRepositoryModule` and does not connect to PostgreSQL/MongoDB.

## Redis

- Compose service: `redis:7-alpine`, local port `6379`
- Queue connection: `REDIS_URL` or `redis://localhost:6379`
- BullMQ queues: `ORDER_LIFECYCLE` in `apps/backend/src/shared/contracts/queues.ts`
- Rate-limit store: Redis URL from `REDIS_RATE_LIMIT_URL`, `REDIS_URL`, or `redis://${REDIS_HOST}:${REDIS_PORT}`.

## Queues

- Module: `apps/backend/src/infra/queue/queue.module.ts`
- Service: `QueueService`
- Queue name: `ORDER_LIFECYCLE`
- Worker: `OrderProcessor`
- Redis dependency: BullMQ/IORedis.

## Websocket endpoints

- Tracking gateway: Socket.IO root namespace `/`, declared namespaces `/tracking`, `/kds`, `/admin`, `/driver`
- Tracking events: `ping`, `join`, `ack`, `message`
- KDS namespace: `kds`
- KDS events: `updatePrepStatus`, `newOrder`, `orderStatusUpdated`
- Socket URLs in frontend dev env: `http://localhost:3001`
- Socket URL in frontend production env: `https://api.spicegarden.com`

## k6 scripts located

- `apps/backend/test/load/10k-users.js`
- `apps/backend/test/load/1k-users.js`
- `apps/backend/test/load/5k-users.js`
- `apps/backend/test/load/20k-users.js`
- `apps/backend/test/load/breaking-point.js`
- `apps/backend/test/load/concurrent-users.js`
- `apps/backend/test/load/db-bottleneck.js`
- `apps/backend/test/load/friday-dinner-rush.js`
- `apps/backend/test/load/order-placement-stress.js`
- `apps/backend/test/load/payment-spike.js`
- `apps/backend/test/load/redis-saturation.js`
- `apps/backend/test/load/user-flow-10k.js`
- `apps/backend/test/load/websocket-stress.js`
