# SpiceGarden v1.0.0-rc1 Commercial & Due-Diligence Data Room

**Release Version:** `v1.0.0-rc1`  
**Git Baseline Commit:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Date of Record:** 2026-09-30  
**Overall Status:** `IP-PROTECTED / COMMERCIAL-LICENSING READY / LICENSEE-READY`  

Welcome to the **SpiceGarden v1.0.0-rc1** diligence data room. This directory structure organizes all technical, operational, architectural, legal, intellectual property, and commercial assets for acquisition, licensing, or enterprise deployment review.

---

## Data Room Directory Structure (19 Modules)

| Folder | Title | Contents & Key Artifacts |
| :--- | :--- | :--- |
| [`01_Product`](./01_Product/README.md) | Product Overview & Functional Scope | Product roadmap, platform capabilities, user flows, multi-tenant boundaries. |
| [`02_Source`](./02_Source/README.md) | Source Code & Repository Inventory | Monorepo structure (6 apps, 5 packages), dependencies, build configuration. |
| [`03_Architecture`](./03_Architecture/README.md) | System & Solution Architecture | NestJS backend, event-driven BullMQ queues, PostgreSQL schema, Redis caching, gRPC/Socket.IO. |
| [`04_Performance`](./04_Performance/README.md) | Scale & Performance Qualification | Load test results (50 to 20,000 VUs), Argon2id concurrency limiter benchmarks, event-loop telemetry. |
| [`05_Security`](./05_Security/README.md) | Security & Penetration Testing | OWASP Top 10 tests, penetration test reports, Argon2id auth verification, rate limiting audits. |
| [`06_Database`](./06_Database/README.md) | Database & Storage Topology | PostgreSQL 16 schema, migrations, PgBouncer pool configuration, indexing strategy, Redis persistence. |
| [`07_Infrastructure`](./07_Infrastructure/README.md) | Kubernetes & Cloud Deployment | Production manifests, HPA configuration (3-20 replicas), resource limits, ingress/TLS specs. |
| [`08_Mobile`](./08_Mobile/README.md) | Mobile Applications & Device Validation | Customer Mobile & Delivery Partner apps (React Native/Expo), physical device qualification matrix. |
| [`09_Payments`](./09_Payments/README.md) | Payment Systems & Gateway Integrations | Stripe & Razorpay sandbox qualification, webhook idempotency, ledger reconciliation. |
| [`10_Disaster-Recovery`](./10_Disaster-Recovery/README.md) | Disaster Recovery & Business Continuity | Physical DR drill report, RTO 9m 30s (SLA <= 15m), RPO 12m (SLA <= 60m), backup runbooks. |
| [`11_IP-Ownership`](./11_IP-Ownership/README.md) | IP Inventory & Indian Copyright Package | Proprietary asset register, contributor assignment matrix, Indian Copyright filing package (Form XIV). |
| [`12_Licensing`](./12_Licensing/README.md) | Third-Party Licenses & SBOM | CycloneDX & SPDX SBOM, license audit (0 GPL/copyleft), dependency risk register. |
| [`13_Domains-Trademarks`](./13_Domains-Trademarks/README.md) | Brand, Domains & Trademarks | Domain ownership inventory, brand marks, TM search checklist, Form TM-A filing data, risk register. |
| [`14_Test-Evidence`](./14_Test-Evidence/README.md) | Test Coverage & Regression Evidence | 12/12 workspace builds, 12/12 lints, 69 backend test suites (1,122 unit/integration tests). |
| [`15_Operations`](./15_Operations/README.md) | Operations & Deployment Runbooks | Deployment runbook, Prometheus/Grafana alert definitions, incident management procedures. |
| [`16_Legal`](./16_Legal/README.md) | Commercial Legal Diligence Package | Clean chain-of-title, export compliance, third-party warranty disclosures, Indian statutory filings. |
| [`17_Commercial`](./17_Commercial/README.md) | Commercialization & Valuation Pack | Market positioning, unit economics, throughput capacity analysis (1k-8k orders/hr). |
| [`18_Release`](./18_Release/README.md) | Release Candidate & Transfer Assets | Final readiness report, readiness matrix JSON, release notes, transfer checklist. |
| [`19_Commercial-Licensing`](./19_Commercial-Licensing/README.md) | Commercial Licensing & Contracts | Master Software Licence Agreement (46 clauses), Pricing, SLAs, Tiers, NDA, Escrow, and Proposal. |

---

## Key Executive Highlights

* **Node.js LTS Runtime**: Fully qualified under Node.js 22 LTS in production containers.
* **Scale Qualified**: 20,000 k6 Virtual Users sustained across 14 API replicas with 0.48% error rate, p95 1,120.5 ms, and event-loop p99 36.8 ms.
* **Business Data Consistency**: 47,910 accepted orders persisted and reconciled with zero duplicate IDs and zero orphaned/unreconciled records.
* **Disaster Recovery**: Verified in timed drill with RTO of 9m 30s and RPO of 12m.
* **Licensing**: 0 copyleft dependencies, 100% commercially permissive.
* **Release Status**: `PRODUCTION-READY WITH OPERATIONAL EXCEPTIONS (TRANSFER READY)`
* **Commercialization Status**: `IP-PROTECTED / COMMERCIAL-LICENSING READY / LICENSEE-READY`
