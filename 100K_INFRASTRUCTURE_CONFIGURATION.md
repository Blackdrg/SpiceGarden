# SPICEGARDEN — 100K INFRASTRUCTURE CONFIGURATION

**Document ID:** `SG-100K-INFRA-001` | **Classification:** `INFRASTRUCTURE BLUEPRINT`  
**Release Candidate:** `v1.0.0-rc1` | **Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Date:** `2026-10-03T02:00:00.000Z`

---

## 1. Distributed Load Generation Fleet (Linux)

* **Nodes:** 8x AWS EC2 `c6i.2xlarge` (8 vCPU, 16 GB RAM, 12.5 Gbps network)
* **OS:** Ubuntu 22.04.4 LTS (Kernel 5.15.0-1053-aws)
* **Kernel & Network Tuning:**
  ```ini
  # /etc/sysctl.d/99-k6-scale.conf
  fs.file-max = 2097152
  net.core.somaxconn = 65535
  net.core.netdev_max_backlog = 65535
  net.ipv4.ip_local_port_range = 1024 65535
  net.ipv4.tcp_tw_reuse = 1
  net.ipv4.tcp_fin_timeout = 15
  net.ipv4.tcp_max_syn_backlog = 65535
  ```
* **Process Limit:** `ulimit -n 1048576`

---

## 2. Application Cluster Architecture (Kubernetes / EKS)

* **Worker Nodes:** 3x `c6i.4xlarge` instances (16 vCPU, 32 GB RAM each)
* **Application Pods:** 10 Backend Pods managed via Deployment & HPA
  * CPU Request: `1000m`, CPU Limit: `2000m`
  * Memory Request: `1024Mi`, Memory Limit: `2048Mi`
  * HPA Target: `65%` CPU Utilization

---

## 3. Database Layer (PostgreSQL & PgBouncer)

* **Primary RDS:** `db.r6g.4xlarge` (16 vCPU, 128 GB RAM, 12,000 Provisioned IOPS)
* **Read Replica:** `db.r6g.4xlarge` (Offloading catalog and search queries)
* **PgBouncer Configuration:**
  * Mode: `transaction`
  * `max_client_conn = 10000`
  * `default_pool_size = 120`
  * `reserve_pool_size = 20`
  * `server_idle_timeout = 30`

---

## 4. Cache & Queue Infrastructure

* **Redis:** AWS ElastiCache 3-Node Sharded Cluster (`cache.r6g.xlarge`, 26 GB RAM per node)
* **BullMQ:** 8 dedicated worker threads distributed across 4 queue worker pods
