# Build Error Report - SpiceGarden

## Summary
- **Total Errors:** 57
- **Workspaces Affected:** 4
- **Build Status:** FAILED

## Error Categories

### 1. Missing Declaration Files (22 errors)

#### Pattern: Cannot find declaration file for module 'xxx'
```
error TS7016: Could not find a declaration file for module 'bullmq'
Try `npm i --save-dev @types/bullmq` if it exists or add a new declaration (.d.ts) file
```

**Root Cause:** TypeScript 5.x strict mode with packages that lack proper type declarations.

**Affected Files:**
- apps/backend/src/infra/queue/order.processor.ts:4
- apps/backend/src/infra/queue/queue.service.ts:4,133,137,137
- apps/backend/src/main.ts:19
- apps/customer-mobile/src/services/push-notification.service.ts:2 (expo-notifications)
- packages/ui/FlowManager.tsx:7, icons/* (lucide-react)

### 2. TypeORM TS2559 Type Mismatches (46 errors)

#### Pattern: Type 'string[]' has no properties in common with type 'FindOptionsSelect/Relations<T>'

**Root Cause:** TypeORM 0.3.x API change. The `relations` and `select` options now expect object syntax instead of array syntax.

**Old Syntax (incorrect):**
```typescript
relations: ['user', 'orders']
select: ['id', 'email', 'deletedAt']
```

**New Syntax (correct):**
```typescript
relations: { user: true, orders: true }
select: { id: true, email: true, deletedAt: true }
```

**Primary Affected Workspaces:**
- apps/backend (46 errors)

**Secondary Affected Workspaces:**
- apps/customer-mobile (via metro bundler)
- apps/customer-web (blocked by packages/ui)
- apps/restaurant-dashboard (blocked by packages/ui)
- apps/super-admin (blocked by packages/ui)

## Build Chain Breakdown

```
@spicegarden/ui@0.1.0 - FAILED (lucide-react declarations)
  └─ blocks all Next.js apps
@spicegarden/backend@0.0.0 - FAILED (TypeORM + bullmq + sentry)
@spicegarden/customer-mobile@1.0.0 - FAILED (expo-notifications)
spicegarden-launcher@1.0.0 - PASSED
@spicegarden/api-types@1.0.0 - PASSED
@spicegarden/grpc-transport@1.0.0 - PASSED
@spicegarden/proto@1.0.0 - PASSED
@spicegarden/shared@0.0.0 - PASSED
```

## Resolution Strategy

1. **Missing Declarations:** Add proper type declarations or configure tsconfig to recognize built-in types
2. **TypeORM Relations:** Convert all array-based relations/select to object syntax