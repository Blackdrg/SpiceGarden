# Troubleshooting Guide

## Overview

This guide provides diagnostic steps and verified fixes for common issues in the SpiceGarden platform, organized by subsystem.

## Docker Issues

### Docker Daemon Not Running

**Symptoms:**
- `Cannot connect to the Docker daemon`
- `docker: error during connect: Get http://%2F%2F./pipe/docker_engine`
- Services fail to start

**Diagnosis:**
```bash
# Check Docker status
docker version
docker info

# Windows: Check service
sc query docker

# View Docker logs
docker logs spicegarden-backend-1
```

**Fix:**
```bash
# Start Docker Desktop (Windows)
Start-Process "Docker Desktop" -Verb RunAs

# Or start Docker service
net start docker

# Restart services
docker-compose -f compose.dev.yaml down
docker-compose -f compose.dev.yaml up -d
```

### Docker Compose Failures

**Symptoms:**
- Services fail to start
- Port binding errors
- Volume permission errors

**Diagnosis:**
```bash
# View compose logs
docker-compose -f compose.dev.yaml logs

# Check port availability
netstat -ano | findstr :3001
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

**Fix:**
```bash
# Kill conflicting processes
taskkill /PID <PID> /F

# Clean up volumes
docker volume prune

# Rebuild containers
docker-compose -f compose.dev.yaml down -v
docker-compose -f compose.dev.yaml up --build
```

## Backend Issues

### Backend Startup Failures

**Symptoms:**
- `Nest.js application failed to start`
- `Error: Cannot find module './dist/src/main.js'`

**Diagnosis:**
```bash
# Check build output
cd apps/backend
npm run build

# View startup logs
docker logs spicegarden-backend-1

# Check for missing environment variables
npm run dev 2>&1 | grep -i error
```

**Fix:**
```bash
# Ensure .env exists
cp .env.example .env

# Generate secrets if missing
powershell -File infra/scripts/generate-secrets.ps1

# Rebuild
npm run build
npm run dev
```

### Memory Issues

**Symptoms:**
- `JavaScript heap out of memory`
- Process killed with OOM
- Slow response times

**Diagnosis:**
```bash
# Check memory usage
docker stats spicegarden-backend-1

# View Node.js memory
ps aux | grep node
```

**Fix:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=1024" npm run dev

# Or in production (already configured)
# See production-hardened.yaml: NODE_OPTIONS="--max-old-space-size=512"
```

### Missing Environment Variables

**Symptoms:**
- `Missing required environment variable`
- `undefined` database connection
- `Invalid configuration` errors

**Diagnosis:**
```bash
# Check required variables
node infra/scripts/validate-env-consistency.js

# View current .env
cat .env
```

**Fix:**
```bash
# Copy example and fill values
cp .env.example .env

# Required variables:
# - DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
# - REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
# - JWT_SECRET
# - STRIPE_SECRET_KEY (for payments)
```

## Database Issues

### PostgreSQL Connection Failures

**Symptoms:**
- `Connection refused to database`
- `ECONNREFUSED 127.0.0.1:5432`
- `timeout exceeded`

**Diagnosis:**
```bash
# Check PostgreSQL container
docker ps | grep postgres

# Test connection
psql -h localhost -U spicegarden -d spicegarden

# Check connection pool
docker exec -it spicegarden-postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

**Fix:**
```bash
# Restart PostgreSQL container
docker restart spicegarden-postgres

# Check credentials in .env
DB_HOST=localhost
DB_PORT=5432
DB_USER=spicegarden
DB_PASS=spicegarden_dev
DB_NAME=spicegarden

# Run migrations
cd apps/backend
npm run migration:run
```

### MongoDB Connection Failures

**Symptoms:**
- `MongoNetworkError`
- `MongoDB connection timeout`
- `Cannot connect to MongoDB`

**Diagnosis:**
```bash
# Check MongoDB container
docker ps | grep mongo

# Test connection
mongosh --host localhost:27017

# Run MongoDB connection test
npm run test:mongo
```

**Fix:**
```bash
# Restart MongoDB container
docker restart spicegarden-mongo

# Check connection in .env
MONGODB_URI=mongodb://localhost:27017/spicegarden

# MongoDB tests verify connection
# See: apps/backend/test/mongo-connection.spec.ts
```

### Redis Connection Failures

**Symptoms:**
- `ECONNREFUSED 127.0.0.1:6379`
- `Ready check failed`
- Cache miss errors

**Diagnosis:**
```bash
# Check Redis container
docker ps | grep redis

# Test connection
redis-cli ping

# Check cluster status (if applicable)
redis-cli CLUSTER NODES
```

**Fix:**
```bash
# Restart Redis container
docker restart spicegarden-redis

# Redis mock falls back to in-memory in tests
# See jest-setup.ts: ioredis mock configuration

# For production, check infra/redis-cluster.yaml
```

## Frontend Issues

### Build Failures

**Symptoms:**
- `Build failed`
- `Module not found`
- TypeScript compilation errors

**Diagnosis:**
```bash
# Run build with verbose output
npm run build 2>&1 | tee build_output.txt

# Check TypeScript errors
npm run typecheck

# Verify workspace dependencies
npm install
```

**Fix:**
```bash
# Clean install
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install

# Clear build cache
npm run build -- --clean

# Check specific app
cd apps/customer-web
npm run build
```

### NEXTCONFIG Issues

**Symptoms:**
- `Invalid next.config.js`
- Build warnings about configuration

**Fix:**
```bash
# Validate config
node apps/customer-web/next.config.js

# Common fixes: images.domains, webpack config
```

## Mobile Issues

### Expo Issues

**Symptoms:**
- `Failed to download manifest`
- `Cannot connect to Metro bundler`

**Fix:**
```bash
# Clear cache
npx expo start --clear

# Reset Metro cache
npx react-native start --reset-cache
```

### Native Dependencies

**Symptoms:**
- `Native module cannot be null`
- Build fails on Android/iOS

**Fix:**
```bash
# Reinstall native modules
cd apps/customer-mobile
npx pod-install ios
cd android && ./gradlew clean
```

## Kubernetes Issues

### Pod Crashes

**Symptoms:**
- Pods in `CrashLoopBackOff`
- `Error` status
- Readiness probe failures

**Diagnosis:**
```bash
# Check pod status
kubectl get pods -n spicegarden

# View pod events
kubectl describe pod -n spicegarden <pod-name>

# View logs
kubectl logs -n spicegarden <pod-name> --previous
```

**Fix:**
```bash
# Check resource limits
kubectl describe hpa -n spicegarden

# Check liveness/readiness probes (production-hardened.yaml)
# Backend uses /health endpoint for both probes

# Restart deployment
kubectl rollout restart deployment/spicegarden-backend -n spicegarden
```

### HPA Issues

**Symptoms:**
- CPU not scaling
- Memory pressure not triggering scale-up

**Diagnosis:**
```bash
# Check HPA status
kubectl get hpa -n spicegarden

# View metrics
kubectl top pods -n spicegarden

# Describe HPA
kubectl describe hpa -n spicegarden
```

**Fix:**
```bash
# Check metrics server
kubectl get apiservice v1beta1.metrics.k8s.io

# Verify resource requests in deployment
# See staging.yaml and production-hardened.yaml for CPU/memory configs
```

## SSL/TLS Issues

### Certificate Problems

**Symptoms:**
- `SSL certificate error`
- `certificate has expired`
- `self signed certificate in certificate chain`

**Diagnosis:**
```bash
# Check certificate expiry
openssl s_client -connect api.spicegarden.com:443 -servername api.spicegarden.com

# Verify cert-manager pods
kubectl get pods -n cert-manager
```

**Fix:**
```bash
# Certificate is managed by cert-manager in production-hardened.yaml
# Annotations: cert-manager.io/cluster-issuer: letsencrypt-prod

# For staging:
# cert-manager.io/cluster-issuer: letsencrypt-staging
```

## CORS Issues

**Symptoms:**
- `Access to fetch at '...' has been blocked by CORS policy`
- Preflight (OPTIONS) failures

**Diagnosis:**
```bash
# Test CORS headers
curl -H "Origin: http://evil.com" -I http://localhost:3001/health

# Check CORS configuration in penetration tests
node infra/scripts/penetration-tests.js
```

**Fix:**
```typescript
// cors.middleware.ts
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
});

// See cors-origin.spec.ts for tested origins
```

## Authentication/Authorization Issues

### JWT Issues

**Symptoms:**
- `Unauthorized` responses
- `Invalid or expired refresh token`
- Token verification failures

**Diagnosis:**
```bash
# Check JWT secret
echo $JWT_SECRET

# Test auth endpoint
curl -H "Authorization: Bearer invalid" http://localhost:3001/auth/me
```

**Fix:**
```bash
# Ensure JWT_SECRET is set in .env
# JWT expires in 30 days (configurable via ConfigService)

# Clear sessions if needed
rm -rf apps/backend/dist/src/db/entities/session.entity.ts
```

### Session/Cookie Issues

**Symptoms:**
- Session not persisting
- Login works but subsequent requests fail

**Fix:**
```typescript
// Cookie configuration (from security tests)
app.use(cookieParser());
// Cookies use secure flags in production
```

## Rate Limiting Issues

**Symptoms:**
- `429 Too Many Requests`
- Rate limiting not working

**Diagnosis:**
```bash
# Test rate limiting
for i in {1..110}; do
  curl -w "%{http_code}\n" http://localhost:3001/auth/login
done

# Run rate limit tests
npm run test -- rate-limit-store.spec.ts
```

**Fix:**
```typescript
// Rate limiting via @nestjs/throttler
// See rate-limit-store.spec.ts for implementation
// ioredis mock handles rate limiting in tests
```

## Payment Gateway Failures

### Stripe/Razorpay Issues

**Symptoms:**
- `Payment failed` errors
- Webhook signature verification fails
- Timeout connecting to payment provider

**Diagnosis:**
```bash
# Check webhook endpoint
curl -X POST http://localhost:3001/payments/webhook

# Run payment tests
npm run test -- payments.service.spec.ts
npm run test -- stripe-gateway.spec.ts razorpay-gateway.spec.ts
```

**Fix:**
```bash
# Verify API keys in .env
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Check webhook configuration in production-hardened.yaml
# Ingress handles SSL termination for webhooks
```

## WebSocket Connection Drops

**Symptoms:**
- Real-time updates not received
- Connection timeout
- WebSocket error in browser

**Diagnosis:**
```bash
# Check tracking gateway
docker logs spicegarden-backend-1 | grep -i websocket

# Run WebSocket stress test
npm run test:load:websocket
```

**Fix:**
```typescript
// WebSocket configuration in infra/tracking/tracking.gateway.ts
// Reconnection handled by socket.io client
// See websocket-stress.js for stress testing
```

## General Debugging Techniques

### Log Analysis

```bash
# Backend logs
docker logs -f spicegarden-backend-1

# OpenSearch query for errors
curl -X GET "localhost:9200/logs/_search" -H 'Content-Type: application/json' -d'
{
  "query": { "match": { "level": "error" } }
}
'

# Sentry for error tracking
# See @sentry/node in dependencies
```

### Performance Debugging

```bash
# CPU profile
kubectl top pods -n spicegarden

# Memory profile
kubectl exec -it spicegarden-backend-1 -- node --prof

# Database query analysis
docker exec -it spicegarden-postgres psql -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### Health Check Scripts

```bash
# Verify stack health
node infra/scripts/verify-stack.js

# Run readiness check
curl -f http://localhost:3001/health || exit 1

# Check metrics
curl -s http://localhost:3001/metrics | grep -E "(http_request|queue_|payment_)"
```

## Common Error Patterns

| Pattern | Cause | Fix |
|---------|-------|-----|
| `ECONNREFUSED` | Service not running | `docker-compose up -d` |
| `401 Unauthorized` | Missing/invalid JWT | Check auth headers |
| `429 Too Many Requests` | Rate limiting | Backoff or adjust limits |
| `500 Internal Error` | Unhandled exception | Check logs, fix code |
| `404 Not Found` | Wrong endpoint | Verify route exists |
| `400 Bad Request` | Validation error | Check request body |

## Emergency Procedures

### Complete Service Restart
```bash
# Stop all services
docker-compose -f compose.dev.yaml down

# Clean volumes (WARNING: destroys data)
docker-compose -f compose.dev.yaml down -v

# Start fresh
docker-compose -f compose.dev.yaml up -d

# Wait for health
sleep 30
curl -f http://localhost:3001/health
```

### Database Recovery
```bash
# Restore from latest backup
bash infra/scripts/disaster-recovery.sh --production

# Or restore specific backup
kubectl exec -it spicegarden-backend-0 -- pg_restore -d spicegarden /backup/dump.sql
```