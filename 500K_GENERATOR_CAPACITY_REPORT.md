# SPICEGARDEN — 500K GENERATOR CAPACITY & SIZING REPORT

**Document ID:** `AUDIT-500K-GENERATOR-001`  
**Classification:** `LOAD GENERATION INFRASTRUCTURE AUDIT`  
**Date:** `2026-10-03T02:45:00.000Z`

---

## 1. 500K Load Generator Fleet Architecture

To generate 500,000 Concurrent Virtual Users without experiencing client-side socket starvation, the architecture plan requires a 20-node distributed Linux load generation fleet:

### Generator Cluster Sizing
* **Instance Count:** 20x AWS EC2 `c6i.2xlarge` instances
* **Total Compute:** 160 vCPU cores (Intel Xeon 8375C @ 3.5 GHz)
* **Total Memory:** 320 GB RAM (16 GB per instance)
* **Total Network Capacity:** 250 Gbps aggregate network bandwidth (12.5 Gbps per instance)
* **Operating System:** Ubuntu 22.04.4 LTS (Kernel 5.15.0-1053-aws)

---

## 2. Per-Generator Operating Parameters

| Parameter | Per-Generator Target | Total Fleet Target (20 Nodes) |
| :--- | :--- | :--- |
| **Virtual Users (VUs)** | 25,000 VUs / node | 500,000 VUs |
| **Throughput (RPS)** | 2,900.0 RPS / node | 58,000.0 RPS |
| **Ingress Bandwidth** | 41.7 Mbps / node | 834.0 Mbps |
| **Egress Bandwidth** | 97.4 Mbps / node | 1,948.0 Mbps |
| **Open File Descriptors** | $\sim 35,000$ sockets (`ulimit -n 1048576`) | $\sim 700,000$ active sockets |
| **Target CPU Utilization** | $45\% - 55\%$ | $45\% - 55\%$ fleet average |
| **Target Memory Utilization** | $5.8\text{ GB} / 16\text{ GB}$ ($36\%$) | $116\text{ GB} / 320\text{ GB}$ ($36\%$) |

---

## 3. Required Linux Kernel Network Tuning (`/etc/sysctl.d/99-k6-500k.conf`)

```ini
# Support 25,000 concurrent sockets per generator
fs.file-max = 2097152
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_max_syn_backlog = 65535
```

---

## 4. Authoritative Audit Finding

> **Generator capacity independently unverified.**

### Forensic Evaluation
1. The 20x `c6i.2xlarge` Linux generator configuration is mathematically sound and capable of sustaining 500,000 VUs under properly tuned kernel parameters.
2. However, because no physical EC2 generator instances were provisioned or executed, client-side metrics (`/proc/stat`, socket recycling latency, k6 worker aggregation) remain unrecorded.
