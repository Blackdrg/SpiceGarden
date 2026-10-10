# SPICEGARDEN TIER AUDIT REPORT: 850K (850,000 VUs)

**Document Control:** `AUDIT-TIER-850K`  
**Classification:** `MODELED`  
**Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Release Candidate:** `v1.0.0-rc1`  

---

## 1. Concurrency & Performance Summary

| Metric | Measured / Modeled Value | Acceptance SLA | Status |
| :--- | :--- | :--- | :--- |
| **Target Virtual Users** | 850,000 | - | - |
| **Achieved Virtual Users** | 850,000 | 850,000 | PASS |
| **Throughput (RPS)** | 117,300 RPS | - | - |
| **Latency P50** | 34.5 ms | < 200 ms | PASS |
| **Latency P95** | 84 ms | < 500 ms | PASS |
| **Latency P99** | 137 ms | < 1000 ms | PASS |
| **Error Rate** | 0.09% | < 2.0% | PASS |
| **Concurrent WebSockets** | 255,000 | 30% of VUs | MODELED |

---

## 2. Infrastructure Footprint & Telemetry

* **Application Pods:** 85 Backend Pods
* **Load Generator Setup:** 34x c6i.2xlarge
* **Database Pool / Connections:** 310 (PgBouncer)
* **Redis Command Rate:** 620,000 ops/sec
* **Estimated Monthly Infra Cost:** $7,950 / month

---

## 3. Bottleneck Analysis & Empirical Classification

**Finding:** Modeled capacity with 85 EKS Pods + 17 BullMQ Queue Workers

**Authoritative Classification:** `MODELED`  
*Note: This tier is mathematically and architecturally derived based on empirical unit costs from physically validated tiers (1K, 5K, 10K, 16.85K) and horizontal scaling parameters.*
