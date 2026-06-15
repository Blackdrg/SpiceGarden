# README Changelog

Verified as of: 2026-06-15 21:15 IST

## What changed

- Preserved all existing `README.md` content and appended a new repository-backed engineering update.
- Marked stale prior verification claims with `[OUTDATED — VERIFIED UPDATE BELOW]`.
- Added a current verified status section covering build, typecheck, lint, tests, audit, security, load, environment, deployment, and React Doctor results.
- Added machine-readable export file: `README_DATA_EXPORT.json`.
- Added production gap report: `README_GAP_REPORT.md`.
- Added this changelog to record documentation corrections and verification sources.

## Corrections made

| Area | Previous README implication | Current verified correction |
| :--- | :--- | :--- |
| Test gate | `npm run test:all` passed | `npm run test:all` failed because `apps/customer-mobile/__tests__/e2e-flow.test.js` failed |
| Runtime readiness | Runtime readiness was described as passing | Runtime readiness is blocked by failing tests, load script, security test, env validation, and deployment check |
| React Doctor | React Doctor was unavailable | `npx react-doctor@latest --verbose` ran and reported `61/100` with `60` issues |
| Customer web React Doctor score | Prior score was `49` | Current customer-web score is `64/100` |
| Load testing | k6 was reported unavailable | k6 ran through npx but the load script failed due a metric conflict |
| Queue behavior | Queue was described as in-memory | `apps/backend/src/infra/queue/queue.service.ts` uses BullMQ with Redis |
| Security | npm audit was the only security gate reported | Runtime security tests found rate-limiting issues |

## Outdated claims found

- `README.md:1017` cited a customer-web React Doctor score of `49`; current score is `64/100`.
- `README.md:1024` claimed the latest production verification update showed passing full workspace tests.
- `README.md:1036` claimed `npm run test:all` passed.
- `README.md:1054` claimed load testing was unavailable because k6 was not installed.
- `README.md:1056` claimed React Doctor was not runnable.
- `README.md:1057` claimed runtime readiness was passing and described queue behavior as in-memory.
- `README.md:1061` claimed the repository passed the core local verification gate including full workspace tests.

## Added sections

- Current Verified Engineering Update
- Verification commands
- Current verdict
- Outdated claims corrected
- Repository Overview
- Current Verified Status
- Architecture Overview
- App-by-App Breakdown
- Package Breakdown
- API Inventory
- Route Inventory
- Database Architecture
- Authentication & Security
- Payments System
- Delivery & Tracking System
- Notifications System
- Shared Design System
- Infrastructure & DevOps
- Docker Setup
- Kubernetes Setup
- CI/CD Pipeline
- Environment Variables
- Build Verification
- Test Verification
- React Doctor Report
- Dependency Audit
- Security Audit
- Production Readiness Assessment
- Known Technical Debt
- Known Bugs
- Deployment Checklist
- Scaling Readiness
- Observability & Monitoring
- Performance Risks
- Cost Estimation for Production
- Technical Roadmap
- Contributor Guide
- Troubleshooting Guide
- Verified Metrics Snapshot
- Appendix — Raw Diagnostic Data

## Verification sources

- Repository inventory: `git ls-files`, `git status --short`, directory scans.
- Build/type/lint: `npm run build`, `npx tsc --noEmit`, `npm run lint`.
- Dependency audit: `npm audit --audit-level=moderate`, `npm outdated`, `npm ls --workspaces --depth=0`.
- Tests: `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`, `npm run test:all`, backend coverage command.
- React quality: `npx react-doctor@latest --verbose`.
- Load/security/env/deployment: `npm run test:load --workspace @spicegarden/backend`, `node infra/scripts/security-tests.js`, `node infra/scripts/penetration-tests.js`, `node infra/scripts/validate-env-consistency.js`, `node infra/scripts/deployment-check.js`.
- Source inventory: filesystem scans of backend, apps, packages, infrastructure, and tests.
