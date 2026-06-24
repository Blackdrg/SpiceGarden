# SpiceGarden Completion Baseline Report

**Generated:** 2026-06-21  
**Baseline:** `docs/CANONICAL_PROJECT_STATE_2026-06-20.md`  
**Scope:** Continue completion work without deleting repository assets, preserving stubbed/partial modules, and reporting only validated facts.

## Baseline Reconciliation

The canonical baseline remains the controlling source of truth. Its main claims were rechecked against current command output where feasible.

| Baseline claim | Current status |
|---|---|
| Backend full Jest suite passed | Revalidated: `cd apps/backend && npm run test -- --runInBand` passed with 276 passed, 1 skipped. |
| Root lint passed | Revalidated: `npm run lint` passed across all workspaces. |
| Root unit tests passed | Revalidated: `npm run test:unit` passed across workspaces. Next.js SWC native-load warnings and React Native deprecation warnings were observed but did not fail tests. |
| Backend coverage threshold failed | Revalidated: coverage gate still fails against 80% thresholds. Interrupted coverage run reported 59.55% statements, 32.84% branches, 33.69% functions, 58.74% lines. |
| Compose config parsed | Revalidated: `docker-compose -f compose.dev.yaml config` passed. |
| Runtime backend unavailable | Revalidated: `curl http://localhost:3001/health` failed to connect. |
| Backend build previously passed | Current `npm run build` failed due C: drive `ENOSPC`, not TypeScript errors. Backend typecheck/build was validated by writing to D: drive. |

## Current Completion Position

| Area | Status |
|---|---|
| No-deletion constraint | Preserved. No repository assets were deleted. |
| Feature freeze | No new modules, AI features, redesigns, dashboards, or frontend routes were added. |
| Backend tests | Passing full direct suite. |
| Root lint | Passing. |
| Root unit tests | Passing. |
| Backend typecheck | Passing with `npx tsc -p tsconfig.json --noEmit`. |
| Backend build | Blocked on C: drive space; validated with alternate output directory on D: drive. |
| Runtime smoke/security/load | Blocked because backend is not running on port 3001 and dev startup is blocked by disk space. |
| Coverage | Still below 80% thresholds. |
| Runtime validation | Not production-validated. |

## Recommended Release Position

SpiceGarden is **not production-ready** based on current validation. It is closer to a test-clean, lint-clean, runtime-unvalidated state with unresolved coverage, disk-space, runtime, security, and load-validation blockers.
