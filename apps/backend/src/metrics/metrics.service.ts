import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry],
});

const queueFailuresCounter = new Counter({
  name: 'queue_failures_total',
  help: 'Total number of queue processing failures',
  labelNames: ['queue_name'] as const,
  registers: [metricsRegistry],
});

const socketFailuresCounter = new Counter({
  name: 'socket_failures_total',
  help: 'Total number of socket connection failures',
  labelNames: ['namespace', 'event'] as const,
  registers: [metricsRegistry],
});

const paymentFailuresCounter = new Counter({
  name: 'payment_failures_total',
  help: 'Total number of payment processing failures',
  labelNames: ['provider', 'error_type'] as const,
  registers: [metricsRegistry],
});

@Injectable()
export class MetricsService {
  startTimer(method: string, route: string, statusCode: number) {
    const end = httpRequestDuration.startTimer({
      method,
      route,
      status_code: String(statusCode),
    });
    return end;
  }

  incrementQueueFailure(queueName: string) {
    queueFailuresCounter.inc({ queue_name: queueName });
  }

  incrementSocketFailure(namespace: string, event: string) {
    socketFailuresCounter.inc({ namespace, event });
  }

  incrementPaymentFailure(provider: string, errorType: string) {
    paymentFailuresCounter.inc({ provider, error_type: errorType });
  }

  async getMetrics(): Promise<string> {
    return metricsRegistry.metrics();
  }
}