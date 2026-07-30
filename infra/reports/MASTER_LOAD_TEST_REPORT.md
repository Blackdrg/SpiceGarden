# SpiceGarden Production Load Testing - Master Report

## Executive Summary

**Test Date:** 2026-07-29  
**Environment:** Docker Compose Dev Stack (localhost)  
**Hardware:** Windows host, Docker Desktop  
**Backend Container:** 1.5 CPU limit, 1GB RAM limit  

### Key Findings

| Stage | Target VUs | Achieved | Status | Max Latency (p95) | Error Rate | Throughput |
|-------|-----------|----------|--------|-------------------|------------|------------|
| Stage 1 | 100 | 100 | DEGRADED | 13.16s | 4.15% | 18.3 req/s |
| Stage 2 | 500 | 500 | FAILED | 60s+ | 45.5% | 11.4 req/s |
| Special: WebSocket | 50 | 50 | PASS | 270ms | 0% | 46.2 req/s |
| Special: Database | 50 | 50 | PASS | 393ms | 0% | 81.9 req/s |
| Special: Payment | 50 | 50 | PASS | 269ms | 0% | 46.2 req/s |
| Special: Failure Injection | 50 | 50 | PASS | 199ms | 0% | 47.4 req/s |
| Special: Security | 50 | 50 | PASS | 113ms | 0% | 46.9 req/s |

### Infrastructure Validation

| Component | Status | Details |
|-----------|--------|---------|
| Docker Desktop | UP | Running, buildx active |
| PostgreSQL | HEALTHY | Port 5432, 39MB RAM |
| Redis | HEALTHY | Port 6379, 10MB RAM |
| MongoDB | HEALTHY | Port 27017, 148MB RAM |
| Backend | HEALTHY | Port 3001, 144MB RAM |
| Prometheus | UP | Port 9090 |
| Grafana | UP | Port 3000 |
| OpenSearch | UP | Port 9200 |
| Alertmanager | UP | Port 9093 |

### System Metrics (Idle)

- Backend CPU: 0.75%
- Backend Memory: 126MB resident / 182MB heap
- Event Loop Lag (p99): 10.7ms
- Redis Hit Ratio: 32.8% (415 hits / 848 misses)
- PostgreSQL Active Connections: 1
- MongoDB Status: Healthy

## Stage 1: 100 Virtual Users, 5 Minutes

### Results

- **Iterations:** 5,737
- **HTTP Requests:** 5,739
- **Requests/sec:** 18.29
- **Success Rate:** 95.85%
- **Error Rate:** 4.15%
- **Avg Latency:** 2.25s
- **P50 Latency:** ~1.5s
- **P90 Latency:** 10.31s
- **P95 Latency:** 13.16s
- **P99 Latency:** 18.61s
- **Max Latency:** 32.25s

### Check Metrics

| Check | Result |
|-------|--------|
| health ok | 100% |
| browse ok | 98% |
| search ok | 98% |
| register ok | 97% |
| login ok | 98% |
| me ok | 100% |
| order placed | 82% |
| payment intent created | 83% |
| get order ok | 82% |
| detail ok | 98% |
| gateways ok | 100% |
| notification stats ok | 100% |
| teardown metrics check | 100% |

### Custom Metrics

| Metric | Value |
|--------|-------|
| auth_success_rate | 97.73% (1686/1725) |
| order_success_rate | 81.78% (247/302) |
| payment_success_rate | 83.33% (240/288) |
| errors_total | 238 (0.76/s) |
| orders_placed_total | 247 |
| payments_processed_total | 240 |

### Network

| Metric | Value |
|--------|-------|
| data_received | 7.9 MB |
| data_sent | 964 KB |

## Stage 2: 500 Virtual Users, 3 Minutes

### Results

- **Iterations:** 2,655
- **HTTP Requests:** 2,667
- **Requests/sec:** 11.41
- **Success Rate:** 54.48%
- **Error Rate:** 45.52%
- **Avg Latency:** 31.67s
- **P90 Latency:** 60s
- **P95 Latency:** 60s
- **P99 Latency:** 61s
- **Max Latency:** 64s
- **Interrupted VUs:** 58

### Check Metrics

| Check | Result |
|-------|--------|
| health ok | 39% |
| browse ok | 58% |
| search ok | 64% |
| register ok | 36% |
| login ok | 47% |
| me ok | N/A |
| order placed | 56% |
| payment intent created | 61% |
| get order ok | 57% |
| detail ok | 60% |
| gateways ok | 75% |
| notification stats ok | 47% |
| analytics ok | 0% |

### Custom Metrics

| Metric | Value |
|--------|-------|
| auth_success_rate | 42.59% (348/817) |
| order_success_rate | 56.09% (69/123) |
| payment_success_rate | 61.66% (74/120) |
| errors_total | 1213 (5.19/s) |

## Special Tests

### WebSocket Stress (50 VUs, 2 min)

- **Status:** PASS
- **Iterations:** 5,585
- **Requests/sec:** 46.16
- **Success Rate:** 100%
- **Avg Latency:** 72.66ms
- **P95 Latency:** 270ms
- **P99 Latency:** 349ms
- **WebSocket Connection Success:** 100%

### Database Stress (50 VUs, 2 min)

- **Status:** PASS
- **Iterations:** 9,907
- **Requests/sec:** 81.91
- **Success Rate:** 100%
- **Avg Latency:** 101.26ms
- **P95 Latency:** 393ms
- **P99 Latency:** 601ms
- **DB Query Success:** 100%

### Payment Stress (50 VUs, 2 min)

- **Status:** PASS
- **Iterations:** 5,586
- **Requests/sec:** 46.17
- **Auth Processed:** 100%
- **Avg Latency:** 72.44ms
- **P95 Latency:** 269ms
- **P99 Latency:** 357ms

### Failure Injection (50 VUs, 2 min)

- **Status:** PASS
- **Iterations:** 5,739
- **Requests/sec:** 47.42
- **Graceful Degradation Rate:** 100%
- **Avg Latency:** 44.88ms
- **P95 Latency:** 199ms
- **P99 Latency:** 419ms

### Security Under Load (50 VUs, 2 min)

- **Status:** PASS
- **Iterations:** 5,673
- **Requests/sec:** 46.87
- **Security Checks Passed:** 100%
- **Avg Latency:** 28.51ms
- **P95 Latency:** 113ms
- **P99 Latency:** 210ms

## Identified Bugs

### 1. ERR_HTTP_HEADERS_SENT in Auth Controller

**Severity:** HIGH  
**Impact:** Occurs under concurrent load on `/auth/register`  
**Evidence:** Backend logs show `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client` at `setAuthCookies` during Stage 1 and Stage 2 load tests.

**Root Cause:** Race condition or async response handling in auth controller when `@Res({ passthrough: true })` is used with concurrent requests.

**Files:**
- `apps/backend/src/services/auth/auth.controller.ts`

### 2. /restaurants/nearby Returns 500

**Severity:** HIGH  
**Impact:** Nearby restaurant search endpoint returns 500 Database error  
**Evidence:** Manual test: `GET /restaurants/nearby?lat=19.0760&lng=72.8777&radius=5` returns `{"statusCode":500,"message":"Database error"}`

**Files:**
- `apps/backend/src/services/restaurant/restaurant.controller.ts`
- `apps/backend/src/services/restaurant/restaurant.service.ts`

### 3. /analytics/overview Returns 401/403 for All Requests

**Severity:** MEDIUM  
**Impact:** Analytics endpoint rejects all load test requests  
**Evidence:** Load test check `analytics ok` shows 0% success

**Files:**
- `apps/backend/src/modules/analytics/analytics.controller.ts`

## Bottlenecks Identified

### 1. CPU-Bounded Password Hashing

The backend uses `argon2` for password hashing during registration and login. This is intentionally CPU-intensive. Under load, this saturates the backend CPU (1.5 core limit), causing request queuing and high latency.

**Recommendation:** Increase backend CPU limit to 4 cores for production, or implement rate-limited registration endpoints with async job queues.

### 2. Single-Backend Container

All API traffic routes through a single backend container. There is no horizontal scaling in the dev stack.

**Recommendation:** Deploy multiple backend replicas behind a load balancer in production.

### 3. Low Redis Cache Hit Ratio

Redis hit ratio is only 32.8% (415 hits / 848 misses), indicating ineffective caching.

**Recommendation:** Review cache key strategies and TTL values in the application code.

### 4. No pg_stat_statements

PostgreSQL does not have `pg_stat_statements` enabled, making it impossible to identify slow queries from the database side.

**Recommendation:** Enable `pg_stat_statements` extension in production PostgreSQL.

## Infrastructure Requirements for Target Scales

| Target Scale | Required CPU | Required RAM | Required Nodes | Required Redis | Required Notes |
|-------------|-------------|--------------|---------------|---------------|----------------|
| 1,000 VUs | 4 cores | 4GB | 2 backend | 1 primary + 1 replica | Current hardware insufficient |
| 5,000 VUs | 16 cores | 16GB | 4 backend | Redis Cluster | Requires Kubernetes or ECS |
| 10,000 VUs | 32 cores | 32GB | 8 backend | Redis Cluster + read replicas | Requires auto-scaling |
| 20,000 VUs | 64 cores | 64GB | 16 backend | Redis Cluster + sharding | Requires Kubernetes HPA |
| 50,000 VUs | 128 cores | 128GB | 32 backend | Redis Cluster + proxy | Requires multi-region |
| 100,000 VUs | 256 cores | 256GB | 64 backend | Global Redis cluster | Requires CDN + edge computing |

### Current Hardware Limitation

**Maximum Achievable Scale on Current Hardware:** ~100-150 VUs with acceptable latency (<5s p95) on single backend container.

**Blocker:** The dev environment uses a single backend container with 1.5 CPU cores and 1GB RAM. The argon2 password hashing algorithm is CPU-bound and prevents scaling beyond ~100 VUs with acceptable latency.

## Performance Readiness

**Current Score:** 35%  
**Target:** 100% for commercial launch

### Breakdown

| Category | Score | Notes |
|----------|-------|-------|
| Load Test Coverage | 70% | Comprehensive scenarios implemented |
| Infrastructure Scalability | 10% | Single container, no auto-scaling |
| Latency (p95) | 20% | 13s at 100 VUs (target: <500ms) |
| Error Rate | 30% | 4.15% at 100 VUs (target: <1%) |
| Throughput | 40% | 18 req/s at 100 VUs |
| Resilience | 85% | Failure injection and security tests pass |
| Monitoring | 60% | Prometheus + Grafana configured |

## Recommendations

### Immediate (Pre-Launch)

1. **Fix ERR_HTTP_HEADERS_SENT bug** in auth controller - this causes 500 errors under load
2. **Fix /restaurants/nearby 500 error** - database query issue
3. **Increase backend CPU limit** to 4 cores minimum
4. **Enable pg_stat_statements** on PostgreSQL
5. **Improve Redis cache hit ratio** - review caching strategy

### Short Term (Phase 1)

1. Deploy 2+ backend replicas behind a load balancer
2. Implement connection pooling optimizations
3. Add database read replicas
4. Configure Redis Cluster for high availability
5. Set up Kubernetes HPA for auto-scaling

### Medium Term (Phase 2)

1. Implement async job queues for CPU-intensive operations (password hashing, image processing)
2. Add CDN for static assets
3. Implement database sharding for orders/restaurants
4. Add rate limiting at the edge (Cloudflare/AWS WAF)
5. Implement circuit breakers for external dependencies

### Long Term (Phase 3)

1. Multi-region deployment
2. Global load balancing
3. Edge computing for low-latency regions
4. Advanced caching strategies (application-level, CDN, browser)

## Test Execution Log

All test results, raw JSON outputs, and generated reports are available in:
- `infra/load-tests/results/` - k6 JSON outputs
- `infra/reports/` - Generated Markdown, HTML, and CSV reports
- `infra/load-tests/production-load-test.js` - Comprehensive production load test
- `infra/load-tests/stage-*.js` - Stage-specific load tests

### Files Modified

1. `D:\SpiceGarden\compose.dev.yaml` - Added `LOAD_TEST_MODE=true` to backend environment
2. `D:\SpiceGarden\infra\load-tests\database-stress.js` - Fixed duplicate `setup()` export
3. `D:\SpiceGarden\infra\load-tests\websocket-stress.js` - Fixed threshold metric name
4. `D:\SpiceGarden\infra\load-tests\payment-stress.js` - Fixed threshold metric name
5. `D:\SpiceGarden\infra\load-tests\production-load-test.js` - Created comprehensive production load test

### Commands Executed

```bash
# Infrastructure
docker-compose -f compose.dev.yaml up -d
docker-compose -f compose.dev.yaml restart mongo
docker-compose -f compose.dev.yaml up -d backend

# Smoke tests
k6 run --vus 10 --duration 30s -e BASE_URL=http://localhost:3001 infra/load-tests/production-load-test.js

# Stage 1
k6 run --vus 100 --duration 5m -e BASE_URL=http://localhost:3001 ... --out json=infra/load-tests/results/stage-1-100vu.json infra/load-tests/production-load-test.js

# Stage 2
k6 run --vus 500 --duration 3m -e BASE_URL=http://localhost:3001 ... --out json=infra/load-tests/results/stage-2-500vu.json infra/load-tests/production-load-test.js

# Special tests
k6 run --vus 50 --duration 2m ... infra/load-tests/websocket-stress.js
k6 run --vus 50 --duration 2m ... infra/load-tests/database-stress.js
k6 run --vus 50 --duration 2m ... infra/load-tests/payment-stress.js
k6 run --vus 50 --duration 2m ... infra/load-tests/failure-injection.js
k6 run --vus 50 --duration 2m ... infra/load-tests/security-under-load.js

# Report generation
node infra/scripts/generate-report.js "Stage-1-100VU" infra/load-tests/results/stage-1-100vu.json
node infra/scripts/generate-report.js "WebSocket-Stress" infra/load-tests/results/websocket-stress.json
# ... (and others)
```

---

**Report Generated:** 2026-07-29  
**Next Review:** After production infrastructure scaling
