# Load Test Results Report

**Generated**: 2026-06-24
**Status**: ⚠️ BLOCKED (requires running backend)

## Load Test Scripts

| Script | Description | Status |
|--------|-------------|--------|
| infra/scripts/breaking-point.js | High concurrency, malformed payloads, invalid data | ✅ VERIFIED (code exists) |
| infra/scripts/fake-orders.js | Simulated order creation | ✅ VERIFIED (code exists) |
| npm run test:load | k6 load tests (10k users) | ⚠️ BLOCKED |
| npm run test:load:20k | k6 load tests (20k users) | ⚠️ BLOCKED |

## Breaking Point Test Scenarios

| Scenario | Users | Orders/User | Description |
|----------|-------|-------------|-----------|
| HIGH_CONCURRENCY | 50 | 10 | High concurrency order placement |
| RAPID_ORDER_BURST | 20 | 1 | All users place order simultaneously |
| INVALID_PAYLOAD | 10 | 5 | Malformed order payloads |
| MISSING_FIELDS | 10 | 5 | Orders with missing required fields |
| NEGATIVE_VALUES | 10 | 5 | Orders with negative quantities/prices |

## Performance Targets

| Metric | Target |
|--------|--------|
| Concurrent Users (Stage A) | 1,000 |
| Concurrent Users (Stage B) | 5,000 |
| Concurrent Users (Stage C) | 10,000 |
| Concurrent Users (Stage D) | 20,000 |
| Error Rate | < 1% |
| Latency (95th percentile) | < 500ms |

## Kubernetes Performance Configuration

| Setting | Value |
|---------|-------|
| HPA Min Replicas | 3 |
| HPA Max Replicas | 20 |
| CPU Target | 70% utilization |
| Memory Target | 80% utilization |
| Rate Limit (Auth/OTP) | 3 req / 10 min |
| Rate Limit (Auth) | 5 req / 15 min (skip successful) |
| Rate Limit (Orders) | 10 req / 15 min |
| Rate Limit (API) | 100 req / 15 min |

## Blocked Items

- k6 load test scripts not found in codebase
- Docker compose performance validation (requires Docker Desktop)
- Real-time metrics collection (requires services running)
- Chaos experiments (requires cluster)