# RATE_LIMITING_REPORT

Generated: 2026-06-18 18:26 IST

## Rate-limit configuration found

| Area | Source | Current behavior |
|---|---|---|
| Global install | `apps/backend/src/main.ts:103` | Skipped when `LOAD_TEST_MODE=true` |
| Auth OTP | `apps/backend/src/main.ts:108` | 3 requests / 10 min |
| Auth | `apps/backend/src/main.ts:109` | 5 requests / 15 min, skip successful requests |
| Orders | `apps/backend/src/main.ts:110` | 10 requests / 15 min |
| API | `apps/backend/src/main.ts:111` | 100 requests / 15 min |
| Auth controller guard | `apps/backend/src/services/auth/auth.controller.ts:10` | Nest `ThrottlerGuard` configured at 10 requests / 60s in `SecurityModule` |
| Redis rate-limit store | `apps/backend/src/security/redis-rate-limit.store.ts` | Uses Redis when available, process-local fallback otherwise |

## Load-test profile

- The existing `LOAD_TEST_MODE=true` bypasses express-rate-limit middleware only.
- It does not disable `@UseGuards(ThrottlerGuard)` on `AuthController`.
- Recommended command for realistic load testing without disabling production protections globally:
  - `LOAD_TEST_MODE=true RATE_LIMIT_AUTH_MAX=1000 RATE_LIMIT_ORDERS_MAX=1000 RATE_LIMIT_API_MAX=5000 k6 run apps/backend/test/load/10k-users.js`
- This keeps rate limiting enabled in non-load-test modes and raises only the load-test process limits.

## Validation

| Check | Result | PASS/FAIL |
|---|---|---|
| Backend reachable | `GET /health` HTTP 200 after local repository provider fix | PASS |
| Rate-limit bypass path in source | `LOAD_TEST_MODE=true` exists | PASS |
| Auth throttling under load | Not validated; full backend unavailable | FAIL |
| Redis-backed limiter | Redis unavailable | FAIL |
