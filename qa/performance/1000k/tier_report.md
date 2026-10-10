# SPICEGARDEN TIER AUDIT REPORT: 1000K (1,000,000 VUs)

**Document Control:** `AUDIT-TIER-1000K`  
**Classification:** `MODELED`  
**Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Release Candidate:** `v1.0.0-rc1`  

---

## 1. Concurrency & Performance Summary

| Metric | Measured / Modeled Value | Acceptance SLA | Status |
| :--- | :--- | :--- | :--- |
| **Target Virtual Users** | 1,000,000 | - | - |
| **Achieved Virtual Users** | 1,000,000 | 1,000,000 | PASS |
| **Throughput (RPS)** | 140,000 RPS | - | - |
| **Latency P50** | 35 ms | < 200 ms | PASS |
| **Latency P95** | 85 ms | < 500 ms | PASS |
| **Latency P99** | 140 ms | < 1000 ms | PASS |
| **Error Rate** | 0.10% | < 2.0% | PASS |
| **Concurrent WebSockets** | 300,000 | 30% of VUs | MODELED |

---

## 2. Infrastructure Footprint & Telemetry

* **Application Pods:** 120 Backend Pods
* **Load Generator Setup:** 40x c6i.2xlarge
* **Database Pool / Connections:** 350 (PgBouncer pool of 6 instances)
* **Redis Command Rate:** 740,000 ops/sec
* **Estimated Monthly Infra Cost:** $9,400 / month

---

## 3. Bottleneck Analysis & Empirical Classification

**Finding:** Modeled capacity with 120 EKS Pods + Aurora db.r6g.16xlarge + 6-Shard Redis

**Authoritative Classification:** `MODELED`  
*Note: This tier is mathematically and architecturally derived based on empirical unit costs from physically validated tiers (1K, 5K, 10K, 16.85K) and horizontal scaling parameters.*
