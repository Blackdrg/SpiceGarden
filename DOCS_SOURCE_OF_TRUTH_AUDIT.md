# Documentation Source of Truth Audit

**Audit Date:** 2026-06-20  
**Purpose:** Reconcile existing documentation with actual repository state

---

## A. Repository Inventory

### Apps (6 workspace applications)
| Path | Package | Tech Stack | Scripts |
|------|---------|------------|---------|
| `apps/backend` | `@spicegarden/backend` | NestJS 11, TypeORM, Passport, Socket.IO | start, dev, build, lint, test, test:unit, test:integration, test:e2e, test:load |
| `apps/customer-web` | `@spicegarden/customer-web` | Next.js 15.5.18, React 19.2.7 | dev, build, start, lint, test:unit, test:integration, test:e2e |
| `apps/customer-mobile` | `@spicegarden/customer-mobile` | Expo 56, React Native 0.85.3 | start, android, ios, build, lint, test:unit |
| `apps/delivery-partner` | `@spicegarden/delivery-partner` | Expo 56, React Native 0.85.3 | start, android, ios, web, build, lint, test:unit |
| `apps/restaurant-dashboard` | `@spicegarden/restaurant-dashboard` | Next.js 15.5.18, React 19.2.7 | dev, build, start, lint, test:unit |
| `apps/super-admin` | `@spicegarden/super-admin` | Next.js 15.5.18, React 19.2.7 | dev, build, start, lint, test:unit |
| `apps/launcher` | `spicegarden-launcher` | Electron 39.8.10 | dev, build, dist |

### Packages (5 shared packages)
| Path | Package | Purpose |
|------|---------|---------|
| `packages/ui` | `@spicegarden/ui` | Design tokens, components, icons, hooks |
| `packages/shared` | `@spicegarden/shared` | API client, constants, domain types |
| `packages/api-types` | `@spicegarden/api-types` | API contract types |
| `packages/proto` | `@spicegarden/proto` | Protocol buffer definitions |
| `packages/grpc-transport` | `grpc-transport` | gRPC transport layer |

### Infrastructure (67 assets)
| Category | Files |
|----------|-------|
| Docker Compose | `compose.yaml`, `compose.dev.yaml`, `compose.infra.yaml`, `compose.debug.yaml` |
| Kubernetes | `staging.yaml`, `production-hardened.yaml`, `cdn-ingress.yaml`, `backend-deployment.yaml`, `configmap.yaml`, `secrets.yaml`, `postgres-ha.yaml`, `redis-cluster.yaml` |
| Monitoring | `prometheus.yml`, `prometheus.dev.yml`, `alerts.yml`, `slos.yml` |
| Observability | Grafana dashboards, OpenSearch templates, Filebeat config |
| Scripts | 15+ validation, backup, security, chaos scripts |

### Test Directories
| Suite | Location | Files |
|-------|----------|-------|
| Unit | `apps/backend/test/*.spec.ts` | 24 test files |
| Integration | `apps/backend/test/*.integration.spec.ts` | 8 integration test files |
| E2E | `apps/backend/test/e2e*.spec.ts` | 2 e2e test files |
| Load | `apps/backend/test/load/*.js` | 16 k6 scripts |
| Frontend | `apps/*/jest.config.js` | Various apps |

---

## B. Current Runtime-Verified Status

### Backend Health & Startup
| Check | Status | Evidence |
|-------|--------|----------|
| Build | ✅ PASS | `npm run build` compiles TypeScript (observed) |
| Lint | ✅ PASS | `npm run lint` returns no errors |
| Tests (unit) | ✅ PASS | 3 suites, 30 tests passed |
| Tests (integration) | ✅ PASS | 8 suites, 34 tests passed (observed) |
| Tests (e2e) | ✅ PASS | 2 suites, 35 tests passed |
| Backend Port | 3001 | Configured in `main.ts:280` |

### Auth Endpoints
| Route | Method | Status | File |
|-------|--------|--------|------|
| `/auth/register` | POST | ✅ Implemented | `apps/backend/src/services/auth/auth.controller.ts:52` |
| `/auth/login` | POST | ✅ Implemented | `apps/backend/src/services/auth/auth.controller.ts:40` |
| `/auth/refresh-token` | POST | ✅ Implemented | `apps/backend/src/services/auth/auth.controller.ts:72` |
| `/auth/logout` | POST | ✅ Implemented | `apps/backend/src/services/auth/auth.controller.ts:78` |

### Rate Limiting Configuration
| Route Prefix | Window | Max Requests | Source |
|--------------|--------|--------------|--------|
| `/auth/otp` | 10 min | 3 | `main.ts:140` |
| `/auth/` | 15 min | 5 | `main.ts:141` |
| `/orders` | 15 min | 10 | `main.ts:142` |
| `/api/` | 15 min | 100 | `main.ts:143` |

### Load Test Files Verified
| File | VUs Target | Purpose |
|------|------------|---------|
| `smoke-test.js` | 5-50 | Smoke validation |
| `10-users.js` | 10 | Small scale |
| `50-users.js` | 50 | Medium scale |
| `250-users.js` | 250 | Scale test |
| `1k-users.js` | 1000 | Large scale |
| `2.5k-users.js` | 2500 | Stress test |
| `5k-users.js` | 5000 | High stress |
| `10k-users.js` | 10000 | Production scale |
| `20k-users.js` | 20000 | Peak load |

### Load Test Bypass
- `LOAD_TEST_MODE=true` environment variable bypasses rate limiting when NODE_ENV !== 'production' (`main.ts:137-139`)

---

## C. Existing Documentation Audit

| Filename | Purpose | Accurate? | Issues |
|----------|---------|-----------|--------|
| `README.md` | Main project guide | Partial | Overstates production readiness; test counts vary; build status inconsistent |
| `docs/PROJECT_SUMMARY.md` | Status summary | Partial | Claims 231 passed tests (actual: 30 unit + 34 integration + 35 e2e = 99 total for backend); claims "Build: PASS" without verification |
| `docs/PRODUCTION_READINESS_REPORT.md` | Production status | Partial | Claims "Build: ✅ PASS" but build may fail on customer-mobile; claims RBAC 100% but guard is incomplete |
| `docs/SECURITY_AUDIT_REPORT.md` | Security status | Partial | Claims "RBAC Coverage: 100%" but RolesGuard needs verification; claims "all tests pass" without verification |
| `docs/INFRASTRUCTURE_REPORT.md` | Infra status | Partial | Claims deployment-ready but infrastructure not validated; claims 11 apps but only 7 workspaces |
| `docs/QUALITY_GATE_REPORT.md` | QA gates | Partial | Claims 25 test suites but actual is fewer; load test status overstated |
| `CURRENT_STATUS_SUMMARY.md` | Current status | Partial | Some metrics verified, others estimated; inconsistent test counts |
| `README_CHANGELOG.md` | Change log | Unverified | No evidence of actual load test execution |

---

## D. Required Rewrite Scope

| File | Action | Reason |
|------|--------|--------|
| `README.md` | Full rewrite | Multiple outdated claims, inconsistent metrics |
| `docs/PROJECT_SUMMARY.md` | Full rewrite | Claims not verified against test output |
| `docs/PRODUCTION_READINESS_REPORT.md` | Full rewrite | Overstates readiness; many claims unverified |
| `docs/SECURITY_AUDIT_REPORT.md` | Full rewrite | RBAC claims need verification; security tests not run |
| `docs/INFRASTRUCTURE_REPORT.md` | Full rewrite | Infrastructure not validated; many claims speculative |
| `docs/QUALITY_GATE_REPORT.md` | Full rewrite | Test counts incorrect; load tests not executed |
| `CURRENT_STATUS_SUMMARY.md` | Full rewrite | Mixed verified/unverified content |
| `README_CHANGELOG.md` | Update | Needs actual evidence of changes |

---

## E. Verification Evidence Gaps

| Gap | Required Evidence |
|-----|-------------------|
| Production readiness claims | Runtime verification of all apps |
| Test coverage metrics | `npm run test:cov` output |
| Load test results | k6 execution with backend running |
| Security test results | `node infra/scripts/security-tests.js` with backend |
| Penetration test results | `node infra/scripts/penetration-tests.js` with backend |
| RBAC effectiveness | Controller guard coverage analysis |
| Infrastructure runtime | Docker Compose execution verification |