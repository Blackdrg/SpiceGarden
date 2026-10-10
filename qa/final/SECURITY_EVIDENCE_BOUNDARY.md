# SPICEGARDEN — SECURITY EVIDENCE BOUNDARY

## 1. Internal Automated vs External Third-Party Testing

To maintain uncompromising honesty and defensibility during buyer due diligence, this document defines the exact boundary of security verification:

### In-Scope & Verified (Internal Automated Testing)
* **Codebase Static Analysis**: ESLint security plugins, strict TypeScript checks, dependency vulnerability scanning.
* **Automated Penetration Scripts**: `infra/scripts/security-tests.js` and `infra/scripts/penetration-tests.js` (testing SQLi, XSS, rate limiting, path traversal, auth bypass, port scanning, security headers, CORS).
* **Cryptographic Validation**: Password hashing (Argon2 / bcrypt), JWT verification, AES-256 vault encryption, HMAC SHA256 webhook validation.

### Out-of-Scope / External Prerequisite (Third-Party Pentest)
* **Third-Party CREST / SOC2 Type II Penetration Testing**: `NOT_EXECUTED` (Requires independent certified auditing firm on deployed staging/production infrastructure).
* **Red Team Physical Attack Simulation**: `NOT_EXECUTED`.

---

## 2. Classification Status
* **Automated Internal Security Assessment**: `PROVEN_AUTOMATED`
* **External Third-Party Penetration Audit**: `NOT_EXECUTED` (External prerequisite)
