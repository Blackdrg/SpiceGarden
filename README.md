# SpiceGarden

SpiceGarden is an npm-workspace monorepo implementing a full-stack food-delivery platform. It contains:
- **Backend:** NestJS API (`apps/backend`)
- **Web apps:** Next.js customer-web, restaurant-dashboard, super-admin
- **Mobile apps:** Expo/React Native customer-mobile, delivery-partner
- **Packages:** ui (shared components), shared (utils), api-types (contracts), proto (protobuf)
- **Infra:** Docker Compose, Kubernetes manifests, observability (Prometheus/Grafana/Alertmanager/OpenSearch)

**Current verified position (2026-06-23):**

| Metric | Score | Evidence |
| ------ | ----- | -------- |
| Lint | ✅ Passed | `npm run lint` passed all workspaces |
| Build | ✅ Passed | `npm run build` passed all workspaces (UI build fixed with `lucide-react.d.ts`) |
| Root unit tests | ✅ 139 tests | `npm run test:unit` across 9 workspaces |
| Backend tests | ✅ 630 passed, 1 skipped | `cd apps/backend && npm test` (54 test files) |
| Backend coverage | ❌ Fails gates | Statements 80.02% (↑ from 68.41%), Branches 63.05%, Functions 63.22%, Lines 79.82% — all below 80% thresholds |
| npm audit | ❌ 31 moderate | No high/critical vulnerabilities |

---

## Verification Snapshot

| Check | Status | Evidence |
| ----- | ------ | -------- |
| `npm run lint` | Passed | All 11 workspaces clean |
| `npm run build` | Passed | All workspaces compiled successfully |
| `npm run test:unit` | Passed | 139 tests across 9 workspaces |
| `cd apps/backend && npm test` | Passed | 630 passed, 1 skipped (mongo-connection skipped when MongoDB offline) |
| `cd apps/backend && npm run test:cov` | **Failed** — coverage gate | Thresholds not met (branches 63.05%, functions 63.22%, lines 79.82%) |
| `npm audit --audit-level=moderate` | Failed | 31 moderate vulnerabilities |
| Secret validation | Blocked | 3/16 valid secrets (13 warnings for production provider secrets) |
| gRPC transport | Stubbed | `packages/grpc-transport/src/index.ts` throws `GrpcTransportUnavailableError` |

---

## Monorepo Layout

```
spicegarden/
├─ apps/
│  ├─ backend/           # NestJS API (port 3001)
│  ├─ customer-web/      # Next.js storefront (19 pages)
│  ├─ restaurant-dashboard/ # Next.js restaurant dashboard (2 pages)
│  ├─ super-admin/       # Next.js admin (2 pages)
│  ├─ customer-mobile/   # Expo/React Native (21 TSX + 22 TS source files)
│  ├─ delivery-partner/  # Expo/React Native
│  ├─ launcher/          # Electron (build + 1 test)
│  └─ driver-app/        # Stub (code only, no package.json)
├─ packages/
│  ├─ ui/                # React components (54 TSX files)
│  ├─ shared/            # Utilities
│  ├─ api-types/         # API contracts
│  ├─ proto/             # Protobuf types
│  └─ grpc-transport/    # Stubbed (quarantined)
├─ infra/
│  ├─ k8s/               # Kubernetes manifests
│  ├─ prometheus/        # Prometheus config/rules
│  ├─ grafana/           # Dashboards/provisioning
│  ├─ alertmanager/      # Alert config
│  ├─ scripts/           # Security/load/test scripts
│  └─ compose.dev.yaml   # 9 services including backend
└─ docs/                 # Technical documentation
```

---

## Status Definitions

| Status | Meaning |
| ------ | ------- |
| Implemented & verified | Code exists + command/runtime/test evidence validates |
| Implemented but runtime-unverified | Code exists + builds/tests, no live runtime proof |
| Partial / scaffolded | Code exists but incomplete or placeholder-like |
| Stubbed / placeholder | Intentional stub or quarantine module |
| Broken / failing | Command, gate, or threshold failed |
| Blocked from validation | Cannot validate due to missing dependency/runtime |

---

## Production Readiness

**Implementation completeness: ~55%**
- Backend: 41 controllers, 65 entities, 77 services, 54 modules
- Frontend: Partial pages/screens with unit test coverage
- gRPC: Stubbed (quarantined)

**Commercial demo readiness: ~45%**
- Backend runtime verified locally (SQLite mode)
- Reduced smoke load passes (5-VU, p95 797ms)
- Workspace builds pass
- Integration/e2e tests have Windows SWC binary issues

**Production readiness: ~35%**
- Coverage gates failing (below 80% thresholds)
- 31 npm audit moderate vulnerabilities
- Runtime security tests pending (backend not running)
- Production secrets incomplete (3/16 valid)
- Docker/K8s runtime blocked (no Docker daemon)

---

## Known Blockers

### P0
1. **Coverage gate failure:** Backend branches (63.05%), functions (63.22%), lines (79.82%) below 80% thresholds
2. **Dependency audit:** 31 moderate vulnerabilities (dev toolchain only, no high/critical)
3. **Docker/K8s runtime:** Docker daemon unavailable, cluster API unreachable
4. **Runtime security:** Security tests require running backend

### P1
1. Live payment gateway validation (Stripe/Razorpay mocks only)
2. Live notification provider validation (FCM/Twilio placeholders)
3. Mobile native/device validation (no device testing)

---

## Documentation

| File | Purpose |
| ---- | ------- |
| `docs/CANONICAL_PROJECT_STATE.md` | Authoritative current-state baseline |
| `docs/DOCUMENTATION_RECONCILIATION_MATRIX.md` | Reconciled historical claims |
| `docs/PROJECT_STATUS_SCORECARD.md` | Domain-by-domain scoring |
| `docs/PROJECT_VALUATION_UPDATE.md` | Technical asset valuation |
| `docs/BUILD_LINT_TEST_AUDIT.md` | Build/lint/test evidence |
| `docs/BACKEND_COVERAGE_AUDIT.md` | Coverage metrics and gaps |
| `docs/SECURITY_VALIDATION_REPORT.md` | Security controls audit |
| `docs/RUNTIME_STACK_VALIDATION.md` | Runtime/diagnostic status |
| `docs/E2E_BUSINESS_FLOW_REPORT.md` | Business flow validation |
| `docs/LOAD_TEST_REPORT.md` | Load test status |
| `docs/OBSERVABILITY_VALIDATION.md` | Observability stack status |
| `docs/CI_CD_AUDIT.md` | CI/CD pipeline analysis |
| `docs/MOBILE_READINESS_REPORT.md` | Mobile app status |
| `docs/MONOREPO_INVENTORY.md` | Full app/package inventory |
| `docs/APPLICATION_PACKAGE_MATRIX.md` | App/package capability mapping |
| `docs/CAPABILITY_MATRIX.md` | Feature capability status |
| `docs/API_SURFACE_SUMMARY.md` | API endpoints summary |
| `docs/DATA_MODEL_SUMMARY.md` | Entity/data model inventory |
| `docs/INFRASTRUCTURE_DEPLOYMENT_AUDIT.md` | Infra/deployment status |
| `docs/KNOWN_BLOCKERS_AND_GAPS.md` | Blocker/gap catalog |
| `docs/PRODUCTION_READINESS_ROADMAP_STATUS.md` | Roadmap assessment |

---

## Quick Commands

```bash
npm run lint           # Pass
npm run build          # Pass (all workspaces)
npm run test:unit      # Pass (139 tests)
cd apps/backend && npm test    # Pass (630 passed, 1 skipped)
npm audit --audit-level=moderate  # 31 moderate vulnerabilities
node infra/scripts/validate-secrets.js  # 3/16 valid
```