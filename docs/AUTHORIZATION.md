# Authentication & Authorization

## Authentication System

### Technology Stack

| Component | Implementation |
|-----------|---------------|
| Strategy | Passport JWT + OAuth2 |
| JWT Library | @nestjs/jwt ^11.0.2 |
| Passport | passport ^0.7.0, @nestjs/passport ^11.0.5 |
| OAuth2 | passport-google-oauth20, passport-facebook |
| Password Hashing | argon2 ^0.40.0, bcrypt ^6.0.0 |
| Session Management | Custom SessionEntity + Redis |

### Authentication Flow

1. **Login** (`POST /auth/login`)
   - Validate email/password
   - Generate access token (JWT) + refresh token
   - Create session record
   - Track device (name, type, IP)
   - Return tokens + user profile

2. **Token Refresh** (`POST /auth/refresh-token`)
   - Validate refresh token
   - Issue new access token
   - Update session

3. **Session Management**
   - Device tracking via `SessionEntity`
   - Session revocation via `POST /auth/logout`
   - Multi-device support

### OAuth2 Integration

| Provider | Implementation | Files |
|----------|---------------|-------|
| Google | passport-google-oauth20 | `apps/backend/src/services/auth/strategies/` |
| Facebook | passport-facebook | `apps/backend/src/services/auth/strategies/` |

### Device Tracking

**Entity:** `device-fingerprint.entity.ts`

- Fingerprint hashing
- Browser data collection (browser, OS, screen)
- IP geolocation
- Fraud detection correlation

### Session Entity

**File:** `apps/backend/src/db/entities/session.entity.ts`

```typescript
@Entity('sessions')
class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ unique: true })
  token_hash: string;

  @Column()
  device_name: string;

  @Column()
  device_type: string;

  @Column()
  ip_address: string;

  @Column()
  user_agent: string;

  @Column()
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  last_used_at: Date;
}
```

## Authorization System

### Role-Based Access Control (RBAC)

**Enum:** `UserRole` (8 roles)
```typescript
enum UserRole {
  CUSTOMER = 'customer',
  RESTAURANT = 'restaurant',
  KITCHEN_STAFF = 'kitchen_staff',
  DELIVERY_PARTNER = 'delivery_partner',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  SUPPORT_STAFF = 'support_staff',
  FINANCE_STAFF = 'finance_staff',
}
```

**Status Enum:**
```typescript
enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}
```

### Permission Matrix

| Role | Key Permissions |
|------|-----------------|
| `customer` | orders:read_own, orders:create, wallet:read_own, wallet:transact_own |
| `restaurant` | restaurants:manage_own, orders:manage_assigned, kitchen:manage_own, menus:manage_own |
| `kitchen_staff` | kitchen:manage_own, orders:read_assigned |
| `delivery_partner` | deliveries:manage_assigned, orders:read_assigned |
| `admin` | users:manage, restaurants:manage, orders:manage, payments:manage, support:manage, analytics:read, finance:read, notifications:manage |
| `super_admin` | `*` (all permissions) |
| `support_staff` | support:manage, orders:read |
| `finance_staff` | finance:read, payments:read, refunds:read |

### Guard Implementation

**RolesGuard** (`apps/backend/src/security/roles.guard.ts`)
- Validates user role against `@Roles()` decorator
- Throws `ForbiddenException` on mismatch

**PermissionGuard** (`apps/backend/src/security/permission.guard.ts`)
- Validates specific permissions via `@Permissions()` decorator
- Supports `userPermissions` array (user-specific permissions override role defaults)

**Permission Check Function**
```typescript
hasRolePermission(role: UserRole | string, permission: string, userPermissions: string[] = []): boolean
```

## Guards in Use

### Global Guards

**File:** `apps/backend/src/main.ts`

- `JwtAuthGuard` - JWT token validation
- `RolesGuard` - Role-based access
- `PermissionGuard` - Permission-based access

### Controller-Level Guards

Example from `PaymentsController`:
```typescript
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  @Post('create-intent')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createPaymentIntent(...) { ... }
}
```

### Method-Level Guards

```typescript
@Post('refunds/:id/approve')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.FINANCE_STAFF)
async approveRefund(...) { ... }
```

## Security Decorators

| Decorator | Purpose | File |
|-----------|---------|------|
| `@Roles(...roles)` | Restrict access by role | `roles.decorator.ts` |
| `@Permissions(...perms)` | Restrict access by permission | `permissions.decorator.ts` |

## Password Security

### Hashing

- Primary: **Argon2** (argon2 ^0.40.0)
- Fallback: **bcrypt** (bcrypt ^6.0.0)
- Implementation: `apps/backend/src/services/auth/auth.service.ts`

### Validation

- Password complexity enforced at application level
- Minimum length validation in auth service
- Password hashing for storage (no plaintext)

## OTP System

**Entity:** `otp.entity.ts`

- Phone/email OTP generation
- Rate limited (3 per 10 min per IP)
- Hash-based storage
- Expiration tracking
- Attempt limiting

### OTP Flow

1. Request OTP (sent via SMS/email)
2. Store hashed OTP with expiry
3. Verify OTP (compare hash)
4. Mark invalid after successful use
