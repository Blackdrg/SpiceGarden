> HISTORICAL DOCUMENT
> This report reflects a prior audit state and is superseded by:
> `docs/CANONICAL_PROJECT_STATE_2026-06-20.md`
> and the latest README / status reports.

# INFRASTRUCTURE REPORT

**Report Date:** 2026-06-20  
**Environment:** Development → Production  
**Status:** Configured; runtime not validated

---

## Infrastructure Components Verified

### Docker Compose Files
| File | Services | Status |
|------|----------|--------|
| `compose.dev.yaml` | 15 | ✅ Present |
| `compose.infra.yaml` | 27 | ✅ Present |

### Services Configured in compose.dev.yaml
| Service | Port | Status |
|---------|------|--------|
| postgres | 5432 | ✅ Present |
| redis | 6379 | ✅ Present |
| mongo | 27017 | ✅ Present |
| prometheus | 9090 | ✅ Present |
| grafana | 3000 | ✅ Present |
| opensearch | 9200 | ✅ Present |
| alertmanager | 9093 | ✅ Present |
| backend | 3001 | ✅ Present |
| customer-web | 3002 | ✅ Present |

---

## Security Controls Verified

| Control | Status | Evidence |
|---------|--------|----------|
| Read-only containers | ✅ Present | compose.dev.yaml:166 |
| no-new-privileges | ✅ Present | compose.dev.yaml:167 |
| Resource limits | ✅ Present | compose.dev.yaml:170-178 |
| Health checks | ✅ Present | All services |
| Network isolation | ✅ Present | spicegarden-net |
| Environment secrets | ⚠️ Partial | File references in .env.production.example |

---

## Kubernetes Manifests Verified

| File | Resources | Status |
|------|-----------|--------|
| `production-hardened.yaml` | 10 | ✅ Present |
| `staging.yaml` | 5 | ✅ Present |
| `backend-deployment.yaml` | 2 | ✅ Present | [basic]
| `cdn-ingress.yaml` | 1 | ✅ Present |

---

## Monitoring Stack

| Tool | Port | Status |
|------|------|--------|
| Prometheus | 9090 | ✅ Configured |
| Grafana | 3000 | ✅ Configured |
| Alertmanager | 9093 | ✅ Configured |
| OpenSearch | 9200 | ✅ Configured |

---

## Scripts Verified

| Script | Purpose |
|--------|---------|
| `security-tests.js` | Security vulnerability tests |
| `penetration-tests.js` | Penetration testing |
| `deployment-check.js` | Deployment validation (Node.js) |
| `validate-env-consistency.js` | Environment validation |
| `generate-secrets.ps1` | Secret generation |
| `fake-orders.js` | Synthetic order testing |
| `breaking-point.js` | Stress testing |

---

## Prerequisites for Validation

1. Docker Desktop running
2. `docker-compose -f compose.dev.yaml up -d`
3. Backend health: `curl http://localhost:3001/orders/health`
4. `kubectl` access for K8s validation

---

*This report reflects file presence and configuration. Runtime validation is pending infrastructure startup.*