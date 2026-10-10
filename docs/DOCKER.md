# Docker

## Overview

SpiceGarden uses Docker for containerized development and deployment. The project includes multi-stage Dockerfiles for all applications and Docker Compose for local development.

## Dockerfiles

### Backend

**File:** `infra/backend/Dockerfile`

- Multi-stage build
- Node.js 20 base
- Production optimization
- Health check included
- Read-only filesystem
- Non-root user

### Customer Web

**File:** `infra/customer-web/Dockerfile`

- Multi-stage Next.js build
- Standalone output
- Static asset optimization
- Health check

### Restaurant Dashboard

**File:** `infra/restaurant-dashboard/Dockerfile`

- Same pattern as customer-web
- Sentry source maps

### Super Admin

**File:** `infra/super-admin/Dockerfile`

- Same pattern as customer-web
- Recharts compatibility

### Delivery Partner

**File:** `infra/delivery-partner/Dockerfile`

- Expo web build
- Mobile web smoke test profile

## Docker Compose

**File:** `compose.dev.yaml`

### Services (13 total)

| Service | Image | Port | Resources |
|---------|-------|------|-----------|
| postgres | postgres:16-alpine | 5432 | - |
| redis | redis:7-alpine | 6379 | - |
| mongo | mongo:7 | 27017 | - |
| prometheus | prom/prometheus:v2.51.0 | 9090 | - |
| grafana | grafana/grafana-enterprise:10.4.0 | 3000 | - |
| opensearch | opensearchproject/opensearch:2.15.0 | 9200 | 512m |
| opensearch-dashboards | opensearchproject/opensearch-dashboards:2.15.0 | 5601 | - |
| alertmanager | prom/alertmanager:v0.27.0 | 9093 | - |
| backend | Multi-stage | 3001 | 0.5-1.5 CPU, 512-1024M RAM |
| customer-web | Multi-stage | 3002 | 0.2-0.5 CPU, 256-512M RAM |
| restaurant-dashboard | Multi-stage | 3003 | 0.2-0.5 CPU, 256-512M RAM |
| super-admin | Multi-stage | 3004 | 0.2-0.5 CPU, 256-512M RAM |
| delivery-partner | Multi-stage | 3005 | 0.2-0.3 CPU, 256M RAM |

### Network

```yaml
networks:
  spicegarden-net:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: spicegarden-br0
```

All services connected to private `spicegarden-net` bridge network.

### Volumes

| Volume | Purpose | Service |
|--------|---------|---------|
| postgres_data | PostgreSQL data | postgres |
| redis_data | Redis persistence | redis |
| mongo_data | MongoDB data | mongo |
| prometheus_data | Prometheus metrics | prometheus |
| grafana_data | Grafana dashboards | grafana |
| opensearch_data | OpenSearch indices | opensearch |

### Health Checks

All services have health checks:

| Service | Check | Interval |
|---------|-------|----------|
| postgres | `pg_isready` | 10s |
| redis | `redis-cli ping` | 10s |
| mongo | `mongosh --eval db.adminCommand('ping')` | 10s |
| backend | `curl -f http://localhost:3001/health` | 30s |
| customer-web | `curl -f http://localhost:3000/` | 30s |
| restaurant-dashboard | `curl -f http://localhost:3000/` | 30s |
| super-admin | `curl -f http://localhost:3000/` | 30s |
| delivery-partner | `curl -f http://localhost:3000/` | 30s |

## Security Features

### Container Security

```yaml
read_only: true
security_opt:
  - no-new-privileges:true
tmpfs:
  - /tmp
```

### Backend Container

```yaml
security_opt:
  - no-new-privileges:true
read_only: true
tmpfs:
  - /tmp
deploy:
  resources:
    limits:
      cpus: '1.5'
      memory: 1024M
    reservations:
      cpus: '0.5'
      memory: 512M
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Environment Variables

All services get environment variables from host `.env` file:
```yaml
environment:
  - NODE_ENV=development
  - JWT_SECRET=${JWT_SECRET:-default}
```

## Docker Commands

### Development

```bash
# Start all services
docker-compose -f compose.dev.yaml up -d

# View logs
docker-compose -f compose.dev.yaml logs -f

# Stop all services
docker-compose -f compose.dev.yaml down

# Stop and remove volumes
docker-compose -f compose.dev.yaml down -v

# Restart specific service
docker-compose -f compose.dev.yaml restart backend

# View running services
docker-compose -f compose.dev.yaml ps
```

### Building

```bash
# Build all images
docker-compose -f compose.dev.yaml build

# Build specific image
docker-compose -f compose.dev.yaml build backend

# Build without cache
docker-compose -f compose.dev.yaml build --no-cache
```

### Troubleshooting

```bash
# Check container logs
docker logs spicegarden-backend

# Execute shell in container
docker exec -it spicegarden-backend sh

# Check container stats
docker stats

# Inspect container
docker inspect spicegarden-backend
```

## Infrastructure Scripts

### Docker Management (Launcher)

**File:** `apps/launcher/src/main/docker-manager.ts`

Features:
- `startInfrastructure()` - Start all Docker services
- `stopInfrastructure()` - Stop all Docker services
- `resetDatabases()` - Reset PostgreSQL, Redis, MongoDB
- Status polling via `docker ps -a`

### Stability Scripts

| Script | Purpose |
|--------|---------|
| `infra/scripts/docker-stability-check.sh` | Verify Docker daemon health |
| `infra/scripts/docker-stability-test.sh` | Run stability tests |
| `infra/scripts/docker-stability-repair.ps1` | Repair Docker issues |
| `infra/scripts/docker-stability-test.ps1` | Windows stability test |

### Server-Side Files Not Shown
