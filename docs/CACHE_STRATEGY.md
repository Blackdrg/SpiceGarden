# Cache Strategy

## Current State

SpiceGarden uses Redis primarily for rate limiting, session storage, and BullMQ queue state. Application-level caching is minimal.

## Redis Usage

### Rate Limiting

**File:** `apps/backend/src/main.ts:135-143`
**Store:** `apps/backend/src/security/redis-rate-limit.store.ts`

**Key Patterns:**
```
spicegarden:AUTH_OTP:{ip}
spicegarden:AUTH:{ip}
spicegarden:ORDERS:{ip}
spicegarden:API:{ip}
```

**Implementation:** express-rate-limit with Redis store

**Fallback:** In-memory store when Redis unavailable

### Session Storage

Sessions stored in PostgreSQL (`sessions` table), not Redis cache.

### BullMQ Queue State

BullMQ uses Redis for:
- Job queues (waiting, active, delayed)
- Job data
- Worker heartbeats
- Queue metrics

**Key Pattern:**
```
bull:{queue_name}:*
```

## Missing Cache Layers

### No Application Cache

**Observed:** No `@Cacheable`, `@CacheEvict`, or Redis cache decorators found.

**Impact:** Every request hits the database for:
- Restaurant listings
- Menu items
- HSN/SAC codes
- Notification preferences
- Driver documents

### No CDN

**Observed:** No CDN configuration for static assets.

**Impact:** Frontend assets served from origin, increasing latency.

## Recommendations

### 1. Restaurant/Menu Cache

**Pattern:** Cache-aside with TTL

```typescript
// Pseudocode
const restaurants = await redis.get(`restaurants:list:${cityId}`);
if (!restaurants) {
  restaurants = await db.findRestaurants(cityId);
  await redis.setex(`restaurants:list:${cityId}`, 300, JSON.stringify(restaurants));
}
```

**Invalidation:** On menu update → delete `restaurants:list:*`

### 2. Menu Item Cache

```typescript
const menu = await redis.get(`menu:${restaurantId}`);
```

**TTL:** 5 minutes (menu changes infrequently)

### 3. Notification Preferences Cache

```typescript
const prefs = await redis.get(`prefs:${userId}`);
```

**TTL:** 15 minutes (changes rarely)

### 4. Driver Location Cache

Already handled via Socket.IO in-memory.

## Cache Key Strategy

### Proposed Structure

```
cache:restaurants:list:{cityId}:{page}:{limit}
cache:restaurant:{id}
cache:menu:{restaurantId}
cache:menu:item:{id}
cache:hsn:sac:{code}
cache:user:prefs:{userId}
cache:restaurant:branches:{restaurantId}
```

### TTL Recommendations

| Data Type | TTL | Reason |
|-----------|-----|--------|
| Restaurant listings | 5 min | Changes infrequently |
| Menu items | 5 min | Restaurant-managed, realtime via WS |
| HSN/SAC codes | 1 hour | Rarely changes |
| User preferences | 15 min | User-editable, low frequency |
| Driver location | 0 (realtime) | Socket.IO realtime |

## Cache Invalidation

### On Write

| Write Operation | Invalidate |
|-----------------|------------|
| Menu item update | `cache:menu:{restaurantId}` |
| Restaurant update | `cache:restaurant:{id}` |
| Price change | `cache:menu:item:{id}` |
| Availability change | `cache:restaurant:list:*` |

## Implementation Gap

**Current:**
- Rate limiting: Redis-backed ✅
- Queue state: Redis ✅
- Sessions: PostgreSQL (not cached) ⚠️
- Application data: No cache ❌
- Static assets: No CDN ❌

**Estimated Impact:**
- 30-50% reduction in DB load with menu/restaurant caching
- 20-30% latency improvement with CDN for static assets
- Redis memory usage will increase (plan for 2-4GB Redis)
