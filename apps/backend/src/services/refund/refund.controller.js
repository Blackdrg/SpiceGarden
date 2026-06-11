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
exports.RefundController = void 0;
const common_1 = require("@nestjs/common");
const refund_service_1 = require("./refund.service");
const swagger_1 = require("@nestjs/swagger");
let RefundController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('refunds'), (0, common_1.Controller)('refunds')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createRefundRequest_decorators;
    let _approveRefundRequest_decorators;
    let _rejectRefundRequest_decorators;
    let _processRefund_decorators;
    let _getRefundRequest_decorators;
    let _getRefundRequestsForOrder_decorators;
    let _getRefundRequestsByStatus_decorators;
    var RefundController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _createRefundRequest_decorators = [(0, common_1.Post)('request'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Create a refund request' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund request created successfully' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Order or user not found' }), (0, swagger_1.ApiBody)({
                    schema: {
                        type: 'object',
                        properties: {
                            orderId: { type: 'string' },
                            requestedBy: { type: 'string' },
                            amount: { type: 'number' },
                            reason: { type: 'string' },
                            requestType: { type: 'string', enum: ['customer_request', 'agent_initiated', 'policy_exception', 'dispute_resolution'] }
                        },
                        required: ['orderId', 'requestedBy', 'amount', 'reason']
                    }
                })];
            _approveRefundRequest_decorators = [(0, common_1.Patch)(':approvalId/approve'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Approve a refund request' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund request approved successfully' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Refund request not found' }), (0, swagger_1.ApiParam)({ name: 'approvalId', type: 'string' }), (0, swagger_1.ApiBody)({
                    schema: {
                        type: 'object',
                        properties: {
                            approverId: { type: 'string' },
                            notes: { type: 'string' }
                        },
                        required: ['approverId']
                    }
                })];
            _rejectRefundRequest_decorators = [(0, common_1.Patch)(':approvalId/reject'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Reject a refund request' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund request rejected successfully' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Refund request not found' }), (0, swagger_1.ApiParam)({ name: 'approvalId', type: 'string' }), (0, swagger_1.ApiBody)({
                    schema: {
                        type: 'object',
                        properties: {
                            approverId: { type: 'string' },
                            reason: { type: 'string' }
                        },
                        required: ['approverId', 'reason']
                    }
                })];
            _processRefund_decorators = [(0, common_1.Post)(':approvalId/process'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Process an approved refund' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund processed successfully' }), (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Refund request not found' }), (0, swagger_1.ApiParam)({ name: 'approvalId', type: 'string' }), (0, swagger_1.ApiBody)({
                    schema: {
                        type: 'object',
                        properties: {
                            processedBy: { type: 'string' },
                            gateway: { type: 'string' }
                        },
                        required: ['processedBy']
                    }
                })];
            _getRefundRequest_decorators = [(0, common_1.Get)(':approvalId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get refund request by ID' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund request retrieved successfully' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Refund request not found' }), (0, swagger_1.ApiParam)({ name: 'approvalId', type: 'string' })];
            _getRefundRequestsForOrder_decorators = [(0, common_1.Get)('order/:orderId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get refund requests for an order' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund requests retrieved successfully' }), (0, swagger_1.ApiParam)({ name: 'orderId', type: 'string' })];
            _getRefundRequestsByStatus_decorators = [(0, common_1.Get)(), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get refund requests by status' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund requests retrieved successfully' }), (0, swagger_1.ApiQuery)({ name: 'status', type: 'string', required: false })];
            __esDecorate(this, null, _createRefundRequest_decorators, { kind: "method", name: "createRefundRequest", static: false, private: false, access: { has: obj => "createRefundRequest" in obj, get: obj => obj.createRefundRequest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _approveRefundRequest_decorators, { kind: "method", name: "approveRefundRequest", static: false, private: false, access: { has: obj => "approveRefundRequest" in obj, get: obj => obj.approveRefundRequest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _rejectRefundRequest_decorators, { kind: "method", name: "rejectRefundRequest", static: false, private: false, access: { has: obj => "rejectRefundRequest" in obj, get: obj => obj.rejectRefundRequest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _processRefund_decorators, { kind: "method", name: "processRefund", static: false, private: false, access: { has: obj => "processRefund" in obj, get: obj => obj.processRefund }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getRefundRequest_decorators, { kind: "method", name: "getRefundRequest", static: false, private: false, access: { has: obj => "getRefundRequest" in obj, get: obj => obj.getRefundRequest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getRefundRequestsForOrder_decorators, { kind: "method", name: "getRefundRequestsForOrder", static: false, private: false, access: { has: obj => "getRefundRequestsForOrder" in obj, get: obj => obj.getRefundRequestsForOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getRefundRequestsByStatus_decorators, { kind: "method", name: "getRefundRequestsByStatus", static: false, private: false, access: { has: obj => "getRefundRequestsByStatus" in obj, get: obj => obj.getRefundRequestsByStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RefundController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        refundService = __runInitializers(this, _instanceExtraInitializers);
        constructor(refundService) {
            this.refundService = refundService;
        }
        async createRefundRequest(body) {
            return await this.refundService.createRefundRequest(body.orderId, body.requestedBy, body.amount, body.reason, body.requestType || refund_service_1.RefundRequestType.CUSTOMER_REQUEST);
        }
        async approveRefundRequest(approvalId, body) {
            return await this.refundService.approveRefundRequest(approvalId, body.approverId, body.notes);
        }
        async rejectRefundRequest(approvalId, body) {
            return await this.refundService.rejectRefundRequest(approvalId, body.approverId, body.reason);
        }
        async processRefund(approvalId, body) {
            return await this.refundService.processRefund(approvalId, body.processedBy, body.gateway);
        }
        async getRefundRequest(approvalId) {
            return await this.refundService.getRefundRequest(approvalId);
        }
        async getRefundRequestsForOrder(orderId) {
            return await this.refundService.getRefundRequestsForOrder(orderId);
        }
        async getRefundRequestsByStatus(status) {
            if (status) {
                // Validate that status is one of the allowed values
                const validStatuses = ['pending', 'approved', 'rejected', 'processed', 'failed'];
                if (!validStatuses.includes(status)) {
                    throw new common_1.BadRequestException(`Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}`);
                }
                return await this.refundService.getRefundRequestsByStatus(status);
            }
            // Return all requests if no status specified
            return await this.refundService.getRefundRequestsByStatus('pending');
        }
    };
    return RefundController = _classThis;
})();
exports.RefundController = RefundController;
