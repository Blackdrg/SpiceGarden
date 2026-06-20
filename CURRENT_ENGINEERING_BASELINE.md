> HISTORICAL DOCUMENT
> This report reflects a prior audit state and is superseded by:
> `docs/CANONICAL_PROJECT_STATE_2026-06-20.md`
> and the latest README / status reports.

# CURRENT_ENGINEERING_BASELINE.md (Historical)

## Current verified state

| Area | Status | Evidence |
| :--- | :--- | :--- |
| Build | PASS | `npm run build` exit `0`; Next.js SWC native warning is non-blocking |
| Typecheck | PASS | `npx tsc --noEmit` exit `0` |
| Lint | PASS | `npm run lint` exit `0` |
| Root unit tests | PASS | `npm run test:unit` exit `0` |
| Root integration tests | PASS | `npm run test:integration` exit `0` |
| Root e2e tests | PASS | `npm run test:e2e` exit `0` |
| Root test | PASS | `npm run test` exit `0` |
| Runtime security | PASS | `node infra/scripts/security-tests.js`; 0 vulnerabilities; 95/100 rate-limited responses |
| React Doctor | PASS | `npx react-doctor@latest --json --verbose`; 0 errors, 0 warnings, score `100/100` |
| Dependency graph | PASS | `npm ls --workspaces --depth=0` exit `0` |
| High/critical audit | PASS | `npm audit --audit-level=high` exit `0` |
| Dependency audit | PARTIAL | `npm audit`; 31 moderate findings remain |
| Deployment | BLOCKED | `node infra/scripts/deployment-check.js`; cannot connect to cluster |
| Load testing | NOT RERUN | k6/load validation not rerun in this pass |

## P0 hardening completed

- Added Redis-capable rate-limit store.
- Added layered route-specific rate limits for OTP, auth, orders, and general API.
- Added method/route/IP keying for rate-limit keys.
- Disabled trust proxy by default unless explicitly configured.
- Added root `test` script.
- Narrowed backend test scripts to deterministic local tests.
- Completed React Doctor cleanup across customer-web, delivery-partner, restaurant-dashboard, and super-admin.
- Converted customer-web effect fetching, grouped state, and client redirects to React Query, `useReducer`, and Pages Router guards.
- Removed Redux hook usage from customer-web `_app.tsx` during SSR.
- Removed JS-thread `Animated` usage from delivery-partner and replaced `Dimensions.get`.
- Split restaurant-dashboard and super-admin large dashboard hot spots.

## Remaining production blockers

| Blocker | Status |
| :--- | :--- |
| Kubernetes/deployment validation | Blocked by missing cluster connection. |
| Redis-backed rate-limit execution | Implemented but not locally verified because Redis was unavailable. |
| Dependency audit | 31 moderate findings remain; high/critical gate passes. |
| Load testing | Not rerun in this pass. |
| Penetration testing | Not rerun in this pass. |
| Docker/compose validation | Not completed in this pass. |
| Monitoring validation | Prometheus, Grafana, Sentry, Alertmanager, and OpenSearch are present but not end-to-end validated. |

## Current verdict

SpiceGarden is materially closer to production readiness, but it remains pre-production until Kubernetes deployment validation, Redis-backed security validation, moderate dependency remediation, and load/penetration/monitoring checks are completed.
