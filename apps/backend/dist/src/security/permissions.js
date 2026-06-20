"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolePermissions = void 0;
exports.normalizeUserRole = normalizeUserRole;
exports.hasRolePermission = hasRolePermission;
const user_interface_1 = require("../shared/domain/user.interface");
exports.rolePermissions = {
    [user_interface_1.UserRole.CUSTOMER]: ['orders:read_own', 'orders:create', 'wallet:read_own', 'wallet:transact_own'],
    [user_interface_1.UserRole.RESTAURANT]: ['restaurants:manage_own', 'orders:manage_assigned', 'kitchen:manage_own', 'menus:manage_own'],
    [user_interface_1.UserRole.KITCHEN_STAFF]: ['kitchen:manage_own', 'orders:read_assigned'],
    [user_interface_1.UserRole.DELIVERY_PARTNER]: ['deliveries:manage_assigned', 'orders:read_assigned'],
    [user_interface_1.UserRole.ADMIN]: ['users:manage', 'restaurants:manage', 'orders:manage', 'payments:manage', 'support:manage', 'analytics:read', 'finance:read', 'notifications:manage', 'compliance:read'],
    [user_interface_1.UserRole.SUPER_ADMIN]: ['*'],
    [user_interface_1.UserRole.SUPPORT_STAFF]: ['support:manage', 'orders:read'],
    [user_interface_1.UserRole.FINANCE_STAFF]: ['finance:read', 'payments:read', 'refunds:read'],
};
function normalizeUserRole(role) {
    const normalized = String(role).toLowerCase();
    return Object.values(user_interface_1.UserRole).find((value) => value === normalized);
}
function hasRolePermission(role, permission, userPermissions = []) {
    const normalizedRole = normalizeUserRole(role);
    if (!normalizedRole) {
        return false;
    }
    const permissions = userPermissions.length > 0 ? userPermissions : exports.rolePermissions[normalizedRole] || [];
    return permissions.includes('*') || permissions.includes(permission);
}
