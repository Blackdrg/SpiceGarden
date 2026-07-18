# Security Whitepaper

**Version:** 1.0.0
**Classification:** Public (investor / due-diligence)

## Executive Summary
SpiceGarden is a multi-tenant food-delivery platform engineered with defense-in-depth. Security is enforced at the edge (Helmet CSP/HSTS, CORS allow-list, Throttler rate limiting), in transit (TLS 1.2+), at rest (AES-256-GCM), and at the application layer (RBAC + fine-grained permissions, MFA, parameterized data access, and a full compliance/legal subsystem covering GDPR, CCPA, and India's DPDP Act 2023).

## Architecture
- **Edge:** NestJS `main.ts` applies Helmet, HPP, express-mongo-sanitize, CSRF, CORS allow-list, and global Throttler.
- **Identity:** JWT auth + RBAC + permission guards; Argon2id password hashing; TOTP MFA for admins; account lockout.
- **Data:** PostgreSQL (TypeORM, parameterized), MongoDB (audit/events), Redis (cache/queues). No card data at rest.
- **Secrets:** `./secrets/` (gitignored) or Vault (`vault.service.ts`); rotated per Encryption & Key Rotation Policy.
- **Compliance:** Dedicated `legal` module — consent, cookie consent, DPDP grievances, data-subject requests (access/delete/correct/port), retention jobs, legal document versioning, and a compliance audit trail.

## Threat Model
Maintained as `docs/security/threat-model.json` (trust zones, data flows, rated threats). Drives the SDLC and the OWASP checklist (`owasp-checklist.md`).

## Verification
- Security test suite: 0 SQLi / XSS / auth-bypass / path-traversal issues; 96/100 rate-limited responses.
- Penetration suite: 0 issues across port scan, headers, CORS, HTTP methods.
- CI gates: Snyk + npm audit (high/critical) + Trivy image scan.
- Unit/integration/e2e: 1273 / 9 / 35 respectively, all passing.

## Compliance Posture
- **GDPR / CCPA:** lawful bases, DPA-ready, data-subject rights via Privacy Dashboard.
- **DPDP Act 2023:** Data Fiduciary role, Grievance Officer + Consent Manager, breach reporting path.
- **PCI-DSS:** scope reduced — tokenized Stripe/Razorpay; no PAN storage.
- **SOC 2 / ISO 27001:** control mappings in `security-audit-guide.md`.

## Roadmap
- Live k6 at 10k+ (staging) and a scheduled Playwright browser job in CI (see PRODUCTION_CERTIFICATION_REPORT.md §Remaining Risks).
- FIPS 140-2 module evaluation for encryption at rest (optional, enterprise).
