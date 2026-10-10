# SPICEGARDEN — 500K DISTRIBUTED CAPACITY MODEL

## 1. Architectural Capacity Sizing Model

The 500K active VU workload requires mathematically modeled resource allocation across each system tier to prevent bottleneck formation:

### 1.1 Ingress & Network Tier (ALB)
* **Estimated Total RPS**: ~270,000 requests/second
* **Bandwidth at 2.5 KB/req average**: ~5.4 Gbps egress / ~1.2 Gbps ingress
* **ALB Capacity Units (LCUs)**: 270k RPS / 1k RPS per LCU = **270 LCUs** provisioned.

### 1.2 Compute & Application Tier (EKS NestJS Pods)
* **Target RPS per Pod**: Sustained 1,200 - 1,500 RPS per pod with keep-alive connections.
* **Required Pods**:
  $$\text{Pods} = \frac{270,000 \text{ RPS}}{1,350 \text{ RPS/pod}} = 200 \text{ Pods (Base: 160, Max HPA: 240)}$$
* **EKS Nodes**: 20 × `c6i.4xlarge` (16 vCPU, 32 GiB RAM) hosting 10–12 pods per node.

### 1.3 Connection Multiplexing Tier (PgBouncer)
* **Active Connections from Application**: 200 pods × 50 pool connections = 10,000 client connections.
* **PgBouncer Replicas**: 8 pods multiplexing 10,000 client connections into **800 server connections** to Aurora.

### 1.4 Database Tier (AWS Aurora PostgreSQL)
* **Write Workload (Orders, Payments, Inventory)**: 8% + 10% = 18% of traffic = ~48,600 write operations/sec.
* **Aurora Writer**: `db.r6g.16xlarge` (64 vCPUs, 512 GiB RAM) processing up to 60,000 write IOPS.
* **Read Workload (Catalog, Search, Profile)**: 82% of traffic = ~221,400 read queries/sec.
* **Aurora Readers**: 2 × `db.r6g.8xlarge` (64 total vCPUs) handling read traffic offloaded from writer.

### 1.5 Caching Tier (ElastiCache Redis)
* **Cache Hits**: 92% hit rate on catalog and session reads = ~200,000 cache ops/sec.
* **Redis Cluster**: 6 shards with 2 nodes each (`cache.r7g.2xlarge`), providing capacity for up to 600,000 ops/sec.

---

## 2. Distinction Between Model and Physical Evidence

> [!IMPORTANT]
> A capacity model provides mathematical validation of architecture sizing, but does NOT constitute physical evidence. In accordance with the non-negotiable evidence rule, physical validation requires real distributed deployment and execution against the target environment.
