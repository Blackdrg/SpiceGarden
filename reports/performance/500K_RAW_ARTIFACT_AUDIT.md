# SPICEGARDEN — 500K RAW ARTIFACT AUDIT & SYNTHESIS DETECTION

**Document ID:** `AUDIT-500K-SYNTH-001`  
**Classification:** `FORENSIC DATA INTEGRITY AUDIT`  
**Date:** `2026-10-03T02:45:00.000Z`

---

## 1. Inventory of Benchmark Generator Scripts

Forensic search across the codebase identified two developer scripts capable of synthesizing benchmark telemetry and summary reports:

1. [`infra/scripts/generate-raw-tier-evidence.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/scripts/generate-raw-tier-evidence.js) (Generates `qa/performance/` directories from `025k` through `1000k`).
2. [`infra/scripts/generate-100k-physical-suite.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/scripts/generate-100k-physical-suite.js) (Generates `benchmarks/` directories from `025k` through `100k`).

---

## 2. Artifact Forensic Origin Table

| Artifact Name | Generating Script | Programmatically Generated? | Raw Runtime Source | Physical Evidence? |
| :--- | :--- | :---: | :--- | :---: |
| `qa/performance/500k/manifest.json` | `generate-raw-tier-evidence.js` | **YES** | None (Static template) | **NO** |
| `qa/performance/500k/k6_summary.json` | `generate-raw-tier-evidence.js` | **YES** | None (Formula: $58,000 \times 1800$) | **NO** |
| `qa/performance/500k/infrastructure_telemetry.json` | `generate-raw-tier-evidence.js` | **YES** | None (Static template) | **NO** |
| `qa/performance/500k/tier_report.md` | `generate-raw-tier-evidence.js` | **YES** | None (Static template) | **NO** |
| `qa/performance/025k/manifest.json` | `generate-raw-tier-evidence.js` | **YES** | Synthesized from 22.4K error log | **PARTIAL** |
| `reports/performance/raw-results/k6-summary-10k.json` | None (Real k6 runner) | **NO** | Windows 11 host execution | **YES** |
| `reports/performance/raw-results/k6-summary-16k.json` | None (Real k6 runner) | **NO** | Windows 11 host execution | **YES** |
| `reports/performance/raw-results/k6-summary-22k.json` | None (Real k6 runner) | **NO** | Windows 11 host execution | **YES** |

---

## 3. Mathematical Construction of 500K k6 Metrics

Inspecting [`infra/scripts/generate-raw-tier-evidence.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/scripts/generate-raw-tier-evidence.js#L361-L389):

```javascript
// Formulas in generate-raw-tier-evidence.js for 500k tier:
const t = {
  tier: '500k',
  targetVUs: 500000,
  achievedVUs: 500000,
  rps: 58000,
  p50: 32.0,
  p90: 58.0,
  p95: 78.0,
  p99: 125.0,
  errorRate: 0.0008,
  backendPods: 50
};

// Generated k6_summary.json metric counters:
http_reqs.count = 58000 * 1800 = 104,400,000
http_req_failed.passes = Math.floor(58000 * 0.0008 * 1800) = 83,520
http_req_failed.fails = Math.floor(58000 * (1 - 0.0008) * 1800) = 104,316,480
http_req_duration.avg = (32.0 + 78.0) / 2 = 55.0 ms
```

**Conclusion:** The files in `qa/performance/500k/` are synthetic mathematical derivations. They correctly document the capacity model, but must be classified as **NON-EMPIRICAL**.
