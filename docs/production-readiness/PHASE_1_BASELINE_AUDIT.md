# Phase 1 — Baseline Audit and Truth Reconciliation

Date: 2026-06-21

## Scope inspected

- Workspace inventory from `package.json`, per-workspace `package.json` files, and root scripts.
- Backend entrypoints and runtime wiring: `apps/backend/src/main.ts`, `apps/backend/src/app.module.ts`, backend test suite, backend coverage output.
- Shared packages: `packages/api-types`, `packages/proto`, `packages/shared`, `packages/ui`, `packages/grpc-transport`.
- Mobile apps: `apps/customer-mobile`, `apps/delivery-partner`.
- Infra/ops: `compose.dev.yaml`, `infra/prometheus`, `infra/grafana`, `infra/alertmanager`, `infra/k8s`, `infra/scripts`.
- Existing documentation under `docs/` and `AGENTS.md`.
- Environment consistency and deployment check scripts.
- Dependency audit output.

## Workspace inventory

| Workspace | Package | Build script | Test script | Baseline status |
|---|---:|---|---|---|
| `apps/backend` | `@spicegarden/backend` | `tsc -p tsconfig.build.json` | `jest --testPathIgnorePatterns=test/mongo-connection.spec.ts` | Tests pass; build/dev blocked by ENOSPC |
| `apps/customer-mobile` | `@spicegarden/customer-mobile` | `tsc --noEmit` | `jest --config jest.config.js __tests__ --runInBand` | Unit/typecheck pass |
| `apps/customer-web` | `@spicegarden/customer-web` | `next build` | `jest --testPathPatterns=__tests__ --runInBand` | Unit/build pass with native SWC warning |
| `apps/delivery-partner` | `@spicegarden/delivery-partner` | `tsc --noEmit` | `jest --config jest.config.js --runInBand` | Unit/typecheck pass |
| `apps/launcher` | `spicegarden-launcher` | `npm run build:main && npm run build:renderer` | `jest --config jest.config.js --runInBand` | Unit/build pass |
| `apps/restaurant-dashboard` | `@spicegarden/restaurant-dashboard` | `next build` | `jest --testPathPatterns=__tests__ --runInBand` | Unit/build pass with native SWC warning |
| `apps/super-admin` | `@spicegarden/super-admin` | `next build` | `jest --testPathPatterns=__tests__ --runInBand` | Unit/build pass with native SWC warning |
| `packages/api-types` | `@spicegarden/api-types` | `tsc --noEmit` | none | Typecheck pass |
| `packages/grpc-transport` | `@spicegarden/grpc-transport` | `tsc --noEmit` | none | Typecheck pass; implementation is quarantined |
| `packages/proto` | `@spicegarden/proto` | `tsc --noEmit` | none | Typecheck pass |
| `packages/shared` | `@spicegarden/shared` | `tsc` | `jest --config jest.config.js` | Unit/build pass |
| `packages/ui` | `@spicegarden/ui` | `tsc` | `jest --config jest.config.js` | Unit/build pass |

## Test totals from live repo

### Executed `npm run test:unit` totals

| Workspace | Executed tests | Result |
|---|---:|---|
| Backend | 304 passed, 1 skipped | PASS |
| Customer mobile | 33 passed | PASS |
| Customer web | 11 passed | PASS |
| Delivery partner | 6 passed | PASS |
| Launcher | 1 passed | PASS |
| Restaurant dashboard | 9 passed | PASS |
| Super admin | 23 passed | PASS |
| Shared | 2 passed | PASS |
| UI | 28 passed | PASS |
| **Total** | **417 passed, 1 skipped** | **PASS** |

This differs from the previously documented corrected total of 455. The live `npm run test:unit` execution proves 417 unique unit-test assertions across workspaces. Some workspaces also define integration/e2e/smoke variants that duplicate coverage when `test:all` is run.

### Source test-file counts

| Workspace | Test files | Source `it/test` cases |
|---|---:|---:|
| Backend | 94 | 845 |
| Customer mobile | 11 | 71 |
| Customer web | 3 | 11 |
| Delivery partner | 3 | 6 |
| Launcher | 5 | 2 |
| Restaurant dashboard | 3 | 9 |
| Super admin | 4 | 23 |
| Shared | 2 | 2 |
| UI | 12 | 75 |

## Commands run and results

| Command | Result |
|---|---|
| `npm run build` | FAIL. Backend TypeScript build fails with `ENOSPC: no space left on device` while writing `apps/backend/dist/src/services/maps/maps.controller.js` and `apps/backend/dist/src/services/menu-customization/menu-customization.controller.js`. Other workspaces build successfully. |
| `npm run lint` | PASS across all workspaces. |
| `npm run test:unit` | PASS: 417 passed, 1 skipped. |
| `cd apps/backend && npm test` | PASS: 304 passed, 1 skipped. |
| `cd apps/backend && npm run test:cov` | FAIL only because global 80% thresholds are not met. Test execution passes: 304 passed, 1 skipped. Coverage: 59.58% statements, 33.11% branches, 33.83% functions, 58.82% lines. |
| `npm run test:all` | PASS across workspaces. This includes duplicate integration/e2e/smoke executions in some workspaces. |
| `cd apps/backend && npm run dev` | FAIL to start. Nest watch compilation fails with the same backend ENOSPC errors. |
| `node infra/scripts/validate-env-consistency.js` | PASS: environment consistency script reports all valid. |
| `node infra/scripts/deployment-check.js` | FAIL: `ERROR: Cannot connect to cluster`. |
| `npm audit --omit=dev --json` | 30 vulnerabilities: 1 high, 29 moderate, 0 critical. Main production-audit findings include `undici` high and `@nestjs/swagger`/`expo`/Jest transitive moderate advisories. |

## Coverage baseline

Backend coverage from `cd apps/backend && npm run test:cov`:

| Metric | Current |
|---|---:|
| Statements | 59.58% |
| Branches | 33.11% |
| Functions | 33.83% |
| Lines | 58.82% |

High-value modules with weak coverage:

- `services/payments/gateways/*`: Stripe/Razorpay/COD gateway coverage is very low.
- `services/payments/webhook/webhook.service.ts`: webhook edge handling remains below production confidence.
- `services/notifications/production-notification.service.ts`: 4.83% line coverage.
- `modules/driver-assignment/dispatch-engine.service.ts`: 15% line coverage.
- `services/payments/retry.service.ts`: 14.58% line coverage.
- `services/geo/geo.service.ts`: 17.77% line coverage.
- `db/database-failover.service.ts`: 15% line coverage.
- `services/payments/chargeback/chargeback.service.ts`: 15.38% line coverage.

## Runtime validation baseline

- Backend dev server could not boot because the backend build/watch process fails before reaching Nest startup.
- `compose.dev.yaml` backend healthcheck already targets `http://localhost:3001/health`, which matches `apps/backend/src/main.ts`.
- `infra/prometheus/prometheus.dev.yml` and `infra/prometheus/prometheus.yml` use `/metrics`, which matches `apps/backend/src/main.ts`.
- Local frontend env files point to `http://localhost:3001`; compose production-style web services still use `https://api.spicegarden.com`, which is not locally resolvable/valid in this environment.
- Deployment validation cannot prove cluster readiness because no Kubernetes cluster is available from the local machine.

## Stubbed / partial / quarantined areas

| Area | Evidence | Status |
|---|---|---|
| `packages/grpc-transport` | `package.json` says “Quarantined gRPC transport placeholder”; `src/index.ts` exports `createGrpcTransport(): never` and `grpcTransportStatus.status = 'quarantined'`. | Not used by active REST/WebSocket runtime, but package remains incomplete. |
| Backend gRPC app | `apps/backend/src/main-grpc.ts` and `dist/main-grpc.js` exist; no active runtime validation found. | Partial / not runtime-validated. |
| Delivery-partner navigation | `apps/delivery-partner/App.tsx` includes alert text: “In production, this opens Google Maps.” | Placeholder behavior remains. |
| Payment providers | Stripe/Razorpay/COD gateways exist, but coverage and live provider validation are weak. | Runtime provider integration not fully proven. |
| Notifications | `production-notification.service.ts` has 4.83% line coverage and depends on external SMTP/SMS/FCM/APNs credentials. | Partial; external-provider dependent. |
| Geo/maps | `geo.service.ts` has 17.77% line coverage and depends on external map/routing providers. | Partial; provider-dependent. |
| K8s/deployment | `deployment-check.js` cannot connect to cluster. | Not locally validated. |
| Next native SWC | Builds/tests warn: `@next/swc-win32-x64-msvc.node is not a valid Win32 application`; Next falls back to WASM. | Non-fatal but indicates dependency/platform mismatch. |

## Environment and infra mismatches found

1. Backend build/dev blocker:
   - `apps/backend/tsconfig.json` has `composite: true`.
   - `apps/backend/tsconfig.build.json` only overrides `noEmit: false` and `outDir: ./dist`.
   - Existing backend `dist` contains both flat output and `dist/src/...`, suggesting duplicate/stale layout.
   - TypeScript fails while writing two controller files with ENOSPC despite ~4.9GB free on `C:` after generated `.next` cleanup.

2. Compose frontend API URL:
   - `compose.dev.yaml` exposes customer-web at `localhost:3002`, restaurant-dashboard at `localhost:3003`, super-admin at `localhost:3004`, delivery-partner at `localhost:3005`.
   - Those compose services set production-style `NEXT_PUBLIC_API_URL=https://api.spicegarden.com` or `API_URL=https://api.spicegarden.com`, which is not the local backend.

3. External production URLs:
   - Existing docs report DNS for `api.spicegarden.com` but failed TLS handshake. This must not be treated as production validation.

4. Kubernetes:
   - Manifests align liveness/readiness on `/health`, but no cluster validation is possible locally.

## Top production blockers ranked by severity

1. **Backend build/dev cannot start locally** — P0. Prevents runtime health, API-flow, security, load, and compose validation from running from source.
2. **Backend coverage below target** — P1. Tests pass, but branch/function coverage is only 33%; critical payment/webhook/queue/delivery modules remain weak.
3. **Runtime security/load scripts depend on a live backend** — P1. They cannot be honestly executed until backend boot is fixed.
4. **Compose local web services point at production API URL** — P1. Local stack boot would not produce a coherent end-to-end local app.
5. **Mobile geolocation/maps placeholder remains** — P2. Delivery-partner app still has placeholder navigation text.
6. **Kubernetes/deployment validation unavailable** — P2. No local cluster connection.
7. **Dependency audit has one high and 29 moderate production advisories** — P2. Requires careful remediation without destabilizing Expo/Next/Nest.
8. **gRPC transport package quarantined** — P3. Not blocking current REST/WebSocket runtime, but should remain documented as incomplete.

## Next actions

1. Fix backend build/dev ENOSPC failure by addressing backend TypeScript output layout and generated artifacts.
2. Start backend against local sqlite/dev mode and verify `/health` and `/metrics`.
3. Reconcile compose frontend API URLs to `http://localhost:3001` for local dev.
4. Re-run backend coverage after targeted hardening of payments, webhooks, delivery, queue/tracking, and notifications.
5. Execute security/load scripts only after backend is bootable.
