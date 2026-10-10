# SPICEGARDEN — 500K AWS PREFLIGHT & PREREQUISITE AUDIT

## 1. Cloud Preflight Verification Checklist

Prior to initiating distributed cloud load testing, the following infrastructure readiness checks are audited:

| Component | Target Requirement | Preflight Audit Status | Operational Action Required |
| :--- | :--- | :--- | :--- |
| **AWS Account & IAM** | IAM Role with EKS, RDS, ElastiCache, EC2 admin permissions | `BLOCKED_EXTERNAL` | Requires active AWS account credentials and billing profile |
| **EC2 Generator Fleet** | 40x `c6i.2xlarge` in Dedicated Generator Subnet | `READY_NOT_EXECUTED` | Terraform IaC ready in `infra/terraform/` |
| **EKS Cluster** | 20x `c6i.4xlarge` Managed Node Group (Kubernetes v1.30+) | `READY_NOT_EXECUTED` | Manifests ready in `infra/k8s/production-hardened.yaml` |
| **ALB Ingress** | Pre-warmed for 300+ LCUs with HTTP/2 IP routing | `READY_NOT_EXECUTED` | ALB Controller & TargetGroupBinding manifests verified |
| **Aurora PostgreSQL** | 1x `db.r6g.16xlarge` Writer + 2x `db.r6g.8xlarge` Readers | `READY_NOT_EXECUTED` | RDS Multi-AZ Terraform plan verified |
| **PgBouncer Pool** | 8x Pods multiplexing 10,000 conns into 800 server conns | `READY_NOT_EXECUTED` | PgBouncer deployment manifest verified |
| **ElastiCache Redis** | 6-shard x 2-node `cache.r7g.2xlarge` Cluster | `READY_NOT_EXECUTED` | Cluster config verified in `infra/terraform/` |
| **Prometheus / Grafana** | Monitoring stack scraping all pods, ALB, and RDS metrics | `READY_NOT_EXECUTED` | Prometheus Helm chart values verified |

---

## 2. Preflight Execution Verdict

* **Codebase & IaC Blueprint Readiness**: `100% READY`
* **Live AWS Cloud Execution**: `BLOCKED_EXTERNAL` strictly due to external prerequisite (active cloud credentials).
