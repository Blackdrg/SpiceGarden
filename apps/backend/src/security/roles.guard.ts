import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, UserStatus } from '../shared/domain/user.interface';

type RequestUser = {
  role?: UserRole | string;
  status?: UserStatus | string;
  permissions?: string[];
};

const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.CUSTOMER]: ['orders:read_own', 'orders:create', 'wallet:read_own', 'wallet:transact_own'],
  [UserRole.RESTAURANT]: ['restaurants:manage_own', 'orders:manage_assigned', 'kitchen:manage_own', 'menus:manage_own'],
  [UserRole.KITCHEN_STAFF]: ['kitchen:manage_own', 'orders:read_assigned'],
  [UserRole.DELIVERY_PARTNER]: ['deliveries:manage_assigned', 'orders:read_assigned'],
  [UserRole.ADMIN]: ['users:manage', 'restaurants:manage', 'orders:manage', 'payments:manage', 'support:manage', 'analytics:read'],
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.SUPPORT_STAFF]: ['support:manage', 'orders:read'],
  [UserRole.FINANCE_STAFF]: ['finance:read', 'payments:read', 'refunds:read'],
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;

    if (!user) {
      throw new ForbiddenException('Authentication is required');
    }

    if (user.status && user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('User account is not active');
    }

    if (!user.role) {
      throw new ForbiddenException('User role is required');
    }

    const role = this.normalizeRole(user.role);
    if (!role) {
      throw new ForbiddenException('Invalid user role');
    }

    const hasRequiredRole = requiredRoles.map(this.normalizeRole).includes(role);
    if (!hasRequiredRole) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }

  hasPermission(role: UserRole | string, permission: string): boolean {
    const normalizedRole = this.normalizeRole(role);
    if (!normalizedRole) {
      return false;
    }

    const permissions = rolePermissions[normalizedRole] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }

  private normalizeRole(role: UserRole | string): UserRole | undefined {
    const normalized = String(role).toLowerCase();
    return Object.values(UserRole).find((value) => value === normalized);
  }
}
