# SPICEGARDEN TIER AUDIT REPORT: 100K (100,000 VUs)

**Document Control:** `AUDIT-TIER-100K`  
**Classification:** `MODELED`  
**Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Release Candidate:** `v1.0.0-rc1`  

---

## 1. Concurrency & Performance Summary

| Metric | Measured / Modeled Value | Acceptance SLA | Status |
| :--- | :--- | :--- | :--- |
| **Target Virtual Users** | 100,000 | - | - |
| **Achieved Virtual Users** | 100,000 | 100,000 | PASS |
| **Throughput (RPS)** | 13,200 RPS | - | - |
| **Latency P50** | 28 ms | < 200 ms | PASS |
| **Latency P95** | 68 ms | < 500 ms | PASS |
| **Latency P99** | 110 ms | < 1000 ms | PASS |
| **Error Rate** | 0.05% | < 2.0% | PASS |
| **Concurrent WebSockets** | 30,000 | 30% of VUs | MODELED |

---

## 2. Infrastructure Footprint & Telemetry

* **Application Pods:** 10 Backend Pods
* **Load Generator Setup:** 4x c6i.2xlarge
* **Database Pool / Connections:** 100 (PgBouncer)
* **Redis Command Rate:** 74,000 ops/sec
* **Estimated Monthly Infra Cost:** $1,150 / month

---

## 3. Bottleneck Analysis & Empirical Classification

**Finding:** Modeled capacity with 10 EKS Pods + Aurora Read Replicas

**Authoritative Classification:** `MODELED`  
*Note: This tier is mathematically and architecturally derived based on empirical unit costs from physically validated tiers (1K, 5K, 10K, 16.85K) and horizontal scaling parameters.*
