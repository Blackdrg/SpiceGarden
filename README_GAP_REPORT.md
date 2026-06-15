# README Gap Report

Verified as of: 2026-06-15 21:15 IST

## Executive summary

SpiceGarden has passing build, typecheck, lint, and npm audit gates, but it is not production-ready. The current release gate is blocked by failing tests, backend coverage thresholds, a broken k6 load script, rate-limiting security findings, environment validation issues, a deployment-check script failure, and React Doctor quality findings.

## P0 — release blockers

| Gap | Evidence | Required action |
| :--- | :--- | :--- |
| Customer mobile e2e-flow test fails | `npm run test:unit` and `npm run test:e2e` failed at `apps/customer-mobile/__tests__/e2e-flow.test.js` | Fix the failing mobile test or correct the workflow it exposes, then re-run unit, e2e, and `test:all` |
| Root test aggregation fails | `npm run test:all` failed through `apps/customer-mobile` | Clear the mobile test failure and verify the root test gate |
| Backend coverage thresholds fail | `npm run test:cov --workspace @spicegarden/backend -- --runInBand` reported `47.16%` statements, `14.63%` branches, `17.33%` functions, and `45.81%` lines | Add focused backend tests or deliberately lower thresholds after review |
| Load test script fails | `npm run test:load --workspace @spicegarden/backend` failed at `apps/backend/test/load/10k-users.js:6:27` with a k6 metric conflict | Fix the k6 metric definition and re-run load validation |
| Rate limiting fails | `node infra/scripts/security-tests.js` reported `Rate limited responses: 0/100` | Fix rate limiter configuration and re-run the security script |

## P1 — production hardening blockers

| Gap | Evidence | Required action |
| :--- | :--- | :--- |
| Environment validation fails | `node infra/scripts/validate-env-consistency.js` found production `STRIPE_SECRET_KEY_FILE` missing and staging file mismatch | Configure correct Stripe secret file references and re-run validation |
| Deployment check script fails | `node infra/scripts/deployment-check.js` failed because the Bash script was executed by Node | Run the script as Bash or rewrite it as Node-compatible |
| React Doctor quality is below target | `npx react-doctor@latest --verbose` reported `61/100`, `60` issues, `32` bugs | Fix React Doctor bugs and maintainability issues, then re-run |
| Dependency tree is unhealthy | `npm ls --workspaces --depth=0` found extraneous and invalid installs | Remove extraneous packages and fix invalid workspace installs |
| Penetration test cannot run | `node infra/scripts/penetration-tests.js` failed because `localhost:3001` was unreachable | Start backend and re-run penetration validation after P0 fixes |

## P2 — reliability and security debt

| Gap | Evidence | Required action |
| :--- | :--- | :--- |
| Placeholder values in auth/payment paths | Source scan found placeholder/default values in JWT/payment/security modules | Replace placeholders with validated production configuration checks |
| RBAC route coverage unclear | `apps/backend/src/security/roles.guard.ts` exists, but route usage needs audit | Audit route decorators and ensure protected endpoints use the guard |
| Refresh-token session creation incomplete | `session.entity.ts` has `refreshToken`, but `AuthService` creates sessions without setting it | Complete refresh-token lifecycle and add tests |
| Loose typing | Sample scan found `6872` TypeScript `any` markers | Reduce `any` usage in high-risk backend and shared API paths |
| Logging noise | Sample scan found `494` console markers | Remove or route console calls through structured logging |
| TODO/FIXME backlog | Sample scan found `172` TODO/FIXME markers | Triage and convert actionable items into tracked work |

## P3 — future hardening

| Gap | Evidence | Required action |
| :--- | :--- | :--- |
| Chaos testing is unsafe to run casually | `npm run test:chaos` applies Kubernetes chaos manifests | Gate chaos tests behind an explicit production/staging approval path |
| Missing package tests | `packages/api-types`, `packages/grpc-transport`, `packages/proto`, `packages/shared`, `packages/ui`, and `packages/ux` have no test scripts | Add lightweight unit tests for shared contracts and utilities |
| Cost model not ready | No cloud provider, region, storage, SLA, or traffic target was provided | Build cost estimates from Kubernetes resource targets after load tests pass |
| Observability validation incomplete | Prometheus, Grafana, OpenSearch, and Alertmanager manifests exist, but runtime validation was not completed | Validate dashboards, alerts, and log pipelines against a live staging deployment |

## Current release decision

Do not mark SpiceGarden production-ready until all P0 items are fixed and re-verified. P1 items should be completed before any production deployment because they affect environment safety, runtime quality, and deployment validation.
