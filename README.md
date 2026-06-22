# SpiceGarden

SpiceGarden is an npm-workspace monorepo for a full-stack food-delivery platform. It includes a NestJS backend, Next.js web apps, Expo/React Native mobile apps, shared TypeScript packages, Docker Compose files, Kubernetes manifests, observability configs, validation scripts, and k6 load-test assets.

This README is a concise executive overview. The authoritative current-state report is `docs/CANONICAL_PROJECT_STATE_2026-06-22.md`.

---

## Current Status

**Production readiness:** 42% estimated
**Implementation completeness:** 82% estimated
**Commercial demo readiness:** 62% estimated

SpiceGarden is a broad, buildable, testable, and locally runnable technical platform. It is **not production-ready**. The strongest current evidence is backend build/test/runtime, passing local security/penetration scripts, and reduced smoke load. The strongest blockers are failing coverage thresholds, dependency audit findings, unavailable Docker/Kubernetes runtime validation, incomplete full load validation, and missing production provider secrets.

---

## Verification Snapshot

| Check | Status | Evidence |
|---|---|---|
| Build all workspaces | Implemented & verified | `npm run build` passed. |
| Lint all workspaces | Implemented & verified | `npm run lint` passed. |
| Root unit tests | Implemented & verified | `npm run test:unit` passed with 134 tests. |
| Backend full tests | Implemented & verified | `cd apps/backend && npm test` passed with 320 passed, 1 skipped. |
| Backend coverage | Broken / failing | Statements 59.78%, branches 34.09%, functions 34.73%, lines 59.02% against 80% targets. |
| Backend `/health` | Implemented & verified | `curl http://localhost:3001/health` returned HTTP 200. |
| Backend `/metrics` | Implemented & verified | `curl http://localhost:3001/metrics` returned HTTP 200 with Prometheus text. |
| CORS | Implemented & verified | OPTIONS preflight to `/auth/login` returned HTTP 204 and expected allow headers. |
| Dangerous method blocking | Implemented & verified | `TRACE /health` returned HTTP 405. |
| Runtime security | Implemented & verified | `node infra/scripts/security-tests.js` found 0 vulnerabilities. |
| Penetration | Implemented & verified | `node infra/scripts/penetration-tests.js` found 0 issues. |
| Reduced smoke load | Implemented & verified | 5-VU k6 smoke passed: 213/213 checks, p95 797.07ms. |
| Default smoke load | Broken / failing | 50-VU smoke failed p95 latency: 6.3s vs target <1500ms. |
| Docker Compose config | Implemented but runtime-unverified | `docker-compose -f compose.dev.yaml config` passed; 13 services. |
| Infra Compose config | Implemented but runtime-unverified | `docker-compose -f compose.infra.yaml config` passed; 12 services. |
| Docker runtime | Blocked from validation | `docker info` could not connect to the Docker daemon. |
| Kubernetes validation | Blocked from validation | `kubectl apply --dry-run=client -f infra/k8s/production-hardened.yaml` failed because no cluster API is reachable. |
| Dependency audit | Broken / failing | `npm audit --audit-level=moderate` reported 33 vulnerabilities: 32 moderate, 1 high. |
| Secret validation | Blocked from validation | `node infra/scripts/validate-secrets.js` found 3/16 valid secrets and 13 warnings. |
| gRPC transport | Stubbed / placeholder | `packages/grpc-transport/src/index.ts` throws `GrpcTransportUnavailableError`. |

---

## Monorepo Layout

```text
spicegarden/
├─ apps/
│├─ backend/ # NestJS API, port 3001
│├─ customer-web/# Next.js customer storefront
│├─ restaurant-dashboard/# Next.js restaurant dashboard
│├─ super-admin/ # Next.js admin dashboard
│├─ customer-mobile/ # Expo/React Native customer app
│├─ delivery-partner/# Expo/React Native delivery partner app
│└─ launcher/# Electron launcher
├─ packages/
│├─ ui/# React UI components
│├─ shared/# shared TypeScript utilities
│├─ api-types/ # API contract types
│├─ proto/ # protobuf type definitions
│└─ grpc-transport/# quarantined gRPC transport stub
├─ infra/
│├─ k8s/ # Kubernetes manifests
│├─ prometheus/# Prometheus config/rules
│├─ grafana/ # Grafana provisioning/dashboards
│├─ alertmanager/# Alertmanager config
│└─ scripts/ # validation/security/load scripts
└─ docs/# audit and reconciliation reports
```

---

## Required Status Definitions

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

## Application and Package Inventory

| Area | Path | Status | Notes |
|---|---|---|---|
| Backend API | `apps/backend` | Implemented & verified for local runtime | 320 backend tests pass; `/health` and `/metrics` verified. |
| Customer web | `apps/customer-web` | Implemented but runtime-unverified | 24 page/API files. |
| Restaurant dashboard | `apps/restaurant-dashboard` | Implemented but runtime-unverified | 11 page/API files. |
| Super admin | `apps/super-admin` | Implemented but runtime-unverified | 15 page/API files. |
| Customer mobile | `apps/customer-mobile` | Implemented but runtime-unverified | 15 screens; no device/native validation. |
| Delivery partner | `apps/delivery-partner` | Implemented but runtime-unverified | Uses real `expo-location`; no device validation. |
| Launcher | `apps/launcher` | Implemented but runtime-unverified | Electron workspace present. |
| UI/shared packages | `packages/ui`, `packages/shared` | Implemented & verified for workspace gates | Build/lint/test evidence exists. |
| API/proto packages | `packages/api-types`, `packages/proto` | Implemented but runtime-unverified | Type contract packages. |
| gRPC transport | `packages/grpc-transport` | Stubbed / placeholder | Quarantined; REST/WebSocket is the production path. |

Backend static inventory from source inspection:

| Count | Evidence |
|---:|---|
| 41 controller files | `apps/backend/src/**/*controller.ts` |
| 65 entity files | `apps/backend/src/db/entities/*.ts` |
| 77 service files | `apps/backend/src/**/*.service.ts` |
| 54 module files | `apps/backend/src/**/*.module.ts` |
| 265 route decorators | `apps/backend/src/**/*.{ts,tsx}` |
| 19 load-test scripts | `apps/backend/test/load/*.js` |

---

## Capability Snapshot

| Capability | Status | Evidence |
|---|---|---|
| Authentication | Implemented & verified | Auth module/service/controller present; backend runtime and security tests passed. |
| RBAC | Implemented but runtime-unverified | `apps/backend/src/security/roles.guard.ts`; endpoint coverage not fully audited. |
| Restaurant catalog | Implemented & verified | Backend services/controllers/entities present; reduced smoke browsed restaurants. |
| Order lifecycle | Implemented & verified | `apps/backend/src/services/order/order.service.ts`; backend tests pass. |
| Payment integration | Partial / scaffolded | Payment code/tests exist; no live Stripe/Razorpay validation. |
| Refund flow | Implemented & verified | Refund service/controller/entity present; backend tests pass. |
| Wallet system | Implemented & verified | Wallet service/entity present; tests pass. |
| Delivery assignment | Implemented but runtime-unverified | Delivery and driver-assignment modules present. |
| Live order tracking | Implemented but runtime-unverified | Backend tracking modules and mobile WebSocket service exist. |
| Notifications | Partial / scaffolded | Notification code exists; no live provider validation. |
| Admin analytics | Implemented but runtime-unverified | Analytics module/controller and super-admin pages exist. |
| GST/tax logic | Implemented but runtime-unverified | GST service/controller/entity present. |
| Compliance | Partial / scaffolded | Compliance modules/entities exist; no external compliance validation. |
| Audit logging | Implemented but runtime-unverified | Audit module/service/entity present. |
| Observability | Implemented but runtime-unverified | Backend metrics verified; Prometheus/Grafana/Alertmanager stack runtime blocked. |
| Background jobs/queues | Implemented but runtime-unverified | Queue module/processor present; Redis runtime blocked. |
| Docker Compose | Implemented but runtime-unverified | Config renders; stack startup blocked by Docker daemon. |
| Kubernetes | Implemented but runtime-unverified | Manifests exist; cluster validation blocked. |

---

## Test, Security, and Load Summary

### Tests

| Scope | Result |
|---|---|
| `npm run lint` | Passed |
| `npm run build` | Passed |
| `npm run test:unit` | Passed with 134 tests |
| `npm run test:integration` | Passed |
| `npm run test:e2e` | Passed |
| `npm run test:all` | Passed |
| `cd apps/backend && npm test` | Passed with 320 passed, 1 skipped |
| `cd apps/backend && npm run test:cov` | Failed coverage thresholds |

### Security

| Check | Result |
|---|---|
| `node infra/scripts/security-tests.js` | Passed with 0 vulnerabilities |
| `node infra/scripts/penetration-tests.js` | Passed with 0 issues |
| `npm audit --audit-level=moderate` | Failed: 33 vulnerabilities, including 1 high |

### Load

| Check | Result |
|---|---|
| Reduced 5-VU smoke | Passed: 213/213 checks, p95 797.07ms |
| Default 50-VU smoke | Failed latency threshold: p95 6.3s vs <1500ms |
| Full 10k/20k load | Not completed as production evidence |

---

## Infrastructure Summary

### Compose

| Compose file | Config status | Runtime status |
|---|---|---|
| `compose.dev.yaml` | Passed; 13 services | Blocked from validation because Docker daemon is unavailable |
| `compose.infra.yaml` | Passed; 12 services | Blocked from validation because Docker daemon is unavailable |

### Kubernetes

| Check | Result |
|---|---|
| Manifest evidence | `infra/k8s/production-hardened.yaml` includes 3 replicas, `/health` probes, security context, resources, PDB, and HPA. |
| Server validation | Blocked from validation; no reachable cluster API. |
| Deployment script | Failed with `ERROR: Cannot connect to cluster`. |

### Observability

| Component | Status |
|---|---|
| Backend metrics | Implemented & verified |
| Prometheus target | Implemented but runtime-unverified |
| Grafana provisioning | Implemented but runtime-unverified |
| Alertmanager | Implemented but runtime-unverified |
| OpenSearch/Filebeat | Blocked from validation due Docker daemon |

---

## Known Blockers

### P0

1. Backend coverage below 80% thresholds.
2. `npm audit --audit-level=moderate` reports 33 vulnerabilities, including 1 high.
3. Docker daemon unavailable; compose stack startup not validated.
4. Kubernetes cluster unavailable; manifests not server-validated.
5. Full load validation incomplete; default smoke p95 failed.
6. Production provider secrets incomplete.

### P1

1. Live payment gateway validation.
2. Live notification provider validation.
3. Mobile native/device validation.
4. Full WebSocket tracking validation.
5. RBAC endpoint coverage audit.

### P2

1. Full observability stack runtime validation.
2. Sentry runtime validation.
3. Mobile native builds in CI.
4. Historical documentation cleanup beyond the new canonical suite.

---

## Developer Commands

```bash
npm run build
npm run lint
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:all

cd apps/backend && npm test
cd apps/backend && npm run test:cov
cd apps/backend && npm run dev
```

Runtime validation commands used in this audit:

```bash
curl.exe -sS -i --max-time 10 http://localhost:3001/health
curl.exe -sS -i --max-time 10 http://localhost:3001/metrics
curl.exe -sS -i --max-time 10 -X OPTIONS http://localhost:3001/auth/login -H 'Origin: http://localhost:3002' -H 'Access-Control-Request-Method: POST'
curl.exe -sS -i --max-time 10 -X TRACE http://localhost:3001/health

node infra/scripts/security-tests.js
node infra/scripts/penetration-tests.js
node infra/scripts/validate-env-consistency.js
node infra/scripts/validate-secrets.js

docker-compose -f compose.dev.yaml config
docker-compose -f compose.infra.yaml config
kubectl apply --dry-run=client -f infra/k8s/production-hardened.yaml
npm audit --audit-level=moderate
```

---

## Documentation Map

| File | Purpose |
|---|---|
| `docs/CANONICAL_PROJECT_STATE_2026-06-22.md` | Authoritative current-state baseline. |
| `docs/DOCUMENTATION_RECONCILIATION_MATRIX.md` | Reconciles historical documentation claims. |
| `docs/PRODUCTION_READINESS_GAP_REPORT.md` | Readiness scores, blockers, and path to 80%+. |
| `docs/TEST_QUALITY_AUDIT.md` | Test, coverage, security, and load-test audit. |
| `docs/RUNTIME_INFRA_VALIDATION.md` | Backend runtime and infrastructure validation. |
| `docs/FEATURE_CAPABILITY_MATRIX.md` | Capability-by-capability status matrix. |
| `docs/STUBBED_COMPONENTS_STATUS.md` | Stubbed/quarantined component documentation. |
| `docs/production-readiness/PHASE_5_SECURITY_LOAD_REPORT.md` | Historical phase-5 security/load evidence. |

---

## Final Verdict

SpiceGarden is a broad technical platform with meaningful backend, web, mobile, infra, and test assets. The current safe positioning is **local demo candidate, not production-ready**. Production readiness is blocked by coverage, dependency audit, Docker/Kubernetes runtime validation, full load validation, and production provider readiness gaps.
