# DATABASE_PERFORMANCE_REPORT.md

Generated: 2026-06-18

## Database Architecture

**Primary**: PostgreSQL (via TypeORM)
**Secondary**: MongoDB (via Mongoose)
**Cache**: Redis (via ioredis)

---

## Connection Pool Analysis

### PostgreSQL Configuration
**Source**: `apps/backend/src/main.ts:115-125`

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: "postgres",
    host: configService.get<string>("DB_HOST") || "localhost",
    port: configService.get<number>("DB_PORT", 5432),
    username: configService.get<string>("DB_USER") || "spicegarden",
    password: configService.get<string>("DB_PASS") || "spicegarden_dev",
    database: configService.get<string>("DB_NAME") || "spicegarden",
    entities,
    synchronize: true,  // ⚠️ Should be false in production
  }),
})
```

### Missing Configuration
| Setting | Status | Recommendation |
|---------|--------|----------------|
| connection pool max | ❌ Not set | Add max: 100 |
| connection pool min | ❌ Not set | Add min: 10 |
| idle timeout | ❌ Not set | Add idleTimeoutMillis: 30000 |
| connection timeout | ❌ Not set | Add connectionTimeoutMillis: 5000 |

---

## SQLite Local Mode

**Source**: `apps/backend/src/local-dev.module.ts`

When `LOCAL_DB=sqlite` or `DB_HOST` unset:
- Uses `LocalRepositoryModule` for in-memory storage
- No actual database queries
- Repository simulated with JavaScript arrays

### Performance Characteristics
- No connection pool needed (in-memory)
- No network latency
- No constraint enforcement (unique constraints simulated)

---

## Query Analysis - Order Placement

### placeOrder Method (order.service.ts:96-159)

```sql
-- Operations per order placement:
-- 1. Validate user exists (implicit via userId)
-- 2. Validate restaurant exists (implicit via restaurantId)
-- 3. INSERT INTO orders (...) VALUES (...)
-- 4. INSERT INTO idempotency table (if provided)
```

### Slow Query Potential
- No explicit N+1 queries in placeOrder
- Uses TypeORM simple save operation
- Idempotency check adds query overhead (order.service.ts:108-119)

---

## Lock Contention Analysis

### Pessimistic Lock
```typescript
// order.service.ts:506-517
async getOrderWithLock(orderId: string) {
  return this.orderRepo.findOne({
    where: { id: orderId },
    lock: { mode: 'pessimistic_write' },
  });
}
```

**Used in**: Cancellation flows, payment flows
**Risk**: Potential deadlock under high concurrent load

---

## Database Constraints That Block Registration

### UserEntity Constraints
```typescript
// user.entity.ts:12-16
@Column({ unique: true })
email!: string;

@Column({ unique: true })
phone!: string;
```

### Impact on Load Testing
- Email uniqueness causes 401 for duplicate registration attempts
- Phone uniqueness causes constraint errors (500) if phones collide
- Both require unique values per registration

---

## Query Latency Expectations

| Operation | Expected Latency (SQLite) | Expected Latency (PostgreSQL) |
|-----------|---------------------------|-------------------------------|
| User findOne (email) | <1ms | 5-50ms |
| User save (insert) | <1ms | 10-100ms |
| Order save | <1ms | 10-100ms |
| Address save | <1ms | 10-100ms |
| Idempotency check | <1ms | 5-20ms |

---

## Bottleneck Identification

### Primary Bottleneck: Registration Uniqueness
- Each registration requires unique email AND phone
- Under load, phones generated from `__VU-${__ITER}` format risk collisions
- No batching; each user inserted individually

### Secondary Bottleneck: Session Creation
```typescript
// auth.service.ts:30-40 - creates session for every login/registration
await this.createSession(user.id, deviceInfo);
```

### Tertiary Bottleneck: Idempotency
- Extra database query/txn for idempotency check
- Can be skipped in test mode (not currently)

---

## Recommendations

1. **For SQLite mode**: Add unique constraint enforcement to LocalRepositoryModule
2. **For PostgreSQL**: Add connection pool settings in TypeORM config
3. **For Registration**: Use timestamp + random for phone uniqueness
4. **For Orders**: Pre-seed restaurants or skip item validation in load tests