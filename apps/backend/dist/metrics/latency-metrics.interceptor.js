"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LatencyMetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const metrics_service_1 = require("./metrics.service");
let LatencyMetricsInterceptor = class LatencyMetricsInterceptor {
    metricsService;
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const method = request.method;
        const path = request.route?.path || request.path;
        const startTime = Date.now();
        response.on('finish', () => {
            const durationMs = Date.now() - startTime;
            const statusCode = response.statusCode;
            this.metricsService.observeHttpRequestDuration(method, path, statusCode, durationMs);
            if (durationMs > 1000) {
                this.metricsService.incrementPaymentFailure(method.toLowerCase(), 'high_latency');
            }
        });
        return next.handle();
    }
};
exports.LatencyMetricsInterceptor = LatencyMetricsInterceptor;
exports.LatencyMetricsInterceptor = LatencyMetricsInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], LatencyMetricsInterceptor);
//# sourceMappingURL=latency-metrics.interceptor.js.map