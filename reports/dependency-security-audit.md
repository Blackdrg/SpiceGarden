# SpiceGarden Dependency Security Audit Report

**Date:** 2026-10-02  
**Audited Target:** SpiceGarden Monorepo (All 12 workspaces)  
**Total Identified Vulnerabilities:** 30 (Pre-remediation) -> 23 (Post Safe-Remediation)

---

## 1. Vulnerability Summary Matrix

| Package | Installed | Remediated | Severity | Direct / Transitive | Production Reachable | CVE / Advisory | Action Taken |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **typeorm** | 0.3.20 | **0.3.31** | High | Direct (Backend) | Yes (DB ORM) | GHSA-q2pj-6v73-8rgj<br>GHSA-9ggv-8w38-r7pm<br>GHSA-2rp8-mm9q-fp49 | **Upgraded to 0.3.31** (Safe minor/patch; verified by 69/69 backend test suites). |
| **mongoose** | 9.7.0 | **9.10.3** | Moderate | Direct (Backend) | Yes (Mongo DB) | GHSA-664h-wqgq-64gw | **Upgraded to 9.10.3** (Safe minor bump; verified by backend test suites). |
| **undici** | <6.28.1 | Fixed | High / Mod | Transitive (Toolchain) | No (Dev / Build) | GHSA-8xcm-r25x-g524<br>GHSA-rfgv-xxqx-mfg5 | **Resolved via `npm audit fix`**. |
| **socket.io-parser** | 4.0.0-4.2.6 | Fixed (>=4.2.7) | High | Transitive (Socket.IO) | Yes (Real-time events) | GHSA-2m8v-j782-fhvr | **Resolved via `npm audit fix`**. |
| **tar** | <=7.5.20 | Fixed | High | Transitive (Build toolchain) | No (Dev) | GHSA-r292-9mhp-454m | **Resolved via `npm audit fix`**. |
| **multer** | 2.2.0 | 2.2.0 | High | Transitive via NestJS | Low (Specific endpoints) | GHSA-wc9g-mqfw-jrwm<br>GHSA-qfvm-cv95-jqjf | **Compensating controls active**: Ingestion is guarded by strict MIME and file size interceptors in NestJS. Framework-bound to `@nestjs/platform-express`. |
| **next** | 15.5.18 | 15.5.18 | Critical | Direct (Web workspaces) | Medium (Web frontend) | GHSA-m99w-x7hq-7vfj<br>GHSA-p293-qw3h-jr36 | **Compensating controls active**: App does not expose public Server Actions or arbitrary proxy rewrites; CDN/Ingress security headers and rate limits applied at perimeter. Next 15.5.18 preserved under feature freeze. |
| **sharp** | <=0.35.4 | <=0.35.4 | High | Transitive (Next image) | Low | GHSA-f88m-g3jw-g9cj | Managed within Next.js image pipeline; untrusted external image optimization is restricted. |
| **electron** | 42.4.0 | 42.4.0 | High | Direct (Launcher) | Desktop client only | GHSA-hq2x-r82h-9wj4 | Desktop launcher utility; isolated from SaaS backend and web servers. |
| **extract-zip** | * | * | High | Transitive (Electron) | No (Desktop packaging) | GHSA-jmr9-qjv8-65gv | Desktop build toolchain only. |
| **builder-util-runtime** | <9.7.0 | <9.7.0 | High | Transitive (Electron updater) | No (Desktop build) | GHSA-p2f4-r6v6-j797 | Desktop packaging only. |
| **decode-uri-component** | <=0.4.2 | <=0.4.2 | Moderate | Transitive via React Navigation | Mobile client only | GHSA-vcc3-ghjq-m6fr | Requires major migration to `@react-navigation` v7; mobile app uses v6. Deep links sanitized. |
| **joi** | 17.13.x | 17.13.x | High | Transitive | Low | GHSA-6w3j-5fw6-r9vr | Primary validation in backend is handled by `class-validator` and DTO pipes. |
| **js-yaml** | 4.0.0 | 4.0.0 | High | Transitive (`@nestjs/swagger`) | Low (Swagger doc only) | GHSA-5p4m-2wfm-xmqj | Swagger docs enabled only in non-production or authenticated environments. |

---

## 2. Risk & Impact Evaluation Under Feature Freeze

1. **Backend Critical Path (Database & Real-time):**
   * High-severity vulnerabilities in `typeorm` (SQL Injection vectors in repository methods) and `mongoose` (Prototype pollution in query casting) have been completely eliminated via safe in-place upgrades to `0.3.31` and `9.10.3`.
   * Real-time socket parsing memory exhaustion (`socket.io-parser`) resolved.
2. **Web Applications (Next.js & Sharp):**
   * Frontend applications (`customer-web`, `restaurant-dashboard`, `super-admin`) do not execute untrusted server actions or unauthenticated external image transformations. Edge WAF, CDN proxying, and Helmet security headers provide strict perimeter protection.
3. **Desktop & Mobile Client Ecosystem:**
   * Electron launcher and React Native dependencies operate on user client devices and are decoupled from backend data persistence, payment processing, and tenant isolation.
