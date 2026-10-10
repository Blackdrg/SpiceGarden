# SpiceGarden - Production Deployment Guide

## Prerequisites

- Docker Desktop 4.78+ with WSL 2 backend
- Docker Desktop Windows service (`com.docker.service`) must be running
- Minimum 6 GB free disk space
- 8 GB RAM (16 GB recommended)

## Step 1: Start Docker Desktop

```powershell
# In Administrator PowerShell:
sc.exe start com.docker.service

# Or click Docker Desktop icon in system tray and wait for "Docker is running" status
```

Verify:
```powershell
docker version
# Must show both Client and Server version
docker ps
# Must return without error
```

## Step 2: Start Infrastructure

```powershell
cd C:\Users\mehta\Desktop\SpiceGarden
docker-compose -f compose.dev.yaml up -d postgres redis mongo prometheus grafana opensearch opensearch-dashboards alertmanager
```

Wait for health checks:
```powershell
docker-compose -f compose.dev.yaml ps
# postgres, redis, mongo should show "healthy"
```

## Step 3: Start Application Services

```powershell
docker-compose -f compose.dev.yaml up -d --build
```

This starts:
- `spicegarden-backend-1` → http://localhost:3001
- `spicegarden-customer-web-1` → http://localhost:3002
- `spicegarden-restaurant-dashboard-1` → http://localhost:3003
- `spicegarden-super-admin-1` → http://localhost:3004
- `spicegarden-delivery-partner-1` → http://localhost:3010
- `spicegarden-nginx-1` → http://localhost:80 (reverse proxy)

## Step 4: Verify Health

```powershell
# Backend health
curl http://localhost:3001/health

# Expected: {"status":"ok","timestamp":"..."}

# Prometheus metrics
curl http://localhost:3001/metrics

# Grafana
# Open http://localhost:3000 in browser (admin/admin)

# NGINX proxy
curl http://localhost/
```

## Step 5: Run Tests

```powershell
# Backend tests
cd apps/backend && npm run test:all

# Lint
npm run lint

# Frontend builds
cd apps/customer-web && npm run build
cd apps/restaurant-dashboard && npm run build
cd apps/super-admin && npm run build
```

## Docker Images

| Image | Dockerfile | Port | Purpose |
|-------|-----------|------|---------|
| spicegarden-backend | infra/backend/Dockerfile | 3001 | NestJS API server |
| spicegarden-customer-web | infra/customer-web/Dockerfile | 3002 | Customer Next.js app |
| spicegarden-restaurant-dashboard | infra/restaurant-dashboard/Dockerfile | 3003 | Restaurant Next.js app |
| spicegarden-super-admin | infra/super-admin/Dockerfile | 3004 | Admin Next.js app |
| spicegarden-delivery-partner | infra/delivery-partner/Dockerfile | 3010 | Delivery partner app |
| nginx:1.25-alpine | infra/nginx/nginx.conf | 80, 443 | Reverse proxy |

## Environment Variables (Required for Production)

Create `.env` file from `.env.example`:

```bash
# Database
POSTGRES_USER=spicegarden
POSTGRES_PASSWORD=<secure-password>
DB_USER=spicegarden
DB_PASS=<secure-password>
DB_NAME=spicegarden

# MongoDB
MONGO_USER=spicegarden
MONGO_PASSWORD=<secure-password>

# JWT
JWT_SECRET=<64-char-random-string>
ENCRYPTION_SECRET=<64-char-random-string>

# External Services
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Optional
SENTRY_DSN=...
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
FCM_SERVER_KEY=...
GOOGLE_MAPS_API_KEY=...
```

## Secrets (Production)

Place secret files in `./secrets/`:

```
secrets/
  db_password.txt
  jwt_secret.txt
  encryption_secret.txt
  fcm_server_key.txt
  apns_private_key.txt
  sendgrid_api_key.txt
  twilio_account_sid.txt
  twilio_auth_token.txt
  google_maps_api_key.txt
  mongo_password.txt
```

## Troubleshooting

### Docker Desktop won't start

1. Ensure WSL 2 is enabled: `wsl --install`
2. Restart Docker Desktop from system tray
3. Check Windows service: `sc.exe query com.docker.service`
4. If service won't start, run PowerShell as Administrator

### Port already in use

```powershell
# Check what's using port 3001
netstat -ano | findstr :3001

# Stop conflicting process
taskkill /PID <pid> /F
```

### Container won't start

```powershell
# Check logs
docker logs <container-name>

# Common issues:
# - Missing environment variables → check .env file
# - Database not ready → wait for health checks
# - Out of disk space → free space on C:\ drive
```

## Load Testing

```powershell
# Install k6
winget install k6

# Run load test (10k users)
npm run test:load

# Results dashboard: http://localhost:3000 (Grafana)
```

## Kubernetes Deployment (Production)

```bash
# Apply production manifests
kubectl apply -f infra/k8s/production-hardened.yaml

# Verify
kubectl get pods -n spicegarden
kubectl get svc -n spicegarden
```

## Backup

```powershell
# Manual backup
bash infra/scripts/backup.sh

# Disaster recovery
bash infra/scripts/disaster-recovery.sh --production
```
