# Phase 3 — Test Stabilization and Authoritative Test Matrix

Date: 2026-06-21

## Goal

Stabilize the test suite after runtime/build fixes and establish the authoritative test matrix.

## Test matrix

### Root unit tests

Command: `npm run test:unit`

| Workspace | Result |
|---|---|
| Backend | 21 passed |
| Customer mobile | 33 passed |
| Customer web | 11 passed |
| Delivery partner | 6 passed |
| Launcher | 1 passed |
| Restaurant dashboard | 9 passed |
| Super admin | 23 passed |
| Shared | 2 passed |
| UI | 28 passed |
| **Total** | **114 passed** |

### Backend full test command

Command: `cd apps/backend && npm test`

| Suite | Result |
|---|---|
| Backend Jest, ignoring `test/mongo-connection.spec.ts` | 304 passed, 1 skipped |

### Root all-test command

Command: `npm run test:all`

| Workspace | Result |
|---|---|
| Backend | PASS: unit/integration/e2e paths all pass; backend integration command reports 304 passed, 1 skipped. |
| Customer mobile | PASS: unit/integration/e2e paths pass; React test-renderer deprecation warnings only. |
| Customer web | PASS: unit/integration/e2e/smoke paths pass; Next native SWC warning only. |
| Delivery partner | PASS: unit/integration/e2e/smoke paths pass. |
| Launcher | PASS. |
| Restaurant dashboard | PASS: unit/integration/e2e/smoke paths pass; JSX transform warning in one test. |
| Super admin | PASS: unit/integration/e2e/smoke paths pass; Next native SWC warning only. |
| Shared | PASS. |
| UI | PASS; punycode deprecation warnings only. |

## Quality gates

| Command | Result |
|---|---|
| `npm run lint` | PASS across all workspaces. |
| `npm run build` | PASS across all workspaces. |
| `npm run test:unit` | PASS. |
| `npm run test:all` | PASS. |
| `cd apps/backend && npm run test:cov` | Test execution PASS, threshold command FAIL. Coverage remains below configured 80% global thresholds. |

## Repairs made in this phase

- No tests were deleted or weakened.
- Backend build/dev was stabilized so runtime-dependent tests and security/load scripts can execute against a live backend.
- Compose API URL mismatches were fixed to avoid local runtime divergence.
- Dockerfile source-copy paths were fixed to match Docker build context rules.

## Known non-fatal warnings

- Next native SWC warning: `@next/swc-win32-x64-msvc.node is not a valid Win32 application`; builds/tests fall back successfully.
- React Native test-renderer deprecation warnings in customer-mobile tests.
- React outdated JSX transform warning in restaurant-dashboard test.
- Node punycode deprecation warnings in UI tests.
- Backend rate-limit tests log Redis fallback warnings when Redis is unavailable.

## Authoritative test totals

The live executed root unit suite is 114 tests. The backend full Jest suite is 304 passed, 1 skipped. `test:all` passes across workspaces but intentionally re-runs overlapping integration/e2e/smoke subsets in several apps, so it is not a unique-test count.

## Remaining test-quality blocker

Backend coverage remains the main quality gap. The next phase must add meaningful backend tests for weak modules rather than changing coverage thresholds.
