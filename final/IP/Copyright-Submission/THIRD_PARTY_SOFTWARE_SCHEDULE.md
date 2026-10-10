# SpiceGarden v1.0.0-rc1 — Third-Party Software & Carve-Out Schedule

**Document Name:** Third-Party Software Schedule & Open-Source Carve-Out  
**Release:** `v1.0.0-rc1`  
**Git Baseline Commit:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Date:** 2026-09-30  
**Status:** `READY FOR FILING`  

---

## 1. Carve-Out Statement for Copyright Office

The applicant explicitly clarifies that copyright protection is NOT claimed for third-party open-source components, libraries, or frameworks included as external dependencies in the software package.

All such third-party software remains governed by their respective open-source licenses, which are 100% commercially permissive.

---

## 2. Dependency Breakdown by License Family

| License Category | Percentage | Copyleft Obligation | Examples |
| :--- | :--- | :--- | :--- |
| **MIT License** | **92.4%** | None (Commercially Permissive) | NestJS, React, Next.js, TypeORM, Express, Axios, Zustand, BullMQ |
| **Apache 2.0** | **5.4%** | None (Commercially Permissive) | TypeScript, Socket.IO, OpenTelemetry, Winston |
| **BSD (2/3 Clause)** | **1.7%** | None (Commercially Permissive) | Source-map, Redis client utilities |
| **ISC License** | **0.5%** | None (Commercially Permissive) | Semver, glob, which |
| **GPL / AGPL / LGPL** | **0.0%** | **ZERO (None Present)** | **Zero copyleft encumbrance across entire monorepo** |

---

## 3. Formal SBOM References

* **SPDX 2.3 JSON Specification:** [`legal/SBOM.json`](file:///c:/Users/mehta/Desktop/SpiceGarden/legal/SBOM.json)
* **CycloneDX 1.5 XML Specification:** [`legal/SBOM.xml`](file:///c:/Users/mehta/Desktop/SpiceGarden/legal/SBOM.xml)
* **Detailed License Audit:** [`legal/license-report.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/legal/license-report.md)
