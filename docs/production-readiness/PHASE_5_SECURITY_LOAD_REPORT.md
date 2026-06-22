# Phase 5 — Runtime Security and Load Validation

**Generated:** 2026-06-22  
**Canonical source:** `docs/CANONICAL_PROJECT_STATE_2026-06-22.md`  
**Status:** Historical phase evidence; superseded by the current canonical documentation suite.

## Goal

Validate backend runtime security, penetration behavior, and local k6 smoke-load behavior on `http://localhost:3001` without claiming full production readiness beyond what the commands prove.

## Runtime target

| Item | Value |
|---|---|
| Backend target | `http://localhost:3001` |
| Runtime mode | Local dev/SQLite-local backend mode |
| Docker-backed mode | Not validated because Docker daemon is unavailable |
| Kubernetes mode | Not validated because no cluster API is reachable |

## Backend runtime evidence

| Check | Command | Result | Status |
|---|---|---|---|
| Backend startup | `cd apps/backend && npm run dev` | `Nest application successfully started` | Implemented & verified |
| Health | `curl.exe -sS -i --max-time 10 http://localhost:3001/health` | HTTP 200, `{"status":"ok",...}` | Implemented & verified |
| Metrics | `curl.exe -sS -i --max-time 10 http://localhost:3001/metrics` | HTTP 200, Prometheus text | Implemented & verified |
| CORS preflight | `curl.exe -X OPTIONS http://localhost:3001/auth/login -H 'Origin: http://localhost:3002' -H 'Access-Control-Request-Method: POST'` | HTTP 204, expected allow headers | Implemented & verified |
| Dangerous method blocking | `curl.exe -X TRACE http://localhost:3001/health` | HTTP 405, `Method TRACE not allowed` | Implemented & verified |

## Security validation

### Security vulnerability script

Command:

```powershell
node infra/scripts/security-tests.js
```

Backend mode: normal development mode with rate limiters enabled.

Result: PASS.

| Category | Result |
|---|---|
| SQL Injection | SECURE, 0 issues |
| XSS | SECURE, 0 issues |
| Rate Limiting | SECURE, 96/100 responses rate-limited |
| Auth Bypass | SECURE, 0 issues |
| Path Traversal | SECURE, 0 issues |
| Total vulnerabilities | 0 |

Status: **Implemented & verified**.

### Load-mode security caveat

When the backend was started with `LOAD_TEST_MODE=true`, `node infra/scripts/security-tests.js` reported 100 rate-limiting issues. This is expected because `apps/backend/src/main.ts:136-144` intentionally skips dev rate limiters in load-test mode. Do not use load-mode backend for rate-limit security validation.

### Penetration script

Command:

```powershell
node infra/scripts/penetration-tests.js
```

Result: PASS.

| Category | Result |
|---|---|
| Port Scan | SECURE, only local backend port 3001 open |
| Security Headers | SECURE, required headers present |
| CORS | SECURE, attacker/null origins not reflected |
| HTTP Methods | SECURE, dangerous methods rejected |
| Total issues | 0 |

Status: **Implemented & verified**.

## Load validation

### Default smoke load

Command:

```powershell
cd apps/backend
k6 run test/load/smoke-test.js
```

Backend mode: `LOAD_TEST_MODE=true`.

Result: FAIL against default latency threshold.

| Metric | Threshold | Actual |
|---|---:|---:|
| `http_req_failed` | `<0.01` | 0.00 PASS |
| `load_success` | `>0.99` | 100.00% PASS |
| `signup_success` | `>0.99` | 100.00% PASS |
| `browse_restaurants_success` | `>0.99` | 100.00% PASS |
| `http_req_duration p95` | `<1500ms` | 6.3s FAIL |

Interpretation: the smoke flow is functionally executable against the local backend, but the default 50-VU smoke profile did not meet the configured p95 latency threshold.

### Reduced smoke load

Command:

```powershell
cd apps/backend
$env:TARGET_VUS='5'
$env:STAGE_DURATION='30s'
$env:P95_LIMIT_MS='10000'
k6 run test/load/smoke-test.js
```

Backend mode: `LOAD_TEST_MODE=true`.

Result: PASS.

| Metric | Threshold | Actual |
|---|---:|---:|
| `http_req_failed` | `<1.00` | 0.00 PASS |
| `load_success` | `>0.00` | 100.00% PASS |
| `http_req_duration p95` | `<10000ms` | 797.07ms PASS |
| Checks succeeded | — | 213/213 PASS |
| Iterations | — | 106 complete |
| Max VUs | — | 5 |

Interpretation: the reduced 5-VU smoke run validates register/browse behavior under light local load. It does not validate the default 50-VU smoke profile or full 10k/20k production load scenarios.

## Runtime conclusions

- Local backend startup, `/health`, `/metrics`, CORS, and dangerous-method blocking are verified.
- Local backend security script passes with 0 vulnerabilities when run against normal backend mode.
- Local penetration script passes with 0 issues.
- `LOAD_TEST_MODE=true` is valid for reduced smoke load, but invalid for rate-limit security validation.
- Default 50-VU smoke load is not yet clean because p95 latency exceeds the configured 1500ms threshold.
- Reduced 5-VU smoke load passes with 213/213 checks and p95 below 1s.
- Docker-backed Postgres/Redis/Mongo runtime was not validated because Docker daemon access remains unavailable.
- Kubernetes deployment validation was not completed because no cluster API is reachable.

## Remaining Phase 5 blockers

1. Full Docker/Redis-backed runtime validation remains blocked by unavailable Docker daemon.
2. Kubernetes runtime validation remains blocked by unavailable cluster access.
3. Default smoke load p95 latency needs investigation before claiming the 50-VU profile is production-safe.
4. Full 10k/20k k6 load tests were not run in this phase.
5. Live payment, notification, map, APNS, and Twilio provider validation remains incomplete.
