# AUTH ROOT CAUSE REPORT

## Executive Summary

The registration and login K6 test failures were caused by **two compounding bugs**:

1. **Critical**: `LocalRepositoryModule.findOne()` ignored the `where` parameter — always returned the first row regardless of query criteria
2. **Secondary**: Registration controller returned `401 Unauthorized` instead of `409 Conflict` for duplicate emails

## Root Cause Analysis

### Bug #1: Broken In-Memory Repository (PRIMARY)

**File**: `apps/backend/src/db/local-repository.module.ts`  
**Line**: 38

**Original code**:
```typescript
findOne: async () => rows[0] || null,
```

**Problem**: The `findOne` method accepted no parameters and always returned `rows[0]` (the first user ever created). This meant:
- After first user registration: `findOne({ where: { email: "..." } })` always returned the first user
- Every subsequent registration found a "duplicate" email even for brand-new unique emails
- Login flow would sometimes return wrong user if the first user's email matched

**Impact**:
- All register attempts after the first one returned "Email already registered" (401)
- K6 VUs creating unique emails still failed because the mock repository comparison was broken
- Only the first user per test run could register successfully

**Fix**:
```typescript
findOne: async (options: any) => {
  if (!options || !options.where) {
    return rows[0] || null;
  }
  const criteria = options.where;
  return rows.find((row) =>
    Object.entries(criteria).every(([key, value]) => row[key] === value)
  ) || null;
},
findOneBy: async (criteria: any) => {
  if (!criteria) {
    return rows[0] || null;
  }
  return rows.find((row) =>
    Object.entries(criteria).every(([key, value]) => row[key] === value)
  ) || null;
},
```

### Bug #2: Wrong HTTP Status for Duplicate Email (SECONDARY)

**File**: `apps/backend/src/services/auth/auth.controller.ts`  
**Line**: 38

**Original code**:
```typescript
throw new UnauthorizedException('Email already registered');
```

**Problem**: `UnauthorizedException` returns HTTP 401, which is semantically incorrect for duplicate resource creation. The correct status is 409 Conflict.

**Fix**:
```typescript
throw new ConflictException('Email already registered');
```

### Bug #3: K6 Test Email Generation (ALREADY CORRECT)

**File**: `apps/backend/test/load/common.js`  
**Line**: 106-107

```javascript
const uniqueId = `${Date.now()}-${__VU}-${__ITER}-${Math.random().toString(36).substring(2, 8)}`;
const email = `${prefix}-${uniqueId}@load.test`;
```

**Status**: Already generates unique emails per VU/iteration. The failure was NOT due to duplicate email generation — it was due to the repository bug ignoring the `where` clause.

## Evidence Trail

1. K6 health check: PASS (200 OK)
2. K6 register: FAIL with "Email already registered" 
3. First register: Would succeed
4. Second register: Fails even with completely different email
5. Root cause: `findOne` returns first row regardless of email filter
6. Verification: `userRepo.findOne({ where: { email: "completely-new@test.com" } })` → returns first user, not null

## Resolution

| Bug | File | Fix Applied | Status |
|-----|------|-------------|--------|
| findOne ignores where clause | `local-repository.module.ts:38` | Implemented criteria-based search | ✅ Fixed |
| Wrong exception type | `auth.controller.ts:38` | `ConflictException(409)` instead of `UnauthorizedException(401)` | ✅ Fixed |

## Verification

After fix:
- First registration: Creates user, returns JWT tokens → 200 OK
- Second registration with same email: Returns 409 Conflict with "Email already registered"
- Second registration with different email: Creates user, returns JWT tokens → 200 OK
- Login with correct credentials: Returns JWT tokens → 200 OK
- Login with wrong credentials: Returns 401 Unauthorized
