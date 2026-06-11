#!/bin/bash
set -euo pipefail

# Deployment Validation Script
# Validates that all infrastructure components are properly configured for high-scale operations

NAMESPACE="${1:-spicegarden-production}"
ENVIRONMENT="${2:-production}"

log() {
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] $1"
}

check_prerequisites() {
  log "Checking prerequisites..."
  command -v kubectl >/dev/null 2>&1 || { log "ERROR: kubectl not found"; exit 1; }
  kubectl cluster-info >/dev/null 2>&1 || { log "ERROR: Cannot connect to cluster"; exit 1; }
}

validate_hpa() {
  log "Validating Horizontal Pod Autoscaler..."
  
  if ! kubectl get hpa spicegarden-backend-hpa -n "$NAMESPACE" &>/dev/null; then
    log "ERROR: HPA not found"
    exit 1
  fi

  local min_replicas=$(kubectl get hpa spicegarden-backend-hpa -n "$NAMESPACE" -o jsonpath='{.spec.minReplicas}')
  local max_replicas=$(kubectl get hpa spicegarden-backend-hpa -n "$NAMESPACE" -o jsonpath='{.spec.maxReplicas}')
  
  log "HPA configured: min=$min_replicas, max=$max_replicas"
  
  if [ "$max_replicas" -lt 20 ]; then
    log "WARNING: Max replicas may be insufficient for >50k RPS targets"
  fi
  
  kubectl get hpa -n "$NAMESPACE"
}

validate_redis_cluster() {
  log "Validating Redis cluster for high throughput..."
  
  if ! kubectl get statefulset redis-cluster -n "$NAMESPACE" &>/dev/null; then
    log "WARNING: Redis cluster not deployed, using single instance"
    kubectl get svc -n "$NAMESPACE" -l app=spicegarden-backend
    return
  fi

  local cluster_nodes=$(kubectl get statefulset redis-cluster -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
  log "Redis cluster configured with $cluster_nodes nodes"
  
  kubectl get pods -n "$NAMESPACE" -l app=redis-cluster
}

validate_database_pooling() {
  log "Validating database connection pooling..."
  
  local deployment_yaml=$(kubectl get deployment spicegarden-backend -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[?(@.name=="backend")].env}')
  
  if echo "$deployment_yaml" | grep -q "DB_CONNECTION_POOL_MAX"; then
    log "Database connection pool environment variables configured"
  else
    log "WARNING: Database connection pool not configured in deployment"
  fi
}

validate_cdn() {
  log "Validating CDN configuration..."
  
  if ! kubectl get ingress spicegarden-cdn-ingress -n "$NAMESPACE" &>/dev/null; then
    log "WARNING: CDN ingress not found"
    return
  fi

  log "CDN ingress configured"
  kubectl get ingress spicegarden-cdn-ingress -n "$NAMESPACE"
}

validate_scaling_readiness() {
  log "Checking scaling readiness..."
  
  # Check if metrics are available
  kubectl top nodes &>/dev/null || log "WARNING: Metrics server not available"
  kubectl top pods -n "$NAMESPACE" &>/dev/null || log "WARNING: Cannot get pod metrics"
  
  log "Scaling validation completed"
}

# Main
log "Starting deployment validation for $ENVIRONMENT environment in $NAMESPACE"

check_prerequisites
validate_hpa
validate_redis_cluster
validate_database_pooling
validate_cdn
validate_scaling_readiness

log "Deployment validation completed successfully"