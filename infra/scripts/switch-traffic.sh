#!/bin/bash
set -euo pipefail

# Blue/Green Traffic Switch Script for SpiceGarden
# Usage: bash infra/scripts/switch-traffic.sh [blue|green]
# Switches the ClusterIP Service selector to route traffic to the specified variant.

TARGET_VARIANT="${1:-blue}"
SERVICE_NAME="spicegarden-backend"
NAMESPACE="spicegarden-production"

log() {
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] $1"
}

validate_variant() {
  if [[ "$TARGET_VARIANT" != "blue" && "$TARGET_VARIANT" != "green" ]]; then
    log "ERROR: Variant must be 'blue' or 'green'"
    exit 1
  fi
}

patch_service() {
  log "Switching traffic to $TARGET_VARIANT deployment..."
  kubectl patch service "$SERVICE_NAME" -n "$NAMESPACE" --type='json' -p="[{\"op\": \"replace\", \"path\": \"/spec/selector/variant\", \"value\": \"$TARGET_VARIANT\"}]"
  log "Traffic switched to $TARGET_VARIANT"
}

verify_service() {
  log "Verifying service selector..."
  kubectl get service "$SERVICE_NAME" -n "$NAMESPACE" -o jsonpath='{.spec selector}'
  echo ""
}

main() {
  validate_variant
  patch_service
  verify_service
  log "Done. Verify health at /health before routing production traffic."
}

main "$@"
