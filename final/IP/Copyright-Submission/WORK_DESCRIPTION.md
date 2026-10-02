# SpiceGarden v1.0.0-rc1 — Copyright Submission Work Description

**Document Name:** Software Copyright Submission Work Description  
**Release:** `v1.0.0-rc1`  
**Git Baseline Commit:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Date:** 2026-09-30  
**Status:** `READY FOR FILING`  
**Notice:** `USER ACTION REQUIRED — To be included in physical/electronic filing package`  

---

## 1. Summary of the Computer Programme

The work entitled **SpiceGarden Enterprise Food-Delivery & Hyper-Local Logistics Platform (v1.0.0-rc1)** is an integrated multi-tenant food ordering, restaurant management, kitchen display, driver dispatch, and central operations software suite.

The software is structured as a monorepo consisting of 12 distinct workspaces:

1. **`apps/backend`**: NestJS 11 enterprise backend API providing 69 modular services including JWT/Argon2id authentication, RBAC authorization, restaurant catalog management, dynamic order pipelines, geofencing, driver matching algorithms, automated surge pricing, promo codes, double-entry financial ledger accounting, Stripe and Razorpay payment integration, and Socket.IO real-time gateways.
2. **`apps/customer-web`**: Responsive Next.js web application for consumer food ordering, menu exploration, real-time order tracking, and cart management.
3. **`apps/customer-mobile`**: iOS and Android mobile app built in React Native / Expo for consumer mobile experiences.
4. **`apps/restaurant-dashboard`**: Web portal for restaurant operators, featuring Kitchen Display System (KDS), real-time order acceptance, menu/inventory control, and tax compliance.
5. **`apps/delivery-partner`**: Mobile application for delivery drivers with automated shift tracking, turn-by-turn routing, GPS telemetry, and driver earnings.
6. **`apps/super-admin`**: Central governance web platform for system administration, platform analytics, driver onboarding, and commission settlements.
7. **`apps/desktop-launcher`**: Operator desktop application built using Electron with secure IPC bridges.
8. **`packages/shared-types`**: TypeScript type declarations, enums, and API contracts.
9. **`packages/ui`**: Shared UI component design system and token definitions.
10. **`packages/database`**: PostgreSQL schema definitions, migrations, and seed scripts.
11. **`packages/config`**: Configuration validation and environment schemas.
12. **`packages/utils`**: Mathematical, spatial, and cryptographic utility functions.

---

## 2. Statement of Original Expression

Originality is claimed in:
* The source-code implementation across the 12 workspaces.
* Proprietary algorithms for driver dispatching, batch order routing, and surge pricing.
* The structure, sequence, and organization of the database schemas, API contracts, and event streams.
* The Kubernetes infrastructure automation and deployment configurations.

Third-party dependencies and runtime frameworks are excluded from the copyright claim and licensed under permissive open-source terms (see `THIRD_PARTY_SOFTWARE_SCHEDULE.md`).
