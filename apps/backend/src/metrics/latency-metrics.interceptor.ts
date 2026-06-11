import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Injectable()
export class LatencyMetricsInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const path = request.route?.path || request.path;

    const startTime = Date.now();

    response.on('finish', () => {
      const durationMs = Date.now() - startTime;
      const statusCode = response.statusCode;

      this.metricsService.httpRequestDuration
        .labels(method, path, String(statusCode))
        .observe(durationMs / 1000);

      this.metricsService.httpRequestTotal
        .labels(method, path, String(statusCode))
        .inc();

      if (durationMs > 1000) {
        this.metricsService.incrementPaymentFailure(method.toLowerCase(), 'high_latency');
      }
    });

    return next.handle();
  }
}
