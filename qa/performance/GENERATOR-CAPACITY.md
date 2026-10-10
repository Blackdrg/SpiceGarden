# SPICEGARDEN — LOAD GENERATOR CAPACITY & LINUX SIZING

**Document Control:** `GEN-CAP-002` | **Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Execution Timestamp:** `2026-10-03T01:52:00.000Z`  
**Standard:** Strict Generator-Side Telemetry & Resource Isolation

---

## 1. Generator Capacity Principles

To guarantee that the load generation fleet never becomes an invisible bottleneck or skews latency measurements:
1. **Generator CPU Cap:** Generator node CPU utilization must remain $< 75\%$.
2. **Generator Memory Cap:** RAM usage must remain $< 60\%$ of total instance memory.
3. **Dropped Iterations:** Dropped k6 iterations must be zero. If dropped iterations occur, the tier is classified as `LOAD GENERATOR LIMITED`.
4. **Socket & File Descriptor Overhead:** File descriptor usage must remain $< 40\%$ of `fs.file-max`.
5. **Independent Telemetry Reporting:** Each generator node runs Node Exporter and reports CPU, RAM, network I/O, socket states (ESTABLISHED, TIME_WAIT), and k6 internal metrics independently.

---

## 2. Distributed Linux Fleet Sizing (Path to 1M VUs)

| Target Scale (VUs) | Target RPS | Linux Generator Fleet (`c6i.2xlarge`) | VUs / Generator Node | Network Egress / Node | Active Sockets / Node | Expected Gen CPU |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **10,000 VUs** | 1,400 RPS | 1 Node (8 vCPU, 16GB) | 10,000 | ~110 Mbps | 12,000 | ~35% |
| **25,000 VUs** | 3,500 RPS | 1 Node (8 vCPU, 16GB) | 25,000 | ~275 Mbps | 30,000 | ~65% |
| **50,000 VUs** | 6,900 RPS | 2 Nodes | 25,000 | ~275 Mbps | 30,000 | ~65% |
| **100,000 VUs** | 13,200 RPS | 4 Nodes | 25,000 | ~280 Mbps | 30,000 | ~65% |
| **250,000 VUs** | 34,000 RPS | 10 Nodes | 25,000 | ~280 Mbps | 30,000 | ~65% |
| **500,000 VUs** | 58,000 RPS | 20 Nodes | 25,000 | ~290 Mbps | 30,000 | ~65% |
| **750,000 VUs** | 103,500 RPS | 30 Nodes | 25,000 | ~300 Mbps | 30,000 | ~65% |
| **1,000,000 VUs**| 140,000 RPS | 40 Nodes | 25,000 | ~310 Mbps | 30,000 | ~65% |

---

## 3. Generator Linux Kernel & Network Tuning (`sysctl.conf`)

```ini
# Ephemeral Port Range expansion (64k available ports per IP)
net.ipv4.ip_local_port_range = 1024 65535

# Fast TCP socket reuse
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15

# Socket backlog and buffer allocations
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 100000
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# Open file limits
fs.file-max = 2097152
fs.nr_open = 2097152
```
