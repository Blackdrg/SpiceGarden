# Authentication Reference

## Overview

SpiceGarden backend uses JWT-based authentication with refresh tokens, OTP verification, and session management.

**Source:** `apps/backend/src/services/auth/`, `apps/backend/src/security/`

---

## Authentication Flow

### Registration Flow

1. `POST /auth/register` - Create user account
2. Password hashed with Argon2
3. Session created with device info
4. Access token (JWT) + Refresh token returned

### Login Flow

1. `POST /auth/login` - Email/phone + password
2. Argon2 password verification
3. Session validation (check existing active sessions)
4. New tokens issued if valid

### OTP Flow

1. `POST /auth/otp/send` - Send OTP to email/phone
2. OTP stored in DB with expiry
3. `POST /auth/otp/verify` - Verify OTP code
4. On success: similar to login token issuance

### Token Refresh Flow

1. `POST /auth/refresh` - Submit refresh token
2. Validate refresh token against session
3. Issue new access + refresh tokens
4. Session extended

---

## JWT Configuration

**File:** `apps/backend/src/services/auth/strategies/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    });
  }

  validate(payload: { sub: string; email: string; role: string; status: string }) {
    return { userId: payload.sub, email: payload.email, role: payload.role, status: payload.status };
  }
}
```

### Token Payload

| Field | Source | Description |
|-------|--------|-------------|
| `sub` | User ID | Subject (user identifier) |
| `email` | User email | User email address |
| `role` | User role | One of 8 roles |
| `status` | User status | ACTIVE, INACTIVE, etc. |

### Token Expiry

| Token | Expiry | Config |
|-------|--------|--------|
| Access Token (JWT) | 15 minutes (default) | `JWT_EXPIRES_IN` env var |
| Refresh Token | 30 days (default) | `SESSION_DURATION_DAYS` env var |
| OTP Code | 10 minutes | Hardcoded |
| Session | 30 days | `SESSION_DURATION_DAYS` |

---

## Session Management

**File:** `apps/backend/src/db/entities/session.entity.ts`

### Session Table

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| userId | UUID | FK → users |
| refreshToken | string | 40-byte hex |
| userAgent | string | Browser/app info |
| ipAddress | string | Client IP |
| isActive | boolean | Session status |
| expiresAt | timestamp | Session expiry |
| createdAt | timestamp | Session start |

### Session Features

- Device tracking via user agent
- IP address logging
- Multiple concurrent sessions supported
- Soft invalidation via `isActive` flag

---

## Password Security

**File:** `apps/backend/src/services/auth/auth.service.ts`

```typescript
// Hashing (line 37)
const hash = await argon2.hash(password);

// Verification (line 41)
const isValid = await argon2.verify(hash, password);
```

### Argon2 Configuration

| Parameter | Value | Notes |
|-----------|-------|-------|
| Algorithm | Argon2id | Memory-hard KDF |
| Salt | Auto-generated | Per-hash unique salt |
| Hash length | Default (64 bytes) | |
| Time cost | Default | Configurable |
| Memory cost | Default | Configurable |

### Password Requirements

| Rule | Implementation |
|------|---------------|
| Minimum length | 8 characters (validated in DTO) |
| Hashing | Argon2id (not bcrypt, not SHA) |
| No plain text | Never stored |
| No reversible encryption | One-way hash only |

---

## OTP System

**File:** `apps/backend/src/db/entities/otp.entity.ts`

### OTP Table

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| identifier | string | Email or phone |
| code | string | 6-digit OTP |
| type | string | login, register, reset_password |
| expiresAt | timestamp | 10 min expiry |
| attempts | integer | Rate limit counter |
| isUsed | boolean | Prevent reuse |
| createdAt | timestamp | Creation time |

### OTP Features

- Rate limiting via attempts counter
- One-time use (isUsed flag)
- Expiry enforcement
- Identifier-based (email or phone)

---

## Rate Limiting on Auth

**File:** `apps/backend/src/main.ts` (lines 113-143)

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/otp` | 3 requests | 10 minutes |
| `/auth/` | 5 requests | 15 minutes (skip successful) |

---

## Guards

### JWT Auth Guard

**File:** `apps/backend/src/security/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Extracts JWT from Authorization: Bearer header
  // Validates signature and expiry
  // Attaches user to request object
}
```

### Usage Pattern

```typescript
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  @Get()
  findAll(@Request() req) {
    const user = req.user; // { userId, email, role, status }
  }
}
```

### Public Endpoints

```typescript
@Controller('auth')
@Public()  // Custom decorator or skip guard
export class AuthController {
  @Post('login')
  login(@Body() dto: LoginDto) { ... }
}
```

---

## Token Storage (Frontend)

### Customer Web

| Storage | Key | Content |
|---------|-----|---------|
| `localStorage` | `sg_token:v1` | Access token |
| `localStorage` | `sg_user:v1` | User profile JSON |

### Mobile Apps

| Storage | Key | Content |
|---------|-----|---------|
| `AsyncStorage` | `driver_token` | Access token |
| `AsyncStorage` | `driver_id` | User ID |

---

## Auto Token Refresh

**File:** `packages/shared/api.ts`

```typescript
async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let response = await fetch(API_URL + endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options?.headers
    }
  });
  
  if (response.status === 401) {
    // Auto refresh
    const newToken = await refreshToken();
    if (newToken) {
      response = await fetch(API_URL + endpoint, {
        ...options,
        headers: { 'Authorization': `Bearer ${newToken}` }
      });
    }
  }
  
  return response.json();
}
```

---

## Logout Flow

1. `POST /auth/logout`
2. Mark session as inactive
3. Clear refresh tokens
4. Frontend clears localStorage/AsyncStorage

---

## Security Features

| Feature | Implementation |
|---------|---------------|
| Token signing | HS256 with JWT_SECRET |
| Token expiry | Short-lived access + long-lived refresh |
| Refresh token rotation | New refresh token on each refresh |
| Session invalidation | Soft delete via isActive flag |
| Concurrent sessions | Supported (no limit enforced) |
| Token revocation | Via session table |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | - | Secret for JWT signing |
| `JWT_EXPIRES_IN` | No | 15m | Access token expiry |
| `SESSION_DURATION_DAYS` | No | 30 | Session duration |
| `REFRESH_TOKEN_LENGTH` | No | 40 | Refresh token length |
| `ENCRYPTION_SECRET` | Yes | - | For token encryption if needed |

---

## DTOs

### Login DTO

```typescript
class LoginDto {
  @IsEmail() email?: string;
  @IsString() phone?: string;
  @IsString() password: string;
}
```

### Register DTO

```typescript
class RegisterDto {
  @IsString() fullName: string;
  @IsEmail() email: string;
  @IsString() phone: string;
  @IsString() password: string;
}
```

### Refresh DTO

```typescript
class RefreshTokenDto {
  @IsString() refreshToken: string;
}
```
