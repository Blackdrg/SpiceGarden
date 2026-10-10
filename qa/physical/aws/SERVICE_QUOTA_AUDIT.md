# SPICEGARDEN — AWS SERVICE QUOTA & CAPACITY AUDIT

**Document ID:** `AUDIT-AWS-QUOTA-001`  
**Date:** `2026-10-03T13:03:22.039Z`  
**Classification:** `Infrastructure Planning & Technical Due Diligence`  
**Target Git SHA:** `d55af75f6039cb158c9a6823a46d1de170cd2567`  
**Target AWS Region:** `us-east-1` (Multi-AZ: `us-east-1a`, `us-east-1b`, `us-east-1c`)

---

## 1. Physical 1M Benchmark Topology & Capacity Requirements

The benchmark infrastructure topology defined in `infra/terraform/` requires the following physical AWS cloud resources:

```text
================================================================================
               PHYSICAL 1M VU / 585K RPS TOPOLOGY BREAKDOWN
================================================================================

1. Application Node Fleet (EKS):
   - 20x c6i.4xlarge EC2 Worker Nodes (16 vCPU, 32 GiB RAM per node)
   - Subtotal vCPU: 320 vCPUs
   - Subtotal RAM:  640 GiB RAM
   - Application Pods: 160 Pods (8 Pods/Node, 1.8 vCPU / 3.6 GiB per Pod)
   - PgBouncer Pods:   8 Pods (Dedicated transaction pooling)

2. Distributed Load Generator Farm:
   - 40x c6i.2xlarge EC2 Worker Nodes (8 vCPU, 16 GiB RAM per node)
   - Subtotal vCPU: 320 vCPUs
   - Subtotal RAM:  640 GiB RAM
   - Concurrency Target: 25,000 VUs per host x 40 hosts = 1,000,000 concurrent VUs

3. Database Tier (AWS Aurora PostgreSQL 16):
   - 1x Primary Writer: db.r6g.16xlarge (64 vCPU, 512 GiB RAM)
   - 2x Read Replicas:  2x db.r6g.8xlarge (64 vCPU, 512 GiB RAM total)
   - Subtotal DB vCPU:  128 vCPUs
   - Subtotal DB RAM:   1,024 GiB RAM

4. Cache Tier (AWS ElastiCache Redis 7.2):
   - 6 Shards x 2 Nodes (Primary + Replica) = 12 Nodes of cache.r7g.2xlarge
   - Subtotal Cache vCPU: 96 vCPUs
   - Subtotal Cache RAM:  636 GiB RAM

5. Ingress & Networking:
   - 4x Application Load Balancers (Pre-warmed, Cross-AZ)
   - 3x NAT Gateways (One per Availability Zone: us-east-1a, us-east-1b, us-east-1c)
   - 3x Elastic IP Addresses
   - VPC: 10.0.0.0/16 with 3 Public (/24), 3 Private (/20), 3 Database (/24) Subnets
   - 60x 100 GiB gp3 EBS Volumes (3,000 IOPS / 125 MB/s)

================================================================================
```

---

## 2. Required AWS Service Quotas vs Default Limits

| AWS Resource Category | Quota Name | Default Limit | Required for 1M Test | Quota Increase Required? |
|---|---|---|---|---|
| **EC2 On-Demand Instances** | Running On-Demand Standard (A, C, D, H, I, M, R, T, Z) instances | 32 – 64 vCPUs | **640 vCPUs** | **YES (+576 vCPUs)** |
| **Aurora PostgreSQL** | DB instances for Aurora PostgreSQL | 40 instances | **3 instances** | NO (Within limit) |
| **Aurora vCPU** | Total vCPUs for DB instances | 64 – 128 vCPUs | **128 vCPUs** | Potential (Verify account) |
| **ElastiCache Nodes** | Nodes per cluster / group | 20 – 50 nodes | **12 nodes** | NO (Within limit) |
| **Application Load Balancers** | Application Load Balancers per Region | 50 ALBs | **4 ALBs** | NO (Within limit) |
| **Elastic IP Addresses** | Elastic IPs per Region | 5 EIPs | **3 EIPs** | NO (Within limit) |
| **NAT Gateways** | NAT Gateways per AZ | 5 per AZ | **1 per AZ (3 total)** | NO (Within limit) |
| **EBS gp3 Storage** | gp3 Storage per Region | 300 TiB | **6 TiB (60x 100GB)** | NO (Within limit) |
| **VPC & Subnets** | VPCs / Subnets per Region | 5 VPCs / 200 Subnets | **1 VPC / 9 Subnets** | NO (Within limit) |

---

## 3. Estimated Execution Budget

- **EKS Worker Fleet (20x c6i.4xlarge):** 20 x $0.68/hr = $13.60/hr
- **Load Generator Fleet (40x c6i.2xlarge):** 40 x $0.34/hr = $13.60/hr
- **Aurora PostgreSQL Cluster (1x db.r6g.16xlarge + 2x db.r6g.8xlarge):** $8.64 + $8.64 = $17.28/hr
- **ElastiCache Cluster (12x cache.r7g.2xlarge):** 12 x $0.78/hr = $9.36/hr
- **ALBs, NAT Gateways, Data Transfer, Storage:** ~$25.00/hr
- **Total Hourly Run Cost:** ~$78.84/hr
- **Full 4-Hour Benchmark Window (Setup, Ladder, 1M Run, 60-Min Soak, Teardown):** **~$350 – $650** (including data transfer).

---

## 4. Risk Mitigation & Fallback Matrix

1. **Quota Delay Mitigation:**
   - If AWS takes >24 hours to approve 640 vCPUs, an intermediate physical validation run can be executed at **100,000 VUs** using 4x c6i.4xlarge application nodes (64 vCPUs) and 4x c6i.2xlarge generator nodes (32 vCPUs = 96 vCPUs total).
2. **Strict Retention & Cost Controls:**
   - Terraform configuration tags all resources with `Project = SpiceGarden` and `Environment = Physical-1M-Benchmark` to facilitate clean automated teardown via `terraform destroy` upon test completion.
