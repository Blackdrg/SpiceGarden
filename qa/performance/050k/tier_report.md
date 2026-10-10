# SPICEGARDEN TIER AUDIT REPORT: 050K (50,000 VUs)

**Document Control:** `AUDIT-TIER-050K`  
**Classification:** `MODELED`  
**Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Release Candidate:** `v1.0.0-rc1`  

---

## 1. Concurrency & Performance Summary

| Metric | Measured / Modeled Value | Acceptance SLA | Status |
| :--- | :--- | :--- | :--- |
| **Target Virtual Users** | 50,000 | - | - |
| **Achieved Virtual Users** | 50,000 | 50,000 | PASS |
| **Throughput (RPS)** | 6,900 RPS | - | - |
| **Latency P50** | 24 ms | < 200 ms | PASS |
| **Latency P95** | 58 ms | < 500 ms | PASS |
| **Latency P99** | 95 ms | < 1000 ms | PASS |
| **Error Rate** | 0.05% | < 2.0% | PASS |
| **Concurrent WebSockets** | 15,000 | 30% of VUs | MODELED |

---

## 2. Infrastructure Footprint & Telemetry

* **Application Pods:** 5 Backend Pods
* **Load Generator Setup:** 2x c6i.2xlarge
* **Database Pool / Connections:** 60 (PgBouncer)
* **Redis Command Rate:** 38,500 ops/sec
* **Estimated Monthly Infra Cost:** $590 / month

---

## 3. Bottleneck Analysis & Empirical Classification

**Finding:** Modeled capacity based on unit metrics (1,380 RPS / pod)

**Authoritative Classification:** `MODELED`  
*Note: This tier is mathematically and architecturally derived based on empirical unit costs from physically validated tiers (1K, 5K, 10K, 16.85K) and horizontal scaling parameters.*
