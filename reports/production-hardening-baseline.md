# SpiceGarden Production Hardening Baseline Report

**Date:** 2026-10-02  
**Environment:** Local Development / Windows  
**Status:** Baseline Established (Pre-remediation)

---

## 1. Monorepo Overview

* **Total Workspaces:** 12
  1. `@spicegarden/backend` (NestJS / TypeORM / PostgreSQL / Redis / BullMQ / MongoDB)
  2. `@spicegarden/customer-mobile` (React Native / Expo)
  3. `@spicegarden/customer-web` (Next.js 15)
  4. `@spicegarden/delivery-partner` (React Native / TypeScript)
  5. `spicegarden-launcher` (Electron / Webpack / React)
  6. `@spicegarden/restaurant-dashboard` (Next.js 15)
  7. `@spicegarden/super-admin` (Next.js 15)
  8. `@spicegarden/api-types` (TypeScript)
  9. `@spicegarden/grpc-transport` (TypeScript / gRPC)
  10. `@spicegarden/proto` (Protocol Buffers)
  11. `@spicegarden/shared` (TypeScript library)
  12. `@spicegarden/ui` (React Component Library)

---

## 2. Baseline Command Execution Results

### 2.1 Linting (`npm run lint`)
* **Status:** PASS (Exit code 0)
* **Errors:** 0
* **Warnings:** 0
* **Scope:** All 12 workspaces executed via `npm run --workspaces lint`.

### 2.2 Production Build (`npm run build`)
* **Status:** PASS (Exit code 0)
* **Scope:** All 12 workspaces compiled successfully.
  * Next.js apps (`customer-web`, `restaurant-dashboard`, `super-admin`) statically generated and bundled.
  * Electron launcher (`spicegarden-launcher`) main and renderer bundles generated.
  * TypeScript packages and microservice transports typechecked / compiled.

### 2.3 Backend Test Suite (`cd apps/backend && npm test`)
* **Status:** PASS (Exit code 0)
* **Suites:** 69 passed / 69 total
* **Tests:** 1,122 passed / 1,122 total
* **Snapshots:** 0
* **Execution Time:** ~23.07 s
* **Noted Issue:** Jest worker process warning:
  `A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown.`

### 2.4 Frontend / Shared Unit Tests (`npm run test:unit`)
* **Status:** PASS (Exit code 0)
* **Breakdown:**
  * `@spicegarden/customer-mobile`: 6 suites, 33 tests passed
  * `@spicegarden/customer-web`: 3 suites, 11 tests passed
  * `@spicegarden/delivery-partner`: 3 suites, 6 tests passed
  * `spicegarden-launcher`: 1 suite, 1 test passed
  * `@spicegarden/restaurant-dashboard`: 3 suites, 9 tests passed
  * `@spicegarden/super-admin`: 4 suites, 23 tests passed
  * `@spicegarden/shared`: 2 suites, 2 tests passed
  * `@spicegarden/ui`: 5 suites, 28 tests passed
* **Frontend/Shared Total:** 27 suites, 113 tests passed

### 2.5 Combined Monorepo Test Baseline
* **Total Test Suites:** 96 suites (69 backend + 27 frontend/shared)
* **Total Passing Tests:** 1,235 tests (1,122 backend + 113 frontend/shared)
* **Failed Tests:** 0
* **Skipped Tests:** 0

---

## 3. Baseline Warnings & Diagnostic Observations

1. **Jest Force Exit / Open Handles (Backend):**
   * Backend test runner triggers worker force-exit message indicating incomplete teardown of asynchronous resources or timer/handle leaks.
2. **Deprecation Warnings:**
   * `punycode`: Node.js DEP0040 deprecation triggered during Next.js/Jest runs from transitive dependencies.
   * `react-test-renderer`: Deprecation notice in React Native testing library.
3. **Next.js Config Observation:**
   * Notice: `Both outputFileTracingRoot and turbopack.root are set, but they must have the same value.`
4. **Redis Fallback Notice in Unit Tests:**
   * Expected log during unit tests without live Redis: `[rate-limit] Redis unavailable, using process-local fallback: ECONNREFUSED`.
