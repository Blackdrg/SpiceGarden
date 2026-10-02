# SpiceGarden — Next.js & Axios Remediation Baseline Report

**Date:** 2026-10-02  
**Target:** Next.js & Axios Security Remediation  
**Environment:** Node.js v25.5.0 | npm 9.9.4 | Branch: `feat/add-react-doctor`  

---

## 1. Monorepo Baseline Inventory

### 1.1 Next.js (`next`)
* **Current Installed Version:** `15.5.18`
* **Direct Declarations:**
  * Root [`package.json`](file:///c:/Users/mehta/Desktop/SpiceGarden/package.json#L145) (`"next": "15.5.18"`)
  * `@spicegarden/customer-web`
  * `@spicegarden/restaurant-dashboard`
  * `@spicegarden/super-admin`
* **Transitive Consumers:**
  * `@sentry/nextjs@10.63.0`
* **Advisory Status:**
  * Range Affected: `9.5.6-canary.0 - 15.5.23`
  * CVEs/GHSAs: GHSA-m99w-x7hq-7vfj, GHSA-89xv-2m56-2m9x, GHSA-68g3-v927-f742, GHSA-4633-3j49-mh5q, GHSA-4c39-4ccg-62r3, GHSA-p9j2-gv94-2wf4, GHSA-q8wf-6r8g-63ch, GHSA-955p-x3mx-jcvp, GHSA-p293-qw3h-jr36, GHSA-2xp9-vwfh-vxw4.
* **Target Patched Version:** `15.5.27` (official official backport release within Next.js 15.5.x minor line).

### 1.2 Axios (`axios`)
* **Current Installed Version:** `1.18.1`
* **Direct Declarations:** None (Monorepo core applications use native `fetch` via `@spicegarden/shared`).
* **Transitive Consumers:**
  * `spicegarden-launcher` -> `wait-on@7.2.0` -> `axios@1.18.1`
* **Advisory Status:**
  * GHSA-44g4-m2mj-wpvx (CIDR-form NO_PROXY exclusion bypass)
  * GHSA-r4gj-5m52-g5wh (maxRedirects: 0 fetch adapter bypass)
* **Target Patched Version:** `1.20.0` (or `^1.20.0` in package overrides).

---

## 2. Workspace Application Routing & Architecture Audit

| Application | Routing Model | Server Actions (`"use server"`) | Custom Rewrites | Public Image Optimization |
| :--- | :--- | :--- | :--- | :--- |
| `apps/customer-web` | Pages Router (`pages/`) | None | None | Restricted to internal domains |
| `apps/restaurant-dashboard` | Pages Router (`pages/`) | None | None | Restricted to internal domains |
| `apps/super-admin` | Pages Router (`pages/`) | None | None | Restricted to internal domains |
| `spicegarden-launcher` | Electron Desktop Utility | N/A | N/A | Local static file loading |
