import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { MetricsService } from './metrics.service';
export declare class LatencyMetricsInterceptor implements NestInterceptor {
    private metricsService;
    constructor(metricsService: MetricsService);
    intercept(context: ExecutionContext, next: CallHandler): import("rxjs").Observable<any>;
}
