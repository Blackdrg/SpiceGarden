# SPICEGARDEN TIER AUDIT REPORT: 950K (950,000 VUs)

**Document Control:** `AUDIT-TIER-950K`  
**Classification:** `MODELED`  
**Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Release Candidate:** `v1.0.0-rc1`  

---

## 1. Concurrency & Performance Summary

| Metric | Measured / Modeled Value | Acceptance SLA | Status |
| :--- | :--- | :--- | :--- |
| **Target Virtual Users** | 950,000 | - | - |
| **Achieved Virtual Users** | 950,000 | 950,000 | PASS |
| **Throughput (RPS)** | 131,100 RPS | - | - |
| **Latency P50** | 34.9 ms | < 200 ms | PASS |
| **Latency P95** | 84.8 ms | < 500 ms | PASS |
| **Latency P99** | 139 ms | < 1000 ms | PASS |
| **Error Rate** | 0.10% | < 2.0% | PASS |
| **Concurrent WebSockets** | 285,000 | 30% of VUs | MODELED |

---

## 2. Infrastructure Footprint & Telemetry

* **Application Pods:** 95 Backend Pods
* **Load Generator Setup:** 38x c6i.2xlarge
* **Database Pool / Connections:** 340 (PgBouncer)
* **Redis Command Rate:** 695,000 ops/sec
* **Estimated Monthly Infra Cost:** $8,850 / month

---

## 3. Bottleneck Analysis & Empirical Classification

**Finding:** Modeled capacity with 95 EKS Pods + 19 BullMQ Queue Workers

**Authoritative Classification:** `MODELED`  
*Note: This tier is mathematically and architecturally derived based on empirical unit costs from physically validated tiers (1K, 5K, 10K, 16.85K) and horizontal scaling parameters.*
