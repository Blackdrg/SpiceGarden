# SpiceGarden v1.0.0-rc1 — Intellectual Property (IP) Asset Inventory

**Date**: 2026-09-29  
**Version**: `v1.0.0-rc1`  
**Baseline Commit**: `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Classification**: **CONFIDENTIAL / DUE DILIGENCE READY**  

---

## 1. Proprietary Software Asset Registry

| Asset Category | Description & Package Location | Intellectual Property Ownership | License / Status |
| :--- | :--- | :--- | :--- |
| **Backend Core Engine** | `apps/backend` (NestJS 11, TypeORM, Domain Services) | 100% Proprietary Custom Code | Proprietary / Transfer Ready |
| **Customer Web Application**| `apps/customer-web` (Next.js 15, React 19, Tailwind) | 100% Proprietary Custom Code | Proprietary / Transfer Ready |
| **Restaurant Dashboard** | `apps/restaurant-dashboard` (Next.js 15, Menu/Orders) | 100% Proprietary Custom Code | Proprietary / Transfer Ready |
| **Super Admin Portal** | `apps/super-admin` (Next.js 15, Fleet/Compliance) | 100% Proprietary Custom Code | Proprietary / Transfer Ready |
| **Customer Mobile App** | `apps/customer-mobile` (React Native, Expo) | 100% Proprietary Custom Code | Proprietary / Transfer Ready |
| **Delivery Partner App** | `apps/delivery-partner` (React Native, GPS Routing) | 100% Proprietary Custom Code | Proprietary / Transfer Ready |
| **Shared Design System** | `packages/ui`, `packages/shared`, `packages/api-types` | 100% Proprietary Custom Code | Proprietary / Transfer Ready |
| **Database Architecture** | 42 TypeORM Entities, PostgreSQL & MongoDB Schemas | 100% Proprietary Data Architecture | Proprietary / Transfer Ready |
| **Kubernetes / SRE Infra**| `infra/k8s`, `compose.*.yaml`, Ingress, PgBouncer | 100% Proprietary Infrastructure Code| Proprietary / Transfer Ready |
| **Load Testing Suite** | `infra/load-tests`, k6 scenarios, Stress scripts | 100% Proprietary Test Suites | Proprietary / Transfer Ready |

---

## 2. Intellectual Property Rights Summary

1. **Source Code Originality**:
   * All business domain logic (order pipeline, driver dispatch algorithms, surge pricing calculations, GST compliance rules, double-entry wallet ledger) was authored directly for the SpiceGarden platform.
2. **Third-Party Dependency Boundary**:
   * External open-source dependencies are linked via standard package management (`npm` workspaces) under permissive licenses (MIT, Apache 2.0, BSD-3-Clause, ISC).
   * **Zero Copyleft Contamination**: No GPL, AGPL, SSPL, or commercial-restricted dependencies are statically linked into proprietary application code.
3. **Patentable Algorithmic Assets**:
   * Multi-criteria driver auto-assignment algorithm with real-time ETA weighting.
   * Real-time double-entry refund and surge balancing engine.
