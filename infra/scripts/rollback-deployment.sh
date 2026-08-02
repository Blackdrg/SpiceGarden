#!/bin/bash
set -euo pipefail

# K8s Deployment Rollback Script for SpiceGarden
# Usage: bash infra/scripts/rollback-deployment.sh [--production|--staging] [REVISION]
# If REVISION is omitted, rolls back to the previous revision.

ENVIRONMENT="${1:---production}"
TARGET_REVISION="${2:-}"
NAMESPACE="spicegarden-${ENVIRONMENT}"
DEPLOYMENT="spicegarden-backend"

log() {
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] $1"
}

check_prerequisites() {
  log "Checking prerequisites..."
  if ! command -v kubectl &> /dev/null; then
    log "ERROR: kubectl is not installed"
    exit 1
  fi
}

get_current_revision() {
  kubectl rollout history deployment/"$DEPLOYMENT" -n "$NAMESPACE" --revision=current 2>/dev/null || echo "unknown"
}

rollback() {
  log "Starting rollback for $DEPLOYMENT in $NAMESPACE"

  if [ -n "$TARGET_REVISION" ]; then
    log "Rolling back to revision $TARGET_REVISION"
    kubectl rollout undo deployment/"$DEPLOYMENT" -n "$NAMESPACE" --to-revision="$TARGET_REVISION"
  else
    log "Rolling back to previous revision"
    kubectl rollout undo deployment/"$DEPLOYMENT" -n "$NAMESPACE"
  fi

  log "Waiting for rollback to complete..."
  kubectl rollout status deployment/"$DEPLOYMENT" -n "$NAMESPACE" --timeout=300s

  log "Verifying rollback..."
  local current_rev
  current_rev=$(kubectl get deployment/"$DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.metadata.annotations.deployment\.kubernetes\.io/revision}')
  log "Current revision after rollback: $current_rev"

  log "Rollback completed successfully"
}

main() {
  check_prerequisites
  rollback
}

main "$@"
