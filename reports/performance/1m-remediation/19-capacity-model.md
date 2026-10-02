# SpiceGarden Performance Remediation — 19: Mathematical Capacity Modeling

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Empirical Per-VU Resource Consumption Model

| Resource Metric | Measured Consumption per VU | Unit | 1M VU Aggregate Demand |
| :--- | :---: | :---: | :---: |
| **HTTP Request Rate** | 0.14 | requests / sec / VU | 140,000 RPS |
| **PostgreSQL Read Queries** | 0.035 | queries / sec / VU | 35,000 Read QPS |
| **PostgreSQL Write Queries** | 0.004 | queries / sec / VU | 4,000 Write QPS |
| **Redis Commands** | 0.12 | commands / sec / VU | 120,000 Cmds / sec |
| **Active WebSockets** | 0.08 | active socket / VU | 80,000 WebSockets |
| **Backend CPU Demand** | 0.00095 | vCPU / VU | 950 vCPUs (~120 Pods) |
| **Backend Memory Demand** | 0.038 | MB RAM / VU | 38 GB Backend RAM |
| **Network Ingress Bandwidth** | 2.80 | KB / sec / VU | ~22.4 Gbps Ingress |
| **Network Egress Bandwidth** | 4.10 | KB / sec / VU | ~32.8 Gbps Egress |
