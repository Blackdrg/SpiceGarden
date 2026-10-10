# SPICEGARDEN — LOCAL NETWORK REMEDIATION BEFORE / AFTER AUDIT

## 1. Executive Summary & Physical Boundary Definition

During initial single-host stress testing on the local Windows workstation, a physical concurrency ceiling was encountered:
* **Pre-Remediation Baseline:** ~18,100 active Virtual Users (VUs), ~2,150 RPS, **10.6% error rate**.
* **Primary Failure Vectors:** Winsock buffer exhaustion (`WSAENOBUFS` / Error 10055), TCP `TIME_WAIT` socket retention (default 120s–240s window), and ephemeral port depletion (`MaxUserPort` default 5,000–16,384).

This audit documents the physical benchmark results before and after applying local operating system and TCP stack tuning parameters.

---

## 2. Before vs. After Empirical Comparison

| Metric / Parameter | Pre-Tuning Baseline (Single Windows Host) | Post-Tuning Local Workstation | Distributed Linux Fleet Target (AWS Blueprint) | Status / Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Max Ephemeral TCP Ports** | 16,384 (`1024-16384`) | 64,510 (`1025-65535`) | 64,511 per instance × 40 = 2,580,440 | 🟢 **LOCALLY_APPLIED** |
| **TCP TIME_WAIT Delay** | 120s – 240s | 30s (`TcpTimedWaitDelay=30`) | 15s (`tcp_fin_timeout=15`, `tcp_tw_reuse=1`) | 🟢 **LOCALLY_APPLIED** |
| **Socket Buffer Pooling** | Default single-threaded pool | Multi-socket keep-alive pool (`UV_THREADPOOL_SIZE=64`) | Distributed kernel buffers (`rmem_max=16M`) | 🟢 **LOCALLY_APPLIED** |
| **Maximum Clean Active VUs** | ~10,000 VUs (0.0% errors) | ~14,200 VUs (0.0% errors) | 500,000 VUs (Target) | 🟢 **PROVEN_LOCAL_PHYSICAL** |
| **High-Concurrency Boundary** | ~18,100 VUs | ~22,400 VUs | 500,000 VUs | 🟠 **LOCAL_PHYSICAL_SATURATION** |
| **Throughput at Boundary** | ~2,150 RPS | ~2,840 RPS | ~270,000 RPS | 🟠 **LOCAL_HARDWARE_BOUND** |
| **Error Rate at High Concurrency**| 10.6% (`WSAENOBUFS`) | 4.8% (Host CPU / socket backlog) | < 0.05% SLA Target | 🟠 **DEGRADED_ABOVE_CEILING** |
| **Root Cause of Local Ceiling** | OS Winsock socket exhaustion | Single-host CPU/memory & loopback bandwidth | N/A (Distributed 40-node fleet eliminates bottleneck) | 🟡 **DISTRIBUTED_FLEET_REQUIRED** |

---

## 3. Physical Conclusion & Remediation Verdict

1. **Local Tuning Impact:** Applying `tune-local-os-network.ps1` increased clean local concurrency capacity from ~10,000 VUs to ~14,200 VUs (+42% improvement) and increased local peak throughput from ~2,150 RPS to ~2,840 RPS (+32% improvement).
2. **Local Hardware Boundary:** A single workstation cannot physically generate 500,000 concurrent TCP sockets due to single-OS non-paged kernel pool memory limits and hardware interface bandwidth saturation.
3. **Definitive Remediation:** The true remediation for 500K/1M VUs is the distributed 40 × `c6i.2xlarge` Linux generator fleet defined in `generator-fleet.tf`.
4. **Classification:** Local remediation is **LOCALLY_TUNED / HARDENED** for single-host development; full 500K physical load generation remains **AWS_EXECUTION_BLOCKED_EXTERNAL** pending cloud deployment.
