# Access Control & Least Privilege Policy

**Version:** 1.0.0
**Owner:** Security Engineering

## 1. Model
Role-Based Access Control (RBAC) with fine-grained permissions.
- Roles: `customer`, `restaurant`/`merchant`, `driver`, `support_staff`, `admin`, `super_admin`.
- Guards: `JwtAuthGuard` → `RolesGuard` → `PermissionGuard`.
- Permission catalog in `apps/backend/src/security/permissions.*`.

## 2. Least Privilege
- Services receive only the DB repositories and downstream clients they need (see `db-repositories.module.ts`).
- Admins use just-in-time elevation; routine ops use scoped tokens.
- Background workers (BullMQ) use least-privilege queue roles.

## 3. Default-Deny
- Unknown routes return 404; unauthenticated protected routes 401; unauthorized 403.
- CORS is a strict allow-list (`security/cors-origin.ts`).
- Swagger/OpenAPI disabled in production (`SWAGGER_ENABLED` default false).

## 4. Review
- Quarterly access review; stale accounts disabled.
- All privilege changes recorded in `compliance_audits`.
