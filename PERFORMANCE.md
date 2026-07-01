# Performance Strategy

## Overview

SpiceGarden's performance optimization strategy encompasses caching, queue processing, compression, database optimization, and autoscaling across the distributed system architecture.

## Caching Strategy

### Redis Cache Layer

**Package:** `ioredis@5.10.1`

**Location:** `apps/backend/src/db/redis.adapter.ts`

| Component | Configuration |
|-----------|---------------|
| Connection | Primary Redis on port 6379 |
| Cluster | Redis cluster configuration available |
| Health Check | `infra/redis-cluster.yaml` for K8s |

### Cache Usage Patterns

```typescript
// Redis adapter for database caching
export class RedisAdapter implements DatabaseAdapter {
  private client: Redis;

  async connect(): Promise<void> {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }

  async get(key: string): Promise<any> {
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }
}
```

### Cached Data Types

| Cache Key | TTL | Purpose |
|-----------|-----|---------|
| `user:{id}` | 3600s | User profile data |
| `restaurant:{id}` | 1800s | Restaurant details |
| `menu:{restaurantId}` | 900s | Menu items |
| `driver:{id}:location` | 60s | Real-time driver location |
| `order:{id}` | 300s | Order status |

## Queue Architecture

### BullMQ with Redis

**Package:** `bullmq@5.78.1`

**Location:** `apps/backend/src/infra/queue/`

| Component | File |
|-----------|------|
| Queue Module | `queue.module.ts` |
| Queue Service | `queue.service.ts` |
| Order Processor | `order.processor.ts` |

### Queue Configuration

```typescript
// queue.service.ts
export class QueueService {
  private orderQueue: Queue;
  private notificationQueue: Queue;

  constructor(private config: ConfigService) {
    this.orderQueue = new Queue('orders', {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      },
    });
  }

  async enqueueOrder(orderData: Order): Promise<Job> {
    return this.orderQueue.add('process-order', orderData, {
      priority: orderData.isPriority ? 1 : 10,
    });
  }
}
```

### Queue Types

| Queue | Purpose | Priority |
|-------|---------|----------|
| `orders` | Order processing | High |
| `notifications` | Push/SMS notifications | Medium |
| `drivers` | Driver assignment | High |
| `payments` | Payment processing | Critical |

## Compression Strategy

### Gzip Compression

**Package:** `compression@1.7.4`

```typescript
// main.ts
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));
```

| Setting | Value |
|---------|-------|
| Compression Level | 6 (default) |
| Threshold | 1KB |
| Algorithms | gzip |

## Request Handling

### Timeouts

| Component | Timeout |
|-----------|---------|
| HTTP Request | 30 seconds (default Express) |
| Database Query | 10 seconds (TypeORM default) |
| Queue Job | Configurable per job type |

### Body Size Limits

```typescript
// Body parser configuration
app.use(json({ limit: '10kb' }));  // Configurable via BODY_LIMIT env var
app.use(urlencoded({ limit: '10kb', extended: true }));
```

## Database Optimization

### Connection Pooling

**Source:** `apps/backend/src/main.ts`

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: "postgres",
    host: configService.get<string>("DB_HOST") || "localhost",
    port: configService.get<number>("DB_PORT", 5432),
    username: configService.get<string>("DB_USER") || "spicegarden",
    password: configService.get<string>("DB_PASS") || "spicegarden_dev",
    database: configService.get<string>("DB_NAME") || "spicegarden",
    // Recommended pool settings (add to production config):
    // extra: {
    //   max: 100,
    //   min: 10,
    //   idleTimeoutMillis: 30000,
    //   connectionTimeoutMillis: 5000,
    // },
  }),
})
```

### Production Indexes

**Migration:** `AddProductionIndexes202406280001.ts`

```sql
-- Menu items
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_status ON menu_items(status);

-- Drivers
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_is_online ON drivers(is_online);
CREATE INDEX idx_drivers_is_available ON drivers(is_available);

-- Orders
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Refunds
CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- Wallets
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
```

### Index Summary

| Table | Index | Column |
|-------|-------|--------|
| menu_items | idx_menu_items_category_id | category_id |
| menu_items | idx_menu_items_status | status |
| drivers | idx_drivers_user_id | user_id |
| drivers | idx_drivers_is_online | is_online |
| drivers | idx_drivers_is_available | is_available |
| order_items | idx_order_items_order_id | order_id |
| refunds | idx_refunds_order_id | order_id |
| refunds | idx_refunds_status | status |
| wallets | idx_wallets_user_id | user_id |

## Prometheus Metrics

### HTTP Request Duration Histograms

**Package:** `prom-client@15.0.0`

```typescript
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});
```

### Metric Buckets

| Bucket | Latency |
|--------|---------|
| 0.005s | 5ms (fast) |
| 0.01s | 10ms |
| 0.025s | 25ms |
| 0.05s | 50ms |
| 0.1s | 100ms |
| 0.25s | 250ms |
| 0.5s | 500ms |
| 1s | 1 second |
| 2.5s | 2.5 seconds |
| 5s | 5 seconds |
| 10s | 10 seconds |

### Alert Rules

**Location:** `infra/prometheus/rules/alerts.yml`

| Alert | Expression | Threshold |
|-------|------------|-----------|
| HighErrorRate | `rate(http_request_duration_seconds_count{status_code=~"5.."}[5m]) / rate(...[5m]) > 0.05` | >5% |
| HighLatency | `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1` | >1s |
| DatabaseDown | `up{job="spicegarden-backend"} == 0` | Unreachable |
| QueueFailures | `queue_failures_total > 0` | Any failures |
| PaymentFailures | `payment_failures_total > 5` | >5 failures |

## Scaling Strategy

### Docker Replicas

| Service | Replicas |
|---------|----------|
| Backend | 3 |
| Customer Web | 2 |
| Restaurant Dashboard | 2 |
| Super Admin | 1 |

### Horizontal Pod Autoscaler

**Location:** `infra/k8s/production-hardened.yaml`

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: spicegarden-backend-hpa
spec:
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

### HPA Behavior

| Direction | Stabilization | Policy |
|-----------|--------------|--------|
| Scale Down | 300s window | 10%/min max |
| Scale Up | 60s window | 50%/min or 2 pods/min |

## NGINX Load Balancing

**Configuration:** `infra/k8s/production-hardened.yaml`

| Setting | Value |
|---------|-------|
| Proxy Body Size | 50m |
| Proxy Read Timeout | 60s |
| Proxy Send Timeout | 60s |
| SSL Redirect | Enabled |

## Frontend Optimization

### Next.js Image Optimization

Frontend applications use Next.js automatic image optimization.

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['api.spicegarden.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### Code Splitting

- Automatic route-based code splitting
- Dynamic imports for heavy components
- Shared package optimization via workspaces

## Known Performance Bottlenecks

| Component | Issue | Mitigation |
|-----------|-------|------------|
| User Registration | Email/phone uniqueness constraints under load | Use unique value generation in load tests |
| Idempotency Check | Extra database query per order | Skip in test mode |
| Session Creation | Every login creates session | Monitor session table growth |
| Pessimistic Locks | Potential deadlock under high concurrent load | Monitor lock wait times |
| WebSocket Updates | Real-time location broadcasting | Throttle to 5s intervals |

## Performance Monitoring

### Access Metrics

| Service | Port | Purpose |
|---------|------|---------|
| Grafana | 3000 | Dashboards and visualization |
| Prometheus | 9090 | Metrics collection |
| Alertmanager | 9093 | Alert routing |
| OpenSearch | 9200 | Log aggregation |

### Key Metrics to Monitor

- Request rate (requests/second)
- Latency (p50, p95, p99)
- Error rate (%)
- Database connection pool usage
- Redis memory usage
- Queue depth and processing time
- WebSocket active connections

### Health Endpoints

```bash
# Backend health
curl http://localhost:3001/health

# Metrics endpoint
curl http://localhost:3001/metrics
```

## Performance Optimization Checklist

- [ ] Enable connection pool settings in production
- [ ] Configure Redis cluster for high availability
- [ ] Monitor queue backlogs during peak hours
- [ ] Review slow query logs weekly
- [ ] Validate index usage via EXPLAIN ANALYZE
- [ ] Test scaling events with load tests