"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargebackController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let ChargebackController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('chargebacks'), (0, common_1.Controller)('chargebacks')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getDisputeById_decorators;
    let _getDisputesForOrder_decorators;
    let _getDisputes_decorators;
    let _getDisputeStatsOverview_decorators;
    var ChargebackController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getDisputeById_decorators = [(0, common_1.Get)(':disputeId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get chargeback dispute by ID' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Chargeback dispute retrieved successfully' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Chargeback dispute not found' }), (0, swagger_1.ApiParam)({ name: 'disputeId', type: 'string' })];
            _getDisputesForOrder_decorators = [(0, common_1.Get)('order/:orderId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get chargeback disputes for an order' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Chargeback disputes retrieved successfully' }), (0, swagger_1.ApiParam)({ name: 'orderId', type: 'string' })];
            _getDisputes_decorators = [(0, common_1.Get)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            _getDisputeStatsOverview_decorators = [(0, common_1.Post)(':disputeId/initiate-refund'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Initiate refund for a won chargeback dispute' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund initiated successfully' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Chargeback dispute not found' }), (0, swagger_1.ApiParam)({ name: 'disputeId', type: 'string' }), (0, swagger_1.ApiBody)({
                    schema: {
                        type: 'object',
                        properties: {
                            processedBy: { type: 'string' },
                            gateway: { type: 'string' }
                        },
                        required: ['processedBy']
                    }
                }), (0, common_1.Get)('stats/overview'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get chargeback statistics overview' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Chargeback statistics retrieved successfully' }), (0, swagger_1.ApiQuery)({ name: 'startDate', type: 'string', required: false }), (0, swagger_1.ApiQuery)({ name: 'endDate', type: 'string', required: false })];
            __esDecorate(this, null, _getDisputeById_decorators, { kind: "method", name: "getDisputeById", static: false, private: false, access: { has: obj => "getDisputeById" in obj, get: obj => obj.getDisputeById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDisputesForOrder_decorators, { kind: "method", name: "getDisputesForOrder", static: false, private: false, access: { has: obj => "getDisputesForOrder" in obj, get: obj => obj.getDisputesForOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDisputes_decorators, { kind: "method", name: "getDisputes", static: false, private: false, access: { has: obj => "getDisputes" in obj, get: obj => obj.getDisputes }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDisputeStatsOverview_decorators, { kind: "method", name: "getDisputeStatsOverview", static: false, private: false, access: { has: obj => "getDisputeStatsOverview" in obj, get: obj => obj.getDisputeStatsOverview }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ChargebackController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        chargebackService = __runInitializers(this, _instanceExtraInitializers);
        constructor(chargebackService) {
            this.chargebackService = chargebackService;
        }
        async getDisputeById(disputeId) {
            return await this.chargebackService.getDisputeById(disputeId);
        }
        async getDisputesForOrder(orderId) {
            return await this.chargebackService.getDisputesForOrder(orderId);
        }
        async getDisputes(status, startDate, endDate) {
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;
            if (status) {
                // Validate that status is one of the allowed values
                const validStatuses = ['warning', 'needs_response', 'under_review', 'won', 'lost'];
                if (!validStatuses.includes(status)) {
                    throw new common_1.BadRequestException(`Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}`);
                }
                return await this.chargebackService.getDisputesByStatus(status);
            }
            // If dates are provided, get stats
            if (startDate || endDate) {
                return await this.chargebackService.getDisputeStats(start, end);
            }
            // Default to pending disputes
            return await this.chargebackService.getDisputesByStatus('under_review');
        }
        async getDisputeStatsOverview(startDate, endDate) {
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;
            return await this.chargebackService.getDisputeStats(start, end);
        }
    };
    return ChargebackController = _classThis;
})();
exports.ChargebackController = ChargebackController;
