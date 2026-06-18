# REDIS_VALIDATION

Generated: 2026-06-18 18:26 IST

## Configured Redis

| Use | Config source | Expected local endpoint |
|---|---|---:|
| Queue/cache/rate-limit | `.env`, `compose.dev.yaml`, `apps/backend/src/security/redis-rate-limit.store.ts`, `apps/backend/src/infra/queue/queue.service.ts` | `localhost:6379` |
| BullMQ queues | `apps/backend/src/shared/contracts/queues.ts` | `ORDER_LIFECYCLE` |

## Live checks

| Check | Command | Result | PASS/FAIL |
|---|---|---|---|
| Redis TCP | `Test-NetConnection localhost -Port 6379` | `TcpTestSucceeded: False` | FAIL |
| Redis CLI | `redis-cli ping` | `redis-cli` not found on PATH | FAIL |
| Queue inspection | BullMQ `getQueueStats('ORDER_LIFECYCLE')` | Backend not running full app; Redis unavailable | FAIL |
| Session/cache inspection | Redis keys | Redis unavailable | FAIL |

## Readiness

Redis is not reachable from this workstation, so queue, session, and caching validation is blocked.
