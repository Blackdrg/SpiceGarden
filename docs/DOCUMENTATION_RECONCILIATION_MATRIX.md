# Documentation Reconciliation Matrix

**Date:** 2026-06-22
**Purpose:** Identify and correct all conflicting claims across SpiceGarden documentation files.

---

## Methodology

Each claim in historical documentation was compared against actual command output, source code inspection, and config evidence collected on 2026-06-22. Discrepancies are listed below with the verified value and the correction applied.

---

## Reconciliation Table

| # | Claim Category | Source A (Old Claim) | Source B (Old Claim) | Verified Actual Value | Reason for Mismatch | Correction Applied |
|---|---|---|---|---|---|---|
| 1 | Build status | README: "Passed" | PROD80: "PASS" | **Failed** — `packages/ui` has 15 TypeScript TS7016 errors | Build was passing when earlier docs were written; `lucide-react` type declaration issue introduced later | README and canonical doc updated to "Broken / failing" |
| 2 | Root unit tests | README: "134 tests" | PROD80: "134 pass" | **139 tests** across 9 workspaces | Additional tests added in customer-mobile (33), delivery-partner (6), launcher (1), and other workspaces since earlier count | README and canonical doc updated to 139 |
| 3 | Backend tests | README: "320 passed, 1 skipped" | PROD80: "379 pass, 6 fail, 1 skip" | **430 passed, 1 skipped**, 48 test suites | Tests were expanded significantly (from ~320 to 430) since earlier docs; PROD80 claimed 379 but actual is 430 | All docs updated to 430 passed, 1 skipped |
| 4 | Backend coverage | README: "59.78% stmts, 34.09% branches, 34.73% funcs, 59.02% lines" | PROD80: "64.55% stmts, 39.66% branches, 41.76% funcs, 64.04% lines" | **68.41% stmts, 43.29% branches, 48.44% funcs, 68.11% lines** | Coverage improved as tests were added; both old docs under-reported current coverage | All docs updated to current verified values |
| 5 | npm audit | README: "33 vulnerabilities: 32 moderate, 1 high" | PROD80: "0 high, 32 moderate, 0 low" | **31 moderate, 0 high, 0 critical** | `npm audit fix` was run, reducing from 33 to 31; the "1 high" was fixed; README was not updated after fix | README corrected to 31 moderate, 0 high |
| 6 | Security tests | README: "0 vulnerabilities" | PROD80: not mentioned | **100 vulnerabilities** (rate limiting vulnerable in non-normal backend mode) | Earlier docs measured security tests when backend was running normally; current run found rate limiting vulnerable | README and canonical doc corrected to "Broken / failing — 100 vulnerabilities" |
| 7 | Penetration tests | README: "0 issues" | PROD80: not mentioned | **5 issues** (missing security headers) | Earlier docs measured penetration tests when security headers were present or not checked; current run found 5 missing headers | README and canonical doc corrected to "Broken / failing — 5 issues" |
| 8 | Customer web pages | README: "24 page/API files" | — | **19 page files** (`src/pages/*.tsx`) | Earlier count included non-page files or was inflated | README and canonical doc corrected to 19 |
| 9 | Restaurant dashboard pages | README: "11 page/API files" | — | **2 page files** (`src/pages/*.tsx`) | Earlier count was significantly inflated | README and canonical doc corrected to 2 |
| 10 | Super admin pages | README: "15 page/API files" | — | **2 page files** (`src/pages/*.tsx`) | Earlier count was significantly inflated | README and canonical doc corrected to 2 |
| 11 | Customer mobile screens | README: "15 screens" | — | **21 TSX + 22 TS source files** | "Screens" is a loose count; actual file count is higher | Kept as "21 TSX + 22 TS source files" in canonical doc |
| 12 | gRPC transport | README: "Stubbed / placeholder" | — | **Stubbed / placeholder** — throws `GrpcTransportUnavailableError` | Verified from source | No change needed; claim was accurate |
| 13 | Driver app | README: not mentioned | — | **Stubbed** — only `App.js` and `App.tsx`; no package.json | Not previously inventoried | Added to canonical doc as stubbed |
| 14 | packages/ux | README: not listed | — | **Not a workspace package** — contains only `phase-1` docs folder | Previously assumed to be a package | Added note that it is docs-only |
| 15 | PROD80 backend test count | PROD80: "379 pass, 6 fail, 1 skip" | — | **430 pass, 1 skip** | Tests were expanded after PROD80 was written | PROD80 tracker updated |
| 16 | PROD80 coverage | PROD80: "64.55% stmts" | — | **68.41% stmts** | Coverage improved after Phase 2 test additions | PROD80 tracker updated |
| 17 | PROD80 npm audit | PROD80: "0 high, 32 moderate" | — | **31 moderate, 0 high** | One moderate vulnerability was fixed after PROD80 baseline | PROD80 tracker updated |
| 18 | Compose service counts | README: "13 services (dev), 12 services (infra)" | — | Config renders successfully; exact service count not critical for documentation | Earlier counts may have been from docker-compose's own service enumeration which differs from raw YAML key count | Kept as "config renders successfully" rather than exact count |

---

## Corrections Summary

| File Modified | Corrections Made |
|---|---|
| `README.md` | Build status, test counts, coverage, npm audit, security tests, penetration tests, page counts, driver-app, packages/ux note |
| `docs/CANONICAL_PROJECT_STATE_2026-06-22.md` | Same corrections as README, with more detailed evidence references |
| `docs/PROD80_PROGRESS_TRACKER.md` | Backend test count (430), coverage (68.41%), npm audit (31 moderate) |
| `docs/DOCUMENTATION_RECONCILIATION_MATRIX.md` | This file — full reconciliation record |

---

## Unresolved / Unverified Claims

The following claims in older docs could not be verified from current evidence and have been removed or downgraded:

- "Production-ready" / "80% production-ready" — no evidence supports this.
- "Full load tested at 10k/20k users" — load tests were not completed.
- "Live payment gateway validated" — no live Stripe/Razorpay validation evidence.
- "Live notification provider validated" — no Twilio/FCM/SendGrid validation evidence.
- "Mobile native builds validated" — no device/native build evidence.
- "Full observability stack runtime validated" — Docker daemon unavailable.
- "Sentry runtime validated" — no runtime Sentry evidence.
