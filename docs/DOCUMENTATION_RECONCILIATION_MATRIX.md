# Documentation Reconciliation Matrix

**Generated:** 2026-06-22
**Canonical source:** `docs/CANONICAL_PROJECT_STATE_2026-06-22.md`
**Purpose:** Reconcile important documentation claims against current repository evidence, command output, and source/config inspection.

Allowed values:

- Current Status: VERIFIED, OUTDATED, INCORRECT, ESTIMATED, NEEDS RE-RUN, PARTIAL, SUPERSEDED
- Action: KEEP, REWRITE, REMOVE, MARK HISTORICAL, SUPERSEDE, RE-VERIFY

| Document | Section | Claim | Claim Type | Current Status | Evidence Source | Replacement / Canonical Wording | Action |
|---|---|---|---|---|---|---|---|
| `docs/CANONICAL_PROJECT_STATE_2026-06-20.md` | Current canonical baseline | Current source-of-truth baseline. | Current Status | SUPERSEDED | New `docs/CANONICAL_PROJECT_STATE_2026-06-22.md`. | Use 2026-06-22 canonical for current state. | SUPERSEDE |
| `README.md` | Current status | Production readiness 38%, backend tests 304/320, runtime security blocked. | Current Status | OUTDATED | Current backend full suite 320 passed, 1 skipped; security/penetration pass in normal mode; reduced smoke pass; Docker/K8s blocked. | Production readiness 42% estimated; not production-ready. | REWRITE |
| `README.md` | Test totals | Total verified tests 437/470. | Tests | INCORRECT | Root unit gate 134; backend full suite 320 passed, 1 skipped; do not aggregate unrelated scopes. | State scopes separately. | REWRITE |
| `README.md` | Coverage | 51.72% statements, 20.11% branches, 24.76% functions, 50.65% lines. | Coverage | OUTDATED | Current backend coverage 59.78% statements, 34.09% branches, 34.73% functions, 59.02% lines. | Coverage gate still fails. | REWRITE |
| `README.md` | Runtime security | Blocked because backend unavailable. | Security | OUTDATED | `node infra/scripts/security-tests.js` passed with 0 vulnerabilities in normal backend mode. | Runtime security passed locally; load-mode caveat applies. | REWRITE |
| `README.md` | Load testing | Blocked only. | Load Testing | PARTIAL | Reduced 5-VU smoke passed; default 50-VU smoke failed p95; full 10k/20k not completed. | Load validation is mixed: reduced smoke pass, default/full not production-ready. | REWRITE |
| `README.md` | Compose counts | Dev 15 services, infra 27 services. | Infra | INCORRECT | `docker-compose -f compose.dev.yaml config` renders 13; `docker-compose -f compose.infra.yaml config` renders 12. | Dev=13, infra=12. | REWRITE |
| `README.md` | gRPC transport | Empty `export {};`. | Stubbed | OUTDATED | `packages/grpc-transport/src/index.ts:1-16` throws `GrpcTransportUnavailableError` and reports `supported: false`. | gRPC transport is quarantined/stubbed. | REWRITE |
| `README.md` | Mobile geolocation | Stubbed/mocked. | Mobile | OUTDATED | `apps/delivery-partner/src/services/location.service.ts:1-60` uses real `expo-location`. | Delivery location code is real; device runtime unvalidated. | REWRITE |
| `docs/DOCUMENTATION_RECONCILIATION_MATRIX.md` | Current canonical source | Points to 2026-06-20. | Documentation | OUTDATED | New 2026-06-22 canonical. | Point to 2026-06-22. | SUPERSEDE |
| `docs/TEST_AND_COVERAGE_PROGRESS.md` | Backend tests | 304 passed, 1 skipped. | Tests | OUTDATED | Current backend full suite 320 passed, 1 skipped. | Update to 320 passed, 1 skipped. | REWRITE |
| `docs/TEST_AND_COVERAGE_PROGRESS.md` | Coverage | Branches 32.84%/34.36%. | Coverage | OUTDATED | Current branches 34.09%. | Use 34.09% as current. | REWRITE |
| `docs/PRODUCTION_READINESS_REPORT.md` | Readiness | 38% or 45% production readiness. | Production Readiness | OUTDATED | Current estimated production readiness 42%. | Use 42% estimated; not production-ready. | REWRITE |
| `docs/SPICEGARDEN_PRODUCTION_READINESS_REPORT.md` | Runtime validation | Backend startup blocked by disk space. | Runtime | OUTDATED | Backend started with `npm run dev` and `/health` returned 200. | Local backend runtime verified; Docker runtime blocked. | REWRITE |
| `docs/RUNTIME_VALIDATION_REPORT.md` | Runtime | Backend startup blocked. | Runtime | OUTDATED | Backend startup and endpoints verified locally. | Replace with current runtime/infra report. | REWRITE |
| `docs/INFRA_VALIDATION_REPORT.md` | Runtime validation | Disk space blocks backend/dist. | Infra | PARTIAL | Backend can run locally; Docker daemon still blocks compose runtime. | Keep infra runtime blocked; update backend runtime evidence. | REWRITE |
| `docs/STUBBED_COMPONENTS_STATUS.md` | gRPC transport | Quarantined. | Stubbed | VERIFIED | `packages/grpc-transport/src/index.ts:1-16`. | Keep. | KEEP |
| `docs/STUBBED_COMPONENTS_STATUS.md` | Mobile geolocation | Real `expo-location`. | Mobile | VERIFIED | `apps/delivery-partner/src/services/location.service.ts:1-60`. | Keep with runtime-unverified caveat. | KEEP |
| `docs/production-readiness/PHASE_5_SECURITY_LOAD_REPORT.md` | Security/load | Security pass, reduced smoke pass, default smoke fail. | Security/Load | PARTIAL | Current security pass 0 vulnerabilities; reduced smoke pass 213/213; default smoke p95 6.3s fail. | Keep as historical phase evidence; current canonical supersedes. | MARK HISTORICAL |
| `docs/production-readiness/PHASE_4_COVERAGE_REPORT.md` | Coverage | 320 tests, coverage failed. | Tests/Coverage | PARTIAL | Backend tests 320 passed, 1 skipped; coverage failed. Branch metric should use current 34.09%. | Keep historical phase evidence; update exact branch metric. | MARK HISTORICAL |
| `docs/LOAD_AND_PERFORMANCE_REPORT.md` | Load tests | Blocked on backend. | Load Testing | OUTDATED | Backend is running locally; reduced smoke passes but default/full load remain not production-ready. | Replace with mixed load status. | REWRITE |
| `docs/SECURITY_AUDIT_REPORT.md` | Security tests | Blocked. | Security | OUTDATED | Security/penetration scripts passed in normal backend mode. | Replace with current runtime security evidence. | REWRITE |
| `docs/PROJECT_SUMMARY.md` | Production ready | Claims production readiness or inflated maturity. | Production Readiness | INCORRECT | Coverage, audit, Docker/K8s, full load, and provider secrets remain blockers. | Not production-ready. | MARK HISTORICAL |
| `docs/QUALITY_GATE_REPORT.md` | Quality gates | Older scores/totals. | Quality Gates | OUTDATED | Current canonical scores and test counts. | Superseded by 2026-06-22 docs. | MARK HISTORICAL |
| `docs/INFRASTRUCTURE_REPORT.md` | Compose counts | Dev=15, infra=27. | Infra | INCORRECT | Compose config renders 13 and 12 services. | Replace counts. | REWRITE |
| `docs/SECURITY_AUDIT_REPORT.md` | npm audit | Historical audit. | Security | OUTDATED | Current `npm audit --audit-level=moderate`: 33 vulnerabilities, 1 high. | Use current audit result. | REWRITE |
| `.github/workflows/ci-cd.yml` | Load test quick check | Runs load test or echoes skip. | CI/CD | VERIFIED | `.github/workflows/ci-cd.yml:60-67`. | Keep but note not executed here. | KEEP |
| `apps/backend/src/main.ts` | Rate limit mode | `LOAD_TEST_MODE=true` bypasses dev rate limiters. | Security | VERIFIED | `apps/backend/src/main.ts:136-144`. | Keep and document caveat. | KEEP |
| `apps/backend/src/main.ts` | Security controls | Production secret validation, CORS, Helmet, HPP, Mongo sanitize, CSRF, rate limiters, method blocking. | Security | VERIFIED | `apps/backend/src/main.ts:57-246`. | Keep. | KEEP |
| `apps/backend/src/app.module.ts` | Module registry | Imports core domain modules. | Architecture | VERIFIED | `apps/backend/src/app.module.ts:36-71`. | Keep. | KEEP |
| `packages/grpc-transport/src/index.ts` | gRPC status | Quarantined and unsupported. | Stubbed | VERIFIED | `packages/grpc-transport/src/index.ts:1-16`. | Keep. | KEEP |
| `compose.dev.yaml` | Dev compose | 13 rendered services. | Infra | VERIFIED | `docker-compose -f compose.dev.yaml config`. | Keep. | KEEP |
| `compose.infra.yaml` | Infra compose | 12 rendered services. | Infra | VERIFIED | `docker-compose -f compose.infra.yaml config`. | Keep. | KEEP |
| `infra/prometheus/prometheus.dev.yml` | Prometheus target | Targets `host.docker.internal:3001`. | Observability | VERIFIED | `infra/prometheus/prometheus.dev.yml:8-13`. | Keep. | KEEP |
| `infra/grafana/provisioning/dashboards/provider.yml` | Dashboard path | Uses `/etc/grafana/dashboards`. | Observability | VERIFIED | Provider path matches compose mount. | Keep. | KEEP |
| `infra/k8s/production-hardened.yaml` | K8s static manifest | 3 replicas, probes, security context, HPA. | Infra | VERIFIED | `infra/k8s/production-hardened.yaml:1-180`. | Keep but runtime-unverified. | KEEP |
| `node infra/scripts/validate-env-consistency.js` | Env consistency | All environment configurations valid. | Infra | VERIFIED | Command output: `All environment configurations are valid`. | Keep. | KEEP |
| `node infra/scripts/validate-secrets.js` | Secrets | 3/16 valid, 13 warnings. | Security | VERIFIED | Command output. | Keep with production provider caveat. | KEEP |
| `docker info` | Docker daemon | Client available, server unavailable. | Infra | VERIFIED | Docker output failed to connect to daemon. | Keep. | KEEP |
| `kubectl apply --dry-run=client` | K8s cluster | No cluster API reachable. | Infra | VERIFIED | kubectl error connecting to `localhost:8080`. | Keep. | KEEP |
| `npm audit --audit-level=moderate` | Dependencies | 33 vulnerabilities, 1 high. | Security | VERIFIED | Audit output. | Keep. | KEEP |

## Reconciliation counts

| Status | Count |
|---|---:|
| VERIFIED | 17 |
| OUTDATED | 13 |
| INCORRECT | 4 |
| ESTIMATED | 0 |
| NEEDS RE-RUN | 0 |
| PARTIAL | 4 |
| SUPERSEDED | 2 |

Rows with `REWRITE`, `SUPERSEDE`, or `MARK HISTORICAL` are documentation actions. No source, test, infra, or existing doc files were deleted.
