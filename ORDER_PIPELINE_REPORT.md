# ORDER_PIPELINE_REPORT.md

Generated: 2026-06-18

## Order Pipeline Analysis

### Endpoints Involved

| Step | Endpoint | Auth Required | Module |
|------|----------|---------------|--------|
| 1. Browse Restaurants | GET /restaurants | ✅ Yes | RestaurantServiceModule |
| 2. Create Address | POST /user/addresses | ✅ Yes | UserProfileModule |
| 3. Place Order | POST /orders | ✅ Yes | OrderServiceModule |

---

## Step 1: Browse Restaurants

**Controller**: `apps/backend/src/services/restaurant/restaurant.controller.ts:12-15`

```typescript
@Get()
async getAll() {
  return this.restaurantService.getAllRestaurants();
}
```

### Service Implementation
```typescript
// restaurant.service.ts:17-22
async getAllRestaurants() {
  return this.restaurantRepo.find({
    relations: { branches: true },
    where: { status: 'active' },
  });
}
```

### Response
- Returns array of RestaurantEntity with branches relation
- Requires `status: 'active'` filter

### Failure Points
| Issue | Status | Source |
|-------|--------|--------|
| No restaurants in database | 200 OK with empty array [] | Natural filtering behavior |
| Auth required but no token | 401 | JwtAuthGuard |

---

## Step 2: Create Address

**Controller**: `apps/backend/src/services/user/user-profile.controller.ts:37-41`

```typescript
@Post('addresses')
async createAddress(@Req() req: any, @Body() body: AddressCreateBody) {
  const userId = req.user?.sub;
  return this.profileService.createAddress(userId, body);
}
```

### Required Fields
```typescript
interface AddressCreateBody {
  label: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  location: { lat: number; lng: number };  // REQUIRED
  isDefault?: boolean;
}
```

### Current k6 Implementation
```javascript
// common.js:178-200
const payload = JSON.stringify({
  label: `Load ${__VU}-${__ITER}`,
  addressLine: `${100 + __VU} Load Test Street`,
  city: 'Load City',
  state: 'LC',
  postalCode: '500001',
  location: { lat: 17.385 + (__VU % 10) / 1000, lng: 78.486 + (__ITER % 10) / 1000 },
  isDefault: true,
});
```

### Failure Points
| Issue | Status | Source |
|-------|--------|--------|
| Missing authentication | 401 | JwtAuthGuard |
| Missing location field | 400 | ValidationPipe |
| userId resolution | 401/400 | userId from token |

---

## Step 3: Place Order

**Controller**: `apps/backend/src/services/order/order.controller.ts:13-20`

```typescript
@Post()
@Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
async placeOrder(
  @Body() body: any,
  @Headers('x-idempotency-key') idempotencyKey?: string
) {
  return this.orderService.placeOrder(body, idempotencyKey);
}
```

### Required Fields
```typescript
// order.service.ts:18-31
type OrderDataInput = {
  userId: string;      // REQUIRED
  restaurantId: string; // REQUIRED
  grandTotal: number;   // REQUIRED, > 0
  driverId?: string;
  items?: OrderItem[];
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  discount?: number;
  tip?: number;
  couponId?: string;
  deliveryAddressId?: string;
};
```

### Current k6 Implementation
```javascript
// common.js:229-240
const payload = JSON.stringify({
  userId,
  restaurantId,
  items: [{ id: `item-${__VU % 20}`, name: 'Load Test Item', price: itemPrice, quantity }],
  deliveryAddressId: addressId,
  subtotal,
  tax,
  deliveryFee,
  discount,
  grandTotal,
  tip,
});
```

### Order Validation (order.service.ts:48-94)
| Field | Validation |
|-------|------------|
| items | Must be non-empty array; each item needs id, name, price, quantity |
| subtotal | Must be finite >= 0 |
| tax | Must be finite >= 0 |
| deliveryFee | Must be finite >= 0 |
| grandTotal | Must be finite > 0 and match subtotal+tax+deliveryFee |

### Failure Points
| Issue | Status | Source |
|-------|--------|--------|
| Missing userId | 400 | order.service.ts:98-100 |
| Missing restaurantId | 400 | order.service.ts:98-100 |
| Missing grandTotal | 400 | order.service.ts:98-100 |
| No restaurants found | 404/empty | restaurant.service.ts:17-22 |
| Invalid item ID | 400 | order.service.ts:57-58 |
| Total mismatch | 400 | order.service.ts:90-92 |

---

## Critical Issue: Item ID Generation

```javascript
// common.js:232 - FLAWED
items: [{ id: `item-${__VU % 20}`, ... }]  // Only 20 unique IDs!
```

### Problem Analysis
- `__VU % 20` produces values 0-19 (20 unique values)
- With 10,000 VUs, 500 VUs will share each item ID
- Items must have valid format; exact requirements unclear without menu data

### Recommended Fix
Either:
1. Generate unique item IDs per request
2. Or simplify: remove item validation in test mode
3. Or seed menu items in test database

---

## Order Pipeline Dependency Chain

```
Auth Token (from register/login)
    ↓
Restaurant List → restaurantId
    ↓
Address Creation → addressId
    ↓
Order Placement (requires restaurantId, addressId)
```

---

## Status Summary

| Component | Status | Issue |
|-----------|--------|-------|
| RestaurantController | ❌ Missing from LocalDevModule | Order flow breaks |
| UserProfileController | ❌ Missing from LocalDevModule | Address creation breaks |
| OrderController | ❌ Missing from LocalDevModule | Order breaks |
| Item ID uniqueness | ⚠️ Only 20 values | Validation errors |
| Required field validation | ✅ Implemented | Will catch real errors |