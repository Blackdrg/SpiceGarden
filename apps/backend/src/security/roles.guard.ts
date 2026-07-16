import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, UserStatus } from '../shared/domain/user.interface';
import { hasRolePermission, normalizeUserRole, rolePermissions } from './permissions';

type RequestUser = {
  role?: UserRole | string;
  status?: UserStatus | string;
  permissions?: string[];
};

export { rolePermissions };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;

    if (!user) {
      throw new ForbiddenException('Authentication is required');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('User account is not active');
    }

    if (!user.role) {
      throw new ForbiddenException('User role is required');
    }

    const role = normalizeUserRole(user.role);
    if (!role) {
      throw new ForbiddenException('Invalid user role');
    }

    const hasRequiredRole = requiredRoles.map(normalizeUserRole).includes(role);
    if (!hasRequiredRole) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }

  hasPermission(role: UserRole | string, permission: string, userPermissions: string[] = []): boolean {
    return hasRolePermission(role, permission, userPermissions);
  }
}
