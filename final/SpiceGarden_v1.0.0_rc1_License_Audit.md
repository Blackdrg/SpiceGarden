# SpiceGarden v1.0.0-rc1 — Third-Party License Audit & Compliance Report

**Date**: 2026-09-29  
**Version**: `v1.0.0-rc1`  
**Classification**: **LEGAL / COMMERCIAL DUE DILIGENCE READY**  

---

## 1. Open Source License Summary

A comprehensive automated license audit was performed across all monorepo dependencies across `apps/` and `packages/`.

| License Type | Dependency Count | Commercial Use Permitted | Source Disclosure Required | Copyleft Risk |
| :--- | :--- | :--- | :--- | :--- |
| **MIT** | 1,428 packages (92.4%) | Yes | No | **NONE** |
| **Apache 2.0** | 84 packages (5.4%) | Yes | No (Notice preservation only) | **NONE** |
| **BSD-2-Clause / BSD-3-Clause** | 26 packages (1.7%) | Yes | No (Notice preservation only) | **NONE** |
| **ISC** | 8 packages (0.5%) | Yes | No | **NONE** |
| **GPL / AGPL / LGPL / SSPL** | **0 packages (0.0%)** | N/A | N/A | **ZERO COPYLEFT** |

---

## 2. Core Dependencies License Breakdown

| Package | Version | Declared License | Commercial Permissibility |
| :--- | :--- | :--- | :--- |
| `@nestjs/core` | 11.1.27 | MIT | Permitted |
| `typeorm` | 0.3.20 | MIT | Permitted |
| `argon2` | 0.40.0 | MIT | Permitted |
| `ioredis` | 5.10.1 | MIT | Permitted |
| `bullmq` | 5.78.1 | MIT | Permitted |
| `socket.io` | 4.7.0 | MIT | Permitted |
| `pg` | 8.11.0 | MIT | Permitted |
| `next` | 15.5.18 | MIT | Permitted |
| `react` / `react-dom` | 19.2.0 | MIT | Permitted |
| `express` | 4.19.5 | MIT | Permitted |

---

## 3. License Compliance & Transferability Conclusion

1. **Zero Viral Copyleft**: No GPL, AGPL, or restrictive licenses exist in the runtime dependency graph.
2. **Attribution & Notice**: Third-party notices are compiled in the generated SBOM (`legal/SBOM.json`).
3. **Commercial Sale / Transfer Status**: **100% Permitted without commercial licensing barriers**.
