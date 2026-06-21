# Load and Performance Report

**Generated:** 2026-06-21

## Load Testing Assets

| Asset | Location | Status |
|---|---|---|
| Smoke test | `apps/backend/test/load/smoke-test.js` | ✅ Configured, blocked on backend |
| 10-users | `apps/backend/test/load/10-users.js` | ✅ Configured, blocked on backend |
| 10k users | `apps/backend/test/load/10k-users.js` | ✅ Configured, blocked on backend |
| 20k users | `apps/backend/test/load/20k-users.js` | ✅ Configured, blocked on backend |
| Breaking point | `apps/backend/test/load/breaking-point.js` | ✅ Configured, blocked on backend |
| WebSocket stress | `apps/backend/test/load/websocket-stress.js` | ✅ Configured, blocked on backend |

## Load Test Configuration

- **BASE_URL:** `http://localhost:3001` (from `.env` or `--env`)
- **Thresholds:**
  - `http_req_failed: rate < 0.01`
  - `p(95) < 1500ms`
  - `load_success: rate > 0.99`
  - All flow steps must succeed at >99%

## Current Status

| Check | Result | Notes |
|---|---|---|
| k6 installed | ✅ (devDependency) | Available in `apps/backend` |
| Backend running | ❌ Blocked | Disk space prevents startup |
| Load tests executable | ⚠️ Blocked | Require running backend |
| Load mode bypass | ✅ Configured | `LOAD_TEST_MODE=true` disables rate limits in dev |

## Prerequisites for Load Testing

1. Start backend: `cd apps/backend && npm run dev` (requires disk space)
2. Or run offline build: Use `LOCAL_DB=sqlite` mode
3. Verify health: `curl http://localhost:3001/health`

## Load Test Commands

```bash
# Smoke test (5-50 users ramp)
cd apps/backend && npm run test:load

# Specific user count
TARGET_VUS=100 STAGE_DURATION=1m npm run test:load

# Breaking point test
cd apps/backend && npm run test:load:breaking
```

## Position

Load testing infrastructure is **configured but blocked**. All scripts use the common library which:
- Checks `/health` endpoint on startup
- Tests auth/register/login flow
- Tests restaurant browsing
- Tests address creation
- Tests order placement with idempotency keys
- Tests payment intent creation (if `EXERCISE_PAYMENT=true`)