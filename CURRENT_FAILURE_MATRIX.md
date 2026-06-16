# Current Failure Matrix - SpiceGarden

## Build Failures (57 total)

### TypeScript TS2559 Errors - TypeORM Relation/Select Issues

| File | Line | Error Type | Entity | Impact |
|------|------|------------|--------|--------|
| src/compliance/compliance.service.ts | 72 | FindOptionsSelect | UserEntity | Medium - GDPR compliance query |
| src/controllers/driver.controller.ts | 32 | FindOptionsRelations | DriverEntity | Medium - Driver profile API |
| src/controllers/driver.controller.ts | 41 | FindOptionsRelations | DriverEntity | Medium |
| src/controllers/driver.controller.ts | 50 | FindOptionsRelations | DriverAssignmentEntity | Medium |
| src/controllers/driver.controller.ts | 267 | FindOptionsRelations | DriverAssignmentEntity | Medium |
| src/modules/driver-assignment/dispatch-engine.service.ts | 42 | FindOptionsRelations | OrderEntity | High - Dispatch logic |
| src/modules/driver-assignment/dispatch-engine.service.ts | 261 | FindOptionsRelations | DriverAssignmentEntity | Medium |
| src/modules/driver-assignment/driver-assignment.service.ts | 78 | FindOptionsRelations | DriverAssignmentEntity | High |
| src/modules/driver-assignment/driver-assignment.service.ts | 89 | FindOptionsRelations | DriverAssignmentEntity | High |
| src/modules/driver-assignment/driver-assignment.service.ts | 181 | FindOptionsRelations | DriverAssignmentEntity | High |
| src/modules/kitchen/kitchen.service.ts | 56 | FindOptionsRelations | InventoryItemEntity | Medium |
| src/modules/kitchen/kitchen.service.ts | 100 | FindOptionsRelations | InventoryItemEntity | Medium |
| src/modules/kitchen/kitchen.service.ts | 159 | FindOptionsRelations | InventoryItemEntity | Medium |
| src/modules/kitchen/kitchen.service.ts | 282 | FindOptionsRelations | RecipeEntity | Medium |
| src/modules/kitchen/kitchen.service.ts | 347 | FindOptionsRelations | FoodPrepEntity | Medium |
| src/modules/kitchen/kitchen.service.ts | 398 | FindOptionsRelations | BatchEntity | Medium |
| src/services/ai/ai.service.ts | 21 | FindOptionsRelations | OrderEntity | Medium |
| src/services/delivery/driver-payout.service.ts | 124 | FindOptionsRelations | DriverIncentiveEntity | Medium |
| src/services/delivery/enhanced-delivery.service.ts | 132 | FindOptionsWhere | DriverEntity | Medium |
| src/services/finance/reconciliation.service.ts | 136 | FindOptionsRelations | OrderEntity | Medium |
| src/services/finance/tax-reporting.service.ts | 37 | FindOptionsRelations | OrderEntity | Medium |
| src/services/finance/tax-reporting.service.ts | 134 | FindOptionsRelations | OrderEntity | Medium |
| src/services/gst/gst.service.ts | 43 | FindOptionsRelations | OrderEntity | Medium |
| src/services/gst/gst.service.ts | 53 | FindOptionsRelations | RestaurantEntity | Medium |
| src/services/gst/gst.service.ts | 178 | FindOptionsRelations | OrderEntity | Medium |
| src/services/gst/gst.service.ts | 196 | FindOptionsRelations | OrderEntity | Medium |
| src/services/gst/gst.service.ts | 211 | FindOptionsRelations | RestaurantEntity | Medium |
| src/services/menu-customization/menu-customization.service.ts | 24 | FindOptionsRelations | MenuItemEntity | Medium |
| src/services/menu-customization/menu-customization.service.ts | 48 | FindOptionsRelations | MenuItemEntity | Medium |
| src/services/payment-provider/driver-payout-provider.service.ts | 152 | FindOptionsRelations | DriverIncentiveEntity | Medium |
| src/services/payments/chargeback/chargeback.service.ts | 157 | FindOptionsRelations | PaymentDisputeEntity | Medium |
| src/services/refund/refund.service.ts | 321 | FindOptionsRelations | RefundApprovalEntity | Medium |
| src/services/refund/refund.service.ts | 335 | FindOptionsRelations | RefundApprovalEntity | Medium |
| src/services/refund/refund.service.ts | 346 | FindOptionsRelations | RefundApprovalEntity | Medium |
| src/services/restaurant/branch-management.service.ts | 79 | FindOptionsRelations | RestaurantBranchEntity | Medium |
| src/services/restaurant/branch-management.service.ts | 86 | FindOptionsRelations | RestaurantBranchEntity | Medium |
| src/services/restaurant/branch-management.service.ts | 102 | FindOptionsRelations | RestaurantBranchEntity | Medium |
| src/services/restaurant/business-engine.service.ts | 59 | FindOptionsRelations | RestaurantEntity | Medium |
| src/services/restaurant/business-engine.service.ts | 66 | FindOptionsRelations | RestaurantEntity | Medium |
| src/services/restaurant/business-engine.service.ts | 143 | FindOptionsRelations | OrderEntity | High |
| src/services/restaurant/business-engine.service.ts | 166 | FindOptionsRelations | RestaurantBranchEntity | Medium |
| src/services/restaurant/business-engine.service.ts | 294 | FindOptionsRelations | OrderEntity | Medium |
| src/services/restaurant/menu-moderation.service.ts | 87 | FindOptionsRelations | MenuModerationEntity | Medium |
| src/services/restaurant/menu-moderation.service.ts | 125 | Entity method | Repository | High - findByIds doesn't exist |
| src/services/restaurant/payout.service.ts | 40 | FindOptionsRelations | OrderEntity | Medium |
| src/services/restaurant/payout.service.ts | 125 | FindOptionsRelations | PayoutReportEntity | Medium |
| src/services/restaurant/restaurant-ops.service.ts | 104 | FindOptionsRelations | RestaurantOnboardingEntity | Medium |
| src/services/restaurant/restaurant.service.ts | 19 | FindOptionsRelations | RestaurantEntity | Medium |
| src/services/restaurant/restaurant.service.ts | 46 | FindOptionsRelations | RestaurantBranchEntity | Medium |
| src/services/restaurant/restaurant.service.ts | 53 | FindOptionsRelations | RestaurantBranchEntity | Medium |
| src/services/restaurant/restaurant.service.ts | 61 | FindOptionsRelations | RestaurantEntity | Medium |
| src/services/restaurant/restaurant.service.ts | 71 | FindOptionsRelations | RestaurantEntity | Medium |
| src/services/search/search.service.ts | 29 | FindOptionsRelations | MenuItemEntity | Medium |
| src/services/support/ticket-routing.service.ts | 38 | FindOptionsRelations | SupportTicketEntity | Medium |

### Missing Declaration File Errors (22 total)

| Module | File | Line | Workspace | Impact |
|--------|------|------|-----------|--------|
| bullmq | src/infra/queue/order.processor.ts | 4 | backend | High - Queue processor |
| bullmq | src/infra/queue/queue.service.ts | 4 | backend | High - Queue service |
| bullmq | src/infra/queue/queue.service.ts | 133, 137, 137 | backend | Medium - Worker events |
| @sentry/node | src/main.ts | 19 | backend | Medium - Error tracking |
| lucide-react | FlowManager.tsx | 7 | ui | High - UI components |
| lucide-react | icons/commerce/* (5 files) | 2 | ui | High - Icon components |
| lucide-react | icons/delivery/* (1 file) | 2 | ui | High |
| lucide-react | icons/kitchen/* (2 files) | 2 | ui | High |
| lucide-react | icons/navigation/* (3 files) | 2 | ui | High |
| lucide-react | icons/system/* (3 files) | 2 | ui | High |
| expo-notifications | services/push-notification.service.ts | 2 | backend | Low - Push notifications |

## Security Failures

| Test | Status | Evidence | Impact |
|------|--------|----------|--------|
| Rate Limiting | VULNERABLE | 0/100 requests blocked | Critical - No abuse protection |
| SQL Injection | SECURE | 0 issues | - |
| XSS | SECURE | 0 issues | - |
| Auth Bypass | SECURE | 0 issues | - |
| Path Traversal | SECURE | 0 issues | - |

## Root Cause Analysis

### Rate Limiting Bypass (Critical)
- `express-rate-limit` configured at `/auth/` and `/api/` paths
- `@nestjs/throttler` module configured but NOT applied via `@UseGuards(ThrottlerGuard)`
- AuthController has no guard decorator for throttler protection
- Security tests hit `http://localhost:3001/auth/login` directly - rate limiter should block via `express-rate-limit`
- Likely cause: Backend not running when tests executed, or trust proxy misconfiguration

### TypeORM TS2559 Errors (High)
- TypeORM v0.3.x changed typing for `relations` and `select` options
- Old format: `relations: ['field1', 'field2']`
- New format: `relations: { field1: true, field2: true }`
- Applies to all TypeORM repository `findOne`, `find` calls

### Missing Declarations (High)
- bullmq: v5.x (TypeScript-first package) requires no @types but needs tsconfig config
- @sentry/node: Same issue - type declarations not found
- expo-notifications: Native module with types included but needs declaration handling
- lucide-react: Has built-in types but tsconfig missing proper module resolution