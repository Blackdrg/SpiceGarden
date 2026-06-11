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
exports.RestaurantOnboardingService = void 0;
const common_1 = require("@nestjs/common");
const restaurant_onboarding_entity_1 = require("../../db/entities/restaurant-onboarding.entity");
let RestaurantOnboardingService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RestaurantOnboardingService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RestaurantOnboardingService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        onboardingRepo;
        restaurantRepo;
        dataSource;
        logger = new common_1.Logger(RestaurantOnboardingService.name);
        constructor(onboardingRepo, restaurantRepo, dataSource) {
            this.onboardingRepo = onboardingRepo;
            this.restaurantRepo = restaurantRepo;
            this.dataSource = dataSource;
        }
        async getOnboardingByRestaurantId(restaurantId) {
            let onboarding = await this.onboardingRepo.findOne({ where: { restaurantId } });
            if (!onboarding) {
                onboarding = this.onboardingRepo.create({
                    restaurantId,
                    currentStep: restaurant_onboarding_entity_1.OnboardingStep.BUSINESS_REGISTRATION,
                    status: restaurant_onboarding_entity_1.OnboardingStatus.IN_PROGRESS,
                });
                onboarding = await this.onboardingRepo.save(onboarding);
            }
            return onboarding;
        }
        /**
         * Initialize onboarding for a new restaurant
         */
        async initializeOnboarding(restaurantId) {
            // Check if restaurant exists
            const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
            if (!restaurant) {
                throw new common_1.NotFoundException('Restaurant not found');
            }
            // Check if onboarding already exists
            const existingOnboarding = await this.onboardingRepo.findOne({
                where: { restaurantId }
            });
            if (existingOnboarding) {
                // If already completed, return existing
                if (existingOnboarding.status === restaurant_onboarding_entity_1.OnboardingStatus.COMPLETED) {
                    return existingOnboarding;
                }
                // If in progress, return existing
                return existingOnboarding;
            }
            // Create new onboarding record
            const onboarding = this.onboardingRepo.create({
                restaurantId,
                currentStep: restaurant_onboarding_entity_1.OnboardingStep.BUSINESS_REGISTRATION,
                status: restaurant_onboarding_entity_1.OnboardingStatus.IN_PROGRESS,
            });
            const savedOnboarding = await this.onboardingRepo.save(onboarding);
            this.logger.log(`Initialized onboarding for restaurant ${restaurantId}`);
            return savedOnboarding;
        }
        /**
         * Update onboarding step
         */
        async updateStep(onboardingId, step, data) {
            const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
            if (!onboarding) {
                throw new common_1.NotFoundException('Onboarding record not found');
            }
            // Update the current step
            onboarding.currentStep = step;
            // Update specific data based on step
            if (data) {
                switch (step) {
                    case restaurant_onboarding_entity_1.OnboardingStep.BUSINESS_REGISTRATION:
                        onboarding.businessDetails = { ...onboarding.businessDetails, ...data };
                        break;
                    case restaurant_onboarding_entity_1.OnboardingStep.DOCUMENT_UPLOAD:
                        onboarding.documentStatus = { ...onboarding.documentStatus, ...data };
                        break;
                    case restaurant_onboarding_entity_1.OnboardingStep.BANK_VERIFICATION:
                        onboarding.bankDetails = { ...onboarding.bankDetails, ...data };
                        break;
                    case restaurant_onboarding_entity_1.OnboardingStep.MENU_SETUP:
                        onboarding.menuSetup = { ...onboarding.menuSetup, ...data };
                        break;
                    default:
                        break;
                }
            }
            // If this is the final step, mark as completed
            if (step === restaurant_onboarding_entity_1.OnboardingStep.STAFF_INVITE) {
                onboarding.status = restaurant_onboarding_entity_1.OnboardingStatus.COMPLETED;
            }
            const updatedOnboarding = await this.onboardingRepo.save(onboarding);
            this.logger.log(`Updated onboarding step to ${step} for onboarding ${onboardingId}`);
            return updatedOnboarding;
        }
        /**
         * Get onboarding status for a restaurant
         */
        async getOnboardingStatus(restaurantId) {
            const onboarding = await this.onboardingRepo.findOne({
                where: { restaurantId }
            });
            if (!onboarding) {
                throw new common_1.NotFoundException('Onboarding record not found for restaurant');
            }
            return onboarding;
        }
        /**
         * Complete onboarding manually
         */
        async completeOnboarding(onboardingId, reviewedBy) {
            const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
            if (!onboarding) {
                throw new common_1.NotFoundException('Onboarding record not found');
            }
            onboarding.status = restaurant_onboarding_entity_1.OnboardingStatus.COMPLETED;
            onboarding.reviewedBy = reviewedBy;
            onboarding.reviewedAt = new Date();
            onboarding.currentStep = restaurant_onboarding_entity_1.OnboardingStep.COMPLETION;
            const updatedOnboarding = await this.onboardingRepo.save(onboarding);
            this.logger.log(`Completed onboarding ${onboardingId}`);
            return updatedOnboarding;
        }
        /**
         * Reject onboarding
         */
        async rejectOnboarding(onboardingId, reviewedBy, reason) {
            const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
            if (!onboarding) {
                throw new common_1.NotFoundException('Onboarding record not found');
            }
            onboarding.status = restaurant_onboarding_entity_1.OnboardingStatus.REJECTED;
            onboarding.reviewedBy = reviewedBy;
            onboarding.reviewedAt = new Date();
            onboarding.rejectionReason = reason;
            const updatedOnboarding = await this.onboardingRepo.save(onboarding);
            this.logger.log(`Rejected onboarding ${onboardingId}`);
            return updatedOnboarding;
        }
        async submitGSTConfig(restaurantId, gstData) {
            const onboarding = await this.getOnboardingByRestaurantId(restaurantId);
            onboarding.currentStep = restaurant_onboarding_entity_1.OnboardingStep.GST_CONFIG;
            onboarding.businessDetails = { ...onboarding.businessDetails, ...gstData };
            return this.onboardingRepo.save(onboarding);
        }
        async setupPricing(restaurantId, pricing) {
            const onboarding = await this.getOnboardingByRestaurantId(restaurantId);
            onboarding.currentStep = restaurant_onboarding_entity_1.OnboardingStep.PRICING_SETUP;
            if (!onboarding.businessDetails)
                onboarding.businessDetails = {};
            onboarding.businessDetails.pricing = pricing;
            return this.onboardingRepo.save(onboarding);
        }
        async setupPayout(restaurantId, payout) {
            const onboarding = await this.getOnboardingByRestaurantId(restaurantId);
            onboarding.currentStep = restaurant_onboarding_entity_1.OnboardingStep.PAYOUT_SETUP;
            onboarding.bankDetails = { ...onboarding.bankDetails, ...payout };
            onboarding.status = restaurant_onboarding_entity_1.OnboardingStatus.AWAITING_REVIEW;
            return this.onboardingRepo.save(onboarding);
        }
        /**
          * Get onboarding analytics
          */
        async getOnboardingAnalytics() {
            const [totalOnboardings, pendingOnboardings, inProgressOnboardings, completedOnboardings, rejectedOnboardings, avgCompletionTime] = await Promise.all([
                this.onboardingRepo.count(),
                this.onboardingRepo.count({ where: { status: restaurant_onboarding_entity_1.OnboardingStatus.PENDING } }),
                this.onboardingRepo.count({ where: { status: restaurant_onboarding_entity_1.OnboardingStatus.IN_PROGRESS } }),
                this.onboardingRepo.count({ where: { status: restaurant_onboarding_entity_1.OnboardingStatus.COMPLETED } }),
                this.onboardingRepo.count({ where: { status: restaurant_onboarding_entity_1.OnboardingStatus.REJECTED } }),
                this.getAverageCompletionTime(),
            ]);
            return {
                totalOnboardings,
                pendingOnboardings,
                inProgressOnboardings,
                completedOnboardings,
                rejectedOnboardings,
                completionRate: totalOnboardings > 0
                    ? (completedOnboardings / totalOnboardings) * 100
                    : 0,
                avgCompletionTimeHours: avgCompletionTime
            };
        }
        /**
         * Helper to calculate average completion time
         */
        async getAverageCompletionTime() {
            const result = await this.onboardingRepo
                .createQueryBuilder('onboarding')
                .select('AVG(TIMESTAMPDIFF(HOUR, onboarding.createdAt, onboarding.updatedAt))', 'avgHours')
                .where('onboarding.status = :status', { status: restaurant_onboarding_entity_1.OnboardingStatus.COMPLETED })
                .getRawOne();
            return result?.avgHours || 0;
        }
    };
    return RestaurantOnboardingService = _classThis;
})();
exports.RestaurantOnboardingService = RestaurantOnboardingService;
