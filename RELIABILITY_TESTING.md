# Production Reliability Testing

Comprehensive load, failure recovery, and chaos testing for SpiceGarden.

## Quick Start

```bash
# Run all reliability tests
npm run test:reliability          # Failure recovery unit tests (26 tests)
npm run test:chaos                # Chaos experiments via Node.js runner

# Load tests (require backend running on port 3001)
npm run test:load:100             # 100 concurrent users
npm run test:load:500             # 500 concurrent users
npm run test:load:1000            # 1000 concurrent users
npm run test:load:payment-spike   # Payment spike simulation
npm run test:load:order-flood     # Order placement flood
npm run test:load:websocket       # WebSocket stress (500+1000 VUs)
npm run test:load:redis           # Redis saturation
npm run test:load:db-bottleneck   # DB read/write bottleneck detection

# Run all load tests in sequence
npm run test:load:all

# Kubernetes chaos experiments (requires k8s cluster)
npm run test:chaos:kubernetes     # Apply chaos experiments
npm run test:chaos:cleanup        # Remove chaos experiments
```

## Load Testing

### Scenarios Covered

| Script | Scenario | VUs | Duration |
|--------|----------|-----|----------|
| `concurrent-users.js` | Baseline + 100/500/1000 users | 100-1000 | 5-9 min |
| `payment-spike.js` | Payment spike (normal + sustained) | 200-2000 | 3-5 min |
| `order-placement-stress.js` | Order flood (steady + burst) | 100-2000 | 9 min |
| `websocket-stress.js` | WebSocket 500+1000 VUs | 500-1000 | 9 min |
| `redis-saturation.js` | Redis saturation | 1000-10000 | 14 min |
| `db-bottleneck.js` | DB read/write bottleneck | 200-5000 | 14 min |
| `friday-dinner-rush.js` | Friday dinner rush | 1000-5000 | 25 min |

### Thresholds

All tests enforce:
- Success rate: >= 90-95%
- p95 latency: < 500-2000ms depending on scenario
- No uncategorized server errors

### Running k6 Tests

```bash
# Set target URL
set BASE_URL=http://localhost:3001
set API_TOKEN=your-test-token

# Run specific scenario
k6 run apps/backend/test/load/payment-spike.js

# Run with custom VUs
k6 run apps/backend/test/load/concurrent-users.js --vus 2000 --duration 10m
```

## Failure Recovery Tests

26 Jest unit tests covering:

### A. Redis (5 tests)
- Graceful connection failure handling
- Null fallback for cache reads
- No-throw on write failures
- Retry with exponential backoff
- Safe reconnection after downtime

### B. Postgres (4 tests)
- Connection pool exhaustion handling
- Write queue buffering during downtime
- Data integrity on reconnection
- Exponential backoff retry

### C. Mongo (3 tests)
- Graceful logging degradation
- In-memory write buffering
- Large document operation handling

### D. Payment Gateway (4 tests)
- Idempotency key prevents double charges
- Pending state on timeout
- Webhook retry idempotency verification
- Exponential backoff retry

### E. WebSocket (4 tests)
- Message queuing during outage
- HTTP fallback polling
- Safe reconnection with backoff
- Message acknowledgement prevents duplicates

### F. Coupon Abuse (2 tests)
- Per-user coupon usage limits
- Rapid-fire coupon detection

### G. Queue Recovery (2 tests)
- Failed job recovery on restart
- Idempotent duplicate prevention

### H. Data Integrity (2 tests)
- Concurrent write consistency
- Invalid state transition prevention

## Chaos Testing

### Node.js Runner (`infra/scripts/chaos-runner.js`)

Runs 7 chaos experiments against a running API:

1. **Redis Down** - API error rate < 20%
2. **Postgres Down** - Read/write error rate < 30%
3. **Mongo Down** - API error rate < 10%
4. **Payment Timeout** - Idempotency verified
5. **WebSocket Outage** - HTTP fallback available
6. **High Latency** - Timeout rate < 30%
7. **Order Flood** - No server errors, rate limiting active

```bash
# Run chaos experiments
node infra/scripts/chaos-runner.js

# Kubernetes Chaos Mesh experiments
kubectl apply -f apps/backend/test/chaos/
kubectl delete -f apps/backend/test/chaos/
```

### Kubernetes Chaos Mesh Experiments

| Experiment | Component | Failure Type |
|------------|-----------|--------------|
| `chaos-redis-pod-failure.yaml` | Redis | Pod kill (3 min) |
| `chaos-redis-network-delay.yaml` | Redis | Network delay |
| `chaos-postgres-pod-failure.yaml` | Postgres | Pod kill |
| `chaos-postgres-network-partition.yaml` | Postgres | Network partition |
| `chaos-websocket-delay.yaml` | WebSocket | Connection delay |
| `chaos-payment-timeout.yaml` | Payment | Gateway timeout |

## File Structure

```
apps/backend/test/
├── load/
│   ├── concurrent-users.js        # 100/500/1000 user scenarios
│   ├── payment-spike.js           # Payment spike simulation
│   ├── websocket-stress.js        # WebSocket stress test
│   ├── order-placement-stress.js  # Order flood test
│   ├── redis-saturation.js        # Redis saturation test
│   ├── db-bottleneck.js           # DB bottleneck detection
│   ├── friday-dinner-rush.js      # Friday dinner rush scenario
│   ├── 1k-users.js                # Legacy 1k test
│   ├── 5k-users.js                # Legacy 5k test
│   ├── 10k-users.js               # Legacy 10k test
│   ├── 20k-users.js               # Legacy 20k test
│   ├── breaking-point.js          # Breaking point test
│   └── user-flow-10k.js           # Complex user flow
├── chaos/
│   ├── chaos-redis-pod-failure.yaml
│   ├── chaos-redis-network-delay.yaml
│   ├── chaos-postgres-pod-failure.yaml
│   ├── chaos-postgres-network-partition.yaml
│   ├── chaos-websocket-delay.yaml
│   ├── chaos-payment-timeout.yaml
│   └── PLAYBOOK.md
└── reliability.failure-recovery.spec.ts  # 26 failure recovery tests

infra/scripts/
├── chaos-runner.js                # Node.js chaos test runner
└── breaking-point.js              # Breaking point script
```

## Severity Matrix

| Category | Severity | Status |
|----------|----------|--------|
| Load Testing | 10/10 | Implemented |
| Failure Recovery | 10/10 | 26/26 tests passing |
| Chaos Testing | 10/10 | Implemented |
