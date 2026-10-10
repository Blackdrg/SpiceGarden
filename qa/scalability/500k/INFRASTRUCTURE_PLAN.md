# SPICEGARDEN — 500K INFRASTRUCTURE TOPOLOGY & CAPACITY SPECIFICATION

## 1. Target AWS Production Topology

To physically sustain 500,000 active concurrent VUs generating realistic multi-tenant traffic, the platform utilizes the following dedicated cloud infrastructure topology:

```text
                                  ┌───────────────────────────────┐
                                  │      Distributed Load Fleet   │
                                  │  25x - 40x c6i.2xlarge Nodes  │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼ (VPC / Direct Connect)
                                  ┌───────────────────────────────┐
                                  │   AWS Application LB (ALB)    │
                                  │  Multi-AZ, Pre-warmed LCUs    │
                                  └───────────────┬───────────────┘
                                                  │ HTTP/2 IP Target Routing
                                  ┌───────────────┴───────────────┐
                                  │      Amazon EKS Cluster       │
                                  │     20x c6i.4xlarge Nodes     │
                                  │   160 - 240 NestJS Pods       │
                                  └───────┬───────────────┬───────┘
                                          │               │
                        ┌─────────────────┴────┐     ┌────┴─────────────────┐
                        │                      │     │                      │
                 ┌──────▼──────┐        ┌──────▼─────▼─┐             ┌──────▼──────┐
                 │  PgBouncer  │        │ ElastiCache  │             │   BullMQ    │
                 │   8 Pods    │        │ Redis 6-node │             │  Consumers  │
                 └──────┬──────┘        │ 2-shard repl │             └──────┬──────┘
                        │               └──────────────┘                    │
                 ┌──────▼──────┐                                            │
                 │ AWS Aurora  │                                            │
                 │ PostgreSQL  │◄───────────────────────────────────────────┘
                 │ 1x 16xl wrt │
                 │ 2x  8xl rdr │
                 └─────────────┘
```

---

## 2. Infrastructure Sizing & Specifications

### 2.1 Compute Layer (EKS)
* **Node Pool**: `20 × c6i.4xlarge` (16 vCPU, 32 GiB RAM per node = 320 vCPUs, 640 GiB total).
* **Application Pods**: `160` base pods, autoscaling up to `240` pods via Kubernetes Horizontal Pod Autoscaler (HPA) targeting 65% average CPU utilization.
* **Resource Limits per Pod**: Request `1.0 vCPU / 1.5 GiB RAM`, Limit `2.0 vCPU / 3.0 GiB RAM`.
* **Runtime**: Node.js v20+ / v25+ with clustering/worker threads and tuned libuv thread pool (`UV_THREADPOOL_SIZE=64`).

### 2.2 Database Layer (AWS Aurora PostgreSQL & PgBouncer)
* **Aurora Writer**: `1 × db.r6g.16xlarge` (64 vCPU, 512 GiB RAM, 25 Gbps network).
* **Aurora Readers**: `2 × db.r6g.8xlarge` (32 vCPU, 256 GiB RAM each) with automated read-query splitting.
* **PgBouncer Poolers**: `8 × c6i.xlarge` dedicated connection pooler pods (transaction pooling mode), providing up to 40,000 client connections multiplexed into 800 backend server connections.

### 2.3 Caching & Session Layer (ElastiCache Redis)
* **Cluster Configuration**: 6-shard cluster with 2 nodes per shard (1 primary + 1 replica = 12 nodes total).
* **Node Type**: `cache.r7g.2xlarge` (8 vCPU, 26.32 GiB RAM).
* **Connection Multiplexing**: Redis IO adapter with persistent socket keep-alive, client-side caching (L1 in-memory LRU) for static catalog lookups.

### 2.4 Ingress & Load Balancing (AWS ALB)
* **Provisioned Capacity**: Pre-warmed for 300+ Load Balancer Capacity Units (LCUs) to support 150,000+ new TCP handshakes/sec.
* **Protocol**: HTTP/2 over TLS 1.3 with session resumption and keep-alive timeout of 65 seconds.

---

## 3. Environment Execution Status

* **IaC Definitions**: Fully authored in `infra/terraform/` and `infra/k8s/production-hardened.yaml`.
* **Live AWS Deployment**: `BLOCKED_EXTERNAL` (External requirement: Requires live AWS account provisioning and cluster bootstrap).
* **Local Workstation Scope**: Executed on local host for code and single-host saturation benchmarking; cloud distributed deployment requires active AWS credentials.
