# SpiceGarden — Independent Production Certification Audit v8.0

**Prepared by:** Independent External Technical Due Diligence Committee
**Date:** 2026-07-19
**Method:** Zero-assumption, evidence-based. Only claims backed by executed compilation, runtime API calls, browser automation, database inspection, or source inspection of executable code are marked VERIFIED. All other claims are marked NOT VERIFIED.
**Branch under audit:** `feat/add-react-doctor` (working tree has 25 deleted files / 4,120 lines removed vs `HEAD`).
**Environment:** Windows 11, Node v25.5.0, npm 9.9.4, Docker 29.6.1, PostgreSQL 16 + MongoDB 7 + Redis 7 running in Docker.

---

## EXECUTIVE SUMMARY

SpiceGarden is a large, well-structured food-delivery monorepo (NestJS backend, 5 Next.js/Expo/Electron frontends, 6 shared packages). The backend is genuinely functional: it boots, serves real data from PostgreSQL, and the full authentication path (register → JWT → protected route) was **executed and verified end-to-end**. However, the platform does **NOT** meet the certification gate required for "CERTIFIED FOR PRODUCTION."

Every hard gate in the audit specification fails on at least one axis:

1. **React Doctor ≥100 across ALL apps — FAIL.** Actual measured scores: super-admin 100, customer-web 79, delivery-partner 73, restaurant-dashboard 73. The aggregator total is 73/100. `customer-mobile` was **never scanned** by React Doctor.
2. **No hydration errors — FAIL.** Browser automation captured **7 hydration mismatches** and **12 console errors** on customer-web.
3. **Backend migrations/rollback — FAIL.** Zero migration files exist; production config relies on `synchronize: false` + `migrationsRun: true` pointing at non-existent migration globs. A clean-machine production DB cannot be provisioned from code.
4. **No missing mobile functionality — FAIL.** 20 mobile source files were deleted on the audited branch (order history, notifications, onboarding, payment methods, WebSocket, push-notification services). The mobile `build` script is `tsc --noEmit` only — it produces **no runnable bundle**; mobile runtime was NOT VERIFIED.

The repository also contains ~120 generated audit/markdown artifacts (PRODUCTION_CERTIFICATION_REPORT.md, AGENTS.md, etc.) that **assert "100% production readiness / COMPLETE,"** which contradicts directly measured evidence (React Doctor 73, branch coverage 57%, unit tests 124 not 542, prod npm audit 10 moderate). These internal claims are **not evidence** and are themselves a risk signal (institutional investors should treat prior "certification" documents as unreliable).

**VERDICT: ✅ NOT PRODUCTION READY**

---

## REPOSITORY INVENTORY (VERIFIED)

| Category | Count | Evidence |
|---|---|---|
| Applications | 7 | backend, customer-web, customer-mobile, delivery-partner, launcher, restaurant-dashboard, super-admin |
| Shared packages | 6 | api-types, grpc-transport, proto, shared, ui, ux |
| Dockerfiles / compose | multiple | Dockerfile, compose.dev/prod/infra/debug.yaml |
| K8s manifests | 8 | backend-deployment, staging, production-hardened, cdn-ingress, postgres-ha, redis-cluster, secrets, configmap |
| GitHub workflows | 3 | ci-cd.yml, react-doctor.yml, rollback.yml |
| DB engines | 3 | PostgreSQL 16 (TypeORM), MongoDB 7 (Mongoose), Redis 7 |
| Load-test stages | 8 | stage-1-1k … stage-8-1m (k6) — present, NOT EXECUTED this audit |

---

## FRONTEND AUDIT (VERIFIED via build + browser automation)

| App | Build | React Doctor | Runtime Verified | Notes |
|---|---|---|---|---|
| customer-web | PASS (build + .next) | **79/100** | YES (Playwright) | 7 hydration errors, 12 console errors, `/` networkidle timeouts, `/restaurants` 404 page |
| super-admin | PASS | **100/100** | NO (not browser-tested) | Only app at target score |
| delivery-partner | PASS | **73/100** | NO | Expo/React Native — no runtime render verified |
| restaurant-dashboard | PASS | **73/100** | NO | Next.js — no runtime render verified |
| customer-mobile | `tsc --noEmit` only | NOT SCANNED | **NO — no bundle built** | 20 source files deleted this branch |
| launcher | PASS (Electron main+renderer) | n/a | NO | Desktop shell builds |

**React Doctor aggregate: 73/100** (tool output, not the "100" claimed in AGENTS.md).
**Gate "React Doctor ≥100 all apps": FAIL.**

### Customer-web browser automation findings (Playwright/Chromium, 1280×800)
- ROUTE `/` → 200, renders real content ("Recommended Restaurants", WELCOME50). **But `networkidle` never settles (loading indicator / pending request).**
- ROUTE `/auth` → **404 (no such page route)**.
- ROUTE `/restaurants` → **404 page** (backend `/restaurants` API works; frontend route missing).
- ROUTE `/profile` → 200 but "Failed to fetch user profile" (unauthenticated 401 — expected, but no graceful empty state in some views).
- CONSOLE_ERRORS = **12** (repeated 404 + 401).
- PAGE_ERRORS = **7 hydration mismatches** ("server rendered HTML didn't match the client").
- FAILED_REQUESTS = 4 (incl. `/api/analytics` aborted, font aborted).
**Gate "No hydration errors / no console errors": FAIL.**

---

## BACKEND AUDIT (VERIFIED via runtime API execution)

Backend booted cleanly (`nest start`, 0 compile errors, all modules initialized). Real endpoints exercised:

| Endpoint | Method | Result | Evidence |
|---|---|---|---|
| `/health` | GET | 200 `{"status":"ok"}` | VERIFIED |
| `/restaurants` | GET | 200, **real seeded Postgres row** ("Spice Garden - Downtown", UUID, slug) | VERIFIED DB-backed |
| `/search?q=test` | GET | 200 structured response | VERIFIED |
| `/auth/register` | POST | **201**, JWT access+refresh issued, user persisted (UUID) | VERIFIED full path |
| `/auth/login` | POST | **201**, JWT issued | VERIFIED |
| `/auth/me` | GET (Bearer) | **200**, returns persisted user | VERIFIED JWT guard |

Security middleware present and confirmed working: Helmet (CSP/HSTS), CORS allowlist, CSRF (ignored only on login/register), express-mongo-sanitize, HPP, compression, rate limiting (**verified: 429 after 5 attempts**), request timeout, dangerous-method blocking (TRACE/DEBUG/CONNECT → 405), Prometheus `/metrics`, graceful shutdown. Payment gateway factory initializes (stripe). WebSocket `TrackingGateway` subscribed.

**Backend functional completeness: STRONG for the paths tested.** Production DB provisioning is the blocker (see Database).

---

## DATABASE AUDIT (VERIFIED via source + runtime)

- PostgreSQL reachable, tables pre-existing (seed data returned). ✔ Connections OK.
- **Migrations: ZERO files exist** anywhere in `apps/backend`. ✘
- Active production config (`db.module.ts:63`): `synchronize: false`, `migrationsRun: true`, `migrations: ["dist/db/migrations/*.js", …]` → points at **non-existent files**.
- Implication: on a clean production database, `synchronize:false` + no migrations = **tables are never created** → app cannot start. Schema currently exists only because this dev DB was pre-seeded (likely from a prior `synchronize:true` run).
- **Gate "Migrations, Rollback": FAIL.** Clean-machine DB provisioning from code: **NOT VERIFIED / NOT POSSIBLE**.

---

## AUTHENTICATION AUDIT (VERIFIED)

| Flow | Status | Evidence |
|---|---|---|
| Registration | VERIFIED | 201 + JWT + DB row |
| Login | VERIFIED | 201 + JWT |
| JWT (access/refresh) | VERIFIED | token issued, `/auth/me` decodes it |
| Protected routes | VERIFIED | `/auth/me` 200 with Bearer, 401 without |
| Logout / Refresh / Forgot / Reset / OTP / MFA / Social | Declared in routes | Endpoints exist (`/auth/logout`, `/auth/refresh-token`, `/auth/forgot-password`, `/auth/otp`, `/mfa/*`, `/auth/google`). **Not executed end-to-end this audit** (rate-limit window + scope). |
| RBAC / Permission guards | Partial | JWT carries `role`; guards present but not exercised per-role. |
| Session restore / Remember-me / Logout-all | NOT VERIFIED | Not exercised. |

Backend auth is functionally sound for the core path. Full multi-role matrix NOT VERIFIED.

---

## API INTEGRATION AUDIT (PARTIAL)

- Backend exposes ~150+ routes across auth, orders, payments, restaurants, drivers, wallet, kitchen, compliance, admin, search, delivery-pricing, driver-assignment, subscriptions, chargebacks, GST.
- customer-web uses `packages/shared` API client; observed real calls (`/api/restaurants` 200, profile 401).
- **Mocks:** NOT systematically scanned for this audit. `local-sqlite-repository.module.ts` and a fake `localReviewModelProvider` exist for local dev — these are dev-only shims, not frontend mocks, but indicate dual data layers.
- **Gate "every frontend screen connected to real APIs, no mock data": NOT VERIFIED** (full screen-by-screen mapping not completed; `/restaurants` frontend route 404 while API works indicates at least one broken integration).

---

## RESPONSIVE UI AUDIT (NOT VERIFIED)

Browser automation was run only at 1280×800. The 12 breakpoints (320–2560px) required by the audit were **NOT tested** due to scope. Marked NOT VERIFIED per zero-assumption policy.

---

## UI/UX, PERFORMANCE, SECURITY, TEST, INFRA AUDITS

**Security (executed):** `infra/scripts/security-tests.js` → 0 vulnerabilities (SQLi, XSS, rate-limit, auth-bypass, path-traversal all SECURE). `npm audit --omit=dev` → **10 moderate, 0 high/critical** (contradicts AGENTS.md "31 moderate dev-only" — actual prod-facing count is 10). Helmet/CSRF/CORS/mongo-sanitize verified in `main.ts` and `csrf.middleware.ts`. OWASP-top-10 basics present.
→ Security gate "no critical/high": PASS (moderate remain).

**Performance (partial):** Lighthouse NOT run (not installed/executed). React Doctor 73 (proxy for code health). Hydration errors + non-settling `networkidle` indicate runtime perf issues. Bundle sizes observed (~335 kB first-load shared for super-admin). Lighthouse gate: NOT VERIFIED.

**Tests (executed this session):**
| Suite | Result | Count |
|---|---|---|
| Unit (`test:unit`) | PASS | **124 tests / 25 suites** (NOT the 542 claimed in AGENTS.md) |
| Integration | PASS | multiple suites, 9+1+2+3+2+2… tests |
| E2E | PASS | 75 tests / 13 suites |
| Security | PASS | 0 vulns |

**Backend coverage (measured):** Statements 86.49%, Lines 89.41%, Functions 76.95%, **Branches 57.48%** — below the 80% branch threshold claimed (81.1%).

**Infra/CI/CD (verified present, not executed):** `ci-cd.yml`, `react-doctor.yml`, `rollback.yml` exist. K8s manifests exist. Dockerfiles exist. `docker-compose` up brings Postgres/Mongo/Redis. Actual `kubectl apply` deployment, backup/DR scripts, autoscaling validation: **NOT EXECUTED** (no cluster). Marked NOT VERIFIED.

---

## BUSINESS FEATURE MATRIX (VERIFIED / NOT VERIFIED)

| Area | Status | Evidence |
|---|---|---|
| Customer: signup/login | VERIFIED | register/login 201 |
| Customer: browse/search/restaurants | PARTIAL | `/restaurants` API 200; frontend `/restaurants` route 404 |
| Customer: checkout/payment/tracking | NOT VERIFIED | routes exist (200 in browser), not executed end-to-end |
| Restaurant: onboarding/menu/kitchen/orders/payouts | Declared | endpoints mapped; not executed |
| Delivery: onboarding/assignment/earnings | Declared | endpoints mapped; not executed |
| Admin: dashboards/restaurants/drivers/reports | Declared | endpoints mapped; not executed |
| Mobile features (history, notifications, onboarding, payment methods, WebSocket, push) | **REMOVED** | 20 files deleted this branch |

---

## PRODUCTION BLOCKERS (evidence-backed)

| # | Severity | Issue | Evidence | Fix | Effort |
|---|---|---|---|---|---|
| B1 | CRITICAL | No DB migrations; `synchronize:false` + empty migration globs → clean prod DB cannot be provisioned | `db.module.ts:63-65`; zero migration files | Author TypeORM migrations for all entities; CI runs `migration:run` | 8–12 dev-days |
| B2 | CRITICAL | React Doctor <100 on 3/4 scanned apps (73–79) + mobile never scanned | `react-doctor-output.txt` | Fix hydration/locale/fetch-in-effect warnings | 5–8 dev-days |
| B3 | HIGH | 7 hydration mismatches + 12 console errors on customer-web | Playwright run | Resolve SSR/client mismatch (dates, redirects, fetch-in-effect) | 3–5 dev-days |
| B4 | HIGH | 20 mobile source files deleted this branch (order history, notifications, onboarding, payment methods, WebSocket, push) | `git diff --diff-filter=D` | Restore/re-implement missing mobile features | 10–15 dev-days |
| B5 | HIGH | Mobile produces no runnable bundle (`build` = `tsc --noEmit` only) | `customer-mobile/package.json` | Add Expo web/iOS/Android build + verify | 3–5 dev-days |
| B6 | MEDIUM | Branch coverage 57% (claimed 81%) | `coverage-summary.json` | Add tests for untested branches | 5–10 dev-days |
| B7 | MEDIUM | `/restaurants` frontend route 404 while API works | Playwright `/restaurants` → 404 | Wire frontend route to API | 1 dev-day |
| B8 | MEDIUM | Internal docs claim "100% ready / 542 tests / 91% cov" — false vs measured | AGENTS.md vs measured | Correct documentation; freeze unreliable self-certification | 1 dev-day |
| B9 | LOW | 10 moderate npm-audit findings (prod) | `npm audit --omit=dev` | Patch transitive deps | 1–2 dev-days |

---

## REMAINING ENGINEERING ESTIMATE (evidence-based)

| Dimension | Completion | Justification |
|---|---|---|
| Repository | 95% | Monorepo builds; structure complete |
| Backend | 88% | Core paths verified working; migrations missing (B1) |
| Frontend (web) | 70% | Builds pass; hydration/React Doctor fail (B2/B3) |
| Mobile | 45% | Deleted features + no bundle (B4/B5) |
| Authentication | 80% | Core verified; full matrix not (B-auth partial) |
| API Integration | 70% | Endpoints exist; full screen mapping not done |
| Database | 55% | Runs, but no migrations/rollback (B1) |
| Infrastructure | 75% | Manifests/CI present; deploy not executed |
| Security | 85% | 0 high/critical; 10 moderate; middleware verified |
| Performance | 50% | Lighthouse NOT VERIFIED; hydration issues |
| Testing | 75% | Unit/Integration/E2E pass; coverage below claim |
| Documentation | 40% | Pervasive false "100% ready" claims (B8) |
| **Production Readiness** | **~62%** | Fails 4 of 11 hard gates |
| **Launch Readiness** | **NO** | Not certifiable for paying customers |

---

## FINAL CERTIFICATION REPORT — VERDICT

**✅ NOT PRODUCTION READY**

### Rationale (only verified evidence)
1. React Doctor aggregate **73/100**, three apps below 100, mobile unscanned → fails "≥100 all apps".
2. **7 hydration errors + 12 console errors** on customer-web → fails "no hydration/console errors".
3. **Zero DB migrations**, production config cannot create schema on a clean DB → fails "migrations/rollback" and "clean-machine install".
4. Mobile app **has no runnable build and is missing 20 source files** → fails "mobile renders / no missing features".
5. Branch coverage **57%** (below 80% threshold) and unit tests **124** (not 542 as claimed) → test claims overstated.
6. Lighthouse, full responsive matrix, K8s deploy, backup/DR, load/chaos at scale: **NOT VERIFIED** (not executed).

### Investment Risk Assessment
**HIGH.** The codebase is real and the backend is credibly engineered, but the repository's own documentation repeatedly certifies "100% production ready / COMPLETE," which is directly contradicted by measured evidence. This pattern of unsubstantiated certification is itself a material due-diligence red flag. The gap between claimed and actual state suggests prior "audits" (the ~120 generated report files) should not be relied upon. Minimum remediation before any production launch: B1–B5 (≈29–45 dev-days), plus verification of currently-unverified gates.

### Recommended Fix Order
1. B1 DB migrations (blocker for any deploy)
2. B4/B5 Mobile feature restore + build pipeline
3. B2/B3 React Doctor + hydration fixes
4. B6/B7 Test coverage + frontend route wiring
5. B8 Documentation correction; B9 dependency patches

*End of independent certification audit. All PASS/FAIL determinations above are based on executed commands, runtime API responses, browser automation output, database inspection, or direct source inspection recorded during this session.*
