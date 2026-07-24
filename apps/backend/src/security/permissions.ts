import { UserRole } from '../shared/domain/user.interface';

export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.CUSTOMER]: ['orders:read_own', 'orders:create', 'wallet:read_own', 'wallet:transact_own'],
  [UserRole.RESTAURANT]: ['restaurants:manage_own', 'orders:manage_assigned', 'kitchen:manage_own', 'menus:manage_own'],
  [UserRole.KITCHEN_STAFF]: ['kitchen:manage_own', 'orders:read_assigned'],
  [UserRole.DELIVERY_PARTNER]: ['deliveries:manage_assigned', 'orders:read_assigned'],
  [UserRole.DRIVER]: ['deliveries:manage_assigned', 'orders:read_assigned', 'risk:read_own'],
  [UserRole.ADMIN]: ['users:manage', 'restaurants:manage', 'orders:manage', 'payments:manage', 'support:manage', 'analytics:read', 'finance:read', 'notifications:manage', 'compliance:read'],
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.SUPPORT_STAFF]: ['support:manage', 'orders:read'],
  [UserRole.FINANCE_STAFF]: ['finance:read', 'payments:read', 'refunds:read'],
};

export function normalizeUserRole(role: UserRole | string): UserRole | undefined {
  const normalized = String(role).toLowerCase();
  return Object.values(UserRole).find((value) => value === normalized);
}

export function hasRolePermission(role: UserRole | string, permission: string, userPermissions: string[] = []): boolean {
  const normalizedRole = normalizeUserRole(role);
  if (!normalizedRole) {
    return false;
  }

  const permissions = userPermissions.length > 0 ? userPermissions : rolePermissions[normalizedRole] || [];
  return permissions.includes('*') || permissions.includes(permission);
}
