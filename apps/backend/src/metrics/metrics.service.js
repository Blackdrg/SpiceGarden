"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
var common_1 = require("@nestjs/common");
var prom_client_1 = require("prom-client");
var MetricsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MetricsService = _classThis = /** @class */ (function () {
        function MetricsService_1(orderRepo) {
            this.orderRepo = orderRepo;
            this.registry = new prom_client_1.Registry();
            this.httpRequestDuration = new prom_client_1.Histogram({
                name: 'http_request_duration_seconds',
                help: 'Duration of HTTP requests in seconds',
                labelNames: ['method', 'route', 'status_code'],
                buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
                registers: [this.registry],
            });
            this.httpRequestTotal = new prom_client_1.Counter({
                name: 'http_request_total',
                help: 'Total number of HTTP requests',
                labelNames: ['method', 'route', 'status_code'],
                registers: [this.registry],
            });
            this.queueFailuresTotal = new prom_client_1.Counter({
                name: 'queue_failures_total',
                help: 'Total number of queue processing failures',
                labelNames: ['queue_name'],
                registers: [this.registry],
            });
            this.socketFailuresTotal = new prom_client_1.Counter({
                name: 'socket_failures_total',
                help: 'Total number of socket connection failures',
                labelNames: ['namespace', 'event'],
                registers: [this.registry],
            });
            this.paymentFailuresTotal = new prom_client_1.Counter({
                name: 'payment_failures_total',
                help: 'Total number of payment processing failures',
                labelNames: ['provider', 'error_type'],
                registers: [this.registry],
            });
            this.orderTotal = new prom_client_1.Gauge({
                name: 'order_total',
                help: 'Current number of orders by status',
                labelNames: ['status'],
                registers: [this.registry],
            });
            this.requestsPerSecond = new prom_client_1.Gauge({
                name: 'requests_per_second',
                help: 'Requests per second for HPA scaling decisions',
                registers: [this.registry],
            });
            this.requestLatency95p = new prom_client_1.Gauge({
                name: 'request_latency_95p',
                help: '95th percentile request latency in milliseconds for HPA scaling',
                registers: [this.registry],
            });
            this.dbQueryDuration = new prom_client_1.Histogram({
                name: 'db_query_duration_seconds',
                help: 'Database query duration in seconds',
                labelNames: ['operation', 'entity'],
                buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
                registers: [this.registry],
            });
        }
        MetricsService_1.prototype.startTimer = function () {
            return this.httpRequestDuration.startTimer();
        };
        MetricsService_1.prototype.incrementQueueFailure = function (queueName) {
            this.queueFailuresTotal.inc({ queue_name: queueName });
        };
        MetricsService_1.prototype.incrementSocketFailure = function (namespace, event) {
            this.socketFailuresTotal.inc({ namespace: namespace, event: event });
        };
        MetricsService_1.prototype.incrementPaymentFailure = function (provider, errorType) {
            this.paymentFailuresTotal.inc({ provider: provider, error_type: errorType });
        };
        MetricsService_1.prototype.getMetrics = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.registry.metrics()];
                });
            });
        };
        MetricsService_1.prototype.updateOrderCounts = function () {
            return __awaiter(this, void 0, void 0, function () {
                var statuses, counts;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
                            return [4 /*yield*/, Promise.all(statuses.map(function (status) { return _this.orderRepo.count({ where: { status: status } }); }))];
                        case 1:
                            counts = _a.sent();
                            statuses.forEach(function (status, index) {
                                _this.orderTotal.set({ status: status }, counts[index]);
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        MetricsService_1.prototype.updateRequestMetrics = function (rps, latency95p) {
            this.requestsPerSecond.set(rps);
            this.requestLatency95p.set(latency95p);
        };
        MetricsService_1.prototype.observeDbQueryDuration = function (durationSeconds, operation, entity) {
            this.dbQueryDuration.observe({ operation: operation, entity: entity || 'unknown' }, durationSeconds);
        };
        return MetricsService_1;
    }());
    __setFunctionName(_classThis, "MetricsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MetricsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MetricsService = _classThis;
}();
exports.MetricsService = MetricsService;
