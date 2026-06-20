# Documentation Reconciliation Matrix

**Generated:** 2026-06-20  
**Canonical source:** `docs/CANONICAL_PROJECT_STATE_2026-06-20.md`  
**Purpose:** Reconcile important documentation claims against repository evidence, command output, and source/config inspection.

Allowed values used:

- Claim Type: Build, Tests, Coverage, Security, Load Testing, Infra, Observability, Production Readiness, Architecture, Business Value, Valuation, Completion %, Roadmap, Risk, Deployment, Current Status
- Current Status: VERIFIED, OUTDATED, INCORRECT, ESTIMATED, NEEDS RE-RUN, PARTIAL
- Action: KEEP, REWRITE, REMOVE, MARK HISTORICAL, SUPERSEDE, RE-VERIFY

| Document | Section | Claim | Claim Type | Current Status | Evidence Source | Replacement / Canonical Wording | Action |
|---|---|---|---|---|---|---|---|
| `docs/PROJECT_SUMMARY.md` | Header/status | SpiceGarden is `PRODUCTION READY` with 92% maturity. | Production Readiness | INCORRECT | `docs/CANONICAL_PROJECT_STATE_2026-06-20.md:1`; current security/load/infra validation failed. | Current production readiness is 38% estimated; not production-ready. | MARK HISTORICAL |
| `docs/PROJECT_SUMMARY.md` | Quality gates | Tests passed with 231 passed, 1 skipped as full project truth. | Tests | OUTDATED | `apps/backend/package.json`; root test outputs; canonical section 5. | 231 passed, 1 skipped is backend full-suite truth, not full monorepo truth. | MARK HISTORICAL |
| `docs/PROJECT_SUMMARY.md` | Deployment recommendation | Deploy to production with prerequisites met. | Deployment | INCORRECT | Current deployment-check failed; kubectl no cluster; security/load failed. | No production deployment recommendation. | MARK HISTORICAL |
| `README.md` | Current status | Security/load/infra blocked because backend not running. | Current Status | VERIFIED | Current security/load/fake-order/breaking-point outputs; canonical section 1. | Keep, but align exact counts and maturity. | REWRITE |
| `README.md` | Compose counts | `compose.dev.yaml` has 15 services and `compose.infra.yaml` has 27. | Infra | INCORRECT | Parsed Compose: dev=13 services, infra=12 services. | Compose assets are present; dev has 13 services, infra has 12. | REWRITE |
| `INFRASTRUCTURE_REPORT.md` | Docker Compose | Dev compose has 15 services and infra compose has 27. | Infra | INCORRECT | `docker-compose -f compose.dev.yaml config`; parsed service counts. | Replace with 13 and 12 service counts. | REWRITE |
| `CURRENT_STATUS_SUMMARY.md` | Production status | Staging-ready after frontend verification. | Production Readiness | INCORRECT | Current security/load/audit/deployment blockers. | Not staging-ready until P0 runtime/security/dependency blockers are addressed. | REWRITE |
| `QUALITY_GATE_REPORT.md` | Category scores | Security 50%, infra 60%, overall category scores. | Completion % | OUTDATED | Current gates include security/load/deployment failures. | Use canonical rubric: maturity 67%, production readiness 38%. | REWRITE |
| `QUALITY_GATE_REPORT.md` | Tests | 99+ tests verified. | Tests | OUTDATED | `npm run test:unit` root=143; backend full=231 passed, 1 skipped. | State backend full suite and root unit/e2e results separately. | REWRITE |
| `SECURITY_AUDIT_REPORT.md` | Security tests | Security tests blocked. | Security | PARTIAL | Historical report had blocked claim; current run failed with backend unavailable. | Current run failed; rerun after backend is running. | REWRITE |
| `CURRENT_SECURITY_REPORT.md` | Runtime security | Security tests passed with 0 vulnerabilities and 95/100 rate-limited responses. | Security | OUTDATED | Historical `reports/verification/security-tests-after-rate-limit.log` exists, but current run reported 100 issues. | Mark historical; rerun current suite after backend is up. | MARK HISTORICAL |
| `SECURITY_AUDIT_REPORT.md` | RBAC | RBAC exists but coverage unverified. | Security | VERIFIED | `roles.guard.ts`; no controller coverage audit run. | Keep as partial/unverified coverage. | REWRITE |
| `SECURITY_AUDIT_REPORT.md` | npm audit | No critical vulnerabilities. | Security | PARTIAL | `npm audit --audit-level=moderate`: 33 vulnerabilities, 1 high, 32 moderate. | No critical in current audit, but high/moderate findings remain. | REWRITE |
| `FINAL_PRODUCTION_READINESS_REPORT.md` | React Doctor | 0 warnings, 100/100. | Current Status | INCORRECT | Parsed React Doctor artifact: 62 warnings, 0 errors. | React Doctor warnings remain; not a 100/100 clean state. | MARK HISTORICAL |
| `CURRENT_PROJECT_AUDIT.md` | React Doctor | 0 diagnostics. | Current Status | INCORRECT | React Doctor summary: customer-web 17, delivery-partner 34, restaurant-dashboard 5, super-admin 6 warnings. | Replace with 62 warnings, 0 errors. | MARK HISTORICAL |
| `README_GAP_REPORT.md` | Backend test count | Backend has 99 tests. | Tests | OUTDATED | Current backend full test=231 passed, 1 skipped; narrowed gates=30 unit + 35 e2e. | 99 was a partial historical gate, not current backend full-suite count. | MARK HISTORICAL |
| `CURRENT_TEST_REPORT.md` | Unit tests | Root unit tests total 210 passed, 1 skipped. | Tests | INCORRECT | `npm run test:unit`: 143 passed. | Root unit tests are 143 passed; backend full suite is 231 passed, 1 skipped. | MARK HISTORICAL |
| `TEST_COVERAGE_REPORT.md` | Coverage | Coverage below 80% target unverified. | Coverage | INCORRECT | `npm run test:cov` failed with actual metrics. | Backend coverage failed: 51.72/20.11/24.76/50.65. | MARK HISTORICAL |
| `LOAD_TEST_CERTIFICATION.md` | Certification | Load certification pending. | Load Testing | VERIFIED | Current k6 run timed out/fails without backend. | Keep as pending, mark historical. | MARK HISTORICAL |
| `LOAD_TEST_RESULTS.md` | Load results | 100% success against load-test-server. | Load Testing | OUTDATED | Historical mock server results; current real-backend load not validated. | Historical mock result only; not full SpiceGarden backend validation. | MARK HISTORICAL |
| `LOAD_TEST_REPORT.md` | Load status | Scripts ready; execution blocked. | Load Testing | PARTIAL | Scripts present; current run attempted and failed/timed out due backend unavailable. | Scripts present; smoke/full load not validated. | MARK HISTORICAL |
| `apps/backend/package.json` | Load script | `test:load` runs `test/load/10k-users.js`. | Load Testing | VERIFIED | `apps/backend/package.json:17`. | Keep; document that it requires running backend. | KEEP |
| `apps/backend/test/load/common.js` | BASE_URL | Default base URL is `http://localhost:3001`. | Load Testing | VERIFIED | `apps/backend/test/load/common.js:6`. | Keep. | KEEP |
| `apps/backend/src/main.ts` | Backend port | Backend listens on 3001. | Architecture | VERIFIED | `apps/backend/src/main.ts:280`. | Keep. | KEEP |
| `k8s/backend-deployment.yaml` | Backend port | Container/readiness/service port 3000. | Deployment | INCORRECT | Backend listens on 3001; production/staging manifests use 3001. | Legacy/simple manifest has port mismatch and needs fix or archival. | RE-VERIFY |
| `compose.dev.yaml` | Backend healthcheck | Uses `/orders/health`. | Infra | INCORRECT | Public health endpoint is `/health` in `app.controller.ts`; `/orders` is guarded. | Use `/health` or authenticated health path. | RE-VERIFY |
| `compose.dev.yaml` | Compose syntax | Valid config. | Infra | VERIFIED | `docker-compose -f compose.dev.yaml config` passed. | Keep. | KEEP |
| `compose.infra.yaml` | Compose syntax | Valid config. | Infra | VERIFIED | `docker-compose -f compose.infra.yaml config` passed. | Keep. | KEEP |
| `node infra/scripts/deployment-check.js` | Cluster check | Cannot connect to cluster. | Deployment | VERIFIED | Command output: `ERROR: Cannot connect to cluster`. | Deployment not validated. | RE-VERIFY |
| `kubectl apply --dry-run=client` | Kubernetes validation | No cluster API reachable. | Deployment | VERIFIED | kubectl errors connecting to `localhost:8080`. | K8s manifests present but not runtime-validated. | RE-VERIFY |
| `infra/prometheus/prometheus.dev.yml` | Prometheus target | Scrapes `host.docker.internal:3001`. | Observability | VERIFIED | File lines 8-12. | Config present; runtime not validated. | KEEP |
| `infra/grafana/provisioning/dashboards/provider.yml` | Dashboard path | Uses `/etc/grafana/provisioning/dashboards`. | Observability | INCORRECT | Compose mounts dashboards to `/etc/grafana/dashboards`. | Path mismatch; dashboard provisioning not validated. | RE-VERIFY |
| `apps/backend/src/main.ts` | Metrics | Emits HTTP request counter/duration. | Observability | VERIFIED | `main.ts:33-45`. | Keep. | KEEP |
| `infra/prometheus/rules/alerts.yml` | Alert metrics | References queue/payment/socket/order metrics. | Observability | PARTIAL | Alert rules exist; emitted metrics not verified for those names. | Observability configured but metric alignment unverified. | RE-VERIFY |
| `.env.production.example` | CORS var | Uses `ALLOWED_ORIGINS`. | Security | INCORRECT | `main.ts` validates `CORS_ALLOWED_ORIGINS`. | Replace or document mapping to `CORS_ALLOWED_ORIGINS`. | RE-VERIFY |
| `.env.production.example` | Stripe var | Uses `STRIPE_SECRET_KEY_FILE`. | Security | INCORRECT | `main.ts` validates `STRIPE_SECRET_KEY`. | Replace or document file-to-env loading. | RE-VERIFY |
| `node infra/scripts/validate-env-consistency.js` | Env validation | All environment configurations valid. | Infra | VERIFIED | Command output: `All environment configurations are valid`. | Keep with caveat that it does not validate runtime cluster. | KEEP |
| `node infra/scripts/validate-secrets.js` | Secrets | 3/16 valid, 13 warnings. | Security | VERIFIED | Command output. | Optional production secrets not configured; local dev not blocked. | KEEP |
| `npm audit --audit-level=moderate` | Dependencies | 33 vulnerabilities. | Security | VERIFIED | Audit output: 32 moderate, 1 high. | Dependency audit gate fails at moderate level. | KEEP |
| `npm run build` | Build | All workspaces build. | Build | VERIFIED | Build output completed all workspaces. | Keep. | KEEP |
| `npm run lint` | Lint | All workspaces lint. | Build | VERIFIED | Lint output exit 0. | Keep. | KEEP |
| `cd apps/backend && npm run test` | Backend tests | 231 passed, 1 skipped. | Tests | VERIFIED | Backend test output. | Keep as backend full-suite count. | KEEP |
| `npm run test:unit` | Root unit tests | 143 tests passed. | Tests | VERIFIED | Root unit test output. | Keep. | KEEP |
| `npm run test:e2e` | Root e2e tests | Backend and frontend e2e suites passed. | Tests | VERIFIED | Root e2e output. | Keep; distinguish from live runtime e2e. | KEEP |
| `cd apps/backend && npm run test:cov` | Coverage | Coverage thresholds failed. | Coverage | VERIFIED | Coverage output. | Keep. | KEEP |
| `node infra/scripts/security-tests.js` | Runtime security | Current run found 100 rate-limiting issues. | Security | VERIFIED | Current command output. | Rerun after backend is running. | RE-VERIFY |
| `node infra/scripts/penetration-tests.js` | Penetration | Current run found 5 issues. | Security | VERIFIED | Current command output. | Rerun after backend is running. | RE-VERIFY |
| `cd apps/backend && npm run test:load` | Load test | 10k k6 run failed/timed out. | Load Testing | VERIFIED | k6 output refused connections to `localhost:3001`. | No successful load validation. | RE-VERIFY |
| `node infra/scripts/fake-orders.js` | Order script | Aborted because backend health failed. | Tests | VERIFIED | Command output. | Requires running backend. | RE-VERIFY |
| `node infra/scripts/breaking-point.js` | Breaking point | Aborted because system not healthy. | Load Testing | VERIFIED | Command output. | Requires running backend. | RE-VERIFY |
| `BUSINESS_VALUE_REPORT.md` | Valuation | Acquisition/SaaS value estimates. | Valuation | ESTIMATED | No revenue/user/legal/market data in repo. | Label estimates only; no defensible acquisition/SaaS value from repo alone. | REWRITE |
| `README.md` | Maturity/readiness | Must match canonical. | Completion % | VERIFIED | Canonical section 12. | Maturity 67%, production readiness 38%, estimated. | REWRITE |
| `CURRENT_STATUS_SUMMARY.md` | Estimated value | Current estimated value range. | Valuation | ESTIMATED | Canonical section 13. | Replacement cost estimate only; acquisition/SaaS not defensible. | REWRITE |
| `README_CHANGELOG.md` | Changelog | Documents reconciliation changes. | Current Status | VERIFIED | This reconciliation changed README/status/gates/security/readiness/infra/business docs and marked historical reports. | Keep updated. | REWRITE |
| `docs/QUALITY_GATE_REPORT.md` | Historical duplicate | Older docs/quality gate report. | Current Status | OUTDATED | Canonical and root `QUALITY_GATE_REPORT.md` supersede. | Mark historical. | MARK HISTORICAL |
| `docs/SECURITY_AUDIT_REPORT.md` | Historical duplicate | Older docs/security report. | Security | OUTDATED | Root security report and canonical supersede. | Mark historical. | MARK HISTORICAL |
| `docs/PRODUCTION_READINESS_REPORT.md` | Historical duplicate | Older docs/readiness report. | Production Readiness | OUTDATED | Root readiness report and canonical supersede. | Mark historical. | MARK HISTORICAL |
| `docs/INFRASTRUCTURE_REPORT.md` | Historical duplicate | Older docs/infra report. | Infra | OUTDATED | Root infra report and canonical supersede. | Mark historical. | MARK HISTORICAL |
| `reports/quality-gate/QUALITY_GATE_REPORT.md` | Historical generated report | Overall score 35/100 Prototype FAIL. | Current Status | OUTDATED | Generated report is historical; current build/lint/test improved but security/load/deployment still fail. | Keep historical; do not use as current dashboard. | MARK HISTORICAL |
| `ARCHITECTURE_REPORT.md` | Architecture | Source architecture mostly valid but historical. | Architecture | OUTDATED | Canonical source snapshot supersedes. | Mark historical; use canonical for current state. | MARK HISTORICAL |
| `PROJECT_STATUS_REPORT.md` | Status | Mixed current/historical status. | Current Status | OUTDATED | Canonical supersedes. | Mark historical. | MARK HISTORICAL |
| `CURRENT_INFRASTRUCTURE_REPORT.md` | Compose counts | Dev=15, infra=27. | Infra | INCORRECT | Parsed Compose counts 13/12. | Mark historical. | MARK HISTORICAL |
| `CURRENT_DEPENDENCY_REPORT.md` | Audit count | 31 moderate findings. | Security | OUTDATED | Current audit found 33 vulnerabilities, 32 moderate, 1 high. | Mark historical. | MARK HISTORICAL |
| `README_AUDIT_REPORT.md` | README audit | Historical audit state. | Current Status | OUTDATED | Superseded by matrix/canonical. | Mark historical. | MARK HISTORICAL |

## Reconciliation counts

| Status | Count |
|---|---:|
| VERIFIED | 20 |
| OUTDATED | 13 |
| INCORRECT | 12 |
| ESTIMATED | 2 |
| NEEDS RE-RUN | 0 |
| PARTIAL | 5 |

Rows with `RE-VERIFY` action are active engineering reruns. Rows with `MARK HISTORICAL` remain available only as prior-audit context.
