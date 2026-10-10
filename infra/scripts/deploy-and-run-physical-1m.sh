#!/usr/bin/env bash
# infra/scripts/deploy-and-run-physical-1m.sh
# One-click automated deployment and execution orchestrator for SpiceGarden Physical 1M VU / 585K RPS.

set -euo pipefail

echo "================================================================================"
echo "    SPICEGARDEN — PHYSICAL 1M VU / 585K RPS AUTOMATED DEPLOYMENT & EXECUTION     "
echo "================================================================================"

# 1. Pre-Flight Checks
echo -e "\n[STEP 1] Validating Toolchain Prerequisites..."
command -v aws >/dev/null 2>&1 || echo "WARNING: aws CLI not found"
command -v kubectl >/dev/null 2>&1 || echo "WARNING: kubectl not found"
command -v terraform >/dev/null 2>&1 || echo "WARNING: terraform not found"

# 2. Terraform Infrastructure Provisioning
echo -e "\n[STEP 2] Provisioning Cloud Infrastructure via Terraform..."
if [ "${1:-}" != "--skip-terraform" ]; then
    cd infra/terraform
    terraform init
    terraform apply -auto-approve
    cd ../..
fi

# 3. Kubernetes Application Deployment (160 Pods)
echo -e "\n[STEP 3] Deploying 160-Pod Backend & PgBouncer HA Cluster..."
kubectl apply -f infra/k8s/1m-physical-cluster.yaml
kubectl rollout status deployment/spicegarden-backend-1m -n spicegarden-prod --timeout=600s

# 4. Distributed 40-Host k6 Load Farm Deployment
echo -e "\n[STEP 4] Deploying 40-Host k6 Load Generator Farm..."
kubectl apply -f infra/load-tests/1m/distributed/k6-40host-1m-farm.yaml

# 5. Orchestrate Benchmark Execution
echo -e "\n[STEP 5] Launching Orchestrator & Telemetry Ingestion..."
node infra/scripts/orchestrate-physical-1m.js

echo "================================================================================"
echo "               PHYSICAL 1M BENCHMARK PIPELINE EXECUTED                          "
echo "================================================================================"
