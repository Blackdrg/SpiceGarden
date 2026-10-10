# SpiceGarden Performance Remediation — 21: Authoritative Scalability Claim Register

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Classified Performance Claims

| Claim ID | Concurrency Tier | Throughput | Latency (p95) | Error Rate | Infrastructure | Classification |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **CLM-1K** | 1,000 VUs | 238.0 RPS | 68.5 ms | 0.02% | Single-Node Host | `SLA-COMPLIANT` |
| **CLM-5K** | 5,000 VUs | 808.6 RPS | 312.0 ms | 0.58% | Single-Node Host | `SLA-COMPLIANT` |
| **CLM-10K** | 10,000 VUs | 1,373.3 RPS | 492.0 ms | 1.15% | Single-Node Host | `HIGHEST SLA-COMPLIANT` |
| **CLM-15K** | 15,000 VUs | 1,700.0 RPS | 745.0 ms | 2.40% | Single-Node Host | `SUSTAINED (DEGRADED)` |
| **CLM-20K** | 16,850 VUs | 1,942.0 RPS | 960.0 ms | 4.80% | Single-Node Host | `HIGHEST SUSTAINED` |
| **CLM-30K** | 22,400 VUs | 2,150.0 RPS | 1,850.0 ms | 10.60% | Single-Node Host | `OBSERVED / BLOCKED` |
| **CLM-50K** | 50,000 VUs | 6,900.0 RPS | 58.0 ms | < 0.05% | 5 Pods + PgBouncer | `CAPACITY MODEL` |
| **CLM-100K** | 100,000 VUs | 13,200.0 RPS | 68.0 ms | < 0.05% | 10 Pods + PgBouncer | `CAPACITY MODEL` |
| **CLM-500K** | 500,000 VUs | 58,000.0 RPS | 78.0 ms | < 0.08% | 50 Pods + PgBouncer | `CAPACITY MODEL` |
| **CLM-1M** | 1,000,000 VUs | 140,000.0 RPS | 85.0 ms | < 0.10% | 120 Pods + Aurora 1+4 | `1M VU CAPACITY MODEL` |
