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
exports.SupportController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let SupportController = (() => {
    let _classDecorators = [(0, common_1.Controller)('support'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.SUPPORT_STAFF)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _raiseDispute_decorators;
    let _getDisputes_decorators;
    let _reviewDispute_decorators;
    let _requestRefund_decorators;
    let _processRefund_decorators;
    let _getQueueStats_decorators;
    let _routeTicket_decorators;
    let _escalateTicket_decorators;
    var SupportController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _raiseDispute_decorators = [(0, common_1.Post)('disputes')];
            _getDisputes_decorators = [(0, common_1.Get)('disputes')];
            _reviewDispute_decorators = [(0, common_1.Put)('disputes/:id/review')];
            _requestRefund_decorators = [(0, common_1.Post)('refunds')];
            _processRefund_decorators = [(0, common_1.Put)('refunds/:id/process')];
            _getQueueStats_decorators = [(0, common_1.Get)('tickets/stats')];
            _routeTicket_decorators = [(0, common_1.Post)('tickets/:id/route')];
            _escalateTicket_decorators = [(0, common_1.Post)('tickets/:id/escalate')];
            __esDecorate(this, null, _raiseDispute_decorators, { kind: "method", name: "raiseDispute", static: false, private: false, access: { has: obj => "raiseDispute" in obj, get: obj => obj.raiseDispute }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDisputes_decorators, { kind: "method", name: "getDisputes", static: false, private: false, access: { has: obj => "getDisputes" in obj, get: obj => obj.getDisputes }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reviewDispute_decorators, { kind: "method", name: "reviewDispute", static: false, private: false, access: { has: obj => "reviewDispute" in obj, get: obj => obj.reviewDispute }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _requestRefund_decorators, { kind: "method", name: "requestRefund", static: false, private: false, access: { has: obj => "requestRefund" in obj, get: obj => obj.requestRefund }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _processRefund_decorators, { kind: "method", name: "processRefund", static: false, private: false, access: { has: obj => "processRefund" in obj, get: obj => obj.processRefund }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getQueueStats_decorators, { kind: "method", name: "getQueueStats", static: false, private: false, access: { has: obj => "getQueueStats" in obj, get: obj => obj.getQueueStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _routeTicket_decorators, { kind: "method", name: "routeTicket", static: false, private: false, access: { has: obj => "routeTicket" in obj, get: obj => obj.routeTicket }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _escalateTicket_decorators, { kind: "method", name: "escalateTicket", static: false, private: false, access: { has: obj => "escalateTicket" in obj, get: obj => obj.escalateTicket }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SupportController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        supportService = __runInitializers(this, _instanceExtraInitializers);
        routingService;
        constructor(supportService, routingService) {
            this.supportService = supportService;
            this.routingService = routingService;
        }
        async raiseDispute(body) {
            return this.supportService.raiseDispute(body.orderId, body.customerId, body.type, body.description);
        }
        async getDisputes(query) {
            return this.supportService.getDisputes(query);
        }
        async reviewDispute(id, body) {
            return this.supportService.reviewDispute(id, body.reviewerId, body.status, body.notes);
        }
        async requestRefund(body) {
            return this.supportService.requestRefund(body.orderId, body.requestedBy, body.type, body.amount, body.reason);
        }
        async processRefund(id, body) {
            return this.supportService.processRefund(id, body.processedBy, body.paymentReference);
        }
        async getQueueStats() {
            return this.routingService.getQueueStats();
        }
        async routeTicket(id) {
            return this.routingService.routeTicket(id);
        }
        async escalateTicket(id, body) {
            return this.routingService.escalateTicket(id, body.level || 1);
        }
    };
    return SupportController = _classThis;
})();
exports.SupportController = SupportController;
