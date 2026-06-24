# Load and Performance Status

**Date:** 2026-06-22
**Auditor:** Kilo (automated repo audit)
**Scope:** k6 load test scripts, load test results, performance validation status

---

## Load Test Scripts Discovered

19 k6 load test scripts found in `apps/backend/test/load/`:

| Script | Purpose | Status |
|---|---|---|
| `smoke-test.js` | General smoke test (10/50 VUs) | **Partially run** |
| `10k-users.js` | 10k concurrent user simulation | **Not run** |
| `20k-users.js` | 20k concurrent user simulation | **Not run** |
| `breaking-point.js` | Find system breaking point | **Not run** |
| `250-users.js` | 250 user load test | **Not run** |
| `50-users.js` | 50 user load test | **Not run** |
| `10-users.js` | 10 user load test | **Not run** |
| `2.5k-users.js` | 2.5k user load test | **Not run** |
| `1k-users.js` | 1k user load test | **Not run** |
| `5k-users.js` | 5k user load test | **Not run** |
| `user-flow-10k.js` | 10k user flow simulation | **Not run** |
| `order-placement-stress.js` | Order placement stress test | **Not run** |
| `websocket-stress.js` | WebSocket connection stress test | **Not run** |
| `redis-saturation.js` | Redis saturation test | **Not run** |
| `payment-spike.js` | Payment spike simulation | **Not run** |
| `friday-dinner-rush.js` | Peak dinner rush simulation | **Not run** |
| `db-bottleneck.js` | Database bottleneck test | **Not run** |
| `concurrent-users.js` | Concurrent user test | **Not run** |
| `common.js` | Shared k6 utilities | Support file |

---

## Load Test Results

### Reduced Smoke (5 VUs) — ACTUAL OUTPUT

```
Command: TARGET_VUS=5 STAGE_DURATION=30s P95_LIMIT_MS=10000 k6 run test/load/smoke-test.js
Backend mode: LOAD_TEST_MODE=true (rate limiters bypassed for load testing)
```

| Metric | Value | Target | Status |
|---|---|---|---|
| Total checks | 213/213 | — | **Passed** |
| Failed requests | 0% | — | **Passed** |
| p95 latency | 797.07ms | <1500ms | **Passed** |
| Duration | 30s | — | — |

**Note:** This run used `LOAD_TEST_MODE=true` which intentionally bypasses rate limiters in `apps/backend/src/main.ts:136-144`. This mode is useful for smoke load tests but invalidates rate-limit security validation.

### Default Smoke (50 VUs) — ACTUAL OUTPUT

```
Command: k6 run test/load/smoke-test.js (default 50 VUs)
```

| Metric | Value | Target | Status |
|---|---|---|---|
| Checks | Passed | — | **Passed** |
| p95 latency | 6.3s | <1500ms | **Failed** (4.2x over target) |
| Failed requests | Low | — | **Passed** |

### 10k/20k Load Tests

| Test | Status | Notes |
|---|---|---|
| `test/load/10k-users.js` | **Not run** | Requires running backend + Docker stack |
| `test/load/20k-users.js` | **Not run** | Requires running backend + Docker stack |
| `test/load/breaking-point.js` | **Not run** | Requires running backend + Docker stack |

**CI reference:** `ci-cd.yml` includes a load test step but it uses `|| echo "Load test skipped"` fallback, making it non-blocking.

---

## Performance Claims vs Evidence

| Claim | Source | Evidence | Status |
|---|---|---|---|
| "10k/20k load tested" | Various docs | Not run in this audit | **Unverified / Unproven** |
| "Reduced smoke passed" | README | 5-VU smoke passed: 213/213 checks, p95 797ms | **Verified** |
| "Default smoke failed" | README | 50-VU smoke p95 6.3s vs <1500ms | **Verified** |
| "Load test infrastructure exists" | Codebase | 19 k6 scripts present | **Verified** |

---

## Bottlenecks Identified

1. **Default smoke p95 latency (6.3s)** — 4x over target. Likely causes: DB query optimization needed, missing indexes, or Redis rate-limit fallback overhead.
2. **WebSocket stress** — script exists but not run; Socket.IO scalability unvalidated.
3. **Redis saturation** — script exists but not run; Redis performance under load unknown.
4. **Database bottleneck** — script exists but not run; Postgres query performance unvalidated.
5. **Payment spike** — script exists but not run; payment gateway latency under load unknown.

---

## Environment Requirements for Full Load Tests

1. Docker daemon running (for Postgres, Redis, Mongo)
2. Backend running on port 3001 with real DB connections
3. Redis connected (not in memory-fallback mode)
4. Sufficient system resources for 10k+ virtual users
5. k6 installed

**Current blocker:** Docker daemon is unavailable, preventing full load test execution.

---

## Load Test CI Status

The `ci-cd.yml` workflow includes:
```yaml
- name: Run load test (quick check)
  run: |
    npm run test:load -- --vus 10 --duration 30s || echo "Load test skipped - no script needed for quick check"
```

This step is **non-blocking** — it uses `|| echo` to skip on failure. Full load validation is not enforced in CI.
