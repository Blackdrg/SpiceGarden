# SpiceGarden v1.0.0-rc1 — Indian Software Copyright Work Description

**Document Name:** Software Copyright Work Description  
**Version:** `1.0.0`  
**Date:** 2026-09-30  
**Status:** `INTERNAL REVIEW`  
**Owner:** Commercialization & IP Lead  
**Source / Reference:** Baseline Commit `ca349e510d3c18a7517da7502f70ef15bd37fe77` | Indian Copyright Act, 1957 Section 2(ffc)  
**Confidentiality Classification:** `CONFIDENTIAL / LEGAL DUE DILIGENCE`  

---

## 1. Title and Nature of the Work

* **Title:** SpiceGarden Enterprise Food-Delivery & Hyper-Local Logistics Platform (v1.0.0-rc1)
* **Nature of Work:** Computer Software / Computer Programme (Literary Work under Section 2(o) and Section 2(ffc) of the Copyright Act, 1957)
* **Authoritative Release Identity:** `v1.0.0-rc1` (Git commit `ca349e510d3c18a7517da7502f70ef15bd37fe77`)
* **Primary Programming Languages:** TypeScript, JavaScript, SQL (PostgreSQL dialect), YAML, Shell / Bash

---

## 2. Technical Scope and Functional Architecture

The SpiceGarden platform is an enterprise-grade multi-tenant food delivery, restaurant operations, and driver logistics software suite comprising 12 structured monorepo workspaces:

### A. Backend Core & Service Workspaces
1. **`apps/backend` (NestJS Modular Monolith):**
   - Implements 69 core modules including Authentication & RBAC, Order Management, Restaurant Catalog & Menu Engineering, Driver Fleet Dispatch & Geofencing, Dynamic Surge Pricing, Promotion & Coupon Engine, Loyalty Wallets, Double-Entry Financial Ledger, Payment Gateway Integrations (Stripe & Razorpay), and Real-time WebSocket Gateway (Socket.IO).
   - Database persistence via TypeORM on PostgreSQL 16 (financial records, orders, merchant menus, user profiles) with PgBouncer connection pooling.
   - Redis 7.2 distributed caching, rate-limiting, and BullMQ background queue workers for asynchronous order lifecycle events.
   - MongoDB 7.0 telemetry and structured audit logging.

### B. Client Application Workspaces
2. **`apps/customer-web`:** Customer-facing responsive web application built with Next.js (SSR/SSG), providing menu discovery, cart management, checkout, order tracking, and account management.
3. **`apps/customer-mobile`:** Customer mobile application built with React Native / Expo for iOS and Android, offering geolocation discovery, push notifications, and live driver tracking.
4. **`apps/restaurant-dashboard`:** Merchant web portal built with Next.js featuring Kitchen Display System (KDS), real-time order acceptance, menu/inventory control, and business analytics.
5. **`apps/delivery-partner`:** Mobile application for delivery drivers built with React Native / Expo featuring automated dispatch ingestion, GPS navigation, shift scheduling, and earnings reconciliation.
6. **`apps/super-admin`:** Central administrative governance portal built with Next.js for platform configuration, driver management, merchant onboarding, commission settlement, and ledger auditing.
7. **`apps/desktop-launcher`:** Desktop operations launcher built with Electron with strict IPC security boundaries.

### C. Shared Package Workspaces
8. **`packages/shared-types`:** Strongly-typed TypeScript interfaces, enums, DTOs, and API contract specifications.
9. **`packages/ui`:** Design token system, accessible UI component library, and theme definitions.
10. **`packages/database`:** Database migration scripts, seed utilities, and entity relationship definitions.
11. **`packages/config`:** Environment validation schemas and configuration presets.
12. **`packages/utils`:** Shared algorithmic utilities (geodetic distance calculations, currency formatting, cryptographic helpers).

---

## 3. Original and Proprietary Expressions Claimed

Copyright protection is specifically claimed in the original, creative, and non-literal expressions of the software, including:
1. **Source Code Implementation:** The original TypeScript, JavaScript, and SQL implementation files across all 12 workspaces.
2. **Algorithmic Logic:** Proprietary driver dispatching algorithms, geodetic route estimation, dynamic surge pricing calculations, and transaction reconciliation routines.
3. **Database Architecture & Schema:** Relational schemas, table structures, stored procedures, view definitions, and indexing strategies in PostgreSQL.
4. **API Specifications & Data Contracts:** REST and WebSocket contract schemas, request/response models, and error structures.
5. **Infrastructure Orchestration:** Production Kubernetes Helm/manifest topologies, autoscaling configurations (HPA), and Docker multi-stage container build blueprints.
6. **Technical Documentation:** Original architecture specifications, deployment runbooks, API references, and data room assets.

---

## 4. Exclusion of Third-Party and Open-Source Components

The copyright claim does NOT extend to:
* Third-party open-source libraries, runtime dependencies, or frameworks (such as NestJS, Next.js, React, React Native, Express, Tailwind CSS, TypeORM, PostgreSQL, Redis) which remain under their respective permissive open-source licenses (MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC) as documented in `legal/SBOM.json`.
* Standard public APIs of external providers (e.g., Stripe API, Razorpay API, Google Maps Platform APIs).
* Standard industry protocol definitions (HTTP/2, WebSocket, OAuth 2.0, JWT).
