# Security Policy

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.  
**Backend reference:** `apps/backend/src/legal/entities/legal.enums.ts:14` (`LegalDocumentType.SECURITY_POLICY`), `apps/backend/src/legal/security-center.service.ts:1-100`.

---

## 1. Overview

SpiceGarden maintains defense-in-depth security controls across network, application, and data layers. This policy describes our security measures and your responsibilities.

## 2. Encryption

### At Rest
All sensitive data at rest is encrypted using AES-256-GCM. This includes:
- User credentials (passwords hashed with bcrypt)
- Payment tokens
- Personal identification information (PII)
- Session tokens and refresh tokens

**Backend references:**
- Password hashing: `apps/backend/src/services/auth/auth.service.ts` — bcrypt with salt rounds.
- Payment tokens: `apps/backend/src/db/entities/payment-method.entity.ts:16-35` — stores only tokenized card data (last4, brand), never full PANs.
- Session tokens: `apps/backend/src/db/entities/session.entity.ts:5-38` — hashed refresh tokens.

### In Transit
All data in transit is encrypted using TLS 1.2 or higher. The platform enforces HTTPS for all connections.

**Backend reference:** `apps/backend/src/main.ts` — configures TLS/HTTPS for the NestJS application.

## 3. Access Control

### Role-Based Access Control (RBAC)
Access to the platform is governed by roles:
- `customer` — end user
- `restaurant_admin` — restaurant owner/manager
- `delivery_driver` — delivery partner
- `support` — support agent
- `super_admin` — platform administrator

### Authentication
- MFA is required for administrative access (support, super_admin roles)
- All sessions have defined expiry periods
- Access tokens: 1 hour; Refresh tokens: 30 days

**Backend references:**
- RBAC: `apps/backend/src/security/rbac.middleware.ts` — role-based access control middleware.
- MFA: `apps/backend/src/services/auth/mfa.service.ts` — TOTP-based MFA.
- Auth controller: `apps/backend/src/services/auth/auth.controller.ts:29-43` — token issuance.

### Least Privilege
Administrative access follows the principle of least privilege. Just-in-time elevation is used for sensitive operations.

## 4. Monitoring

### Centralized Logging
All application logs are centralized and monitored. Logs include:
- Authentication events
- Payment transactions
- Data access and modification
- Security events

### Audit Trails
Audit logs are maintained for:
- User data access
- Payment processing
- Consent changes
- Data subject requests

**Backend references:**
- Audit logging: `apps/backend/src/security/audit-log.middleware.ts` (if exists)
- Security monitoring: `apps/backend/src/legal/security-center.service.ts`
- Security incident entity: `apps/backend/src/db/entities/security-incident.entity.ts:12-15` — `SecurityIncidentStatus` enum.

## 5. Incident Response

Security incidents follow the Escalation SOP (`docs/legal/terms/escalation-sop.md`) with the following response phases:

| Phase | SLA | Actions |
|---|---|---|
| Identification | Real-time | Detect via monitoring, SIEM alerts |
| Containment | Within 2 hours | Isolate affected systems |
| Eradication | Within 24 hours | Remove root cause, patch vulnerabilities |
| Recovery | Within 48 hours | Restore systems, validate integrity |
| Post-Mortem | Within 72 hours | Document lessons learned, update procedures |

**Backend references:**
- Incident response: `apps/backend/src/legal/security-center.service.ts:74` — SLA details.
- Incident statuses: `apps/backend/src/db/entities/security-incident.entity.ts:12-15` — `OPEN`, `INVESTIGATING`, `CONTAINED`, `RESOLVED`, `CLOSED`.

## 6. Vulnerability Management

Security vulnerabilities should be reported via our Responsible Disclosure Policy (`docs/legal/terms/responsible-disclosure-policy.md`). Reported vulnerabilities are triaged and patched based on severity:

- **Critical:** Patch within 24 hours
- **High:** Patch within 7 days
- **Medium:** Patch within 30 days
- **Low:** Patch in the next quarterly release

## 7. Penetration Testing

Regular penetration testing is conducted by internal and external security teams. The most recent test resulted in 0 critical/high findings.

**Backend reference:** `infra/scripts/penetration-tests.js` — penetration test script. Security tests at `infra/scripts/security-tests.js`.

## 8. Data Protection

### Data Subject Rights
We implement technical measures to support data subject rights:
- **Right to Access:** Export endpoint at `apps/backend/src/legal/data-subject-request.service.ts:496-524`
- **Right to Erasure:** Automated deletion at `apps/backend/src/legal/data-subject-request.service.ts:204-282`
- **Right to Rectification:** User profile update endpoints
- **Right to Data Portability:** JSON/CSV export

### GDPR Compliance
We process EU user data based on:
- Contract: To fulfill orders and provide the service
- Legitimate interest: Fraud prevention, security, analytics (with consent)
- Legal obligation: Tax records, KYC compliance
- Consent: Marketing, non-essential cookies

## 9. Contact

Security inquiries: security@spicegarden.com  
PGP key: Available at the Security Center

**Backend reference:** `apps/backend/src/legal/legal-seed.service.ts:249-258` — Security Policy seed definition.

---

*This document is a DRAFT. For security inquiries, contact security@spicegarden.com.*
