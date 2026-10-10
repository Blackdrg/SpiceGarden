# SPICEGARDEN — 500K AWS DEPLOYMENT RUNBOOK & AUTOMATION

## 1. Automated Deployment Workflow

The authoritative AWS deployment pipeline executes via Terraform and Kubernetes automation scripts:

```bash
# 1. Provision AWS Base VPC, Security Groups, EKS, RDS, ElastiCache
terraform -chdir=infra/terraform init
terraform -chdir=infra/terraform apply -auto-approve

# 2. Configure Kubectl Context for EKS Cluster
aws eks update-kubeconfig --name spicegarden-production-cluster --region us-east-1

# 3. Deploy Hardened Production Application & PgBouncer
kubectl apply -f infra/k8s/production-hardened.yaml
kubectl apply -f infra/k8s/postgres-ha.yaml

# 4. Bootstrap Monitoring & Prometheus Scrapers
kubectl apply -f infra/k8s/monitoring/

# 5. Provision 40-Node Load Generator EC2 Fleet
terraform -chdir=infra/load-tests/1m/distributed apply -auto-approve

# 6. Execute Distributed Calibration & Master 500K Runner
node infra/scripts/orchestrate-physical-1m.js --target-vus 500000 --generators 40
```

---

## 2. Deployment Integrity Invariants

* **Zero-Downtime Rolling Updates**: Configured via `maxSurge: 25%`, `maxUnavailable: 0%`.
* **Pod Anti-Affinity & Topology Spread**: Spreads pods uniformly across 3 AWS Availability Zones (`us-east-1a`, `us-east-1b`, `us-east-1c`).
* **Connection Multiplexing**: All NestJS pods connect exclusively to PgBouncer cluster (`pgbouncer.default.svc.cluster.local:5432`) to protect PostgreSQL backends.
