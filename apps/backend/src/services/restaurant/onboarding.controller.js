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
exports.RestaurantOnboardingController = void 0;
const common_1 = require("@nestjs/common");
const restaurant_onboarding_entity_1 = require("../../db/entities/restaurant-onboarding.entity");
const swagger_1 = require("@nestjs/swagger");
let RestaurantOnboardingController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('restaurant-onboarding'), (0, common_1.Controller)('restaurant-onboarding')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _initializeOnboarding_decorators;
    let _updateStep_decorators;
    let _getOnboardingStatus_decorators;
    let _completeOnboarding_decorators;
    let _rejectOnboarding_decorators;
    let _submitGSTConfig_decorators;
    let _setupPricing_decorators;
    let _setupPayout_decorators;
    let _getOnboardingAnalytics_decorators;
    var RestaurantOnboardingController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _initializeOnboarding_decorators = [(0, common_1.Post)('initialize/:restaurantId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Initialize onboarding for a restaurant' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding initialized successfully' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurant not found' }), (0, swagger_1.ApiParam)({ name: 'restaurantId', type: 'string' })];
            _updateStep_decorators = [(0, common_1.Put)('step/:onboardingId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Update onboarding step' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding step updated successfully' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Onboarding record not found' }), (0, swagger_1.ApiParam)({ name: 'onboardingId', type: 'string' }), (0, swagger_1.ApiBody)({
                    schema: {
                        type: 'object',
                        properties: {
                            step: { type: 'string', enum: Object.values(restaurant_onboarding_entity_1.OnboardingStep) },
                            data: { type: 'object' }
                        },
                        required: ['step']
                    }
                })];
            _getOnboardingStatus_decorators = [(0, common_1.Get)('status/:restaurantId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get onboarding status for a restaurant' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding status retrieved successfully' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Onboarding record not found' }), (0, swagger_1.ApiParam)({ name: 'restaurantId', type: 'string' })];
            _completeOnboarding_decorators = [(0, common_1.Post)('complete/:onboardingId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Complete onboarding' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding completed successfully' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Onboarding record not found' }), (0, swagger_1.ApiParam)({ name: 'onboardingId', type: 'string' }), (0, swagger_1.ApiBody)({
                    schema: {
                        type: 'object',
                        properties: {
                            reviewedBy: { type: 'string' }
                        },
                        required: ['reviewedBy']
                    }
                })];
            _rejectOnboarding_decorators = [(0, common_1.Post)('reject/:onboardingId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Reject onboarding' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding rejected successfully' }), (0, swagger_1.ApiResponse)({ status: 404, description: 'Onboarding record not found' }), (0, swagger_1.ApiParam)({ name: 'onboardingId', type: 'string' }), (0, swagger_1.ApiBody)({
                    schema: {
                        type: 'object',
                        properties: {
                            reviewedBy: { type: 'string' },
                            reason: { type: 'string' }
                        },
                        required: ['reviewedBy', 'reason']
                    }
                })];
            _submitGSTConfig_decorators = [(0, common_1.Put)('gst/:restaurantId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Configure GST for a restaurant' })];
            _setupPricing_decorators = [(0, common_1.Put)('pricing/:restaurantId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Setup pricing for a restaurant' })];
            _setupPayout_decorators = [(0, common_1.Put)('payout/:restaurantId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Setup payout settings for a restaurant' })];
            _getOnboardingAnalytics_decorators = [(0, common_1.Get)('analytics/overview'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get onboarding analytics' }), (0, swagger_1.ApiResponse)({ status: 200, description: 'Onboarding analytics retrieved successfully' })];
            __esDecorate(this, null, _initializeOnboarding_decorators, { kind: "method", name: "initializeOnboarding", static: false, private: false, access: { has: obj => "initializeOnboarding" in obj, get: obj => obj.initializeOnboarding }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateStep_decorators, { kind: "method", name: "updateStep", static: false, private: false, access: { has: obj => "updateStep" in obj, get: obj => obj.updateStep }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOnboardingStatus_decorators, { kind: "method", name: "getOnboardingStatus", static: false, private: false, access: { has: obj => "getOnboardingStatus" in obj, get: obj => obj.getOnboardingStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _completeOnboarding_decorators, { kind: "method", name: "completeOnboarding", static: false, private: false, access: { has: obj => "completeOnboarding" in obj, get: obj => obj.completeOnboarding }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _rejectOnboarding_decorators, { kind: "method", name: "rejectOnboarding", static: false, private: false, access: { has: obj => "rejectOnboarding" in obj, get: obj => obj.rejectOnboarding }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _submitGSTConfig_decorators, { kind: "method", name: "submitGSTConfig", static: false, private: false, access: { has: obj => "submitGSTConfig" in obj, get: obj => obj.submitGSTConfig }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setupPricing_decorators, { kind: "method", name: "setupPricing", static: false, private: false, access: { has: obj => "setupPricing" in obj, get: obj => obj.setupPricing }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setupPayout_decorators, { kind: "method", name: "setupPayout", static: false, private: false, access: { has: obj => "setupPayout" in obj, get: obj => obj.setupPayout }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOnboardingAnalytics_decorators, { kind: "method", name: "getOnboardingAnalytics", static: false, private: false, access: { has: obj => "getOnboardingAnalytics" in obj, get: obj => obj.getOnboardingAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RestaurantOnboardingController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        onboardingService = __runInitializers(this, _instanceExtraInitializers);
        constructor(onboardingService) {
            this.onboardingService = onboardingService;
        }
        async initializeOnboarding(restaurantId) {
            return await this.onboardingService.initializeOnboarding(restaurantId);
        }
        async updateStep(onboardingId, body) {
            return await this.onboardingService.updateStep(onboardingId, body.step, body.data);
        }
        async getOnboardingStatus(restaurantId) {
            return await this.onboardingService.getOnboardingStatus(restaurantId);
        }
        async completeOnboarding(onboardingId, body) {
            return await this.onboardingService.completeOnboarding(onboardingId, body.reviewedBy);
        }
        async rejectOnboarding(onboardingId, body) {
            return await this.onboardingService.rejectOnboarding(onboardingId, body.reviewedBy, body.reason);
        }
        async submitGSTConfig(restaurantId, gstData) {
            return await this.onboardingService.submitGSTConfig(restaurantId, gstData);
        }
        async setupPricing(restaurantId, pricing) {
            return await this.onboardingService.setupPricing(restaurantId, pricing);
        }
        async setupPayout(restaurantId, payout) {
            return await this.onboardingService.setupPayout(restaurantId, payout);
        }
        async getOnboardingAnalytics() {
            return await this.onboardingService.getOnboardingAnalytics();
        }
    };
    return RestaurantOnboardingController = _classThis;
})();
exports.RestaurantOnboardingController = RestaurantOnboardingController;
