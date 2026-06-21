import { describe, expect, it, jest } from '@jest/globals';
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

describe('RBAC Endpoint Coverage Tests', () => {
  describe('RolesGuard coverage', () => {
    it('allows access for CUSTOMER role to customer endpoints', () => {
      const guard = new RolesGuard({ get: () => [UserRole.CUSTOMER] } as any);
      expect(guard.canActivate(createContext({}, { role: UserRole.CUSTOMER, status: UserStatus.ACTIVE }))).toBe(true);
    });

    it('allows access for ADMIN role to admin endpoints', () => {
      const guard = new RolesGuard({ get: () => [UserRole.ADMIN] } as any);
      expect(guard.canActivate(createContext({}, { role: UserRole.ADMIN, status: UserStatus.ACTIVE }))).toBe(true);
    });

    it('allows access for SUPER_ADMIN role when listed in roles', () => {
      const guard = new RolesGuard({ get: () => [UserRole.SUPER_ADMIN] } as any);
      expect(guard.canActivate(createContext({}, { role: UserRole.SUPER_ADMIN, status: UserStatus.ACTIVE }))).toBe(true);
    });

    it('allows access for DELIVERY_PARTNER to delivery endpoints', () => {
      const guard = new RolesGuard({ get: () => [UserRole.DELIVERY_PARTNER] } as any);
      expect(guard.canActivate(createContext({}, { role: UserRole.DELIVERY_PARTNER, status: UserStatus.ACTIVE }))).toBe(true);
    });

    it('allows access for KITCHEN_STAFF to kitchen endpoints', () => {
      const guard = new RolesGuard({ get: () => [UserRole.KITCHEN_STAFF] } as any);
      expect(guard.canActivate(createContext({}, { role: UserRole.KITCHEN_STAFF, status: UserStatus.ACTIVE }))).toBe(true);
    });

    it('allows access for RESTAURANT to restaurant endpoints', () => {
      const guard = new RolesGuard({ get: () => [UserRole.RESTAURANT] } as any);
      expect(guard.canActivate(createContext({}, { role: UserRole.RESTAURANT, status: UserStatus.ACTIVE }))).toBe(true);
    });

    it('blocks wrong role for protected endpoints', () => {
      const guard = new RolesGuard({ get: () => [UserRole.ADMIN] } as any);
      expect(() => guard.canActivate(createContext({}, { role: UserRole.CUSTOMER, status: UserStatus.ACTIVE }))).toThrow(ForbiddenException);
    });

    it('blocks access when role is missing', () => {
      const guard = new RolesGuard({ get: () => [UserRole.CUSTOMER] } as any);
      expect(() => guard.canActivate(createContext({}, { status: UserStatus.ACTIVE }))).toThrow(ForbiddenException);
    });

    it('blocks INACTIVE status users', () => {
      const guard = new RolesGuard({ get: () => [UserRole.CUSTOMER] } as any);
      expect(() => guard.canActivate(createContext({}, { role: UserRole.CUSTOMER, status: UserStatus.INACTIVE }))).toThrow(ForbiddenException);
    });

    it('blocks SUSPENDED status users', () => {
      const guard = new RolesGuard({ get: () => [UserRole.CUSTOMER] } as any);
      expect(() => guard.canActivate(createContext({}, { role: UserRole.DELIVERY_PARTNER, status: UserStatus.SUSPENDED }))).toThrow(ForbiddenException);
    });
  });

  describe('PermissionGuard coverage', () => {
    it('enforces wallet:read_own for CUSTOMER', () => {
      const guard = new PermissionGuard({ getAllAndMerge: () => ['wallet:read_own'] } as any);
      expect(guard.canActivate(createContext({}, { role: UserRole.CUSTOMER, status: UserStatus.ACTIVE }))).toBe(true);
    });

    it('enforces payments:manage for ADMIN', () => {
      const guard = new PermissionGuard({ getAllAndMerge: () => ['payments:manage'] } as any);
      expect(guard.canActivate(createContext({}, { role: UserRole.ADMIN, status: UserStatus.ACTIVE }))).toBe(true);
    });

    it('enforces analytics:read for ADMIN', () => {
      const guard = new PermissionGuard({ getAllAndMerge: () => ['analytics:read'] } as any);
      expect(guard.canActivate(createContext({}, { role: UserRole.ADMIN, status: UserStatus.ACTIVE }))).toBe(true);
    });

    it('SUPER_ADMIN bypasses all permission checks', () => {
      const guard = new PermissionGuard({ getAllAndMerge: () => ['any:permission', 'another:one'] } as any);
      expect(guard.canActivate(createContext({}, { role: UserRole.SUPER_ADMIN, status: UserStatus.ACTIVE }))).toBe(true);
    });

    it('FINANCE_STAFF can access finance:read', () => {
      const guard = new PermissionGuard({ getAllAndMerge: () => ['finance:read'] } as any);
      expect(guard.canActivate(createContext({}, { role: UserRole.FINANCE_STAFF, status: UserStatus.ACTIVE }))).toBe(true);
    });

    it('KITCHEN_STAFF cannot access customer-only permissions', () => {
      const guard = new PermissionGuard({ getAllAndMerge: () => ['wallet:transact_own'] } as any);
      expect(() => guard.canActivate(createContext({}, { role: UserRole.KITCHEN_STAFF, status: UserStatus.ACTIVE }))).toThrow(ForbiddenException);
    });

    it('RESTAURANT can manage assigned orders', () => {
      const guard = new PermissionGuard({ getAllAndMerge: () => ['orders:manage_assigned'] } as any);
      expect(guard.canActivate(createContext({}, { role: UserRole.RESTAURANT, status: UserStatus.ACTIVE }))).toBe(true);
    });

    it('blocks access when permissions not met', () => {
      const guard = new PermissionGuard({ getAllAndMerge: () => ['payments:manage', 'users:manage'] } as any);
      expect(() => guard.canActivate(createContext({}, { role: UserRole.CUSTOMER, status: UserStatus.ACTIVE }))).toThrow(ForbiddenException);
    });
  });

  describe('Permission matrix validation', () => {
    it('has all expected roles defined', () => {
      const roles = Object.values(UserRole);
      expect(roles).toContain(UserRole.CUSTOMER);
      expect(roles).toContain(UserRole.RESTAURANT);
      expect(roles).toContain(UserRole.KITCHEN_STAFF);
      expect(roles).toContain(UserRole.DELIVERY_PARTNER);
      expect(roles).toContain(UserRole.ADMIN);
      expect(roles).toContain(UserRole.SUPER_ADMIN);
      expect(roles).toContain(UserRole.SUPPORT_STAFF);
      expect(roles).toContain(UserRole.FINANCE_STAFF);
    });

    it('has all expected statuses defined', () => {
      const statuses = Object.values(UserStatus);
      expect(statuses).toContain('active');
      expect(statuses).toContain('inactive');
      expect(statuses).toContain('suspended');
    });
  });
});