# SpiceGarden v1.0.0-rc1 — Licensee Due-Diligence Package & Technical Prospectus

**Document Name:** Licensee Due-Diligence Package & Technical Prospectus  
**Version:** `1.0.0`  
**Date:** 2026-09-30  
**Status:** `INTERNAL REVIEW / DILIGENCE READY`  
**Owner:** Commercialization Lead & Principal Architect  
**Baseline Release:** `v1.0.0-rc1` | Git Commit `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Document Classification:** `COMMERCIAL & TECHNICAL DILIGENCE PROSPECTUS`  

---

## 1. Executive Summary & Investment Highlights

**SpiceGarden v1.0.0-rc1** is a fully tested, production-qualified, enterprise food delivery, multi-restaurant marketplace, and hyper-local logistics software platform. Engineered as a high-performance modular monorepo, SpiceGarden provides a complete end-to-end technology ecosystem for immediate commercial deployment.

### Key Diligence Metrics
* **Codebase Maturity:** 12 monorepo workspaces, 100% build-clean, 100% lint-clean, Node.js 22 LTS runtime.
* **Test Validation:** 69 backend test suites (1,122 unit/integration tests passed, >91% coverage); 148 Chromium browser tests passed across 44 frontend routes.
* **Peak Load Qualification:** Sustained 20,000 concurrent Virtual Users (k6) across 14 API replicas with 0.48% error rate, p95 latency of 1,120.5 ms, and event-loop lag of 36.8 ms.
* **Transaction Integrity:** 47,910 persisted orders during peak load with 100% financial ledger reconciliation (zero duplicate IDs, zero orphaned records).
* **Disaster Recovery:** Timed DR drill verified RTO of 9m 30s and RPO of 12m snapshot lag.
* **Clean Legal Diligence:** Documented chain of title on file; audited SBOM with **zero copyleft/GPL licenses** (100% commercially permissive: 92.4% MIT, 5.4% Apache, 1.7% BSD, 0.5% ISC).

---

## 2. Product Architecture & Application Ecosystem

```mermaid
graph TD
    subgraph Client Apps (6 Frontends)
        CW[Customer Web SSR - Next.js]
        CM[Customer Mobile - React Native/Expo]
        RD[Restaurant KDS Dashboard - Next.js]
        DP[Driver Partner Mobile - React Native/Expo]
        SA[Super Admin Platform - Next.js]
        LA[Desktop Operator Wrapper - Electron]
    end

    subgraph Core Backend Services
        API[NestJS Modular API - 69 Business Modules]
        WS[Socket.IO Real-Time Dispatch Gateway]
        BM[BullMQ Asynchronous Job Queues]
    end

    subgraph Data & Storage Topology
        PG[(PostgreSQL 16 HA + PgBouncer)]
        RD_CACHE[(Redis 7.2 Cache & Rate Limiter)]
        MG[(MongoDB 7.0 Telemetry & Logs)]
    end

    CW & CM & RD & DP & SA & LA --> API
    CW & CM & RD & DP --> WS
    API --> PG
    API --> RD_CACHE
    API --> MG
    API --> BM
```

---

## 3. Security, Privacy & Compliance Architecture

1. **Authentication & RBAC:** Argon2id password hashing with hardware concurrency limiting (`CryptoConcurrencyLimiter`), short-lived JWTs (15m), and rotating refresh tokens in HTTP-Only, Secure cookies.
2. **OWASP Top 10 Resilience:** Automated security suites confirm 0 findings across evaluated vectors: SQLi, XSS, rate-limiting bypass, auth bypass, and path traversal (universal vulnerability-free status is not claimed).
3. **Data Protection Separation:** Absolute legal and architectural separation between Licensor software IP, Licensee customer data (owned 100% by Licensee), and system operational logs. DPDPA 2023 and GDPR alignment ready.

---

## 4. Disaster Recovery & Operational Readiness

* **RTO (Recovery Time Objective):** **9 minutes 30 seconds** (Verified in drill; target SLA <= 15 minutes).
* **RPO (Recovery Point Objective):** **12 minutes** snapshot lag (Verified in drill; target SLA <= 60 minutes).
* **Automated Tooling:** Complete backup (`infra/scripts/backup.sh`) and automated recovery (`infra/scripts/disaster-recovery.sh`) runbooks included.

---

## 5. Commercial Licensing Options & Indicative Pricing

| Tier | Model | Indicative Upfront Fee | Indicative Ongoing Support | Key Entitlements |
| :--- | :--- | :--- | :--- | :--- |
| **Tier A** | Enterprise Non-Exclusive | ₹75 Lakh (~$90k) | ₹15 Lakh/yr (~$18k/yr) | Pre-compiled container images, 1 Prod environment, standard SLA. |
| **Tier B** | Enterprise Exclusive | ₹1.25 Cr – ₹2.00 Cr | ₹20 Lakh – ₹35 Lakh/yr | Territorial/vertical exclusivity, source audit, source escrow included. |
| **Tier C** | Strategic Broad Rights | ₹2.00 Cr – ₹3.00 Cr+ | Custom Enterprise SLA | Full source code access, internal fork modification, white-label rights. |

---

## 6. Known Exceptions & Recipient Onboarding Responsibilities

To achieve live commercial trading, the recipient/licensee performs the following standard operational setup:
1. **Merchant Account Binding:** Provisioning live Stripe / Razorpay merchant keys and binding webhook secrets.
2. **App Store Signing:** Enrolling in Apple Developer Program and Google Play Console to sign mobile binaries with Licensee certificates.
3. **Target Cloud Infrastructure:** Provisioning target cloud Kubernetes cluster (AWS EKS, GCP GKE, or Azure AKS) and transferring DNS records.
4. **Secret Rotation:** Executing the Eight-Step Post-Transfer Secret Rotation runbook to establish fresh cryptographic keys.
5. **Local Counsel Review:** Finalizing customary legal review of local market food-delivery regulations and data privacy registrations.
