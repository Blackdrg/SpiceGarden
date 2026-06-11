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
exports.RestaurantOpsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let RestaurantOpsController = (() => {
    let _classDecorators = [(0, common_1.Controller)('restaurant/ops'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(user_interface_1.UserRole.RESTAURANT, user_interface_1.UserRole.ADMIN)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _startOnboarding_decorators;
    let _getOnboardingProgress_decorators;
    let _updateOnboardingStep_decorators;
    let _completeOnboarding_decorators;
    let _submitForModeration_decorators;
    let _getPendingModerations_decorators;
    let _reviewModeration_decorators;
    let _getPayoutHistory_decorators;
    let _generatePayout_decorators;
    let _processPayout_decorators;
    let _createBranch_decorators;
    let _updateBranch_decorators;
    let _toggleBranchStatus_decorators;
    let _getBranch_decorators;
    let _createCommissionRule_decorators;
    let _getCommissionRules_decorators;
    let _calculateCommission_decorators;
    var RestaurantOpsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _startOnboarding_decorators = [(0, common_1.Post)('onboarding')];
            _getOnboardingProgress_decorators = [(0, common_1.Get)('onboarding/:id')];
            _updateOnboardingStep_decorators = [(0, common_1.Put)('onboarding/:id/step')];
            _completeOnboarding_decorators = [(0, common_1.Post)('onboarding/:id/complete')];
            _submitForModeration_decorators = [(0, common_1.Post)('moderation')];
            _getPendingModerations_decorators = [(0, common_1.Get)('moderation/pending')];
            _reviewModeration_decorators = [(0, common_1.Put)('moderation/:id/review')];
            _getPayoutHistory_decorators = [(0, common_1.Get)('payout/history')];
            _generatePayout_decorators = [(0, common_1.Post)('payout/generate')];
            _processPayout_decorators = [(0, common_1.Post)('payout/:id/process')];
            _createBranch_decorators = [(0, common_1.Post)('branch')];
            _updateBranch_decorators = [(0, common_1.Put)('branch/:id')];
            _toggleBranchStatus_decorators = [(0, common_1.Put)('branch/:id/status')];
            _getBranch_decorators = [(0, common_1.Get)('branch/:id')];
            _createCommissionRule_decorators = [(0, common_1.Post)('commission')];
            _getCommissionRules_decorators = [(0, common_1.Get)('commission/:restaurantId')];
            _calculateCommission_decorators = [(0, common_1.Post)('commission/calculate')];
            __esDecorate(this, null, _startOnboarding_decorators, { kind: "method", name: "startOnboarding", static: false, private: false, access: { has: obj => "startOnboarding" in obj, get: obj => obj.startOnboarding }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOnboardingProgress_decorators, { kind: "method", name: "getOnboardingProgress", static: false, private: false, access: { has: obj => "getOnboardingProgress" in obj, get: obj => obj.getOnboardingProgress }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateOnboardingStep_decorators, { kind: "method", name: "updateOnboardingStep", static: false, private: false, access: { has: obj => "updateOnboardingStep" in obj, get: obj => obj.updateOnboardingStep }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _completeOnboarding_decorators, { kind: "method", name: "completeOnboarding", static: false, private: false, access: { has: obj => "completeOnboarding" in obj, get: obj => obj.completeOnboarding }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _submitForModeration_decorators, { kind: "method", name: "submitForModeration", static: false, private: false, access: { has: obj => "submitForModeration" in obj, get: obj => obj.submitForModeration }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPendingModerations_decorators, { kind: "method", name: "getPendingModerations", static: false, private: false, access: { has: obj => "getPendingModerations" in obj, get: obj => obj.getPendingModerations }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reviewModeration_decorators, { kind: "method", name: "reviewModeration", static: false, private: false, access: { has: obj => "reviewModeration" in obj, get: obj => obj.reviewModeration }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPayoutHistory_decorators, { kind: "method", name: "getPayoutHistory", static: false, private: false, access: { has: obj => "getPayoutHistory" in obj, get: obj => obj.getPayoutHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _generatePayout_decorators, { kind: "method", name: "generatePayout", static: false, private: false, access: { has: obj => "generatePayout" in obj, get: obj => obj.generatePayout }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _processPayout_decorators, { kind: "method", name: "processPayout", static: false, private: false, access: { has: obj => "processPayout" in obj, get: obj => obj.processPayout }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createBranch_decorators, { kind: "method", name: "createBranch", static: false, private: false, access: { has: obj => "createBranch" in obj, get: obj => obj.createBranch }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateBranch_decorators, { kind: "method", name: "updateBranch", static: false, private: false, access: { has: obj => "updateBranch" in obj, get: obj => obj.updateBranch }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _toggleBranchStatus_decorators, { kind: "method", name: "toggleBranchStatus", static: false, private: false, access: { has: obj => "toggleBranchStatus" in obj, get: obj => obj.toggleBranchStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getBranch_decorators, { kind: "method", name: "getBranch", static: false, private: false, access: { has: obj => "getBranch" in obj, get: obj => obj.getBranch }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createCommissionRule_decorators, { kind: "method", name: "createCommissionRule", static: false, private: false, access: { has: obj => "createCommissionRule" in obj, get: obj => obj.createCommissionRule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getCommissionRules_decorators, { kind: "method", name: "getCommissionRules", static: false, private: false, access: { has: obj => "getCommissionRules" in obj, get: obj => obj.getCommissionRules }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _calculateCommission_decorators, { kind: "method", name: "calculateCommission", static: false, private: false, access: { has: obj => "calculateCommission" in obj, get: obj => obj.calculateCommission }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RestaurantOpsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        opsService = __runInitializers(this, _instanceExtraInitializers);
        moderationService;
        payoutService;
        branchService;
        commissionService;
        constructor(opsService, moderationService, payoutService, branchService, commissionService) {
            this.opsService = opsService;
            this.moderationService = moderationService;
            this.payoutService = payoutService;
            this.branchService = branchService;
            this.commissionService = commissionService;
        }
        async startOnboarding(body) {
            return this.opsService.startOnboarding(body.userId, body.restaurantData);
        }
        async getOnboardingProgress(id) {
            return this.opsService.getOnboardingProgress(id);
        }
        async updateOnboardingStep(id, body) {
            return this.opsService.updateStep(id, body.step, body.data);
        }
        async completeOnboarding(id, req) {
            return this.opsService.completeOnboarding(id, req.user.id);
        }
        async submitForModeration(body) {
            return this.moderationService.submitForModeration(body.menuItemId, body.restaurantId, body.action, body.data, body.originalData);
        }
        async getPendingModerations(restaurantId) {
            return this.moderationService.getPendingModerations(restaurantId);
        }
        async reviewModeration(id, body, req) {
            return this.moderationService.reviewModeration(id, req.user.id, body.status, body.notes);
        }
        async getPayoutHistory(restaurantId) {
            return this.payoutService.getPayoutHistory(restaurantId);
        }
        async generatePayout(body) {
            return this.payoutService.generatePayoutReport(body.restaurantId, new Date(body.periodStart), new Date(body.periodEnd));
        }
        async processPayout(id, body) {
            return this.payoutService.processPayout(id, body.reference);
        }
        async createBranch(body) {
            return this.branchService.createBranch(body.restaurantId, body.branchData);
        }
        async updateBranch(id, body) {
            return this.branchService.updateBranch(id, body);
        }
        async toggleBranchStatus(id, body) {
            return this.branchService.toggleBranchStatus(id, body.isOnline);
        }
        async getBranch(id) {
            return this.branchService.getBranchDetails(id);
        }
        async createCommissionRule(body) {
            return this.commissionService.createCommissionRule(body.restaurantId, body.ruleData);
        }
        async getCommissionRules(restaurantId) {
            return this.commissionService.getCommissionRules(restaurantId);
        }
        async calculateCommission(body) {
            const amount = await this.commissionService.calculateCommission(body.restaurantId, body.orderAmount);
            return { commissionAmount: amount };
        }
    };
    return RestaurantOpsController = _classThis;
})();
exports.RestaurantOpsController = RestaurantOpsController;
