# Phase 2 — Local Stack Bootability and Runtime Stabilization

Date: 2026-06-21

## Goal

Make the backend and local dev configuration bootable from source, then verify the health, metrics, CORS, and method-gating runtime surface.

## Inspected

- `apps/backend/src/main.ts`
- `apps/backend/src/app.module.ts`
- `apps/backend/package.json`
- `apps/backend/tsconfig.json`
- `apps/backend/tsconfig.build.json`
- `compose.dev.yaml`
- `infra/backend/Dockerfile`
- `infra/customer-web/Dockerfile`
- `infra/restaurant-dashboard/Dockerfile`
- `infra/super-admin/Dockerfile`
- `infra/delivery-partner/Dockerfile`
- Prometheus dev config and backend `/metrics` route.

## Changes made

1. Fixed backend build/dev startup.
   - Removed stale generated backend build artifacts before verification.
   - Confirmed `cd apps/backend && npm run build` now passes.
   - Kept backend runtime entrypoint aligned to emitted output: `dist/src/main.js`.

2. Fixed local compose API wiring.
   - `compose.dev.yaml` now points local web/mobile-web services at `http://localhost:3001` instead of the production `https://api.spicegarden.com`.
   - Local compose services now use `NODE_ENV=development`.

3. Fixed Dockerfile source-copy paths.
   - Dockerfiles no longer use invalid `COPY ../../apps/...` paths that escape the Docker build context.
   - Each Dockerfile now copies the relevant workspace and packages from the root build context.

## Commands run and results

| Command | Result |
|---|---|
| `cd apps/backend && npm run build` | PASS |
| `npm run build` | PASS across all workspaces. Next still warns about native SWC fallback, but builds complete. |
| `cd apps/backend && npm run dev` | PASS. Backend reached `Nest application successfully started`. |
| `curl.exe -sS -i --max-time 10 http://localhost:3001/health` | PASS: HTTP 200, body `{"status":"ok",...}`. |
| `curl.exe -sS -i --max-time 10 http://localhost:3001/metrics` | PASS: HTTP 200, Prometheus text format. |
| `curl.exe -sS -i --max-time 10 -X OPTIONS http://localhost:3001/auth/login -H 'Origin: http://localhost:3002' -H 'Access-Control-Request-Method: POST'` | PASS: HTTP 204, `Access-Control-Allow-Origin: http://localhost:3002`, credentials enabled. |
| `curl.exe -sS -i --max-time 10 -X TRACE http://localhost:3001/health` | PASS: HTTP 405, dangerous method rejected. |
| `docker compose -f compose.dev.yaml config` | PASS: compose file parses. Optional env vars warn and default to blank. |
| `docker compose -f compose.dev.yaml up -d postgres redis mongo` | BLOCKED: Docker Desktop daemon/API pipe unavailable: `failed to connect to the docker API ... dockerDesktopLinuxEngine`. |

## Runtime proof

- Backend boots from source in local mode.
- `/health` works.
- `/metrics` works.
- CORS allows configured local origins and rejects unconfigured origins through existing origin logic.
- Dangerous HTTP methods are rejected before route handling.
- Compose configuration is syntactically valid.
- Full Docker stack boot is blocked by unavailable Docker daemon in this environment, not by compose syntax.

## Remaining blockers

1. Docker daemon is unavailable, so local Postgres/Redis/Mongo compose services and full-stack containers could not be started.
2. Backend local mode currently uses sqlite/local fallback rather than proving live Postgres/Redis/Mongo connectivity.
3. Next native SWC warning remains non-fatal: `@next/swc-win32-x64-msvc.node is not a valid Win32 application`.

## Next actions

1. Use the now-bootable backend for security/load validation.
2. Run backend tests again after code edits.
3. Add targeted backend tests for weak modules identified in Phase 1.
