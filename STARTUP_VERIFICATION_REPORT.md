# DI Analysis Report - OrderEntityRepository DataSource Injection Failure

## Root Cause Summary

The error `UnknownDependenciesException: Nest can't resolve dependencies of the OrderEntityRepository (?) ... Argument: DataSource` was caused by:

1. **Duplicate TypeOrmModule.forRootAsync calls** in `db.module.ts` - TypeORM only supports one connection per module
2. **Services injecting DataSource without @InjectDataSource() decorator** - NestJS cannot resolve DataSource without proper injection token
3. **Missing DataSource export in LocalRepositoryModule** - The module provided a mock DataSource but didn't export it with the proper DataSource class token for @InjectDataSource()

## Dependency Graph (Before Fix)

```
AppModule
├── DbModule (Global)
│   ├── LOCAL MODE: LocalRepositoryModule
│   │   └── Provides: OrderEntityRepository (via getRepositoryToken), 'DataSource' (string token only)
│   └── PROD MODE: TypeOrmModule.forRootAsync (DUPLICATE CONFIG - bug!)
│       └── Exports: TypeOrmModule (no proper DataSource token)
├── QueueModule (Global)
│   └── TypeOrmModule.forFeature([OrderEntity])
│       └── Creates: OrderEntityRepository (requires DataSource from connection)
│           └── FAILS: DataSource not available in TypeOrmModule context
└── OrderServiceModule
    └── LocalRepositoryModule (imports directly, not DbModule)
        └── Provides: OrderEntityRepository mock
```

## Provider Graph (After Fix)

### Local Mode Provider Chain (Fixed)
```
LocalRepositoryModule (@Global)
├── Provider: 'DataSource' (mock)
├── Provider: DataSource (via useExisting - for @InjectDataSource())
└── Providers: getRepositoryToken(Entity) for 54 entities including OrderEntity
```

### Production Mode Provider Chain (Fixed)
```
TypeOrmModule (from DbModule) - single connection
├── Connection: DataSource (from forRootAsync)
└── MongooseModule with ReviewDocument
```

## Exact Files Modified

| File | Change |
|------|--------|
| `apps/backend/src/db/db.module.ts` | Removed duplicate TypeOrmModule.forRootAsync and MongooseModule imports |
| `apps/backend/src/db/local-repository.module.ts` | Added DataSource provider with useExisting for @InjectDataSource() compatibility |
| `apps/backend/src/infra/queue/queue.module.ts` | Added conditional import for LocalRepositoryModule in local mode |
| `apps/backend/src/services/review/review.module.ts` | Added conditional MongooseModule.forFeature import for local mode |
| `apps/backend/src/modules/driver-assignment/dispatch-engine.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/modules/driver-assignment/driver-assignment.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/modules/kitchen/kitchen.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/controllers/driver.controller.ts` | Added @InjectDataSource() decorator to both controllers |
| `apps/backend/src/services/wallet/wallet.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/delivery/enhanced-delivery.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/delivery/delivery.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/delivery/driver-payout.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/restaurant/restaurant.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/restaurant/restaurant-ops.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/restaurant/menu-moderation.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/restaurant/payout.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/restaurant/branch-management.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/restaurant/onboarding.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/finance/tax-reporting.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/finance/reconciliation.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/support/ticket-routing.service.ts` | Added @InjectDataSource() decorator |
| `apps/backend/src/services/support/customer-support.service.ts` | Added @InjectDataSource() decorator |

## Verification Results

### Unit Tests: PASS (30 tests)
- order.service.spec.ts: All tests pass
- kitchen.service.spec.ts: All tests pass  
- delivery.service.spec.ts: All tests pass

### Lint: PASS
No lint errors detected

### Startup: SUCCESS
```
[Nest] Nest application successfully started
```

## Remaining Risks

1. **Mongoose Connection in Local Mode**: The ReviewDocument model still requires a Mongo connection even in local mode. The current fix provides a mock model provider in DbModule exports.

2. **Production Mode Testing**: The fix was verified in local mode only. Production mode with actual PostgreSQL/Mongo connections should be tested separately.

## Production Impact Assessment

- **Impact**: HIGH - Critical fix for application startup
- **Risk**: LOW - Changes follow NestJS best practices and don't modify business logic
- **Rollback Plan**: Revert the decorator additions and duplicate provider removal if issues arise