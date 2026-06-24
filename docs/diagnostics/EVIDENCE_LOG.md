# Evidence Log

**Generated:** 2026-06-24  
**Purpose:** Authoritative evidence for all repository claims

## Build & Lint Evidence

| Check | Command | Result | Evidence Source | Confidence |
|-------|---------|--------|-----------------|------------|
| Lint | `npm run lint` | In progress (timeout) | Package.json scripts, workspaces definition | High |
| Build | `npm run build` | Timeout during execution | Package.json build scripts | Medium |
| Workspace structure | `package.json` workspaces field | 2 workspace globs: `apps/*`, `packages/*` | package.json:6-8 | High |

## Test Evidence

| Check | Command | Result | Evidence Source | Confidence |
|-------|---------|--------|-----------------|------------|
| Backend test files | `Get-ChildItem apps/backend/test/*.spec.ts` | 62 files | File system count | High |
| Backend test run | `cd apps/backend; npm test` | 911 passed, 6 failed, 1 skipped | Console output | High |
| MongoDB test status | `test/mongo-connection.spec.ts` | 1 suite failed (MongoDB not initialized) | Console output line 1 | High |
| Test categories | Package.json scripts | unit, integration, e2e, load, chaos | apps/backend/package.json:11-21 | High |
| Unit test scripts | Test file inventory | 43 unit spec files observed | File system glob | High |

## Coverage Evidence

| Metric | Claim | Evidence | Confidence |
|--------|-------|----------|------------|
| Coverage thresholds | 80% global | apps/backend/package.json:13 | High |
| Coverage status | Below threshold | README.md line 18, AGENTS.md line 94 | Medium |

## Security Evidence

| Control | Implementation | Evidence | Confidence |
|---------|---------------|----------|------------|
| Helmet | Implemented | apps/backend/src/main.ts:215 | High |
| HPP | Implemented | apps/backend/src/main.ts:237 | High |
| Rate limiting | Implemented | apps/backend/src/main.ts:136-144 | High |
| CORS | Implemented | apps/backend/src/main.ts:208 | High |
| CSRF protection | Implemented | apps/backend/src/main.ts:235 | High |
| Mongo sanitization | Implemented | apps/backend/src/main.ts:172-204 | High |
| Security tests | Script exists | infra/scripts/security-tests.js | High |
| gRPC transport | Quarantined stub | packages/grpc-transport/src/index.ts | High |

## Dependency Evidence

| Check | Command | Result | Evidence | Confidence |
|-------|---------|--------|----------|------------|
| npm audit | `npm audit --json` | 31 moderate, 0 high, 0 critical | Console output | High |
| Vulnerabilities | `npm audit --json` | 1 unique vulnerability type | Console output | High |

## Infrastructure Evidence

| Component | Files | Status | Evidence | Confidence |
|-----------|-------|--------|----------|------------|
| Docker Compose services | 9 | Config verified | compose.dev.yaml services block | High |
| K8s manifests | 6 | Config verified | infra/k8s/*.yaml | High |
| Prometheus port | 9090 | Config verified | compose.dev.yaml line 48 | High |
| Grafana port | 3000 | Config verified | compose.dev.yaml line 62 | High |
| Alertmanager port | 9093 | Config verified | compose.dev.yaml line 105 | High |
| OpenSearch port | 9200 | Config verified | compose.dev.yaml line 79 | High |
| Backend port | 3001 | Config verified | compose.dev.yaml line 121, main.ts:280 | High |

## Entity Evidence

| Count | Evidence Source | Method | Confidence |
|-------|-----------------|--------|------------|
| 64 entities | `apps/backend/src/db/entities/*.entity.ts` | File count | High |
| 8 additional entities | `apps/backend/src/services/payments/*.entity.ts` | File count | High |
| **Total: 72 entities** | Combined | Sum of above | High |

## Controller Evidence

| Count | Evidence Source | Method | Confidence |
|-------|-----------------|--------|------------|
| 1 controller in app.controller.ts | `apps/backend/src/app.controller.ts` | File exists | High |
| Module-based routing | `src/services/*/*.controller.ts` | Multiple controllers found | High |

## Service Evidence

| Count | Evidence Source | Method | Confidence |
|-------|-----------------|--------|------------|
| 126 service files | `apps/backend/src/services/**/*.ts` (excluding specs) | File count | High |

## Mobile App Evidence

| App | Screens/Routes | Evidence | Confidence |
|-----|----------------|----------|------------|
| customer-mobile | 14 screens | apps/customer-mobile/src/screens/*.tsx (14 TSX files) | High |
| delivery-partner | 1 screen + android native | apps/delivery-partner/src/*.ts (3 files) | High |

## Web App Evidence

| App | Routes/Pages | Evidence | Confidence |
|-----|--------------|----------|------------|
| customer-web | ~21 pages | apps/customer-web/src/pages/*.tsx | High |
| restaurant-dashboard | ~2 pages | apps/restaurant-dashboard/src/pages/*.tsx | High |
| super-admin | ~2 pages | apps/super-admin/src/pages/*.tsx | High |

## Environment Evidence

| Variable | Status | Evidence | Confidence |
|----------|--------|----------|------------|
| Required secrets (16) | 3/16 valid | infra/scripts/validate-secrets.js line 14-31 | High |
| JWT_SECRET | Placeholder | .env.example line 29 | High |
| ENCRYPTION_SECRET | Placeholder | .env.example line 31 | High |
| Payment keys | Test placeholders | .env.example lines 39-48 | High |
| SMS/FCM keys | Empty placeholders | .env.example lines 68-73 | High |

## CI/CD Evidence

| Stage | Implementation | Evidence | Confidence |
|-------|----------------|----------|------------|
| Security audit | Runs on push/PR/schedule | .github/workflows/ci-cd.yml lines 16-36 | High |
| Build-test | Multi-stage pipeline | .github/workflows/ci-cd.yml lines 37-72 | High |
| Staging deploy | kubectl/Helm deploy | .github/workflows/ci-cd.yml lines 91-127 | High |
| Production deploy | kubectl/Helm deploy | .github/workflows/ci-cd.yml lines 129-179 | High |
| Coverage gate | Configured in test:cov | apps/backend/package.json:13 | High |

## Observability Evidence

| Component | Status | Evidence | Confidence |
|-----------|--------|----------|------------|
| Prometheus | Configured | infra/prometheus/prometheus.dev.yml | High |
| Grafana dashboards | Configured | infra/grafana/dashboards/ | High |
| Alertmanager | Configured | infra/alertmanager/alertmanager.yml | High |
| OpenSearch | Configured | infra/opensearch/ | High |
| Metrics endpoint | Implemented | apps/backend/src/main.ts:252-255 | High |

## Runtime Validation Status

| Check | Status | Evidence | Confidence |
|-------|--------|----------|------------|
| Backend startup | Configurable (SQLite fallback) | main.ts line 147 localMode check | High |
| MongoDB connection | Requires running instance | mongo-connection.spec.ts assertion | High |
| Docker stack | Config valid, runtime blocked | compose.dev.yaml valid YAML, no daemon | High |
| Kubernetes | Manifests valid, cluster blocked | infra/k8s/*.yaml valid, no cluster | High |
| Security tests | Script valid, backend required | security-tests.js requires localhost:3001 | High |

## Stub/QPlaceholder Detection

| Module | Status | Evidence |
|--------|--------|----------|
| grpc-transport | Stubbed | Throws GrpcTransportUnavailableError |
| driver-app | Stubbed | No package.json, only placeholder App.tsx |