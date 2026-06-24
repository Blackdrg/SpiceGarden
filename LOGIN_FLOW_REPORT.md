# LOGIN_FLOW_REPORT.md

Generated: 2026-06-18

## Login Endpoint Analysis

### Endpoint: POST /auth/login

**Controller**: `apps/backend/src/services/auth/auth.controller.ts:18-32`
**Service**: `apps/backend/src/services/auth/auth.service.ts:42-60`

---

## Request Body Requirements

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| email | ✅ Yes | string | User's registered email |
| password | ✅ Yes | string | User's password |

### Optional Fields (with defaults)
| Field | Default | Used for |
|-------|---------|----------|
| deviceName | "any Device" | Session tracking |
| deviceType | "any Type" | Session tracking |

---

## Response Structure

```typescript
// auth.service.ts:66-69
return {
  access_token: accessToken,     // JWT token
  refresh_token: string,         // Random hex string (40 bytes)
}
```

### JWT Token Claims
```typescript
// auth.service.ts:61
const payload = { 
  email: user.email, 
  sub: user.id,     // User UUID
  role: user.role   // UserRole enum
};
```

---

## JWT Token Validation

### Token Format
- Standard JWT with header.payload.signature
- Signed with `JWT_SECRET` from environment
- Expiration: `JWT_EXPIRES_IN` (default: 7d)

### JWT Extraction Logic (common.js:202-213)
```javascript
function userIdFromToken(token) {
  const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(b64decode(normalized)).sub;
}
```

---

## Current k6 Implementation

### Login Function
```javascript
// common.js:126-139
function loginUser(email, password) {
  const { res, ok, body } = request(
    'POST',
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' }, tags: { step: 'login' } },
    'login',
    [200],
    metrics.loginSuccess,
  );
  const token = body && body.access_token ? body.access_token : null;
}
```

### Token Extraction (common.js:121-123)
```javascript
const token = body && body.access_token ? body.access_token : null;
const userId = body && (body.user && body.user.id ? body.user.id : body.id ? body.id : null);
```

**Note**: Response does NOT include user object, only access_token and refresh_token

---

## Login Failure Scenarios

| Scenario | Status Code | Source |
|----------|-------------|--------|
| Missing email/password | 401 | auth.service.ts:44-45 |
| Invalid email | 401 | auth.service.ts:48-49 |
| Invalid password | 401 | auth.service.ts:57 |
| User not found | 401 | auth.service.ts:48-49 |

---

## validateUser Implementation

```typescript
// auth.service.ts:42-58
async validateUser(email: string, pass: string): Promise<any> {
  if (!email || !pass) {
    throw new UnauthorizedException('Credentials required');
  }

  const user = await this.userRepo.findOne({ where: { email } });
  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  if (await this.verifyPassword(pass, user.passwordHash)) {
    const { passwordHash, ...result } = user;
    return result;
  }

  throw new UnauthorizedException('Invalid email or password');
}
```

---

## JWT Validation

### Token Signature
- Algorithm: HS256 (default for @nestjs/jwt)
- Secret: `JWT_SECRET` from config

### Token Claims
- `sub`: User UUID
- `email`: User email
- `role`: User role (CUSTOMER, RESTAURANT, ADMIN, SUPER_ADMIN)

### Expiration
- Default: 7 days (from JWT_EXPIRES_IN)
- Configurable via environment

---

## Response Structure Verification

✅ Confirmed: Login returns `{ access_token, refresh_token }`
❌ No `user` or `id` returned in response body
⚠️ Current k6 code checks for `body.user.id` which will always be null

---

## Recommended k6 Fix

```javascript
// Current (incorrect for user id extraction)
const userId = body && (body.user && body.user.id ? body.user.id : body.id ? body.id : null);

// Fix: Extract from JWT token
const userId = body && body.access_token ? userIdFromToken(body.access_token) : null;
```

---

## Status Summary

| Check | Status |
|-------|--------|
| Endpoint exists | ❌ Missing from LocalDevModule |
| Request validation | ✅ Checks email/password |
| Response structure | ✅ Confirmed {access_token, refresh_token} |
| JWT claims | ✅ email, sub, role |
| JWT expiration | ✅ Configurable |