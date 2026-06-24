> HISTORICAL DOCUMENT
> This report reflects a prior audit state and is superseded by:
> `docs/CANONICAL_PROJECT_STATE_2026-06-20.md`
> and the latest README / status reports.

# LOAD TEST REPORT

**Generated:** 2026-06-20  
**Status:** Scripts ready; execution blocked

---

## Load Test Assets Verified

### k6 Scripts (apps/backend/test/load/)
| Script | VUs | Stages | Status |
|--------|-----|--------|--------|
| `smoke-test.js` | 5-50 | 3 stages | ✅ Ready |
| `10-users.js` | 10 | Ramp-up | ✅ Ready |
| `50-users.js` | 50 | Ramp-up | ✅ Ready |
| `250-users.js` | 250 | Ramp-up | ✅ Ready |
| `1k-users.js` | 1000 | Ramp-up | ✅ Ready |
| `2.5k-users.js` | 2500 | Ramp-up | ✅ Ready |
| `5k-users.js` | 5000 | Ramp-up | ✅ Ready |
| `10k-users.js` | 10000 | 7 stages | ✅ Ready |
| `20k-users.js` | 20000 | 7 stages | ✅ Ready |
| `breaking-point.js` | Variable | Stress | ✅ Ready |

**Total scripts:** 16 k6 files verified

---

## Test Flow (Verified in common.js)

1. **Health Check:** GET `/health`
2. **Register:** POST `/auth/register` (with phone, email, fullName)
3. **Login:** POST `/auth/login` (if register token not returned)
4. **Browse:** GET `/restaurants`
5. **Address:** POST `/user/addresses`
6. **Order:** POST `/orders` (with items, totals)
7. **Payment:** POST `/payments/create-intent` (optional)

---

## Load Test Bypass

**Source:** `apps/backend/src/main.ts:137-139`
```typescript
if (process.env.LOAD_TEST_MODE === 'true' && configService.get<string>('NODE_ENV') !== 'production') {
  return; // Skips rate limiting
}
```

**Usage:** Set `LOAD_TEST_MODE=true` to bypass rate limiting in non-production.

---

## Prerequisites for Execution

| Service | Port | Required |
|---------|------|----------|
| Backend | 3001 | ✅ Yes |
| PostgreSQL | 5432 | ⚠️ Recommended |
| Redis | 6379 | ⚠️ Recommended |
| MongoDB | 27017 | ⚠️ Optional |

**Commands:**
```bash
# Start infrastructure
docker-compose -f compose.dev.yaml up -d

# Run smoke test
npm run --prefix apps/backend test:load

# Or specific test
k6 run apps/backend/test/load/smoke-test.js
```

---

## Status

| Test | Executed |
|------|----------|
| Smoke test | ⏳ Blocked |
| 10-users | ⏳ Blocked |
| 10k-users | ⏳ Blocked |

---

## Verification Required

1. Start Docker infrastructure: `docker-compose -f compose.dev.yaml up -d`
2. Run backend: `cd apps/backend && npm run dev`
3. Execute smoke test: `npm run --prefix apps/backend test:load`