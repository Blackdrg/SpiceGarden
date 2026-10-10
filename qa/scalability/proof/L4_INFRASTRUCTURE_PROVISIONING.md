# SPICEGARDEN — LEVEL 4 AWS PROVISIONING SPECIFICATION

**Audit Date:** `2026-10-03T22:35:00.000Z`  
**Status:** `BLOCKED_EXTERNAL` (Awaiting AWS Authentication)  

---

## 1. Terraform Artifacts Validated in Repository

* [`infra/terraform/main.tf`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/terraform/main.tf): VPC across 3 AZs with public, private, and database subnets.
* [`infra/terraform/eks.tf`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/terraform/eks.tf): EKS 1.30 with 20x c6i.4xlarge backend nodes and 40x c6i.2xlarge generator farm.
* [`infra/terraform/rds.tf`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/terraform/rds.tf): Aurora PG 16.1 Cluster (db.r6g.16xlarge writer + 2x db.r6g.8xlarge readers).
* [`infra/terraform/elasticache.tf`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/terraform/elasticache.tf): 12-Node Redis 7.1 Cluster (6 shards × 2 nodes on cache.r7g.2xlarge).
* [`infra/terraform/alb.tf`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/terraform/alb.tf): Application Load Balancer with IP targets and HTTP/2.
