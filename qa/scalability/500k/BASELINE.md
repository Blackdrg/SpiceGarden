# SPICEGARDEN — 500K VU BENCHMARK BASELINE RECORD

## 1. Baseline System & Environment Metadata

| Parameter | Recorded Value |
| :--- | :--- |
| **Git Commit** | `d55af75f6039cb158c9a6823a46d1de170cd2567` |
| **Node.js Version** | `v25.5.0` |
| **npm Version** | `9.9.4` |
| **k6 Version** | `k6.exe v2.2.0 (commit/00a9a1b7f5, go1.26.5, windows/amd64)` |
| **Docker Version** | `Docker version 29.7.2, build a7dcaa6` |
| **Kubectl Version** | `Client v1.36.1 (Kustomize v5.8.1)` |
| **Host Operating System** | `Windows 11 Home / Workstation (x86_64)` |
| **Timestamp** | `2026-10-03T18:26:00Z` |

---

## 2. Monorepo Baseline Verification

### 2.1 Monorepo Builds (12/12 Workspaces)
* `@spicegarden/backend`: **PASS (Exit code 0)** — `tsc -p tsconfig.build.json`
* `@spicegarden/customer-mobile`: **PASS (Exit code 0)** — `tsc --noEmit`
* `@spicegarden/customer-web`: **PASS (Exit code 0)** — Next.js 15.5.27 production build
* `@spicegarden/delivery-partner`: **PASS (Exit code 0)** — `tsc --noEmit`
* `spicegarden-launcher`: **PASS (Exit code 0)** — `tsc -p tsconfig.main.json` & webpack renderer
* `@spicegarden/restaurant-dashboard`: **PASS (Exit code 0)** — Next.js 15.5.27 production build
* `@spicegarden/super-admin`: **PASS (Exit code 0)** — Next.js 15.5.27 production build
* `@spicegarden/api-types`: **PASS (Exit code 0)** — `tsc --noEmit`
* `@spicegarden/grpc-transport`: **PASS (Exit code 0)** — `tsc --noEmit`
* `@spicegarden/proto`: **PASS (Exit code 0)** — `tsc --noEmit`
* `@spicegarden/shared`: **PASS (Exit code 0)** — `tsc`
* `@spicegarden/ui`: **PASS (Exit code 0)** — `tsc`
* **Overall Monorepo Build Status**: **12/12 PASS (0 Errors)**

### 2.2 Monorepo Linter Verification
* **Command**: `npm run lint`
* **Result**: **0 lint errors across all 12 workspaces**

### 2.3 Unit, Integration, and Coverage Test Suites
* **Backend Test Suites**: 74 passed / 74 total
* **Backend Tests**: 1,157 passed / 1,157 total (0 failed)
* **Frontend / Shared Test Suites**: 27 passed / 27 total (113 tests passed)
* **Total Monorepo Tests**: **101 Test Suites / 1,270 Tests Passed (0 Failures)**
* **Backend Code Coverage**:
  - Statements: `91.28%` (Threshold: 80%)
  - Branches: `81.10%` (Threshold: 80%)
  - Functions: `91.22%` (Threshold: 80%)
  - Lines: `91.21%` (Threshold: 80%)

### 2.4 Security & Penetration Assessments
* **SQL Injection Test**: `SECURE` (0 vulnerabilities)
* **XSS Test**: `SECURE` (0 vulnerabilities)
* **Rate Limiting Test**: `SECURE` (0 vulnerabilities)
* **Authentication Bypass Test**: `SECURE` (0 vulnerabilities)
* **Path Traversal Test**: `SECURE` (0 vulnerabilities)
* **Port Scan & Security Headers**: `SECURE` (0 vulnerabilities)
* **Total Security Findings**: **0 Vulnerabilities**

---

## 3. Baseline Data & Infrastructure Configuration
* **PostgreSQL Schema**: Production migrations applied, UUID v4 primary keys, multi-tenant composite indexing on `(tenant_id, id)`.
* **Redis Store**: Key prefixing per tenant, cluster-ready hash tags `{tenant:id}`.
* **BullMQ Queues**: Exponential backoff retry policies, atomic Lua scripts for job dispatch.
