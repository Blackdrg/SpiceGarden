# SpiceGarden Performance Remediation — Phase 12: Distributed Load Generation Architecture

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Co-Located Single-Node Test Limitation

In the Phase 0 baseline test, both the **k6 load generator process** and the **NestJS backend server** ran on the same Windows host:

* **Host Hardware:** 2 CPU cores, 4 threads, 8 GB RAM.
* **Failure Mode at 30,000 VUs:** Windows dynamic port allocation exhausted (`WSAENOBUFS`), and CPU thread starvation between k6 and Node.js caused artificial latency inflation.
* **Engineering Conclusion:** Single-host load generation is strictly invalid for certifying true application throughput beyond 10,000 VUs.

---

## 2. Distributed Load Generator Architecture

To perform valid load generation at hyperscale:

``mermaid
graph TD
    M[Distributed k6 Orchestrator / Master] -->|Distributes Test Plan| W1[k6 Linux Worker Node 1]
    M -->|Distributes Test Plan| W2[k6 Linux Worker Node 2]
    M -->|Distributes Test Plan| W3[k6 Linux Worker Node 3]
    M -->|Distributes Test Plan| WN[k6 Linux Worker Node N]
    
    W1 -->|VPC 10 Gbps| NLB[AWS Network Load Balancer]
    W2 -->|VPC 10 Gbps| NLB
    W3 -->|VPC 10 Gbps| NLB
    WN -->|VPC 10 Gbps| NLB
    
    NLB --> K8S[SpiceGarden Kubernetes Cluster]
``
### Worker Sizing & Capacity Requirements

| VU Concurrency Tier | Required Linux Worker Nodes (c6i.2xlarge - 8 vCPU / 16GB) | Open Sockets per Worker | Network Bandwidth Requirement |
| :---: | :---: | :---: | :---: |
| **10,000 VUs** | 1 Node | 10,000 | 250 Mbps |
| **50,000 VUs** | 3 Nodes | 16,666 | 1.25 Gbps |
| **100,000 VUs** | 5 Nodes | 20,000 | 2.50 Gbps |
| **500,000 VUs** | 20 Nodes | 25,000 | 12.50 Gbps |
| **1,000,000 VUs** | 40 Nodes | 25,000 | 25.00 Gbps |

* **Linux OS Tuning for Load Workers:**
  * `sysctl -w net.ipv4.ip_local_port_range="1024 65535"` (64k ephemeral ports)
  * `sysctl -w net.ipv4.tcp_tw_reuse=1`
  * `sysctl -w fs.file-max=2097152`
  * `ulimit -n 1048576`
