# Testing

## Test Strategy

SpiceGarden implements a multi-tier testing strategy covering unit, integration, E2E, load, chaos, security, and penetration testing.

## Test Infrastructure

### Test Runner
- **Jest 29.7.0** - All test suites
- **ts-jest 29.4.11** - TypeScript transpilation
- **Test Environment:** node (backend), jsdom (frontend)

### Testing Library
- **@testing-library/react** - React component tests
- **@testing-library/react-native** - React Native component tests
- **@testing-library/dom** - DOM testing utilities

### Mock Strategy
- TypeORM mocks in `apps/backend/test/__mocks__/`
- Style mocks for CSS modules
- Factory-based test data

## Backend Tests

### Unit Tests

**Location:** `apps/backend/test/*.spec.ts`
**Count:** 64 test files

**Key Test Suites:**

| Suite | File | Coverage |
|-------|------|----------|
| Order Service | `order.service.spec.ts`, `order-edge-cases.spec.ts`, `order-flow.integration.spec.ts` | Order lifecycle, validation, transitions |
| Kitchen Service | `kitchen.service.spec.ts` | KDS operations |
| Delivery Service | `delivery.service.spec.ts`, `delivery-edge-cases.spec.ts` | Driver assignment, tracking |
| Payments | `payments.service.spec.ts`, `stripe-gateway.spec.ts`, `razorpay-gateway.spec.ts` | Payment processing |
| Chargebacks | `chargeback.service.spec.ts` | Dispute handling |
| Fraud | `fraud-hardening.service.spec.ts`, `payment-edge-cases.service.spec.ts` | Fraud detection |
| Refunds | `refund.service.spec.ts`, `refund-wallet.integration.spec.ts` | Refund flow |
| Wallet | `wallet.service.spec.ts`, `wallet-edge-cases.spec.ts` | Wallet operations |
| Auth | `auth.service.spec.ts` | Authentication logic |
| Security | `security-guards.spec.ts`, `rbac-coverage.spec.ts` | RBAC enforcement |
| Rate Limiting | `rate-limit-store.spec.ts`, `rate-limit-store.coverage.spec.ts` | Redis rate limit store |
| Encryption | `encryption.service.spec.ts` | PII encryption |
| Vault | `vault.service.spec.ts` | Secret management |
| Delivery | `driver-assignment.service.spec.ts`, `dispatch-engine.service.spec.ts` | Driver dispatch |
| ETA | `eta-intelligence.service.spec.ts` | Delivery time estimation |
| Loyalty | `loyalty.service.spec.js` | Coupon/referral logic |
| Maps | `maps.service.spec.js` | Geocoding, distance |
| Notifications | `notification.service.spec.js` | Notification dispatch |
| Compliance | `compliance.service.spec.ts` | GDPR/DPDP |
| Ledger | `ledger.service.spec.ts` | Financial ledger |

### Integration Tests

**Pattern:** `*.integration.spec.ts`
**Count:** 12+ suites

| Suite | Purpose |
|-------|---------|
| `auth.integration.spec.ts` | Full auth flow |
| `delivery.integration.spec.ts` | Delivery workflow |
| `order-flow.integration.spec.ts` | Complete order lifecycle |
| `order-kds.integration.spec.ts` | Kitchen integration |
| `payment.integration.spec.ts` | Payment gateway integration |
| `payment-order.integration.spec.ts` | Payment + order flow |
| `driver-customer.integration.spec.ts` | Driver-customer interaction |
| `refund-wallet.integration.spec.ts` | Refund + wallet flow |
| `compliance.coverage.spec.ts` | Compliance edge cases |

### E2E Tests

| Suite | Purpose |
|-------|---------|
| `e2e.spec.ts` | Full application E2E |
| `payment-verification.e2e.spec.ts` | Payment verification flow |

### Chaos Tests

**Location:** `apps/backend/test/chaos/`
**Count:** 6 YAML scenarios

| Scenario | Target |
|----------|--------|
| `chaos-postgres-pod-failure.yaml` | PostgreSQL failure |
| `chaos-redis-pod-failure.yaml` | Redis failure |
| `chaos-postgres-network-partition.yaml` | Network partition |
| `chaos-redis-network-delay.yaml` | Redis latency |
| `chaos-websocket-delay.yaml` | WebSocket delay |
| `chaos-payment-timeout.yaml` | Payment timeout |

### Load Tests

**Location:** `apps/backend/test/load/`
**Tool:** k6

| Script | Purpose | Users |
|--------|---------|-------|
| `10k-users.js` | Standard load test | 10,000 |
| `20k-users.js` | High load test | 20,000 |
| `breaking-point.js` | Find breaking point | Variable |
| `user-flow-10k.js` | User journey simulation | 10,000 |
| `smoke-test.js` | Smoke test | 10 |
| `concurrent-users.js` | Concurrency test | 250-10,000 |
| `order-placement-stress.js` | Order stress | 5,000 |
| `payment-spike.js` | Payment spike test | Variable |
| `redis-saturation.js` | Redis stress | Variable |
| `websocket-stress.js` | WebSocket stress | Variable |

## Frontend Tests

### Customer Web

**Location:** `apps/customer-web/__tests__/`
**Suites:**
- `cart-slice.test.ts` - Redux cart operations
- `checkout.e2e.test.tsx` - Checkout E2E
- `api.integration.test.ts` - API integration

### Restaurant Dashboard

**Location:** `apps/restaurant-dashboard/__tests__/`
**Suites:**
- `api.integration.test.ts` - API integration
- `kds.e2e.test.tsx` - KDS E2E
- `kitchen-dashboard.test.tsx` - Dashboard tests

### Super Admin

**Location:** `apps/super-admin/__tests__/`
**Suites:**
- `admin-flow.e2e.test.js/ts` - Admin E2E
- `analytics.e2e.test.tsx` - Analytics E2E
- `api.integration.test.ts` - API integration

### Shared UI Package

**Location:** `packages/ui/__tests__/`
**Suites:**
- `Button.test.tsx` - Button component
- `ButtonRegression.test.tsx` - Regression tests
- `Input.test.tsx` - Input component
- `FlowManager.test.js` - Flow orchestration
- `Skeleton.test.js` - Skeleton loading
- `useFlow.test.tsx` - useFlow hook
- `LottieSuccessAnimation.test.js` - Animation
- `LoadingStates.test.tsx` - Loading states

### Customer Mobile

**Location:** `apps/customer-mobile/__tests__/`
**Suites:**
- `test-utils.ts` - Test utilities

### Delivery Partner

**Location:** `apps/delivery-partner/__tests__/`
- Basic test setup

### Launcher

**Location:** `apps/launcher/__tests__/`
- Electron test setup

## Test Commands

### Root
```bash
npm run test:unit         # Unit tests across all workspaces
npm run test:integration  # Integration tests
npm run test:e2e          # E2E tests
npm run test:all          # All tests combined
```

### Backend
```bash
cd apps/backend
npm run test:unit        # Jest with specific suites
npm run test:integration # Pattern: .integration.
npm run test:e2e         # E2E tests
npm run test:cov         # Coverage with 80% threshold
npm run test:load        # k6 10k users
npm run test:load:20k    # k6 20k users
npm run test:chaos       # Kubernetes chaos tests
npm test                 # All Jest tests
```

### Metrics Commands
```bash
npm run test:load:breaking # Breaking point test
npm run test:load -- --vus 10 --duration 30s # Quick smoke
```

## Security & Penetration Tests

**Scripts:**
- `infra/scripts/security-tests.js` - Automated security testing
- `infra/scripts/penetration-tests.js` - Penetration testing

**Verified:**
- SQL injection
- XSS protection
- Rate limiting
- Auth bypass prevention
- Path traversal
- Port scan resistance
- Security headers
- CORS configuration
- HTTP methods

**Results:**
- Security tests: 0 vulnerabilities
- Penetration tests: 0 issues

## Test Coverage

### Backend Coverage
- **Statements:** ~92%
- **Branches:** ~82%
- **Functions:** ~93%
- **Lines:** ~93%

### Frontend Coverage
- Unit test suites exist for all major components
- Integration tests for API communication
- E2E tests for critical user flows

## Test Environment Variables

| Variable | Purpose |
|----------|---------|
| `LOAD_TEST_MODE` | Disable rate limiting during load tests |
| `NODE_ENV` | Test environment |
| `MONGO_URI` | MongoDB for integration tests |
| `REDIS_URL` | Redis for integration tests |
