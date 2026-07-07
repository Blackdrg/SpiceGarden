import { UserRole } from '../shared/domain/user.interface';
export declare const rolePermissions: Record<UserRole, string[]>;
export declare function normalizeUserRole(role: UserRole | string): UserRole | undefined;
export declare function hasRolePermission(role: UserRole | string, permission: string, userPermissions?: string[]): boolean;
