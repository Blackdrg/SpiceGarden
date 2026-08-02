# Acceptable Use Policy

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.  
**Backend reference:** `apps/backend/src/legal/entities/legal.enums.ts:18` (`LegalDocumentType.ACCEPTABLE_USE_POLICY`), `apps/backend/src/legal/legal-seed.service.ts:293-302`.

---

## 1. Permitted Use

You may use the SpiceGarden platform for its intended purpose: discovering, ordering, and receiving food and other goods from participating restaurants and delivery partners.

## 2. Prohibited Activities

You agree not to:

### 2.1 Scraping and Data Harvesting
- Scrape, harvest, or collect user data, content, or information using automated means
- Use bots, crawlers, or similar tools to access the platform
- Bypass rate limits or access controls

### 2.2 Circumvention
- Circumvent, disable, or interfere with the operation of the platform or security features
- Attempt to gain unauthorized access to accounts, systems, or networks
- Use the platform to distribute malware or other harmful code

### 2.3 Fraud and Abuse
- Submit fraudulent, false, or misleading information
- Manipulate ratings, reviews, or order data
- Engage in fraudulent payment activities
- Abuse promotions, referral programs, or discounts

### 2.4 Intellectual Property Violations
- Infringe copyrights, trademarks, patents, or other intellectual property rights
- Use SpiceGarden's marks without authorization

### 2.5 Safety Violations
- Order items for illegal or harmful purposes
- Request delivery to unsafe or restricted locations
- Engage in behavior that endangers delivery partners or restaurant staff

## 3. Enforcement

Violations of this policy may result in:
- **Throttling:** Temporary reduction in API access or order capacity
- **Suspension:** Temporary account suspension
- **Termination:** Permanent account termination
- **Referral to authorities:** For criminal or serious violations

## 4. Security Monitoring

We monitor platform activity for security violations. Automated systems detect:
- Unusual order patterns
- Rate limit violations
- Suspicious account activity

**Backend references:**
- Rate limiting: `apps/backend/src/security/rate-limiter.middleware.ts:1-45` — rate limiter middleware.
- Security monitoring: `apps/backend/src/legal/security-center.service.ts` — security monitoring.
- Audit logging: `apps/backend/src/security/audit-log.middleware.ts` (if exists) — audit trail.

## 5. Reporting Violations

Report violations through:
- In-app: Profile → Help → Report an Issue
- Email: abuse@spicegarden.com
- Security: security@spicegarden.com (for security vulnerabilities)

---

*This document is a DRAFT. For questions, contact abuse@spicegarden.com.*
