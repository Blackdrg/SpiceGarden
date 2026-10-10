# SpiceGarden v1.0.0-rc1 — Recipient-Specific Closeout Checklist

**Document Name:** Recipient-Specific Operational Closeout Checklist  
**Version:** `1.0.0`  
**Date:** 2026-09-30  
**Status:** `INTERNAL REVIEW / HANDOVER READY`  
**Owner:** SRE & Commercial Handover Lead  
**Classification:** `PRODUCTION-READY WITH OPERATIONAL EXCEPTIONS (TRANSFER READY)`  

> [!NOTE]
> The items listed in this checklist represent normal commercial deployment configurations, third-party merchant account bindings, and statutory filings. They are operational handover tasks for the commercial recipient/licensee and do **NOT** require any software redesign or architectural changes.

---

## 1. Operational Exception Tracking Matrix

| Category | Specific Operational Task | Description & Procedure | Responsible Party | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1. Stripe Live Merchant Binding** | Configure Live Stripe API Keys & Webhooks | Replace sandbox test keys with Licensee's verified Stripe live publishable and secret keys; bind webhook endpoint `https://api.<domain>/v1/payments/stripe/webhook`. | Licensee Ops Team | `RECIPIENT CONFIGURATION REQUIRED` |
| **2. Razorpay Live Merchant Binding** | Configure Live Razorpay API Keys & Webhooks | Input Licensee's live Razorpay key ID and secret; register webhook endpoint `https://api.<domain>/v1/payments/razorpay/webhook`. | Licensee Ops Team | `RECIPIENT CONFIGURATION REQUIRED` |
| **3. Mobile App Store Signing** | Apple App Store & Google Play Accounts | Configure Expo Application Services (EAS) with Licensee's Apple Developer Team ID and Google Play Service Account JSON; generate signed production AAB and IPA binaries. | Licensee Mobile Team | `RECIPIENT CONFIGURATION REQUIRED` |
| **4. DNS & Domain Routing Cutover** | Authoritative DNS Zone Binding | Update nameserver records for `spicegarden.app`, `spicegarden.io`, and `spicegarden.dev` to point to Licensee's ingress controller / Cloudflare edge; issue TLS certificates via `cert-manager`. | Licensee SRE Team | `RECIPIENT CONFIGURATION REQUIRED` |
| **5. Post-Transfer Secret Rotation** | Eight-Step Cryptographic Key Generation | Execute `infra/scripts/generate-secrets.ps1` (or bash equivalent) to generate fresh, unique production JWT secrets, database credentials, Argon2id salts, and Redis passwords. | Licensee SRE Team | `RECIPIENT CONFIGURATION REQUIRED` |
| **6. Target Infrastructure Validation** | Validate Kubernetes Compute & Persistent Volumes | Deploy Helm charts to Licensee AWS EKS / GCP GKE / Azure AKS cluster; verify Pod health, PgBouncer pool connections, and BullMQ worker queue processing. | Licensee SRE Team | `RECIPIENT CONFIGURATION REQUIRED` |
| **7. Statutory Copyright Filing** | Submit Form XIV to Indian Copyright Office | Complete online e-filing on `copyright.gov.in`, pay statutory fee of ₹500, and dispatch physical deposit package (first/last 10 pages). | Licensor / Legal Counsel | `READY FOR EXTERNAL FILING` |
| **8. Statutory Trademark Filing** | Submit Form TM-A to Trade Marks Registry | Complete online e-filing on `ipindiaonline.gov.in` under Classes 09, 39, and 42; track application examination. | Licensor / Legal Counsel | `READY FOR EXTERNAL FILING` |
| **9. Formal Legal Counsel Review** | Bi-lateral Contract Review | Have qualified Indian corporate counsel review and approve customized Master Software Licence Agreement and Order Form. | Both Parties' Counsel | `LEGAL REVIEW REQUIRED` |

---

## 2. Validation Runbook References

* Deployment Runbook: [`final/SpiceGarden_v1.0.0_rc1_Deployment_Runbook.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/final/SpiceGarden_v1.0.0_rc1_Deployment_Runbook.md)
* Payment Handover Guide: [`final/PAYMENT_HANDOVER.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/final/PAYMENT_HANDOVER.md)
* Mobile Release Handover Guide: [`final/MOBILE_RELEASE_HANDOVER.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/final/MOBILE_RELEASE_HANDOVER.md)
* Infrastructure Transfer Runbook: [`final/INFRA_TRANSFER_RUNBOOK.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/final/INFRA_TRANSFER_RUNBOOK.md)
* Monitoring & Alert Handover: [`final/MONITORING_ALERT_HANDOVER.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/final/MONITORING_ALERT_HANDOVER.md)
