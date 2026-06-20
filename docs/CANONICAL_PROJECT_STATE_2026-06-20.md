# SpiceGarden Canonical Project State — 2026-06-20

**Canonical status:** Current-source-of-truth documentation baseline  
**Generated:** 2026-06-20  
**Scope:** Repository documentation reconciliation, source/config inspection, and command execution in `C:\Users\mehta\Desktop\SpiceGarden`

This file is the single canonical current-state baseline for SpiceGarden. All other status, audit, readiness, load, architecture, and business-value reports must be interpreted against this file. Historical reports may remain for audit history only when marked as superseded.

---

## 1. Executive Summary

SpiceGarden is a full-stack food-delivery platform implemented as an npm-workspace monorepo. It includes a NestJS backend, Next.js web apps, Expo/React Native mobile apps, an Electron launcher, shared TypeScript packages, Docker Compose files, Kubernetes manifests, Prometheus/Grafana/Alertmanager/OpenSearch assets, and k6 load-test scripts.

Current verified position:

- Build and lint gates passed for all npm workspaces.
- Backend tests passed when run directly: 231 passed, 1 skipped.
- Root unit tests passed across workspaces: 143 tests.
- Root e2e tests passed across workspaces, but these are local Jest/component/e2e-style tests, not live product-flow validation.
- Backend coverage thresholds failed: 51.72% statements, 20.11% branches, 24.76% functions, 50.65% lines against an 80% target.
- Security and load validation are not production-validated:
  - Current `node infra/scripts/security-tests.js` run reported 100 rate-limiting issues because backend was not running on port 3001.
  - Current `node infra/scripts/penetration-tests.js` run reported 5 issues because backend was not running and port 6379 was visible.
  - Current `npm run test:load` timed out against unavailable backend on `localhost:3001`.
- Docker Compose configuration parsed successfully, but the stack was not started.
- Kubernetes manifests exist, but cluster validation/deployment was not completed.
- Infrastructure assets are configured, not runtime-validated.

**Current Project Maturity:** 67% estimated weighted score.  
**Production Readiness:** 38% estimated weighted score.  
These percentages are documentation estimates with an explicit rubric in section 12. They are not engineering completion facts.

---

## 2. Verification Scope

### Commands run in this reconciliation

| Command | Date | Scope | Result |
|---|---:|---|---|
| `npm run build` | 2026-06-20 | All npm workspaces | PASS; all workspaces completed. Next.js emitted SWC native-load warnings but fell back and compiled. |
| `npm run lint` | 2026-06-20 | All npm workspaces | PASS; exit code 0. |
| `npm run test:unit` | 2026-06-20 | All workspaces with unit scripts | PASS; 143 tests passed. |
| `npm run test:integration` | 2026-06-20 | All workspaces with integration scripts | PASS; backend reported 231 passed, 1 skipped; frontend integration suites passed. |
| `npm run test:e2e` | 2026-06-20 | All workspaces with e2e scripts | PASS; backend 35 tests plus frontend e2e suites passed. |
| `cd apps/backend && npm run test` | 2026-06-20 | Backend full Jest suite | PASS; 231 passed, 1 skipped. |
| `cd apps/backend && npm run test:cov` | 2026-06-20 | Backend coverage thresholds | Tests passed; coverage gate failed at 51.72/20.11/24.76/50.65 vs 80 targets. |
| `npm audit --audit-level=moderate` | 2026-06-20 | Root dependency audit | FAIL; 33 vulnerabilities: 32 moderate, 1 high. |
| `node infra/scripts/security-tests.js` | 2026-06-20 | Runtime security script | FAIL; 100 rate-limiting issues; backend not running. |
| `node infra/scripts/penetration-tests.js` | 2026-06-20 | Runtime penetration script | FAIL; 5 issues; backend not running and port 6379 visible. |
| `cd apps/backend && npm run test:load` | 2026-06-20 | k6 10k load test | FAIL/TIMEOUT; backend refused connections on `localhost:3001`. |
| `node infra/scripts/fake-orders.js` | 2026-06-20 | Fake order script | ABORTED; backend health failed. |
| `node infra/scripts/breaking-point.js` | 2026-06-20 | Breaking-point script | ABORTED; system not healthy. |
| `node infra/scripts/validate-env-consistency.js` | 2026-06-20 | Environment consistency | PASS. |
| `node infra/scripts/validate-secrets.js` | 2026-06-20 | Secret validation | WARNING; 3/16 valid, 13 warnings, optional production secrets missing. |
| `node infra/scripts/deployment-check.js` | 2026-06-20 | Deployment validation | FAIL; cannot connect to cluster. |
| `docker-compose -f compose.dev.yaml config` | 2026-06-20 | Compose syntax/config | PASS. |
| `docker-compose -f compose.infra.yaml config` | 2026-06-20 | Infra compose syntax/config | PASS. |
| `kubectl apply --dry-run=client -f ...` | 2026-06-20 | Kubernetes client/server validation | FAIL; no cluster API reachable at localhost:8080. |

### Workspaces verified

| Workspace | Build | Lint | Unit tests | Integration tests | E2E tests |
|---|---|---|---|---|---|
| `apps/backend` | PASS | PASS | 30 passed | 231 passed, 1 skipped in full test | 35 passed |
| `apps/customer-mobile` | PASS | PASS | 33 passed | 33 passed | 1 passed |
| `apps/customer-web` | PASS | PASS | 11 passed | passed | 1 passed |
| `apps/delivery-partner` | PASS | PASS | 6 passed | 6 passed | 6 passed |
| `apps/launcher` | PASS | PASS | 1 passed | not present | not present |
| `apps/restaurant-dashboard` | PASS | PASS | 9 passed | 2 passed | 1 passed |
| `apps/super-admin` | PASS | PASS | 23 passed | 2 passed | 21 passed |
| `packages/api-types` | PASS | PASS | not present | not present | not present |
| `packages/grpc-transport` | PASS | PASS | not present | not present | not present |
| `packages/proto` | PASS | PASS | not present | not present | not present |
| `packages/shared` | PASS | PASS | 2 passed | not present | not present |
| `packages/ui` | PASS | PASS | 28 passed | not present | not present |

### Docs audited

- 191 markdown files discovered.
- Major root docs audited: `README.md`, `CURRENT_STATUS_SUMMARY.md`, `QUALITY_GATE_REPORT.md`, `SECURITY_AUDIT_REPORT.md`, `PRODUCTION_READINESS_REPORT.md`, `INFRASTRUCTURE_REPORT.md`, `BUSINESS_VALUE_REPORT.md`, `README_CHANGELOG.md`, `ARCHITECTURE_REPORT.md`, `LOAD_TEST_REPORT.md`, `PROJECT_STATUS_REPORT.md`, `TEST_COVERAGE_REPORT.md`, plus historical/current audit reports.
- Major `docs/` reports audited: `docs/PROJECT_SUMMARY.md`, `docs/QUALITY_GATE_REPORT.md`, `docs/SECURITY_AUDIT_REPORT.md`, `docs/PRODUCTION_READINESS_REPORT.md`, `docs/INFRASTRUCTURE_REPORT.md`.
- Reports folder audited: `reports/quality-gate/QUALITY_GATE_REPORT.md` and `reports/quality-gate/summary.json`.
- Historical/superseded docs were marked with the required banner where they are no longer current.

### Supporting artifacts inspected

Package manifests, workspace scripts, backend `main.ts`, `app.module.ts`, auth controller/service, RBAC guard, CORS origin helper, Compose files, Kubernetes manifests, Prometheus/Grafana/Alertmanager configs, k6 scripts, security scripts, penetration scripts, deployment validation scripts, and React Doctor report JSON.

---

## 3. Repository Snapshot

### Top-level structure

- `apps/` — application workspaces: backend, customer-web, restaurant-dashboard, super-admin, customer-mobile, delivery-partner, launcher.
- `packages/` — shared workspaces: ui, shared, api-types, proto, grpc-transport.
- `infra/` — Docker/Compose support, Kubernetes manifests, Prometheus/Grafana/Alertmanager/OpenSearch/Filebeat configs, validation/security scripts.
- `k8s/` — legacy/simple backend deployment manifest.
- `docs/` — documentation reports.
- `reports/` — command output artifacts and quality-gate summaries.
- `legal/` — legal documentation.
- `ux/` and `packages/ux/` — UX design artifacts and phase documentation.
- `secrets/` — secret directory exists in repo tree, but actual secret contents are not safe to inspect or present; validation found placeholders/missing optional secrets.

### Applications

| App | Workspace | Framework | Port/script evidence |
|---|---|---|---|
| Backend | `apps/backend` | NestJS | port 3001 in `apps/backend/src/main.ts:280` |
| Customer Web | `apps/customer-web` | Next.js | dev port 3002 in package script |
| Restaurant Dashboard | `apps/restaurant-dashboard` | Next.js | dev port 3003 in package script |
| Super Admin | `apps/super-admin` | Next.js | dev port 3004 in package script |
| Customer Mobile | `apps/customer-mobile` | Expo/React Native | no HTTP port |
| Delivery Partner | `apps/delivery-partner` | Expo/React Native | no HTTP port |
| Launcher | `apps/launcher` | Electron | desktop launcher |

### Infrastructure assets present

- Compose: `compose.dev.yaml`, `compose.infra.yaml`, `compose.yaml`, `compose.debug.yaml`.
- Kubernetes: `infra/k8s/production-hardened.yaml`, `staging.yaml`, `backend-deployment.yaml`, `cdn-ingress.yaml`, `configmap.yaml`, `secrets.yaml`, `postgres-ha.yaml`, `redis-cluster.yaml`, plus legacy `k8s/backend-deployment.yaml`.
- Observability: Prometheus configs/rules, Grafana datasource/dashboard provisioning and one dashboard JSON, Alertmanager config, OpenSearch/Filebeat assets.
- Validation scripts: security, penetration, deployment, env consistency, secret validation, fake orders, breaking point.

---

## 4. Current Build State

| Workspace | Build command | Result | Evidence | Notes |
|---|---|---|---|---|
| backend | `tsc -p tsconfig.build.json` | PASS | `npm run build` | Compiles. |
| customer-mobile | `tsc --noEmit` | PASS | `npm run build` | Compiles. |
| customer-web | `next build` | PASS | `npm run build` | Compiled 21 pages; emitted Next SWC native-load warning, fell back to WASM. |
| delivery-partner | `tsc --noEmit` | PASS | `npm run build` | Compiles. |
| launcher | `npm run build:main && npm run build:renderer` | PASS | `npm run build` | Webpack renderer compiled successfully. |
| restaurant-dashboard | `next build` | PASS | `npm run build` | Compiled 10 pages; emitted Next SWC native-load warning, fell back to WASM. |
| super-admin | `next build` | PASS | `npm run build` | Compiled 14 pages; emitted Next SWC native-load warning, fell back to WASM. |
| api-types | `tsc --noEmit` | PASS | `npm run build` | Compiles. |
| grpc-transport | `tsc --noEmit` | PASS | `npm run build` | Compiles. |
| proto | `tsc --noEmit` | PASS | `npm run build` | Compiles. |
| shared | `tsc` | PASS | `npm run build` | Compiles. |
| ui | `tsc` | PASS | `npm run build` | Compiles. |

**Build status:** PASS.  
**Caveat:** Next.js SWC native-load warning was observed but did not fail builds.

---

## 5. Current Test State

### Backend

| Suite | Command | Result |
|---|---|---|
| Unit | `cd apps/backend && npm run test:unit` | 3 suites, 30 tests passed |
| Integration | `cd apps/backend && npm run test:integration` | Included in full backend test; full backend test passed |
| E2E | `cd apps/backend && npm run test:e2e` | 2 suites, 35 tests passed |
| Full backend | `cd apps/backend && npm run test` | 231 passed, 1 skipped |
| Coverage | `cd apps/backend && npm run test:cov` | Tests passed; coverage thresholds failed |

### Root workspace tests

| Category | Result | Notes |
|---|---|---|
| Unit | PASS; 143 tests | All workspaces with `test:unit` passed. |
| Integration | PASS | Backend full suite passed; frontend integration suites passed. |
| E2E | PASS | Backend and frontend e2e-style suites passed. |
| Coverage | FAIL threshold | Backend coverage below 80% thresholds. |

### Coverage metrics

| Metric | Actual | Target | Status |
|---|---:|---:|---|
| Statements | 51.72% | 80% | FAIL |
| Branches | 20.11% | 80% | FAIL |
| Functions | 24.76% | 80% | FAIL |
| Lines | 50.65% | 80% | FAIL |

### Test-count reconciliation

Older docs conflicted across 30, 99, 143, 188, 210, and 231 test counts. Current verified state:

- Backend narrowed unit gate: 30 tests.
- Backend e2e gate: 35 tests.
- Backend full direct test command: 231 passed, 1 skipped.
- Root unit gate: 143 tests.
- Do not present 99, 188, or 210 as the current canonical total. They are historical or partial counts.

---

## 6. Current Load Testing State

### Load scripts present

`apps/backend/test/load/` contains 19 JavaScript files, including:

- `smoke-test.js`
- `10-users.js`
- `50-users.js`
- `250-users.js`
- `1k-users.js`
- `2.5k-users.js`
- `5k-users.js`
- `10k-users.js`
- `20k-users.js`
- `breaking-point.js`
- `order-placement-stress.js`
- `redis-saturation.js`
- `websocket-stress.js`

### Smoke load validated

No smoke load test was validated against the real backend in this reconciliation.

### Full load validated

No full load test was validated. `cd apps/backend && npm run test:load` timed out because `localhost:3001` refused connections.

### Environment assumptions

- `apps/backend/test/load/common.js` defaults to `BASE_URL=http://localhost:3001`.
- k6 setup calls `GET /health`.
- User flow calls `/auth/register`, `/auth/login`, `/restaurants`, `/user/addresses`, `/orders`, and `/payments/create-intent`.

### Thresholds used

`common.js` default thresholds include:

- `http_req_failed: rate<0.01`
- `load_success: rate>0.99`
- `signup_success: rate>0.99`
- `login_success: rate>0.99`
- `browse_restaurants_success: rate>0.99`
- `address_success: rate>0.99`
- `order_success: rate>0.99`
- `http_req_duration: p(95)<1500ms`

### Last successful run

No successful real-backend load run was verified in this reconciliation. Historical `LOAD_TEST_RESULTS.md` is marked historical because it validated a simple Express load-test server, not the full SpiceGarden backend.

### Unresolved caveats

- Backend was not running.
- Databases/Redis were not started through Compose.
- k6 run timed out.
- Load-test mode bypass behavior was configured in source but not validated at runtime.

---

## 7. Current Security State

### Implemented security controls

| Control | Status | Evidence |
|---|---|---|
| JWT auth module | Implemented | `apps/backend/src/services/auth/auth.module.ts` |
| Argon2 password hashing | Implemented | `apps/backend/package.json:42`, `auth.service.ts` |
| Rate limiters | Implemented | `apps/backend/src/main.ts:136-144` |
| Redis-backed rate-limit store with memory fallback | Implemented | `apps/backend/src/security/redis-rate-limit.store.ts` |
| Helmet headers | Implemented | `apps/backend/src/main.ts:215-234` |
| HPP protection | Implemented | `apps/backend/src/main.ts:238` |
| Mongo sanitization | Implemented | `apps/backend/src/main.ts:170-204,237` |
| CSRF protection | Implemented | `apps/backend/src/main.ts:235` |
| CORS origin allowlist | Implemented | `apps/backend/src/security/cors-origin.ts`, `main.ts:208-213` |
| ValidationPipe | Implemented | `apps/backend/src/main.ts:271-278` |
| Dangerous method blocking | Implemented | `apps/backend/src/main.ts:240-246` |
| RBAC guard | Implemented, coverage unverified | `apps/backend/src/security/roles.guard.ts` |
| Production secret validation | Implemented | `apps/backend/src/main.ts:57-87` |

### Security tests actually executed

| Test | Result | Notes |
|---|---|---|
| `node infra/scripts/security-tests.js` | FAIL | 100 rate-limiting issues; backend not running. |
| `node infra/scripts/penetration-tests.js` | FAIL | 5 issues; backend not running; port 6379 visible. |
| `npm audit --audit-level=moderate` | FAIL | 33 vulnerabilities: 32 moderate, 1 high. |
| `node infra/scripts/validate-secrets.js` | WARNING | 3/16 valid; 13 warnings; optional production secrets missing. |

### Unresolved security findings

- Runtime security scripts need a running backend and infrastructure.
- RBAC controller coverage has not been audited.
- Current security script reported rate-limiting failure when backend was unavailable.
- Penetration script reported missing security headers and exposed Redis port when backend was unavailable.
- Dependency audit has 1 high and 32 moderate vulnerabilities.
- `.env.production.example` and `.env.staging.example` use `ALLOWED_ORIGINS` and file-based payment secret variables, while `main.ts` validates `CORS_ALLOWED_ORIGINS` and direct secret variables such as `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.

---

## 8. Infrastructure State

### Infrastructure assets present

- Compose files exist.
- Kubernetes manifests exist.
- Observability configs exist.
- Validation scripts exist.

### Docker/Compose validation

| Check | Result |
|---|---|
| `docker-compose -f compose.dev.yaml config` | PASS |
| `docker-compose -f compose.infra.yaml config` | PASS |
| Stack startup | NOT RUN |
| Health endpoint runtime check | NOT VALIDATED |

`compose.dev.yaml` has 13 services: postgres, redis, mongo, prometheus, grafana, opensearch, opensearch-dashboards, alertmanager, backend, customer-web, restaurant-dashboard, super-admin, delivery-partner.

`compose.infra.yaml` has 12 services: spicegarden, postgres, redis, mongo, prometheus, grafana, opensearch, opensearch-dashboards, filebeat, alertmanager, sentry, sentry-worker.

### Kubernetes validation

| Check | Result |
|---|---|
| Manifests present | YES |
| Client/server dry-run | FAIL; no cluster API reachable |
| Deployment to staging/production | NOT VALIDATED |

### Known infra caveats

- `compose.dev.yaml` backend healthcheck uses `/orders/health`, while public health is `/health` in `AppController`.
- `k8s/backend-deployment.yaml` uses container port 3000, while backend listens on 3001.
- Grafana dashboard provider path is `/etc/grafana/provisioning/dashboards`, while compose mounts dashboards under `/etc/grafana/dashboards`.
- Prometheus alert rules reference metrics not emitted by inspected backend metrics code.

---

## 9. Observability State

### Configs present

| Asset | Status |
|---|---|
| Prometheus dev/prod configs | Present |
| Prometheus alert rules | Present |
| Prometheus SLO rules | Present |
| Grafana datasource provisioning | Present |
| Grafana dashboard provisioning | Present |
| Grafana dashboard JSON | Present |
| Alertmanager config | Present |
| OpenSearch/Filebeat assets | Present |
| Backend `/metrics` endpoint | Implemented in source |

### Runtime validation

No observability stack was started or queried. Prometheus, Grafana, Alertmanager, OpenSearch, and dashboard behavior are configured but not runtime-validated.

### Observability caveats

- Backend emits `http_requests_total` and `http_request_duration_seconds`.
- Alert/dashboard rules reference queue/payment/socket/order metrics that were not verified as emitted by the inspected backend metrics code.
- Grafana dashboard provisioning path appears mismatched with Compose mount path.

---

## 10. Product Flow Validation State

| Flow | Status | Evidence |
|---|---|---|
| Customer auth | PASS for code/tests; NOT RUNTIME-VALIDATED | Auth controller routes exist; backend tests pass; no live backend runtime validation. |
| Restaurant browsing | PARTIAL | k6 flow targets `/restaurants`; no live backend validation. |
| Cart | PARTIAL | Frontend tests exist; no live checkout/runtime validation. |
| Checkout | PARTIAL | Frontend/backend code exists; no live runtime validation. |
| Payment | PARTIAL | Payment modules/tests exist; no live gateway validation. |
| Tracking | NOT VERIFIED | WebSocket/tracking code exists; no runtime validation. |
| Driver flow | PARTIAL | Delivery partner tests exist; no live runtime validation. |
| Admin flow | PARTIAL | Super-admin tests exist; no live runtime validation. |
| Restaurant dashboard flow | PARTIAL | Restaurant dashboard tests exist; no live runtime validation. |

---

## 11. Technical Debt Inventory

Repo evidence only, excluding generated `node_modules`, `dist`, `coverage`, `.next`, reports, and UX docs where noted:

| Item | Count/status | Evidence |
|---|---:|---|
| Markdown docs | 191 files | Node directory scan |
| Code TODO/FIXME tokens | 7 | Node scan over `apps/` and `packages/` |
| Code console output calls | 109 | Node scan over `apps/` and `packages/` |
| Explicit `any` tokens | 775 | Node scan over `apps/` and `packages/` |
| Backend coverage threshold | FAIL | `npm run test:cov` |
| React Doctor warnings | 62 total | customer-web 17, delivery-partner 34, restaurant-dashboard 5, super-admin 6; 0 errors |
| Next SWC native-load warning | Present | `npm run build` |

---

## 12. Current Maturity % and Production Readiness %

These percentages are estimated documentation scores, not engineering facts. They are included only because stale docs used percentages without defensible rubrics.

### Rubric

| Category | Weight | Score | Justification |
|---|---:|---:|---|
| Build | 15% | 100 | All workspaces built. |
| Lint | 10% | 100 | All workspaces linted. |
| Tests | 20% | 75 | Backend/root tests pass; coverage thresholds fail; live flows not validated. |
| Security | 15% | 45 | Controls implemented; current runtime security/pen tests fail; npm audit has high/moderate findings; RBAC coverage unverified. |
| Infra validation | 10% | 35 | Compose config valid; stack not started; deployment check cannot connect to cluster. |
| Load validation | 10% | 0 | k6 exists but failed/timed out without backend. |
| Observability validation | 5% | 40 | Configs exist; runtime not validated; metric/path caveats. |
| Product flow validation | 10% | 35 | Local tests exist; no live end-to-end runtime validation. |
| Docs accuracy | 5% | 85 | Canonical docs now reconciled; historical docs still need reviewer care. |

### Derived scores

- **Current Project Maturity:** 67% estimated.
- **Production Readiness:** 38% estimated.

Production readiness is lower because it emphasizes runtime validation, security execution, load validation, deployment validation, and operational readiness rather than code presence or build success.

---

## 13. Valuation Positioning

All valuation statements are estimates unless tied to verified code facts.

### Verified technical state

- 12 npm workspaces build and lint.
- Backend full tests pass.
- Root unit tests pass.
- k6, security, penetration, deployment, observability, and Kubernetes runtime validation are incomplete or failing in current execution.
- Dependency audit has unresolved high/moderate vulnerabilities.

### Estimated replacement cost

Estimated replacement cost: **3,500–7,000 engineering hours**, depending on whether mobile, launcher, infra, observability, and compliance modules are included. This is an estimate based on repo size and scope, not a market valuation.

### Estimated acquisition value

No defensible acquisition value can be calculated from repository evidence alone. Revenue, users, retention, contracts, margins, legal diligence, and operational risk are not available in this repo.

### Estimated SaaS potential

No defensible SaaS valuation can be calculated from repository evidence alone. The repo demonstrates platform scope, but SaaS value requires market validation, paying customers, pricing, churn, and unit economics.

---

## 14. Current Blockers

| Blocker | Severity | Evidence |
|---|---|---|
| Runtime backend unavailable for security/load validation | P0 | Security/load scripts failed against unavailable `localhost:3001`. |
| Dependency audit unresolved | P0 | `npm audit --audit-level=moderate` found 33 vulnerabilities including 1 high. |
| Coverage thresholds not met | P1 | Backend coverage 51.72/20.11/24.76/50.65 vs 80 targets. |
| Kubernetes/cluster validation unavailable | P1 | Deployment check and kubectl dry-run cannot connect to cluster. |
| Compose stack not started | P1 | Only config validation was run; no health/runtime validation. |
| RBAC controller coverage unverified | P1 | Guard exists; no coverage audit completed. |
| Observability runtime not validated | P2 | Configs exist; no stack startup/query validation. |
| Env variable mismatch in production/staging examples | P2 | Examples use `ALLOWED_ORIGINS` and file secret vars; `main.ts` expects `CORS_ALLOWED_ORIGINS` and direct secret vars. |
| Infra manifest caveats | P2 | Legacy k8s port 3000 mismatch; Grafana provisioning path mismatch; metric names not fully aligned. |

---

## 15. Recommended Next Steps

### P0

1. Start full infrastructure with `docker-compose -f compose.dev.yaml up -d` or an equivalent local stack.
2. Start backend on port 3001 and rerun security, penetration, fake-order, breaking-point, and smoke load tests.
3. Remediate or formally risk-accept the 33 npm audit findings, including the high-severity finding.
4. Fix or document environment variable mismatches in `.env.production.example` and `.env.staging.example`.

### P1

1. Run smoke and progressive k6 load tests after backend/databases are running.
2. Audit RBAC guard coverage across protected controllers.
3. Validate Kubernetes manifests against a real cluster or a local kind/minikube cluster.
4. Improve backend coverage to the 80% threshold or update the threshold with an approved exception.
5. Resolve Compose/K8s caveats: backend health path, legacy port 3000 manifest, Grafana dashboard path, and metric-name alignment.

### P2

1. Validate observability end-to-end: Prometheus scrape, Grafana dashboard, Alertmanager route, OpenSearch/Filebeat ingestion.
2. Re-run React Doctor after maintainability cleanup.
3. Reduce TODO/FIXME, console output, and explicit `any` debt.
4. Convert historical reports into archived references or remove duplicates after stakeholder approval.

---

## Documentation Map

| File | Current role |
|---|---|
| `docs/CANONICAL_PROJECT_STATE_2026-06-20.md` | Canonical current state. |
| `docs/DOCUMENTATION_RECONCILIATION_MATRIX.md` | Claim-by-claim reconciliation evidence. |
| `README.md` | Executive entry point. |
| `CURRENT_STATUS_SUMMARY.md` | Concise dashboard. |
| `QUALITY_GATE_REPORT.md` | Command-driven quality gates. |
| `SECURITY_AUDIT_REPORT.md` | Security controls, tested controls, unresolved findings. |
| `PRODUCTION_READINESS_REPORT.md` | Readiness rubric and release recommendation. |
| `INFRASTRUCTURE_REPORT.md` | Infra assets vs runtime validation. |
| `BUSINESS_VALUE_REPORT.md` | Business value tied to verified technical state and labeled estimates. |
| `README_CHANGELOG.md` | Reconciliation changes. |
| `docs/DOCS_RECONCILIATION_COMPLETION_REPORT.md` | Final reconciliation completion report. |
