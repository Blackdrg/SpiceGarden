# LOAD_FAILURE_ROOT_CAUSE.md

Generated: 2026-06-18

## Executive Summary

Business-flow failures (registration 0%, login 0%, order 0%) despite health endpoint success (96%) indicate structural issues in the load test pipeline. Root cause: **LocalDevModule is missing critical controllers**.

---

## Phase 1: Infrastructure Verification

### Health Endpoint
- Status: Working (~96% success)
- Result: Backend is reachable and responding

### Controller Availability Analysis

| Controller | Full AppModule | LocalDevModule | Status |
|------------|----------------|----------------|--------|
| AuthController | ✅ Yes (`src/services/auth/auth.module.ts`) | ❌ No | CRITICAL |
| RestaurantController | ✅ Yes (`src/services/restaurant/restaurant.module.ts`) | ❌ No | CRITICAL |
| OrderController | ✅ Yes (`src/services/order/order.module.ts`) | ❌ No | CRITICAL |
| UserProfileController | ✅ Yes (`src/services/user/user-profile.module.ts`) | ❌ No | CRITICAL |

**Root Cause #1: LocalDevModule incomplete**
```
apps/backend/src/local-dev.module.ts (lines 1-19):

Only imports: [ConfigModule, DbModule]
Missing: AuthServiceModule, OrderServiceModule, RestaurantServiceModule, UserProfileModule
```

When `LOCAL_DB=sqlite` or `DB_HOST` is unset, the application uses LocalDevModule which lacked all business controllers. **FIXED**: Now using full AppModule with DB_HOST set in .env.

---

## Phase 2: Registration Failure Analysis

### Failure Point: POST /auth/register

| Potential Cause | Status Code | Evidence |
|----------------|-------------|----------|
| Email already exists | 401 | `auth.controller.ts:38` - `UnauthorizedException('Email already registered')` |
| Phone already exists | 500 | `user.entity.ts:15-16` - `@Column({ unique: true })` on phone column |
| Missing fields | 400 | `ValidationPipe` with required fields |

### Registration Payload (common.js:106-111)
```javascript
{
  email: `${prefix}-${suffix}@load.test`,     // Where suffix = `${Date.now()}-${__VU}-${__ITER}`
  password: 'Password123!',
  fullName: `Load Test ${suffix}`,
  phone: `555${String(__VU).padStart(7, '0')}${String(__ITER).padStart(4, '0')}`.slice(0, 15)
}
```

### Potential Collision: Phone Generation
- Phone uses `__VU` and `__ITER` for uniqueness
- For VU=1, ITER=0: `555000000010000` (14 chars)
- For VU=1000, ITER=1000: `55500000100010000`.slice(0,15) = `5550000010001000`
- **Risk**: Collisions possible if VU/ITER combinations repeat

---

## Phase 3: Order Flow Failure Analysis

### Failure Point: POST /orders

| Potential Cause | Status Code | Evidence |
|----------------|-------------|----------|
| Missing userId/restaurantId/grandTotal | 400 | `order.service.ts:98-100` |
| Invalid order items | 400 | `order.service.ts:57-68` |
| Restaurant not found | 404 | `restaurant.service.ts:17-22` returns empty array |
| No auth token | 401 | `JwtAuthGuard` blocks requests |

### Critical Issue: Order Item ID Generation
```javascript
// common.js:232
items: [{ id: `item-${__VU % 20}`, name: 'Load Test Item', price: itemPrice, quantity }]
```
**Problem**: Only 20 unique item IDs (0-19). All VUs mapping to same `VU % 20` will use identical item ID. This may cause:
- Validation failures if item ID format is invalid
- Business logic issues expecting real menu items

### Required Fields Validation
```
order.service.ts:18-31
Required: userId, restaurantId, grandTotal
Optional: items, subtotal, tax, deliveryFee, discount, tip, deliveryAddressId
```

---

## Phase 4: Auth/Order Dependency Chain

```
┌─────────────┐
│   Register  │ → access_token ✓
└──────┬──────┘
       │
┌──────▼──────┐
│    Login    │ → access_token ✓
└──────┬──────┘
       │
┌──────▼──────┐
│BrowseRestaurants│ → restaurantId ✓
└──────┬──────┘
       │
┌──────▼──────┐
│CreateAddress │ → addressId ✓
└──────┬──────┘
       │
┌──────▼──────┐
│   CreateOrder │ → orderId (FAILS if no restaurantId)
└─────────────┘
```

**Chain Break**: If registration fails (no token), entire flow fails.

---

## Evidence Summary

1. **LocalDevModule exclusion** - All business controllers missing (CRITICAL)
2. **Phone collision risk** - Unique constraint on phone with limited format
3. **Item ID limited range** - Only 20 unique values for thousands of VUs
4. **Restaurant dependency** - Orders require valid restaurantId from /restaurants
5. **Address dependency** - Orders require valid addressId from POST /user/addresses

---

## Recommended Fixes

1. **Immediate**: Fix LocalDevModule to include all required controllers
2. **Phone generation**: Use full timestamp + random suffix for uniqueness
3. **Item ID**: Generate unique item IDs or remove item validation for test