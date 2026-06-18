# CURRENT_SECURITY_REPORT.md

**Generated:** 2026-06-18

## Security Audit Results

### npm audit Summary

```
npm audit --audit-level=high - PASSED (0 high, 0 critical)
npm audit - Exit code 1; 31 moderate findings remain
```

High/critical audit gate passes. Moderate advisories remain and require dependency upgrade or documented risk acceptance.

### Security Controls Implemented

| Control | Status | Location |
| :--- | :--- | :--- |
| Helmet headers | ✅ Active | `main.ts:172` |
| NoSQL sanitization | ✅ Active | `main.ts:172` |
| HTTP Parameter Pollution guard | ✅ Active | `main.ts:173` |
| Rate limiting | ✅ Active | `main.ts:97-102` |
| CORS validation | ✅ Active | `main.ts:164-169` |
| Body size limit | ✅ Active | `main.ts:176-177` |
| JWT authentication | ✅ Active | `services/auth/` |
| Session management | ✅ Active | `SessionEntity` |
| Input validation | ✅ Active | `ValidationPipe` |
| Sentry error tracking | ✅ Conditional | `main.ts:112-124` |

### Rate Limiting Configuration

| Route | Window | Max Requests | Source |
| :--- | :---: | :---: | :--- |
| `/auth/otp` | 10 min | 3 | `main.ts:98` |
| `/auth/` | 15 min | 5 | `main.ts:99` |
| `/api/orders` | 15 min | 10 | `main.ts:100` |
| `/api/` | 15 min | 100 | `main.ts:101` |

### Redis Rate Limit Store

Location: `security/redis-rate-limit.store.ts`

- Uses Redis with memory fallback capability
- Configurable via `RATE_LIMIT_REDIS_REQUIRED` env var
- Namespace prefix: `spicegarden:{namespace}`
- IP-based rate limiting with X-Forwarded-For support

### Authentication Guard

Location: `security/jwt-auth.guard.ts`

- Passport JWT strategy
- Validates JWT tokens
- Extracts user from request

### Roles Guard (RBAC)

Location: `security/roles.guard.ts`

⚠️ **Status: Placeholder implementation** - needs enhancement for production RBAC

### CORS Origin Validation

Location: `security/cors-origin.ts`

```ts
export function getAllowedOrigins(): string[] {
  const origins = process.env.CORS_ALLOWED_ORIGINS || '';
  return origins ? origins.split(',').map(o => o.trim()) : [];
}
```

### Security Test Status

```
node infra/scripts/security-tests.js - PASSED
node infra/scripts/penetration-tests.js - NOT RERUN in this pass
```

The local runtime security script passed with 0 vulnerabilities and 95/100 rate-limited responses. Redis-backed execution was not locally verified because Redis was unavailable; the backend used process-local fallback.

### Tests Added

| Test File | Tests | Purpose |
| :--- | :---: | :--- |
| encryption.service.spec.ts | 8 | AES encryption, PII field handling |
| notification.service.spec.ts | 11 | Push, SMS, Email notification flows |

## Security Recommendations

1. **CVE Remediation**: Update `@opentelemetry/core` to >=2.8.0
2. **Multer**: Consider alternative upload library or validate field names
3. **UUID**: Update to uuid@11+ for buffer bounds check fix
4. **Roles Guard**: Implement production RBAC logic
5. **Security Headers**: Verify all required headers in penetration tests