# SpiceGarden Legal & Compliance Platform

This document is the canonical index for SpiceGarden's enterprise legal, privacy, and
compliance platform. It covers the Global Legal Center, GDPR, the Indian DPDP Act 2023,
PCI DSS, merchant/driver agreements, the Security Center, data retention, the user
Privacy Dashboard, the Admin Compliance Dashboard, the REST API surface, and the
auditability/integrity guarantees that make the system production-certifiable.

All compliance features are implemented in the backend `LegalModule` (`apps/backend/src/legal`)
and surfaced through every frontend (customer-web, super-admin, restaurant-dashboard,
delivery-partner). There are no placeholder pages, no TODOs, and no mock policy content:
every legal document is versioned, effective-dated, audit-logged, and tamper-evident.

## Document Map

| Part | Document |
|------|----------|
| 1 | Global Legal Center |
| 2 | Privacy Policy (GDPR / CCPA / DPDP) |
| 3 | Cookie Consent Platform |
| 4 | GDPR Data Subject Rights |
| 5 | Indian DPDP Act 2023 |
| 6 | PCI DSS |
| 7 | Merchant Agreements |
| 8 | Driver Agreements |
| 9 | Security Center |
| 10 | Data Retention |
| 11 | User Privacy Dashboard |
| 12 | Admin Compliance Dashboard |
| 13 | REST API |
| 14 | Database Entities |
| 15 | Notifications |
| 16 | Security / Integrity |
| 17 | Frontend UIs |
| 18 | Testing (95%+ target) |
| 19 | Documentation |
| 20 | Final Validation |

See the individual files in this directory:
- `architecture.md` — system & data-flow architecture
- `API.md` — REST endpoint reference (auth, DTOs, RBAC, pagination)
- `compliance.md` — GDPR / DPDP / PCI controls mapping
- `developer-guide.md` — how to extend policies, agreements, retention
- `admin-guide.md` — operating the compliance dashboard
- `user-guide.md` — exercising privacy rights as an end user
- `deployment.md` — environment configuration & secrets
- `COMPLIANCE_READINESS_REPORT.md` — certification status & residual risk

## Core Guarantees

1. **Versioning** — every document/agreement has immutable versions with effective dates,
   change notes, approval workflow, and rollback.
2. **Multi-language** — documents support per-language versions (default `en`).
3. **Immutability** — compliance audit records are signed (HMAC) and scanned for
   tampering; verified via `ComplianceAuditService.scanForTampering`.
4. **Lawful basis** — the privacy policy enumerates purpose, legal basis, retention,
   international transfers, and children's privacy per GDPR Art. 6/13/14, CCPA, and DPDP.
5. **Right to portability** — data export in JSON / CSV / PDF, streamed securely.
6. **Consent management** — granular, geo-aware (EU GDPR / India DPDP), withdrawable,
   with a full consent ledger.
