#!/usr/bin/env bash
# infra/load-tests/1m/distributed/distributed-runner.sh
set -euo pipefail

echo "=========================================================="
echo "SPICEGARDEN 1M VU DISTRIBUTED TEST EXECUTION HARNESS"
echo "=========================================================="

# Resolve kubectl binary if not in default PATH (e.g. Git Bash on Windows)
if command -v kubectl >/dev/null 2>&1; then
  KUBECTL_BIN="kubectl"
elif command -v kubectl.exe >/dev/null 2>&1; then
  KUBECTL_BIN="kubectl.exe"
elif [ -f "/c/Program Files/Docker/Docker/resources/bin/kubectl.exe" ]; then
  KUBECTL_BIN="/c/Program Files/Docker/Docker/resources/bin/kubectl.exe"
elif [ -f "/c/Users/$USER/AppData/Local/Google/Cloud SDK/google-cloud-sdk/bin/kubectl.exe" ]; then
  KUBECTL_BIN="/c/Users/$USER/AppData/Local/Google/Cloud SDK/google-cloud-sdk/bin/kubectl.exe"
else
  echo "[ERROR] kubectl command not found."
  echo "Please ensure kubectl is installed and in your PATH or Docker Desktop Kubernetes is running."
  exit 1
fi

NAMESPACE="load-testing"
CONFIGMAP_NAME="spicegarden-1m-scenario-cm"
TESTRUN_FILE="infra/load-tests/1m/distributed/k8s-k6-operator.yaml"

echo "[1/4] Validating Kubernetes cluster connectivity using: $KUBECTL_BIN"
if ! "$KUBECTL_BIN" cluster-info; then
  echo ""
  echo "[NOTICE] Target Kubernetes cluster is not currently reachable."
  echo "To execute the live 1M distributed run:"
  echo "1. Start your Kubernetes cluster (Docker Desktop Kubernetes, Minikube, or connect to AWS EKS / GCP GKE)."
  echo "2. Re-run this script."
  exit 1
fi

echo "[2/4] Creating scenario ConfigMap..."
"$KUBECTL_BIN" create namespace "$NAMESPACE" --dry-run=client -o yaml | "$KUBECTL_BIN" apply -f -
"$KUBECTL_BIN" create configMap "$CONFIGMAP_NAME" \
  --from-file=scenario.js=infra/load-tests/1m/scenario.js \
  --from-file=config.js=infra/load-tests/1m/config.js \
  --from-file=thresholds.js=infra/load-tests/1m/thresholds.js \
  --namespace="$NAMESPACE" --dry-run=client -o yaml | "$KUBECTL_BIN" apply -f -

echo "[3/4] Deploying 40-worker k6 distributed TestRun..."
"$KUBECTL_BIN" apply -f "$TESTRUN_FILE"

echo "[4/4] Monitoring distributed TestRun execution..."
"$KUBECTL_BIN" get testruns -n "$NAMESPACE" -w
