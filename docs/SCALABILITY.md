# Scalability

## Current Architecture Scalability

### Horizontal Scaling Ready

| Component | Current | Max Capacity | Scaling Mechanism |
|-----------|---------|--------------|-------------------|
| Backend API | 1 dev instance | 20 replicas | Kubernetes HPA (3-20 replicas) |
| PostgreSQL | 1 instance | HA cluster | postgres-ha.yaml manifest available |
| Redis | 1 instance | Cluster | redis-cluster.yaml manifest available |
| MongoDB | 1 instance | Replica set | Mongoose replica set config |
| BullMQ | 1 worker per queue | Multiple workers | Worker concurrency + multiple instances |
| WebSocket | 1 instance | Multiple + adapter | Socket.IO Redis adapter needed |

### Auto-Scaling Configuration

**File:** `infra/k8s/production-hardened.yaml`

```yaml
HPA:
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - cpu: 70%
    - memory: 80%
```

**PodAntiAffinity:**
- Spreads pods across nodes
- Prefers different hostnames

## Scalability Bottlenecks

### Identified Bottlenecks

| Bottleneck | Current | Solution |
|------------|---------|----------|
| Single PostgreSQL | No read replicas | Deploy postgres-ha.yaml, add read replicas |
| Single Redis | Queue/cache SPOF | Deploy redis-cluster.yaml |
| No Redis adapter for Socket.IO | Cannot scale WebSocket horizontally | Add Socket.IO Redis adapter |
| No application cache | All reads hit DB | Add Redis cache layer for restaurants/menus |
| No CDN | Static assets from origin | Deploy CDN for frontend assets |

### Request Flow Scalability

```
Client → Ingress → Load Balancer → Backend Pod (3-20)
                                        ├→ PostgreSQL Primary (read replicas available)
                                        ├→ Redis Cluster
                                        ├→ MongoDB Replica Set
                                        └→ BullMQ Workers
```

## Load Test Results

### Test Suite

**Location:** `apps/backend/test/load/` (k6 scripts)

| Test | Virtual Users | Duration | Bottleneck |
|------|--------------|----------|------------|
| Smoke | 10 | 30s | None observed |
| Standard | 10,000 | Configurable | PostgreSQL connections |
| High Load | 20,000 | Configurable | Database pool exhaustion |
| Breaking Point | Variable | Until failure | Memory/CPU saturation |

### Key Metrics

| Metric | Smoke (10 users) | Expected (10k) | Breaking Point |
|--------|-----------------|----------------|----------------|
| Avg response time | < 100ms | < 500ms | > 2000ms |
| P99 response time | < 200ms | < 2000ms | > 5000ms |
| Error rate | 0% | < 1% | > 5% |
| Throughput | > 100 RPS | > 5000 RPS | > 10000 RPS |

## Database Scalability

### PostgreSQL

**Current:** Single primary

**Scaling Options:**
1. Read replicas for reporting queries
2. Connection pooling with PgBouncer
3. Sharding by restaurant/region

### MongoDB

**Current:** Single instance

**Scaling Options:**
1. Replica set for read scaling
2. Sharding for write scaling
3. Archive old reviews/audit logs

### Redis

**Current:** Single instance

**Scaling Options:**
1. Redis Cluster for sharding
2. Sentinel for HA
3. Separate instances for cache vs queue

## Queue Scalability

### BullMQ Worker Scaling

**Current:** 1 worker (ORDER_LIFECYCLE)

**Scaling Options:**
1. Increase concurrency per worker
2. Run workers in separate pods
3. Dedicated worker nodes

**Concurrency formula:**
```
Total throughput = workers × concurrency × (1 / avg_job_duration)
```

## WebSocket Scalability

### Current Limitation

Socket.IO in-memory rooms don't work with multiple instances without Redis adapter.

### Solution: Socket.IO Redis Adapter

```typescript
// Production configuration
@WebSocketGateway({
  adapter: createRedisAdapter({ host: 'redis', port: 6379 }),
})
```

**Enables:**
- Multi-instance Socket.IO
- Room synchronization across pods
- Horizontal scaling of realtime features

## Frontend Scalability

### Next.js

- SSR/SSG for SEO and performance
- API routes for backend-for-frontend pattern
- Image optimization
- Font optimization
- Code splitting automatic

### CDN Strategy

**Current:** No CDN

**Recommended:**
- CloudFront or Cloudflare
- Cache static assets (JS, CSS, images)
- Edge functions for API proxy

## Network Scalability

### Kubernetes Network

| Component | Configuration |
|-----------|--------------|
| Service Type | ClusterIP + Ingress |
| Ingress | cdn-ingress.yaml |
| NetworkPolicy | Restricted ingress/egress |
| PodAntiAffinity | Spread across nodes |

### Rate Limiting

Current: Per-IP Redis-backed

Recommended: Add per-user rate limiting for authenticated endpoints

## Memory & CPU Scaling

### Resource Limits

```yaml
backend:
  limits:
    cpus: '1.5'
    memory: 1024M
  requests:
    cpus: '0.5'
    memory: 512M

customer-web:
  limits:
    cpus: '0.5'
    memory: 512M
  requests:
    cpus: '0.2'
    memory: 256M
```

### Scaling Thresholds

| Resource | Scale Up | Scale Down |
|----------|----------|------------|
| CPU | > 70% | < 50% |
| Memory | > 80% | < 60% |
| Queue depth | > 1000 jobs | < 100 jobs |

## Data Scalability

### Current Data Volume Estimates

| Database | Estimated Size | Growth Rate |
|-----------|---------------|-------------|
| PostgreSQL | 10-50GB | ~1GB/month at 10k orders/day |
| MongoDB | 1-10GB | ~100MB/month (reviews, audit) |
| Redis | 512MB-2GB | Depends on cache strategy |

### Scalability Plan

| Phase | Data Volume | Actions |
|-------|-------------|---------|
| Phase 1 (current) | < 100GB | Single instances |
| Phase 2 (10k users) | 100GB-1TB | Read replicas, connection pooler |
| Phase 3 (100k users) | 1TB-10TB | Sharding, Redis cluster, CDN |
| Phase 4 (1M users) | 10TB+ | Database per region, global CDN |

## Cost Projections

### Infrastructure Cost by Scale

| Scale | Users | Infrastructure | Monthly Cost |
|-------|-------|----------------|--------------|
| MVP | 1,000 | Docker Compose | $100-200 |
| Early | 10,000 | K8s small cluster | $500-1,000 |
| Growth | 100,000 | K8s medium cluster | $2,000-5,000 |
| Scale | 1,000,000 | Multi-region K8s | $10,000-20,000 |

---

*Scalability assessment based on current architecture and infrastructure configuration.*
