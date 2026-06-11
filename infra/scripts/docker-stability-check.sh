#!/bin/bash
# Docker Stability Diagnostic Script
# Diagnoses and fixes containerd/SIGBUS issues on Windows/WSL

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo "[$(date +'%H:%M:%S')] $1"; }
info() { log "${GREEN}[INFO]${NC} $1"; }
warn() { log "${YELLOW}[WARN]${NC} $1"; }
error() { log "${RED}[ERROR]${NC} $1"; }

# Check Docker Desktop status
check_docker_desktop() {
    info "Checking Docker Desktop..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker not installed"
        return 1
    fi
    
    if ! docker info &> /dev/null 2>&1; then
        error "Docker daemon not responding - SIGBUS/containerd may be crashed"
        return 1
    fi
    
    info "Docker daemon is responsive"
    
    # Check disk space (common cause of SIGBUS)
    local disk_usage
    disk_usage=$(df -h / 2>/dev/null | awk 'NR==2 {print $5}' | tr -d '%' || echo "0")
    if [[ "$disk_usage" -gt 90 ]]; then
        warn "Disk usage is ${disk_usage}% - high usage can cause SIGBUS"
    fi
}

# Check WSL status (Windows only)
check_wsl() {
    if [[ "${OS:-}" == "Windows_NT" ]] || grep -qi microsoft /proc/version 2>/dev/null; then
        info "Checking WSL..."
        
        if command -v wsl &> /dev/null; then
            if ! wsl --status &> /dev/null; then
                warn "WSL may need repair"
                return 1
            fi
            info "WSL status OK"
        fi
    fi
}

# Check containerd logs for errors
check_containerd() {
    info "Checking containerd status..."
    
    if docker info 2>&1 | grep -i "containerd" &> /dev/null; then
        info "containerd is running"
    else
        error "containerd issues detected"
        return 1
    fi
}

# Clean up Docker state for stability
cleanup_docker_state() {
    info "Cleaning up Docker state..."
    
    # Remove stopped containers
    docker container prune -f 2>/dev/null || true
    
    # Remove unused networks
    docker network prune -f 2>/dev/null || true
    
    # Remove unused volumes (but preserve named volumes)
    docker volume prune -f 2>/dev/null || true
    
    # Check for corrupted volumes
    local corrupted
    corrupted=$(docker volume ls -q 2>/dev/null | head -5)
    for vol in $corrupted; do
        if ! docker volume inspect "$vol" &> /dev/null; then
            warn "Removing corrupted volume: $vol"
            docker volume rm "$vol" 2>/dev/null || true
        fi
    done
    
    info "Docker cleanup completed"
}

# Verify volume persistence
verify_volumes() {
    info "Verifying volume persistence..."
    
    local volumes=("postgres_data" "redis_data" "mongo_data")
    for vol in "${volumes[@]}"; do
        if docker volume ls -q 2>/dev/null | grep -q "^${vol}$"; then
            info "Volume $vol exists"
        else
            warn "Volume $vol will be created on first run"
        fi
    done
}

# Main diagnostic flow
main() {
    info "=== DOCKER STABILITY DIAGNOSTIC ==="
    
    check_docker_desktop
    check_wsl || true
    check_containerd
    cleanup_docker_state
    verify_volumes
    
    info "=== DIAGNOSTIC COMPLETE ==="
}

main "$@"