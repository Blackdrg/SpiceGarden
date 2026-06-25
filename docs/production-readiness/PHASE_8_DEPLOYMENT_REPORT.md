# Phase 8 — Deployment Path Validation

Date: 2026-06-25

## Goal
Validate Kubernetes deployment manifests, CI/CD pipeline, and Docker image build paths for production readiness.

## Kubernetes Manifests

All manifests in `infra/k8s/` are syntactically valid YAML:

| File | Kinds | Names |
|------|-------|-------|
| `backend-deployment.yaml` | Deployment, Service | spicegarden-backend |
| `configmap.yaml` | ConfigMap | spicegarden-backend-config |
| `staging.yaml` | Deployment, Service, ConfigMap, Ingress, HPA | spicegarden-backend-staging |
| `production-hardened.yaml` | Deployment, Service, ConfigMap, PDB, HPA, NetworkPolicy, CronJob, PVC, Ingress | spicegarden-backend |
| `secrets.yaml` | Secret | spicegarden-secrets, spicegarden-secrets-staging |
| `postgres-ha.yaml` | Service | (PostgreSQL service) |
| `redis-cluster.yaml` | Service | (Redis service) |
| `cdn-ingress.yaml` | Ingress | spicegarden-cdn-ingress |

### Production Hardening Features
- Replicas: 3 with RollingUpdate (maxSurge: 1, maxUnavailable: 0)
- Security: runAsNonRoot, runAsUser: 1001, seccompProfile: RuntimeDefault
- Readiness/Liveness probes: configured on `/health`
- HPA: configured with minReplicas: 2, maxReplicas: 10
- NetworkPolicy: ingress and egress rules defined
- PodDisruptionBudget: minAvailable: 2
- Backup CronJob: PostgreSQL daily backup configured
- PVC: Persistent storage for backups

## CI/CD Pipeline

**File:** `.github/workflows/ci-cd.yml`

### Pipeline Structure

| Job | Trigger | Steps |
|-----|---------|-------|
| `security-audit` | Push/PR to main+develop, daily cron | npm audit (high gate), Snyk monitor |
| `build-test` | Push/PR to main+develop | lint, unit tests, coverage gate, integration, e2e, build, quick load, Docker push |
| `deploy-staging` | Push to develop | kubectl apply staging manifests, wait rollout, smoke tests |
| `deploy-production` | Push to main | kubectl apply production manifests, wait rollout, smoke tests, HPA verify, backup verify |

### Production Deploy Fix Applied

**Issue:** Production deploy step used `helm upgrade --install` but no Helm chart (`Chart.yaml`) exists in `infra/k8s/`. The manifests are raw Kubernetes YAML.

**Fix:** Replaced Helm commands with `kubectl apply` + `sed` image-tag substitution:
- Production: `sed -i "s|:latest|:${IMAGE_TAG}|g"` then `kubectl apply -f infra/k8s/production-hardened.yaml`
- Staging: `sed -i "s|\${IMAGE_TAG:-develop}|${IMAGE_TAG}|g"` then `kubectl apply -f infra/k8s/staging.yaml`

This ensures the CI/CD pipeline deploys the correct Docker image SHA to each environment.

### Rollback Workflow

**File:** `.github/workflows/rollback.yml`
- Triggered by `workflow_dispatch` or issue labeling
- Uses `kubectl rollout undo` with optional revision targeting
- Records current revision before rollback

## Docker Build

**Backend Dockerfile:** `infra/backend/Dockerfile`
- Multi-stage build: `node:20-alpine` builder + runner
- Copies only `dist/` and `package*.json` to final image
- Exposes port 3001
- Runs `node dist/src/main.js`

## Phase 8 Conclusion

- All k8s manifests are syntactically valid and production-hardened
- CI/CD pipeline fixed: production deploys use `kubectl apply` with proper image tag substitution
- Rollback workflow uses native Kubernetes commands
- Docker image build path is correctly structured
