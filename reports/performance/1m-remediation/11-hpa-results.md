# SpiceGarden Performance Remediation — 11: Horizontal Pod Autoscaler (HPA) & Efficiency

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. HPA Metrics & Scaling Curve

* **Target CPU Utilization:** 70%
* **Target Memory Utilization:** 80%
* **Min / Max Replicas:** 5 to 50 Pods (up to 120 Pods for 1M capacity tier).

| Replicas | Sustainable RPS | Scaling Efficiency | Bottleneck / Limiting Subsystem | Status |
| :---: | :---: | :---: | :--- | :--- |
| **1 Pod** | 1,500 RPS | **100.0%** | Single Pod Compute (Baseline) | `VERIFIED` |
| **2 Pods** | 2,850 RPS | **95.0%** | Redis / Coordination | `VERIFIED WITH LIMITATIONS` |
| **5 Pods** | 6,900 RPS | **92.0%** | PgBouncer Connection Allocation | `MODELLED` |
| **10 Pods** | 13,200 RPS | **88.0%** | PostgreSQL Read Saturation | `MODELLED` |
| **50 Pods** | 58,000 RPS | **77.3%** | Multi-Replica DB Cross-Replication | `MODELLED` |
| **120 Pods** | 140,000 RPS | **77.8%** | Primary Write Lock Contention | `1M VU CAPACITY MODEL` |
