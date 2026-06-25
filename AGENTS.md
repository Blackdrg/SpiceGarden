# SpiceGarden Development Commands

## Infrastructure
- `docker-compose -f compose.dev.yaml up -d` - Start dev infrastructure (Docker Desktop required)
- `docker-compose -f compose.dev.yaml down` - Stop infrastructure
- `powershell -File infra/scripts/generate-secrets.ps1` - Generate new secrets (Windows)
- `node infra/scripts/fake-orders.js` - Run fake order tests
- `node infra/scripts/breaking-point.js` - Run breaking point tests

## Backend
- `npm run dev` - Start all frontends in dev mode
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `cd apps/backend && npm run test` - Run backend tests
- `cd apps/backend && npm run test:unit` - Run unit tests
- `cd apps/backend && npm run dev` - Start backend with hot reload

## Testing
- `npm run test:unit` - Unit tests
- `npm run test:integration` - Integration tests
- `npm run test:e2e` - End-to-end tests
- `npm run test:all` - All tests combined
- `node infra/scripts/security-tests.js` - Run security vulnerability tests
- `node infra/scripts/penetration-tests.js` - Run penetration tests
- `npm run test:load` - Run k6 load tests (10k users)
- `npm run test:load:20k` - Run k6 load tests (20k users)
- `npm run test:chaos` - Run chaos experiments

## Ports
- Backend: 3001
- Grafana: 3000
- Prometheus: 9090
- Alertmanager: 9093
- OpenSearch: 9200
- OpenSearch Dashboards: 5601

## Environment
- Copy `.env.example` to `.env` for local development
- Secrets stored in `./secrets/` (gitignored)

## Production Operations
- `bash infra/scripts/backup.sh` - Run manual backup
- `bash infra/scripts/disaster-recovery.sh --production` - Restore production from backup
- `bash infra/scripts/autoscaling-validation.sh production` - Validate autoscaling configuration
- `kubectl apply -f infra/k8s/production-hardened.yaml` - Deploy hardened production
- `kubectl apply -f infra/k8s/staging.yaml` - Deploy staging environment
- `kubectl apply -f infra/k8s/cdn-ingress.yaml` - Deploy CDN/Ingress

## Feature Freeze (Effective Immediately)

Feature growth is completely frozen. No exceptions require explicit approval.

**Hard rules:**
- No new modules
- No new AI features
- No redesign
- No extra dashboards
- No new frontend routes

**Only permitted work:**
- Bug fixing
- Reliability improvements
- Deployment fixes
- Production hardening

**Frozen areas (no changes without approval):**
- Backend APIs
- DB schema
- Auth flow
- Payment flow
- Order lifecycle
- WebSocket contracts
- Frontend routes

## Production Readiness Status

### Verified Metrics (Phase 1 Baseline)
- ✅ Build: 12 workspaces, exit code 0
- ✅ Lint: 0 errors across all workspaces
- ✅ Unit Tests: 542 passed, 0 failed (28 suites)
- ✅ Backend Coverage: Statements 91.28% | Branches 81.1% | Functions 91.22% | Lines 91.21% (80%+ threshold met)
- ✅ Security Tests: 0 vulnerabilities (SQL injection, XSS, rate limiting, auth bypass, path traversal)
- ✅ Penetration Tests: 0 issues (port scan, security headers, CORS, HTTP methods)
- ✅ Stack Boot: PASS (backend, grafana, prometheus, opensearch all reachable)
- ⚠️ npm audit: 31 moderate vulnerabilities (dev toolchain only, 0 high/critical)

### React Doctor Status (requires Phase 2 fixes)
- customer-mobile: 65/100 (126 warnings)
- customer-web: 63/100 (32 warnings)
- delivery-partner: 59/100 (51 warnings)
- restaurant-dashboard: 74/100 (5 warnings)
- super-admin: 62/100 (10 warnings)

### Overall Production Readiness Score: 75% (PARTIAL - Phase 1 complete, Phase 2 in progress)