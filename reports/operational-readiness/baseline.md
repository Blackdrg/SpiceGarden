# SpiceGarden Release Candidate Baseline Audit

**Audit Date:** 2026-10-02  
**Target Architecture:** SpiceGarden v1.0.0-rc1  
**Auditor:** Antigravity Autonomous Verification Subsystem  
**Audit Classification:** Conservative, Evidence-Driven Operational Readiness Simulation  

---

## 1. Release Candidate Identity & Repository State

| Parameter | Value | Evidence / Verification Method |
| :--- | :--- | :--- |
| **Git Branch** | `feat/add-react-doctor` | `git status` |
| **Git Commit SHA** | `ca349e510d3c18a7517da7502f70ef15bd37fe77` | `git log -1` |
| **Commit Author & Date** | `Blackdrg <daredevil0101a@gmail.com>`, Tue Jul 7 15:13:23 2026 +0530 | `git log -1` |
| **Working Tree Status** | Untracked audit dossiers & local diagnostic logs present; source code stable | `git status` |
| **Node.js Version** | `v25.5.0` | `node -v` |
| **npm Version** | `9.9.4` | `npm -v` |
| **Operating System** | Windows 11 (`win32 x64 10.0.26100`) | Node `os.platform()` / `systeminformation` |
| **Lockfile(s)** | `package-lock.json` (v3), `yarn.lock` | Root filesystem inspection |
| **Total Workspaces** | 12 workspaces (7 applications, 5 packages) | Root `package.json` |

---

## 2. Inventory of Applications & Packages

### Applications (7)
1. **`@spicegarden/backend` (`apps/backend`)** — NestJS 11 + TypeORM + Mongoose + BullMQ + Socket.IO + Express API & Microservices engine.
2. **`@spicegarden/customer-web` (`apps/customer-web`)** — Next.js 15.5.27 + React 19 + Redux Toolkit + TanStack Query customer ordering portal.
3. **`@spicegarden/restaurant-dashboard` (`apps/restaurant-dashboard`)** — Next.js 15.5.27 + Recharts + Redux Toolkit kitchen display system (KDS) & store portal.
4. **`@spicegarden/super-admin` (`apps/super-admin`)** — Next.js 15.5.27 + Recharts + Redux Toolkit multi-tenant administrative portal.
5. **`@spicegarden/customer-mobile` (`apps/customer-mobile`)** — React Native 0.73 / Expo SDK 57 cross-platform iOS & Android customer mobile app.
6. **`@spicegarden/delivery-partner` (`apps/delivery-partner`)** — React Native / Expo driver GPS & dispatch dispatch mobile application.
7. **`spicegarden-launcher` (`apps/launcher`)** — Electron 42.4.0 desktop deployment & operational supervisor tool.

### Shared Packages (5)
1. **`@spicegarden/ui` (`packages/ui`)** — Shared design system tokens, primitives, Lucide icons, responsive components.
2. **`@spicegarden/shared` (`packages/shared`)** — Shared utilities, constants, data validation contracts.
3. **`@spicegarden/api-types` (`packages/api-types`)** — Canonical TypeScript interfaces and DTOs.
4. **`@spicegarden/proto` (`packages/proto`)** — gRPC Protocol Buffer definitions.
5. **`@spicegarden/grpc-transport` (`packages/grpc-transport`)** — Inter-service transport utilities.

---

## 3. Technology Stack & Framework Inventory

* **Backend Framework:** `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/platform-socket.io` (NestJS v11.0.1)
* **Frontend Web Framework:** Next.js `15.5.27` (React `19.2.0`)
* **Mobile Framework:** Expo `~57.0.13` (React Native `0.73.0`)
* **Desktop Shell:** Electron `^42.4.0`
* **Databases & ORM:** 
  * PostgreSQL via TypeORM `0.3.31`
  * MongoDB via Mongoose `^8.x` / `mongodb ^6.x`
  * In-memory / dev fallback SQLite3 `6.0.1`
* **Caches & Queues:**
  * Redis client via `ioredis`
  * Background Job Processing via `bullmq ^5.x`
* **Real-Time Communication:**
  * Socket.IO `^4.x` with room partitioning and tenant isolation guards
* **Observability & Telemetry:**
  * Sentry (`@sentry/node`, `@sentry/nextjs`, `@sentry/browser` v10.63.0)
  * Prometheus metrics exporter via `prom-client` (`/metrics` endpoint)
* **Testing & Quality Tooling:**
  * Jest `29.7.0`, `ts-jest ^29.1.0`
  * Playwright `^1.63.0`, `@axe-core/playwright ^4.13.0`
  * ESLint `8.57.0`, `@typescript-eslint ^8.60.0`
* **Infrastructure & Load Testing Tooling:**
  * Docker `29.7.2` (Client installed; local daemon stopped during baseline)
  * Docker Compose `v5.4.0`
  * Kubernetes `kubectl v1.36.1`, `kustomize v5.8.1`
  * k6 Load Test Engine `v2.2.0`
