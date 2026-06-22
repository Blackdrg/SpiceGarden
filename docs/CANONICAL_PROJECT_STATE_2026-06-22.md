# SpiceGarden Canonical Project State — 2026-06-22

**Canonical status:** Current source-of-truth documentation baseline
**Generated:** 2026-06-22
**Scope:** Repository documentation reconciliation, source/config inspection, and command execution in `C:\Users\mehta\Desktop\SpiceGarden`.

This file supersedes `docs/CANONICAL_PROJECT_STATE_2026-06-20.md` and the older production-readiness reports. Historical docs remain available only as prior-audit context.

---

## 1. Executive Summary

SpiceGarden is an npm-workspace monorepo implementing a full-stack food-delivery platform. It contains a NestJS backend, Next.js web apps, Expo/React Native mobile apps, shared TypeScript packages, Docker Compose files, Kubernetes manifests, observability configs, validation scripts, and k6 load-test assets.

Current verified position:

- **Build/lint/test gates:** Passed for the verified workspace commands.
- `npm run lint` passed.
- `npm run build` passed.
- `npm run test:unit` passed with 134 root unit tests.
- `npm run test:integration`, `npm run test:e2e`, and `npm run test:all` passed.
- **Backend tests:** `cd apps/backend && npm test` passed with 320 passed, 1 skipped.
- **Backend coverage:** Fails configured 80% thresholds.
- Statements: 59.78%
- Branches: 34.09%
- Functions: 34.73%
- Lines: 59.02%
- **Backend runtime:** Local backend runtime was verified in dev/SQLite-local mode.
- `GET /health` returned 200.
- `GET /metrics` returned 200 with Prometheus text.
- CORS preflight to `http://localhost:3001/auth/login` with `Origin: http://localhost:3002` returned 204 and expected allow headers.
- `TRACE /health` returned 405 with `Method TRACE not allowed`.
- **Runtime security:** Passed when backend was running normally.
- `node infra/scripts/security-tests.js`: 0 vulnerabilities, 96/100 rate-limited responses.
- `node infra/scripts/penetration-tests.js`: 0 issues.
- **Load testing:**
- Default 50-VU smoke run failed the p95 latency threshold: p95 6.3s vs target <1500ms, although checks succeeded.
- Reduced 5-VU smoke run passed: 213/213 checks, p95 797.07ms, 0% failed requests.
- Full 10k/20k production load validation was not completed.
- **Infrastructure:** Config validated, not runtime validated.
- `docker-compose -f compose.dev.yaml config` passed; dev compose renders 13 services.
- `docker-compose -f compose.infra.yaml config` passed; infra compose renders 12 services.
- Docker daemon is unavailable, so stack startup was blocked.
- `kubectl apply --dry-run=client -f infra/k8s/production-hardened.yaml` failed because no cluster API is reachable.
- `node infra/scripts/deployment-check.js` failed with `ERROR: Cannot connect to cluster`.
- **Dependency/security posture:** Not production-clean.
- `npm audit --audit-level=moderate` reported 33 vulnerabilities: 32 moderate, 1 high.
- `node infra/scripts/validate-secrets.js` found 3/16 valid secrets and 13 warnings.

**Estimated scores, not engineering facts:**

| Metric | Score | Basis |
|---|---:|---|
| Implementation completeness | 82% | Broad code coverage across backend, web, mobile, infra, tests, and docs. |
| Commercial demo readiness | 62% | Build/test/backend runtime and reduced smoke pass; live payment/notification/mobile/native flows unvalidated. |
| Production readiness | 42% | Coverage, dependency audit, Docker/Kubernetes runtime, full load, and provider integrations remain blockers. |

---

## 2. Required Status Definitions

Use these exact status labels when describing SpiceGarden capabilities:

| Status | Meaning |
|---|---|
| Implemented & verified | Code is present and command/runtime/test evidence validates the claim. |
| Implemented but runtime-unverified | Code exists and may build/test, but no runtime validation was completed. |
| Partial / scaffolded | Code exists but is incomplete, placeholder-like, or only partially functional. |
| Stubbed / placeholder | Intentional stub, quarantine, mock, or placeholder module. |
| Broken / failing | A command, gate, or threshold failed in current validation. |
| Blocked from validation | The claim cannot be validated because required external/runtime dependency is unavailable. |
| Not implemented | The capability is absent, not just unvalidated. |

---

## 3. Repository Inventory

### 3.1 Applications and packages

| Area | Path | Evidence | Status |
|---|---|---|---|
| Backend API | `apps/backend` | NestJS app module imports auth, orders, payments, restaurant, delivery, notifications, wallet, GST, finance, support, refund, analytics, audit, compliance, and tracking modules. | Implemented & verified for build/test/local runtime; Docker runtime Blocked from validation. |
| Customer web | `apps/customer-web` | 24 page/API files under `apps/customer-web/src/pages`. | Implemented but runtime-unverified for live backend flows. |
| Restaurant dashboard | `apps/restaurant-dashboard` | 11 page/API files under `apps/restaurant-dashboard/src/pages`. | Implemented but runtime-unverified. |
| Super admin | `apps/super-admin` | 15 page/API files under `apps/super-admin/src/pages`. | Implemented but runtime-unverified. |
| Customer mobile | `apps/customer-mobile` | 15 screens plus WebSocket/order services. | Implemented but runtime-unverified for native/device flows. |
| Delivery partner | `apps/delivery-partner` | Uses `expo-location` in `apps/delivery-partner/src/services/location.service.ts:1-60`; `apps/delivery-partner/App.tsx` has pre-existing uncommitted changes. | Implemented but runtime-unverified on device/emulator. |
| Launcher | `apps/launcher` | Electron workspace present and build previously passed. | Implemented but runtime-unverified. |
| Shared UI | `packages/ui` | Workspace present; tests/build previously passed. | Implemented & verified for workspace gates. |
| Shared utils | `packages/shared` | Workspace present; tests/build previously passed. | Implemented & verified for workspace gates. |
| API types | `packages/api-types` | Workspace present. | Implemented but runtime-unverified. |
| Proto | `packages/proto` | Workspace present. | Implemented but runtime-unverified. |
| gRPC transport | `packages/grpc-transport` | `packages/grpc-transport/src/index.ts:1-16` throws `GrpcTransportUnavailableError` and reports `supported: false`. | Stubbed / placeholder. |

### 3.2 Backend static inventory

| Count | Evidence |
|---:|---|
| 41 controller files | Inventory command over `apps/backend/src/**/*controller.ts`. |
| 65 entity files | Inventory command over `apps/backend/src/db/entities/*.ts`. |
| 77 service files | Inventory command over `apps/backend/src/**/*.service.ts`. |
| 54 module files | Inventory command over `apps/backend/src/**/*.module.ts`. |
| 265 route decorators | Inventory command over `apps/backend/src/**/*.{ts,tsx}`. |
| 19 load-test scripts | Inventory command over `apps/backend/test/load/*.js`. |

---

## 4. Build, Lint, and Test Evidence

### 4.1 Workspace gates

| Command | Result | Notes |
|---|---|---|
| `npm run lint` | Passed | All workspaces. |
| `npm run build` | Passed | All workspaces. |
| `npm run test:unit` | Passed | 134 root unit tests. |
| `npm run test:integration` | Passed | Workspace integration suites. |
| `npm run test:e2e` | Passed | Workspace e2e-style suites; not live product-flow validation. |
| `npm run test:all` | Passed | Workspace aggregate test command. |

### 4.2 Backend tests and coverage

| Command | Result | Notes |
|---|---|---|
| `cd apps/backend && npm test` | Passed | 320 passed, 1 skipped. |
| `cd apps/backend && npm run test:cov` | Tests passed; coverage gate failed | Statements 59.78%, branches 34.09%, functions 34.73%, lines 59.02%. |
| `cd apps/backend && npm run test:load` | Failed | Rate limit response `429 Too many requests` in earlier run. |
| `cd apps/backend && k6 run test/load/smoke-test.js` | Failed threshold | p95 latency 6.3s vs `<1500ms`; checks succeeded. |
| `cd apps/backend && TARGET_VUS=5 STAGE_DURATION=30s P95_LIMIT_MS=10000 k6 run test/load/smoke-test.js` with `LOAD_TEST_MODE=true` | Passed reduced smoke | 213/213 checks, 0% failed requests, p95 797.07ms. |

---

## 5. Runtime Backend Evidence

| Check | Command | Result | Status |
|---|---|---|---|
| Backend startup | `cd apps/backend && npm run dev` | `Nest application successfully started` | Implemented & verified |
| Health endpoint | `curl.exe -sS -i --max-time 10 http://localhost:3001/health` | HTTP 200, `{"status":"ok",...}` | Implemented & verified |
| Metrics endpoint | `curl.exe -sS -i --max-time 10 http://localhost:3001/metrics` | HTTP 200, Prometheus text beginning with `process_cpu_user_seconds_total` | Implemented & verified |
| CORS preflight | `curl.exe -X OPTIONS http://localhost:3001/auth/login -H 'Origin: http://localhost:3002' -H 'Access-Control-Request-Method: POST'` | HTTP 204, `Access-Control-Allow-Origin: http://localhost:3002` | Implemented & verified |
| Dangerous method blocking | `curl.exe -X TRACE http://localhost:3001/health` | HTTP 405, `{"message":"Method TRACE not allowed","error":"Method Not Allowed"}` | Implemented & verified |
| Runtime security script | `node infra/scripts/security-tests.js` | 0 vulnerabilities, 96/100 rate-limited responses | Implemented & verified in normal backend mode |
| Penetration script | `node infra/scripts/penetration-tests.js` | 0 issues | Implemented & verified |
| Runtime security script in load mode | Backend started with `LOAD_TEST_MODE=true` then `node infra/scripts/security-tests.js` | 100 vulnerabilities due disabled rate limiters | Broken / failing for that mode |

Important distinction: `LOAD_TEST_MODE=true` intentionally bypasses dev rate limiters in `apps/backend/src/main.ts:136-144`. That mode is useful for smoke load tests but invalidates runtime rate-limit security validation.

---

## 6. Infrastructure Evidence

### 6.1 Compose configuration

| Command | Result | Notes |
|---|---|---|
| `docker-compose -f compose.dev.yaml config` | Passed | Renders 13 services. Warnings for unset optional secrets. |
| `docker-compose -f compose.infra.yaml config` | Passed | Renders 12 services. Warning for unset `SENTRY_DSN`. |

`compose.dev.yaml:1-119` defines core services including postgres, redis, mongo, prometheus, grafana, opensearch, opensearch-dashboards, alertmanager, and backend. `compose.infra.yaml:1-120` defines the backend plus observability/Sentry/Filebeat services.

### 6.2 Docker runtime

| Check | Command | Result | Status |
|---|---|---|---|
| Docker daemon | `docker info` | Client available; server connection failed to `npipe:////./pipe/dockerDesktopLinuxEngine` | Blocked from validation |
| Compose stack startup | `docker-compose -f compose.dev.yaml up -d` | Not run because daemon unavailable | Blocked from validation |
| Infra stack startup | `docker-compose -f compose.infra.yaml up -d` | Not run because daemon unavailable | Blocked from validation |

### 6.3 Kubernetes and deployment validation

| Check | Command | Result | Status |
|---|---|---|---|
| K8s manifest server validation | `kubectl apply --dry-run=client -f infra/k8s/production-hardened.yaml` | Failed: no API reachable at `localhost:8080` | Blocked from validation |
| Deployment script | `node infra/scripts/deployment-check.js` | `ERROR: Cannot connect to cluster` | Blocked from validation |
| Manifest static evidence | `infra/k8s/production-hardened.yaml:1-180` | 3 replicas, security context, `/health` probes, resources, PDB, HPA | Implemented but runtime-unverified |

### 6.4 Observability configuration

| Component | Evidence | Status |
|---|---|---|
| Prometheus | `infra/prometheus/prometheus.dev.yml:8-13` targets `host.docker.internal:3001` at `/metrics`. | Implemented but runtime-unverified |
| Grafana dashboard provisioning | `infra/grafana/provisioning/dashboards/provider.yml:1-11` points to `/etc/grafana/dashboards`, matching compose mount. | Implemented but runtime-unverified |
| Grafana datasources | `infra/grafana/provisioning/datasources/datasources.yml` present. | Implemented but runtime-unverified |
| Alertmanager | `infra/alertmanager/alertmanager.yml:1-33` defines Slack/PagerDuty receivers. | Implemented but runtime-unverified |
| OpenSearch/Filebeat | Compose and config present. | Blocked from validation due Docker daemon unavailable |

---

## 7. Security and Dependency Evidence

| Check | Command | Result | Status |
|---|---|---|---|
| Runtime security | `node infra/scripts/security-tests.js` | 0 vulnerabilities | Implemented & verified |
| Penetration | `node infra/scripts/penetration-tests.js` | 0 issues | Implemented & verified |
| Dependency audit | `npm audit --audit-level=moderate` | 33 vulnerabilities: 32 moderate, 1 high | Broken / failing |
| Env consistency | `node infra/scripts/validate-env-consistency.js` | `All environment configurations are valid` | Implemented & verified |
| Secret validation | `node infra/scripts/validate-secrets.js` | 3/16 valid, 13 warnings | Blocked from validation for production provider readiness |

Security controls are implemented in code, including production secret validation, CORS allow-list, Helmet, HPP, Mongo sanitization, CSRF, rate limiting, and dangerous method blocking in `apps/backend/src/main.ts:57-246`.

---

## 8. Feature and Capability Position

| Capability | Status | Evidence | Notes |
|---|---|---|---|
| Authentication | Implemented & verified | `apps/backend/src/services/auth/`; backend runtime and security tests passed. | Local runtime only. |
| RBAC | Implemented but runtime-unverified | `apps/backend/src/security/roles.guard.ts`; backend tests pass. | Endpoint coverage not fully audited. |
| Order lifecycle | Implemented & verified | `apps/backend/src/services/order/order.service.ts`; backend tests pass. | Local runtime only. |
| Payment integration | Partial / scaffolded | `apps/backend/src/services/payments/`; tests use mocks. | No live Stripe/Razorpay validation. |
| Refunds | Implemented & verified | `apps/backend/src/services/refund/`; backend tests pass. | Local runtime only. |
| Wallet | Implemented & verified | `apps/backend/src/services/wallet/wallet.service.ts`; tests pass. | Local runtime only. |
| Delivery assignment | Implemented but runtime-unverified | `apps/backend/src/services/delivery/`, `apps/backend/src/modules/driver-assignment/`. | No live multi-device runtime validation. |
| Live order tracking | Implemented but runtime-unverified | `apps/backend/src/infra/tracking/`, `apps/customer-mobile/src/services/websocket.service.ts`. | No live socket validation. |
| Notifications | Partial / scaffolded | `apps/backend/src/services/notifications/`. | No Twilio/FCM/SendGrid/APNS live validation. |
| Observability | Implemented but runtime-unverified | `apps/backend/src/main.ts:19-46`, Prometheus/Grafana/Alertmanager configs. | Stack runtime blocked by Docker daemon. |
| gRPC transport | Stubbed / placeholder | `packages/grpc-transport/src/index.ts:1-16`. | Quarantined; REST/WebSocket is documented path. |
| Mobile native runtime | Implemented but runtime-unverified | Expo/RN apps type-check/build; device flows not validated. | No native build/device validation. |
| Kubernetes deployment | Implemented but runtime-unverified | `infra/k8s/production-hardened.yaml:1-180`. | Cluster unavailable. |

---

## 9. Production Readiness Gaps

### P0 blockers

1. **Coverage gate failure:** Backend coverage remains below 80% thresholds.
2. **Dependency audit failure:** `npm audit --audit-level=moderate` reports 33 vulnerabilities, including 1 high.
3. **Docker runtime blocked:** Docker daemon unavailable; compose stack cannot be started in this environment.
4. **Kubernetes validation blocked:** No reachable cluster API.
5. **Full load validation incomplete:** Default smoke p95 failed and 10k/20k load was not completed.
6. **Production provider secrets missing:** Payment, notification, map, APNS, and Twilio secrets are incomplete or placeholder-like.

### P1 gaps

1. Live payment gateway validation.
2. Live notification provider validation.
3. Live mobile/device validation for customer and delivery apps.
4. Full WebSocket/order-tracking runtime validation across clients.
5. RBAC endpoint coverage audit.

### P2 gaps

1. Full observability stack runtime validation.
2. Sentry runtime validation.
3. Mobile Expo/native CI builds.
4. Full documentation cleanup of historical reports.

---

## 10. Documentation Map

| File | Purpose |
|---|---|
| `README.md` | Root executive overview and quick-start evidence. |
| `docs/CANONICAL_PROJECT_STATE_2026-06-22.md` | This canonical baseline. |
| `docs/DOCUMENTATION_RECONCILIATION_MATRIX.md` | Reconciles historical claims against current evidence. |
| `docs/PRODUCTION_READINESS_GAP_REPORT.md` | Readiness scores, blockers, and path to 80%+. |
| `docs/TEST_QUALITY_AUDIT.md` | Test, coverage, security, and load-test quality audit. |
| `docs/RUNTIME_INFRA_VALIDATION.md` | Backend runtime, compose, Docker, K8s, observability validation. |
| `docs/FEATURE_CAPABILITY_MATRIX.md` | Capability-by-capability status matrix. |
| `docs/STUBBED_COMPONENTS_STATUS.md` | Stubbed/quarantined component documentation. |
| `docs/production-readiness/PHASE_5_SECURITY_LOAD_REPORT.md` | Historical phase-5 security/load evidence. |

---

## 11. Final Verdict

SpiceGarden is a broad, buildable, testable, and locally runnable technical platform, but it is **not production-ready**. The strongest current evidence is backend build/test/runtime, passing local security/penetration scripts, and reduced smoke load. The strongest blockers are failing coverage thresholds, dependency audit findings, unavailable Docker/Kubernetes runtime validation, incomplete full load validation, and missing production provider secrets.

All claims in this document are either tied to command output, source/config paths, or explicitly marked as blocked/unknown.
