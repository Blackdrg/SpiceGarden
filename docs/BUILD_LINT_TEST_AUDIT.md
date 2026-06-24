# Build, Lint, Test Audit

**Date:** 2026-06-23

---

## Commands Executed

| Command | Exit Code | Status |
| ------- | --------- | ------ |
| `npm run lint` | 0 | ✅ Passed |
| `npm run build` | 0 | ✅ Passed |
| `npm run test:unit` | 0 | ✅ Passed |
| `cd apps/backend && npm test` | 0 | ✅ Passed |
| `cd apps/backend && npm run test:cov` | 1 | ❌ Failed (coverage gate) |
| `npm audit --audit-level=moderate` | 1 | ❌ Failed (31 vulnerabilities) |

---

## Lint Results

All workspaces passed:
- `@spicegarden/backend` — clean
- `@spicegarden/customer-mobile` — clean
- `@spicegarden/customer-web` — clean
- `@spicegarden/delivery-partner` — clean
- `spicegarden-launcher` — clean
- `@spicegarden/restaurant-dashboard` — clean
- `@spicegarden/super-admin` — clean
- `@spicegarden/api-types` — clean
- `@spicegarden/grpc-transport` — clean
- `@spicegarden/proto` — clean
- `@spicegarden/shared` — clean
- `@spicegarden/ui` — clean

**Evidence:** `npm run lint` output — no errors reported

---

## Build Results

All workspaces compiled successfully:
- `@spicegarden/backend` — `tsc -p tsconfig.build.json`
- `@spicegarden/customer-mobile` — `tsc --noEmit`
- `@spicegarden/customer-web` — `next build` (compiled successfully, 21 pages)
- `@spicegarden/delivery-partner` — `tsc --noEmit`
- `spicegarden-launcher` — webpack compiled successfully
- `@spicegarden/restaurant-dashboard` — `next build` (compiled successfully, 10 pages)

**Evidence:** Build output shows successful compilation. UI build fixed via `packages/ui/lucide-react.d.ts` type declarations.

---

## Test Results

### Root Unit Tests (`npm run test:unit`)

| Workspace | Tests | Suites | Status |
| --------- | ----: | -----: | ------ |
| backend | 26 | 3 | PASS |
| customer-mobile | 33 | 6 | PASS |
| customer-web | 11 | 3 | PASS |
| delivery-partner | 6 | 3 | PASS |
| launcher | 1 | 1 | PASS |
| restaurant-dashboard | 9 | 3 | PASS |
| super-admin | 23 | 4 | PASS |
| shared | 2 | 2 | PASS |
| ui | 28 | 5 | PASS |
| **Total** | **139** | **30** | **All PASS** |

### Backend Full Suite (`cd apps/backend && npm test`)

```
Test Suites: 1 skipped, 53 passed, 54 total
Tests:       1 skipped, 630 passed, 631 total
Time:        48.239s
```

**Skipped:** `mongo-connection.spec.ts` (MongoDB unavailable)

---

## Coverage Results

**Command:** `cd apps/backend && npm run test:cov`

```
Statements   : 80.02% (failed threshold 80%)
Branches     : 63.05% (failed threshold 80%)
Functions    : 63.22% (failed threshold 80%)
Lines        : 79.82% (failed threshold 80%)
```

**Source:** `apps/backend/coverage/coverage-summary.json`

### Coverage Failures by Module (below 80%)

| Module | Lines | Branches | Functions | Status |
| ------ | ----- | -------- | --------- | ------ |
| `tracking.gateway.ts` | 38% | 38% | 36% | ❌ FAIL |
| `dispatch-engine.service.ts` | 15% | 0% | 0% | ❌ FAIL |
| `driver-assignment.service.ts` | 49% | 29% | 31% | ❌ FAIL |
| `ledger.service.ts` | 29% | 0% | 0% | ❌ FAIL |
| `notification.service.ts` | 49% | 37% | 65% | ❌ FAIL |
| `production-notification.service.ts` | 5% | 0% | 0% | ❌ FAIL |
| `loyalty.service.ts` | 39% | 21% | 29% | ❌ FAIL |
| `logging.service.ts` | 12% | 0% | 0% | ❌ FAIL |

---

## Dependency Audit

**Command:** `npm audit --audit-level=moderate`

```
31 moderate severity vulnerabilities
0 high, 0 critical
```

**Top vulnerabilities:**
- `js-yaml` ≤4.1.1 — Quadratic-complexity DoS (via `@istanbuljs/load-nyc-config`)
- `uuid` <11.1.1 — Missing buffer bounds check (via `sockjs`/`webpack-dev-server`)

---

## Environment Blockers

| Check | Status | Reason |
| ----- | ------ | ------ |
| Docker runtime | Blocked | Server connection failed to Docker daemon |
| Kubernetes API | Blocked | Cannot connect to localhost:8080 |
| MongoDB | Blocked | Tests skipped when offline |
| Security tests | Blocked | Requires running backend on port 3001 |