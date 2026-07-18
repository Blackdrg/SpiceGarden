# OWASP Top 10 (2021) Compliance Checklist

**Version:** 1.0.0
**Scope:** SpiceGarden backend + web/mobile clients
**Evidence:** `infra/scripts/security-tests.js`, `security-validation.spec.ts`, `csrf.middleware.spec.ts`, `cors-origin.spec.ts`

| # | Risk | Status | Control / Evidence |
|---|------|--------|-------------------|
| A01 | Broken Access Control | ✅ Mitigated | RBAC + PermissionGuard; 403 tests in `security-guards.spec.ts`, `rbac-coverage.spec.ts` |
| A02 | Cryptographic Failures | ✅ Mitigated | AES-256-GCM at rest, TLS 1.2+ in transit; `encryption.service.spec.ts` |
| A03 | Injection | ✅ Mitigated | Parameterized TypeORM; 0 issues in SQL-injection suite |
| A04 | Insecure Design | ✅ Mitigated | Threat model; rate limits; idempotency (`idempotency.service.ts`) |
| A05 | Security Misconfiguration | ✅ Mitigated | Helmet, HPP, no default creds; Swagger off in prod |
| A06 | Vulnerable & Outdated Components | ✅ Mitigated | npm audit + Snyk + Trivy gated in CI |
| A07 | Identification & Auth Failures | ✅ Mitigated | MFA, lockout, Argon2; `auth.*.spec.ts` |
| A08 | Software & Data Integrity Failures | ✅ Mitigated | Signed artifacts, CI gates, integrity scan (`integrity.service.ts`) |
| A09 | Security Logging & Monitoring Failures | ✅ Mitigated | Centralized logs, audit trail, Alertmanager |
| A10 | SSRF | ✅ Mitigated | Egress controls on webhook fetch; URL allow-list |

**Open items:** None blocking. See `SECURITY.md` §Known Issues.
