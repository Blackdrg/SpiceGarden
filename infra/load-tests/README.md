# SpiceGarden Load Testing Framework

Complete production-grade scalability validation framework for 1K → 1M concurrent users.

## Quick Start

```bash
# 1. Start infrastructure
docker-compose -f compose.dev.yaml up -d

# 2. Run full load test suite
npm run test:load

# 3. Or run individual stages
npm run test:load:1k     # 1,000 users - 30 min
npm run test:load:5k     # 5,000 users - 30 min
npm run test:load:10k    # 10,000 users - 45 min (Phase 1 target)
npm run test:load:20k    # 20,000 users - 60 min
npm run test:load:50k    # 50,000 users - 90 min
npm run test:load:100k   # 100,000 users - 2 hours
npm run test:load:500k   # 500,000 users - 4 hours
npm run test:load:1m     # 1,000,000 users - 6+ hours
```

## Test Stages

| Stage | Users | Duration | Thresholds |
|-------|-------|----------|------------|
| Stage 1 | 1K | 30 min | P95 latency < 500ms, Error rate < 1% |
| Stage 2 | 5K | 30 min | P95 latency < 500ms, Error rate < 1% |
| Stage 3 | 10K | 45 min | P95 latency < 500ms, Error rate < 1% |
| Stage 4 | 20K | 60 min | P95 latency < 600ms, Error rate < 2% |
| Stage 5 | 50K | 90 min | P95 latency < 800ms, Error rate < 3% |
| Stage 6 | 100K | 2 hours | P95 latency < 1000ms, Error rate < 5% |
| Stage 7 | 500K | 4 hours | P95 latency < 2000ms, Error rate < 10% |
| Stage 8 | 1M | 6+ hours | P95 latency < 3000ms, Error rate < 15% |

## Traffic Mix (Realistic Distribution)

- **60% Browsing** - Restaurant listing, menu viewing
- **15% Search** - Restaurant/item search with location
- **10% Checkout** - Order placement
- **5% Payments** - Payment intent processing
- **5% Tracking** - Order tracking
- **3% Notifications** - Notification endpoints
- **2% Admin** - Admin dashboard/API access

## Special Tests

| Test | Purpose | Users | Duration |
|------|---------|-------|----------|
| WebSocket Stress | Concurrent socket connections | 10K | 10 min |
| Database Stress | Query performance under load | 5K | 20 min |
| Payment Stress | Payment gateway resilience | 1K | 15 min |
| Failure Injection | Graceful degradation | 5K | 15 min |
| Security Under Load | Rate limiting, auth under load | 10K | 10 min |

## Prerequisites

```bash
# Install k6
choco install k6  # Windows
brew install k6   # macOS
apt install k6    # Linux
```

## Configuration

Environment variables:

```bash
export BASE_URL=http://localhost:3001
export DURATION_SECONDS=1800      # Test duration
export RAMP_UP_SECONDS=120        # Ramp up time
export TARGET_VUS=1000            # Concurrent users
export LATENCY_P95_THRESHOLD_MS=500
export ERROR_THRESHOLD=0.01
```

## Running Tests

```bash
# Quick smoke test (1K users)
npm run test:load:1k

# Full suite (run sequentially)
npm run test:load

# Continue on failure
CONTINUE_ON_FAILURE=true npm run test:load

# Cloud execution (k6 Cloud)
k6 cloud infra/load-tests/stage-3-10k.js
```

## Metrics Collected

- HTTP request rate and duration
- WebSocket connection success rate and latency
- Database query time
- Payment success rate
- Cache hit ratio
- Error rates (4xx, 5xx)
- Concurrent VUs

## Success Criteria

Each stage must pass before proceeding:

- [ ] HTTP success rate > 99%
- [ ] P95 latency < threshold
- [ ] Error rate < threshold
- [ ] No memory leaks
- [ ] No connection leaks
- [ ] Graceful failure handling
- [ ] Security controls intact

## Kubernetes Scaling

Based on load test results, HPA configuration:

```bash
# Validate autoscaling
bash infra/scripts/autoscaling-validation.sh production

# Apply Redis cluster for high throughput
kubectl apply -f infra/k8s/redis-cluster.yaml

# Apply production hardened config
kubectl apply -f infra/k8s/production-hardened.yaml
```

## Results

Test results saved to `infra/load-tests/results/`:
- `load-test-report.json` - Raw test results
- `final-report.json` - Production readiness assessment

---

**Phase 1 Target:** 10K concurrent users  
**Phase 2 Target:** 100K concurrent users  
**Phase 3 Target:** 1M concurrent users