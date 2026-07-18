# Password & MFA Policy

**Version:** 1.0.0
**Owner:** Identity & Access Management

## 1. Password Requirements (implemented)
- Minimum length and complexity enforced in `apps/backend/src/services/auth/password*` and `password-reset.service.ts`.
- Argon2id / bcrypt hashing (see `encryption.service.ts`).
- Account lockout after repeated failures (rate-limited via Throttler).
- Breached-password check on reset.

## 2. Multi-Factor Authentication (MFA)
- TOTP-based MFA implemented: `apps/backend/src/services/auth/mfa.service.ts`, `mfa.controller.ts`, `mfa.entity.ts`.
- Enforced for administrative roles (SUPER_ADMIN, ADMIN) via `PermissionGuard` + role checks.
- Backup codes issued on enrollment; re-enrollment requires re-verification.

## 3. Lifecycle
- Password reset is tokenized, single-use, short TTL.
- MFA device binding stored in `mfa.entity`; revocation supported.
- Credential changes require active session + MFA step-up.

## 4. Prohibitions
- No password reuse of last 5 hashes.
- No plaintext storage (verified by `security-validation.spec.ts`).
