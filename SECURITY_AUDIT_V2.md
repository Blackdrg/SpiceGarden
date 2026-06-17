# Security Audit V2

Generated: 2026-06-17T11:50+05:30  
Branch: `feat/add-react-doctor`

## Executive summary

Runtime security validation passes after rate-limit hardening. Dependency audit still reports moderate vulnerabilities.

| Audit area | Result |
| :--- | :--- |
| SQL injection checks | Secure, 0 issues |
| XSS checks | Secure, 0 issues |
| Rate limiting | Secure, 96/100 rate-limited responses |
| Auth bypass checks | Secure, 0 issues |
| Path traversal checks | Secure, 0 issues |
| Total runtime vulnerabilities | 0 |
| npm critical vulnerabilities | 0 |
| npm high vulnerabilities | 0 |
| npm moderate vulnerabilities | 51 |

Evidence: `reports/verification/security-tests-after-rate-limit.log`, `reports/verification/npm-audit-after-p0-fixes.json`.

## Runtime security improvements

- Added Redis-capable rate-limit store.
- Added layered route-specific limits for OTP, auth, orders, and general API.
- Added route/method/IP keying.
- Disabled trust proxy by default unless explicitly configured.
- Retained Helmet, HPP, CORS allowlist, mongo sanitization, body limits, dangerous-method rejection, and validation pipe.

## Dependency audit summary

| Severity | Count |
| :--- | :---: |
| info | 0 |
| low | 0 |
| moderate | 51 |
| high | 0 |
| critical | 0 |

## Caveats

- Redis-backed rate limiting was not locally verified because Redis was unavailable.
- Penetration tests require a running backend and were not completed in this pass.
- Load testing fails before producing capacity metrics.
- Docker, Kubernetes, and monitoring validation remain uncompleted.

## Current status

Runtime security P0 is addressed. Full security readiness remains gated by Redis-backed verification, penetration testing, load testing, and infrastructure validation.
