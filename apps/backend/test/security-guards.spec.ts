import { describe, expect, it } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from '../src/security/roles.guard';
import { PermissionGuard } from '../src/security/permission.guard';
import { UserRole, UserStatus } from '../src/shared/domain/user.interface';
import { hasRolePermission } from '../src/security/permissions';

function createContext(handlerMetadata: Record<string, unknown>, requestUser?: any) {
  return {
    getHandler: () => handlerMetadata,
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: requestUser }),
    }),
  } as any;
}

describe('Security guards', () => {
  it('allows unguarded handlers and enforces required roles', () => {
    const guard = new RolesGuard({ getAllAndOverride: () => undefined } as any);
    expect(guard.canActivate(createContext({}) as any)).toBe(true);

    const roleGuard = new RolesGuard({ getAllAndOverride: () => [UserRole.ADMIN] } as any);
    expect(() => roleGuard.canActivate(createContext({}, undefined))).toThrow(ForbiddenException);
    expect(() => roleGuard.canActivate(createContext({}, { role: UserRole.CUSTOMER, status: UserStatus.ACTIVE }))).toThrow(ForbiddenException);
    expect(roleGuard.canActivate(createContext({}, { role: UserRole.ADMIN, status: UserStatus.ACTIVE }))).toBe(true);
  });

  it('blocks inactive users before role checks', () => {
    const guard = new RolesGuard({ getAllAndOverride: () => [UserRole.ADMIN] } as any);

    expect(() => guard.canActivate(createContext({}, { role: UserRole.ADMIN, status: UserStatus.SUSPENDED }))).toThrow('User account is not active');
  });

  it('enforces permission metadata with role permissions and super-admin bypass', () => {
    const permissionGuard = new PermissionGuard({ getAllAndMerge: () => ['payments:manage'] } as any);

    expect(() => permissionGuard.canActivate(createContext({}, { role: UserRole.CUSTOMER, status: UserStatus.ACTIVE }))).toThrow(ForbiddenException);
    expect(permissionGuard.canActivate(createContext({}, { role: UserRole.ADMIN, status: UserStatus.ACTIVE }))).toBe(true);
    expect(permissionGuard.canActivate(createContext({}, { role: UserRole.SUPER_ADMIN, status: UserStatus.ACTIVE }))).toBe(true);
  });

  it('requires every requested permission for non-super-admin users', () => {
    const permissionGuard = new PermissionGuard({ getAllAndMerge: () => ['payments:manage', 'users:manage'] } as any);

    expect(permissionGuard.canActivate(createContext({}, { role: UserRole.ADMIN, status: UserStatus.ACTIVE }))).toBe(true);
    expect(() => permissionGuard.canActivate(createContext({}, {
      role: UserRole.FINANCE_STAFF,
      status: UserStatus.ACTIVE,
      permissions: ['finance:read'],
    }))).toThrow('Insufficient permissions');
  });

  it('allows access when no permissions required', () => {
    const permissionGuard = new PermissionGuard({ getAllAndMerge: () => [] } as any);
    expect(permissionGuard.canActivate(createContext({}) as any)).toBe(true);
  });

  it('throws when user is missing', () => {
    const permissionGuard = new PermissionGuard({ getAllAndMerge: () => ['payments:manage'] } as any);
    expect(() => permissionGuard.canActivate(createContext({}, undefined) as any)).toThrow('Authentication is required');
  });

  it('throws when user is not active', () => {
    const permissionGuard = new PermissionGuard({ getAllAndMerge: () => ['payments:manage'] } as any);
    expect(() => permissionGuard.canActivate(createContext({}, {
      role: UserRole.CUSTOMER,
      status: UserStatus.SUSPENDED,
    }) as any)).toThrow('User account is not active');
  });

  it('throws when user role is missing', () => {
    const permissionGuard = new PermissionGuard({ getAllAndMerge: () => ['payments:manage'] } as any);
    expect(() => permissionGuard.canActivate(createContext({}, {
      status: UserStatus.ACTIVE,
    }) as any)).toThrow('User role is required');
  });

  it('throws when user role is invalid', () => {
    const permissionGuard = new PermissionGuard({ getAllAndMerge: () => ['payments:manage'] } as any);
    expect(() => permissionGuard.canActivate(createContext({}, {
      role: 'unknown_role',
      status: UserStatus.ACTIVE,
    }) as any)).toThrow('Invalid user role');
  });

  it('throws for RolesGuard when user role is invalid', () => {
    const roleGuard = new RolesGuard({ getAllAndOverride: () => [UserRole.ADMIN] } as any);
    expect(() => roleGuard.canActivate(createContext({}, {
      role: 'unknown_role',
      status: UserStatus.ACTIVE,
    }) as any)).toThrow('Invalid user role');
  });

  it('delegates hasPermission to role permission check', () => {
    const roleGuard = new RolesGuard({ getAllAndOverride: () => [] } as any);
    expect(roleGuard.hasPermission(UserRole.ADMIN, 'payments:manage')).toBe(true);
    expect(roleGuard.hasPermission(UserRole.CUSTOMER, 'payments:manage')).toBe(false);
  });

  it('hasRolePermission returns false for completely invalid role string', () => {
    expect(hasRolePermission('notarole' as any, 'payments:manage')).toBe(false);
    expect(hasRolePermission('' as any, 'payments:manage')).toBe(false);
  });

  it('hasRolePermission uses userPermissions when provided', () => {
    expect(hasRolePermission(UserRole.CUSTOMER, 'payment:manage', ['payment:manage'])).toBe(true);
    expect(hasRolePermission(UserRole.CUSTOMER, 'users:manage', ['users:manage'])).toBe(true);
    expect(hasRolePermission(UserRole.CUSTOMER, 'payments:manage', ['finance:read'])).toBe(false);
  });
});
