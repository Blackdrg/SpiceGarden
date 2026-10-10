# SPICEGARDEN — AUTHORITATIVE AWS INFRASTRUCTURE TOPOLOGY

**Document Status:** `AUTHORITATIVE RECONCILED`  
**Target Scale:** 1,000,000 Concurrent Virtual Users (1M VUs)  
**Authoritative Source:** Repository Terraform (`infra/terraform/`), Kubernetes (`infra/k8s/1m-physical-cluster.yaml`), and Load Generator Fleet Specifications  

---

## 1. Complete Reconciled Topology Matrix

| Infrastructure Layer | Reconciled Configuration | Source Artifact | Deployment Status |
| :--- | :--- | :--- | :--- |
| **Load Generator Farm** | **40 × `c6i.2xlarge`** (8 vCPU, 16 GB RAM each = **320 vCPU, 640 GB RAM**) Dedicated k6 distributed farm | `infra/terraform/eks.tf` (lines 60-98) | `READY_NOT_EXECUTED` |
| **EKS Backend Nodes** | **20 × `c6i.4xlarge`** (16 vCPU, 32 GB RAM each = **320 vCPU, 640 GB RAM**) Min 10, Desired 20, Max 30 | `infra/terraform/eks.tf` (lines 20-58) | `READY_NOT_EXECUTED` |
| **Backend Pods** | **160 Pods Base Replicas**, HPA Auto-scales to **240 Pods** (Requests: 1.5 CPU/2GB RAM, Limits: 3.5 CPU/4GB RAM) | `infra/k8s/1m-physical-cluster.yaml` (lines 78-254) | `READY_NOT_EXECUTED` |
| **PgBouncer Cluster** | **8 × PgBouncer Replicas** in Transaction Pooling Mode (`max_client_conn: 10000`, `default_pool_size: 50`) | `infra/k8s/1m-physical-cluster.yaml` (lines 20-64) | `READY_NOT_EXECUTED` |
| **Aurora PostgreSQL** | **Aurora PostgreSQL 16.1 Cluster**<br>• Primary Writer: **1 × `db.r6g.16xlarge`** (64 vCPU, 512 GB RAM)<br>• Readers: **2 × `db.r6g.8xlarge`** (32 vCPU, 256 GB RAM each)<br>• Max Connections: 5,000 | `infra/terraform/rds.tf` (lines 1-105) | `READY_NOT_EXECUTED` |
| **ElastiCache Redis** | **12-Node Redis 7.1 Cluster**: **6 Shards × 2 Nodes** (Primary + Replica per shard) on **`cache.r7g.2xlarge`** (8 vCPU, 53 GB RAM per node = **636 GB Cluster RAM**) | `infra/terraform/elasticache.tf` (lines 1-75) | `READY_NOT_EXECUTED` |
| **Application Load Balancer** | **AWS ALB** with IP Target Type, HTTP/2 Enabled, Sticky Sessions, 120s Idle Timeout, Cross-AZ Balancing | `infra/terraform/alb.tf`, `infra/k8s/1m-physical-cluster.yaml` | `READY_NOT_EXECUTED` |
| **VPC & Networking** | 3 Availability Zones, Public + Private + Database Subnets, NAT Gateways, Transit Gateway ready | `infra/terraform/main.tf` | `READY_NOT_EXECUTED` |
| **Queue Workers** | **20 × BullMQ Worker Pods** dedicated to order lifecycle & push notification delivery | `infra/k8s/1m-physical-cluster.yaml` | `READY_NOT_EXECUTED` |

---

## 2. Reconciliation of Prior Documentation Variances

1. **Backend Pod Count Discrepancy (160 vs 240):**
   * *Resolution:* Base deployment starts at **160 pods** (`replicas: 160` in deployment spec). The `HorizontalPodAutoscaler` is configured with `minReplicas: 160` and `maxReplicas: 240` triggering at 75% CPU utilization. Both numbers are accurate in context.
2. **Load Generator Instance Types (40 × c6i.2xlarge vs 40 × c6i.16xlarge):**
   * *Resolution:* Terraform `eks.tf` explicitly provisions **40 × `c6i.2xlarge`** (8 vCPU, 16 GB RAM per instance = 320 vCPU aggregate load generator capacity). The 16xlarge reference in earlier conceptual drafts was oversized and has been replaced by the cost-optimized 2xlarge fleet.
3. **Aurora Topology (Single instance vs Multi-AZ Read Replicas):**
   * *Resolution:* `rds.tf` specifies 1 primary writer (`db.r6g.16xlarge`) and 2 reader replicas (`db.r6g.8xlarge`) with connection offloading via 8 PgBouncer pods.
