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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantOpsService = void 0;
const common_1 = require("@nestjs/common");
const restaurant_onboarding_entity_1 = require("../../db/entities/restaurant-onboarding.entity");
let RestaurantOpsService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RestaurantOpsService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RestaurantOpsService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        onboardingRepo;
        restaurantRepo;
        branchRepo;
        itemRepo;
        categoryRepo;
        userRepo;
        dataSource;
        logger = new common_1.Logger(RestaurantOpsService.name);
        constructor(onboardingRepo, restaurantRepo, branchRepo, itemRepo, categoryRepo, userRepo, dataSource) {
            this.onboardingRepo = onboardingRepo;
            this.restaurantRepo = restaurantRepo;
            this.branchRepo = branchRepo;
            this.itemRepo = itemRepo;
            this.categoryRepo = categoryRepo;
            this.userRepo = userRepo;
            this.dataSource = dataSource;
        }
        async startOnboarding(userId, restaurantData) {
            // Check if slug exists
            const existing = await this.restaurantRepo.findOne({ where: { slug: restaurantData.slug } });
            if (existing) {
                throw new common_1.BadRequestException('Restaurant slug already exists');
            }
            const restaurant = this.restaurantRepo.create({
                name: restaurantData.name,
                slug: restaurantData.slug,
                description: restaurantData.description || '',
                status: 'pending',
            });
            const savedRestaurant = await this.restaurantRepo.save(restaurant);
            const onboarding = this.onboardingRepo.create({
                restaurantId: savedRestaurant.id,
                currentStep: restaurant_onboarding_entity_1.OnboardingStep.BUSINESS_REGISTRATION,
                status: restaurant_onboarding_entity_1.OnboardingStatus.IN_PROGRESS,
                businessDetails: restaurantData.businessDetails || {},
            });
            return this.onboardingRepo.save(onboarding);
        }
        async updateStep(onboardingId, step, data) {
            const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
            if (!onboarding) {
                throw new common_1.NotFoundException('Onboarding not found');
            }
            const updateData = { currentStep: step };
            switch (step) {
                case restaurant_onboarding_entity_1.OnboardingStep.DOCUMENT_UPLOAD:
                    updateData.documentStatus = { ...onboarding.documentStatus, ...(data?.documents || {}) };
                    break;
                case restaurant_onboarding_entity_1.OnboardingStep.BANK_VERIFICATION:
                    updateData.bankDetails = { ...onboarding.bankDetails, ...(data?.bankDetails || {}) };
                    break;
                case restaurant_onboarding_entity_1.OnboardingStep.MENU_SETUP:
                    updateData.menuSetup = { ...onboarding.menuSetup, ...(data?.menuSetup || {}) };
                    break;
            }
            await this.onboardingRepo.update(onboardingId, updateData);
            return this.onboardingRepo.findOne({ where: { id: onboardingId } });
        }
        async completeOnboarding(onboardingId, userId) {
            const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
            if (!onboarding) {
                throw new common_1.NotFoundException('Onboarding not found');
            }
            await this.onboardingRepo.update(onboardingId, {
                status: restaurant_onboarding_entity_1.OnboardingStatus.COMPLETED,
                currentStep: restaurant_onboarding_entity_1.OnboardingStep.COMPLETION,
            });
            await this.restaurantRepo.update(onboarding.restaurantId, { status: 'active' });
            return this.onboardingRepo.findOne({ where: { id: onboardingId } });
        }
        async getOnboardingProgress(onboardingId) {
            const onboarding = await this.onboardingRepo.findOne({
                where: { id: onboardingId },
                relations: ['restaurant'],
            });
            if (!onboarding) {
                throw new common_1.NotFoundException('Onboarding not found');
            }
            const steps = Object.values(restaurant_onboarding_entity_1.OnboardingStep);
            const currentStepIndex = steps.indexOf(onboarding.currentStep);
            return {
                ...onboarding,
                progress: Math.round(((currentStepIndex + 1) / steps.length) * 100),
                stepsCompleted: currentStepIndex + 1,
                totalSteps: steps.length,
            };
        }
    };
    return RestaurantOpsService = _classThis;
})();
exports.RestaurantOpsService = RestaurantOpsService;
