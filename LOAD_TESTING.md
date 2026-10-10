# Load Testing Strategy

## Overview

SpiceGarden load testing uses k6 to validate system performance under progressive load from 1,000 to 1,000,000 virtual users across 8 progressive stages plus specialized stress scenarios.

## k6 Installation

### Prerequisites
- k6 installed (`k6@0.0.0` in devDependencies)
- Backend service running on port 3001

### Local Installation
```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo apt-get install k6

# Windows (Chocolatey)
choco install k6
```

## Test Scripts Inventory

### Progressive Load Stages

| Script | Users | Duration | File |
|--------|-------|----------|------|
| Stage 1 | 1,000 | 30 min | `infra/load-tests/stage-1-1k.js` |
| Stage 2 | 5,000 | 30 min | `infra/load-tests/stage-2-5k.js` |
| Stage 3 | 10,000 | 30 min | `infra/load-tests/stage-3-10k.js` |
| Stage 4 | 20,000 | 30 min | `infra/load-tests/stage-4-20k.js` |
| Stage 5 | 50,000 | 30 min | `infra/load-tests/stage-5-50k.js` |
| Stage 6 | 100,000 | 30 min | `infra/load-tests/stage-6-100k.js` |
| Stage 7 | 500,000 | 30 min | `infra/load-tests/stage-7-500k.js` |
| Stage 8 | 1,000,000 | 30 min | `infra/load-tests/stage-8-1m.js` |

### Specialized Stress Tests

| Script | Purpose | Virtual Users |
|--------|---------|---------------|
| `websocket-stress.js` | WebSocket connection stress | 10,000 |
| `database-stress.js` | Database query stress | 5,000 |
| `payment-stress.js` | Payment processing stress | Variable |
| `failure-injection.js` | Failure scenario testing | Variable |
| `security-under-load.js` | Security validation under load | Variable |

## Progressive Load Configuration

### Stage Structure (All Stages)
```javascript
export const options = {
  stages: [
    { duration: '2m', target: <TARGET_VUS> },   // Ramp up
    { duration: '30m', target: <TARGET_VUS> },  // Hold
    { duration: '2m', target: 0 },              // Ramp down
  ],
  thresholds: {
    'http_req_success_rate': ['rate>0.99'],
    'http_req_duration': ['p(95)<500'],
  },
};
```

### Stage Configuration Script
```javascript
// infra/load-tests/spicegarden-load.js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export const options = {
  stages: [
    { duration: `${RAMP_UP_SECONDS}s`, target: TARGET_VUS },
    { duration: `${DURATION_SECONDS}s`, target: TARGET_VUS },
    { duration: `${RAMP_DOWN_SECONDS}s`, target: 0 },
  ],
  thresholds: {
    'http_req_success_rate': ['rate>0.99'],
    'http_req_duration': ['p(95)<500'],
  },
};
```

## Test Scenarios

### API Load Scenario
```javascript
function runBrowse() {
  const res = http.get(BASE_URL + '/restaurants');
  const success = check(res, { 'browse ok': (r) => r.status === 200 });
}

function runSearch() {
  const query = randomChoice(['biryani', 'burger', 'pizza', 'dosa', 'naan']);
  const res = http.get(BASE_URL + '/restaurants/search?q=' + query);
  const success = check(res, { 'search ok': (r) => r.status === 200 });
}

function runHealthCheck() {
  const res = http.get(BASE_URL + '/health');
  const success = check(res, { 'health ok': (r) => r.status === 200 });
}
```

### Database Stress Scenario
```javascript
export const options = {
  stages: [
    { duration: '2m', target: 5000 },
    { duration: '20m', target: 5000 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    'db_query_success_rate': ['rate>0.99'],
    'db_query_time': ['p(95)<1000'],
  },
};
```

### WebSocket Stress Scenario
```javascript
export const options = {
  stages: [
    { duration: '1m', target: 10000 },
    { duration: '10m', target: 10000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    'ws_connection_success_rate': ['rate>=0'],
    'ws_message_latency': ['p(95)<500'],
  },
};
```

## Thresholds Configuration

### Standard API Thresholds
| Metric | Threshold | Reason |
|--------|-----------|--------|
| `http_req_success_rate` | >99% | Accept minimal errors |
| `http_req_duration` (p95) | <500ms | User-perceivable latency |

### Database Stress Thresholds
| Metric | Threshold | Reason |
|--------|-----------|--------|
| `db_query_success_rate` | >99% | Database availability |
| `db_query_time` (p95) | <1000ms | Query performance |

### WebSocket Stress Thresholds
| Metric | Threshold | Reason |
|--------|-----------|--------|
| `ws_connection_success_rate` | >=0% | Connection tracking |
| `ws_message_latency` (p95) | <500ms | Real-time requirement |

## Running Tests

### Single Stage Execution
```bash
# Stage 1 (1,000 users)
k6 run infra/load-tests/stage-1-1k.js -e BASE_URL=http://localhost:3001

# Stage 3 (10,000 users)
k6 run infra/load-tests/stage-3-10k.js -e BASE_URL=http://localhost:3001

# Custom staging target
k6 run infra/load-tests/stage-4-20k.js \
  -e BASE_URL=https://staging-api.spicegarden.com \
  -e RAMP_UP_SECONDS=60 \
  -e DURATION_SECONDS=600
```

### Root-Level Commands
```bash
npm run test:load      # 10k user test
npm run test:load:1k   # 1k user test
npm run test:load:5k   # 5k user test
npm run test:load:10k  # 10k user test
npm run test:load:20k  # 20k user test
npm run test:load:50k  # 50k user test
npm run test:load:100k # 100k user test
npm run test:load:500k # 500k user test
npm run test:load:1m   # 1m user test

# Specialized tests
npm run test:load:websocket
npm run test:load:database
npm run test:load:payment
npm run test:load:failure
npm run test:load:security
```

### Behind Corporate Proxy
```bash
HTTPS_PROXY=http://proxy:8080 k6 run infra/load-tests/stage-3-10k.js
```

## Interpreting Metrics

### Output Summary

During execution, k6 outputs:
```
        /\      | 
   /\  /  \ /\  |\ 
  /  \/    Y  \ |)
  |             |'
running (5m00.0s), 00/10000 VUs, 50000 complete and 0 interrupted
default ✓ [======================================] 10000 VUs  5m0s / 5m0s

running (5m00.0s), 00/10000 VUs, 50000 complete and 0 interrupted

     ✓ browse ok
     ✓ search ok
     ✓ health ok

     checks.........................: 100.00% ✓ 150000        ✗ 0
     http_req_success_rate..........: 100.00% ✓ 50000         ✗ 0
     http_req_duration (p95)......: 245.34ms
```

### Key Metrics

| Metric | Meaning | Threshold |
|--------|---------|-----------|
| `http_req_success_rate` | Percentage of successful requests | >99% |
| `http_req_duration (p95)` | 95th percentile latency | <500ms |
| `iterations` | Total test iterations completed | VUs × duration |
| `vus` | Virtual users active | Matches target |

### Failure Indicators

| Status | Meaning | Action |
|--------|---------|--------|
| 429 | Rate limited | Check rate limit config |
| 5xx | Server errors | Check backend logs |
| 0 VUs | Script error | Validate script syntax |

## Bottleneck Analysis

### Process

1. **Identify failing thresholds**
   ```bash
   k6 run script.js 2>&1 | grep -E "(threshold|rate|p\()"
   ```

2. **Check resource utilization**
   ```bash
   # During test
   docker stats spicegarden-backend-1
   ```

3. **Monitor queue depth**
   ```bash
   redis-cli LLEN orders
   ```

4. **Review slow queries**
   ```bash
   # PostgreSQL
   SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
   ```

5. **Validate connections**
   ```bash
   # Redis connections
   redis-cli CLIENT LIST | wc -l
   ```

### Common Bottlenecks

| Bottleneck | Detection | Resolution |
|------------|-----------|------------|
| Database connection pool exhaustion | 503 errors, connection timeouts | Increase pool size |
| Redis memory pressure | OOM errors, evictions | Increase Redis memory/replicas |
| Queue backlog | Growing queue length | Scale worker replicas |
| Event loop blocking | High latency variance | Profile CPU-heavy code |

## CI Integration

### GitHub Actions Example
```yaml
- name: Load Test
  run: npm run test:load:1k
  env:
    BASE_URL: ${{ steps.deploy.outputs.url }}
  continue-on-error: true

- name: Check Thresholds
  run: |
    if [ "${{ steps.load.outcome }}" != "success" ]; then
      echo "Load test failed - check metrics"
      exit 1
    fi
```

### Threshold Validation
```bash
k6 run script.js --summary-export=load-results.json
node -e "
  const r = require('./load-results.json');
  if (r.metrics.http_req_success_rate.values.rate < 0.99) {
    console.error('Success rate below threshold');
    process.exit(1);
  }
"
```

## Load Test Results Archive

Results are output in JSON format for CI/CD integration.

```bash
# Save results
k6 run script.js --out json=results.json

# Show summary
k6 run script.js --summary-time-units=s
```

## Breaking Point Tests

**Location:** `infra/scripts/breaking-point.js`

Breaking point tests progressively increase load until system failure.

```bash
# Run breaking point analysis
node infra/scripts/breaking-point.js
```

## Load Test Prerequisites

### Infrastructure Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| Memory | 4GB | 8GB+ |
| Network | 100Mbps | 1Gbps |

### Test Data Requirements

For registration tests, ensure unique emails and phones are generated:
```javascript
const email = `load-${__VU}-${__ITER}@test.com`;
const phone = `+1555${randomInt(1000000, 9999999)}`;
```