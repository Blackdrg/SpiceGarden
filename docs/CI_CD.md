# CI/CD

## Overview

SpiceGarden uses GitHub Actions for continuous integration and deployment with three workflows: CI/CD pipeline, React Doctor quality checks, and rollback procedures.

## Workflows

### 1. CI/CD Pipeline

**File:** `.github/workflows/ci-cd.yml`

#### Triggers

| Trigger | Branches |
|---------|----------|
| Push | main, develop |
| Pull Request | main |
| Schedule | Daily at 2 AM (security audit) |

#### Jobs

### security-audit

```yaml
runs-on: ubuntu-latest
steps:
- actions/checkout@v4
- Setup Node.js 20.x with npm cache
- npm ci
- npm audit --audit-level=high
- Snyk monitor (if SNYK_TOKEN available)
```

**Purpose:** Daily security vulnerability scan
**Gate:** High/critical vulnerabilities fail the check

### build-test

```yaml
runs-on: ubuntu-latest
strategy:
  matrix:
    node-version: [20.x]
steps:
- actions/checkout@v4
- Setup Node.js 20.x
- npm ci
- npm run lint
- npm run test:unit -- --passWithNoTests
- npm run test:cov (backend)
- npm run test:integration -- --passWithNoTests
- npm run test:e2e -- --passWithNoTests
- npm run build
- k6 load test (quick smoke)
- Docker build and push (main/develop only)
```

**Purpose:** Complete build, test, and validation
**Artifacts:** Docker images pushed to ghcr.io

### deploy-staging

```yaml
needs: build-test
if: github.ref == 'refs/heads/develop'
environment: staging
steps:
- Set up kubectl
- Substitute image tag with 'develop'
- kubectl apply -f infra/k8s/staging.yaml
- kubectl wait for deployment
- Run smoke tests
```

**Purpose:** Auto-deploy to staging on develop branch
**Environment:** spicegarden-staging namespace

### deploy-production

```yaml
needs: build-test
if: github.ref == 'refs/heads/main'
environment: production
steps:
- Set up kubectl
- Substitute image tag with github.sha
- kubectl apply -f infra/k8s/production-hardened.yaml
- kubectl wait for rollout
- Run smoke tests (curl /health)
- Verify autoscaling
- Verify backup CronJob
```

**Purpose:** Auto-deploy to production on main branch
**Environment:** spicegarden-production namespace

### 2. React Doctor

**File:** `.github/workflows/react-doctor.yml`

Runs React Doctor quality checks on all frontend workspaces.

### 3. Rollback

**File:** `.github/workflows/rollback.yml`

Rollback procedure for failed deployments.

## Docker Registry

**Registry:** ghcr.io (GitHub Container Registry)

**Image Naming:**
```
ghcr.io/spicegarden/backend:latest
ghcr.io/spicegarden/backend:{github.sha}
ghcr.io/spicegarden/backend:develop (staging)
ghcr.io/spicegarden/backend:main (production)
```

**Build Caching:**
```yaml
cache-from: type=registry,ref=ghcr.io/spicegarden/backend:cache
cache-to: type=registry,ref=ghcr.io/spicegarden/backend:cache,mode=max
```

## Environment Promotion Flow

```
develop branch → staging environment
    ↓
main branch → production environment
```

### Image Tag Strategy

| Branch | Tag | Namespace |
|--------|-----|-----------|
| develop | `develop` | spicegarden-staging |
| main | `{github.sha}` | spicegarden-production |

## Security Scanning

### Snyk Integration

- Daily scan (cron: 0 2 * * *)
- Severity threshold: high
- Token: SNYK_TOKEN secret

### npm audit

- Gate: `--audit-level=high`
- Runs on every build-test job

### Container Scanning

Not explicitly configured - Docker images built and pushed without additional scanning.

## Secrets Management

### GitHub Secrets

```yaml
secrets.SNYK_TOKEN
secrets.KUBECONFIG
```

### Kubernetes Secrets

**File:** `infra/k8s/secrets.yaml`

Applied separately from CI/CD (not in workflow).

## Cache Strategy

### Node.js Dependencies

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

Caches `~/.npm` between runs.

### Docker Layers

Registry-based Docker layer caching:
- Cache from previous build
- Max cache mode for optimal reuse

## Test Strategy in CI

| Test Type | Command | Gate |
|-----------|---------|------|
| Lint | `npm run lint` | Must pass (0 errors) |
| Unit | `npm run test:unit` | Must pass |
| Coverage | `npm run test:cov` | 80% threshold |
| Integration | `npm run test:integration` | Must pass |
| E2E | `npm run test:e2e` | Must pass |
| Load | k6 smoke test | Must pass |
| Security | `npm audit --audit-level=high` | Must pass (0 high) |

## Deployment Verification

### Staging

| Check | Command |
|-------|---------|
| Deployment available | `kubectl wait --for=condition=available --timeout=120s` |
| Rollout status | `kubectl rollout status --timeout=60s` |

### Production

| Check | Command |
|-------|---------|
| Deployment available | `kubectl wait --for=condition=available --timeout=180s` |
| Rollout status | `kubectl rollout status --timeout=120s` |
| Health check | `kubectl exec -- curl -f http://localhost:3001/health` |
| Autoscaling | `kubectl get hpa` |
| Backup CronJob | `kubectl get cronjob` |

## Rollback Procedure

### Kubernetes Rollback

```bash
kubectl rollout undo deployment/spicegarden-backend -n spicegarden-production
kubectl rollout status deployment/spicegarden-backend -n spicegarden-production
```

### Image Rollback

```bash
kubectl set image deployment/spicegarden-backend \
  spicegarden-backend=ghcr.io/spicegarden/backend:{previous-tag} \
  -n spicegarden-production
```

## Missing CI/CD Features

| Feature | Status | Notes |
|---------|--------|-------|
| E2E tests in CI | Not configured | E2E tests not in ci-cd.yml |
| Frontend deployment | Missing | Only backend Docker deployed |
| Image signing | Missing | No cosign/sigstore |
| SBOM generation | Missing | No Software Bill of Materials |
| Dependency review | Missing | No Dependabot/Renovate config |
