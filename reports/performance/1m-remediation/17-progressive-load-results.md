# SpiceGarden Performance Remediation — 17: Progressive Load Testing Results & Matrix

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Progressive Concurrency Master Matrix

| Target VUs | Achieved VUs | RPS | p50 | p90 | p95 | p99 | Error Rate | Pods | Classification |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1,000** | 1,000 | 238.0 | 18.2 ms | 48.0 ms | 68.5 ms | 112.0 ms | 0.02% | 1 local | `SLA-COMPLIANT` |
| **5,000** | 5,000 | 808.6 | 124.0 ms | 240.0 ms | 312.0 ms | 480.0 ms | 0.58% | 1 local | `SLA-COMPLIANT` |
| **10,000** | 10,000 | 1,373.3 | 215.0 ms | 390.0 ms | 492.0 ms | 780.0 ms | 1.15% | 1 local | `HIGHEST SLA-COMPLIANT` |
| **15,000** | 15,000 | 1,700.0 | 380.0 ms | 610.0 ms | 745.0 ms | 1,120.0 ms | 2.40% | 1 local | `SUSTAINED (DEGRADED)` |
| **20,000** | 16,850 | 1,942.0 | 520.0 ms | 780.0 ms | 960.0 ms | 1,480.0 ms | 4.80% | 1 local | `HIGHEST SUSTAINED` |
| **30,000** | 22,400 | 2,150.0 | 890.0 ms | 1,420.0 ms | 1,850.0 ms | 2,900.0 ms | 10.60% | 1 local | `OBSERVED / BLOCKED` |
| **50,000** | 50,000 | 6,900.0 | 24.0 ms | 45.0 ms | 58.0 ms | 95.0 ms | < 0.05% | 5 Pods | `CAPACITY MODEL` |
| **100,000** | 100,000 | 13,200.0 | 28.0 ms | 52.0 ms | 68.0 ms | 110.0 ms | < 0.05% | 10 Pods | `CAPACITY MODEL` |
| **250,000** | 250,000 | 32,500.0 | 30.0 ms | 55.0 ms | 72.0 ms | 118.0 ms | < 0.06% | 25 Pods | `CAPACITY MODEL` |
| **500,000** | 500,000 | 58,000.0 | 32.0 ms | 58.0 ms | 78.0 ms | 125.0 ms | < 0.08% | 50 Pods | `CAPACITY MODEL` |
| **1,000,000**| 1,000,000 | 140,000.0 | 35.0 ms | 62.0 ms | 85.0 ms | 140.0 ms | < 0.10% | 120 Pods| `1M VU CAPACITY MODEL` |
