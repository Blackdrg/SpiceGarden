/**
 * SPICEGARDEN SIMULATION - Mock ALB / Request Router
 * Simulates layer 7 Application Load Balancer routing requests to simulated worker pool.
 * Supports weighted round-robin, worker saturation queues, timeouts, retries, 4xx/5xx handling.
 */

class MockALBRouter {
  constructor(options = {}) {
    this.workerCount = options.workerCount || 32;
    this.maxWorkerQueue = options.maxWorkerQueue || 5000;
    this.timeoutMs = options.timeoutMs || 3000;
    this.workers = [];
    this.currentWorkerIdx = 0;

    for (let i = 0; i < this.workerCount; i++) {
      this.workers.push({
        id: `worker_${i}`,
        activeRequests: 0,
        queuedRequests: 0,
        healthy: true,
        totalRequestsHandled: 0
      });
    }

    this.metrics = {
      incomingRequests: 0,
      forwardedRequests: 0,
      rejected4xx: 0,
      failed5xx: 0,
      timeouts: 0,
      retries: 0,
      latencies: [],
    };
  }

  setWorkerHealth(workerIdx, isHealthy) {
    if (this.workers[workerIdx]) {
      this.workers[workerIdx].healthy = isHealthy;
    }
  }

  async route(requestFn, retryCount = 0) {
    this.metrics.incomingRequests++;
    const startMs = performance.now();

    // Select healthy worker (round robin)
    let selectedWorker = null;
    for (let i = 0; i < this.workerCount; i++) {
      const idx = (this.currentWorkerIdx + i) % this.workerCount;
      if (this.workers[idx].healthy && this.workers[idx].queuedRequests < this.maxWorkerQueue) {
        selectedWorker = this.workers[idx];
        this.currentWorkerIdx = (idx + 1) % this.workerCount;
        break;
      }
    }

    if (!selectedWorker) {
      this.metrics.failed5xx++;
      throw new Error('ALB503ServiceUnavailable: All backend worker pools saturated or unhealthy');
    }

    selectedWorker.activeRequests++;
    selectedWorker.totalRequestsHandled++;

    try {
      this.metrics.forwardedRequests++;
      const result = await Promise.race([
        requestFn(selectedWorker),
        new Promise((_, reject) => setTimeout(() => reject(new Error('ALB504GatewayTimeout')), this.timeoutMs))
      ]);

      const duration = performance.now() - startMs;
      this.metrics.latencies.push(duration);
      if (this.metrics.latencies.length > 50000) {
        this.metrics.latencies.splice(0, 10000);
      }
      return result;
    } catch (err) {
      if (err.message.includes('504')) {
        this.metrics.timeouts++;
      } else if (err.message.includes('400') || err.message.includes('404') || err.message.includes('403')) {
        this.metrics.rejected4xx++;
      } else {
        this.metrics.failed5xx++;
      }

      if (retryCount < 2 && (err.message.includes('504') || err.message.includes('503'))) {
        this.metrics.retries++;
        return this.route(requestFn, retryCount + 1);
      }
      throw err;
    } finally {
      selectedWorker.activeRequests = Math.max(0, selectedWorker.activeRequests - 1);
    }
  }

  getMetrics() {
    const sorted = [...this.metrics.latencies].sort((a, b) => a - b);
    const count = sorted.length;
    let totalWorkerLoad = 0;
    this.workers.forEach(w => totalWorkerLoad += w.activeRequests);

    return {
      incomingRequests: this.metrics.incomingRequests,
      forwardedRequests: this.metrics.forwardedRequests,
      rejected4xx: this.metrics.rejected4xx,
      failed5xx: this.metrics.failed5xx,
      timeouts: this.metrics.timeouts,
      retries: this.metrics.retries,
      workerPoolSize: this.workerCount,
      activeWorkerLoad: totalWorkerLoad,
      p50RoutingLatencyMs: count ? sorted[Math.floor(count * 0.50)] : 0,
      p95RoutingLatencyMs: count ? sorted[Math.floor(count * 0.95)] : 0,
      p99RoutingLatencyMs: count ? sorted[Math.floor(count * 0.99)] : 0,
    };
  }
}

module.exports = { MockALBRouter };
