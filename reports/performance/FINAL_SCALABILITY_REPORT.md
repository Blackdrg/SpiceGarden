# SpiceGarden Enterprise SaaS — Final Scalability & Concurrency Report

**Target System:** SpiceGarden Multi-Tenant Food Delivery SaaS  
**Release Candidate:** `v1.0.0-rc1`  
**Git Branch:** `perf/1m-real-capacity` (`ca349e510d3c18a7517da7502f70ef15bd37fe77`)  
**Audit Date:** 2026-10-02  

---

## 1. Concurrency Tier Classification & Empirical Evidence

Every major concurrency tier in SpiceGarden is classified strictly according to empirical execution versus architectural capacity modeling:

| Tier | Target VUs | Measured / Modelled VUs | RPS | Latency p95 | Error Rate | Infrastructure Topology | Status Classification |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **Tier 1** | 1,000 | 1,000 | 238.0 | 68.5 ms | 0.02% | Single-Node Host (2C/4T, 8GB RAM) | `MEASURED / SLA-COMPLIANT` |
| **Tier 2** | 5,000 | 5,000 | 808.6 | 312.0 ms | 0.58% | Single-Node Host (2C/4T, 8GB RAM) | `MEASURED / SLA-COMPLIANT` |
| **Tier 3** | 10,000 | 10,000 | 1,373.3 | 492.0 ms | 1.15% | Single-Node Host (2C/4T, 8GB RAM) | `MEASURED / SLA-COMPLIANT` |
| **Tier 4** | 15,000 | 15,000 | 1,700.0 | 745.0 ms | 2.40% | Single-Node Host (2C/4T, 8GB RAM) | `MEASURED / SUSTAINED (DEGRADED)` |
| **Tier 5** | 20,000 | 16,850 | 1,942.0 | 960.0 ms | 4.80% | Single-Node Host (2C/4T, 8GB RAM) | `MEASURED / HIGHEST SUSTAINED` |
| **Tier 6** | 30,000 | 22,400 | 2,150.0 | 1,850.0 ms | 10.60% | Single-Node Host (`WSAENOBUFS` ceiling) | `MEASURED WITH LIMITATIONS` |
| **Tier 7** | 50,000 | 50,000 | 6,900.0 | 58.0 ms | < 0.05% | 5 Pods + PgBouncer (Transaction Pool) | `CAPACITY MODEL` |
| **Tier 8** | 100,000 | 100,000 | 13,200.0 | 68.0 ms | < 0.05% | 10 Pods + PgBouncer + Read Replicas | `CAPACITY MODEL` |
| **Tier 9** | 250,000 | 250,000 | 32,500.0 | 72.0 ms | < 0.06% | 25 Pods + PgBouncer + Read Replicas | `CAPACITY MODEL` |
| **Tier 10**| 500,000 | 500,000 | 58,000.0 | 78.0 ms | < 0.08% | 50 Pods + PgBouncer + Redis Cluster | `CAPACITY MODEL` |
| **Tier 11**| 750,000 | 750,000 | 105,000.0 | 82.0 ms | < 0.09% | 80 Pods + Aurora Primary + 4 Replicas | `CAPACITY MODEL` |
| **Tier 12**| 1,000,000| 1,000,000| 140,000.0 | 85.0 ms | < 0.10% | 120 Pods + Aurora 1+4 + 40-Node k6 Fleet | `1M VU CAPACITY MODEL` |

---

## 2. Definitive Status of the 1,000,000 VU Goal

* **Status:** `1M VU CAPACITY MODEL / CONFIGURATION COMPLETE / NOT YET EXECUTED AT LIVE DISTRIBUTED SCALE`
* **Empirical Peak Verified:** **16,850 VUs** sustained concurrency on reference hardware; **10,000 VUs** within strict SLA criteria (p95 < 500ms, error rate < 2%).
* **Scripted & Provisioned Harness:** A production-grade Kubernetes distributed load testing harness with 40 k6 worker pods, multi-tenant datasets, and six workload scenarios (browse, search, cart, checkout, tracking, admin) is fully implemented in [`infra/load-tests/1m/`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/1m/).
* **Remaining Path to Live 1M Execution:** Provisioning a 40-node Linux Kubernetes worker cluster (e.g. AWS c6i.2xlarge) against a multi-pod EKS cluster backed by Amazon Aurora PostgreSQL (1 Primary, 4 Read Replicas) and executing `infra/load-tests/1m/distributed/distributed-runner.sh`.
