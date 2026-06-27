# SpiceGarden Deployment Documentation

**Version:** 0.0.0  
**Last Updated:** 2026-06-27

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Docker Build](#docker-build)
4. [Docker Compose Development](#docker-compose-development)
5. [Kubernetes Production](#kubernetes-production)
6. [Environment Configuration](#environment-configuration)
7. [Secrets Management](#secrets-management)
8. [Health Checks](#health-checks)
9. [Scaling](#scaling)
10. [Network Policies](#network-policies)
11. [Backup Strategy](#backup-strategy)
12. [Monitoring Setup](#monitoring-setup)
13. [CI/CD Pipeline](#cicd-pipeline)
14. [Troubleshooting](#troubleshooting)

---

## Deployment Overview

SpiceGarden supports two deployment models:

| Environment | Method | Use Case |
|-------------|--------|----------|
| Development | Docker Compose | Local development, testing |
| Staging/Production | Kubernetes | Production hardening, autoscaling |

---

## Prerequisites

- Node.js 20.x
- npm 10+
- Docker Desktop (for Docker Compose)
- kubectl (for Kubernetes)
- k6 (for load testing)

---

## Docker Build

### Single app build
```bash
docker-compose -f compose.dev.yaml build
```

### Root Dockerfile
`Dockerfile` — Multi-stage build for backend.

### Per-app Dockerfiles
| Path | App |
|------|-----|
| `infra/backend/Dockerfile` | NestJS API |
| `infra/customer-web/Dockerfile` | Next.js Customer |
| `infra/restaurant-dashboard/Dockerfile` | Next.js Restaurant |
| `infra/super-admin/Dockerfile` | Next.js Admin |
| `infra/delivery-partner/Dockerfile` | Mobile web variant |

---

## Docker Compose Development

**File:** `compose.dev.yaml`

### Services (13 total)

| Service | Image | Port | Healthcheck |
|---------|-------|------|-------------|
| postgres | postgres:16-alpine | 127.0.0.1:5432 | `pg_isready` 10s |
| redis | redis:7-alpine | 127.0.0.1:6379 | `redis-cli ping` 10s |
| mongo | mongo:7 | 127.0.0.1:27017 | `mongosh ping` 10s |
| prometheus | prom/prometheus:v2.51.0 | 9090 | — |
| grafana | grafana/grafana-enterprise:10.4.0 | 3000 | depends prometheus |
| opensearch | opensearchproject/opensearch:2.15.0 | 9200/9300 | — |
| opensearch-dashboards | opensearchproject/opensearch-dashboards:2.15.0 | 5601 | depends opensearch |
| alertmanager | prom/alertmanager:v0.27.0 | 9093 | — |
| backend | From infra/backend/Dockerfile | 3001 | `curl /health` 30s |
| customer-web | From infra/customer-web/Dockerfile | 3002:3000 | `curl /` 30s |
| restaurant-dashboard | From infra/restaurant-dashboard/Dockerfile | 3003:3000 | `curl /` 30s |
| super-admin | From infra/super-admin/Dockerfile | 3004:3000 | `curl /` 30s |
| delivery-partner | From infra/delivery-partner/Dockerfile | 3005:3000 | `curl /` 30s |

### Environment Variables
Backend service sets 30+ env vars via compose:
```
NODE_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005
DB_HOST=postgres, DB_USER=spicegarden, DB_PASS=spicegarden_dev_password, DB_NAME=spicegarden
MONGO_URI=mongodb://mongo:27017/spicegarden
REDIS_HOST=redis, REDIS_PORT=6379
PAYMENT_PRIMARY_GATEWAY=stripe
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RAZORPAY_KEY_*, RAZORPAY_WEBHOOK_SECRET
SMTP_*, TWILIO_*, FCM_SERVER_KEY, GOOGLE_MAPS_API_KEY, SENDGRID_API_KEY
```

### Start Stack
```bash
docker-compose -f compose.dev.yaml up -d
# Or load test mode:
docker-compose -f compose.dev.yaml up -d --profile mobile-web-smoke
```

### Stop Stack
```bash
docker-compose -f compose.dev.yaml down
docker-compose -f compose.dev.yaml down -v  # with volumes
```

---

## Kubernetes Production

### Manifests
| File | Purpose |
|------|---------|
| `infra/k8s/production-hardened.yaml` | Backend deployment (3 replicas, HPA, PodDisruptionBudget, NetworkPolicy, security context, probes, backup CronJob) |
| `infra/k8s/postgres-ha.yaml` | PostgreSQL HA |
| `infra/k8s/redis-cluster.yaml` | Redis cluster (6 replicas, HPA) |
| `infra/k8s/cdn-ingress.yaml` | CDN + Ingress |
| `infra/k8s/configmap.yaml` | ConfigMap |
| `infra/k8s/secrets.yaml` | K8s secrets |
| Root `k8s/production-hardened.yaml` | Same as infra version |

### Production Hardening Features

**Replicas:** 3 minimum with rolling updates (`maxSurge: 1`, `maxUnavailable: 0`)

**PodDisruptionBudget:** `minAvailable: 2`

**Horizontal Pod Autoscaler:** 3-20 replicas at 70% CPU / 80% memory

**Security Context:**
- `runAsNonRoot: true`
- `runAsUser: 1001`
- `readOnlyRootFilesystem: true`
- `allowPrivilegeEscalation: false`
- Capabilities: `drop: ALL`
- `seccompProfile: RuntimeDefault`

**NetworkPolicy:** Restricted ingress/egress

**Probes:**
- Liveness: `GET /health` (10s initial, 10s period)
- Readiness: `GET /health` (5s initial, 5s period)
- Startup: `GET /health` (40s initial, 10s period)

**Backup CronJob:** Daily at 2AM

### Deploy Commands
```bash
# Staging
kubectl apply -f infra/k8s/staging.yaml -n spicegarden-staging

# Production (hardened)
kubectl apply -f infra/k8s/production-hardened.yaml -n spicegarden-production
```

---

## Environment Configuration

### Environment Files
| File | Scope |
|------|-------|
| `.env.example` | Root template |
| `.env` | Root local overrides |
| `.env.staging.example` | Staging template |
| `.env.production.example` | Production template |
| `apps/backend/.env` | Backend local dev |
| `apps/*/.env.development.local` | Per-app dev |
| `apps/*/.env.staging.local` | Per-app staging |
| `apps/*/.env.production.local` | Per-app production |

### ConfigService Loading
```typescript
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(process.cwd(), '.env'),
  ],
})
```

### Production Validation
On startup, `validateProductionEnvironment()`:
1. Verifies `NODE_ENV === 'production'`
2. Checks all required secrets are set
3. Rejects wildcard CORS origins
4. Throws `MissingEnvError` with the missing variable name

---

## Secrets Management

### Development
- `.env` files checked into `.gitignore`
- `secrets/` directory (gitignored) for runtime secrets
- `infra/scripts/generate-secrets.ps1` — PowerShell secrets generator

### Production (Kubernetes)
- `infra/k8s/secrets.yaml` — K8s Secret resources
- Referenced in deployment `envFrom` or `env.valueFrom.secretKeyRef`

### Rotation
- `SecretsRotationService` in `compliance/` module
- `infra/scripts/secrets-rotation.ps1.js` for manual rotation

---

## Health Checks

| Endpoint | Location | Purpose |
|----------|----------|---------|
| `GET /health` | `apps/backend/src/app.controller.ts` | Backend health |
| `GET /orders/health` | `apps/backend/src/services/order/order.controller.ts` | Order service health |
| `GET /metrics` | `apps/backend/src/main.ts` | Prometheus metrics |

**Docker Compose:** `curl -f http://localhost:3001/health`

**K8s Probes:** `/health` with 5s-40s intervals depending on probe type

---

## Scaling

### HPA Configuration
```
minReplicas: 3
maxReplicas: 20
Metrics: CPU 70%, Memory 80%
```

### Redis Cluster HPA
```
minReplicas: 6
maxReplicas: 12
Metrics: CPU 60%, Memory 75%
```

### Pod Anti-Affinity
Pods spread across nodes to maximize availability.

### WebSocket Scaling
Room-based messaging with Socket.IO. Multi-instance scaling supported via Redis adapter (configured via `REDIS_URL`).

### Database Scaling
- **PostgreSQL:** Single primary replica (HA available per `postgres-ha.yaml`)
- **MongoDB:** Replica set capable
- **Redis:** Cluster mode (6 nodes)

---

## Network Policies

K8s manifests define restrictive NetworkPolicy:
- Backend can accept ingress on port 3001
- Backend can reach postgres, redis, mongo
- Namespace-level isolation for production

---

## Backup Strategy

### Automated Backups
- **Schedule:** Daily at 2AM (K8s CronJob)
- **Storage:** PostgreSQL dump + MongoDB dump + Redis SAVE command
- **Retention:** 7 days (development) / configurable (production)
- **Verification:** `infra/scripts/backup-verification.sh`

### Manual Backup
```bash
# Linux/macOS
bash infra/scripts/backup.sh

# Windows
powershell -File infra/scripts/backup.ps1
```

### Restore
```bash
# From backup script
bash infra/scripts/restore.sh <backup-archive.tar.gz>

# Via db.sh
scripts/db.sh restore <archive>
```

### Disaster Recovery
```bash
bash infra/scripts/disaster-recovery.sh --production
```

---

## Monitoring Setup

### Services and Ports
| Service | Port | Purpose |
|---------|------|---------|
| Prometheus | 9090 | Metrics collection |
| Grafana | 3000 | Dashboards |
| Alertmanager | 9093 | Alert routing |
| OpenSearch | 9200 | Log aggregation |
| OpenSearch Dashboards | 5601 | Log exploration |

### Prometheus
- Config: `infra/prometheus/prometheus.yml` (production) / `prometheus.dev.yml` (development)
- Rules: `infra/prometheus/rules/alerts.yml`
- Scrape interval: 10s
- Targets: Backend `spicegarden:3001/metrics`

### Grafana Dashboards
- Main dashboard: `infra/grafana/dashboards/spicegarden.json`

### Alertmanager
- Config: `infra/alertmanager/alertmanager.yml`
- Routing: Slack (`#alerts` channel), PagerDuty (critical)

### Alert Rules
| Alert | Condition | Severity |
|-------|-----------|----------|
| `HighErrorRate` | >5% 5xx in 5m | critical |
| `HighLatency` | P95 >1s in 2m | warning |
| `DatabaseDown` | Up == 0 in 1m | critical |
| `QueueFailures` | failures_total > 0 | warning |
| `PaymentFailures` | failures_total > 5 | critical |

---

## CI/CD Pipeline

### GitHub Actions Workflows

**`.github/workflows/ci-cd.yml`:**

1. **security-audit** — Daily cron + PR/push triggers
   - `npm audit --audit-level=high`
   - Snyk `monitor`

2. **build-test** — PR to main, push to main/develop
   - `npm run lint`
   - `npm run test:unit -- --passWithNoTests`
   - `npm run test:cov` (backend coverage gate)
   - `npm run test:integration -- --passWithNoTests`
   - `npm run test:e2e -- --passWithNoTests`
   - `npm run build`
   - k6 smoke test (10 VUs, 30s)
   - Docker build + push to GHCR

3. **deploy-staging** — Push to develop branch
   - `kubectl apply -f infra/k8s/staging.yaml`
   - Integration validation in pod

4. **deploy-production** — Push to main branch
   - `kubectl apply -f infra/k8s/production-hardened.yaml`
   - Wait for rollout (180s timeout)
   - Smoke test: `curl -f http://localhost:3001/health`
   - Verify HPA
   - Verify backup CronJob

**`.github/workflows/react-doctor.yml`:**
- Runs on PRs (opened, synchronize, reopened, ready_for_review) and pushes to main
- Uses `millionco/react-doctor@v2`
- Posts PR comments, commit status

**`.github/workflows/rollback.yml`:**
- Manual rollback procedures

---

## Troubleshooting

### Backend Won't Start
```bash
# Verify Docker infrastructure
docker-compose -f compose.dev.yaml ps

# Check PostgreSQL connectivity
docker-compose -f compose.dev.yaml logs postgres

# Verify environment variables
node apps/backend -e "require('dotenv').config(); console.log(process.env.NODE_ENV)"

# Check missing secrets (production)
node apps/backend -e "console.log('JWT_SECRET:', !!process.env.JWT_SECRET)"
```

### Frontend Build Fails
```bash
# Clear caches
rm -rf apps/*/.next apps/*/node_modules
npm ci
```

### Tests Failing
```bash
# Run specific test suite
cd apps/backend && npx jest --runInBand test/order.service.spec.ts
```

### Database Connection Issues
```bash
# Verify PostgreSQL is healthy
docker-compose -f compose.dev.yaml exec postgres pg_isready -U spicegarden -d spicegarden

# Check connection pooling
# (No explicit pool settings — relies on TypeORM defaults)
```

### Redis Connection Issues
```bash
# Verify Redis is running
docker-compose -f compose.dev.yaml exec redis redis-cli ping
```

### Rate Limiting Not Working
```bash
# In development, check RATE_LIMIT_REDIS_REQUIRED=false
# In production, ensure Redis is accessible and RATE_LIMIT_REDIS_REQUIRED=true
```

### Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001
# Or
lsof -i :3001
```

### Database Migration Issues
```bash
# Check migration status
scripts/db.sh verify

# Rollback last migration
scripts/db.sh rollback

# Full reset (WARNING: deletes all data)
scripts/db.sh reset
```
