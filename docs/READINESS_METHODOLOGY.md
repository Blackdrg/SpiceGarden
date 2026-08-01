# Readiness Methodology Definition

**Date:** 2026-08-01
**Purpose:** Establish a single authoritative definition of "readiness" for the SpiceGarden platform to resolve the contradiction between 100% (self-certification), 87% (engineering completion), and 95% (commercial/launch readiness).

## Three Distinct Readiness Metrics

SpiceGarden tracks three independent readiness metrics. They are NOT interchangeable and must never be combined into a single headline number.

### 1. Engineering Completion %

**Definition:** The percentage of engineering-scoped deliverables from the audit checklist that have been implemented, verified by automated test evidence, and merged into the main branch.

**Scope:** Code changes, dependency updates, security fixes, test coverage, CI/CD, infrastructure-as-code, observability, and architectural completeness.

**Methodology:**
- Each audit phase contains a fixed number of "Applicable Items" (checklist items scoped to engineering).
- "Implemented" = code is present, builds, and is covered by passing tests.
- Score = Σ(Implemented) / Σ(Applicable Items) × 100, computed per-phase then weighted by phase size.
- **This is the ONLY metric that produces an engineering completion percentage.** It is never called "production readiness."

**Evidence:** Build logs, test output, lint output, type-check output, CI pipeline status.

**Owner:** Engineering team.

### 2. Commercial / Launch Readiness %

**Definition:** Whether all customer-facing features required for a commercial launch are present and functional.

**Scope:** Payment gateway integration, restaurant onboarding, driver onboarding, customer onboarding, notifications, legal document endpoints, SEO/meta tags.

**Methodology:**
- Pass/fail gates per category (see Section 25 of audit reports).
- Score = 95% if all categories PASS and no critical commercial blocker remains.
- **This metric answers "Can we charge customers?" — not "Is the system operationally ready for production traffic?"**

**Evidence:** Feature checklists, payment gateway test results, end-to-end user flow verification.

**Owner:** Product + Engineering.

### 3. Production Readiness

**Definition:** Whether the system can safely operate in production with acceptable risk across security, reliability, observability, and operational maturity.

**Scope:** Independent security assessment, disaster-recovery verification, on-call coverage, alerting, distributed tracing, compliance certifications (PCI DSS, SOC 2, GDPR/CCPA), deployment strategy, SLOs.

**Methodology:**
- Binary per-category: Verified-True | Verified-False | Still-Not-Verified.
- **No overall percentage is published until Sections 1–2 of the meta-audit are fully closed with independent evidence.**
- Items requiring third-party (QSA, auditor, pen-test vendor) cannot be self-certified.

**Evidence:** Third-party audit reports, independent pen-test results, DR drill logs, runbook exercise records, alerting screenshots from production.

**Owner:** Security, SRE, DevOps, Legal/Compliance.

## Rules for Reporting

1. **Never blend metrics.** A statement like "100% production ready" that conflates engineering completion with operational readiness is prohibited.
2. **Every number must be reproducible.** If a command or log cannot be attached, report the item as "unverified" — never round or estimate.
3. **Self-assessment documents must be clearly labeled.** Any report authored within this repository that makes a readiness or security claim must carry the header: "SELF-ASSESSMENT — NOT INDEPENDENTLY VERIFIED. See [methodology reference] for metric definitions."
4. **Interim status reports use plain language.** Example: "3 of 9 Section 2 items closed; evidence attached." Never roll up into a single percentage.
