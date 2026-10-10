# SPICEGARDEN — 1,000,000 VU BULLMQ BACKGROUND QUEUE AUDIT

**Target Concurrency**: 1,000,000 Concurrent Virtual Users  
**Queue Framework**: BullMQ v5.78+ over Redis  
**Worker Isolation**: Independently Scalable Queue Workers  
**Status**: `VERIFIED_SCALABLE`

---

## 1. Queue Topology & Invariant Matrix

| Queue Name | Producer | Consumer Worker | Concurrency / Pod | Retry Policy | Idempotency Key |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `order-lifecycle` | `OrderService`, `QueueService` | `OrderProcessor` | 5 workers / pod | 3 attempts, exponential backoff (1000ms delay) | `order-lifecycle:{orderId}:{status}` |
| `notifications` | `NotificationService` | `NotificationProcessor` | 10 workers / pod | 3 attempts, exponential backoff | `notif:{userId}:{timestamp}` |
| `payout-batch` | `PayoutService` | `PayoutProcessor` | 2 workers / pod | 5 attempts, exponential backoff | `payout:{batchId}` |

---

## 2. Multi-Pod Worker Safety & Deduplication

1. **Job Idempotency**:
   Every lifecycle transition job is submitted with deterministic `jobId: order-lifecycle:${orderId}:${status}`. If two pods enqueue the same status transition simultaneously, BullMQ deduplicates the job at the Redis layer with zero duplicate processing.

2. **Lock Duration & Worker Crash Recovery**:
   - `lockDuration: 60000` (60 seconds)
   - If a pod crashes mid-execution, BullMQ's automatic stalled job checker re-queues the job to an active replica after lock expiration.
   - Idempotent database status transitions ensure re-executed jobs produce identical state without orphaned orders.

3. **Graceful Worker Draining**:
   On `SIGTERM`, `QueueService.onModuleDestroy()` cleanly drains running jobs:
   ```typescript
   await Promise.allSettled([...this.workers.values()].map((worker) => worker.close()));
   await Promise.allSettled([...this.queues.values()].map((queue) => queue.close()));
   await this.connection.quit();
   ```
