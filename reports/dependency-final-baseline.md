# SpiceGarden Dependency Final Baseline Report

**Date:** 2026-10-02  
**Target:** Monorepo Dependency Graph & Audit Baseline  
**Audited Target Workspaces:** 12 Workspaces

---

## 1. Monorepo Dependency Inventory

| Package | Installed Version | Workspace(s) | Direct / Transitive | Environment | Severity | Triage Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **typeorm** | `0.3.31` | `@spicegarden/backend`, Root | Direct | Production Server | High | **FIXED** |
| **mongoose** | `9.10.3` | `@spicegarden/backend` | Direct | Production Server | Moderate | **FIXED** |
| **socket.io-parser** | `>=4.2.7` | `@spicegarden/backend` | Transitive | Production Server | High | **FIXED** |
| **undici** | `>=6.28.1` | Root / Toolchain | Transitive | Build / Dev | High | **FIXED** |
| **tar** | `>=7.5.21` | Root / Toolchain | Transitive | Build / Dev | High | **FIXED** |
| **next** | `15.5.18` | `customer-web`<br>`restaurant-dashboard`<br>`super-admin` | Direct | Production Web | Critical | **PRODUCTION-REACHABLE — MITIGATED** |
| **multer** | `2.2.0` | `@spicegarden/backend` via NestJS | Transitive | Production Server | High | **NOT APPLICABLE** (No disk multipart upload routes) |
| **sharp** | `<=0.35.4` | Web Frontends | Transitive | Production Web | High | **PRODUCTION-REACHABLE — MITIGATED** |
| **electron** | `42.4.0` | `spicegarden-launcher` | Direct | Desktop App | High | **DESKTOP ONLY** |
| **extract-zip** | `2.0.1` | `spicegarden-launcher` | Transitive | Desktop Packaging | High | **DESKTOP ONLY** |
| **builder-util-runtime** | `<9.7.0` | `spicegarden-launcher` | Transitive | Desktop Packaging | High | **DESKTOP ONLY** |
| **decode-uri-component** | `<=0.4.2` | `customer-mobile` | Transitive | Mobile App | Moderate | **MOBILE ONLY** |
| **joi** | `17.13.x` | Transitive | Transitive | Development / Lib | High | **TRANSITIVE NON-RUNTIME** |
| **js-yaml** | `4.0.0` | `@spicegarden/backend` (`@nestjs/swagger`) | Transitive | Development / Swagger | High | **DEVELOPMENT ONLY** |
| **axios** | `1.x` | Shared / Mobile | Transitive | Client / Transport | High | **PRODUCTION-REACHABLE — MITIGATED** |

---

## 2. Quantitative Vulnerability Breakdown

```text
Total Dependencies in Monorepo: 2,036 audited packages

Vulnerability Counts:
  Critical: 1 (Next.js - Mitigated via Pages Router & Edge WAF)
  High: 16 (Multer N/A, Electron desktop packaging, Dev/Transitive tooling)
  Moderate: 5 (Mobile toolchain decode-uri-component, Mongoose casting resolved)
  Low: 0
  Total: 22

Production-Reachable Unmitigated: 0 (0%)
Production-Reachable Mitigated:   2 (Next.js, Axios)
Desktop-Only:                     3 (Electron, extract-zip, builder-util-runtime)
Mobile-Only:                      1 (decode-uri-component via React Navigation v6)
Development/Transitive Non-Runtime: 3 (joi, js-yaml, tar)
Not Applicable:                   1 (Multer raw disk streaming)
```
