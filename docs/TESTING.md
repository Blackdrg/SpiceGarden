# SpiceGarden Testing Documentation

**Version:** 0.0.0  
**Last Updated:** 2026-06-27

---

## Table of Contents

1. [Test Framework](#test-framework)
2. [Test Organization](#test-organization)
3. [Backend Tests](#backend-tests)
4. [Frontend Tests](#frontend-tests)
5. [Mobile Tests](#mobile-tests)
6. [Load Tests](#load-tests)
7. [Chaos Tests](#chaos-tests)
8. [Security Tests](#security-tests)
9. [Coverage](#coverage)
10. [CI/CD Integration](#cicd-integration)

---

## Test Framework

| App | Framework | Runner | Environment |
|-----|-----------|--------|-------------|
| Backend | Jest 29.7.0 | ts-jest 29.4.11 | node |
| Customer Web | Jest 30.4.2 | babel-jest / next/jest | jsdom |
| Restaurant Dashboard | Jest 30.4.2 | babel-jest | jsdom |
| Super Admin | Jest 30.4.2 | babel-jest | jsdom |
| Customer Mobile | Jest 29.7.0 | babel-jest | node |
| Delivery Partner | Jest 29.7.0 | babel-jest | node |
| Launcher | Jest 29.7.0 | ts-jest | node |
| UI Package | Jest 29.7.0 | ts-jest | jsdom |
| Shared Package | Jest 29.7.0 | ts-jest | jsdom |

**No vitest, mocha, cypress, or playwright configurations found.**

---

## Test Organization

### Jest Config Files (10 total)
```
apps/backend/jest.config.js
apps/customer-web/jest.config.js
apps/restaurant-dashboard/jest.config.js
apps/super-admin/jest.config.js
apps/customer-mobile/jest.config.js
apps/delivery-partner/jest.config.js
apps/launcher/jest.config.js
packages/ui/jest.config.js
packages/shared/jest.config.js
```

### Test Setup Files (9 total)
```
__tests__/test-utils.ts                    # Root shared utilities
apps/backend/test/jest-setup.ts            # TypeORM, MongoDB, Stripe, Redis mocks
packages/ui/jest.setup.ts                  # @testing-library/jest-dom
apps/customer-web/jest.setup.ts            # @testing-library/jest-dom, fetch
apps/restaurant-dashboard/jest.setup.ts    # Same pattern
apps/super-admin/jest.setup.ts             # Same pattern
apps/customer-mobile/jest.setup.js         # RN mocks
apps/delivery-partner/jest.setup.js        # AsyncStorage, fetch mocks
```

### Mock Files (7 total)
```
apps/backend/test/__mocks__/typeorm.mock.ts
apps/backend/test/__mocks__/typeorm.ts
packages/ui/__mocks__/styleMock.js
apps/customer-mobile/__mocks__/react-native-root-toast.js
apps/customer-mobile/__mocks__/react-native-safe-area-context.js
apps/customer-mobile/__mocks__/expo-haptics.js
apps/customer-mobile/__mocks__/fileMock.js
```

---

## Backend Tests

### Test Files (68+ in test/ directory)

**Unit Tests (spec files):**
```
test/auth.controller.spec.ts
test/auth.service.spec.ts
test/audit.service.spec.ts
test/chargeback.service.spec.ts
test/compliance.coverage.spec.ts
test/compliance.service.spec.ts
test/cod-gateway.spec.ts
test/cors-origin.spec.ts
test/csrf.middleware.spec.ts
test/database-failover.service.spec.ts
test/db-migrate.spec.ts
test/delivery-edge-cases.spec.ts
test/delivery.service.spec.ts
test/dispatch-engine.service.spec.ts
test/driver-assignment-uncovered.spec.ts
test/driver-assignment.service.spec.ts
test/encryption.service.spec.ts
test/eta-intelligence.service.spec.ts
test/fraud-hardening.service.spec.ts
test/gateway-factory.service.spec.ts
test/geo.service.spec.ts
test/idempotency.service.spec.ts
test/kitchen.service.spec.ts
test/ledger.service.spec.ts
test/logging.service.spec.ts
test/loyalty-edge-cases.spec.ts
test/missing-env.error.spec.ts
test/nnotification.service.spec.ts
test/notification-preferences.service.spec.ts
test/order-edge-cases.spec.ts
test/order.service.async.spec.ts
test/order.service.flow.spec.ts
test/order.service.spec.ts
test/payment-edge-cases.service.spec.ts
test/payments.module.spec.ts
test/payments.service.spec.ts
test/rate-limit-store.coverage.spec.ts
test/rate-limit-store.spec.ts
test/razorpay-gateway.spec.ts
test/refund.service.spec.ts
test/reliability.failure-recovery.spec.ts
test/retry-service.spec.ts
test/rbac-coverage.spec.ts
test/security-guards.spec.ts
test/security-validation.spec.ts
test/stripe-gateway.spec.ts
test/tax-reporting.service.spec.ts
test/tracking.gateway.unit.spec.ts
test/vault.service.spec.ts
test/wallet.controller.spec.ts
test/webhook.service.spec.ts
src/services/order/order.service.spec.ts
src/services/payments/fraud-hardening.service.spec.ts
```

**Integration Tests:**
```
test/auth.integration.spec.ts
test/delivery.integration.spec.ts
test/order-flow.integration.spec.ts
test/order-kds.integration.spec.ts
test/payment-order.integration.spec.ts
test/refund-wallet.integration.spec.ts
test/driver-customer.integration.spec.ts
```

**E2E Tests:**
```
test/e2e.spec.ts
test/payment-verification.e2e.spec.ts
```

### Test Scripts
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage --coverageThreshold={\"global\":{\"branches\":80,\"functions\":80,\"lines\":80,\"statements\":80}}",
  "test:unit": "jest --runInBand test/order.service.spec.ts test/kitchen.service.spec.ts test/delivery.service.spec.ts",
  "test:integration": "jest --testPathPatterns=\".integration.\" --testPathIgnorePatterns=\"mongo-connection.spec.ts\"",
  "test:e2e": "jest --runInBand test/e2e.spec.ts test/payment-verification.e2e.spec.ts",
  "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
}
```

---

## Frontend Tests

### Customer Web
```
__tests__/cart-slice.test.ts           # Redux cart unit tests
__tests__/checkout.e2e.test.tsx        # Checkout e2e
__tests__/api.integration.test.ts      # API integration
```

### Restaurant Dashboard
```
__tests__/kitchen-dashboard.test.tsx   # KDS unit tests
__tests__/kds.e2e.test.tsx             # KDS e2e
__tests__/api.integration.test.ts      # API integration
```

### Super Admin
```
__tests__/admin-flow.e2e.test.ts       # Admin flow e2e
__tests__/analytics.e2e.test.tsx       # Analytics e2e
__tests__/api.integration.test.ts      # API integration
```

### Customer Mobile
```
__tests__/App.test.tsx
__tests__/HomeScreen.test.js
__tests__/CartScreen.test.js
__tests__/e2e-flow.test.tsx
__tests__/auth-flow.integration.test.js
__tests__/auth-cart.integration.spec.ts
__tests__/auth-cart.integration.spec.js
__tests__/e2e-flow.test.tsx
```

### Delivery Partner
```
src/services/__tests__/delivery-flow.e2e.test.ts
src/services/__tests__/storage.integration.test.ts
src/services/__tests__/delivery-api.service.test.ts
```

### UI Package
```
__tests__/Button.test.tsx
__tests__/ButtonRegression.test.tsx
__tests__/Input.test.tsx
__tests__/useFlow.test.tsx
__tests__/LoadingStates.test.tsx
```

### Shared Package
```
__tests__/api.test.ts
__tests__/constants.test.ts
```

---

## Load Tests

**Location:** `apps/backend/test/load/`  
**Runner:** k6  
**Total:** 20 test scripts

| Script | Users | Purpose |
|--------|-------|---------|
| `10-users.js` | 10 | Basic ramp |
| `50-users.js` | 50 | Small load |
| `250-users.js` | 250 | Medium load |
| `500-users.js` | 500 | Medium-high load |
| `1k-users.js` | 1000 | High load |
| `2.5k-users.js` | 2500 | High load |
| `5k-users.js` | 5000 | Very high load |
| `10k-users.js` | 10000 | Default load test |
| `20k-users.js` | 20000 | Peak load test |
| `breaking-point.js` | — | Find max capacity |
| `concurrent-users.js` | — | Concurrent sessions |
| `friday-dinner-rush.js` | — | Peak traffic simulation |
| `order-placement-stress.js` | — | Order stress |
| `payment-spike.js` | — | Payment spike |
| `redis-saturation.js` | — | Redis saturation |
| `smoke-test.js` | — | Quick smoke |
| `user-flow-10k.js` | — | Full flow at 10k VUs |
| `websocket-stress.js` | — | WebSocket stress |
| `db-bottleneck.js` | — | DB bottleneck |

**Support files:**
- `common.js` — Shared helpers (registerUser, loginUser, createOrder, etc.)
- `k6-results.json` — Results artifact

---

## Chaos Tests

**Location:** `apps/backend/test/chaos/`

### YAML Files (6)
```
chaos-redis-pod-failure.yaml          # Redis pod kill
chaos-redis-network-delay.yaml        # Redis network delay
chaos-postgres-pod-failure.yaml       # PostgreSQL pod kill
chaos-postgres-network-partition.yaml # PostgreSQL network partition
chaos-websocket-delay.yaml            # WebSocket delay
chaos-payment-timeout.yaml            # Payment provider timeout
PLAYBOOK.md                           # 128-line playbook with success criteria
```

**Runner:** `kubectl apply -f test/chaos/`

---

## Security Tests

**Scripts:**
- `infra/scripts/security-tests.js` — SQL injection, XSS, rate limiting, auth bypass, path traversal
- `infra/scripts/penetration-tests.js` — Port scan, security headers, CORS, HTTP methods

**Result:** 0 vulnerabilities, 0 issues (from AGENTS.md)

### Test Utilities
- `infra/scripts/validate-env-consistency.js` — Environment consistency validation
- `infra/scripts/validate-secrets.js` — Secrets validation
- `infra/scripts/secrets-rotation.ps1.js` — Secrets rotation testing

---

## Coverage

### Backend Coverage Configuration
```json
{
  "collectCoverageFrom": ["src/**/*.ts", "!**/*.d.ts", "!src/main.ts", "!src/db/entities/**/*.ts"],
  "coverageDirectory": "coverage",
  "coverageReporters": ["text", "json", "json-summary"],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Backend Coverage (from AGENTS.md)
| Metric | Value |
|--------|-------|
| Statements | 91.28% |
| Branches | 81.1% |
| Functions | 91.22% |
| Lines | 91.21% |

### Frontend Coverage
**No coverage configuration found for customer-web, restaurant-dashboard, super-admin, customer-mobile, delivery-partner.**

### Root-Level Tests
```
__tests__/auth-security.test.ts    # Auth security tests
__tests__/test-utils.ts            # Shared test utilities
```

---

## CI/CD Integration

### GitHub Actions CI/CD
**File:** `.github/workflows/ci-cd.yml`

**Jobs:**
1. **security-audit** — `npm audit --audit-level=high` + Snyk monitor
2. **build-test** — lint, unit tests, coverage, integration, e2e, build, Docker, k6 smoke
3. **deploy-staging** — kubectl apply staging
4. **deploy-production** — kubectl apply production, verify HPA, backup CronJob

### React Doctor
**File:** `.github/workflows/react-doctor.yml` (root) + `apps/customer-web/.github/workflows/react-doctor.yml`

- Runs on PRs + pushes to main
- Uses `millionco/react-doctor@v2`
- Posts PR comments + commit status
- Advisory mode (not blocking)
