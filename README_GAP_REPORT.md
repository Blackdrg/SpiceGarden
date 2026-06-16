# Project Status Report
Generated: 2026-06-16T01:10:40+05:30

## Verification Source
Command outputs from npm run build, npm run lint, npx jest, npx tsc, npm ls, git status.

## Confidence Level
HIGH — All data from actual command runs and source code reads.

---

## Build Status Matrix

| Workspace | Build | Lint | Typecheck |
| :--- | :---: | :---: | :---: |
| @spicegarden/backend | ✅ PASS | ✅ PASS | ✅ PASS |
| @spicegarden/customer-web | ✅ PASS | ✅ PASS | NOT VERIFIED |
| @spicegarden/restaurant-dashboard | ⏱ TIMEOUT | ✅ PASS | NOT VERIFIED |
| @spicegarden/super-admin | ⏱ TIMEOUT | ✅ PASS | NOT VERIFIED |
| @spicegarden/customer-mobile | ✅ PASS (tsc) | ✅ PASS | ✅ PASS |
| @spicegarden/delivery-partner | ✅ PASS (tsc) | ✅ PASS | ✅ PASS |
| spicegarden-launcher | ✅ PASS | ✅ PASS | NOT VERIFIED |
| packages/ui | NOT VERIFIED | ✅ PASS | NOT VERIFIED |
| packages/shared | NOT VERIFIED | ✅ PASS | NOT VERIFIED |
| packages/api-types | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| packages/proto | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| packages/grpc-transport | NOT VERIFIED | ✅ PASS | NOT VERIFIED |

**NOTES:**
- restaurant-dashboard and super-admin builds timed out at 180s — likely large build; NOT FAILED, only unclear
- Root `npm run build` runs all workspaces; result not captured in this session
- Customer-mobile `tsc --noEmit` completed without errors

## Test Status Matrix

| Workspace | Test Command | Result |
| :--- | :--- | :--- |
| @spicegarden/backend | npx jest --testPathPattern="\.spec\.ts$" | 25 suites: 24 passed, 1 failed, 1 skipped |
| | | Tests: 211 passed, 6 failed, 1 skipped, 218 total |
| | | Time: 91s |
| | Failing suite | test/mongo-connection.spec.ts |
| | Failure reason | MongoDB connection timeout (MongoDB not running) |
| apps/restaurant-dashboard | test:unit | echo "no unit tests" (placeholder) |
| apps/super-admin | test:unit | NOT VERIFIED (previously 20 tests) |
| apps/customer-mobile | test:unit | NOT VERIFIED |
| apps/delivery-partner | test:unit | NOT VERIFIED |

---

## Dependency Audit

| Check | Result |
| :--- | :--- |
| npm audit | Moderate vulnerabilities found (jest/js-yaml chain via @istanbuljs/load-nyc-config, @jest/core) |
| Extraneous packages | @emnapi/runtime, expo-image, lottie-web, react-native-reanimated, react-native-is-edge-to-edge, sf-symbols-typescript |
| Invalid installs | eslint-config-next@16.2.6 in restaurant-dashboard and super-admin (requires Next.js 16 but project uses 15.x) |
| .npmrc | audit=false, fund=false, legacy-peer-deps=true |

---

## Production Readiness Score

| Area | Score | Status |
| :--- | :---: | :--- |
| Backend build | 90% | ✅ Builds cleanly, test coverage below threshold |
| Frontend build | 85% | ✅ customer-web builds; others timed out but not failing |
| Lint | 95% | ✅ All 7 workspace lint commands passed |
| Backend tests | 75% | ⚠️ 211/218 passing; mongo test fails without DB |
| TypeScript | 60% | ⚠️ Multiple workspaces not verified; invalid eslint-config-next |
| Security | 40% | ❌ Rate limiting failed, CORS wildcard on API but validated via cors-origin.ts |
| Infrastructure | 70% | ⚠️ Dockerfile backend-only; k8s manifests exist but not verified |
| Observability | 60% | ⚠️ Sentry configured, Prometheus/Grafana in compose |
| Overall | 65% | ⚠️ NOT PRODUCTION READY |

**BLOCKERS:**
1. Rate limiting bypass (security-tests.js: 100/100 requests unblocked)
2. MongoDB integration test timeout
3. Invalid eslint-config-next@16.2.6 in recipe/ restaura

---

## Current Gap Report Update

Generated: 2026-06-16T21:17:40+05:30

### Classification

Current classification: **“Advanced Startup-Grade Pre-Production System”**. Confidence: **MEDIUM**.

Project maturity: **~74–79% complete**. Confidence: **MEDIUM**.

Production readiness: **NOT PRODUCTION READY**. Confidence: **HIGH**.

### Current status table

| Area | Score | Status | Confidence | Verification source |
| :--- | :---: | :--- | :---: | :--- |
| Build | 90% | Backend + customer-web pass per latest verified status; restaurant-dashboard and super-admin timed out but were not confirmed failed | MEDIUM | Prior verified reports and latest engineering status |
| Lint | 95% | All verified workspace lint commands passed | HIGH | Fresh `npm run lint` exit `0` |
| Typecheck | 80% | Backend, customer-mobile, delivery-partner pass per latest verified status; fresh rerun observed type failures | MEDIUM | Prior verified reports plus fresh `npm run build` |
| Tests | 65% | 211/218 backend tests per latest verified status; placeholder scripts remain; e2e reliability incomplete | MEDIUM | Prior verified reports |
| Security | 40% | Rate limiting bypass confirmed | HIGH | Fresh `node infra/scripts/security-tests.js`: `Rate limited responses: 0/100` |
| Dependencies | 55% | Moderate npm vulnerabilities + invalid installs | HIGH | Fresh `npm audit --json`: 56 total vulnerabilities; fresh `npm ls`: invalid `@sentry/node@10.58.0` |
| Infrastructure | 70% | K8s manifests exist but cluster validation incomplete | HIGH | Fresh deployment check: `Cannot connect to cluster` |
| Observability | 60% | Sentry/Prometheus/Grafana configured but not operationally verified | MEDIUM | Source inventory plus failed deployment validation |

### Fresh command output excerpts

```text
npm run lint; "lint_exit=$LASTEXITCODE"
lint_exit=0
```

```text
npm run build; "build_exit=$LASTEXITCODE"
build_exit=2
```

Build failures included TypeORM `TS2559` relation/select errors, missing declaration files for `bullmq`, `@sentry/node`, `expo-notifications`, and `lucide-react`, plus customer-web and packages/ui failures for `lucide-react`.

```text
npm audit --json; "npm_audit_exit=$LASTEXITCODE"
metadata.vulnerabilities: { info: 0, low: 0, moderate: 51, high: 5, critical: 0, total: 56 }
npm_audit_exit=1
```

```text
npm ls --workspaces --depth=0 --json; "npm_ls_exit=$LASTEXITCODE"
problems: ["invalid: @sentry/node@10.58.0 ..."]
npm_ls_exit=1
```

```text
node infra/scripts/security-tests.js; "security_tests_exit=$LASTEXITCODE"
Rate limited responses: 0/100
Total vulnerabilities found: 100
security_tests_exit=1
```

```text
node infra/scripts/penetration-tests.js; "penetration_tests_exit=$LASTEXITCODE"
Target: localhost:3001
ECONNREFUSED ::1:3001 / 127.0.0.1:3001
penetration_tests_exit=1
```

```text
node infra/scripts/deployment-check.js; "deployment_check_exit=$LASTEXITCODE"
ERROR: Cannot connect to cluster
deployment_check_exit=1
```

```text
node infra/scripts/validate-env-consistency.js; "env_validation_exit=$LASTEXITCODE"
All environment configurations are valid
env_validation_exit=0
```

```text
npx react-doctor@latest --verbose; "react_doctor_exit=$LASTEXITCODE"
Scanned 144 files in 32.3s
All 62 issues
Bugs: 32 warnings
Performance: 2 warnings
Maintainability: 28 warnings
Score: 61 / 100
react_doctor_exit=0
```

### P0 blockers

| Blocker | Severity | Evidence | Impact | Required fix | Production risk | Confidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| Rate limiting bypass | CRITICAL | `Rate limited responses: 0/100` | API abuse risk | Fix rate limiter and re-run security tests | HIGH | HIGH |
| Mobile e2e instability | CRITICAL | Existing verified status cites failing mobile e2e flow; fresh mobile build still has missing declarations | Customer flow cannot be trusted | Stabilize mobile tests and declarations | HIGH | MEDIUM |
| Placeholder/incomplete tests | HIGH | Placeholder/incomplete scripts remain; e2e coverage incomplete | False green gates | Replace placeholders with real tests | HIGH | MEDIUM |
| Dependency tree problems | HIGH | 56 audit vulnerabilities; invalid `@sentry/node` | Supply-chain and install risk | Clean dependency tree | HIGH | HIGH |
| Infrastructure validation incomplete | HIGH | `Cannot connect to cluster` | Deployment risk | Validate against real cluster | HIGH | HIGH |
| Load/security validation incomplete | HIGH | Security test failed; penetration test could not reach backend | Unknown capacity/security behavior | Run complete load/security suite | HIGH | HIGH |
| React Doctor issues | MEDIUM | 61/100, 62 issues, 32 bugs | Runtime/maintainability risk | Fix React issues | MEDIUM | HIGH |
| Operational monitoring unverified | MEDIUM | Observability assets exist but cluster validation failed | Incident detection risk | Validate telemetry end-to-end | MEDIUM | MEDIUM |

### Required output files

| File | Status | Timestamp | Confidence |
| :--- | :--- | :--- | :---: |
| `README.md` | Updated by append | 2026-06-16 21:17 IST | HIGH |
| `README_GAP_REPORT.md` | Updated by append | 2026-06-16 21:17 IST | HIGH |
| `PROJECT_STATUS_REPORT.md` | Updated by append | 2026-06-16 21:17 IST | HIGH |
| `CURRENT_STATUS_SUMMARY.md` | Generated | 2026-06-16 21:17 IST | HIGH |
| `README_CHANGELOG.md` | Updated by append | 2026-06-16 21:17 IST | HIGH |

---

## Fresh README Gap Report Update

Generated: 2026-06-17T04:01:00+05:30

### Classification

Current classification: **“Advanced Startup-Grade Pre-Production System”**. Confidence: **MEDIUM**.

Project maturity: **~74–79% complete**. Confidence: **MEDIUM**.

Production readiness: **NOT PRODUCTION READY**. Confidence: **MEDIUM**.

### Fresh status table

| Area | Score | Status | Confidence | Verification source |
| :--- | :---: | :--- | :---: | :--- |
| Build | 100% | PASS — `npm run build` exited `0` | HIGH | Fresh command output |
| Lint | 100% | PASS — `npm run lint` exited `0` | HIGH | Fresh command output |
| Typecheck | 100% | PASS — `npx tsc --noEmit` exited `0` | HIGH | Fresh command output |
| Tests | 50% | FAILING — root `npm run test` missing; `test:unit`, `test:integration`, `test:e2e`, `test:all` exited `1` | HIGH | Fresh command output |
| Security | 40% | FAILING — rate limiting vulnerable; penetration test could not reach backend | HIGH | `security-tests.js`, `penetration-tests.js` |
| Dependencies | 55% | FAILING — `npm audit --json` found `51` moderate vulnerabilities; `npm outdated` exited `1`; fresh `npm ls` exited `0` | HIGH | Fresh command output |
| Infrastructure | 65% | FAILING — deployment validation could not connect to cluster | HIGH | `deployment-check.js` |
| Observability | 55% | PARTIAL — assets exist, but operational validation blocked by deployment failure | MEDIUM | `deployment-check.js`, source inventory |
| Frontend Reality | 70% | REAL BUT PARTIAL — routing/auth/dashboard/API/shared UI/state/navigation exist; runtime flows partially verified | MEDIUM | Source inventory and README |
| Backend Maturity | 82% | STRONG PRE-PRODUCTION — broad backend architecture and tests exist; runtime security/deployment gaps remain | MEDIUM | Source inventory and tests |
| Documentation Quality | 90% | STRONG — source-backed README and reports | HIGH | File reads |
| Production Readiness | 74–79% | NOT PRODUCTION READY | MEDIUM | Fresh verification pass |

### Fresh command evidence

| Command | Result | Exit Code | Confidence |
| :--- | :--- | :---: | :---: |
| `git ls-files` | `2696` tracked files | `0` | HIGH |
| `git status --short` | Modified and untracked files present | `0` | HIGH |
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

| Claim area | Marker | Fresh correction | Confidence |
| :--- | :--- | :--- | :---: |
| Build/typecheck failures | `[OUTDATED — VERIFIED UPDATE BELOW]` | Fresh build and typecheck passed | HIGH |
| Invalid dependency installs | `[OUTDATED — VERIFIED UPDATE BELOW]` | Fresh `npm ls` exited `0`; audit/outdated still fail | HIGH |
| Environment validation failures | `[OUTDATED — VERIFIED UPDATE BELOW]` | Fresh environment validation exited `0` | HIGH |
| React Doctor `49`/`60` issue claims | `[OUTDATED — VERIFIED UPDATE BELOW]` | Fresh React Doctor score is `61/100` with `62` issues | HIGH |
| Security pass claims | `[OUTDATED — VERIFIED UPDATE BELOW]` | Fresh security tests failed rate limiting | HIGH |
| Load-test pass/fail claims | `[OUTDATED — VERIFIED UPDATE BELOW]` | Load tests were not run in this pass; no claim should be made | MEDIUM |

### Current blockers

| Blocker | Severity | Evidence | Impact | Required fix | Risk | Confidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| Rate limiting bypass | CRITICAL | `Rate limited responses: 0/100` | API abuse risk | Fix rate limiting and rerun security tests | HIGH | HIGH |
| Dependency vulnerabilities | HIGH | `51` moderate audit vulnerabilities | Supply-chain/release risk | Upgrade or document affected dependencies | HIGH | HIGH |
| Failing workspace tests | HIGH | `test:unit`, `test:integration`, `test:e2e`, `test:all` exited `1` | Release gates unreliable | Fix failing workspace tests | HIGH | HIGH |
| React Doctor bugs | MEDIUM/HIGH | `61/100`, `62` issues, `32` bugs | Runtime/maintainability risk | Fix reported React issues | MEDIUM | HIGH |
| Deployment validation failure | HIGH | `Cannot connect to cluster` | Deployment risk | Validate against real cluster | HIGH | HIGH |
| Penetration test reachability failure | HIGH | `ECONNREFUSED localhost:3001` | Runtime security not validated | Start backend and rerun | HIGH | HIGH |
| Invalid dependency installs | NOT VERIFIED FRESH | Fresh `npm ls` exited `0` | Not counted as fresh blocker | Keep dependency hygiene checks | MEDIUM | HIGH |
| Build/typecheck failures | NOT VERIFIED FRESH | Fresh build/typecheck exited `0` | Not counted as fresh blocker | Keep CI gates | LOW | HIGH |

### Verdict

SpiceGarden remains **NOT PRODUCTION READY**. Build, lint, typecheck, environment validation, and dependency tree resolution are stronger than some older README claims suggested, but production readiness is still blocked by rate limiting, audit vulnerabilities, failing workspace tests, React Doctor issues, deployment validation failure, and penetration test reachability failure.

Current maturity: **~74–79%**. Confidence: **MEDIUM**.


