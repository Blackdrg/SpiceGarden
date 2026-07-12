# SpiceGarden — Independent Enterprise Audit & Production Readiness Certification

**Audit version:** 5.0 (independent)
**Date:** 2026-07-12
**Auditor role:** Independent Principal Architect / Backend / Frontend / DevOps / Security / QA / SRE
**Branch under test:** `feat/add-react-doctor` (commit `2dd5d449`)
**Method:** Empirical only. Every claim below is backed by an executed command, a runtime result, or source inspection. Items that could not be empirically verified are marked **NOT VERIFIED**.

---

## 1. Executive Summary

SpiceGarden is a **real, substantial monorepo** — not a scaffold. The backend is the strongest component: it type-checks, builds, lints clean, and passes **1,094 unit/integration/e2e tests across 68 suites** (1 skipped). Security middleware (helmet, CSRF, CORS, rate-limit, mongo-sanitize, encryption, vault, RBAC guards) is genuinely implemented. `customer-web` (Next.js) builds successfully with 30 compiled routes.

However, the repository is **NOT production ready** as a whole:

- **`delivery-partner` fails its own typecheck/build** (`tsc --noEmit` errors on `packages/ui/Button.module.css` resolution and `fontWeight` typing). One of the six shipping apps does not compile.
- **Mobile apps have no real build**: `customer-mobile` and `delivery-partner` `build` scripts are only `tsc --noEmit` (typecheck). There is no bundling/binary artifact step, so no shippable native app can be produced from `npm run build`.
- **`driver-app` is dead code**: two stray React Native files (`App.js`, `App.tsx`) with no `package.json`, not wired into any workspace.
- **Database schema is a single monolithic migration** (1 of 67 entities' worth of tables). `synchronize: false` in production means any entity change after the initial migration has **no migration** → schema-drift risk.
- The project's own `AGENTS.md` claims **"Overall Production Readiness Score: 100% (COMPLETE)"** and **"542 passed"** tests. Both are inaccurate: tests actually number **1,094** (under-reported), and delivery-partner does not build (over-reported). Independent verification contradicts the self-certification.

> **VERDICT: NOT PRODUCTION READY** (backend + customer-web are Release-Candidate quality; the system as a whole is not).

---

## 2. Repository Inventory

| Item | Status | Evidence |
|---|---|---|
| Root npm workspace monorepo | Exists | `package.json` workspaces `apps/*`, `packages/*` |
| Apps (declared) | 8 (1 dead) | backend, customer-web, customer-mobile, delivery-partner, restaurant-dashboard, super-admin, launcher, **driver-app (no package.json → dead)** |
| Packages (declared) | 6 (1 no manifest) | api-types, grpc-transport, proto, shared, ui, **ux (no package.json, docs-only)** |
| Infra (Docker/k8s/compose) | Exists | 8 Dockerfiles, 7 k8s yamls, `compose.dev.yaml`, `.env.example`, root `Dockerfile` |
| Infra scripts | Exists | 41 scripts in `infra/scripts/` (backup, chaos, load, security, secrets) |
| Docs | Exists (voluminous) | `docs/`, `infra/docs/`, `ux/`, `legal/` |
| Total TS/TSX files (excl node_modules) | 1,007 files / 76,192 LOC | counted via PowerShell |
| Backend source | 296 `.ts` files / 28,442 LOC (excl tests) | counted |

**Missing/empty:** none structurally empty at root level. `ux` package has no `package.json` (not a buildable workspace).

---

## 3. Folder Inventory

| Folder | Purpose | Status |
|---|---|---|
| `apps/backend` | NestJS API | Healthy (build+test+lint pass) |
| `apps/customer-web` | Next.js 15 customer app | Healthy (builds) |
| `apps/customer-mobile` | Expo RN app | Typechecks; **no native build** |
| `apps/delivery-partner` | Expo RN app | **Typecheck FAILS** |
| `apps/restaurant-dashboard` | Next.js 15 | Lint pass; build **NOT VERIFIED** |
| `apps/super-admin` | Next.js 15 | Lint pass; build **NOT VERIFIED** |
| `apps/launcher` | Electron wrapper | Scripts present; build **NOT VERIFIED** |
| `apps/driver-app` | **Orphaned RN app** | Dead (no manifest, not referenced) |
| `packages/ui` | Shared web/RN components | Mixed CSS-module imports break RN consumption |
| `packages/ux` | UX specs (markdown) | Docs-only, not a package |
| `scripts/` | One-off migration/cleanup utilities | **Messy**: many `fix-*.js`, `replace-emojis*.js`, `migrate-inline-styles*.js` — cleanup artifacts |

**Circular dependencies:** NOT VERIFIED (no dependency-graph tool run).
**Broken imports:** confirmed in `delivery-partner` → `packages/ui/Button.module.css` (see §19).

---

## 4. File Inventory (sampled)

Backend is the densest: 42 controllers, 59 services, 55 modules, 67 entities. Frontends are smaller:

| App | TSX files | Approx LOC | Notes |
|---|---|---|---|
| customer-web | 28 | 4,696 | 30 pages; builds |
| customer-mobile | 23 | 6,761 | 15 screens; typechecks |
| delivery-partner | 8 | 1,316 | 6 screens; **typecheck fails** |
| restaurant-dashboard | 11 | 1,810 | lint pass |
| super-admin | 25 | 2,021 | lint pass |

**TODO/FIXME/placeholder:** NOT systematically counted (grep not run across all). Partial.
**Mock/demo:** `localReviewModelProvider` in `db.module.ts:98` is an in-memory mock for SQLite local dev — intentional, not dead.

---

## 5. Package Inventory

| Workspace | Build | Lint | Tests | Health |
|---|---|---|---|---|
| backend | ✅ `tsc` clean | ✅ 0 errors | ✅ 1094 pass | Healthy |
| customer-web | ✅ `next build` (30 routes) | ✅ 0 errors | partial | Healthy |
| customer-mobile | ⚠️ typecheck only | NOT run | NOT run | Partial |
| delivery-partner | ❌ typecheck error | NOT run | NOT run | **Broken** |
| restaurant-dashboard | NOT VERIFIED | ✅ | NOT run | Partial |
| super-admin | NOT VERIFIED | ✅ | NOT run | Partial |
| launcher | NOT VERIFIED | NOT run | NOT run | Unknown |
| api-types / grpc-transport / proto / shared / ui | scripts exist | partial | partial | Partial |

---

## 6. Dependency Inventory

Root `package.json` pins: `next ^15.5.18`, `react ^19.2`, `typeorm ^0.3.20`, `electron ^42`, `expo ^56`, `react-native ^0.85`. Overrides force `multer 2.2.0`, `socket.io 4.8.3`, `postcss 8.5.10`, `next 15.5.18` (supply-chain hardening present).

- **Used:** vast majority verified by import graph (backend compiles).
- **Unused / removal candidates:** NOT VERIFIED (no `depcheck` run).
- **Security risk:** `npm audit` per AGENTS.md = 31 moderate (dev toolchain only, 0 high/critical) — **NOT re-verified by auditor**; treated as NOT VERIFIED.
- **Version conflicts:** none surfaced during backend/customer-web builds.

---

## 7. Frontend Audit

### customer-web (Next.js 15, React 19) — VERIFIED builds
30 pages compiled: auth, cart, checkout, history, legal/privacy, legal/terms, menu, mfa-setup, MfaDisable, notifications, offers, order-details, payment-methods, profile, reset-password, restaurant, search, subscriptions, tracking, wallet, plus `_app`/middleware.
- Auth/MFA/OTP flows: present (auth.tsx, mfa-setup.tsx, MfaDisable.tsx).
- Cart/Checkout/Payments/Wallet/Subscriptions/Tracking: pages exist.
- Accessibility/SEO/Responsive: **NOT VERIFIED** (no axe/Lighthouse run).

### customer-mobile (Expo) — VERIFIED typechecks; no bundle
- Screens exist (15 matched). Build = `tsc --noEmit` only. No `eas build`/native artifact step verified.

### delivery-partner (Expo RN) — **BUILD FAILS**
- `npm run build` → TS2307 cannot find `./Button.module.css`, plus `fontWeight` string/union mismatch. **Blocker.**

### restaurant-dashboard / super-admin (Next.js) — lint pass; build NOT VERIFIED
- Component counts modest (11 / 25 tsx). Production build not executed by auditor.

### launcher (Electron) — NOT VERIFIED

**Per-screen/component/hook verdict:** customer-web = Working (build evidence). Others = Partial/Missing (no executed runtime).

---

## 8. Backend Audit — VERIFIED

- **Controllers:** 42 files; **279 `@Get/@Post/@Put/@Delete` route handlers** (ripgrep).
- **Services:** 59. **Modules:** 55.
- **Auth:** JWT, refresh tokens, Google/Facebook OAuth, OTP passwordless, MFA (setup/enable/disable) — all present (`services/auth/*`).
- **RBAC:** `roles.guard.ts`, `permission.guard.ts`, `roles.decorator.ts`, `permissions.ts` present.
- **Validation:** `class-validator`, global `ValidationPipe` in `main.ts`.
- **Security middleware (all present in `main.ts`):** helmet, hpp, compression, cookieParser, express-rate-limit (+ Redis store), express-mongo-sanitize, csrfProtection, prom-client metrics.
- **WebSockets:** socket.io present (`@types/socket.io-client` in driver-app; server impl NOT deeply verified).
- **Queues/Redis/BullMQ:** Redis rate-limit store present; BullMQ usage NOT confirmed in source scan.
- **Payments:** Stripe webhook entities, COD gateway, chargeback, fraud-hardening, refunds, idempotency — present (tested).
- **Notifications:** provider/analytics/preferences tables + queue folder present.
- **OpenAPI:** NOT VERIFIED (no swagger doc confirmed).
- **Health checks:** NOT explicitly verified (likely via Nest but not confirmed).

---

## 9. Database Audit

- **Entities registered:** 67 in `db.module.ts` (lines 52–93), plus 4 payment entities imported separately (lines 44–47).
- **Migrations:** **1** — `1783778923544-InitialSchema.ts`, a monolithic schema creating ~60 tables with FKs/indexes/constraints (verified by reading the file: users, orders, wallets, drivers, payments, gst, inventory, kds-adjacent, notifications, refunds, disputes, etc.).
- **Config:** production = `synchronize: false`, `migrationsRun: true`, `migrations: ["dist/db/migrations/*.js"]` (`db.module.ts:134-146`). Dev = `synchronize: true` (SQLite).
- **Seeders:** NOT VERIFIED (no seed script found in backend; `infra/scripts/e2e-seed-fixtures.js` exists).
- **Risk — schema drift:** With `synchronize: false` and only one initial migration, any entity added/modified after initial commit has **no forward migration**. High-risk for production evolution.
- **MongoDB:** Mongoose `Review` schema also configured.
- Every core entity has entity + migration coverage (within the monolith). Relations present (FKs in migration).

---

## 10. Business Feature Matrix

| Feature | Status | Evidence |
|---|---|---|
| Customer auth/OTP/MFA | Implemented | auth + mfa controllers/services |
| Cart / Checkout / Payments | Implemented (web) | pages + backend routes |
| Wallet / COD | Implemented | wallet.controller (credit/debit/cod/refund) |
| Coupons / Offers | Implemented | coupons tables + routes |
| Subscriptions | Implemented | subscription entity + page |
| Loyalty / Referral | Partial | referral entity exists; loyalty proto present |
| Inventory / KDS | Partial | inventory entities; kitchen module present |
| Driver scoring | Implemented | driver_scores entity + service |
| Analytics / Reports | Partial | analytics module + payout reports |
| Notifications | Implemented (tables) | notifications + queue |
| Support / Tickets / Disputes | Implemented | support.controller |
| CMS / Menu moderation | Implemented | menu_moderation table + routes |
| Feature flags | NOT VERIFIED | not found in scan |
| GST / Invoices | Implemented | gst_details, hsn_sac, restaurant_gst |
| Ratings / Reviews | Implemented | review controller + mongo schema |
| Audit logs | Implemented | audit_logs + AuditLogEntity |
| Settlement / Payout | Implemented | payout_reports + routes |

---

## 11. Workflow Matrix

| Workflow | Status |
|---|---|
| Customer journey (web) | Implemented & builds |
| Restaurant onboarding | Implemented (restaurant-ops) |
| Delivery assignment | Implemented (driver-assignment service, tested) |
| Payment / Refund flow | Implemented & tested |
| Auth / Password reset / OTP | Implemented |
| Order lifecycle | Implemented (orders entity + routes) |
| Notification flow | Implemented (tables + queue) |
| Settlement | Implemented |

All **code paths exist**; end-to-end runtime execution against live infra **NOT VERIFIED** (no E2E run against real DB/Redis/Stripe).

---

## 12. API Matrix

- **279 route handlers** across 42 controllers (verified).
- Auth: 16 routes (login, MFA, OTP, register, refresh, logout, password reset, OAuth).
- Wallets, reviews, search, maps, restaurant ops, support, driver — all present.
- Full OpenAPI doc: **NOT VERIFIED**.

---

## 13. Security Report — VERIFIED (static)

| Control | Present | Evidence |
|---|---|---|
| Helmet | ✅ | `main.ts:8` |
| CORS (origin allowlist) | ✅ | `security/cors-origin.ts` |
| CSRF | ✅ | `security/csrf.middleware.ts` (+ spec) |
| Rate limiting (Redis) | ✅ | `security/redis-rate-limit.store.ts` |
| NoSQL injection guard | ✅ | `express-mongo-sanitize` |
| HPP / compression | ✅ | `main.ts` |
| Encryption / Vault | ✅ | `security/encryption.service.ts`, `vault.service.ts` |
| Password hashing | ✅ | `passwordHash` column + auth service |
| JWT / refresh | ✅ | auth module |
| RBAC guards | ✅ | roles/permission guards |
| Secrets validation | ✅ | `requireSecrets` in `main.ts` prod gate |
| Security test suite | ✅ | `security-tests.js`, `penetration-tests.js`, csrf/cors specs |

- **OWASP coverage:** strong statically. Runtime pen-test **NOT VERIFIED** by auditor (scripts exist, not executed here).
- **MFA:** real TOTP secret storage (`mfa_secrets` table) — good.

---

## 14. Testing Report — VERIFIED (backend)

- `npm test` (jest) → **Test Suites: 68 passed, 1 skipped; Tests: 1,094 passed, 1 skipped**. (AGENTS.md claimed 542 — under-reported.)
- Note: `test:unit` script only runs 3 files; `npm test` runs all 68 suites. 
- Worker teardown warning present (open handle leak) — minor.
- Frontend tests: `packages/ui` has jest tests; app-level frontend unit/integration/e2e **NOT executed** by auditor.
- Coverage 91% (AGENTS.md): **NOT RE-VERIFIED** → NOT VERIFIED.
- Load/chaos/e2e-at-scale: scripts exist (k6 stages to 1M, chaos runner). **NOT EXECUTED** → NOT VERIFIED.

---

## 15. Performance Report — NOT VERIFIED

- No benchmarks executed by auditor.
- `next build` bundle: First Load JS ~286 kB shared; largest route `/tracking` 15.9 kB / 302 kB. Reasonable but **not profiled**.
- API latency, DB/Redis throughput, cache hit rate: **NOT VERIFIED**.

---

## 16. Deployment Report — Static only (NOT VERIFIED at runtime)

- 8 Dockerfiles (backend, customer-web, delivery-partner, restaurant-dashboard, super-admin, root).
- k8s: `production-hardened.yaml`, `staging.yaml`, `cdn-ingress.yaml`, `postgres-ha.yaml`, `redis-cluster.yaml`, `configmap`, `secrets`.
- `compose.dev.yaml` exists; `.env.example` present.
- Backup/DR/chaos scripts present.
- **Runtime deployment NOT verified** (no cluster available; kubectl/compose not exercised by auditor).
- **Gap:** Dockerfiles exist for `delivery-partner` but the app does not typecheck — image build would fail.

---

## 17. Documentation Report

- Extensive: `docs/`, `infra/docs/` (LOAD_BENCHMARKS, MULTI_REGION_ARCHITECTURE, API_VERSION_STRATEGY), `ux/phase-1/*`, `legal/`, `infra/*.md`.
- **Credibility issue:** `AGENTS.md` self-certifies "100% COMPLETE / 100% production readiness," which is contradicted by auditor evidence (delivery-partner build failure, mobile no-build, single migration). Documentation is partly aspirational/marketing.

---

## 18. Technical Debt

- Monolithic single migration (no incremental schema evolution).
- `scripts/` directory full of ad-hoc cleanup scripts (`fix-*.js`, `replace-emojis*.js`, `migrate-inline-styles*.js`) — should be removed.
- Shared `packages/ui` mixes CSS-module (web) imports that break React Native consumers (root cause of delivery-partner failure).
- Mobile apps lack real build pipelines.
- Worker-handle leak in tests.

---

## 19. Dead Code

- **`apps/driver-app/`** — `App.js`, `App.tsx` (a full RN map/socket tracking app) with **no `package.json`**, not referenced by any workspace. Orphaned.
- `scripts/` cleanup utilities (see §18).

## 20. Duplicate Code

- `scripts/` contains multiple near-duplicate emoji/inline-style migration scripts (`fix-emojis.js`, `fix-emojis2.js`, `replace-emojis.js`, `replace-emojis2.js`, `migrate-inline-styles*.js`). Duplicated tooling.
- `packages/grpc-transport`, `packages/proto`, `packages/api-types` each ~640–650 files — likely generated/overlapping; **NOT VERIFIED** for overlap.

## 21. Missing Features (NOT VERIFIED / Partial)

- Feature flags: not found.
- OpenAPI/Swagger doc: not confirmed.
- BullMQ explicit usage: not confirmed.
- Real native mobile build/release pipeline.
- Incremental DB migrations.

## 22. Broken Features

- **`delivery-partner` build/typecheck** — fails (TS2307 + fontWeight). **BLOCKER.**
- Mobile "build" produces no artifact.

## 23. Partial Features

- Loyalty, Inventory/KDS, Analytics — entities/services present but depth NOT VERIFIED.
- Launcher (Electron) — unverified.

---

## 24. Unused Dependencies — NOT VERIFIED (no depcheck run)
## 25. Missing Dependencies — NOT VERIFIED
## 26. Missing Configurations

- No `.env` committed (expected; `.env.example` present) — OK.
- `delivery-partner`/`customer-mobile` tsconfig not resolving `packages/ui/css.d.ts` → **missing/incorrect tsconfig path or `paths` mapping for the shared UI package** (root cause of §22).

---

## 27. Launch Blockers

1. **delivery-partner does not compile** (`tsc --noEmit` errors). Shipping app broken.
2. **No native mobile build pipeline** — `npm run build` for RN apps is typecheck only.
3. **Single monolithic DB migration + `synchronize:false`** → no safe schema evolution; drift risk.
4. **driver-app dead code** committed to repo.
5. **Self-certification (`AGENTS.md` 100%) is inaccurate** — indicates process/quality-gate gap, not just code.

---

## 28. Risk Register

| Risk | Likelihood | Impact | Evidence |
|---|---|---|---|
| delivery-partner ship blocked | High | High | build fails |
| Mobile can't be released (no artifact) | High | High | build=typecheck only |
| Schema drift in prod | Med | High | 1 migration, sync off |
| Orphaned code confusion | Med | Low | driver-app |
| Overstated readiness masks gaps | High | Med | AGENTS.md vs audit |
| Unverified runtime security/perf | Med | High | not executed |

---

## 29. Recommended Fix Order

1. Fix `delivery-partner` build: add `packages/ui` `css.d.ts` ambient type resolution to RN tsconfig (or guard CSS-module imports out of RN builds). Resolve `fontWeight` typing.
2. Add real mobile build (EAS/`android`/`ios`) and CI for artifacts.
3. Introduce incremental TypeORM migrations; add `migration:generate` CI gate to prevent drift.
4. Remove `apps/driver-app` dead code (or promote to a real workspace).
5. Purge `scripts/` ad-hoc cleanup files.
6. Correct `AGENTS.md` readiness score to reflect audit truth.
7. Execute (don't just script) load/chaos/pen-security and capture real numbers.

---

## 30. Estimated Remaining Work

- delivery-partner build fix: ~0.5–1 day.
- Mobile build pipeline + CI: ~3–5 days.
- Migration strategy + drift remediation: ~2–3 days.
- Dead-code cleanup + docs correction: ~1 day.
- Runtime verification (load/chaos/security/perf): ~3–5 days.
- **Total: ~2–3 weeks** to reach a defensible "Release Candidate."

## 31. Estimated Timeline

~3 weeks to RC assuming 1–2 engineers, contingent on fixing the blocker first.

---

## 32. Production Readiness Score (evidence-justified)

| Dimension | Score | Justification |
|---|---|---|
| Engineering (backend) | 90% | builds, lints, 1094 tests pass |
| Feature (backend) | 85% | broad coverage, some partial |
| Frontend | 55% | web strong; delivery broken; mobile no-build |
| Database | 70% | solid schema, single migration risk |
| Testing | 75% | 1094 backend tests; FE/e2e unverified |
| Deployment | 55% | artifacts exist; runtime unverified; DP breaks image |
| Security | 85% | strong static; runtime unverified |
| Performance | NOT VERIFIED | no benchmarks run |
| Documentation | 60% | extensive but overstated |
| **Overall** | **~68%** | blocker (DP) + mobile-no-build + drift drag it down |

## 33. Engineering Completion Score

~78% (backend mature; frontends uneven; deployment/verification incomplete).

---

## 34. Certification

# ❌ NOT PRODUCTION READY

**Rationale (verified evidence only):**
- `delivery-partner` **fails to build** (TS2307 + typing errors).
- Mobile apps have **no buildable artifact** pipeline.
- Database relies on a **single monolithic migration** with `synchronize:false` → no safe evolution.
- `driver-app` is **dead/orphaned** code.
- The repository's own `AGENTS.md` claims 100% readiness, which is **demonstrably false**.

**What IS production-grade (Release-Candidate quality):**
- Backend: type-check ✅, build ✅, lint ✅, **1,094 tests ✅**, 279 routes, full security middleware.
- customer-web: lint ✅, **`next build` ✅ (30 routes)**.

**Path to certification:** resolve §27 blockers and complete §29 fix order; then re-audit. Until then, the system may be certified **for staging only** at best.
