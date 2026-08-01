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

    const end = this.metricsService.startTimer(method, path, response.statusCode);

    response.on('finish', () => {
      const statusCode = response.statusCode;
      end({ method, route: path, status_code: String(statusCode) });

      if (response.statusCode >= 500) {
        this.metricsService.incrementPaymentFailure(method.toLowerCase(), 'server_error');
      }
    });

    return next.handle();
  }
}
