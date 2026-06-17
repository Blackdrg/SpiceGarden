# Current Engineering Baseline - SpiceGarden

Generated: 2026-06-17T11:50+05:30  
Branch: `feat/add-react-doctor`  
Classification: Advanced Startup-Grade Pre-Production System.

## Current verified state

| Area | Status | Evidence |
| :--- | :--- | :--- |
| Build | PASS | `npm run build` exit `0` |
| Typecheck | PASS | `npx tsc --noEmit` exit `0` |
| Lint | PASS | `npm run lint` exit `0` |
| Root unit tests | PASS | `npm run test:unit` exit `0`; 143 tests passed |
| Root e2e tests | PASS | `npm run test:e2e` exit `0`; 65 tests passed |
| Root test | PASS | `npm run test` exit `0` |
| Backend full tests | PASS | `cd apps/backend && npm run test`; 210 passed, 1 skipped |
| Runtime security | PASS | `node infra/scripts/security-tests.js`; 0 vulnerabilities |
| Dependency graph | PASS | `npm ls --workspaces --depth=0` exit `0` |
| Dependency audit | PARTIAL | `npm audit --json`; 0 critical, 0 high, 51 moderate |
| React Doctor | PARTIAL | 0 errors, 62 warnings, score `null` |
| Load testing | FAIL | `npm run test:load --workspace @spicegarden/backend` fails before metrics |

## P0 hardening completed

- Added Redis-capable rate-limit store.
- Added layered route-specific rate limits for OTP, auth, orders, and general API.
- Added method/route/IP keying for rate-limit keys.
- Disabled trust proxy by default unless explicitly configured.
- Added root `test` script.
- Narrowed backend test scripts to deterministic local tests.
- Fixed customer-web checkout e2e reliability.
- Fixed restaurant-dashboard KDS e2e robustness.
- Fixed super-admin analytics fetch test.
- Added delivery-partner AsyncStorage Jest mock.
- Removed unused `@rushstack/eslint-patch` from selected Next workspaces.

## Remaining production blockers

| Blocker | Status |
| :--- | :--- |
| Redis-backed rate-limit execution | Implemented but not locally verified because Redis was unavailable. |
| Load testing | k6 script fails on duplicate `http_req_duration` metric. |
| Penetration testing | Not completed in this pass. |
| Docker/compose validation | Not completed in this pass. |
| Kubernetes/staging validation | Not completed in this pass. |
| Monitoring validation | Prometheus, Grafana, Sentry, Alertmanager, and OpenSearch are present but not end-to-end validated. |
| React Doctor 80+ target | Not verified; score is `null` and 62 warnings remain. |
| Dependency audit | 51 moderate vulnerabilities remain. |

## Current verdict

SpiceGarden is materially closer to production readiness, but it remains pre-production until load, infrastructure, monitoring, penetration, Redis-backed security, and React Doctor score validation are completed.
