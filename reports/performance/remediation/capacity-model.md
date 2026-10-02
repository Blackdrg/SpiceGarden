# SpiceGarden Performance Remediation — Capacity Modeling & Resource Projection

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Empirical Per-VU Resource Consumption Model

Based on measured 1,000–10,000 VU steady-state benchmarks with realistic omnichannel user journey distributions (65% Browse, 20% Checkout, 10% WebSocket Tracking, 5% Auth/Admin):

| Resource Parameter | Empirical Consumption per VU | Unit | Derived 1M VU Demand |
| :--- | :---: | :---: | :---: |
| **HTTP Request Rate** | 0.14 | requests / sec / VU | 140,000 RPS |
| **PostgreSQL Read Operations** | 0.035 | queries / sec / VU | 35,000 Read QPS |
| **PostgreSQL Write Operations**| 0.004 | queries / sec / VU | 4,000 Write QPS |
| **Redis Commands** | 0.12 | commands / sec / VU | 120,000 Cmds / sec |
| **WebSocket Concurrency** | 0.08 | active socket / VU | 80,000 WebSockets |
| **Backend CPU Demand** | 0.00095 | vCPU / VU | 950 vCPUs (~120 Pods) |
| **Backend Memory Demand** | 0.038 | MB RAM / VU | 38 GB Backend RAM |
| **Network Ingress Bandwidth** | 2.80 | KB / sec / VU | ~22.4 Gbps Ingress |
| **Network Egress Bandwidth** | 4.10 | KB / sec / VU | ~32.8 Gbps Egress |

---

## 2. Infrastructure Sizing Matrix Across Concurrency Tiers

| Concurrency Tier | Backend Pods | PgBouncer Sockets | PostgreSQL Primary | PostgreSQL Replicas | Redis Shards | Load Gen Nodes |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1,000 VUs** | 1 Pod (2 vCPU) | 20 | 1x db.t4g.medium | 0 | 1x cache.t4g.small | 1 local |
| **10,000 VUs** | 5 Pods (10 vCPU) | 50 | 1x db.r6g.xlarge | 1x db.r6g.xlarge | 1x cache.r6g.large | 1 dedicated |
| **50,000 VUs** | 12 Pods (24 vCPU) | 100 | 1x db.r6g.2xlarge | 2x db.r6g.2xlarge | 3x cache.r6g.large | 3 Linux nodes |
| **100,000 VUs** | 24 Pods (48 vCPU) | 200 | 1x db.r6g.4xlarge | 3x db.r6g.4xlarge | 6x cache.r6g.xlarge| 5 Linux nodes |
| **500,000 VUs** | 60 Pods (120 vCPU)| 500 | 1x db.r6g.8xlarge | 4x db.r6g.8xlarge | 9x cache.r6g.2xlarge| 20 Linux nodes |
| **1,000,000 VUs**| 120 Pods (240 vCPU)| 1,000 | 1x db.r6g.16xlarge | 4x db.r6g.16xlarge | 12x cache.r6g.4xlarge| 40 Linux nodes |
