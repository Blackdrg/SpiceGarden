# SPICEGARDEN — 100K GENERATOR CAPACITY REPORT

**Document ID:** `AUDIT-100K-GENERATOR-001`  
**Classification:** `LOAD GENERATION INFRASTRUCTURE AUDIT`  
**Date:** `2026-10-03T02:35:00.000Z`

---

## 1. Load Generator Allocation & Architecture Plan

To generate 100,000 Concurrent Virtual Users without encountering single-host socket exhaustion (such as the Windows `WSAENOBUFS` bottleneck hit at 22,400 VUs), the architecture plan specifies an 8-node distributed Linux load generation cluster.

### Specification & Planned Sizing
* **Generator Nodes:** 8x AWS EC2 `c6i.2xlarge` instances (8 vCPU, 16 GB RAM, 12.5 Gbps Network)
* **OS Distribution:** Ubuntu 22.04.4 LTS (Linux Kernel 5.15.0-1053-aws)
* **Target Workload per Generator:**
  * Target VUs per Generator: $12,500\text{ VUs}$
  * Target RPS per Generator: $1,725.0\text{ RPS}$
  * Ingress Bandwidth per Generator: $\approx 24.8\text{ Mbps}$
  * Egress Bandwidth per Generator: $\approx 57.9\text{ Mbps}$

---

## 2. Generator Telemetry Audit Matrix

| Generator Node ID | Claimed Instance Type | Target VUs | Claimed RPS | Claimed CPU (%) | Claimed Memory | Empirical `/proc/stat` Telemetry | Audit Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `gen-node-01` | `c6i.2xlarge` | 12,500 | 1,725.0 | 42.5% | 3.2 GB / 16 GB | None | `UNVERIFIED` |
| `gen-node-02` | `c6i.2xlarge` | 12,500 | 1,725.0 | 42.5% | 3.2 GB / 16 GB | None | `UNVERIFIED` |
| `gen-node-03` | `c6i.2xlarge` | 12,500 | 1,725.0 | 42.5% | 3.2 GB / 16 GB | None | `UNVERIFIED` |
| `gen-node-04` | `c6i.2xlarge` | 12,500 | 1,725.0 | 42.5% | 3.2 GB / 16 GB | None | `UNVERIFIED` |
| `gen-node-05` | `c6i.2xlarge` | 12,500 | 1,725.0 | 42.5% | 3.2 GB / 16 GB | None | `UNVERIFIED` |
| `gen-node-06` | `c6i.2xlarge` | 12,500 | 1,725.0 | 42.5% | 3.2 GB / 16 GB | None | `UNVERIFIED` |
| `gen-node-07` | `c6i.2xlarge` | 12,500 | 1,725.0 | 42.5% | 3.2 GB / 16 GB | None | `UNVERIFIED` |
| `gen-node-08` | `c6i.2xlarge` | 12,500 | 1,725.0 | 42.5% | 3.2 GB / 16 GB | None | `UNVERIFIED` |

---

## 3. Authoritative Audit Declaration

> **Generator capacity independently unverified.**

### Audit Finding
1. The 8x `c6i.2xlarge` generator architecture is technically appropriate and mathematically sized to sustain 100,000 VUs under Linux `epoll` socket recycling (`tcp_tw_reuse = 1`, `ip_local_port_range = 1024 65535`).
2. However, because no physical EC2 instances were provisioned or executed during the claimed benchmark run, generator-side CPU utilization, file descriptor allocation (`ulimit -n`), socket states (`TIME_WAIT`, `ESTABLISHED`), and k6 memory consumption were not empirically recorded.
