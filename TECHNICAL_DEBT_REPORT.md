# Technical Debt Report

> Generated: 2026-06-19
> Verified from source code analysis

## TODO/FIXME Comments

| File | Line | Comment | Impact |
|------|------|---------|--------|
| modules/kitchen/kitchen.service.ts | 400 | TODO: Consider recording SLA for batch timing | Low - Optional feature |
| services/payments/chargeback/chargeback.controller.ts | 88 | TODO: Implement initiateRefundForWonDispute in ChargebackService | Medium - Missing feature |

**Total: 2 TODOs**

## Console.log Statements

| File | Count | Purpose | Severity |
|------|-------|---------|----------|
| backend/main.ts | 1 | Local metrics logging | Low - Can be removed |
| backend/db/*.ts | 4 | Connection logging | Low - Debug |
| backend/services/**/*.ts | 12 | Debug/info logging | Medium |
| mobile/utils/navigation.ts | 2 | Performance/Analytics | Medium |
| mobile/services/*.ts | 2 | WebSocket connection | Low |

**Total: 34 console.log statements**

## `any` Type Usage

| Location | Count | Purpose | Risk |
|----------|-------|---------|------|
| backend/db/local-repository.module.ts | 15 | SQLite mock repositories | High - Type safety |
| backend/services/auth/auth.controller.ts | 2 | Request bodies | Medium |
| backend/services/order/order.controller.ts | 1 | Request bodies | Medium |
| backend/services/payments/**/*.ts | 30+ | Payment webhooks, gateways | High |
| backend/services/restaurant/**/*.ts | 10+ | Onboarding data | Medium |
| backend/modules/**/*.ts | 10+ | Driver assignment | Medium |

**Total: 231 `any` type usages**

## Unused Packages

Based on package.json analysis:

| Package | Used | Notes |
|---------|------|-------|
| @spicegarden/ui | ✅ Used by all frontends | Required |
| electron | ✅ Used by launcher | Required |
| sqlite3 | ✅ Used for dev mode | Required |
| strip tags | present in dependencies | ⚠️ Unknown purpose |

## Missing Features

### Backend
| Feature | Missing Location | Priority |
|---------|-----------------|----------|
| RBAC Guards | No roles/authorization guards | High |
| Exception Filters | No custom exception filters | Medium |
| Request Interceptors | No logging interceptors | Low |
| Chargeback Refund Method | TODO in chargeback.controller.ts | Medium |

### Frontend
| Feature | Missing Location | Priority |
|---------|-----------------|----------|
| Form Validation | Forms not using validation | Medium |
| Loading States | Some pages lack load states | Low |
| Error Boundaries | Only customer-web has full boundary | Medium |

## Duplicate Code Patterns

| Pattern | Files | Notes |
|---------|-------|-------|
| Idempotency check | Multiple services | Common pattern, could be abstracted |
| Notification sending | Multiple services | Could use shared helper |
| Error handling | Multiple services | Similar try/catch patterns |

## Technical Debt Summary

| Category | Count | Risk Level |
|----------|-------|------------|
| TODO Comments | 2 | Low-Medium |
| console.log | 34 | Low-Medium |
| `any` Types | 231 | Medium-High |
| Missing Guards | 1 | High |
| Missing Filters | 1 | Medium |
| Unused Packages | 0 | None detected |
| Duplicate Patterns | ~15 | Low |

## Recommendations

1. **High Priority**: Implement RBAC guards for role-based authorization
2. **Medium Priority**: Replace `any` types with proper interfaces
3. **Medium Priority**: Implement global exception filter
4. **Low Priority**: Remove console.log statements (use proper logging)
5. **Low Priority**: Address TODO items in chargeback module