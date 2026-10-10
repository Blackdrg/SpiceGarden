# Background Jobs

## Queue System

SpiceGarden uses BullMQ for reliable background job processing with Redis as the backend. The queue system handles order lifecycle transitions, notification dispatch, refund processing, and analytics aggregation.

## Queue Configuration

**File:** `apps/backend/src/infra/queue/queue.service.ts`

### Connection

```typescript
const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
this.connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
```

### Job Options (Default)

```typescript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000, // base delay in ms
  },
  removeOnComplete: { age: 86400, count: 1000 },
  removeOnFail: { age: 86400, count: 1000 },
}
```

### Worker Configuration

```typescript
{
  concurrency: Number(configService.get<number>('QUEUE_CONCURRENCY') || 5),
  lockDuration: 60000, // 60 seconds
}
```

## Queue Definitions

**File:** `apps/backend/src/shared/contracts/queues.ts`

```typescript
export const QUEUE_NAMES = {
  ORDER_LIFECYCLE: 'order_lifecycle',
  DRIVER_ASSIGNMENT: 'driver_assignment',
  NOTIFICATIONS: 'notifications',
  REFUNDS: 'refunds',
  ANALYTICS: 'analytics',
};
```

## Registered Workers

### Order Lifecycle Worker

**Processor:** `apps/backend/src/infra/queue/order.processor.ts`

**Queue:** `ORDER_LIFECYCLE`

**Handler:** `OrderProcessor.processOrderLifecycle(job.data, job)`

**Job Data:**
```typescript
{
  orderId: string;
  status: OrderStatus;
  userId?: string;
}
```

**Job ID Pattern:**
```
order-lifecycle:{orderId}:{status}
```

**Lifecycle Events:**
- Payment confirmation processing
- Restaurant notification
- Kitchen display update
- Driver assignment trigger
- Customer notification
- ETA calculation

### Other Queues

| Queue Name | Status | Purpose |
|------------|--------|---------|
| `ORDER_LIFECYCLE` | ACTIVE | Order state transitions |
| `DRIVER_ASSIGNMENT` | DEFINED | Driver matching (no worker registered) |
| `NOTIFICATIONS` | DEFINED | Notification dispatch (no worker registered) |
| `REFUNDS` | DEFINED | Refund processing (no worker registered) |
| `ANALYTICS` | DEFINED | Analytics aggregation (no worker registered) |

## Queue Service API

**File:** `apps/backend/src/infra/queue/queue.service.ts`

### Methods

| Method | Purpose |
|--------|---------|
| `enqueue(queueName, data, options?)` | Add job to queue |
| `enqueueOrderLifecycle(data)` | Specialized order lifecycle enqueue |
| `getQueue(queueName)` | Get or create queue instance |
| `getQueueStats(queueName)` | Get waiting/active/completed/failed/delayed counts |
| `drainQueue(queueName)` | Clear all jobs from queue |

### Enqueue Options

```typescript
interface QueueEnqueueOptions {
  jobId?: string;
  attempts?: number;
  backoffDelay?: number;
  delay?: number;
  priority?: number;
}
```

## Queue Statistics

### Stats Interface

```typescript
interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}
```

### Stats Endpoint

**File:** `apps/backend/src/services/notifications/queue/notification-queue.controller.ts`

```
GET /notifications/queue/stats
```

Returns per-queue:
- Waiting jobs
- Active jobs
- Completed jobs
- Failed jobs
- Delayed jobs

## Retry Logic

### Exponential Backoff

| Attempt | Delay |
|---------|-------|
| 1 | 1000ms |
| 2 | 2000ms |
| 3 | 4000ms |
| 4 (if configured) | 8000ms |
| 5 (if configured) | 16000ms |

### Retry Conditions

Jobs are retried when:
- Network error (Redis temporarily unavailable)
- External API timeout (payment gateway, notification provider)
- Transient database error

Jobs are NOT retried when:
- Validation error (bad input data)
- Unauthorized (auth failure)
- Not found (resource doesn't exist)
- Business rule violation

## Dead Letter Handling

### Failed Jobs

After max attempts:
1. Job marked as FAILED in BullMQ
2. Error logged with stack trace
3. `webhook-retry-queue` entity populated (for webhook failures)
4. Admin alert triggered

### Manual Retry

```typescript
// Via notification-queue.controller.ts
POST /notifications/queue/retry
Body: { jobId: string, queueName: string }
```

## Job Cleanup

### Automatic Cleanup

```typescript
removeOnComplete: { age: 86400, count: 1000 }
removeOnFail: { age: 86400, count: 1000 }
```

- Completed jobs removed after 24 hours or when 1000 exist
- Failed jobs removed after 24 hours or when 1000 exist
- Keeps Redis memory bounded

### Manual Drain

```typescript
await queueService.drainQueue(QUEUE_NAMES.NOTIFICATIONS);
```

Clears all waiting jobs from a queue.

## Scheduled Jobs

### NestJS Scheduler

**Module:** `@nestjs/schedule` ^6.1.3

**Cron/Interval patterns observed:**
- Daily tasks (backup, cleanup)
- Hourly tasks (metrics aggregation)
- Periodic health checks

### Backup CronJob

**File:** `infra/k8s/production-hardened.yaml`

```yaml
CronJob:
  schedule: "0 2 * * *"  # Daily at 2 AM
  job:
    template:
      spec:
        containers:
        - name: backup
          image: spicegarden/backend:latest
          command: ["bash", "infra/scripts/backup.sh"]
```

## Queue Monitoring

### Metrics

From `QueueService`:
- Queue depth (waiting + active)
- Throughput (completed per minute)
- Failure rate
- Average processing time
- Lock duration breaches

### Prometheus Export

Queue metrics available at `/metrics` endpoint:
- `bull_queue_jobs_waiting_total`
- `bull_queue_jobs_active_total`
- `bull_queue_jobs_completed_total`
- `bull_queue_jobs_failed_total`
- `bull_queue_jobs_delayed_total`

### Worker Logs

```typescript
worker.on('completed', (job) => {
  this.logger.log(`Queue job completed: ${queueName}:${job.id}`);
});

worker.on('failed', (job, error) => {
  this.logger.error(`Queue job failed: ${queueName}:${job?.id ?? 'unknown'}`, error.stack);
});
```

## Graceful Shutdown

**File:** `apps/backend/src/infra/queue/queue.service.ts:144-148`

```typescript
async onModuleDestroy(): Promise<void> {
  await Promise.allSettled(
    [...this.workers.values()].map((worker) => worker.close())
  );
  await Promise.allSettled(
    [...this.queues.values()].map((queue) => queue.close())
  );
  await this.connection.quit();
}
```

Ensures:
1. All workers finish current jobs
2. All queue connections closed
3. Redis connection quit cleanly

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `QUEUE_CONCURRENCY` | Worker concurrency | `5` |
| `LOAD_TEST_MODE` | Disable rate limiting | `false` |

## Operational Commands

### View Queue Stats

```bash
# Via API
curl http://localhost:3001/notifications/queue/stats

# Via Redis CLI
redis-cli LLEN bull:order_lifecycle:waiting
redis-cli LLEN bull:order_lifecycle:active
```

### Drain Queue

```bash
# Via API
curl -X POST http://localhost:3001/notifications/queue/drain \
  -H "Content-Type: application/json" \
  -d '{"queueName": "notifications"}'
```

### Retry Failed Job

```bash
curl -X POST http://localhost:3001/notifications/queue/retry \
  -H "Content-Type: application/json" \
  -d '{"jobId": "1", "queueName": "notifications"}'
```

## Known Issues

1. **Only ORDER_LIFECYCLE worker registered** - Other queue names defined but no workers. Jobs enqueued to DRIVER_ASSIGNMENT, NOTIFICATIONS, REFUNDS, ANALYTICS will wait indefinitely.
2. **No queue dashboard** - No built-in UI for queue monitoring (relies on Grafana/Prometheus).
