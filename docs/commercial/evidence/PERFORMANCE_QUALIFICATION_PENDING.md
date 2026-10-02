# SpiceGarden — Performance Qualification & Benchmark Status

## 1. Current Qualification Status
> **Classification:** `ENGINEERING TARGETS — NOT YET INDEPENDENTLY BENCHMARKED`  
> *See comprehensive evaluation report:* [`docs/commercial/evidence/PERFORMANCE_VALIDATION.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/docs/commercial/evidence/PERFORMANCE_VALIDATION.md)

Performance capacity figures (such as 10k–20k concurrent users or 5k–8k orders/hour) represent **architectural design targets** enabled by Redis caching, BullMQ asynchronous workers, indexed PostgreSQL queries, and connection pooling. They have **not** been independently measured in a live multi-node benchmark environment within the current verification scope.

## 2. Available Load-Testing Infrastructure
The repository includes comprehensive k6 load-testing suites located in [`infra/load-tests/`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/):

| Script File | Simulated Load / Scenario | Target Endpoints |
|---|---|---|
| `stage-1-1k.js` | 1,000 concurrent simulated users | Product catalog browsing, menu retrieval |
| `stage-2-5k.js` | 5,000 concurrent simulated users | Cart addition, authentication, checkout calculation |
| `stage-3-10k.js` | 10,000 concurrent simulated users | Full order creation, payment intent initialization |
| `stage-4-20k.js` | 20,000 concurrent simulated users | Peak order surge load testing |
| `stage-5-50k.js` to `stage-8-1m.js` | Stress and breaking-point tests | Scalability testing for autoscaling clusters |
| `websocket-stress.js` | WebSocket connection scaling | Real-time driver coordinate broadcasts (`/tracking`) |
| `database-stress.js` | Connection pool saturation | High-concurrency SQL queries and transaction locks |
| `payment-stress.js` | Idempotency and webhook volume | Concurrent payment webhook processing |

## 3. Recommended Staging Benchmark Procedure
To produce verified performance measurements:
1. Deploy backend, PostgreSQL, Redis, and MongoDB to the target staging cluster.
2. Execute the k6 runner script:
   ```bash
   node infra/scripts/run-load-tests.js
   ```
   Or execute individual stages:
   ```bash
   k6 run infra/load-tests/stage-1-1k.js -e BASE_URL=https://staging-api.spicegarden.com
   ```
3. Record measured P50, P95, and P99 latency, requests per second (RPS), error rate, and system resource utilization (CPU, memory, database connections).
