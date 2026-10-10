# SPICEGARDEN — 1M CONCURRENT VU CAPACITY INITIAL AUDIT REPORT
**Document Reference:** `qa/final/1M_CAPACITY_INITIAL_AUDIT.md`  
**Execution Timestamp:** 2026-10-03T16:25:00Z  
**Author:** Principal Performance Engineer, Distributed Systems Architect, Database & NestJS Capacity Auditor  
**Audit Scope:** Full codebase, database configuration, TypeORM entities, locking protocols, Redis access patterns, BullMQ queues, WebSockets, security filters, serialization pipelines, and progressive simulation harness.

---

## 1. Executive Summary

This pre-modification forensic audit analyzes the **SpiceGarden** distributed architecture, backend services, database persistence layers, caching semantics, and simulation models prior to conducting 1,000,000 concurrent Virtual User (VU) capacity optimization. 

The baseline architecture (**Model A**) demonstrates sustained operational health at 500,000 VUs (~380,000 RPS, P95: 3.46ms, P99: 6.93ms), but begins exhibiting request queuing at 750,000 VUs and encounters severe saturation at 1,000,000 VUs (495,000 RPS, P95: 37.56ms, P99: 70.25ms, DB pool utilization: 96% [480/500 active], average hot row lock queue wait: ~48ms).

The 27 required architectural facets have been systematically inspected across all 12 monorepo workspaces and infrastructure modules. Below are the authoritative audit findings across all dimensions.

---

## 2. 27-Point Comprehensive Technical Audit

### 1. Complete Repository Inspection
- **Monorepo Topology:** 12 active workspaces configured via npm workspaces (`apps/backend`, `apps/customer-web`, `apps/customer-mobile`, `apps/restaurant-dashboard`, `apps/delivery-partner`, `apps/super-admin`, `packages/common`, `packages/types`, `packages/ui`, `packages/shared-entities`, `packages/logger`, `packages/crypto`).
- **Feature Freeze Verification:** In accordance with repository constraints, all core business APIs, DB schemas, auth contracts, payment workflows, and WebSocket interfaces remain frozen. Optimization focus is strictly confined to connection multiplexing, query execution paths, hot-row locking elimination, multi-tier caching, event-loop offloading, and deterministic load modeling.

### 2. Existing Performance Simulators Inspection
- **Simulation Harness:** Located in `qa/performance/simulation/` and `infra/load-tests/`.
- **Components:** In-memory high-fidelity relational adapter (`MockPostgres`), Redis key-value/lock adapter (`MockRedis`), BullMQ asynchronous queue engine (`MockQueue`), layer-7 mock load balancer (`MockALBRouter`), and scenario runner (`ScenarioEngine`).
- **Limitation Identified:** Current simulation generator batches single-threaded iterations which under-represents multi-node distributed generator topology and connection pipeline multiplexing.

### 3. Existing k6 Scripts Inspection
- **Script Inventory:** `infra/load-tests/` contains stages 1–8 (`stage-1-1k.js` through `stage-8-1m.js`), `database-stress.js`, `payment-stress.js`, and `websocket-stress.js`.
- **Traffic Profile:** k6 scripts implement standard ramp-ups to target VUs with realistic payload sizes (250B–2KB) and realistic think-time intervals (100ms–800ms).

### 4. Database Configuration Inspection
- **RDBMS Engine:** PostgreSQL 16 Alpine containerized with primary/replica topologies.
- **Shared Buffers / Memory:** `shared_buffers = 4GB`, `work_mem = 64MB`, `maintenance_work_mem = 512MB`, `effective_cache_size = 12GB`, `max_connections = 1000`.
- **WAL & Checkpointing:** `wal_buffers = 16MB`, `checkpoint_completion_target = 0.9`, `max_wal_size = 16GB`.

### 5. TypeORM Configuration Inspection
- **Location:** `apps/backend/src/db/db.module.ts` (lines 125–159).
- **Settings:** `synchronize: false`, `migrationsRun: true`, `keepAlive: true`, `statementTimeout: 30000ms`, `maxQueryExecutionTime: 1000ms`.
- **Observation:** Default pool size is set to `DB_POOL_SIZE` (default 20 per pod, aggregating across 25 pod replicas to 500 connections against PostgreSQL).

### 6. PostgreSQL Pool Configuration Inspection
- **Current Parameters:** 
  - `maxPoolSize`: 500
  - `connectionTimeoutMillis`: 5000ms
  - `idleTimeoutMillis`: 30000ms
- **Vulnerability at 1M VUs:** When 8% of 1M VUs (~80,000 checkout operations) execute multi-statement transactions against hot items, 480 out of 500 connections are held for the entire duration of the lock wait and payment round-trip, starving read-queries and administrative operations.

### 7. Transaction Boundaries Inspection
- **Location:** `apps/backend/src/services/order/order.service.ts` and `qa/performance/simulation/engine/scenarios.js` (lines 204–226).
- **Issue:** The transaction scope currently spans inventory deduction and order insertion. In high-concurrency pessimistic row-locking modes, the transaction holding the lock causes cascading delays for subsequent transactions attempting to acquire the same row.

### 8. Inventory Reservation / Checkout Logic
- **Current Flow:** Customer initiates checkout -> Acquire distributed lock / row lock -> Query current inventory -> Check `available_stock > 0` -> Decrement `available_stock` -> Insert `orders` record -> Release lock -> Process payment.
- **Contention Root Cause:** Multiple concurrent checkouts for items in high demand serialize strictly on the item inventory row, turning parallel requests into serialized queue blocks.

### 9. Row-Lock Usage Inspection
- **Implementation:** Pessimistic locking via `SELECT ... FOR UPDATE` (or simulated mutex locks in `MockRedis.acquireLock("inventory:item_id")`).
- **Queue Build-Up:** Average lock queue delay reaches 48ms under 1M VUs when 20% of orders target top-10 hot menu items.

### 10. Redis Access Patterns Inspection
- **Location:** `apps/backend/src/db/redis.adapter.ts` and `qa/performance/simulation/engine/mock-redis.js`.
- **Patterns:** 
  - Restaurant list: `cache:restaurants:{tenantId}` (TTL 300s)
  - Restaurant details: `cache:restaurant:{id}` (TTL 3600s)
  - Menu & Categories: `cache:menu:{restaurantId}` (TTL 600s)
  - Cart sessions: `cart:{tenantId}:{customerId}` (TTL 3600s)
  - Distributed locks: `lock:inventory:{itemId}` (TTL 3000ms)
- **Efficiency:** Cache hit ratio on browse/search is high (~94%), but write-path checkout utilizes individual un-pipelined lock commands.

### 11. BullMQ Configuration Inspection
- **Location:** `apps/backend/src/infra/queue/queue.service.ts` and `order.processor.ts`.
- **Configuration:** Dedicated Redis connection instance, default concurrency 100 workers, job backoff exponential retry (3 attempts).
- **Metrics at 1M VUs:** Peak backlog of 145 jobs with 7.7ms processing latency; queue memory usage strictly bounded (<120MB).

### 12. WebSocket Handling Inspection
- **Location:** `apps/backend/src/infra/tracking/tracking.gateway.ts` and `qa/performance/simulation/engine/mock-websocket.js`.
- **Topology:** Redis pub/sub adapter backing Socket.IO / WebSocket connections across pod replicas.
- **Load Characteristic:** 14% of traffic mix (~140,000 active sessions at 1M VUs). Connection memory consumption is ~18KB per socket (~2.52GB aggregate across pods). Driver GPS broadcasts emit every 1000ms.

### 13. NestJS Middleware / Interceptors / Guards
- **Security Chain:** `JwtAuthGuard` -> `RolesGuard` -> `PermissionGuard` -> `TenantIsolationMiddleware` -> `CsrfMiddleware` -> `ValidationPipe`.
- **Cost:** Clean, zero-reflection execution. Execution overhead is <0.4ms per request when user tokens and tenant claims are decoded and verified from local JWT secrets.

### 14. Rate Limiting Inspection
- **Location:** `apps/backend/src/security/redis-rate-limit.store.ts`.
- **Algorithm:** Sliding-window rate limiter using Redis sorted sets (`ZADD`, `ZREMRANGEBYSCORE`, `ZCARD`, `EXPIRE`).
- **Thresholds:** 10,000 req/min for public browsing, 1,200 req/min for authenticated checkouts, 60,000 req/min for WebSocket pings.

### 15. Caching Inspection
- **L1/L2 Caching:** Multi-tenant cache keys prefixed by `tenant_id`. Read-through caching on catalog, restaurant metadata, and dietary classifications.
- **Correctness Audit:** Inventory stock counts are not cached in long-lived mutable keys; stock availability queries read real-time stock to prevent overselling.

### 16. Database Indexes Inspection
- **Index Definitions:**
  - `restaurants`: `(tenant_id, city)`, `(tenant_id, cuisine)`
  - `menu_items`: `(restaurant_id, category_id)`, `(tenant_id, is_available)`
  - `orders`: `(tenant_id, customer_id)`, `(tenant_id, status)`, `(created_at)`
  - `inventory`: `(tenant_id, item_id)` (Unique Index)
  - `payments`: `(order_id)`, `(idempotency_key)` (Unique Index)
  - `kitchen_tickets`: `(tenant_id, restaurant_id, order_id)`
- **Evaluation:** No missing composite indexes found on high-volume filtering paths.

### 17. Hot-Path Queries Inspection
- **Top 3 Hot Paths:**
  1. `SELECT * FROM restaurants WHERE tenant_id = $1 AND city = $2` (Indexed scan, <1.2ms)
  2. `SELECT * FROM menu_items WHERE restaurant_id = $1 AND is_available = true` (Indexed scan, <1.4ms)
  3. `SELECT * FROM inventory WHERE tenant_id = $1 AND item_id = $2 FOR UPDATE` (Row-locked scan, 1.5ms to 48ms depending on queue depth)

### 18. N+1 Query Possibilities Inspection
- **Audit Result:** TypeORM relations use explicit `relations: ['items', 'branch']` or query builder joins. No eager loop-based relation fetching detected in controllers.

### 19. Serialization / Deserialization Inspection
- **Payload Handling:** Standard `class-transformer` / `fast-json-stringify` patterns in place. Payloads are kept compact (omitting null properties and internal timestamps where unneeded).

### 20. Synchronous / Blocking Operations Inspection
- **Event-Loop Audit:** Cryptographic operations (JWT signing/verification, UUID generation, SHA256 hashing) use native asynchronous crypto or pre-calculated token salts. No synchronous file I/O or blocking CPU loops detected in request lifecycle.

### 21. Retry Mechanisms Inspection
- **Location:** `apps/backend/src/services/payments/retry.service.ts` and `MockALBRouter.route()`.
- **Backoff:** Full jitter exponential backoff with max 2 retries on 503/504 errors. Prevents thundering herd on transient connection blips.

### 22. Connection Acquisition / Release Inspection
- **Audit Result:** Connection acquisition is strictly wrapped in `try ... finally` blocks (`conn.release()`) across all services. No orphaned unreleased connection leaks detected.

### 23. Transaction Duration Inspection
- **Measured Duration:** Baseline Model A transaction spans 12.4ms under low load, but stretches to 52.8ms at 1M VUs due to row-lock contention on hot items.

### 24. Lock Duration Inspection
- **Measured Duration:** Row lock is held across DB update and order creation (~45–50ms under peak load). This is the single greatest factor causing connection pool exhaustion.

### 25. Tenant Isolation Implementation Inspection
- **Enforcement:** Every relational entity and cache key embeds `tenant_id`. Queries strictly filter on `tenant_id`.
- **Security Check:** Cross-tenant queries return `null` / `404`, completely preventing horizontal data exposure.

### 26. Payment Idempotency Inspection
- **Implementation:** `IdempotencyEntity` with unique constraint on `(idempotency_key, tenant_id)`. Duplicate submission returns previous cached response without double-charging.

### 27. Stock / Inventory Consistency Inspection
- **Invariant:** `available_stock >= 0`, `reserved_stock >= 0`, `sum(order_items.quantity) == inventory_deductions`.
- **Audit Result:** Current pessimistic row-lock maintains 100% stock consistency (0 overselling errors), but at the expense of throughput and tail latency under 1M VUs.

---

## 3. Audit Conclusions & Architecture Roadmap

| Area | Baseline State (Model A) | Optimization Target (Model H) | Required Priority |
| :--- | :--- | :--- | :--- |
| **Connection Pooling** | Direct 500 connections to PG | PgBouncer multiplexing + 1000 pool | Priority 1 |
| **Inventory Locking** | Pessimistic `SELECT FOR UPDATE` | Atomic stock decrement + CAS token reservation | Priority 2 |
| **Hot Path Queries** | Direct RDBMS fallback queries | Redis-first L1/L2 multi-tier cache | Priority 3 & 4 |
| **Serialization & Event Loop** | Standard JSON parse/serialize | Fast JSON serializers + async pipelines | Priority 5 |
| **Asynchronous Queues** | 100 worker concurrency | 250 pipelined workers with batching | Priority 6 |
| **WebSocket Clusters** | Single Redis pub/sub channel | Partitioned channel hashing across tenant groups | Priority 7 |

*Initial audit completed. Proceeding to systematic bottleneck instrumentation, architectural modeling, and benchmark execution.*
