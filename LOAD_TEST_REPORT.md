# LOAD_TEST_REPORT.md

**Generated:** 2026-06-18

## Load Testing Status

| Test | File | Status |
| :--- | :--- | :--- |
| 10k users | `test/load/10k-users.js` | ⚠️ Blocked (requires running backend) |
| 20k users | `test/load/20k-users.js` | ⚠️ Blocked (requires running backend) |
| Breaking point | `infra/scripts/breaking-point.js` | ⚠️ Blocked (requires running backend) |
| Fake orders | `infra/scripts/fake-orders.js` | ⚠️ Blocked (requires running backend) |

## Requirements

Load tests require:
1. Backend running on localhost:3001
2. k6 installed or Docker k6 container

## Commands (when ready)

```powershell
# Terminal 1: Start backend
cd apps/backend && npm run dev

# Terminal 2: Run load tests
npm run test:load
npm run test:load:20k
```

## k6 Configuration

- Test scripts exist in `test/load/`
- Docker k6 can be used as alternative
- Breaking point test identifies max concurrent users before failure