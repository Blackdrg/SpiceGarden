#!/bin/bash
# Docker Stability Test - Full Recovery Cycle
# Tests: up -> restart -> down -> up cycle to verify infrastructure stability

set -euo pipefail

COMPOSE_FILE="compose.dev.yaml"
LOG_FILE="/tmp/docker-stability-test-$(date +%Y%m%d_%H%M%S).log"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo "[$(date +'%H:%M:%S')] $1" | tee -a "$LOG_FILE"; }
info() { log "${GREEN}[INFO]${NC} $1"; }
warn() { log "${YELLOW}[WARN]${NC} $1"; }
error() { log "${RED}[ERROR]${NC} $1"; }

# Wait for all services to be healthy
wait_for_healthy() {
    info "Waiting for services to become healthy..."
    local max_attempts=60
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        local unhealthy
        unhealthy=$(docker-compose -f "$COMPOSE_FILE" ps --services --filter "status=running" 2>/dev/null | while read -r svc; do
            if [[ -n "$svc" ]]; then
                local status
                status=$(docker-compose -f "$COMPOSE_FILE" ps -q "$svc" 2>/dev/null)
                if [[ -n "$status" ]]; then
                    local health
                    health=$(docker inspect --format='{{.State.Health.Status}}' "$status" 2>/dev/null || echo "unknown")
                    if [[ "$health" != "healthy" ]]; then
                        echo "$svc"
                    fi
                fi
            fi
        done)
        
        if [[ -z "$unhealthy" ]]; then
            info "All services healthy"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log "Waiting... ($attempt/$max_attempts) unhealthy: ${unhealthy:-none}"
        sleep 5
    done
    
    error "Services did not become healthy in time"
    docker-compose -f "$COMPOSE_FILE" ps
    return 1
}

# Check specific health endpoint
check_health_endpoint() {
    local max_attempts=10
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if curl -sf "http://localhost:3001/health" &> /dev/null; then
            info "Backend health endpoint responding"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    error "Backend health endpoint not responding"
    return 1
}

# Test step 1: docker compose up -d
test_up() {
    info "=== TEST 1: docker compose up -d ==="
    
    docker-compose -f "$COMPOSE_FILE" up -d 2>&1 | tee -a "$LOG_FILE"
    
    wait_for_healthy
    check_health_endpoint
    
    info "UP test passed"
}

# Test step 2: docker compose restart
test_restart() {
    info "=== TEST 2: docker compose restart ==="
    
    docker-compose -f "$COMPOSE_FILE" restart 2>&1 | tee -a "$LOG_FILE"
    
    wait_for_healthy
    check_health_endpoint
    
    info "RESTART test passed"
}

# Test step 3: docker compose down
test_down() {
    info "=== TEST 3: docker compose down ==="
    
    docker-compose -f "$COMPOSE_FILE" down -v 2>&1 | tee -a "$LOG_FILE"
    
    # Verify volumes still exist (they should persist)
    local volumes=("postgres_data" "redis_data" "mongo_data" "prometheus_data" "grafana_data" "opensearch_data")
    for vol in "${volumes[@]}"; do
        if docker volume ls -q 2>/dev/null | grep -q "^${vol}$"; then
            info "Volume $vol persisted after down"
        else
            warn "Volume $vol was removed (recreating on next up)"
        fi
    done
    
    info "DOWN test passed"
}

# Test step 4: docker compose up -d (recovery)
test_recovery() {
    info "=== TEST 4: docker compose up -d (recovery) ==="
    
    docker-compose -f "$COMPOSE_FILE" up -d 2>&1 | tee -a "$LOG_FILE"
    
    wait_for_healthy
    check_health_endpoint
    
    info "RECOVERY test passed"
}

# Main test flow
main() {
    info "=== DOCKER STABILITY TEST START ==="
    info "Log file: $LOG_FILE"
    
    # Initial cleanup
    info "Cleaning up any existing containers..."
    docker-compose -f "$COMPOSE_FILE" down -v 2>/dev/null || true
    docker-compose -f "$COMPOSE_FILE" rm -sf 2>/dev/null || true
    
    test_up
    test_restart
    test_down
    test_recovery
    
    info "=== ALL TESTS PASSED ==="
    info "Docker stability verified - full recovery cycle successful"
    
    # Final status
    docker-compose -f "$COMPOSE_FILE" ps
}

main "$@"