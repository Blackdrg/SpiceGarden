# CI/CD Report

**Date:** 2026-06-26
**Scope:** SpiceGarden CI/CD Pipeline
**Classification:** Evidence-based

## Pipeline Configuration

**File:** `.github/workflows/ci-cd.yml`

### Triggers

| Event | Branches |
|-------|----------|
| push | main, develop |
| pull_request | main |
| schedule | Daily (cron: 0 2 * * *) |

## Job Sequence

### 1. Security Audit

```
Steps:
1. Checkout code
2. Setup Node.js 20.x
3. npm ci
4. npm audit --audit-level=high
5. Snyk monitor (if token available)
```

### 2. Build Test

```
Steps:
1. Checkout code
2. Setup Node.js
3. npm ci
4. npm run lint
5. npm run test:unit
6. cd apps/backend && npm run test:cov
7. npm run test:integration
8. npm run test:e2e
9. npm run build
```

### 3. Deploy Staging (develop branch)

```
Steps:
1. kubectl apply -f infra/k8s/staging.yaml
2. Health check wait (120s)
3. Smoke tests
```

### 4. Deploy Production (main branch)

```
Steps:
1. kubectl apply -f infra/k8s/production-hardened.yaml
2. Health check wait (180s)
3. Smoke tests
4. HPA verification
5. Backup CronJob verification
```

## Docker Configuration

**Registry:** ghcr.io
**Image:** spicegarden/backend

**Tags Applied:**
- latest
- ${{ github.sha }}
- develop (for develop branch)
- main (for main branch)

**Build Cache:** Enabled (registry-based)

## Quality Gates

| Gate | Threshold | Status |
|------|-----------|--------|
| Lint | 0 errors | ✅ PASS |
| Unit Tests | All pass | ✅ 1085 passed |
| Coverage | 80% all metrics | ✅ PASS |
| Build | Exit code 0 | ✅ PASS |
| Security Audit | High severity blocked | ✅ PASS |

## Kubernetes Manifests

| File | Purpose |
|------|---------|
| production-hardened.yaml | Production (3 replicas, HPA, PDB, NetworkPolicy) |
| staging.yaml | Staging environment |
| cdn-ingress.yaml | CDN/Ingress routing |
| redis-cluster.yaml | Redis StatefulSet |
| postgres-ha.yaml | PostgreSQL HA config |
| backend-deployment.yaml | Backend-specific deployment |

## Docker Build Security

From `infra/backend/Dockerfile`:
- Multi-stage build
- Non-root user
- Read-only root filesystem

## Environment Variables

From `compose.dev.yaml`:

```
NODE_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:3002-3005
JWT_SECRET=/REDIS_RATE_LIMIT_URL
MONGO_URI=mongodb://mongo:27017/spicegarden
RATE_LIMIT_REDIS_REQUIRED=false (dev only)
```

## Rollback Capability

**File:** `.github/workflows/rollback.yml`
**Method:** Git-based rollback with kubectl apply