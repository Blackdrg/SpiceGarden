# SpiceGarden v1.0.0-rc1 — Asset Transfer & Handover Checklist

**Date**: 2026-09-29  
**Version**: `v1.0.0-rc1`  
**Classification**: **COMMERCIAL TRANSFER & DUE DILIGENCE**  

---

## 1. Transfer Scope Overview

This document specifies the handover sequence and transfer procedures for the acquisition, licensing, or commercial transition of the **SpiceGarden v1.0.0-rc1** software platform and related digital assets.

---

## 2. Asset Handover Checklist

| Handover Workstream | Asset Description | Transfer Mechanism | Security & Verification |
| :--- | :--- | :--- | :--- |
| **1. Source Code Repository** | Complete monorepo git history (`main` at `v1.0.0-rc1`) | GitHub Organization Ownership Transfer | Git signed commits verified |
| **2. Domains & DNS** | `spicegarden.app` + subdomains | Registrar EPP Authorization Transfer | 2FA locked, DNS zone file export |
| **3. Cloud Infrastructure** | Kubernetes manifests, Helm charts, Terraform/K8s | Repository transfer & Kubeconfig handover | RBAC admin binding transition |
| **4. Database & Storage** | PostgreSQL 16 schemas, migrations, Mongo schemas | Schema DDLs & sanitization scripts | Automated migrations verification |
| **5. Mobile App Store Assets** | Apple App Store & Google Play Console transfer | Developer Account app transfer | Bundle IDs & signing keys transition |
| **6. Gateway Accounts** | Stripe / Razorpay merchant integration code | API key rotation in purchaser vault | Webhook endpoint re-pointing |
| **7. Brand & Media Assets** | Vector logos, design system tokens, typography | Data room digital assets bundle | Full copyright assignment |
| **8. Legal & SBOM Package** | Chain of title, SPDX SBOM, license audit | Legal data room folder | No copyleft encumbrances |

---

## 3. Credential Handover & Post-Transfer Rotation Procedure

> [!IMPORTANT]
> Raw production secrets and private keys are never committed to the repository. Handover follows an air-gapped credential rotation protocol.

### Rotation Sequence:
1. **Pre-Transfer**: Seller rotates all root master keys into dedicated escrow hardware token / KMS.
2. **Transfer Event**: Secure transmission of API client credentials and DNS control.
3. **Post-Transfer Verification**: Purchaser executes `infra/scripts/generate-secrets.ps1` to re-generate localized encryption keys (`JWT_SECRET`, `ENCRYPTION_SECRET`, `DB_PASS`).
4. **Environment Separation**: Immediate revocation of previous staging and development access tokens.
