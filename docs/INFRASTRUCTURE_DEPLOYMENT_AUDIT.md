# Infrastructure Deployment Audit

**Date:** 2026-06-23

---

## Docker Compose

| File | Services | Status |
| ---- | -------: | ------ |
| `compose.dev.yaml` | 9 services | Config-validated |

**Services in `compose.dev.yaml`:**
1. postgres (port 5432)
2. redis (port 6379)
3. mongo (port 27017)
4. prometheus (port 9090)
5. grafana (port 3000)
6. opensearch (ports 9200, 9300)
7. opensearch-dashboards (port 5601)
8. alertmanager (port 9093)
9. backend (port 3001)
10. customer-web (port 3002)
11. restaurant-dashboard (port 3003)
12. super-admin (port 3004)
13. delivery-partner (port 3005)

**Runtime Status:** Blocked — Docker daemon unavailable

---

## Kubernetes Manifests

**Source:** `infra/k8s/`

| Manifest | Resources | Status |
| -------- | --------- | ------ |
| `production-hardened.yaml` | Deployment, Service, PDB, HPA, NetworkPolicy, Ingress, PVC, CronJob | Static-validated |
| `staging.yaml` | Deployment, Service | Exists |
| `cdn-ingress.yaml` | Ingress | Exists |

**Production-hardened.yaml evidence:**
- 3 replicas with RollingUpdate strategy
- Readiness/liveness probes to `/health`
- Resource limits: 512Mi/1.5cpu
- Security context: non-root, readOnlyRootFilesystem
- HPA: 3-20 replicas, CPU 70%, memory 80%
- Prometheus HPA metrics configured
- NetworkPolicy ingress/egress rules
- Backup CronJob scheduled nightly

**Runtime Status:** Blocked — cluster API unavailable

---

## Health Checks

| Endpoint | Probe Path | Status |
| -------- | ---------- | ------ |
| Backend health | `/health` | Implemented in code |
| Backend metrics | `/metrics` | Implemented in code |

**Evidence:** `apps/backend/src/main.ts:251-255`

---

## Environment Configuration

| File | Status | Notes |
| ---- | ------ | ----- |
| `.env.example` | Present | Contains placeholders (`CHANGE_ME`) |
| `.env.production.example` | Exists | Production template |
| `.env.staging.example` | Exists | Staging template |
| `secrets/` | Exists | 16 txt files, 3 valid |

**Secret validation result:** 3/16 valid (jwt_secret, encryption_secret, db_password)