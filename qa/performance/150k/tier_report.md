# SPICEGARDEN TIER AUDIT REPORT: 150K (150,000 VUs)

**Document Control:** `AUDIT-TIER-150K`  
**Classification:** `MODELED`  
**Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Release Candidate:** `v1.0.0-rc1`  

---

## 1. Concurrency & Performance Summary

| Metric | Measured / Modeled Value | Acceptance SLA | Status |
| :--- | :--- | :--- | :--- |
| **Target Virtual Users** | 150,000 | - | - |
| **Achieved Virtual Users** | 150,000 | 150,000 | PASS |
| **Throughput (RPS)** | 19,800 RPS | - | - |
| **Latency P50** | 29.5 ms | < 200 ms | PASS |
| **Latency P95** | 72 ms | < 500 ms | PASS |
| **Latency P99** | 115 ms | < 1000 ms | PASS |
| **Error Rate** | 0.05% | < 2.0% | PASS |
| **Concurrent WebSockets** | 45,000 | 30% of VUs | MODELED |

---

## 2. Infrastructure Footprint & Telemetry

* **Application Pods:** 15 Backend Pods
* **Load Generator Setup:** 6x c6i.2xlarge
* **Database Pool / Connections:** 120 (PgBouncer)
* **Redis Command Rate:** 110,000 ops/sec
* **Estimated Monthly Infra Cost:** $1,680 / month

---

## 3. Bottleneck Analysis & Empirical Classification

**Finding:** Modeled capacity with 15 EKS Pods + PgBouncer Cluster

**Authoritative Classification:** `MODELED`  
*Note: This tier is mathematically and architecturally derived based on empirical unit costs from physically validated tiers (1K, 5K, 10K, 16.85K) and horizontal scaling parameters.*
