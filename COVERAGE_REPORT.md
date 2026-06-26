# Coverage Report

**Date:** 2026-06-26
**Scope:** SpiceGarden Backend Test Coverage
**Classification:** Evidence-based

## Overall Coverage (VERIFIED)

**Command:** `cd apps/backend && npm run test:cov`

| Metric | Coverage | Threshold | Status |
|--------|----------|-----------|--------|
| Statements | 92.88% | ≥80% | ✅ PASS |
| Branches | 82.34% | ≥80% | ✅ PASS |
| Functions | 93.2% | ≥80% | ✅ PASS |
| Lines | 92.9% | ≥80% | ✅ PASS |

## Coverage Progression

| Phase | Statements | Branches | Functions | Lines | Source |
|-------|------------|----------|-----------|-------|--------|
| Phase 1 | 68.44% | 43.04% | 48.44% | 68.14% | Initial baseline |
| Phase 4 | 72.75% | 53.43% | 55.25% | 72.72% | Feature expansion |
| Phase 5 | 80.02% | 63.05% | 63.22% | 79.82% | Coverage push |
| Final | 92.88% | 82.34% | 93.2% | 92.9% | Current |

## Coverage by Directory

| Directory | Statements | Branches | Functions | Lines | Notes |
|-----------|------------|----------|-----------|-------|-------|
| audit | 93.33% | 71.01% | 100% | 93.02% | - |
| common/errors | 100% | 100% | 100% | 100% | MissingEnvError |
| compliance | 97.8% | 88.88% | 85.71% | 97.72% | GST/Compliance |
| db | 93.65% | 92.85% | 92.3% | 93.33% | Database adapters |
| infra/queue | 87.5% | 75% | 100% | 86.36% | Order processor |
| infra/tracking | 94.11% | 94.36% | 89.28% | 94% | WebSocket gateway |
| logging | 100% | 73.07% | 100% | 100% | Structured logging |
| security | 91.63% | 85.4% | 88.88% | 91.28% | Auth/RBAC/CSRF |
| services/auth | 90.69% | 89.47% | 85.71% | 90.24% | Authentication |
| services/delivery | 91.34% | 80.86% | 92.3% | 94.25% | Delivery service |
| services/finance | 100% | 84.37% | 100% | 100% | Tax reporting |
| services/geo | 100% | 100% | 100% | 100% | Geo service |
| services/kitchen | 90%+ | 80%+ | 90%+ | - | Kitchen operations |
| services/loyalty | 99.29% | 87.5% | 100% | 100% | Referrals/coupons |
| services/notifications | 100% | 93.58% | 100% | 100% | Push/email |
| services/order | 94.75% | 91.96% | 100% | 94.67% | Order service |
| services/payments | 99.02% | 84.21% | 100% | 98.94% | Payments core |
| services/payments/chargeback | 92.07% | 86.44% | 88.88% | 91.91% | Chargebacks |
| services/payments/webhook | 75.91% | 65.06% | 82.6% | 75.66% | Webhooks |
| services/payments/gateways | 85.38% | 55% | 87.5% | 85.36% | Payment providers |
| services/refund | 95.97% | 77.5% | 100% | 95.91% | Refunds |
| services/wallet | 99.35% | 87.5% | 100% | 99.33% | Wallet |
| shared/domain | 100% | 100% | 100% | 100% | Interfaces |

## Top Untested Lines

### security/vault.service.ts (71.42%)
- Lines 32-48: Secret initialization
- Lines 99-118: Secret refresh logic
- Line 143: Vault cleanup

### services/payments/webhook/webhook.service.ts (75.91%)
- Lines 20-39: Signature verification error paths
- Lines 62, 164-165, 174-175: Various error branches
- Lines 199-201, 245-246, 273, 281-339: Webhook processing edge cases

### services/payments/gateways/* (85.38%)
- cod-gateway.service.ts: Lines 7-10 (COD edge cases)
- razorpay-gateway.service.ts: Lines 12, 45-47, 52-53, 89-90
- stripe-gateway.service.ts: Lines 10-14, 47-48, 137-138

### modules/driver-assignment (84.35%)
- dispatch-engine.service.ts: Lines 16-22, 29-43, 175-177, 200-202, 230, 254-256
- driver-assignment.service.ts: Lines 19-35, 63, 400-401
- eta-intelligence.service.ts: Lines 82, 119-129

## Coverage Thresholds Configuration

**File:** `apps/backend/package.json`
```json
"test:cov": "jest --coverage --coverageThreshold={\\\"global\\\":{\\\"branches\\\":80,\\\"functions\\\":80,\\\"lines\\\":80,\\\"statements\\\":80}}"
```

## Test Suite Count

- Total test files: 68 suites
- Passed: 67
- Skipped: 1
- Total tests: 1086 (1085 passed, 1 skipped)

## Recommendations

1. Focus on vault.service.ts edge cases for branch coverage
2. Add webhook error path tests
3. Complete payment gateway error handling tests