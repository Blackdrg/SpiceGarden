# SpiceGarden — Phase 10: Distributed k6 Load Generation Architecture

**Objective:** Isolate load generation from application compute to eliminate single-host socket and CPU contention.

---

## 1. Distributed Fleet Topology

* **k6 Master Controller:** Coordinates distributed execution stages and aggregates realtime metrics.
* **40x Linux k6 Workers (`c6i.2xlarge`):** Each generating 25,000 VUs / 3,500 RPS.
* **Network Tuning:** Configured 65,535 file descriptors and `tcp_tw_reuse` to prevent socket pool exhaustion.
* **Target:** AWS Application Load Balancer $\rightarrow$ 120 EKS Backend Pods $\rightarrow$ PgBouncer + PostgreSQL Primary/Replicas + Redis Cluster.
