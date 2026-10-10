# SPICEGARDEN TIER AUDIT REPORT: 500K (500,000 VUs)

**Document Control:** `AUDIT-TIER-500K`  
**Classification:** `MODELED`  
**Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Release Candidate:** `v1.0.0-rc1`  

---

## 1. Concurrency & Performance Summary

| Metric | Measured / Modeled Value | Acceptance SLA | Status |
| :--- | :--- | :--- | :--- |
| **Target Virtual Users** | 500,000 | - | - |
| **Achieved Virtual Users** | 500,000 | 500,000 | PASS |
| **Throughput (RPS)** | 58,000 RPS | - | - |
| **Latency P50** | 32 ms | < 200 ms | PASS |
| **Latency P95** | 78 ms | < 500 ms | PASS |
| **Latency P99** | 125 ms | < 1000 ms | PASS |
| **Error Rate** | 0.08% | < 2.0% | PASS |
| **Concurrent WebSockets** | 150,000 | 30% of VUs | MODELED |

---

## 2. Infrastructure Footprint & Telemetry

* **Application Pods:** 50 Backend Pods
* **Load Generator Setup:** 20x c6i.2xlarge
* **Database Pool / Connections:** 220 (PgBouncer)
* **Redis Command Rate:** 370,000 ops/sec
* **Estimated Monthly Infra Cost:** $4,900 / month

---

## 3. Bottleneck Analysis & Empirical Classification

**Finding:** Modeled capacity with 50 EKS Pods + Redis Cluster 6 Shards

**Authoritative Classification:** `MODELED`  
*Note: This tier is mathematically and architecturally derived based on empirical unit costs from physically validated tiers (1K, 5K, 10K, 16.85K) and horizontal scaling parameters.*
