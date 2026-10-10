# Deployment Guide

**Version:** 1.0.0
**Date:** 2026-06-26
**Classification:** Verified from source code

## Deployment Options

SpiceGarden supports three deployment modes:
1. **Docker Compose** — Development and small-scale production
2. **Kubernetes** — Production-grade orchestration
3. **Standalone** — Direct Node.js process (not recommended for production)

## Prerequisites

- Docker 24+ and Docker Compose 2+
- OR Kubernetes 1.28+ with kubectl
- Node.js 20.x (for local builds)
- npm 10+
- PostgreSQL 16, MongoDB 7, Redis 7 (or use Docker)

## Docker Compose Deployment

### Development

```bash
# Start all services
docker-compose -f compose.dev.yaml up -d

# Verify stack
npm run verify:stack

# View logs
docker-compose -f compose.dev.yaml logs -f backend

# Stop all services
docker-compose -f compose.dev.yaml down
```

### Services Started

| Service | Port | Image |
|---------|------|-------|
| postgres | 5432 | postgres:16-alpine |
| redis | 6379 | redis:7-alpine |
| mongo | 27017 | mongo:7 |
| prometheus | 9090 | prom/prometheus:v2.51.0 |
| grafana | 3000 | grafana/grafana-enterprise:10.4.0 |
| opensearch | 9200 | opensearchproject/opensearch:2.15.0 |
| opensearch-dashboards | 5601 | opensearchproject/opensearch-dashboards:2.15.0 |
| alertmanager | 9093 | prom/alertmanager:v0.27.0 |
| backend | 3001 | Custom build |
| customer-web | 3002 | Custom build |
| restaurant-dashboard | 3003 | Custom build |
| super-admin | 3004 | Custom build |
| delivery-partner | 3005 | Custom build |

### Network
- Bridge network: `spicegarden-net`
- All services communicate via service names

### Health Checks
All services include health checks:
- postgres: `pg_isready`
- redis: `redis-cli ping`
- mongo: `mongosh --eval "db.adminCommand('ping')"`
- backend: `curl -f http://localhost:3001/health`
- Frontends: `curl -f http://localhost:3000/`

### Resource Limits
Backend container:
```yaml
limits:
  cpus: '1.5'
  memory: 1024M
reservations:
  cpus: '0.5'
  memory: 512M
```

## Kubernetes Deployment

### Staging

```bash
# Deploy to staging namespace
kubectl apply -f infra/k8s/staging.yaml -n spicegarden-staging --create-namespace

# Verify deployment
kubectl rollout status deployment/spicegarden-backend-staging -n spicegarden-staging

# Run smoke tests
kubectl exec -n spicegarden-staging <pod> -- curl -f http://localhost:3001/health
```

### Production

```bash
# Deploy production-hardened manifest
kubectl apply -f infra/k8s/production-hardened.yaml -n spicegarden-production --create-namespace

# Verify rollout
kubectl wait --for=condition=available --timeout=180s deployment/spicegarden-backend -n spicegarden-production
kubectl rollout status deployment/spicegarden-backend -n spicegarden-production --timeout=120s

# Verify HPA
kubectl get hpa -n spicegarden-production

# Verify backup CronJob
kubectl get cronjob -n spicegarden-production
```

### Production Configuration

**Manifest:** `infra/k8s/production-hardened.yaml`

| Setting | Value |
|---------|-------|
| Replicas | 3 |
| Strategy | RollingUpdate (maxSurge: 1, maxUnavailable: 0) |
| PodDisruptionBudget | minAvailable: 2, maxUnavailable: 1 |
| HPA Min | 3 |
| HPA Max | 20 |
| HPA CPU Target | 70% |
| HPA Memory Target | 80% |
| Security User | 1001 (non-root) |
| ReadOnly RootFS | true |
| Capabilities | DROP ALL |
| Startup Probe | /health, initialDelay 30s, period 10s |
| Readiness Probe | /health, initialDelay 10s, period 5s |
| Liveness Probe | /health, initialDelay 30s, period 10s |

### Secrets Management

```bash
# Create secrets
kubectl create secret generic spicegarden-secrets \
  --from-literal=JWT_SECRET=<secret> \
  --from-literal=ENCRYPTION_SECRET=<secret> \
  --from-literal=DB_PASS=<password> \
  --from-literal=STRIPE_SECRET_KEY=<key> \
  -n spicegarden-production
```

### ConfigMap

```bash
# Apply configmap
kubectl apply -f infra/k8s/configmap.yaml -n spicegarden-production
```

## CI/CD Pipeline

**Workflow:** `.github/workflows/ci-cd.yml`

### Jobs

| Job | Trigger | Steps |
|-----|---------|-------|
| security-audit | push, PR, daily 2AM | npm audit, Snyk |
| build-test | push, PR | lint, test, coverage, build, docker |
| deploy-staging | push to develop | kubectl apply staging, smoke tests |
| deploy-production | push to main | kubectl apply production, smoke tests, HPA verify |

### Docker Registry

- Registry: `ghcr.io`
- Image: `spicegarden/backend`
- Tags: `latest`, `<sha>`, `develop`, `main`

## Docker Build

### Multi-Stage Build (`infra/backend/Dockerfile`)

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/*/package*.json ./packages/
RUN npm ci
COPY apps/backend ./apps/backend
COPY packages ./packages
RUN npm --workspace @spicegarden/backend run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package*.json ./
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/src/main.js"]
```

### Build Commands

```bash
# Build all
npm run build

# Build backend only
npm run build --workspace=@spicegarden/backend

# Docker build
docker build -f infra/backend/Dockerfile -t spicegarden/backend:latest .

# Docker Compose build
docker-compose -f compose.dev.yaml build
```

## Health Checks

### Backend Health Endpoint
```
GET /health
Response: { "status": "ok", "timestamp": "2026-06-26T..." }
```

### Stack Verification
```bash
npm run verify:stack
# Validates all infrastructure services are reachable
```

## Backup & Recovery

### Database Backup
```bash
# PostgreSQL backup
bash infra/scripts/backup.sh

# Scheduled: Daily at 2AM via K8s CronJob
# Retention: 30 days
```

### Disaster Recovery
```bash
# Full restore
bash infra/scripts/disaster-recovery.sh --production
```

## Rollback

### Kubernetes Rollback
```bash
# Rollout undo
kubectl rollout undo deployment/spicegarden-backend -n spicegarden-production

# Rollback to specific revision
kubectl rollout undo deployment/spicegarden-backend -n spicegarden-production --to-revision=2
```

### GitHub Actions Rollback
```bash
# Trigger rollback workflow
gh workflow run rollback.yml -f tag=<previous-tag>
```

## Environment Configuration

### Development
```bash
cp .env.example .env
# Edit .env with local credentials
docker-compose -f compose.dev.yaml up -d
cd apps/backend && npm run dev
```

### Staging
- Namespace: `spicegarden-staging`
- Image tag: `develop`
- Secrets: K8s secrets + staging ConfigMap
- Autoscaling: Same as production

### Production
- Namespace: `spicegarden-production`
- Image tag: `<git-sha>`
- Secrets: K8s secrets + production ConfigMap
- Replicas: 3 (min 2 available)
- HPA: 3-20 replicas
- NetworkPolicy: Restricted

## Database Migrations

### Development
TypeORM `synchronize: true` auto-creates/updates schema.

### Production
```bash
# Run migrations
cd apps/backend
npx typeorm migration:run -d dist/src/db/db.module.ts

# Generate migration
npx typeorm migration:generate -n MigrationName
```

## Scaling

### Horizontal Scaling
- HPA automatically scales 3-20 replicas
- CPU threshold: 70%
- Memory threshold: 80%

### Manual Scaling
```bash
kubectl scale deployment/spicegarden-backend --replicas=5 -n spicegarden-production
```

### Database Scaling
- PostgreSQL: Configure read replicas
- Redis: Cluster mode (`infra/k8s/redis-cluster.yaml`)
- MongoDB: Replica set configuration

## SSL/TLS

### Ingress TLS
Configured via `infra/k8s/cdn-ingress.yaml`:
- TLS termination at ingress controller
- Certificate management via cert-manager (recommended)

### Development
- HTTP only (no TLS)
- CORS configured for localhost origins

## Monitoring Deployment

### Prometheus
- Scrape interval: 15s (backend: 10s)
- Endpoint: `/metrics`
- Pre-configured alert rules

### Grafana
- Auto-provisioned dashboards
- Datasources: Prometheus, OpenSearch
- Access: http://grafana:3000

### Alertmanager
- Receivers: Slack, PagerDuty
- Group wait: 30s
- Repeat interval: 3h

## Troubleshooting

### Pod Not Starting
```bash
kubectl describe pod <pod-name> -n spicegarden-production
kubectl logs <pod-name> -n spicegarden-production
```

### Database Connection Issues
```bash
kubectl exec -it <pod> -n spicegarden-production -- curl -f http://postgres:5432
kubectl get pods -n spicegarden-production -l app=postgres
```

### Redis Connection Issues
```bash
kubectl exec -it <pod> -n spicegarden-production -- redis-cli ping
```

### High Memory Usage
```bash
kubectl top pods -n spicegarden-production
kubectl describe hpa -n spicegarden-production
```
