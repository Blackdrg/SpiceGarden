> HISTORICAL DOCUMENT
> This report reflects a prior audit state and is superseded by:
> `docs/CANONICAL_PROJECT_STATE_2026-06-20.md`
> and the latest README / status reports.

# CURRENT_PROJECT_AUDIT.md

**Generated:** 2026-06-18T09:46+05:30

## Repository Overview

| Metric | Value |
| :--- | :---: |
| Root workspace | spicegarden@0.0.0 |
| Workspaces | 12 (apps/*, packages/*) |
| TypeScript files | 593 |
| JavaScript files | 796 |
| Markdown documents | 87 |
| Tracked files | ~2,400 |

## Workspace Packages

| Path | Package | Version | Dependencies | Test Suites |
| :--- | :--- | :---: | :---: | :---: |
| `apps/backend` | `@spicegarden/backend` | 0.0.0 | 57 | 24 suites, 210 tests |
| `apps/customer-mobile` | `@spicegarden/customer-mobile` | 1.0.0 | 26 | 6 suites, 33 tests |
| `apps/customer-web` | `@spicegarden/customer-web` | 0.1.0 | 26 | 3 suites, 11 tests |
| `apps/delivery-partner` | `@spicegarden/delivery-partner` | 1.0.0 | 14 | 3 suites, 6 tests |
| `apps/launcher` | `spicegarden-launcher` | 1.0.0 | 21 | 1 suite, 1 test |
| `apps/restaurant-dashboard` | `@spicegarden/restaurant-dashboard` | 0.1.0 | 17 | 3 suites, 9 tests |
| `apps/super-admin` | `@spicegarden/super-admin` | 0.1.0 | 18 | 4 suites, 23 tests |
| `packages/api-types` | `@spicegarden/api-types` | 1.0.0 | 4 | No tests |
| `packages/grpc-transport` | `grpc-transport` | 1.0.0 | 0 | No tests |
| `packages/proto` | `proto` | 1.0.0 | 0 | No tests |
| `packages/shared` | `@spicegarden/shared` | 0.0.0 | 2 | 2 suites, 2 tests |
| `packages/ui` | `@spicegarden/ui` | 0.1.0 | 2 | 5 suites, 28 tests |

## Build Verification

```
npm run build - PASSED
npx tsc --noEmit - PASSED
npm run lint - PASSED
```

All workspaces compiled successfully. TypeScript typecheck passed. Lint passed across all workspaces.

## Dependency Health

```
npm ls --workspaces --depth=0 - PASSED (Exit code 0)
npm audit --audit-level=high - PASSED (Exit code 0)
npm audit - Exit code 1; 31 moderate findings remain, 0 high, 0 critical
```

No invalid installs or version conflicts detected. Workspace dependency graph is healthy. High/critical audit gate passes; moderate advisories remain.

## Security Audit

```
node infra/scripts/security-tests.js - PASSED (Exit code 0)
npm audit --audit-level=high - PASSED (Exit code 0)
npm audit - Exit code 1; 31 moderate findings remain
```

Local runtime security checks passed with 0 vulnerabilities and 95/100 rate-limited responses. Redis-backed execution was not locally verified because Redis was unavailable; the backend used process-local fallback during the security script.

## Test Verification

```
npm run test:unit - PASSED
npm run test:integration - PASSED
npm run test:e2e - PASSED
npm run test - PASSED
```

Root unit, integration, e2e, and aggregate test gates passed.

## Coverage Status

```
npm run test:cov --workspace=@spicegarden/backend
Statements: 52.16% (was 49.09%)
Branches: 20.15% (was 16.84%)
Functions: 24.92% (was 19.16%)
Lines: 51.12% (was 47.94%)
```

Coverage thresholds (80%) NOT MET, but improved.

## React Doctor Status

```
npx react-doctor@latest --json --verbose - PASSED (Exit code 0)
Score: 100/100 Great
Diagnostics: 0
```

Per-app scores:
- `@spicegarden/customer-web` - `100/100 Great`; 0 diagnostics
- `@spicegarden/delivery-partner` - `100/100 Great`; 0 diagnostics
- `@spicegarden/restaurant-dashboard` - `100/100 Great`; 0 diagnostics
- `@spicegarden/super-admin` - `100/100 Great`; 0 diagnostics

## Infrastructure Assets

| Asset Type | Count | Path |
| :--- | :---: | :--- |
| Docker Compose files | 4 | compose.*.yaml |
| Kubernetes manifests | 7 | infra/k8s/*.yaml |
| Prometheus rules | Multiple | infra/prometheus/rules/ |
| Grafana dashboards | Multiple | infra/grafana/dashboards/ |
| Security scripts | 4 | infra/scripts/*.js |

## Current State Summary

| Area | Status | Score/Gaps |
| :--- | :--- | :--- |
| Build | ✅ PASSING | All workspaces compile; Next.js SWC native warning remains non-blocking |
| Lint | ✅ PASSING | No lint errors |
| Typecheck | ✅ PASSING | No type errors |
| Dependencies | ✅ PASSING | No graph errors; 31 moderate audit findings remain |
| Security | ✅ PASSING | Local security script passed; Redis-backed execution not locally verified |
| Tests | ✅ PASSING | Unit, integration, e2e, and aggregate gates passed |
| Coverage | ⚠️ IMPROVING | Backend coverage remains below target |
| React Doctor | ✅ PASSING | 100/100 Great; 0 diagnostics |
| Deployment | ⚠️ BLOCKED | Kubernetes cluster connection unavailable |

## Production Readiness Score

**Overall: BETA READY / Pre-Production**

Key improvements made:
- React Doctor cleanup completed across customer-web, delivery-partner, restaurant-dashboard, and super-admin.
- Customer-web SSR/auth redirect issues fixed.
- Delivery-partner animation/state hot spots fixed.
- Restaurant-dashboard and super-admin large-component hot spots fixed.
- Unit, integration, e2e, lint, build, typecheck, and security gates passed.
- High/critical npm audit gate passed; 31 moderate findings remain.

## Blockers Remaining
- Test coverage below 80% target.
- Deployment validation blocked by missing Kubernetes cluster connection.
- Redis-backed rate limiting not locally verified because Redis was unavailable.
- Moderate dependency advisories remain.
- Load testing and penetration testing not rerun in this pass.