import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, UserStatus } from '../shared/domain/user.interface';
import { hasRolePermission, normalizeUserRole } from './permissions';

type RequestUser = {
  role?: UserRole | string;
  status?: UserStatus | string;
  permissions?: string[];
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndMerge<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
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

    if (role === UserRole.SUPER_ADMIN) {
      return true;
    }

    const hasEveryPermission = requiredPermissions.every((permission) =>
      hasRolePermission(role, permission, user.permissions),
    );

    if (!hasEveryPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
