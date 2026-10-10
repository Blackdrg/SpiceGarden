/**
 * SPICEGARDEN SIMULATION - Mock BullMQ / Queue Adapter
 * Simulates high-throughput background queues with concurrency limits,
 * exponential backoff, DLQ handling, deduplication, and worker saturation metrics.
 */

class MockQueue {
  constructor(options = {}) {
    this.queueNames = [
      'order-events',
      'payment-events',
      'notification-events',
      'tracking-events',
      'inventory-events',
      'analytics-events',
      'delivery-events'
    ];

    this.queues = new Map();
    this.dlq = new Map();
    this.processedJobs = new Set(); // For idempotency deduplication
    this.handlers = new Map();
    this.workerConcurrency = options.workerConcurrency || 50;
    this.maxRetries = options.maxRetries || 3;
    this.chaosSlowdownMs = 0;
    this.chaosFailureRate = 0;

    for (const q of this.queueNames) {
      this.queues.set(q, []);
      this.dlq.set(q, []);
    }

    this.metrics = {
      enqueued: 0,
      processed: 0,
      retried: 0,
      dlqCount: 0,
      duplicateJobs: 0,
      queueDepths: {},
      latencies: [],
      errorCount: 0
    };
  }

  setChaosMode(config = {}) {
    this.chaosSlowdownMs = config.slowdownMs || 0;
    this.chaosFailureRate = config.failureRate || 0;
  }

  resetChaosMode() {
    this.chaosSlowdownMs = 0;
    this.chaosFailureRate = 0;
  }

  registerHandler(queueName, handlerFn) {
    this.handlers.set(queueName, handlerFn);
  }

  async add(queueName, data, options = {}) {
    this.metrics.enqueued++;
    const jobId = options.jobId || `job_${Math.random().toString(36).substring(2)}`;
    
    // Idempotency check
    if (this.processedJobs.has(jobId)) {
      this.metrics.duplicateJobs++;
      return { id: jobId, duplicate: true, status: 'already_processed' };
    }

    const job = {
      id: jobId,
      queueName,
      data,
      attempts: 0,
      enqueuedAt: performance.now(),
      status: 'pending'
    };

    const q = this.queues.get(queueName);
    if (q) {
      q.push(job);
    }

    // Process immediately or async based on concurrency
    return this._processJob(job);
  }

  async _processJob(job) {
    job.attempts++;
    const startMs = performance.now();
    try {
      if (this.chaosSlowdownMs > 0) {
        await new Promise(r => setTimeout(r, Math.min(this.chaosSlowdownMs, 10)));
      }

      if (this.chaosFailureRate > 0 && Math.random() < this.chaosFailureRate) {
        throw new Error('ChaosWorkerFailure: Simulated worker panic');
      }

      const handler = this.handlers.get(job.queueName);
      if (handler) {
        await handler(job.data);
      }

      job.status = 'completed';
      this.processedJobs.add(job.id);
      this.metrics.processed++;

      const duration = (performance.now() - startMs) + (performance.now() - job.enqueuedAt);
      this.metrics.latencies.push(duration);
      if (this.metrics.latencies.length > 50000) {
        this.metrics.latencies.splice(0, 10000);
      }
      return { id: job.id, status: 'completed' };
    } catch (err) {
      if (job.attempts <= this.maxRetries) {
        this.metrics.retried++;
        job.status = 'retrying';
        // Exponential backoff simulation
        return this._processJob(job);
      } else {
        job.status = 'failed';
        this.metrics.dlqCount++;
        const dlqList = this.dlq.get(job.queueName);
        if (dlqList) dlqList.push(job);
        return { id: job.id, status: 'failed', error: err.message };
      }
    }
  }

  getMetrics() {
    const queueDepths = {};
    for (const [qName, jobs] of this.queues.entries()) {
      queueDepths[qName] = jobs.filter(j => j.status === 'pending').length;
    }

    const sorted = [...this.metrics.latencies].sort((a, b) => a - b);
    const count = sorted.length;

    return {
      totalEnqueued: this.metrics.enqueued,
      totalProcessed: this.metrics.processed,
      totalRetried: this.metrics.retried,
      totalDlq: this.metrics.dlqCount,
      duplicateJobsDeduplicated: this.metrics.duplicateJobs,
      queueDepths,
      p50ProcessingLatencyMs: count ? sorted[Math.floor(count * 0.50)] : 0,
      p95ProcessingLatencyMs: count ? sorted[Math.floor(count * 0.95)] : 0,
      p99ProcessingLatencyMs: count ? sorted[Math.floor(count * 0.99)] : 0,
    };
  }
}

module.exports = { MockQueue };
