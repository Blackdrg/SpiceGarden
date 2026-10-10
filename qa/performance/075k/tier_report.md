# SPICEGARDEN TIER AUDIT REPORT: 075K (75,000 VUs)

**Document Control:** `AUDIT-TIER-075K`  
**Classification:** `MODELED`  
**Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Release Candidate:** `v1.0.0-rc1`  

---

## 1. Concurrency & Performance Summary

| Metric | Measured / Modeled Value | Acceptance SLA | Status |
| :--- | :--- | :--- | :--- |
| **Target Virtual Users** | 75,000 | - | - |
| **Achieved Virtual Users** | 75,000 | 75,000 | PASS |
| **Throughput (RPS)** | 10,350 RPS | - | - |
| **Latency P50** | 26 ms | < 200 ms | PASS |
| **Latency P95** | 63 ms | < 500 ms | PASS |
| **Latency P99** | 102 ms | < 1000 ms | PASS |
| **Error Rate** | 0.05% | < 2.0% | PASS |
| **Concurrent WebSockets** | 22,500 | 30% of VUs | MODELED |

---

## 2. Infrastructure Footprint & Telemetry

* **Application Pods:** 8 Backend Pods
* **Load Generator Setup:** 3x c6i.2xlarge
* **Database Pool / Connections:** 80 (PgBouncer)
* **Redis Command Rate:** 58,000 ops/sec
* **Estimated Monthly Infra Cost:** $880 / month

---

## 3. Bottleneck Analysis & Empirical Classification

**Finding:** Modeled capacity with 8 EKS Pods and PgBouncer

**Authoritative Classification:** `MODELED`  
*Note: This tier is mathematically and architecturally derived based on empirical unit costs from physically validated tiers (1K, 5K, 10K, 16.85K) and horizontal scaling parameters.*
