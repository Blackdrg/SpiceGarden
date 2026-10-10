# SpiceGarden Progressive Load Simulation — Stage 7: 50,000 VUs Simulation

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Execution Stage:** Stage 7 — 50,000 Simulated Virtual Users  
**Classification:** `SIMULATED — DISTRIBUTED LOAD GENERATION REQUIRED FOR ACTUAL 50K VU TEST`  
**Date:** 2026-10-02  

---

## 1. Distributed Infrastructure Modeling for 50K VUs

A live 50,000 VU load test cannot be executed safely on a single developer workstation without severe client-side throttling. The following mathematical and architectural model defines the exact infrastructure required:

### Load Generation Requirements

| Parameter | Single Workstation (Current) | Required Distributed Cluster (50k VUs) | Sizing Factor |
| :--- | :--- | :--- | :---: |
| **Load Generator Nodes** | 1 Node (Windows) | **5 Dedicated Linux Nodes** (c6i.2xlarge) | 5x |
| **Load Gen CPU / RAM** | 2 Cores / 8 GB | **40 vCPUs / 80 GB RAM Total** | 10x |
| **Outbound Ephemeral Ports** | ~16k Ports | **320,000 Ports Total** (64k per node) | 20x |
| **Target Backend Pods** | 1 Process | **12–16 NestJS Pods** (HPA Autoscaled) | 12x |
| **PgBouncer Pool Size** | None (Direct DB) | **2 Dedicated PgBouncer Instances** (Pool: 500) | - |
| **PostgreSQL Server** | Local / Single | **db.r6g.2xlarge** (8 vCPU, 64 GB RAM, Multi-AZ)| 8x |
| **Redis Cluster** | Single Node | **cache.r6g.xlarge** (3 Shards, 1 Replica each) | 6x |

---

## 2. Mathematical Throughput & Network Estimation

Under the 50,000 VU workload model (1 req / 5s average think time):
- **Expected Request Rate (RPS):** `50,000 VUs / 5s = 10,000 HTTP req/s`
- **Expected Bandwidth Consumption:** `10,000 req/s * 15 KB avg payload = 150 MB/s (1.2 Gbps)`
- **Database Query Rate:** `~15,000 queries/sec` (with 70% cache hit ratio)
- **Redis Operations Rate:** `~25,000 ops/sec` (Rate limiting, caching, session validation)

---

## 3. Production Hardening Manifest Compliance

The repository configuration in [`infra/k8s/production-hardened.yaml`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/k8s/production-hardened.yaml) explicitly defines the autoscaling targets and resource limits to sustain 50,000 VUs:
- **HPA Min Replicas:** 3 pods
- **HPA Max Replicas:** 20 pods
- **CPU Target Utilization:** 70%
- **Pod Resource Requests:** 500m CPU / 512Mi Memory
- **Pod Resource Limits:** 1000m CPU / 1024Mi Memory
