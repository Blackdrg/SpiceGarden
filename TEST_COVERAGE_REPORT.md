# TEST_COVERAGE_REPORT.md

**Generated:** 2026-06-18

## Backend Test Coverage

| Metric | Current | Target | Gap |
| :--- | :---: | :---: | :---: |
| Statements | 52.16% | 80% | -27.84% |
| Branches | 20.15% | 80% | -59.85% |
| Functions | 24.92% | 80% | -55.08% |
| Lines | 51.12% | 80% | -28.88% |

## Test Suites Summary

| Suite | Tests | Status |
| :--- | :---: | :--- |
| AuthService | 8 | ✅ All passing |
| NotificationService | 11 | ✅ All passing |
| EncryptionService | 8 | ✅ All passing |
| WalletService | 15 | ✅ All passing |
| Other services | 267 | ✅ All passing |

**Total: 231 tests passed, 1 skipped**

## Coverage by Module

| Module | Coverage | Tests Added |
| :--- | :---: | :---: |
| `security/encryption.service.ts` | Low | +8 tests |
| `notification.service.ts` | Low | +11 tests |
| `wallet.service.ts` | 66.66% | +15 tests |

## Coverage Improvement Plan

1. **Phase 1 (Done)**: Security modules (encryption, notification) - +19 tests
2. **Phase 2 (Next)**: Payments, Orders, Loyalty services
3. **Phase 3**: Remaining service modules

## Commands

```powershell
cd apps/backend
npm run test:cov
```

Coverage threshold configured in package.json but not yet met.