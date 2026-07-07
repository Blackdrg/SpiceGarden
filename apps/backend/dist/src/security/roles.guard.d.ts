import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../shared/domain/user.interface';
import { rolePermissions } from './permissions';
export { rolePermissions };
export declare class RolesGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
    hasPermission(role: UserRole | string, permission: string, userPermissions?: string[]): boolean;
}
