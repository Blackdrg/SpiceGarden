import { describe, expect, it } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from '../src/security/roles.guard';
import { PermissionGuard } from '../src/security/permission.guard';
import { UserRole, UserStatus } from '../src/shared/domain/user.interface';

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
    const guard = new RolesGuard({ get: () => undefined } as any);
    expect(guard.canActivate(createContext({}) as any)).toBe(true);

    const roleGuard = new RolesGuard({ get: () => [UserRole.ADMIN] } as any);
    expect(() => roleGuard.canActivate(createContext({}, undefined))).toThrow(ForbiddenException);
    expect(() => roleGuard.canActivate(createContext({}, { role: UserRole.CUSTOMER, status: UserStatus.ACTIVE }))).toThrow(ForbiddenException);
    expect(roleGuard.canActivate(createContext({}, { role: UserRole.ADMIN, status: UserStatus.ACTIVE }))).toBe(true);
  });

  it('blocks inactive users before role checks', () => {
    const guard = new RolesGuard({ get: () => [UserRole.ADMIN] } as any);

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
});
