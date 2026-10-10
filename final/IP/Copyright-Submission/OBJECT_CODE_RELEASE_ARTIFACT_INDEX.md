# SpiceGarden v1.0.0-rc1 — Object Code & Release Artifact Index

**Document Name:** Object Code & Release Artifact Index  
**Release:** `v1.0.0-rc1`  
**Git Baseline Commit:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Date:** 2026-09-30  
**Status:** `READY FOR FILING`  

---

## 1. Release Deliverables and Artifact Inventory

| Category | Artifact Description | Location / Tag | Build / Package Method |
| :--- | :--- | :--- | :--- |
| **Backend Service** | Compiled NestJS Application (`dist/`) | `apps/backend/dist` | TypeScript Compiler (`tsc`) targeting ES2022 / Node 22 |
| **Backend Container** | Hardened Production Docker Image | `spicegarden-backend:v1.0.0-rc1` | Multi-stage Dockerfile (`node:22-alpine`) |
| **Customer Web** | Next.js Production Build (`.next/standalone`) | `apps/customer-web/.next` | `next build` (SSR/SSG optimized) |
| **Restaurant Dashboard** | Next.js Merchant Build | `apps/restaurant-dashboard/.next` | `next build` (React 18 / Next.js 14) |
| **Super Admin** | Next.js Admin Build | `apps/super-admin/.next` | `next build` |
| **Customer Mobile** | React Native / Expo Application Bundle | `apps/customer-mobile` | Expo Application Services (EAS) Android/iOS |
| **Delivery Partner** | React Native / Expo Driver Bundle | `apps/delivery-partner` | Expo Application Services (EAS) Android/iOS |
| **Desktop Launcher** | Electron Packaged Application | `apps/desktop-launcher/dist` | `electron-builder` |
| **Database Migrations**| TypeORM Migration Scripts | `packages/database/migrations` | TypeScript migration bundle |
| **Kubernetes Configs** | Production Deployment Manifests | `infra/k8s/production-hardened.yaml` | YAML Declarative Specs |

---

## 2. Compilation and Build Reproducibility

* **Deterministic Builds:** All dependencies are locked via `package-lock.json`.
* **Zero Warnings:** All 12 workspaces compile with exit code 0.
* **Release Hash Proof:** Checksums match `release-freeze/ARTIFACT_HASHES.sha256`.
