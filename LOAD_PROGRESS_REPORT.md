# LOAD_PROGRESS_REPORT.md

Generated: 2026-06-18

## Progressive Load Testing Plan

Starting from 10 users, incrementally scale to 10,000 users.

---

## Stage Configuration

| Stage | VUs | Duration | Status |
|-------|-----|----------|--------|
| 1 | 10 | 30s | ⏳ Pending |
| 2 | 50 | 30s | ⏳ Pending |
| 3 | 100 | 30s | ⏳ Pending |
| 4 | 250 | 30s | ⏳ Pending |
| 5 | 500 | 30s | ⏳ Pending |
| 6 | 1000 | 30s | ⏳ Pending |
| 7 | 2500 | 30s | ⏳ Pending |
| 8 | 5000 | 30s | ⏳ Pending |
| 9 | 10000 | 30s | ⏳ Pending |

---

## Prerequisites for Testing

### Must Fix Before Starting
1. ✅ LocalDevModule must include all business controllers
2. ✅ Registration must work with unique user generation
3. ✅ Restaurants must exist in database (or seeding required)
4. ✅ Redis must be available (for sessions/notifications)

### Current Blockers
- Backend must be started with `DB_HOST` set for full AppModule
- Redis must be running for session creation
- Restaurants must be seeded for order flow

---

## Metrics Collection Template

For each stage, record:
- `http_req_success` rate (target: >99%)
- `signup_success` rate (target: >95%)
- `login_success` rate (target: >95%)
- `order_success` rate (target: >95%)
- `p(95)` latency (target: <500ms)
- `p(99)` latency (target: <1000ms)
- Throughput (requests/second)

---

## Stage Execution Log

### Stage 1: 10 VUs (Pending)
```
Status: Awaiting LocalDevModule fix
```

### Stage 2: 50 VUs (Pending)
```
Status: Blocked by Stage 1
```

### Stage 3: 100 VUs (Pending)
```
Status: Blocked by Stage 2
```

### Stage 4: 250 VUs (Pending)
```
Status: Blocked by Stage 3
```

### Stage 5: 500 VUs (Pending)
```
Status: Blocked by Stage 4
```

### Stage 6: 1000 VUs (Pending)
```
Status: Blocked by Stage 5
```

### Stage 7: 2500 VUs (Pending)
```
Status: Blocked by Stage 6
```

### Stage 8: 5000 VUs (Pending)
```
Status: Blocked by Stage 7
```

### Stage 9: 10000 VUs (Pending)
```
Status: Blocked by Stage 8
```

---

## Test Execution Commands

```bash
# Start backend
cd apps/backend && npm run dev

# Run progressive stages
npx k6 run test/load/10-users.js
npx k6 run test/load/50-users.js  # After 10 passes
npx k6 run test/load/100-users.js  # After 50 passes
# ... continue incrementally
```

Or use environment variable for target VUs:
```bash
TARGET_VUS=10 npx k6 run test/load/10k-users.js
```

---

## Success Criteria

| Metric | Target | Pass/Fail |
|--------|--------|-----------|
| Health endpoint success | >99% | TBD |
| Registration success | >95% | TBD |
| Login success | >95% | TBD |
| Order success | >95% | TBD |
| http_req_success | >99% | TBD |
| p95 latency | <500ms | TBD |
| p99 latency | <1000ms | TBD |
| No critical errors | 0 | TBD |