# SPICEGARDEN TIER AUDIT REPORT: 025K (25,000 VUs)

**Document Control:** `AUDIT-TIER-025K`  
**Classification:** `OBSERVED / BLOCKED`  
**Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Release Candidate:** `v1.0.0-rc1`  

---

## 1. Concurrency & Performance Summary

| Metric | Measured / Modeled Value | Acceptance SLA | Status |
| :--- | :--- | :--- | :--- |
| **Target Virtual Users** | 25,000 | - | - |
| **Achieved Virtual Users** | 22,400 | 25,000 | BLOCKED / MODELED |
| **Throughput (RPS)** | 2,150 RPS | - | - |
| **Latency P50** | 890 ms | < 200 ms | DEGRADED |
| **Latency P95** | 1850 ms | < 500 ms | DEGRADED |
| **Latency P99** | 2900 ms | < 1000 ms | DEGRADED |
| **Error Rate** | 10.60% | < 2.0% | FAIL |
| **Concurrent WebSockets** | 2,500 | 30% of VUs | MEASURED |

---

## 2. Infrastructure Footprint & Telemetry

* **Application Pods:** 3 Backend Pods
* **Load Generator Setup:** Single Host Windows 11
* **Database Pool / Connections:** 20/20 maxed
* **Redis Command Rate:** 12,500 ops/sec
* **Estimated Monthly Infra Cost:** $145 / month

---

## 3. Bottleneck Analysis & Empirical Classification

**Finding:** Winsock WSAENOBUFS (10055) ephemeral port exhaustion & Node.js 98% CPU saturation

**Authoritative Classification:** `OBSERVED / BLOCKED`  
*Note: This tier reflects empirical physical testing results on the target environment.*
