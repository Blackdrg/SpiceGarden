#!/bin/bash
set -euo pipefail

# Production Deployment Validation Script
# Usage: ./infra/scripts/production-validation.sh [staging|production]

ENVIRONMENT="${1:-production}"

log() {
    echo "[$(date +%Y-%m-%dT%H:%M:%S)] $1"
}

log_pass() {
    echo -e "\033[32m[PASS]\033[0m $1"
}

log_fail() {
    echo -e "\033[31m[FAIL]\033[0m $1"
}

log_warn() {
    echo -e "\033[33m[WARN]\033[0m $1"
}

FAILED=0
PASSED=0

log "=== SpiceGarden Production Deployment Validation ==="
log "Environment: ${ENVIRONMENT}"

# 1. Prerequisites
log "Checking prerequisites..."
command -v kubectl >/dev/null 2>&1 && log_pass "kubectl available" || log_warn "kubectl not found"
command -v docker >/dev/null 2>&1 && log_pass "docker available" || log_warn "docker not found"

# 2. Secrets Validation
log "Checking secrets..."
if [[ -f "./secrets/jwt_secret.txt" ]]; then
    JWT_SECRET=$(cat ./secrets/jwt_secret.txt)
    if [[ ${#JWT_SECRET} -ge 32 ]]; then
        log_pass "JWT secret configured (${#JWT_SECRET} chars)"
        ((PASSED++))
    else
        log_fail "JWT secret too short"
        ((FAILED++))
    fi
else
    log_warn "JWT secret file not found"
fi

if [[ -f "./secrets/db_password.txt" ]]; then
    log_pass "Database password file exists"
    ((PASSED++))
else
    log_fail "Database password file missing"
    ((FAILED++))
fi

# 3. Kubernetes Configuration
if command -v kubectl >/dev/null 2>&1; then
    log "Validating Kubernetes configuration..."
    
    if kubectl get hpa "spicegarden-backend-hpa" -n "spicegarden-${ENVIRONMENT}" &>/dev/null; then
        MAX_REPLICAS=$(kubectl get hpa "spicegarden-backend-hpa" -n "spicegarden-${ENVIRONMENT}" -o jsonpath='{.spec.maxReplicas}')
        log_pass "HPA configured (max: ${MAX_REPLICAS})"
        ((PASSED++))
        
        if [[ "${MAX_REPLICAS}" -lt 20 ]]; then
            log_warn "Max replicas (${MAX_REPLICAS}) may be insufficient for >50k RPS"
        fi
    else
        log_warn "HPA not found (may not be deployed yet)"
    fi
    
    if kubectl get pdb "spicegarden-backend-pdb" -n "spicegarden-${ENVIRONMENT}" &>/dev/null; then
        log_pass "PodDisruptionBudget configured"
        ((PASSED++))
    else
        log_warn "PDB not found"
    fi
    
    if kubectl get ingress "spicegarden-${ENVIRONMENT}-ingress" -n "spicegarden-${ENVIRONMENT}" &>/dev/null; then
        log_pass "Ingress configured"
        ((PASSED++))
    else
        log_warn "Ingress not found"
    fi
fi

# 4. Configuration Files
log "Checking infrastructure configuration files..."

check_file() {
    if [[ -f "$1" ]]; then
        log_pass "Config exists: $1"
        ((PASSED++))
    else
        log_fail "Config missing: $1"
        ((FAILED++))
    fi
}

check_file "infra/k8s/production-hardened.yaml"
check_file "infra/k8s/staging.yaml"
check_file "infra/k8s/cdn-ingress.yaml"
check_file "infra/prometheus/prometheus.yml"
check_file "infra/prometheus/rules/alerts.yml"
check_file "infra/prometheus/rules/slos.yml"
check_file "infra/alertmanager/alertmanager.yml"
check_file "infra/scripts/backup.sh"
check_file "infra/scripts/disaster-recovery.sh"
check_file "infra/scripts/autoscaling-validation.sh"

# 7. Legal/IP Verification
log "Checking legal compliance..."
if [[ -f "LICENSE" ]]; then
    log_pass "LICENSE file exists"
    ((PASSED++))
else
    log_fail "LICENSE file missing"
    ((FAILED++))
fi

if [[ -f "CONTRIBUTING.md" ]]; then
    log_pass "CONTRIBUTING.md exists"
    ((PASSED++))
else
    log_fail "CONTRIBUTING.md missing"
    ((FAILED++))
fi

if [[ -f "legal/LEGAL_ip-ownership.md" ]]; then
    log_pass "IP ownership documented"
    ((PASSED++))
else
    log_fail "IP ownership not documented"
    ((FAILED++))
fi

if [[ -f "LEGAL_trademark-search.md" ]]; then
    log_pass "Trademark search completed"
    ((PASSED++))
else
    log_fail "Trademark search missing"
    ((FAILED++))
fi

if [[ -f "apps/customer-web/src/pages/legal/privacy.tsx" ]]; then
    log_pass "Privacy policy exists"
    ((PASSED++))
else
    log_fail "Privacy policy missing"
    ((FAILED++))
fi

if [[ -f "apps/customer-web/src/pages/legal/terms.tsx" ]]; then
    log_pass "Terms of service exist"
    ((PASSED++))
else
    log_fail "Terms of service missing"
    ((FAILED++))
fi

if node infra/scripts/legal-check.js &>/dev/null; then
    log_pass "Legal verification passed"
    ((PASSED++))
else
    log_warn "Legal verification check failed"
fi

# 5. Health Endpoint
log "Testing health endpoint..."
if command -v curl >/dev/null 2>&1; then
    if curl -sf http://localhost:3001/health 2>/dev/null | grep -q '"status"'; then
        log_pass "Health endpoint responding"
        ((PASSED++))
    else
        log_warn "Health endpoint not responding (service may be down)"
    fi
else
    log_warn "curl not available for health check"
fi

# 6. Monitoring Components
if command -v kubectl >/dev/null 2>&1; then
    log "Checking monitoring..."
    
    if kubectl get pods -l app=prometheus &>/dev/null; then
        log_pass "Prometheus pods found"
        ((PASSED++))
    fi
    
    if kubectl get pods -l app=grafana &>/dev/null; then
        log_pass "Grafana pods found"
        ((PASSED++))
    fi
    
    if kubectl get pods -l app=alertmanager &>/dev/null; then
        log_pass "Alertmanager pods found"
        ((PASSED++))
    fi
fi

# 7. Backup Configuration
log "Checking backup configuration..."
if [[ -x "./infra/scripts/backup.sh" ]]; then
    log_pass "Backup script is executable"
    ((PASSED++))
else
    log_warn "Backup script not executable"
fi

# Summary
echo ""
log "=== Validation Summary ==="
log_pass "Passed: ${PASSED}"
log_fail "Failed: ${FAILED}"

if [[ $FAILED -gt 0 ]]; then
    exit 1
else
    exit 0
fi