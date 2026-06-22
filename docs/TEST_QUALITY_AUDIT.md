# Test Quality Audit

**Generated:** 2026-06-22
**Canonical source:** `docs/CANONICAL_PROJECT_STATE_2026-06-22.md`
**Purpose:** Separate test quality, coverage, runtime security, and load-test evidence from broader readiness claims.

---

## 1. Executive Test Position

SpiceGarden has passing build/lint/test gates and a stronger backend test suite than prior reports, but the repository is not test-quality complete. The main unresolved quality gaps are backend coverage below configured thresholds, dependency audit failures, and incomplete full-load validation.

Current authoritative test position:

| Area | Status | Evidence |
|---|---|---|
| Root lint | Implemented & verified | `npm run lint` passed. |
| Root build | Implemented & verified | `npm run build` passed. |
| Root unit tests | Implemented & verified | `npm run test:unit` passed with 134 tests. |
| Root integration tests | Implemented & verified | `npm run test:integration` passed. |
| Root e2e tests | Implemented & verified | `npm run test:e2e` passed. |
| Root aggregate tests | Implemented & verified | `npm run test:all` passed. |
| Backend full tests | Implemented & verified | `cd apps/backend && npm test` passed with 320 passed, 1 skipped. |
| Backend coverage | Broken / failing | `cd apps/backend && npm run test:cov` failed thresholds. |
| Runtime security | Implemented & verified | `node infra/scripts/security-tests.js` found 0 vulnerabilities. |
| Penetration | Implemented & verified | `node infra/scripts/penetration-tests.js` found 0 issues. |
| Reduced smoke load | Implemented & verified | 5-VU k6 smoke passed. |
| Default smoke load | Broken / failing | 50-VU smoke failed p95 latency threshold. |
| Full 10k/20k load | Blocked from validation | Not completed as production evidence. |

---

## 2. Test Commands and Results

### 2.1 Workspace gates

| Command | Result | Notes |
|---|---|---|
| `npm run lint` | Passed | All workspaces. |
| `npm run build` | Passed | All workspaces. |
| `npm run test:unit` | Passed | 134 root unit tests. |
| `npm run test:integration` | Passed | Workspace integration suites. |
| `npm run test:e2e` | Passed | Workspace e2e-style suites. |
| `npm run test:all` | Passed | Workspace aggregate command. |

### 2.2 Backend suite

| Command | Result | Notes |
|---|---|---|
| `cd apps/backend && npm test` | Passed | 320 passed, 1 skipped. |
| `cd apps/backend && npm run test:cov` | Tests passed; coverage gate failed | Statements 59.78%, branches 34.09%, functions 34.73%, lines 59.02%. |

### 2.3 Security and penetration scripts

| Command | Result | Notes |
|---|---|---|
| `node infra/scripts/security-tests.js` | Passed | 0 vulnerabilities, 96/100 rate-limited responses. |
| `node infra/scripts/penetration-tests.js` | Passed | 0 issues. |
| `node infra/scripts/security-tests.js` with backend in `LOAD_TEST_MODE=true` | Failed | 100 vulnerabilities because dev rate limiters were intentionally bypassed. |

Important: `LOAD_TEST_MODE=true` disables dev rate limiters in `apps/backend/src/main.ts:136-144`. Security validation must be run against a normally configured backend, not load-test bypass mode.

### 2.4 Load tests

| Command | Result | Notes |
|---|---|---|
| `cd apps/backend && npm run test:load` | Failed | Earlier run hit rate limiting: `429 Too many requests`, `Retry-After: 900`. |
| `cd apps/backend && k6 run test/load/smoke-test.js` | Failed threshold | p95 6.3s vs `<1500ms`; checks succeeded. |
| `cd apps/backend && TARGET_VUS=5 STAGE_DURATION=30s P95_LIMIT_MS=10000 k6 run test/load/smoke-test.js` with `LOAD_TEST_MODE=true` | Passed | 213/213 checks, 0% failed requests, p95 797.07ms. |

---

## 3. Coverage Metrics

Backend coverage remains below the configured 80% global thresholds.

| Metric | Actual | Target | Status |
|---|---:|---:|---|
| Statements | 59.78% | 80% | Broken / failing |
| Branches | 34.09% | 80% | Broken / failing |
| Functions | 34.73% | 80% | Broken / failing |
| Lines | 59.02% | 80% | Broken / failing |

### 3.1 Highest-value coverage gaps

The phase-4 coverage report identifies low-coverage production-sensitive areas including:

- `apps/backend/src/services/payments/gateways/*`
- `apps/backend/src/services/payments/webhook/webhook.service.ts`
- `apps/backend/src/services/notifications/production-notification.service.ts`
- `apps/backend/src/modules/driver-assignment/dispatch-engine.service.ts`
- `apps/backend/src/services/payments/retry.service.ts`
- `apps/backend/src/services/geo/geo.service.ts`
- `apps/backend/src/db/database-failover.service.ts`
- `apps/backend/src/services/payments/chargeback/chargeback.service.ts`

---

## 4. Test Count Reconciliation

Older reports used conflicting totals. The current canonical interpretation is:

| Scope | Count | Use this as |
|---|---:|---|
| Root unit gate | 134 | Workspace-wide unit total from `npm run test:unit`. |
| Backend full suite | 320 passed, 1 skipped | Backend-specific full Jest suite. |
| Backend narrowed unit gate | 30 | Historical backend unit subset, not full backend truth. |
| Backend e2e gate | 35 | Historical backend e2e subset, not full backend truth. |
| Prior 304 backend total | Historical | Superseded by 320 passed, 1 skipped. |
| Prior 143 root unit total | Historical | Superseded by 134 root unit total. |

Do not aggregate unrelated scopes into a single “total tests” number without stating the scope.

---

## 5. Quality Gate Matrix

| Gate | Expected | Actual | Status |
|---|---|---|---|
| Build all workspaces | Pass | Passed | Implemented & verified |
| Lint all workspaces | Pass | Passed | Implemented & verified |
| Root unit tests | Pass | 134 passed | Implemented & verified |
| Backend full tests | Pass | 320 passed, 1 skipped | Implemented & verified |
| Backend coverage | 80%+ | 59.78% statements, 34.09% branches, 34.73% functions, 59.02% lines | Broken / failing |
| Runtime security | 0 vulnerabilities | 0 vulnerabilities | Implemented & verified |
| Penetration | 0 issues | 0 issues | Implemented & verified |
| Dependency audit | No moderate/high vulnerabilities | 33 vulnerabilities, including 1 high | Broken / failing |
| Reduced smoke load | Pass | 213/213 checks, p95 797.07ms | Implemented & verified |
| Default smoke load | p95 <1500ms | p95 6.3s | Broken / failing |
| Full load | 10k/20k validated | Not completed | Blocked from validation |

---

## 6. Test Quality Findings

### 6.1 Strengths

- Backend full suite passes with 320 tests.
- Security and penetration scripts pass against a normally running backend.
- Reduced smoke load validates register/browse flow under light local load.
- Build and lint gates pass across workspaces.
- Backend runtime endpoints are directly validated.

### 6.2 Weaknesses

- Coverage thresholds are materially below target.
- Branch coverage is especially low at 34.09%.
- Dependency audit fails at moderate/high severity.
- Default smoke load does not meet latency threshold.
- Full production load profiles were not completed.
- Runtime validation is local/SQLite/dev-mode, not Docker-backed Postgres/Redis/Mongo.

---

## 7. Recommendations

1. Add coverage for payment gateways, webhook retry, notification production provider, dispatch engine, geo, failover, and chargeback paths.
2. Raise branch coverage with explicit error-path and fallback-path tests.
3. Keep security validation separate from `LOAD_TEST_MODE=true`; do not use load-mode backend for rate-limit security claims.
4. Investigate default smoke p95 latency before claiming the 50-VU profile is acceptable.
5. Run full load tests only after Docker/Redis-backed runtime validation is possible.
6. Treat `npm audit --audit-level=moderate` as a blocking quality gate until resolved.

---

## 8. Final Test Quality Verdict

SpiceGarden has passing execution gates and meaningful backend/security tests, but it does **not** meet production-quality thresholds. The test suite is useful for regression confidence, but coverage, dependency audit, and full-load validation remain blockers.
