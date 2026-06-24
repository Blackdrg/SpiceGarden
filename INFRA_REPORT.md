# Infrastructure Report
Generated: 2026-06-16T01:10:40+05:30

## Verification Source
Direct file reads of Dockerfile, compose files, k8s manifests, CI workflows, infra scripts.

## Confidence Level
HIGH — All data from actual file reads.

---

## Docker

### Dockerfile (Multi-stage Build)

| Stage | Base Image | Purpose |
| :--- | :--- | :--- |
| builder | node:20-alpine | Install deps, build backend TypeScript |
| production | node:20-alpine | Copy dist + node_modules, run as nextjs user |

| Aspect | Detail |
| :--- | :--- |
| Build target | apps/backend only |
| User | nextjs (non-root) |
| Port | 3001 |
| Healthcheck | CMD-SHELL curl -f http://localhost:3001/health |
| Node version | 20.x |

**LIMITATIONS:**
- Does NOT build frontend apps (customer-web, restaurant-dashboard, super-admin)
- Does NOT build mobile apps
- Copies root-level node_modules into final image
- No .dockerignore verification done

### Docker Compose Files

| File | Services | Purpose |
| :--- | :--- | :--- |
| compose.yaml | 1 (spicegarden) | Default single service |
| compose.dev.yaml | 9 | Development infrastructure (Postgres, Redis, Mongo, Prometheus, Grafana, OpenSearch, Alertmanager) |
| compose.infra.yaml | 11 | Full production stack (backend + all infra + Sentry) |
| compose.debug.yaml | 1 | Debug variant with port 5005 |

### compose.dev.yaml Services

| Service | Image | Port | Env Secrets |
| :--- | :--- | :---: | :--- |
| postgres | postgres:16-alpine | 5432 | Hardcoded password |
| redis | redis:7-alpine | 6379 | — |
| mongo | mongo:7 | 27017 | — |
| prometheus | prom/prometheus:v2.51.0 | 9090 | — |
| grafana | grafana/grafana-enterprise:10.4.0 | 3000 | Hardcoded admin password |
| opensearch | opensearchproject/opensearch:2.15.0 | 9200 | Hardcoded admin password |
| opensearch-dashboards | opensearchproject/opensearch-dashboards:2.15.0 | 5601 | — |
| alertmanager | prom/alertmanager:v0.27.0 | 9093 | — |

**⚠ compose.dev.yaml contains hardcoded development passwords — should never be exposed as production configuration.**

## Kubernetes Manifests

| File | Resources | Key Features |
| :--- | :--- | :--- |
| infra/k8s/production-hardened.yaml | 10 kinds | 3 replicas, non-root user, read-only filesystem, dropped capabilities, rolling update, probes, resource limits, anti-affinity, tolerations, PDB, HPA (3-20 replicas), NetworkPolicy, CronJob backup |
| infra/k8s/backend-deployment.yaml | 2 kinds | Simpler deployment + service with health probes and resource limits |
| infra/k8s/staging.yaml | 5 kinds | 2 replicas, develop image tag, swagger enabled |
| infra/k8s/postgres-ha.yaml | 4 kinds | 3 replicas, fast-ssd 50Gi, resources 1-2Gi |
| infra/k8s/redis-cluster.yaml | 4 kinds | 6 replicas in cluster mode, 2-4Gi memory |
| infra/k8s/cdn-ingress.yaml | 1 kind | cdn.spicegarden.com ingress |
| infra/k8s/configmap.yaml | 1 kind | DB/Redis/Mongo pool configs |
| infra/k8s/secrets.yaml | 2 kinds | Production + staging secrets |

## CI/CD Pipelines

### .github/workflows/ci-cd.yml

| Stage | Trigger | Gates |
| :--- | :--- | :--- |
| security-audit | push to main/develop, PR, daily cron | npm audit (non-blocking), Snyk monitor |
| build-test | push to main/develop, PR | lint, test:unit, test:integration, test:e2e, build, docker push |
| deploy-staging | push to develop | kubectl/Helm deploy, smoke tests |
| deploy-production | push to main | kubectl/Helm deploy, rollout, smoke test, HPA verify, backup verify |

### .github/workflows/react-doctor.yml
- Trigger: PR opens/sync/reopen, push to main
- Uses millionco/react-doctor@v2
- Permissions: write to PRs, issues, statuses

### .github/workflows/rollback.yml
- Trigger: workflow_dispatch with reason, issue labeled
- Performs kubectl rollout undo with smoke test verification

## Infrastructure Scripts

| Category | Count | Scripts |
| :--- | :---: | :--- |
| Security/Testing | 4 | security-tests.js, penetration-tests.js, breaking-point.js, fake-orders.js |
| Docker/Stability | 5 | docker-stability-test.ps1/js, docker-stability-check.sh, docker-stability-repair.ps1 |
| Backup/DR | 3 | backup.sh/ps1, disaster-recovery.sh/ps1, restore.sh |
| K8s Validation | 2 | autoscaling-validation.sh, production-validation.sh/ps1 |
| Secret Management | 4 | generate-secrets.ps1, load-secrets.sh/ps1, validate-secrets.js, setup-secrets.sh |
| Protobuf | 2 | compile-protos.js, compile-protos.sh |
| Validation | 3 | validate-env-consistency.js, legal-check.js, deployment-check.js |

## NOT VERIFIED
- Actual Docker image sizes
- Kubernetes cluster state (cluster not accessible)
- Helm chart structure (referenced but chart directory not confirmed)
- Observability dashboard content (Grafana dashboards mounted but not inspected)
- Alertmanager rules content
