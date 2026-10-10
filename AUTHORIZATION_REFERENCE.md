# Authorization Reference

## Overview

SpiceGarden implements Role-Based Access Control (RBAC) with 8 user roles and a granular permission matrix.

**Source:** `apps/backend/src/security/permissions.ts`, `apps/backend/src/security/permission.guard.ts`, `apps/backend/src/security/roles.guard.ts`

---

## Role Hierarchy

### 8 User Roles

| Role | Enum Value | Level | Description |
|------|-----------|-------|-------------|
| Customer | `CUSTOMER` | 1 | End-user ordering food |
| Restaurant | `RESTAURANT` | 2 | Restaurant owner/manager |
| Kitchen Staff | `KITCHEN_STAFF` | 3 | Kitchen operations |
| Delivery Partner | `DELIVERY_PARTNER` | 4 | Driver/delivery |
| Admin | `ADMIN` | 5 | Platform administrator |
| Support Staff | `SUPPORT_STAFF` | 6 | Customer support |
| Finance Staff | `FINANCE_STAFF` | 7 | Finance operations |
| Super Admin | `SUPER_ADMIN` | 8 | Full system access |

---

## Permission Matrix

**File:** `apps/backend/src/security/permissions.ts`

| Role | Permissions |
|------|-------------|
| `CUSTOMER` | `orders:read_own`, `orders:create`, `wallet:read_own`, `wallet:transact_own` |
| `RESTAURANT` | `restaurants:manage_own`, `orders:manage_assigned`, `kitchen:manage_own`, `menus:manage_own` |
| `KITCHEN_STAFF` | `kitchen:manage_own`, `orders:read_assigned` |
| `DELIVERY_PARTNER` | `deliveries:manage_assigned`, `orders:read_assigned` |
| `ADMIN` | `users:manage`, `restaurants:manage`, `orders:manage`, `payments:manage`, `support:manage`, `analytics:read`, `finance:read`, `notifications:manage`, `compliance:read` |
| `SUPPORT_STAFF` | `support:manage`, `orders:read` |
| `FINANCE_STAFF` | `finance:read`, `payments:read`, `refunds:read` |
| `SUPER_ADMIN` | `*` (ALL - wildcard) |

---

## Guard Implementation

### Permission Guard

**File:** `apps/backend/src/security/permission.guard.ts`

```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;  // Attached by JWT guard
    
    // 1. Auth required
    if (!user) throw new ForbiddenException('Authentication required');
    
    // 2. Active status required
    if (user.status !== 'ACTIVE') throw new ForbiddenException('Account not active');
    
    // 3. Super admin bypass
    if (user.role === 'SUPER_ADMIN') return true;
    
    // 4. Role validation
    const normalizedRole = user.role?.toUpperCase();
    if (!normalizedRole) throw new ForbiddenException('Role required');
    
    // 5. Permission check
    const permissions = rolePermissions[normalizedRole] || [];
    const required = metadata.getRequiredPermission();
    if (permissions.includes('*') || permissions.includes(required)) {
      return true;
    }
    
    throw new ForbiddenException('Insufficient permissions');
  }
}
```

### Roles Guard

**File:** `apps/backend/src/security/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const metadata = reflect.getMetadata(ROLES_KEY, context.getHandler());
    const requiredRoles = metadata['roles'];
    
    // Super admin bypass
    if (user.role === 'SUPER_ADMIN') return true;
    
    // Role match check
    return requiredRoles.includes(user.role);
  }
}
```

---

## Decorators

### @Roles()

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Get('dashboard')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getDashboard() { ... }
}
```

### @Permissions()

```typescript
@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class OrderController {
  
  @Get()
  @Permissions('orders:read_own', 'orders:read_assigned')
  findAll(@Request() req) { ... }
}
```

### @Public()

```typescript
@Controller('auth')
@Public()  // Skips JWT guard
export class AuthController {
  @Post('login')
  login() { ... }
}
```

---

## Permission Naming Convention

```
<domain>:<action>[_<scope>]

Examples:
- orders:read_own          - Read own orders
- orders:create            - Create orders
- orders:read_assigned     - Read assigned orders
- orders:manage_assigned   - Manage assigned orders
- restaurants:manage_own   - Manage own restaurants
- kitchen:manage_own       - Manage own kitchen
- menus:manage_own         - Manage own menus
- deliveries:manage_assigned - Manage assigned deliveries
- payments:read            - Read payment data
- finance:read             - Read financial data
- support:manage           - Manage support tickets
- compliance:read          - Read compliance data
- analytics:read           - Read analytics
```

---

## Role Assignment

### User Roles

**File:** `apps/backend/src/db/entities/user.entity.ts`

```typescript
@Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
role!: UserRole;
```

### Default Role

New users default to `CUSTOMER` role.

### Role Changes

Only `SUPER_ADMIN` can change user roles via `PUT /users/:id`.

---

## User Status

**File:** `apps/backend/src/shared/domain/user.interface.ts`

```typescript
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}
```

### Status Impact

| Status | Access |
|--------|--------|
| ACTIVE | Full access based on role |
| INACTIVE | Blocked by PermissionGuard |
| SUSPENDED | Blocked by PermissionGuard |
| DELETED | No access, soft deleted |

---

## Super Admin Bypass

`SUPER_ADMIN` bypasses ALL permission checks in both guards:
- `RolesGuard`: Always returns `true`
- `PermissionGuard`: Returns `true` before any permission check

Exception checks:
- Authentication (JWT must be valid)
- User status must be `ACTIVE`

---

## Access Control by Endpoint Category

| Category | Customer | Restaurant | Kitchen | Driver | Admin | Super Admin |
|----------|----------|-----------|---------|--------|-------|-------------|
| Create orders | Yes | No | No | No | No | Yes |
| Manage restaurant | No | Own only | No | No | All | Yes |
| Kitchen operations | No | No | Own only | No | All | Yes |
| Delivery operations | No | No | No | Assigned only | All | Yes |
| User management | No | No | No | No | All | Yes |
| Payments | Own only | Own only | No | No | All | Yes |
| Support tickets | Own only | Own only | No | Own only | All | Yes |
| Analytics | No | Own only | No | No | Read only | Yes |
| Compliance | No | No | No | No | Read only | Yes |

---

## Security Considerations

| Consideration | Implementation |
|---------------|---------------|
| Permission changes | Require SUPER_ADMIN |
| Role hierarchy | Flat (no implicit inheritance) |
| Active status check | Enforced globally |
| Session revocation | Via session table |
| Concurrent access | JWT stateless, sessions trackable |

---

## Authorization Middleware Order

```
Request
  → JWT Auth Guard (extract/validate token)
    → Roles Guard (check role requirement)
      → Permission Guard (check permission requirement)
        → Controller Action
```

Multiple guards can stack:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
```
