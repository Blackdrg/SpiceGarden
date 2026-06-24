# Runtime Stack Validation

**Date:** 2026-06-23

---

## Docker Runtime

| Check | Result | Evidence |
| ----- | ------ | -------- |
| Docker daemon | ❌ Unavailable | `docker info` — server connection failed to `npipe:////./pipe/dockerDesktopLinuxEngine` |
| Compose config | ✅ Valid | `docker-compose -f compose.dev.yaml config` — renders with warnings |
| Infra stack | ❌ Blocked | Cannot start without Docker daemon |

**Compose warnings (expected):**
- `SENTRY_DSN` — optional, not set
- `SMTP_PASS`, `TWILIO_*` — optional, not set

---

## Kubernetes

| Check | Result | Evidence |
| ----- | ------ | -------- |
| Manifest static | ✅ Present | `infra/k8s/production-hardened.yaml` (376 lines) |
| Server validation | ❌ Blocked | Cannot connect to cluster at localhost:8080 |
| Deployment script | ❌ Blocked | `node infra/scripts/deployment-check.js` — cannot connect |

**Manifest includes:**
- 3 replicas with rolling update
- Readiness/liveness probes to `/health`
- PodDisruptionBudget (minAvailable: 2)
- HorizontalPodAutoscaler (3-20 replicas)
- NetworkPolicy (ingress/egress rules)
- Backup CronJob

---

## Backend Endpoints

| Endpoint | Status | Evidence |
| -------- | ------ | -------- |
| `/health` | Blocked (no backend running) | Requires `npm run dev` in `apps/backend` |
| `/metrics` | Blocked (no backend running) | Requires `npm run dev` in `apps/backend` |

**Evidence:** From `apps/backend/src/main.ts:251-255` — metrics endpoint defined.

---

## Database Connections

| Service | Status | Evidence |
| ------- | ------ | -------- |
| PostgreSQL | Blocked | Docker daemon required |
| MongoDB | Blocked | Docker daemon required |
| Redis | Blocked | Docker daemon required |

**Local dev mode:** Backend can run with SQLite (`LOCAL_DB=sqlite`).

---

## Observability Stack

| Component | Status | Evidence |
| --------- | ------ | -------- |
| Prometheus | Blocked | Requires Docker |
| Grafana | Blocked | Requires Docker |
| Alertmanager | Blocked | Requires Docker |
| OpenSearch | Blocked | Requires Docker |