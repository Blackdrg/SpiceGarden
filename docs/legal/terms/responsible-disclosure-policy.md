# Responsible Disclosure Policy

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.  
**Backend reference:** `apps/backend/src/legal/entities/legal.enums.ts:15` (`LegalDocumentType.RESPONSIBLE_DISCLOSURE`), `apps/backend/src/legal/legal-seed.service.ts:261-269`.

---

## 1. Reporting Vulnerabilities

We encourage responsible security researchers to report vulnerabilities they discover in the SpiceGarden platform. To report a vulnerability:

**Email:** security@spicegarden.com  
**PGP key:** Available at `apps/backend/src/legal/security-center.service.ts:45-60`  
**Subject:** [SECURITY] Vulnerability Report

Please include:
- Description of the vulnerability
- Steps to reproduce
- Affected components/endpoints
- Potential impact
- Proof of concept (if available)
- Your contact information (for follow-up questions)

## 2. Scope

This policy applies to:
- Web applications (customer-web, super-admin, restaurant-dashboard)
- Mobile applications (customer-mobile, delivery-partner)
- API endpoints (backend services)
- Infrastructure (servers, databases, networks)

Out of scope:
- Issues in third-party services not managed by SpiceGarden
- Social engineering of SpiceGarden employees
- Physical security issues
- Denial of service attacks (do not test)

## 3. Coordinated Disclosure

When we receive a vulnerability report:
1. **Acknowledgement:** Within 24 hours
2. **Triage:** Initial assessment within 72 hours
3. **Investigation:** Deep analysis and reproduction within 7 days
4. **Remediation:** Patch development and testing
5. **Disclosure:** Public disclosure only after a fix is deployed

## 4. Embargo Period

We request a coordinated disclosure embargo of 90 days from the initial report date. If a fix cannot be deployed within 90 days, we will work with the researcher to extend the embargo or adjust the disclosure timeline.

## 5. Bounty Program

We do not currently offer a bug bounty program. However, we recognize and thank researchers who responsibly disclose vulnerabilities in our security advisories.

## 6. Safe Harbor

Good-faith researchers who comply with this policy will not face:
- Legal action for security research conducted in good faith
- Account termination for testing activities within scope
- Prosecution for accessing our systems as part of responsible disclosure

We will not consider activities conducted in accordance with this policy to be a breach of contract or computer misuse.

## 7. Contact

For security-related matters: security@spicegarden.com

**Backend references:**
- Security center service: `apps/backend/src/legal/security-center.service.ts:74` — vulnerability management and SLAs.
- Security tests: `infra/scripts/security-tests.js` — automated security tests (SQL injection, XSS, rate limiting, auth bypass, path traversal).
- Penetration tests: `infra/scripts/penetration-tests.js` — port scan, security headers, CORS, HTTP methods testing.

---

*This document is a DRAFT. For security inquiries, contact security@spicegarden.com.*
