# Testing Strategy

## Overview

SpiceGarden employs a comprehensive testing strategy using Jest as the primary test framework across all workspaces. The test suite includes unit tests, integration tests, end-to-end tests, load tests, security tests, and chaos tests.

## Test Commands Reference

| Command | Description | Scope |
|---------|-------------|-------|
| `npm run test` | Run all tests | All workspaces |
| `npm run test:unit` | Unit tests | Workspace-level |
| `npm run test:integration` | Integration tests | Workspace-level |
| `npm run test:e2e` | End-to-end tests | Workspace-level |
| `npm run test:all` | All test types combined | Backend only |
| `npm run test:cov` | Unit tests with coverage | Backend with thresholds |
| `npm run test:mongo` | MongoDB connection tests | Backend |
| `npm run test:load` | k6 load tests (10k users) | Load testing |
| `npm run test:load:20k` | k6 load tests (20k users) | Load testing |
| `npm run test:chaos` | Chaos experiments | Kubernetes |

### Root-Level Load Test Commands

| Command | Description | Users |
|---------|-------------|-------|
| `npm run test:load:1k` | Stage 1 load test | 1,000 |
| `npm run test:load:5k` | Stage 2 load test | 5,000 |
| `npm run test:load:10k` | Stage 3 load test | 10,000 |
| `npm run test:load:20k` | Stage 4 load test | 20,000 |
| `npm run test:load:50k` | Stage 5 load test | 50,000 |
| `npm run test:load:100k` | Stage 6 load test | 100,000 |
| `npm run test:load:500k` | Stage 7 load test | 500,000 |
| `npm run test:load:1m` | Stage 8 load test | 1,000,000 |

## Test Directory Structure

```
SpiceGarden/
├── __tests__/                    # Root-level tests
│   ├── auth-security.test.ts
│   └── test-utils.ts
├── apps/
│   └── backend/
│       └── test/               # Backend test directory
│           ├── *.spec.ts       # Unit tests
│           ├── *.integration.spec.ts  # Integration tests
│           ├── *.e2e.spec.ts   # End-to-end tests
│           ├── __mocks__/      # Mock implementations
│           │   ├── typeorm.mock.ts
│           │   └── typeorm.ts
│           └── jest-setup.ts   # Global test setup
├── infra/
│   └── load-tests/             # k6 load test scripts
│       ├── stage-1-1k.js
│       ├── stage-2-5k.js
│       ├── stage-3-10k.js
│       ├── stage-4-20k.js
│       ├── stage-5-50k.js
│       ├── stage-6-100k.js
│       ├── stage-7-500k.js
│       ├── stage-8-1m.js
│       ├── websocket-stress.js
│       ├── payment-stress.js
│       ├── database-stress.js
│       ├── failure-injection.js
│       └── security-under-load.js
└── apps/*/
    └── __tests__/             # Frontend test directories (per app)
```

## Jest Configuration

### Backend Jest Setup (`apps/backend/test/jest-setup.ts`)

The global setup file provides mocks for:
- `@nestjs/core` - Logger mock
- `@nestjs/typeorm` - Repository mocks
- `typeorm` - DataSource and Repository mocks
- `@nestjs/common` - Injectable, Controller decorators
- `@nestjs/config` - ConfigModule and ConfigService
- `@nestjs/mongoose` - Mongoose connection mocks
- `mongoose` - Schema and model mocks
- `ioredis` - Redis connection with in-memory fallback
- `jsonwebtoken` - JWT sign/verify mocks
- `stripe` - Payment gateway mocks

### Coverage Thresholds

| Metric | Threshold | Current Status |
|--------|-----------|--------------|
| Statements | 80% | 91.28% ✅ |
| Branches | 80% | 81.1% ✅ |
| Functions | 80% | 91.22% ✅ |
| Lines | 80% | 91.21% ✅ |

## Test Categories

### 1. Unit Tests

**Location:** `apps/backend/test/*.spec.ts`

Unit tests validate individual methods in isolation with mocked external dependencies.

```typescript
// Example: apps/backend/test/auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let userRepo: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-jwt-token') },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { findOne: jest.fn(), create: jest.fn() },
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });
});
```

**Key Test Files:**

| File | Purpose |
|------|---------|
| `order.service.spec.ts` | Order placement, status transitions |
| `kitchen.service.spec.ts` | Kitchen operations, batch management |
| `delivery.service.spec.ts` | Delivery flow, driver assignment |
| `auth.service.spec.ts` | Authentication, session management |
| `payment-edge-cases.service.spec.ts` | Payment gateway edge cases |
| `security-guards.spec.ts` | RBAC and permission guards |
| `csrf.middleware.spec.ts` | CSRF protection |
| `rate-limit-store.spec.ts` | Rate limiting logic |

### 2. Integration Tests

**Location:** `apps/backend/test/*.integration.spec.ts`

Integration tests validate interactions between components.

| Test File | Integration Points |
|-----------|------------------|
| `payment.integration.spec.ts` | payment → order |
| `order-flow.integration.spec.ts` | order → KDS |
| `driver-customer.integration.spec.ts` | driver → customer |
| `refund-wallet.integration.spec.ts` | refund → wallet |

**Run with:**
```bash
npm run test:integration
# Exclude MongoDB tests if not available:
npm run test:integration -- --testPathIgnorePatterns="mongo-connection.spec.ts"
```

### 3. End-to-End Tests

**Location:** `apps/backend/test/*.e2e.spec.ts`

E2E tests validate complete user journeys.

| Test File | Purpose |
|-----------|---------|
| `e2e.spec.ts` | General end-to-end flows |
| `payment-verification.e2e.spec.ts` | Payment gateway verification |

**Run with:**
```bash
npm run test:e2e
npm run test -- --runInBand test/e2e.spec.ts
```

### 4. Load Testing

**Tool:** k6

Load tests verify system performance under progressive load.

**Thresholds:**
```javascript
thresholds: {
  'http_req_success_rate': ['rate>0.99'],
  'http_req_duration': ['p(95)<500'],
}
```

**Stage Configuration:**
```javascript
// infra/load-tests/stage-1-1k.js
export const options = {
  stages: [
    { duration: '2m', target: 1000 },
    { duration: '30m', target: 1000 },
    { duration: '2m', target: 0 },
  ],
}
```

**Scenarios Tested:**
- Restaurant browsing (`/restaurants`)
- Search queries (`/restaurants/search?q=biryani`)
- Health checks (`/health`)
- User registration (`/auth/register`)
- Authentication (`/auth/login`)

### 5. Security Testing

**Location:** `infra/scripts/security-tests.js`

Security tests validate protection against common vulnerabilities.

| Test Type | Payloads/Endpoints |
|-----------|-------------------|
| SQL Injection | `' OR '1'='1`, `'; DROP TABLE users; --` |
| XSS | `<script>alert("XSS")</script>`, `<img src=x onerror=alert(1)>` |
| Path Traversal | `../../../etc/passwd`, `/proc/self/environ` |
| Rate Limiting | 100 requests to `/auth/login` |
| Auth Bypass | Invalid tokens, header manipulation |
| JSON Injection | Role manipulation in request bodies |

**Run with:**
```bash
node infra/scripts/security-tests.js
# With custom target:
TARGET_URL=https://staging-api.spicegarden.com node infra/scripts/security-tests.js
```

### 6. Penetration Testing

**Location:** `infra/scripts/penetration-tests.js`

Infrastructure-level security validation.

| Check | Ports/Headers/Methods |
|-------|----------------------|
| Port Scan | 21, 22, 25, 53, 80, 443, 5432, 6379, 27017 |
| Security Headers | HSTS, CSP, X-Frame-Options, X-XSS-Protection |
| CORS | Malicious origin validation |
| HTTP Methods | TRACE, TRACK, DEBUG, CONNECT blocking |

**Run with:**
```bash
node infra/scripts/penetration-tests.js
# With custom target:
TARGET_HOST=staging-api.spicegarden.com TARGET_PORT=80 node infra/scripts/penetration-tests.js
```

### 7. Chaos Testing

**Location:** `test/chaos/` Kubernetes manifests

Chaos experiments validate system resilience.

**Failure Scenarios:**
- Redis cache failure
- PostgreSQL connection failure
- WebSocket connection drops
- Payment provider failure
- Geo service failure

**Run with:**
```bash
kubectl apply -f test/chaos/
```

## Running Tests Locally

### Prerequisites
```bash
# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start infrastructure (optional for some tests)
docker-compose -f compose.dev.yaml up -d
```

### Test Execution
```bash
# Run all unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:cov

# Run security tests
node infra/scripts/security-tests.js

# Run penetration tests
node infra/scripts/penetration-tests.js
```

## CI/CD Integration

Tests are executed in the following pipeline stages:

| Stage | Tests Executed |
|-------|---------------|
| Pull Request Validation | Unit tests, linting |
| Pre-Merge Validation | Unit + integration tests |
| Pre-Deployment | E2E tests on staging |
| Post-Deployment | Smoke tests, security tests |

## Writing New Tests

### Unit Test Template
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceName } from '../src/services/service.module';

describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceName,
        // Mock providers here
      ],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  describe('methodName', () => {
    it('should return expected value for valid input', () => {
      // Arrange
      const input = { /* test data */ };

      // Act
      const result = service.methodName(input);

      // Assert
      expect(result).toEqual({ /* expected */ });
    });
  });
});
```

### Integration Test Template
```typescript
describe('Service Integration', () => {
  // Use real repositories with test database
  // or mock repositories with verified interactions
});
```

## Test Fixtures and Mocks

**Location:** `apps/backend/test/__mocks__/`

- `typeorm.mock.ts` - Mock TypeORM repository pattern
- `typeorm.ts` - Alternative TypeORM mocks

### Test Utilities
```typescript
// __tests__/test-utils.ts
export function createMockUser(overrides = {}): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    role: 'customer',
    status: 'active',
    ...overrides,
  };
}
```

## Known Test Gaps

| Module | Coverage | Recommendation |
|--------|----------|----------------|
| `security/vault.service` | 71.42% | Improve secrets management coverage |
| `services/payments/webhook` | 75.91% | Add webhook error path tests |
| `services/payments/gateways` | 85.38% | Expand gateway failure scenarios |

## Troubleshooting Tests

| Issue | Resolution |
|-------|------------|
| `ECONNREFUSED` in tests | Redis mock handles gracefully; ioredis falls back to in-memory |
| Coverage threshold failures | Run `npm run test:cov` to see which modules are below threshold |
| MongoDB tests failing | Use `--testPathIgnorePatterns="mongo-connection.spec.ts"` |
| Open handles warning | Check `afterEach` cleanup in test files |