# Docker Stability Guide

## Problem: containerd panic / SIGBUS
The SIGBUS (bus error) occurs when containerd cannot access memory or storage properly, typically due to:
- WSL filesystem corruption (Windows)
- Disk space exhaustion
- Memory pressure
- Volume permission issues

## Solution Checklist

### 1. Docker Desktop stable
- Restart Docker Desktop: Docker Desktop → Troubleshoot → Restart Docker Desktop
- Update to latest Docker Desktop version
- Check Resources: Docker Desktop → Settings → Resources (allocate sufficient RAM/CPU)

### 2. WSL repaired
Run on Windows:
```powershell
# Check WSL status
wsl --status

# If issues detected, repair WSL
wsl --shutdown
wsl --repair --force
```
Restart your computer after WSL repair.

### 3. containerd no longer crashes
- Clean up unused containers: `docker system prune -a`
- Reset Docker to factory defaults if needed
- Check for disk space: `docker system df`

### 4. compose boot reproducible
Run the stability test:
```bash
bash infra/scripts/docker-stability-test.sh
# or on Windows:
powershell -File infra/scripts/docker-stability-test.ps1
```

### 5. services restart safely
All services now have `restart: unless-stopped` policy and extended `start_period` for health checks.

### 6. volume persistence verified
Named volumes are defined in compose files:
- postgres_data
- redis_data
- mongo_data
- prometheus_data
- grafana_data
- opensearch_data

### 7. recovery tested
The stability test validates the full cycle:
- docker compose up -d → services healthy
- docker compose restart → services recover
- docker compose down → volumes persist
- docker compose up -d → full recovery

## Quick Recovery Commands

### If Docker crashes repeatedly:
```powershell
# Windows PowerShell
powershell -File infra/scripts/docker-stability-repair.ps1
```

### Diagnose issues:
```bash
bash infra/scripts/docker-stability-check.sh
```

### Full test cycle:
```bash
bash infra/scripts/docker-stability-test.sh
```

### Start infrastructure:
```bash
docker-compose -f compose.dev.yaml up -d
```

### Wait for healthy services:
```bash
docker-compose -f compose.dev.yaml ps
curl http://localhost:3001/health
```

## Health Endpoints

| Service | Port | Health Check |
|---------|------|--------------|
| Backend | 3001 | http://localhost:3001/health |
| Grafana | 3000 | http://localhost:3000/api/health |
| Prometheus | 9090 | http://localhost:9090/-/healthy |
| OpenSearch | 9200 | http://localhost:9200/_cluster/health |
| Alertmanager | 9093 | http://localhost:9093/-/healthy |