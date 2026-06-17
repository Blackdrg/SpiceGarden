# Security Audit Report

Generated: 2026-06-17T21:30+05:30  
Evidence: backend security modules, controllers, compose files, `npm audit --json`, security test report, source scans.

## Audit Summary

| Finding | Severity | Evidence |
| :--- | :--- | :--- |
| Multiple operational controllers lack auth guards | High | Guard scan found 41 controller files and 106 endpoints without guard evidence |
| Refresh token is returned but not persisted or validated | High | `auth.service.ts` returns refresh token; `SessionEntity` stores refresh token but service does not set it |
| Payment/fraud limits are simplified placeholders | High | `payments.service.ts` lines 104-136 use fixed thresholds and placeholder logic |
| Development compose includes hardcoded credentials | Medium | `compose.dev.yaml` contains hardcoded Postgres/Grafana credentials |
| Rate limiting can fall back to memory in production | Medium | `main.ts` uses memory store unless `RATE_LIMIT_REDIS_REQUIRED` is true |
| Vault is disabled by default | Medium | `vault.service.ts` defaults `VAULT_ENABLED` to `false` |
| Database logging and synchronization are enabled | Medium | `db.module.ts` sets `synchronize: true` and `logging: true` |
| Dependency audit has moderate vulnerabilities | Medium | `npm audit --json` reported 51 moderate vulnerabilities, 0 high, 0 critical |
| Existing security vulnerability script passed | Low | `SECURITY_AUDIT_V2.md` reports 0 vulnerabilities and 0 issues |

## Auth and Session Evidence

- `apps/backend/src/services/auth/auth.service.ts` creates refresh tokens.
- `apps/backend/src/db/entities/session.entity.ts` includes a `refreshToken` column.
- The auth service does not set the refresh token on the session entity in the inspected code.
- `apps/backend/src/security/jwt-auth.guard.ts`, `roles.guard.ts`, and `roles.decorator.ts` exist and are used by some controllers.

## Rate Limiting Evidence

- `apps/backend/src/security/security.module.ts` configures `ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])`.
- `apps/backend/src/services/auth/auth.controller.ts` applies `@UseGuards(ThrottlerGuard)`.
- `apps/backend/src/security/redis-rate-limit.store.ts` provides a Redis-backed store.
- `apps/backend/src/main.ts` falls back to memory store unless `RATE_LIMIT_REDIS_REQUIRED` is true.

## CORS Evidence

- `apps/backend/src/security/cors-origin.ts` rejects wildcard origins.
- It normalizes `CORS_ALLOWED_ORIGINS` from environment configuration.

## Dependency Audit Evidence

`npm audit --json` result:

| Severity | Count |
| :--- | ---: |
| Critical | 0 |
| High | 0 |
| Moderate | 51 |
| Low | 0 |

## Security Readiness

- Core auth, JWT, roles, CORS, encryption, and rate-limit modules exist.
- Runtime security is not uniform across controllers.
- Payment flow hardening and session refresh-token persistence require follow-up.
- Dependency audit has no high/critical findings in this session.
