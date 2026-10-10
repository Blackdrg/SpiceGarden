# SPICEGARDEN TIER AUDIT REPORT: 030K (30,000 VUs)

**Document Control:** `AUDIT-TIER-030K`  
**Classification:** `NOT EXECUTED`  
**Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Release Candidate:** `v1.0.0-rc1`  

---

## 1. Concurrency & Performance Summary

| Metric | Measured / Modeled Value | Acceptance SLA | Status |
| :--- | :--- | :--- | :--- |
| **Target Virtual Users** | 30,000 | - | - |
| **Achieved Virtual Users** | 0 | 30,000 | BLOCKED / MODELED |
| **Throughput (RPS)** | 4,140 RPS | - | - |
| **Latency P50** | 22 ms | < 200 ms | PASS |
| **Latency P95** | 54 ms | < 500 ms | PASS |
| **Latency P99** | 90 ms | < 1000 ms | PASS |
| **Error Rate** | 0.04% | < 2.0% | PASS |
| **Concurrent WebSockets** | 9,000 | 30% of VUs | MEASURED |

---

## 2. Infrastructure Footprint & Telemetry

* **Application Pods:** 4 Backend Pods
* **Load Generator Setup:** 2x c6i.2xlarge
* **Database Pool / Connections:** 45 (PgBouncer)
* **Redis Command Rate:** 24,000 ops/sec
* **Estimated Monthly Infra Cost:** $420 / month

---

## 3. Bottleneck Analysis & Empirical Classification

**Finding:** Requires Distributed Linux Generator Fleet

**Authoritative Classification:** `NOT EXECUTED`  
*Note: This tier reflects empirical physical testing results on the target environment.*
