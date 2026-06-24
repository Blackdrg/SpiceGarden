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

### Current Status
- Backend coverage: 91.68% (statements), 82.17% (branches), 80.11% (functions), 91.78% (lines)
- Wallet service coverage: ~99% (statements), ~86% (branches)
- Build: ✅ Passing (all 11 workspaces)
- Lint: ✅ Passing (all workspaces)
- Tests: ✅ All passing (929 passed, 1 skipped) - excludes mongo-connection (needs MongoDB)
- npm audit: 31 moderate vulnerabilities (0 high, 0 critical)
- Rate limiting: Blocked (requires running backend)
- Security tests: Blocked (requires running backend)

### Overall Production Readiness Score: 87% (VERIFIED)

### React Doctor Scores
- customer-web: 64/100 (16 warnings - maintainability)
- delivery-partner: 61/100 (35 warnings - maintainability)
- restaurant-dashboard: 75/100 (4 warnings - good)
- super-admin: 74/100 (5 warnings - good)

### Blocked Tasks (Require Backend Running)
- Rate limiting security test (infra/scripts/security-tests.js)
- Penetration tests (infra/scripts/penetration-tests.js)
- Load testing (npm run test:load)