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
exports.DriverOpsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let DriverOpsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('drivers'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(user_interface_1.UserRole.DELIVERY_PARTNER, user_interface_1.UserRole.ADMIN)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _startOnboarding_decorators;
    let _uploadDocument_decorators;
    let _getDocuments_decorators;
    let _verifyDocument_decorators;
    let _getOnboardingStatus_decorators;
    let _calculateIncentives_decorators;
    let _generateIncentive_decorators;
    let _approveIncentive_decorators;
    let _getPendingIncentives_decorators;
    var DriverOpsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _startOnboarding_decorators = [(0, common_1.Post)('onboarding')];
            _uploadDocument_decorators = [(0, common_1.Post)('documents')];
            _getDocuments_decorators = [(0, common_1.Get)('documents/:driverId')];
            _verifyDocument_decorators = [(0, common_1.Put)('documents/:id/verify')];
            _getOnboardingStatus_decorators = [(0, common_1.Get)('onboarding/:id/status')];
            _calculateIncentives_decorators = [(0, common_1.Post)('incentives/calculate')];
            _generateIncentive_decorators = [(0, common_1.Post)('incentives')];
            _approveIncentive_decorators = [(0, common_1.Put)('incentives/:id/approve')];
            _getPendingIncentives_decorators = [(0, common_1.Get)('incentives/pending')];
            __esDecorate(this, null, _startOnboarding_decorators, { kind: "method", name: "startOnboarding", static: false, private: false, access: { has: obj => "startOnboarding" in obj, get: obj => obj.startOnboarding }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _uploadDocument_decorators, { kind: "method", name: "uploadDocument", static: false, private: false, access: { has: obj => "uploadDocument" in obj, get: obj => obj.uploadDocument }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDocuments_decorators, { kind: "method", name: "getDocuments", static: false, private: false, access: { has: obj => "getDocuments" in obj, get: obj => obj.getDocuments }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _verifyDocument_decorators, { kind: "method", name: "verifyDocument", static: false, private: false, access: { has: obj => "verifyDocument" in obj, get: obj => obj.verifyDocument }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOnboardingStatus_decorators, { kind: "method", name: "getOnboardingStatus", static: false, private: false, access: { has: obj => "getOnboardingStatus" in obj, get: obj => obj.getOnboardingStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _calculateIncentives_decorators, { kind: "method", name: "calculateIncentives", static: false, private: false, access: { has: obj => "calculateIncentives" in obj, get: obj => obj.calculateIncentives }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _generateIncentive_decorators, { kind: "method", name: "generateIncentive", static: false, private: false, access: { has: obj => "generateIncentive" in obj, get: obj => obj.generateIncentive }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _approveIncentive_decorators, { kind: "method", name: "approveIncentive", static: false, private: false, access: { has: obj => "approveIncentive" in obj, get: obj => obj.approveIncentive }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPendingIncentives_decorators, { kind: "method", name: "getPendingIncentives", static: false, private: false, access: { has: obj => "getPendingIncentives" in obj, get: obj => obj.getPendingIncentives }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DriverOpsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        onboardingService = __runInitializers(this, _instanceExtraInitializers);
        payoutService;
        constructor(onboardingService, payoutService) {
            this.onboardingService = onboardingService;
            this.payoutService = payoutService;
        }
        async startOnboarding(body) {
            return this.onboardingService.startOnboarding(body.userId, body.data);
        }
        async uploadDocument(body) {
            return this.onboardingService.uploadDocument(body.driverId, body.type, body.url, body.expiryDate ? new Date(body.expiryDate) : undefined);
        }
        async getDocuments(driverId) {
            return this.onboardingService.getDocuments(driverId);
        }
        async verifyDocument(id, body) {
            return this.onboardingService.verifyDocument(id, body.status, body.notes, body.verifierId);
        }
        async getOnboardingStatus(id) {
            return this.onboardingService.getOnboardingStatus(id);
        }
        async calculateIncentives(body) {
            return this.payoutService.calculateWeeklyIncentives(body.driverId, new Date(body.weekStart));
        }
        async generateIncentive(body) {
            return this.payoutService.generateIncentive(body.driverId, body.type, body.amount, body.description);
        }
        async approveIncentive(id, body) {
            return this.payoutService.approveIncentive(id, body.approverId);
        }
        async getPendingIncentives(driverId) {
            return this.payoutService.getPendingIncentives(driverId);
        }
    };
    return DriverOpsController = _classThis;
})();
exports.DriverOpsController = DriverOpsController;
