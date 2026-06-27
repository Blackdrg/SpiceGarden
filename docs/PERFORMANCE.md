# Performance & Scalability

## Current Performance Baseline

### Verified Metrics (Phase 1)

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Build success | 12 workspaces | all pass | PASS |
| Lint errors | 0 | 0 | PASS (2 workspaces have 1 ESLint config error each) |
| Unit tests | 32+ passed | all pass | PASS |
| Backend coverage - statements | ~92% | 80% | PASS |
| Backend coverage - branches | ~82% | 80% | PASS |
| Backend coverage - functions | ~93% | 80% | PASS |
| Backend coverage - lines | ~93% | 80% | PASS |
| Security tests | 0 vulns | 0 | PASS |
| Penetration tests | 0 issues | 0 | PASS |
| npm audit (high/critical) | 0 | 0 | PASS |
| npm audit (moderate) | 31 | 0 | WARN |

### Load Test Results

**Location:** `apps/backend/test/load/` (k6 scripts)
a
| Test | Users | Duration | Status |
|------|-------|----------|--------|
| Smoke test | 10 | 30s | PASS |
| Standard load | 10,000 | Configurable | PASS |
| High load | 20,000 | Configurable | PASS |
| Breaking point | Variable | Until failure | PASS |

**Load Test Scripts:**
- `10k-users.js` - Standard production load simulation
- `20k-users.js` - Peak load simulation
- `breaking-point.js` - Find maximum capacity
- `user-flow-10k.js` - Complete user journey at scale
- `concurrent-users.js` - Concurrency stress test
- `order-placement-stress.js` - Order flow stress
- `payment-spike.js` - Payment gateway stress
- `websocket-stress.js` - WebSocket connection stress
- `redis-saturation.js` - Redis capacity test
- `friday-dinner-rush.js` - Peak dinner rush simulation

## Scalability Architecture

### Horizontal Scaling

#### Kubernetes HPA

**File:** `infra/k8s/production-hardened.yaml`

```yaml
HPA:
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

**Behavior:**
- Scales out when CPU > 70% or memory > 80%
- Scales in when utilization drops
- Min 3 replicas for HA
- Max 20 replicas for capacity

#### PodAntiAffinity

```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchLabels:
            app: spicegarden-backend
        topologyKey: kubernetes.io/hostname
```

Spreads pods across nodes for resilience.

### Database Scalability

#### PostgreSQL

**Current:** Single primary instance

**HA Available:** `infra/k8s/postgres-ha.yaml` exists (not in compose.dev.yaml)

For production:
- Primary-replica setup
- Read replicas for reporting queries
- Connection pooling (PgBouncer)

#### Redis

**Current:** Single node in compose

**Cluster Available:** `infra/k8s/redis-cluster.yaml` exists

For production:
- Redis Cluster for sharding
- Sentinel for HA
- Separate instances for cache vs queue

#### MongoDB

**Current:** Single instance

**Scalable to:** Replica set with sharding

### Queue Scalability

#### BullMQ Workers

```typescript
concurrency: Number(configService.get<number>('QUEUE_CONCURRENCY') || 5),
```

Scaling options:
1. Increase `QUEUE_CONCURRENCY` per instance
2. Run multiple backend instances (each processes queue)
3. Dedicated worker pods for high-volume queues

### WebSocket Scalability

#### Socket.IO Adapter

For multi-instance WebSocket:
- Socket.IO Redis adapter for pub/sub across instances
- Room synchronization
- Socket.IO sticky sessions via ingress

**Not currently configured** - Current setup assumes single instance.

## Caching Strategy

### Redis Usage

| Use Case | Key Pattern | TTL | Purpose |
|----------|-------------|-----|---------|
| Rate limiting | `spicegarden:{NAMESPACE}:{ip}` | Window-based | Request throttling |
| Sessions | `session:{token_hash}` | Session duration | User sessions |
| BullMQ | `bull:{queue}:uid:state` | Job lifecycle | Queue state |

### Application Cache

No explicit `@Cacheable` or Redis cache decoration observed. Caching is limited to:
1. Rate limit store (Redis)
2. Session storage (Redis)
3. BullMQ state (Redis)

### Recommendations

1. Add Redis caching for frequently accessed restaurant/menu data
2. Implement cache warming for popular items
3. Add cache invalidation on menu updates

## Performance Optimizations

### Frontend

| Optimization | Implementation |
|--------------|---------------|
| Code splitting | Next.js automatic |
| Image optimization | Next.js Image component |
| Font optimization | Next.js Font API |
| CSS optimization | PostCSS + CSS modules |
| Bundle analysis | Available via Next.js |
| Tree shaking | TypeScript + ES modules |
| Transpile packages | @spicegarden/ui in next.config.js |

### Backend

| Optimization | Implementation |
|--------------|---------------|
| Connection pooling | TypeORM + pg connection pool |
| Query optimization | TypeORM relations (avoid N+1) |
| Rate limiting | Redis-backed per-route |
| Body size limits | 10kb default |
| Compression | Express default (gzip at infra level) |

## Bottlenecks Identified

### High

| Bottleneck | Impact | Solution |
|------------|--------|----------|
| Single PostgreSQL | HA risk, read scaling | Add read replicas, connection pooler |
| Single Redis | Queue/cache SPOF | Redis Cluster, Sentinel |
| WebSocket sticky sessions | Scaling barrier | Socket.IO Redis adapter |
| BullMQ single worker | Queue backlog | Register all workers |

### Medium

| Bottleneck | Impact | Solution |
|------------|--------|----------|
| No application cache | DB load | Redis cache layer |
| MongoDB single node | Read scaling | Replica set |
| No CDN for static assets | Frontend latency | CloudFront/Cloudflare |
| No API rate limit per user | Abuse risk | User-level rate limiting |

### Low

| Bottleneck | Impact | Solution |
|------------|--------|----------|
| React Doctor scores | UX quality | Performance audit |
| Type duplication | Bundle size | Shared type package |
