# Diligence Data Room — Section 12: Third-Party Licensing & SBOM

**Section Identifier:** `12_Licensing`  
**Version:** `1.0.0`  
**Date of Record:** 2026-09-30  
**Classification:** `COMPLIANCE AUDITED — 100% PERMISSIVE`  

---

## 1. Section Scope & Contents

This section provides complete machine-readable Software Bills of Materials (SBOMs) and license compliance audit reports for all third-party dependencies in **SpiceGarden v1.0.0-rc1**.

---

## 2. Directory Artifacts

| Document Name | Description | Status |
| :--- | :--- | :--- |
| [`legal/SBOM.json`](../../legal/SBOM.json) | SPDX 2.3 JSON Software Bill of Materials (SHA-256: `9f5757c3...`). | **VERIFIED** |
| [`legal/SBOM.xml`](../../legal/SBOM.xml) | CycloneDX 1.5 XML Software Bill of Materials (SHA-256: `87123307...`). | **VERIFIED** |
| [`legal/license-report.md`](../../legal/license-report.md) | Open-source license breakdown: 92.4% MIT, 5.4% Apache-2.0, 1.7% BSD, 0.5% ISC. | **AUDITED** |
| [`legal/dependency-risk-register.md`](../../legal/dependency-risk-register.md) | Third-party dependency security and compliance risk register. | **AUDITED** |
| [`final/IP_AND_OPEN_SOURCE_SCHEDULE.md`](../../final/IP_AND_OPEN_SOURCE_SCHEDULE.md) | Formal IP & Open-Source Schedule for commercial licensing contracts. | **INTERNAL REVIEW** |

---

## 3. Key Finding

* **Zero Copyleft Encumbrance:** **Zero GPL, AGPL, LGPL, or SSPL copyleft-licensed dependencies** exist in the production runtime dependency tree. The codebase is 100% commercially permissive.
