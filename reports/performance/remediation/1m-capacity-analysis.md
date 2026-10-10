# SpiceGarden Performance Remediation — 1,000,000 VU Hyperscale Capacity Analysis

> [!IMPORTANT]
> **CLASSIFICATION:** `1M VU CAPACITY MODEL — NOT LIVE VERIFIED`  
> **EXPLICIT DECLARATION:** This is a mathematically derived capacity model based on measured per-VU consumption and has **not** been validated through 1,000,000 simultaneous live VUs in a live distributed test environment.

---

## 1. Workload & Mathematical Formulation

Based on empirical per-VU consumption:
* **Target Concurrency:** 1,000,000 Concurrent Virtual Users
* **Derived Request Rate:** 140,000 HTTP Requests / Second
* **Derived WebSocket Concurrency:** 80,000 Active Connections
* **Aggregate Ingress Bandwidth:** ~22.4 Gbps
* **Aggregate Egress Bandwidth:** ~32.8 Gbps

---

## 2. Required Production Hyperscale Infrastructure

``mermaid
graph TD
    User[1,000,000 Concurrent VUs] --> CDN[CloudFront / Cloudflare CDN]
    CDN --> NLB[AWS Network Load Balancer 40 Gbps]
    NLB --> K8S[EKS Cluster: 120 Backend Pods across 15 Nodes]
    K8S --> PGB[PgBouncer Cluster]
    PGB --> DBP[(PostgreSQL 16 Primary: db.r6g.16xlarge)]
    PGB --> DBR[(4x Read Replicas: db.r6g.16xlarge)]
    K8S <--> RDC[(Redis 7.2 Cluster: 12 Shards)]
``
### Detailed Infrastructure Specification

1. **Kubernetes Backend Cluster:**
   * 120 Backend Pods (requests: 1 CPU / 1GB RAM, limits: 2 CPU / 2GB RAM)
   * 15x `c6i.4xlarge` EC2 worker instances (16 vCPU / 32 GB RAM each)
2. **Database Layer:**
   * Primary Instance: `db.r6g.16xlarge` (64 vCPU, 512 GB RAM, 20,000 IOPS provisioned)
   * 4x Read Replicas: `db.r6g.16xlarge` with Aurora Global Read auto-scaling
   * PgBouncer Tier: 4x dedicated connection multiplexer instances handling 1,000 pooled backend connections
3. **Caching & Queue Tier:**
   * Redis Cluster 7.2: 12 Shards with Multi-AZ replication (AWS ElastiCache `cache.r6g.4xlarge`)
4. **Load Generation Tier (for validation):**
   * 40x `c6i.2xlarge` Linux worker nodes running distributed k6 over 25 Gbps VPC interconnect.

---

## 3. Estimated Cloud Infrastructure Monthly Cost

| Infrastructure Component | Sizing / Quantity | Estimated Monthly Cost (AWS US-East) |
| :--- | :--- | :---: |
| **EKS Cluster & Compute** | 15x `c6i.4xlarge` nodes + ALB | $7,450 / month |
| **PostgreSQL RDS (Aurora)**| 1 Primary + 4 Replicas (`db.r6g.16xlarge`) | $24,800 / month |
| **ElastiCache Redis Cluster**| 12 Shards (`cache.r6g.4xlarge`) | $9,200 / month |
| **Network Egress & NLB** | ~30 Gbps peak transit | $14,500 / month |
| **Total Hyperscale Monthly Run-Rate** | **Full 1M VU Capacity** | **~$55,950 / month** |
