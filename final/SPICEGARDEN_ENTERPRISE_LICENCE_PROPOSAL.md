# COMMERCIAL PROPOSAL: ENTERPRISE SOFTWARE LICENCE

**Proposal Title:** SpiceGarden Enterprise Food-Delivery & Logistics Platform Commercial Licence  
**Document Reference:** `SPICE-PROP-2026-001`  
**Version:** `1.0.0`  
**Date:** 2026-09-30  
**Status:** `READY FOR PRESENTATION`  
**Prepared By:** Daksh Mehta / SpiceGarden Commercialization Team  
**Confidentiality:** `CONFIDENTIAL — COMMERCIAL PROPOSAL`  

---

## 1. Executive Summary

SpiceGarden offers an enterprise-grade, turnkey software platform for modern multi-restaurant food ordering, dark-kitchen management, hyper-local courier dispatching, and double-entry financial settlement. This proposal outlines the commercial and technical terms for licensing the **SpiceGarden v1.0.0-rc1** enterprise platform for dedicated deployment within your designated market territory.

---

## 2. Product Overview

SpiceGarden comprises an integrated 12-workspace monorepo containing:
* **Customer Channels:** High-performance responsive Customer Web SSR (Next.js) and cross-platform Customer Mobile Apps (React Native / Expo iOS & Android).
* **Merchant Operations:** Dedicated Kitchen Display System (KDS) and Restaurant Management Web Portal (Next.js) for live order acceptance, menu engineering, and revenue reporting.
* **Driver Logistics:** Delivery Partner Mobile Application (React Native / Expo) with automated dispatch ingestion, GPS navigation, and shift accounting.
* **Administrative Governance:** Super Admin Control Center (Next.js) for platform commission billing, fraud prevention, driver onboarding, and financial ledger auditing.
* **Core Engine:** High-concurrency NestJS backend, BullMQ distributed queues, Socket.IO real-time event gateway, and PostgreSQL/Redis storage architecture.

---

## 3. Current Release Identification

* **Authoritative Release Version:** `v1.0.0-rc1`
* **Git Baseline Commit:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`
* **Production Runtime:** `Node.js 22 LTS`
* **Integrity Ledger:** Cryptographically verified via `release-freeze/ARTIFACT_HASHES.sha256`.

---

## 4. Technical Qualification & Baseline Evidence

* **Codebase Verification:** 12/12 workspaces build cleanly; 12/12 workspaces lint-clean.
* **Backend Automated Testing:** 69 backend test suites (1,122 tests passed, 0 failed; >91% code coverage).
* **Frontend Verification:** 148 Chromium qualification tests passed across 44 routes in 6 client apps.
* **Peak Load Qualification:** Sustained 20,000 concurrent Virtual Users (k6) across 14 API replicas with 0.48% error rate, p95 latency of 1,120.5 ms, and event-loop delay of 36.8 ms.
* **Financial Data Consistency:** 47,910 persisted orders during load test with 100% debit/credit reconciliation parity.
* **Disaster Recovery:** Timed drill demonstrated RTO of 9m 30s (SLA target <= 15m) and RPO of 12m (SLA target <= 60m).
* **Licensing Profile:** Audited SBOM confirming 100% commercially permissive licenses (**zero copyleft/GPL libraries**).

---

## 5. Commercial Licence Model

We propose our **Tier A (Enterprise Non-Exclusive)** or **Tier B (Enterprise Exclusive)** licensing framework:
* **Grant:** Non-exclusive (Tier A) or Exclusive (Tier B) commercial licence to deploy and operate the software for your internal business operations.
* **Deployment Rights:** 1 Production Kubernetes cluster, 1 Staging environment, 1 Disaster Recovery environment.
* **Legal Nature:** Contractual software licence grant; Licensor retains 100% copyright ownership in the baseline software.

---

## 6. Scope of Delivery

* Pre-compiled, hardened Docker container images (`node:22-alpine` base).
* Production-ready Kubernetes manifests with Horizontal Pod Autoscaler (HPA: min 3, max 20 replicas).
* Next.js standalone web builds and React Native mobile source projects for application compilation.
* PostgreSQL database migrations, seed scripts, and TypeORM entity definitions.
* Complete technical documentation, API specifications, and operational runbooks.

---

## 7. Implementation & Onboarding Services

* **Timeline:** 4 to 6 weeks from contract execution.
* **Scope:** Cluster architecture sizing, Kubernetes secret deployment, DNS/TLS setup, merchant/driver onboarding scripts, and technical handover workshops.

---

## 8. Technical Support & SLA Commitments

* **Tier 1 Support SLA:** Guaranteed initial response times:
  - **P1 (Critical Outage):** < 30 minutes (24/7/365 emergency hotline).
  - **P2 (Major Feature Impaired):** < 2 hours (Business hours).
  - **P3 (Moderate Issue):** < 8 hours.
  - **P4 (Minor / Inquiry):** < 24 hours.
* **Maintenance:** Corrective bug fixes, security vulnerability patches, and minor version updates included.

---

## 9. Indicative Pricing & Commercial Investment

| Item | Tier A (Non-Exclusive) | Tier B (Territorial Exclusive) |
| :--- | :--- | :--- |
| **Upfront Base Licence Fee** | **₹75,00,000 (INR 75 Lakh)** | **₹1,50,00,000 (INR 1.50 Crore)** |
| **Implementation & Onboarding** | ₹12,00,000 | ₹18,00,000 |
| **Technical Staff Training (5 Days)**| ₹3,50,000 | Included |
| **Total Year 1 Initial Investment**| **₹90,50,000 (INR 90.5 Lakh)** | **₹1,68,00,000 (INR 1.68 Crore)** |
| **Annual Support & Maintenance (Yr 2+)** | **₹15,00,000/year (INR 15 Lakh/yr)** | **₹25,00,000/year (INR 25 Lakh/yr)** |

*(All taxes, GST, and cloud hosting fees are additional and payable by Licensee).*

---

## 10. Customer Responsibilities

* Provisioning target cloud infrastructure (AWS/GCP/Azure) and Kubernetes compute nodes.
* Establishing active commercial merchant accounts with Stripe and/or Razorpay.
* Providing Apple Developer and Google Play developer signing keys for mobile app store publication.
* Assigning designated technical points of contact for implementation coordination.

---

## 11. Acceptance Protocol

* 14-day formal acceptance window following release deployment.
* Acceptance verified against the objective 10-point technical criteria specified in Schedule F.

---

## 12. Handover & Knowledge Transfer

* 20 hours of live interactive technical handover sessions covering architecture, database indexing, BullMQ queue tuning, and incident remediation runbooks.

---

## 13. Legal Assumptions & Basis

* Agreement structured under the Indian Contract Act, 1872 and the Copyright Act, 1957.
* Subject to execution of the Master Software Licence Agreement and bilateral NDA.

---

## 14. Proposal Validity Period

* This commercial proposal is valid for **sixty (60) calendar days** from the date of issuance (valid until 2026-11-29).
