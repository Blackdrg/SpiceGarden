# USER_GENERATION_REPORT.md

Generated: 2026-06-18

## Current User Generation Analysis

### Registration Test User Generation

**Source**: `apps/backend/test/load/common.js:102-124`

```javascript
function registerUser(prefix) {
  const suffix = `${Date.now()}-${__VU}-${__ITER}`;
  const email = `${prefix}-${suffix}@load.test`;
  const password = 'Password123!';
  const payload = JSON.stringify({
    email,
    password,
    fullName: `Load Test ${suffix}`,
    phone: `555${String(__VU).padStart(7, '0')}${String(__ITER).padStart(4, '0')}`.slice(0, 15),
  });
}
```

---

## Uniqueness Verification

### Email Generation
- **Format**: `{prefix}-{timestamp}-{VU}-{ITER}@load.test`
- **Analysis**: Unique per millisecond-level timestamp + VU/ITER
- **Risk**: LOW - Multiple requests in same millisecond could collide
- **Fix**: Add random suffix

### Phone Generation
- **Format**: `555 + VU (7 digits, padded) + ITER (4 digits, padded)`, then slice to 15 chars
- **Analysis**: 
  - VU=1, ITER=0: `555` + `0000001` + `0000` = `555000000010000` (14 chars)
  - VU=1000, ITER=1000: `555` + `00001000` + `01000` = `55500000100010000` (17 chars) → slice(0,15) = `555000001000100`
- **Risk**: MEDIUM - Truncation causes collisions for high VU numbers
- **Constraint Violation**: `user.entity.ts:15` - `@Column({ unique: true })` on phone

### Username/FullName
- **Format**: `Load Test {suffix}` where suffix = `{timestamp}-{VU}-{ITER}`
- **Analysis**: Unique by timestamp + VU/ITER
- **Risk**: Low

---

## Collision Test Simulation

| Scenario | Email Collision | Phone Collision |
|----------|-----------------|-----------------|
| Same VU, same ITER, different runs | HIGH (same timestamp window) | HIGH (same VU/ITER) |
| Different VU, same ITER | None | LOW (different VU changes phone) |
| Different ITER | None | None |
| High VU numbers (>1000) | None | HIGH (phone truncation) |

---

## Current Implementation Flaws

### Flaw 1: Phone Truncation for High VU
```javascript
// For VU=5000, ITER=5000:
phone = `555${String(5000).padStart(7, '0')}${String(5000).padStart(4, '0')}`.slice(0, 15)
// = `55500005000050000`.slice(0, 15) = `555000050000500`
// VU=5001, ITER=5001 would create `55500005001050010`.slice(0, 15) = `555000050010500`
// Different but could still collide with other VU/ITER combinations
```

### Flaw 2: Item ID Range Limited
```javascript
// common.js:232
items: [{ id: `item-${__VU % 20}`, name: 'Load Test Item', price: itemPrice, quantity }]
// Only 20 unique item IDs! All VUs with same VU%20 use identical item ID.
```

---

## Recommended Fix Implementation

### Improved User Generation
```javascript
// Unique email: prefix-{timestamp}-{VU}-{ITER}-{random}
const uniqueId = `${Date.now()}-${__VU}-${__ITER}-${Math.random().toString(36).substring(2, 8)}`;
const email = `${prefix}-${uniqueId}@load.test`;
const phone = `+1555${Date.now().toString().slice(-7)}${Math.random().toString().slice(2, 7)}`;
```

### Collision-Proof Item Generation
```javascript
// Unique item ID per VU/ITER
const itemUniqueId = `item-${__VU}-${__ITER}-${Date.now()}-${__ITER}`;
items: [{ id: itemUniqueId, name: 'Load Test Item', price: itemPrice, quantity }]
```

---

## Test Without Collisions

To verify 1000 registrations without collisions:
- Use timestamp (milliseconds) + VU + ITER + random suffix
- Ensure phone includes full precision without truncation
- Ensure email domain avoids filtering/blocking

**Status**: ⚠️ Current implementation will cause phone collisions at scale