# Phase 0 Baseline Task Ledger — SpiceGarden

Generated: 2026-06-24T23:43+05:30
Source: Live repo inspection + command execution

## Verified Baseline Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Build (all workspaces) | PASS | ✅ |
| Lint (all workspaces) | PASS | ✅ |
| TypeScript typecheck | PASS | ✅ |
| Backend tests | 936 passed, 1 skipped | ✅ |
| Test suites | 63 passed, 1 skipped | ✅ |
| Coverage — statements | 91.65% (3471/3787) | ✅ ≥80% |
| Coverage — branches | 82% (989/1206) | ✅ ≥80% |
| Coverage — functions | 80.11% (423/528) | ✅ ≥80% |
| Coverage — lines | 91.78% (3252/3543) | ✅ ≥80% |
| npm audit (high/critical) | 0 high, 0 critical | ✅ |
| npm audit (moderate) | 31 moderate | ⚠️ |

## Critical Blockers (P0)

### BLK-001: Jest config excludes .spec.js tests
- **Severity**: P0
- **Subsystem**: Testing / CI
- **File**: `apps/backend/jest.config.js`
- **Observation**: Jest `testMatch` is `['**/*.spec.ts', '**/*-spec.ts']`. There are 22 `.spec.js` files and 1 `.spec.cjs` file in `apps/backend/test/` that are never executed in CI.
- **Impact**: Critical business-flow tests (payments, orders, delivery, wallet, auth integration) exist in `.js` files but are silently skipped. Coverage and CI gates are not validating these paths.
- **Proposed Fix**: Update `testMatch` to include `.spec.js` and `.spec.cjs` patterns, OR consolidate duplicate `.js` tests into `.ts` files and remove duplicates.
- **Proof needed**: `jest --listTests` shows all `.spec.*` files; `npm test` runs all suites.

### BLK-002: Placeholder implementations in production paths
- **Severity**: P0
- **Subsystem**: Backend / Business Logic
- **Files**:
  - `apps/backend/src/services/wallet/wallet.service.ts` (line 338)
  - `apps/backend/src/modules/driver-assignment/dispatch-engine.service.ts` (line 159)
  - `apps/backend/src/modules/driver-assignment/driver-assignment.controller.ts` (lines 105, 169, 195)
- **Observation**: Critical service methods return placeholder values instead of real calculations (distance, ETA, wallet operations).
- **Impact**: Platform cannot function correctly in production; driver dispatch, wallet transactions, and ETA calculations are unreliable.
- **Proposed Fix**: Replace placeholders with real implementations or explicitly gate behind feature flags with runtime warnings.
- **Proof needed**: Tests verify real return values; no "placeholder" comments in these methods.

### BLK-003: Duplicate test files across .ts / .js / .cjs
- **Severity**: P1
- **Subsystem**: Testing
- **Observation**: Same logical test suite exists in 3 formats for some files (e.g., `kitchen.service.spec.ts`, `.js`, `.cjs`). Jest only runs `.ts` by default.
- **Impact**: Maintenance burden; risk of diverging test logic.
- **Proposed Fix**: Remove duplicate `.js` and `.cjs` test files after verifying `.ts` tests cover equivalent cases.
- **Proof needed**: `git ls-files` shows no duplicate test basenames.

## High-Priority Tasks (P1)

### TASK-001: Security runtime validation
- **Severity**: P1
- **Subsystem**: Security
- **Observation**: Rate limiting, CSRF, CORS, RBAC controls exist in code but have not been validated against a live backend instance. Security tests in `infra/scripts/security-tests.js` show rate-limiting as "VULNERABLE" when backend is not running.
- **Proposed Fix**: Start backend stack and run `node infra/scripts/security-tests.js` to verify controls.
- **Proof needed**: Script exits 0 with 100% blocked malicious requests.

### TASK-002: Env/secret consistency
- **Severity**: P1
- **Subsystem**: Config / Deploy
- **Observation**: `infra/scripts/validate-env-consistency.js` passes, but `.env` contains placeholder values. Production/staging env examples use `STRIPE_SECRET_KEY_FILE` pattern (good), but development defaults are placeholders.
- **Proposed Fix**: Ensure `.env.example` and compose files are consistent; no missing variables that would crash startup.
- **Proof needed**: `validate-env-consistency.js` exits 0; backend starts with `.env` present.

### TASK-003: Stack boot verification
- **Severity**: P1
- **Subsystem**: Infra / Runtime
- **Observation**: `compose.dev.yaml` defines all services. Backend healthcheck expects `/health` endpoint and `curl` in container.
- **Proposed Fix**: Create/reinstate `node infra/scripts/verify-stack.js` and ensure all services can boot.
- **Proof needed**: Script reports all services healthy.

## Medium-Priority Tasks (P2)

### TASK-004: TODO/FIXME audit in critical paths
- **Severity**: P2
- **Subsystem**: Code Quality
- **Observation**: 95 instances of `TODO`, `FIXME`, `placeholder` across backend source.
- **Action**: Remove or resolve non-critical instances; document true remaining TODOs.

### TASK-005: Dependency audit moderate findings
- **Severity**: P2
- **Subsystem**: Security
- **Observation**: 31 moderate npm advisories remain.
- **Action**: Review and patch/resolve where feasible.

## Next Steps Priority Order

1. **Fix Jest testMatch** to include `.spec.js` — unblocks hidden test failures (P0)
2. **Fix placeholders** in wallet, dispatch-engine, driver-assignment (P0)
3. **Consolidate duplicate test files** (P1)
4. **Run backend** and validate rate limiting, CORS, CSRF, health endpoints (P1)
5. **Verify docker-compose stack boots** cleanly (P1)
6. **Resolve remaining TODOs** in critical business flows (P2)
