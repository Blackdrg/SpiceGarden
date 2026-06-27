# Deployment Guide

## Architecture Overview

SpiceGarden supports two deployment targets:
1. **Docker Compose** - Development and small-scale production
2. **Kubernetes** - Production-grade orchestration

## Prerequisites

### For Docker Compose

| Prerequisite | Version | Purpose |
|--------------|---------|---------|
| Node.js | 20.x | Runtime for backend and frontends |
| npm | 10+ | Package management |
| Docker Desktop | Latest | Container runtime |
| Docker Compose | v2+ | Multi-container orchestration |

### For Kubernetes

| Prerequisite | Version | Purpose |
|--------------|---------|---------|
| kubectl | v1.28+ | Cluster management |
| Docker | Latest | Image builds |
| ghcr.io access | - | Container registry |
| Kubernetes cluster | v1.28+ | Production orchestration |

## Configuration Setup

### Step 1: Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Step 2: Generate Secrets

**Windows (PowerShell):**
```powershell
powershell -File infra/scripts/generate-secrets.ps1
```

**Linux/Mac (bash):**
```bash
bash infra/scripts/generate-secrets.sh
```

### Step 3: Required Environment Variables

**Backend (apps/backend/.env or root .env):**

```env
# Core
NODE_ENV=production
PORT=3001

# PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_USER=spicegarden
DB_PASS=<generated>
DB_NAME=spicegarden

# MongoDB
MONGO_URI=mongodb://mongo:27017/spicegarden

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=<32+ chars random>
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_SECRET=<32 chars AES key>

# Payment Gateways
PAYMENT_PRIMARY_GATEWAY=stripe
STRIPE_SECRET_KEY=<stripe secret>
STRIPE_WEBHOOK_SECRET=<stripe webhook secret>
RAZORPAY_KEY_ID=<razorpay key id>
RAZORPAY_KEY_SECRET=<razorpay secret>
RAZORPAY_WEBHOOK_SECRET=<razorpay webhook secret>

# Communication
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=<sendgrid api key>
SMTP_FROM=noreply@spicegarden.com
TWILIO_ACCOUNT_SID=<twilio sid>
TWILIO_AUTH_TOKEN=<twilio token>
TWILIO_PHONE_NUMBER=<twilio phone>
FCM_SERVER_KEY=<fcm key>
GOOGLE_MAPS_API_KEY=<google maps key>
SENDGRID_API_KEY=<sendgrid key>

# Observability
SENTRY_DSN=<sentry dsn>

# CORS (comma-separated, NO wildcards in production)
CORS_ALLOWED_ORIGINS=https://app.spicegarden.com,https://admin.spicegarden.com
```

**Frontend (.env.local or platform-specific env):**
```env
NEXT_PUBLIC_API_URL=https://api.spicegarden.com
```

## Docker Compose Deployment

### Start Infrastructure

```bash
docker-compose -f compose.dev.yaml up -d
```

### Verify Stack

```bash
node infra/scripts/verify-stack.js
```

Expected services:
- PostgreSQL: 5432
- Redis: 6379
- MongoDB: 27017
- Prometheus: 9090
- Grafana: 3000
- OpenSearch: 9200
- Alertmanager: 9093

### Build and Start Apps

```bash
# Build all
npm run build

# Start backend
cd apps/backend && npm run start

# Start frontends (separate terminals)
cd apps/customer-web && npm run start
cd apps/restaurant-dashboard && npm run start
cd apps/super-admin && npm run start
```

### Stop Infrastructure

```bash
docker-compose -f compose.dev.yaml down
```

## Kubernetes Deployment

### Prerequisites

```bash
# Login to container registry
docker login ghcr.io

# Set kubectl context
kubectl config use-context production
```

### Create Namespaces

```bash
kubectl create namespace spicegarden-production --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace spicegarden-staging --dry-run=client -o yaml | kubectl apply -f -
```

### Apply Secrets

```bash
kubectl apply -f infra/k8s/secrets.yaml -n spicegarden-production
```

### Deploy Staging

```bash
# Update image tag in staging manifest
sed -i "s|\${IMAGE_TAG:-develop}|develop|g" infra/k8s/staging.yaml

# Deploy
kubectl apply -f infra/k8s/staging.yaml -n spicegarden-staging --create-namespace

# Verify
kubectl rollout status deployment/spicegarden-backend-staging -n spicegarden-staging --timeout=120s
```

### Deploy Production

```bash
# Update image tag in production manifest
sed -i "s|:latest|:${IMAGE_TAG}|g" infra/k8s/production-hardened.yaml

# Deploy
kubectl apply -f infra/k8s/production-hardened.yaml -n spicegarden-production --create-namespace

# Verify rollout
kubectl rollout status deployment/spicegarden-backend -n spicegarden-production --timeout=120s

# Verify autoscaling
kubectl get hpa -n spicegarden-production

# Verify backup CronJob
kubectl get cronjob -n spicegarden-production
```

### Production Hardening Manifest

**File:** `infra/k8s/production-hardened.yaml`

| Feature | Configuration |
|---------|--------------|
| Replicas | 3 with rolling updates |
| PodDisruptionBudget | minAvailable: 2 |
| HPA | min 3, max 20 replicas (70% CPU, 80% memory) |
| SecurityContext | runAsNonRoot, runAsUser 1001, readOnlyRootFilesystem |
| Capabilities | drop ALL |
| NetworkPolicy | Restricted ingress/egress |
| Probes | /health (liveness, readiness, startup) |
| Backup | Daily CronJob at 2AM |

## Docker Build

### Multi-stage Build

All Dockerfiles use multi-stage builds for production:
- Stage 1: Dependencies
- Stage 2: Build
- Stage 3: Production runtime

### Build Commands

```bash
# Build backend image
docker build -t spicegarden/backend:latest -f infra/backend/Dockerfile .

# Build all frontend images
docker build -t spicegarden/customer-web:latest -f infra/customer-web/Dockerfile .
docker build -t spicegarden/restaurant-dashboard:latest -f infra/restaurant-dashboard/Dockerfile .
docker build -t spicegarden/super-admin:latest -f infra/super-admin/Dockerfile .
docker build -t spicegarden/delivery-partner:latest -f infra/delivery-partner/Dockerfile .
```

## Health Checks

### Backend Health

```
GET http://localhost:3001/health
```

**Expected Response:** `200 OK`

### Metrics Endpoint

```
GET http://localhost:3001/metrics
```

**Response:** Prometheus metrics text format

## Rolling Updates

### Kubernetes Rolling Update

```bash
kubectl set image deployment/spicegarden-backend \
  spicegarden-backend=ghcr.io/spicegarden/backend:${NEW_TAG} \
  -n spicegarden-production
```

### Rollback

```bash
kubectl rollout undo deployment/spicegarden-backend -n spicegarden-production
kubectl rollout status deployment/spicegarden-backend -n spicegarden-production
```

## Backup & Recovery

### Manual Backup

```bash
bash infra/scripts/backup.sh
```

### Restore from Backup

```bash
bash infra/scripts/disaster-recovery.sh --production
```

### PostgreSQL Backup

```bash
pg_dump -h localhost -U spicegarden spicegarden > backup.sql
```

### Verify Backup

```bash
bash infra/scripts/backup-verification.sh
```

## Operational Scripts

### Infrastructure Validation

```bash
node infra/scripts/verify-stack.js
```

### Security Tests

```bash
node infra/scripts/security-tests.js
node infra/scripts/penetration-tests.js
```

### Load Tests

```bash
npm run test:load -- --vus 10000 --duration 30s
```

### Chaos Tests

```bash
kubectl apply -f apps/backend/test/chaos/
```

### Breaking Point Tests

```bash
node infra/scripts/breaking-point.js
```

## TLS/SSL

### Ingress TLS

Configurable via `infra/k8s/cdn-ingress.yaml`:

```yaml
tls:
  - hosts:
      - api.spicegarden.com
      - app.spicegarden.com
      - admin.spicegarden.com
    secretName: spicegarden-tls
```

### Certificate Management

Production certificates managed via:
- ACME/Let's Encrypt (recommended)
- Custom CA (enterprise)
- Manual certificate upload (K8s Secrets)

## Monitoring

### Prometheus

- Endpoint: `http://prometheus:9090`
- Config: `infra/prometheus/prometheus.yml`
- Rules: `infra/prometheus/rules/alerts.yml`, `infra/prometheus/rules/slos.yml`

### Grafana

- Endpoint: `http://grafana:3000`
- Dashboards: `infra/grafana/dashboards/spicegarden.json`
- Provisioned datasources in `infra grafana/provisioning/`

### Alertmanager

- Endpoint: `http://alertmanager:9093`
- Config: `infra/alertmanager/alertmanager.yml`
- Routes: Slack, PagerDuty

## Troubleshooting

### Backend won't start

```bash
# Check database connectivity
docker-compose -f compose.dev.yaml logs postgres

# Check Redis connection
redis-cli ping

# Verify environment variables
node apps/backend -e "require('dotenv').config(); console.log(process.env.NODE_ENV)"
```

### Frontend build fails

```bash
# Clear caches
rm -rf apps/*/.next apps/*/node_modules
npm ci

# Verify transpilePackages
cat apps/customer-web/next.config.js
```

### Container won't start

```bash
# Check logs
docker logs spicegarden-backend

# Verify health check
curl -f http://localhost:3001/health

# Check resource limits
docker stats
```
