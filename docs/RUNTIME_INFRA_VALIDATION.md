# Runtime and Infrastructure Validation

**Generated:** 2026-06-22
**Canonical source:** `docs/CANONICAL_PROJECT_STATE_2026-06-22.md`
**Purpose:** Distinguish backend runtime evidence from infrastructure configuration evidence and blocked runtime validation.

---

## 1. Executive Runtime Position

Backend runtime was validated locally in dev/SQLite-local mode. Docker Compose and Kubernetes are configuration-present and config-validated, but not runtime-validated because the Docker daemon and Kubernetes API are unavailable in this environment.

| Area | Status | Evidence |
|---|---|---|
| Backend startup | Implemented & verified | `npm run dev` reached `Nest application successfully started`. |
| Backend health | Implemented & verified | `GET /health` returned HTTP 200. |
| Backend metrics | Implemented & verified | `GET /metrics` returned HTTP 200 with Prometheus text. |
| CORS | Implemented & verified | OPTIONS preflight returned HTTP 204 and expected headers. |
| Dangerous method blocking | Implemented & verified | TRACE returned HTTP 405. |
| Runtime security scripts | Implemented & verified | Security and penetration scripts passed against normal backend mode. |
| Reduced smoke load | Implemented & verified | 5-VU k6 smoke passed. |
| Default smoke load | Broken / failing | 50-VU smoke failed p95 latency threshold. |
| Docker daemon | Blocked from validation | `docker info` could not connect to server. |
| Compose stack startup | Blocked from validation | Daemon unavailable. |
| Kubernetes deployment validation | Blocked from validation | No cluster API reachable. |
| Observability runtime | Blocked from validation | Stack could not be started. |

---

## 2. Backend Runtime Validation

### 2.1 Startup

Command:

```powershell
cd apps/backend
npm run dev
```

Result:

```text
Nest application successfully started
```

Status: **Implemented & verified**.

### 2.2 Health endpoint

Command:

```powershell
curl.exe -sS -i --max-time 10 http://localhost:3001/health
```

Result:

```text
HTTP/1.1 200 OK
{"status":"ok","timestamp":"2026-06-21T20:36:36.625Z"}
```

Status: **Implemented & verified**.

### 2.3 Metrics endpoint

Command:

```powershell
curl.exe -sS -i --max-time 10 http://localhost:3001/metrics
```

Result:

```text
HTTP/1.1 200 OK
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
...
# HELP http_requests_total Total HTTP requests by method, route, and status code.
# TYPE http_requests_total counter
```

Status: **Implemented & verified**.

### 2.4 CORS preflight

Command:

```powershell
curl.exe -sS -i --max-time 10 -X OPTIONS http://localhost:3001/auth/login -H 'Origin: http://localhost:3002' -H 'Access-Control-Request-Method: POST'
```

Result:

```text
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:3002
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

Status: **Implemented & verified**.

### 2.5 Dangerous method blocking

Command:

```powershell
curl.exe -sS -i --max-time 10 -X TRACE http://localhost:3001/health
```

Result:

```text
HTTP/1.1 405 Method Not Allowed
{"message":"Method TRACE not allowed","error":"Method Not Allowed"}
```

Status: **Implemented & verified**.

---

## 3. Runtime Security Validation

### 3.1 Security vulnerability script

Command:

```powershell
node infra/scripts/security-tests.js
```

Result:

```text
Rate limited responses: 96/100
Total vulnerabilities found: 0
All security tests passed - system appears secure
```

Status: **Implemented & verified**.

### 3.2 Penetration script

Command:

```powershell
node infra/scripts/penetration-tests.js
```

Result:

```text
Total issues found: 0
Penetration tests passed - system appears hardened
```

Status: **Implemented & verified**.

### 3.3 Load-mode caveat

When the backend was started with `LOAD_TEST_MODE=true`, the security script reported 100 rate-limiting issues. This is expected because `apps/backend/src/main.ts:136-144` intentionally skips dev rate limiters in load-test mode. Use normal backend mode for security validation and load-test mode only for smoke load validation.

---

## 4. Load Runtime Validation

### 4.1 Reduced smoke load

Command:

```powershell
cd apps/backend
$env:TARGET_VUS='5'
$env:STAGE_DURATION='30s'
$env:P95_LIMIT_MS='10000'
k6 run test/load/smoke-test.js
```

Backend mode: `LOAD_TEST_MODE=true`.

Result:

```text
checks_total.......: 213
checks_succeeded...: 100.00% 213 out of 213
http_req_failed....: 0.00%
http_req_duration..: p(95)=797.07ms
iterations.........: 106
vus_max............: 5
```

Status: **Implemented & verified** for reduced local smoke load.

### 4.2 Default smoke load

Command:

```powershell
cd apps/backend
k6 run test/load/smoke-test.js
```

Result:

```text
checks_succeeded...: 100.00% 729 out of 729
http_req_failed....: 0.00%
http_req_duration..: p(95)=6.3s
```

Threshold: `p(95)<1500`.

Status: **Broken / failing** for latency threshold.

### 4.3 Full load

Command:

```powershell
cd apps/backend
npm run test:load
```

Earlier result:

```text
429 Too many requests
Rate limit exceeded. Please retry after the reset window.
Retry-After: 900
```

Status: **Broken / failing** as a production load validation. Full 10k/20k scenarios were not completed.

---

## 5. Docker Compose Configuration Validation

### 5.1 Dev compose

Command:

```powershell
docker-compose -f compose.dev.yaml config
```

Result: Passed with warnings for unset optional secrets.

Rendered service count: **13 services**.

Key services include:

- postgres
- redis
- mongo
- prometheus
- grafana
- opensearch
- opensearch-dashboards
- alertmanager
- backend
- customer-web
- restaurant-dashboard
- super-admin
- delivery-partner

Status: **Implemented but runtime-unverified**.

### 5.2 Infra compose

Command:

```powershell
docker-compose -f compose.infra.yaml config
```

Result: Passed with warning for unset `SENTRY_DSN`.

Rendered service count: **12 services**.

Key services include:

- spicegarden
- postgres
- redis
- mongo
- prometheus
- grafana
- opensearch
- opensearch-dashboards
- filebeat
- alertmanager
- sentry
- sentry-worker

Status: **Implemented but runtime-unverified**.

---

## 6. Docker Runtime Validation

Command:

```powershell
docker info
```

Result:

```text
Client:
Version: 29.5.3
Server:
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine; check if the path is correct and if the daemon is running
```

Status: **Blocked from validation**.

Consequences:

- Compose stack startup was not validated.
- Postgres/Redis/Mongo runtime integration was not validated.
- Prometheus/Grafana/Alertmanager/OpenSearch runtime was not validated.
- Filebeat/Sentry runtime was not validated.
- Docker image build/push path was not validated.

---

## 7. Kubernetes and Deployment Validation

### 7.1 K8s manifest evidence

`infra/k8s/production-hardened.yaml:1-180` includes:

- 3 backend replicas
- rolling update strategy
- runAsNonRoot/runAsUser/runAsGroup
- readOnlyRootFilesystem
- dropped capabilities
- `/health` startup/readiness/liveness probes
- resource requests/limits
- temporary volume mount
- PodDisruptionBudget
- HorizontalPodAutoscaler min 3 / max 20

Status: **Implemented but runtime-unverified**.

### 7.2 Server-side validation

Command:

```powershell
kubectl apply --dry-run=client -f infra/k8s/production-hardened.yaml
```

Result:

```text
error validating data: failed to download openapi: Get "http://localhost:8080/openapi/v2?timeout=32s": dial tcp [::1]:8080: connectex: No connection could be made because the target machine actively refused it.
```

Status: **Blocked from validation**.

### 7.3 Deployment script

Command:

```powershell
node infra/scripts/deployment-check.js
```

Result:

```text
ERROR: Cannot connect to cluster
```

Status: **Blocked from validation**.

---

## 8. Observability Validation

| Component | Evidence | Status |
|---|---|---|
| Backend metrics | `apps/backend/src/main.ts:19-46`, `/metrics` returned 200 | Implemented & verified |
| Prometheus target | `infra/prometheus/prometheus.dev.yml:8-13` targets `host.docker.internal:3001` | Implemented but runtime-unverified |
| Grafana dashboard path | `infra/grafana/provisioning/dashboards/provider.yml:1-11` uses `/etc/grafana/dashboards` | Implemented but runtime-unverified |
| Alertmanager | `infra/alertmanager/alertmanager.yml:1-33` defines Slack/PagerDuty receivers | Implemented but runtime-unverified |
| OpenSearch/Filebeat | Compose/config present | Blocked from validation |

---

## 9. Environment and Secrets

| Check | Command | Result | Status |
|---|---|---|---|
| Env consistency | `node infra/scripts/validate-env-consistency.js` | `All environment configurations are valid` | Implemented & verified |
| Secret validation | `node infra/scripts/validate-secrets.js` | 3/16 valid, 13 warnings | Blocked from validation for production providers |

Warnings included missing/insecure placeholders for payment, notification, map, APNS, and Twilio secrets.

---

## 10. Runtime and Infrastructure Verdict

Backend runtime is locally verified for health, metrics, CORS, method blocking, security scripts, penetration script, and reduced smoke load. Infrastructure is configuration-validated but not runtime-validated. Docker and Kubernetes validation are blocked by unavailable local runtime dependencies.
