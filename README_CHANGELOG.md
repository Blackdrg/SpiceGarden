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

---

## README Update Changelog — 2026-06-16 21:17 IST

### What changed

- Preserved existing `README.md` content and appended a new current verified engineering status section.
- Marked the stale `Current Verified Engineering Update — 2026-06-15 21:15 IST` heading with `[OUTDATED — VERIFIED UPDATE BELOW]`.
- Added the requested current classification: **“Advanced Startup-Grade Pre-Production System”**.
- Added current project maturity: **~74–79% complete**.
- Added explicit verdict: **NOT PRODUCTION READY**.
- Added current verified status sections for build, lint, typecheck, tests, security, dependencies, infrastructure, and observability.
- Added a test reliability matrix for backend, customer-web, customer-mobile, delivery-partner, restaurant-dashboard, super-admin, and packages.
- Added P0 release blockers with severity, evidence, impact, required fix, production risk, and confidence.
- Added frontend reality assessment distinguishing real, partially verified, and not-yet-production-verified capabilities.
- Added architecture maturity ratings for backend, frontend, shared packages, UI/UX, testing, security, infrastructure, observability, and documentation.
- Added current positioning, remaining work to production, current verdict, verification sources, command output excerpts, and required output file status.
- Updated `README_GAP_REPORT.md`, `PROJECT_STATUS_REPORT.md`, and `README_CHANGELOG.md` by append only.
- Generated `CURRENT_STATUS_SUMMARY.md`.

### Fresh verification commands added

| Command | Result | Confidence |
| :--- | :--- | :---: |
| `git ls-files \| Measure-Object -Line` | `2696` tracked files | HIGH |
| `npm run lint` | Exit `0` | HIGH |
| `npm run build` | Exit `2`; TypeORM relation/select errors and missing declaration files | HIGH |
| `npm audit --json` | `51` moderate, `5` high, `56` total vulnerabilities; exit `1` | HIGH |
| `npm ls --workspaces --depth=0 --json` | Invalid `@sentry/node@10.58.0`; exit `1` | HIGH |
| `npm run test --workspace @spicegarden/backend -- --runInBand` | `201` passed, `1` skipped, `202` total, `1` failed suite; exit `1` | HIGH |
| `node infra/scripts/security-tests.js` | `Rate limited responses: 0/100`; `Total vulnerabilities found: 100`; exit `1` | HIGH |
| `node infra/scripts/penetration-tests.js` | `ECONNREFUSED` for `localhost:3001`; exit `1` | HIGH |
| `node infra/scripts/deployment-check.js` | `ERROR: Cannot connect to cluster`; exit `1` | HIGH |
| `node infra/scripts/validate-env-consistency.js` | `All environment configurations are valid`; exit `0` | HIGH |
| `npx react-doctor@latest --verbose` | `61/100`, `62 issues`, `32 bugs`, `2 performance`, `28 maintainability`; exit `0` | HIGH |

### Stale claims marked

| Claim area | Marker added | Reason | Confidence |
| :--- | :--- | :--- | :---: |
| `README.md` current verified engineering update from 2026-06-15 | `[OUTDATED — VERIFIED UPDATE BELOW]` | Fresh rerun observed build/typecheck failures and dependency/security gaps not reflected by the older passing build/audit summary | HIGH |

### Required output files

| File | Status | Timestamp | Confidence |
| :--- | :--- | :--- | :---: |
| `README.md` | Updated by append | 2026-06-16 21:17 IST | HIGH |
| `README_GAP_REPORT.md` | Updated by append | 2026-06-16 21:17 IST | HIGH |
| `PROJECT_STATUS_REPORT.md` | Updated by append | 2026-06-16 21:17 IST | HIGH |
| `CURRENT_STATUS_SUMMARY.md` | Generated | 2026-06-16 21:17 IST | HIGH |
| `README_CHANGELOG.md` | Updated by append | 2026-06-16 21:17 IST | HIGH |

---

## README Update Changelog — 2026-06-17 04:01 IST

### What changed

- Preserved existing `README.md` content and appended a fresh current verified engineering baseline.
- Updated supporting files by append only: `README_GAP_REPORT.md`, `PROJECT_STATUS_REPORT.md`, `CURRENT_STATUS_SUMMARY.md`, and `README_CHANGELOG.md`.
- Added fresh command evidence for repository inventory, build, typecheck, lint, root/workspace tests, dependency audit, outdated packages, workspace dependency resolution, security tests, penetration tests, environment validation, deployment validation, and React Doctor.
- Added current classification, maturity, production readiness, frontend reality assessment, architecture maturity, P0 blockers, positioning, and current verdict.

### Fresh verification commands added

| Command | Result | Exit Code | Confidence |
| :--- | :--- | :---: | :---: |
| `git ls-files` | `2696` tracked files | `0` | HIGH |
| `git status --short` | Modified and untracked files present | `0` | HIGH |
| Repository directory/extension inventory scans | `281` project directories excluding generated/cache directories; extension inventory captured | `0` | MEDIUM |
| `npm run build` | PASS | `0` | HIGH |
| `npx tsc --noEmit` | PASS | `0` | HIGH |
| `npm run lint` | PASS | `0` | HIGH |
| `npm run test` | FAILED — missing root script `test` | `1` | HIGH |
| `npm run test:unit` | FAILED — customer-web, delivery-partner, restaurant-dashboard, super-admin failed | `1` | HIGH |
| `npm run test:integration` | FAILED — customer-web, delivery-partner, restaurant-dashboard, super-admin failed | `1` | HIGH |
| `npm run test:e2e` | FAILED — customer-web, delivery-partner, restaurant-dashboard, super-admin failed | `1` | HIGH |
| `npm run test:all` | FAILED — customer-web, delivery-partner, restaurant-dashboard, super-admin failed | `1` | HIGH |
| `npm audit --json` | `51` moderate, `0` high, `0` critical, `51` total | `1` | HIGH |
| `npm outdated` | Outdated packages reported | `1` | HIGH |
| `npm ls --workspaces --depth=0 --json` | PASS; no fresh invalid/extraneous problems in output | `0` | HIGH |
| `node infra/scripts/security-tests.js` | `Rate limited responses: 0/100`; `Total vulnerabilities found: 100` | `1` | HIGH |
| `node infra/scripts/penetration-tests.js` | `ECONNREFUSED` for `localhost:3001` | `1` | HIGH |
| `node infra/scripts/validate-env-consistency.js` | `All environment configurations are valid` | `0` | HIGH |
| `node infra/scripts/deployment-check.js` | `ERROR: Cannot connect to cluster` | `1` | HIGH |
| `npx react-doctor@latest --verbose` | `61/100`, `62` issues, `32` bugs, `2` performance, `28` maintainability | `0` | HIGH |

### Stale claims marked

| Claim area | Marker added | Reason | Confidence |
| :--- | :--- | :--- | :---: |
| Older build/typecheck failure claims | `[OUTDATED — VERIFIED UPDATE BELOW]` | Fresh `npm run build` and `npx tsc --noEmit` both exited `0` | HIGH |
| Older invalid dependency install claims | `[OUTDATED — VERIFIED UPDATE BELOW]` | Fresh `npm ls --workspaces --depth=0 --json` exited `0`; audit/outdated still fail | HIGH |
| Older environment validation failure claims | `[OUTDATED — VERIFIED UPDATE BELOW]` | Fresh `validate-env-consistency.js` exited `0` | HIGH |
| Older React Doctor `49`/`60` issue claims | `[OUTDATED — VERIFIED UPDATE BELOW]` | Fresh React Doctor reported `61/100` with `62` issues | HIGH |
| Older security pass claims | `[OUTDATED — VERIFIED UPDATE BELOW]` | Fresh `security-tests.js` failed rate limiting with `100` vulnerabilities | HIGH |
| Older load-test pass/fail claims | `[OUTDATED — VERIFIED UPDATE BELOW]` | Load tests were not run in this pass; no pass/fail claim is made | MEDIUM |

### New blockers added

- rate limiting bypass
- dependency audit vulnerabilities
- failing workspace test gates
- React Doctor quality issues
- deployment validation failure
- penetration test reachability failure
- root `npm run test` script missing

### Not counted as fresh blockers

| Item | Reason | Confidence |
| :--- | :--- | :---: |
| Invalid dependency installs | Fresh `npm ls --workspaces --depth=0 --json` exited `0` with no invalid/extraneous problems in output | HIGH |
| Build/typecheck failures | Fresh `npm run build` and `npx tsc --noEmit` both exited `0` | HIGH |
| Environment validation failures | Fresh `validate-env-consistency.js` exited `0` | HIGH |

### New maturity score

- Current maturity: **~74–79%**
- Confidence: **MEDIUM**
- Production readiness: **NOT PRODUCTION READY**

