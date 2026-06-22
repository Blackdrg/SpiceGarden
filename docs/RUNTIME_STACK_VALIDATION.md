# Runtime Stack Validation

**Date:** 2026-06-22
**Auditor:** Kilo (automated repo audit)
**Scope:** Docker Compose, Kubernetes, backend runtime, observability stack, DB/Redis/Mongo connectivity

---

## Validation Summary

| Layer | Config Status | Runtime Status | Blocker |
|---|---|---|---|
| Backend (NestJS) | Valid | **Verified locally** | None |
| Docker Compose (dev) | Valid | **Blocked** | Docker daemon unavailable |
| Docker Compose (infra) | Valid | **Blocked** | Docker daemon unavailable |
| Kubernetes | Valid manifests | **Blocked** | No cluster API reachable |
| Postgres | Config valid | **Blocked** | Docker daemon unavailable |
| Redis | Config valid | **Blocked** | Docker daemon unavailable |
| Mongo | Config valid | **Blocked** | Docker daemon unavailable |
| Prometheus | Config valid | **Blocked** | Docker daemon unavailable |
| Grafana | Config valid | **Blocked** | Docker daemon unavailable |
| Alertmanager | Config valid | **Blocked** | Docker daemon unavailable |
| OpenSearch | Config valid | **Blocked** | Docker daemon unavailable |
| Filebeat | Config valid | **Blocked** | Docker daemon unavailable |

---

## Backend Runtime Validation (Local)

### Startup

| Check | Command | Result |
|---|---|---|
| Backend startup | `cd apps/backend && npm run dev` | `Nest application successfully started` |

### Health and Metrics

| Check | Command | Result |
|---|---|---|
| Health endpoint | `curl.exe -sS -i --max-time 10 http://localhost:3001/health` | HTTP 200, `{"status":"ok",...}` |
| Metrics endpoint | `curl.exe -sS -i --max-time 10 http://localhost:3001/metrics` | HTTP 200, Prometheus text beginning with `process_cpu_user_seconds_total` |
| CORS preflight | `curl.exe -X OPTIONS http://localhost:3001/auth/login -H 'Origin: http://localhost:3002' -H 'Access-Control-Request-Method: POST'` | HTTP 204, `Access-Control-Allow-Origin: http://localhost:3002` |
| Dangerous method blocking | `curl.exe -X TRACE http://localhost:3001/health` | HTTP 405, `{"message":"Method TRACE not allowed","error":"Method Not Allowed"}` |

**Status:** Backend runtime is **verified** in local dev/SQLite mode. Full stack runtime (with Postgres, Redis, Mongo) is **blocked** by Docker daemon unavailability.

---

## Docker Compose Validation

### compose.dev.yaml

| Check | Command | Result |
|---|---|---|
| Config validation | `docker-compose -f compose.dev.yaml config` | Passed with warnings |
| Warnings | Unset optional secrets: `SENTRY_DSN`, `SMTP_PASS`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `FCM_SERVER_KEY` | Expected for local dev |
| Stack startup | `docker-compose -f compose.dev.yaml up -d` | **Not run** — Docker daemon unavailable |

**Docker daemon status:** Client version 29.5.3 available; server connection failed to `npipe:////./pipe/dockerDesktopLinuxEngine`. Docker Desktop is installed but not running or not accessible.

### compose.infra.yaml

| Check | Command | Result |
|---|---|---|
| Config validation | `docker-compose -f compose.infra.yaml config` | Passed with warnings |
| Warnings | Unset `SENTRY_DSN` | Expected for local dev |
| Stack startup | `docker-compose -f compose.infra.yaml up -d` | **Not run** — Docker daemon unavailable |

---

## Kubernetes Validation

| Check | Command | Result |
|---|---|---|
| Manifest server validation | `kubectl apply --dry-run=client -f infra/k8s/production-hardened.yaml` | **Failed** — no API reachable at `localhost:8080` |
| Deployment script | `node infra/scripts/deployment-check.js` | **Failed** — `ERROR: Cannot connect to cluster` |
| Manifest static evidence | `infra/k8s/production-hardened.yaml` | 3 replicas, security context, `/health` probes, resources, PDB, HPA present |

**Status:** Kubernetes manifests are implemented but **not runtime-validated**. No cluster is available in this environment.

---

## Observability Stack Validation

| Component | Config Evidence | Runtime Status |
|---|---|---|
| Prometheus | `infra/prometheus/prometheus.dev.yml:8-13` targets `host.docker.internal:3001` at `/metrics` | **Blocked** — backend not running in Docker |
| Grafana dashboards | `infra/grafana/provisioning/dashboards/provider.yml:1-11` | **Blocked** — Grafana not running |
| Grafana datasources | `infra/grafana/provisioning/datasources/datasources.yml` present | **Blocked** — Grafana not running |
| Alertmanager | `infra/alertmanager/alertmanager.yml:1-33` defines Slack/PagerDuty receivers | **Blocked** — Alertmanager not running |
| OpenSearch/Filebeat | Compose and config present | **Blocked** — Docker daemon unavailable |

---

## DB/Redis/Mongo Connectivity

| Service | Config | Runtime Status |
|---|---|---|
| Postgres | `compose.dev.yaml` defines postgres service with healthcheck | **Blocked** — Docker daemon unavailable |
| Redis | `compose.dev.yaml` defines redis service; backend has Redis rate-limit store with memory fallback | **Blocked** — Docker daemon unavailable; fallback active in local tests |
| Mongo | `compose.dev.yaml` defines mongo service; `mongo-connection.spec.ts` skips when offline | **Blocked** — Docker daemon unavailable; tests skip when offline |

**Note:** The backend's Redis rate-limit store (`apps/backend/src/security/redis-rate-limit.store.ts`) has a memory fallback when Redis is unavailable. This fallback was active during local test runs (warning: "Redis unavailable, using process-local fallback").

---

## Environment Consistency

**Command:** `node infra/scripts/validate-env-consistency.js`
**Result:** `All environment configurations are valid`

All `.env`, `.env.example`, `.env.production.example`, and `.env.staging.example` files are structurally consistent.

---

## Secret Validation

**Command:** `node infra/scripts/validate-secrets.js`
**Result:** 3/16 valid, 13 warnings

Production provider secrets (Stripe, Twilio, FCM, map provider, APNS) are incomplete.

---

## Blockers Summary

1. **Docker daemon unavailable** — prevents all Docker-based runtime validation.
2. **No Kubernetes cluster** — prevents K8s manifest server validation.
3. **Production secrets incomplete** — prevents full stack startup with real providers.
4. **Backend build failure** (`packages/ui`) — blocks full workspace build but backend builds independently.
