# Canonical Project State — 2026-06-23

**Canonical status:** Current source-of-truth documentation baseline  
**Generated:** 2026-06-23  
**Auditor:** Kilo (automated repo audit + documentation refresh)

This file is the authoritative technical state document for SpiceGarden. All claims are tied to command output, source/config paths, or explicitly marked as blocked/unverified.

---

## 1. Executive Summary

SpiceGarden is an npm-workspace monorepo for a full-stack food-delivery platform:

- **Backend:** NestJS API with 41 controllers, 65 entities, 77 services, 54 modules
- **Frontend:** Next.js apps (customer-web, restaurant-dashboard, super-admin)
- **Mobile:** Expo/React Native apps (customer-mobile, delivery-partner)
- **Infra:** Docker Compose (9 services), Kubernetes manifests, observability stack

### Verified Status (2026-06-23)

| Category | Status | Evidence |
| -------- | ------ | -------- |
| Lint | ✅ Passed | `npm run lint` — all 11 workspaces clean |
| Build | ✅ Passed | `npm run build` — all workspaces compiled |
| Root unit tests | ✅ 139 tests | `npm run test:unit` across 9 workspaces |
| Backend tests | ✅ 630 passed, 1 skipped | `apps/backend/test/*.spec.ts` (54 files) |
| Backend coverage | ❌ Fails gates | Statements 80.02%, Branches 63.05%, Functions 63.22%, Lines 79.82% |
| npm audit | ❌ 31 moderate | No high/critical, dev toolchain vulnerabilities |
| gRPC transport | Stubbed | `packages/grpc-transport` throws `GrpcTransportUnavailableError` |

---

## 2. Repository Inventory

### Applications and Packages

| Area | Path | Status | Evidence |
| ---- | ---- | ------ | -------- |
| Backend API | `apps/backend` | Implemented & verified for build/test | 41 controllers, 65 entities, 77 services, 54 modules |
| Customer web | `apps/customer-web` | Implemented but runtime-unverified | 19 pages (`src/pages/*.tsx`), builds pass |
| Restaurant dashboard | `apps/restaurant-dashboard` | Implemented but runtime-unverified | 2 pages, builds pass |
| Super admin | `apps/super-admin` | Implemented but runtime-unverified | 2 pages, builds pass |
| Customer mobile | `apps/customer-mobile` | Implemented but runtime-unverified | 21 TSX + 22 TS files, tests pass |
| Delivery partner | `apps/delivery-partner` | Implemented but runtime-unverified | Tests pass |
| Launcher | `apps/launcher` | Implemented but runtime-unverified | Electron build, 1 test |
| Driver app | `apps/driver-app` | Stubbed / placeholder | Only `App.js`/`App.tsx`, no package.json |
| UI package | `packages/ui` | Implemented & verified | 54 TSX files, 28 tests pass, builds pass |
| Shared package | `packages/shared` | Implemented & verified | 2 tests pass |
| API types | `packages/api-types` | Implemented but runtime-unverified | `tsc --noEmit` validates |
| Proto | `packages/proto` | Implemented but runtime-unverified | Protobuf definitions |
| gRPC transport | `packages/grpc-transport` | Stubbed / placeholder | `GrpcTransportUnavailableError` thrown |

### Backend Static Inventory

| Count | Evidence |
| ----: | -------- |
| 41 controller files | `apps/backend/src/**/*controller.ts` |
| 65 entity files | `apps/backend/src/db/entities/*.ts` |
| 77 service files | `apps/backend/src/**/*.service.ts` |
| 54 module files | `apps/backend/src/**/*.module.ts` |

---

## 3. Build, Lint, and Test Evidence

### Workspace Gates

| Command | Result | Notes |
| ------- | ------ | ----- |
| `npm run lint` | Passed | All workspaces clean |
| `npm run build` | Passed | All workspaces compiled (UI build fixed with type declarations) |
| `npm run test:unit` | Passed | 139 tests across 9 workspaces |

### Per-Workspace Unit Test Breakdown

| Workspace | Tests | Suites | Status |
| --------- | ----: | -----: | ------ |
| `@spicegarden/backend` (unit) | 26 | 3 | PASS |
| `@spicegarden/backend` (full) | 630 | 54 | PASS (1 skipped) |
| `@spicegarden/customer-mobile` | 33 | 6 | PASS |
| `@spicegarden/customer-web` | 11 | 3 | PASS |
| `@spicegarden/delivery-partner` | 6 | 3 | PASS |
| `spicegarden-launcher` | 1 | 1 | PASS |
| `@spicegarden/restaurant-dashboard` | 9 | 3 | PASS |
| `@spicegarden/super-admin` | 23 | 4 | PASS |
| `@spicegarden/shared` | 2 | 2 | PASS |
| `@spicegarden/ui` | 28 | 5 | PASS |

### Backend Tests and Coverage

| Command | Result | Evidence |
| ------- | ------ | -------- |
| `cd apps/backend && npm test` | Passed | 630 passed, 1 skipped, 54 test files |
| `cd apps/backend && npm run test:cov` | Failed | Coverage thresholds not met |

**Coverage (from `apps/backend/coverage/coverage-summary.json`):**
- Statements: 80.02% (target: 80%) — **FAILS by 0.02%**
- Branches: 63.05% (target: 80%) — **FAILS**
- Functions: 63.22% (target: 80%) — **FAILS**
- Lines: 79.82% (target: 80%) — **FAILS**

---

## 4. Capability Matrix

| Capability | Status | Evidence |
| ---------- | ------ | -------- |
| Authentication | Implemented & verified | `apps/backend/src/services/auth/` |
| RBAC | Implemented but runtime-unverified | `apps/backend/src/security/roles.guard.ts` |
| Restaurant catalog | Implemented & verified | `apps/backend/src/services/restaurant/` |
| Order lifecycle | Implemented & verified | `apps/backend/src/services/order/order.service.ts` |
| Payment integration | Partial / scaffolded | `apps/backend/src/services/payments/` — mocks only |
| Refunds | Implemented & verified | `apps/backend/src/services/refund/` |
| Wallet | Implemented & verified | `apps/backend/src/services/wallet/` |
| Delivery assignment | Implemented but runtime-unverified | `apps/backend/src/services/delivery/` |
| Live order tracking | Implemented but runtime-unverified | `apps/backend/src/infra/tracking/` |
| Notifications | Partial / scaffolded | `apps/backend/src/services/notifications/` |
| Observability | Implemented but runtime-unverified | Prometheus/Grafana configs |
| gRPC transport | Stubbed / placeholder | `packages/grpc-transport/src/index.ts:8-10` |

---

## 5. Infrastructure Evidence

### Docker Compose

| File | Status | Evidence |
| ---- | ------ | -------- |
| `compose.dev.yaml` | Implemented but runtime-unverified | Config renders; 9 services defined |
| `compose.infra.yaml` | Implemented but runtime-unverified | Config renders; 5 services defined |

### Kubernetes

| Check | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| Manifest static | `infra/k8s/production-hardened.yaml` | 3 replicas, probes, PDB, HPA, NetworkPolicy | Implemented but runtime-unverified |
| Server validation | `kubectl apply --dry-run=client` | Cannot connect to cluster at localhost:8080 | Blocked from validation |

---

## 6. Security Evidence

| Check | Result | Evidence |
| ----- | ------ | -------- |
| Runtime security | Blocked | Requires running backend (`node infra/scripts/security-tests.js`) |
| Penetration tests | Blocked | Requires running backend (`node infra/scripts/penetration-tests.js`) |
| Dependency audit | Failed | 31 moderate vulnerabilities (`npm audit --audit-level=moderate`) |
| Secret validation | Blocked | 3/16 valid secrets (13 warnings) |

**Security controls implemented in `apps/backend/src/main.ts:215-246`:**
- Helmet (CSP, HSTS)
- HPP
- Mongo sanitization
- CORS allow-list
- Rate limiting (Redis-backed)
- CSRF protection
- Dangerous method blocking (TRACE, TRACK, DEBUG, CONNECT)

---

## 7. Production Readiness Gaps

### P0 Blockers
1. Coverage gate failure — branches 63.05%, functions 63.22%, lines 79.82% below 80%
2. 31 npm audit moderate vulnerabilities (dev toolchain)
3. Docker/K8s runtime unavailable — cannot validate full stack
4. Production provider secrets incomplete (3/16 valid)

### P1 Gaps
1. Live payment gateway validation
2. Live notification provider validation
3. Mobile native/device validation

---

## 8. CI/CD Pipeline

| Workflow | Trigger | Status |
| -------- | ------- | ------ |
| `ci-cd.yml` | push/PR/cron | Configured; build step fails due to coverage gate |
| `react-doctor.yml` | PR push | Configured |
| `rollback.yml` | workflow_dispatch | Configured but unvalidated |

**CI Gate Status:**
- Security audit: `npm audit --audit-level=high` passes (0 high)
- Build: `npm run build` passes (UI build fixed)
- Coverage: `npm run test:cov` fails (thresholds not met)

---

## 9. Files Verified

- `apps/backend/src/main.ts` — security middleware, metrics, rate limiting
- `apps/backend/coverage/coverage-summary.json` — coverage metrics
- `packages/ui/lucide-react.d.ts` — type declarations for build fix
- `packages/grpc-transport/src/index.ts` — stub status confirmed
- `infra/k8s/production-hardened.yaml` — manifests present
- `package.json` — workspace configuration