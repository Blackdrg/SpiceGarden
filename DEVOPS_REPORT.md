# DevOps Report

Generated: 2026-06-17T21:30+05:30  
Evidence: `Dockerfile`, compose files, GitHub workflows, Kubernetes manifests, infra scripts.

## Local Infrastructure

| File | Services |
| :--- | :--- |
| `compose.yaml` | Backend, PostgreSQL, Redis, Mongo |
| `compose.dev.yaml` | Backend, PostgreSQL, Redis, Mongo, Prometheus, Grafana, OpenSearch, Alertmanager |
| `compose.infra.yaml` | Backend, PostgreSQL, Redis, Mongo, Prometheus, Grafana, OpenSearch, Alertmanager, Filebeat, Sentry, secrets |

## Docker

- Root `Dockerfile` builds the backend only.
- Base image: `node:20-alpine`.
- Runtime user: `nextjs`.
- Exposes port `3001`.
- Healthcheck: `/health`.
- Copies root `node_modules`.

## CI/CD

`.github/workflows/ci-cd.yml` includes:

- Lint
- Unit tests
- Integration tests
- E2E tests
- Build
- Load test with `|| echo`
- Docker build
- Docker push
- Staging deploy
- Production deploy

`.github/workflows/react-doctor.yml` runs React Doctor on frontend apps.

`.github/workflows/rollback.yml` performs manual or issue-triggered Kubernetes rollback using `KUBECONFIG`.

## Kubernetes

`infra/k8s/production-hardened.yaml` includes:

- Backend Deployment
- Service
- ConfigMap
- Secret references
- PDB
- HPA
- NetworkPolicy
- Backup CronJob
- PVC
- Ingress

`infra/k8s/staging.yaml` includes:

- Staging Deployment
- Service
- ConfigMap
- Ingress

## Observability

- Prometheus config: `infra/prometheus/prometheus.yml`
- Alertmanager config: `infra/alertmanager/alertmanager.yml`
- Filebeat config: `infra/filebeat/filebeat.yml`
- Prometheus rules: `infra/prometheus/rules/alerts.yml`

## DevOps Gaps

- Dockerfile only covers backend, not frontend builds.
- Load test is part of CI but can be masked by `|| echo`.
- Dev compose includes hardcoded local passwords and Grafana credentials.
- Production manifests exist, but deployment readiness depends on external Kubernetes credentials and secrets.
