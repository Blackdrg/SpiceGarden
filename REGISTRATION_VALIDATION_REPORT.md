# REGISTRATION_VALIDATION_REPORT.md

Generated: 2026-06-18

## Registration Endpoint Analysis

### Endpoint: POST /auth/register

**Controller**: `apps/backend/src/services/auth/auth.controller.ts`
**Service**: `apps/backend/src/services/auth/auth.service.ts`

---

## Request Body Requirements

| Field | Required | Type | Constraints | Source |
|-------|----------|------|-------------|--------|
| email | ✅ Yes | string | `@Column({ unique: true })` - user.entity.ts:13 | |
| phone | ✅ Yes | string | `@Column({ unique: true })` - user.entity.ts:15-16 | |
| password | ✅ Yes | string | Hashed via argon2 - auth.service.ts:22-24 | |
| fullName | ✅ Yes | string | `@Column()` - user.entity.ts:9-10 | |
| deviceName | No | string | Default: 'any Device' - auth.controller.ts:26 | |
| deviceType | No | string | Default: 'any Type' - auth.controller.ts:27 | |

---

## Response Structure

```typescript
// auth.service.ts:66-69
return {
  access_token: accessToken,   // JWT signed with JWT_SECRET
  refresh_token: crypto.randomBytes(40).toString('hex'),
}

// Note: No user object returned, but userId can be extracted from JWT
// JWT payload: { email, sub: user.id, role } - auth.service.ts:61
```

---

## Validation Failures Identified

### 1. Duplicate Email (401)
```typescript
// auth.controller.ts:36-38
const existing = await this.userRepo.findOne({ where: { email: body.email } });
if (existing) {
  throw new UnauthorizedException('Email already registered');
}
```

### 2. Duplicate Phone (500 - Database Constraint Error)
```typescript
// user.entity.ts:15-16
@Column({ unique: true })
phone!: string;
```
**Note**: This returns 500 Internal Server Error, not a clean validation error.

### 3. Missing Fields (400)
ValidationPipe with `whitelist: true, forbidNonWhitelisted: true`:
- `email` - missing causes BadRequestException
- `password` - missing causes BadRequestException
- `fullName` - missing causes BadRequestException
- `phone` - missing causes BadRequestException

---

## Current k6 Implementation Issues

```javascript
// common.js:106-111
const payload = JSON.stringify({
  email,
  password,
  fullName,     // ✅ Present
  phone,        // ✅ Present
  // Note: deviceName, deviceType NOT sent (optional but have defaults)
});
```

### Phone Format Analysis
```javascript
// common.js:110
phone: `555${String(__VU).padStart(7, '0')}${String(__ITER).padStart(4, '0')}`.slice(0, 15)
```

| VU | ITER | Raw Phone | After slice(0,15) | Risk |
|----|------|-----------|-------------------|------|
| 1 | 0 | 555000000010000 | 555000000010000 | Low |
| 100 | 0 | 55500000100000000 | 55500000100000000.slice(0,15) = 555000001000000 | Medium |
| 1000 | 0 | 55500001000000000 | 55500001000000000.slice(0,15) = 555000010000000 | Medium |

**Risk**: Collisions possible if:
1. Same VU/ITER runs in same second
2. Phone truncation truncates uniqueness

---

## Primary Failure Cause

**LocalDevModule does not include AuthServiceModule**
- `apps/backend/src/local-dev.module.ts` only imports `DbModule`
- AuthController is in `AuthServiceModule` which is NOT imported
- Results in 404 for `/auth/register` and `/auth/login`

---

## Recommended Fix

### Fix 1: Add AuthServiceModule to LocalDevModule
```typescript
// local-dev.module.ts
imports: [
  ConfigModule,
  DbModule,
  AuthServiceModule,  // ADD
  RestaurantServiceModule,  // ADD
  OrderServiceModule,  // ADD
  UserProfileModule,  // ADD
]
```

### Fix 2: Improve Phone Uniqueness
```javascript
// Use nanosecond precision + random suffix
phone: `555${Date.now()}${Math.random().toString(36).substr(2, 5)}`
```

### Fix 3: Add restaurant seed data
- Seed database with test restaurants for order flow validation