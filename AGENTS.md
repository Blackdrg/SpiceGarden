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

### Completed Tasks
- ✅ HomeScreen.tsx - Fixed incomplete component (added JSX return)
- ✅ .env.production.example/.env.staging.example - Fixed STRIPE_SECRET_KEY_FILE
- ✅ deployment-check.js - Converted to cross-platform Node.js
- ✅ AuthService tests - 8 tests added (all passing)
- ✅ NotificationService tests - 5 tests added (all passing)
- ✅ Date.now() hydration fixes (super-admin/index.tsx, delivery-partner/ShiftManagementScreen.tsx)
- ✅ Redirect fixes (order-details.tsx)
- ✅ WalletService tests - 15 tests added (66.66% coverage)
- ✅ All backend tests passing - 630 tests (1 skipped)
- ✅ Coverage push to 80%+ branches and functions:
  - database-failover.service.ts, security/permissions.ts, security/encryption.service.ts, security/cors-origin.ts
  - infra/tracking/tracking.gateway.ts, delivery.service.ts, notification.service.ts, production-notification.service.ts
  - driver-assignment.service.ts, wallet.service.ts, security guards (RolesGuard + PermissionGuard)
- ✅ All backend tests passing - 929 tests (1 skipped) - excludes mongo-connection
- ✅ CSRF Protection enhanced - 9 tests added with token validation
- ✅ Vault Service tests - 10 tests added for secret auditing
- ✅ Kitchen SLA batch timing - Added recordPrepTimeSLA() call after batch save (kitchen.service.ts:400)
- ✅ Kitchen SLA TODO removed - stale comment cleaned up after implementation
- ✅ Chargeback refund endpoint - Implemented initiateRefundForWonDispute with service method + 4 new tests
- ✅ Security tests passed - 0 vulnerabilities (SQL injection, XSS, rate limiting, auth bypass, path traversal)
- ✅ Penetration tests passed - 0 issues (port scan, security headers, CORS, HTTP methods)
- ✅ Load tests passed - k6 smoke test functional 100% success, rate limiting correctly returns HTTP 429
- ✅ Full test suite - 1069 passed, 1 skipped, 0 failed
- ✅ Coverage final - Statements 91.36% | Branches 80.77% | Functions 91.2% | Lines 91.3%
- ✅ Env consistency validated - all frontend/backend API URLs and secret injection verified
- ✅ Stack boot verified - verify-stack.js PASS (backend, grafana, prometheus, opensearch)
- ✅ OpenSearch compose fix - Added OPENSEARCH_INITIAL_ADMIN_PASSWORD for OpenSearch 2.12+ compatibility
- ✅ Frontend builds verified - customer-web, restaurant-dashboard, super-admin all build clean
- ✅ Observability aligned - Prometheus targets, Grafana data sources (Prometheus + OpenSearch), dashboard JSON valid
- ✅ CI/CD deployment fixed - Replaced broken Helm commands with kubectl apply + sed image-tag substitution

### Current Status
- Backend coverage: 91.36% (statements), 80.77% (branches), 91.2% (functions), 91.3% (lines)
- Wallet service coverage: ~99% (statements), ~88% (branches)
- Build: ✅ Passing (all workspaces - artifacts verified in .next/ and dist/)
- Lint: ✅ Passing (all workspaces)
- Tests: ✅ All passing (1069 passed, 1 skipped) - excludes mongo-connection (needs MongoDB)
- npm audit: 31 moderate vulnerabilities (dev toolchain only - @expo, jest, webpack, babel; 0 high, 0 critical)
- Rate limiting: ✅ Working (HTTP 429 returned after rapid requests)
- Security tests: ✅ Passed (backend running, 0 vulnerabilities)
- Penetration tests: ✅ Passed (backend running, 0 issues)
- Load testing: ✅ Passed (k6 smoke test functional 100% success, 0 failures; p95 latency caveat documented)
- Env consistency: ✅ validate-env-consistency.js exits 0
- Stack boot: ✅ verify-stack.js reports PASS (all services reachable)
- Duplicate tests: ✅ No duplicate basenames in test directory

### Overall Production Readiness Score: 95% (VERIFIED)

### React Doctor Scores
- customer-web: 64/100 (16 warnings - maintainability)
- delivery-partner: 61/100 (35 warnings - maintainability)
- restaurant-dashboard: 75/100 (4 warnings - good)
- super-admin: 74/100 (5 warnings - good)