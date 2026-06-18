# API_PERFORMANCE_REPORT.md

Generated: 2026-06-18

## Endpoint Performance Analysis

Endpoints are analyzed for potential >500ms latency under load.

---

## Registration Endpoint: POST /auth/register

### Implementation Chain
```
AuthController.register (auth.controller.ts:34-57)
  → userRepo.findOne (check existing email)
  → authService.hashPassword (argon2)
  → userRepo.save (insert user)
  → authService.createSession (session insert)
  → authService.login (JWT sign + return)
```

### Potential Bottlenecks
| Operation | Time Impact | Mitigation |
|-----------|-------------|------------|
| Password hashing (argon2) | 50-200ms | Required for security; can tune cost |
| Unique constraint check | 10-50ms | Index on email/phone |
| Session creation | 10-50ms | Can batch or defer |
| JWT signing | <5ms | Fast |

### Estimated Latency: 80-300ms per registration

---

## Login Endpoint: POST /auth/login

### Implementation Chain
```
AuthController.login (auth.controller.ts:18-32)
  → authService.validateUser (userRepo.findOne + argon2.verify)
  → authService.createSession (session insert)
  → authService.login (JWT sign)
```

### Potential Bottlenecks
| Operation | Time Impact | Mitigation |
|-----------|-------------|------------|
| Password verification (argon2) | 50-150ms | Security requirement |
| Session creation | 10-50ms | Can batch |
| JWT signing | <5ms | Fast |

### Estimated Latency: 70-200ms per login

---

## Browse Restaurants: GET /restaurants

### Implementation Chain
```
RestaurantController.getAll (restaurant.controller.ts:12-15)
  → restaurantRepo.find with branches relation
```

### Potential Bottlenecks
| Operation | Time Impact | Mitigation |
|-----------|-------------|------------|
| Branch relation join | 20-200ms | Index on restaurant_id |
| No pagination | Increases with data size | Add limit/offset |
| No caching | Every request hits DB | Add Redis cache |

### Estimated Latency: 20-200ms (depends on restaurant count)

---

## Create Address: POST /user/addresses

### Implementation Chain
```
UserProfileController.createAddress
  → addressRepo.create
  → addressRepo.save
```

### Potential Bottlenecks
| Operation | Time Impact | Mitigation |
|-----------|-------------|------------|
| Default address update | 10-50ms | Transaction overhead |
| Geo point insert | 5-20ms | Spatial index needed |

### Estimated Latency: 15-70ms

---

## Place Order: POST /orders

### Implementation Chain
```
OrderController.placeOrder
  → validateOrderItems (loop iteration)
  → validateOrderTotals (calculations)
  → idempotency.validateOrCreate (DB query)
  → orderRepo.save
  → idempotency.complete (DB query)
```

### Potential Bottlenecks
| Operation | Time Impact | Mitigation |
|-----------|-------------|------------|
| Item validation | <5ms | Fast |
| Total validation | <5ms | Fast |
| Idempotency check | 10-50ms | Unique index on key |
| Order insert | 20-100ms | Unique constraints |
| Session reference | 10-30ms | Foreign key check |

### Estimated Latency: 40-180ms

---

## Performance Thresholds Exceeding 500ms

| Endpoint | Risk Level | Reason |
|----------|------------|--------|
| All endpoints under normal load | ✅ OK | Estimated <200ms |
| Under 10k concurrent users | ⚠️ Possible | Connection pool exhaustion |
| Without Redis cache | ⚠️ Possible | Repeated DB queries |
| Without query indexes | ⚠️ Likely | Slow joins on large tables |

---

## N+1 Query Analysis

### Restaurant List
```typescript
// restaurant.service.ts:17-22
return this.restaurantRepo.find({
  relations: { branches: true },  // Single query with join
});
```
**Status**: ✅ No N+1 - uses relations

### Order Details
```typescript
// order.service.ts uses simple entity (no joins on placeOrder)
```
**Status**: ✅ No N+1 on placeOrder

---

## Recommendations

1. **Add connection pooling limits** to TypeORM config
2. **Add Redis caching** for restaurant list
3. **Add database indexes** on:
   - `users.email` (unique, exists)
   - `users.phone` (unique, exists)
   - `restaurants.status`
   - `restaurants.slug` (unique)
4. **Add pagination** to restaurant list endpoint
5. **Pre-seed test data** (restaurants) for load tests