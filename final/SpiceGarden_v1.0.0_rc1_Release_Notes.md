# SpiceGarden v1.0.0-rc1 — Official Release Notes

**Release Date**: September 29, 2026  
**Release Tag**: `v1.0.0-rc1`  
**Git Baseline Commit**: `ca349e510d3c18a7517da7502f70ef15bd37fe77`  

---

## 1. Overview

**SpiceGarden v1.0.0-rc1** is an enterprise-grade food delivery and multi-vendor restaurant platform featuring high-throughput NestJS microservices, React Native mobile applications, Next.js web portals, PostgreSQL 16 relational data architecture, Redis 7.2 distributed caching/rate-limiting, BullMQ job queues, and hardened Kubernetes deployment topologies.

---

## 2. Key Features & Capabilities

* **Multi-Portal Architecture**:
  * **Customer Web & Mobile** (`apps/customer-web`, `apps/customer-mobile`): Menu discovery, customizable addons, geolocation geocoding, live order tracking.
  * **Restaurant Partner Dashboard** (`apps/restaurant-dashboard`): Real-time kitchen order display (KDS), menu management, stock availability toggle, earnings.
  * **Super Admin Portal** (`apps/super-admin`): Commission management, driver fleet management, coupon engine, compliance reporting.
  * **Delivery Partner App** (`apps/delivery-partner`): Real-time dispatch, turn-by-turn navigation, OTP verification on delivery.
* **Performance & Scale Qualified**:
  * Bounded Argon2id cryptographic concurrency limiting.
  * Qualified up to 20,000 concurrent virtual users under Kubernetes HPA (14 pods).
  * Sub-130ms median read latency (p50) and under 1.15s tail latency (p95) under 20k peak load.
* **Security & Compliance**:
  * OWASP Argon2id password hashing (`memoryCost: 19456`, `timeCost: 2`, `parallelism: 1`).
  * Double-entry ledger architecture for wallet and refunds.
  * Strict RBAC, CSRF protection, and zero high/critical vulnerabilities.
* **Disaster Recovery Verified**:
  * RTO: 9m 30s (SLA target <= 15m), RPO: 12m (SLA target <= 60m).

---

## 3. Technology Stack & Runtime

* **Supported Runtime**: Node.js 22 LTS / 20 LTS
* **Backend**: NestJS 11.1.27, TypeORM 0.3.20, Socket.IO 4.7.0
* **Frontend**: Next.js 15.5.18, React 19.2.0, Tailwind CSS
* **Mobile**: React Native, Expo SDK
* **Database / Cache**: PostgreSQL 16 + PgBouncer, Redis 7.2 Cluster
* **Queue**: BullMQ 5.78.1
