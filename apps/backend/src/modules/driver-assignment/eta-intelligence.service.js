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
exports.ETAIntelligenceService = void 0;
const common_1 = require("@nestjs/common");
let ETAIntelligenceService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ETAIntelligenceService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ETAIntelligenceService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        driverRepo;
        orderRepo;
        branchRepo;
        assignmentRepo;
        slaRepo;
        fraudRepo;
        constructor(driverRepo, orderRepo, branchRepo, assignmentRepo, slaRepo, fraudRepo) {
            this.driverRepo = driverRepo;
            this.orderRepo = orderRepo;
            this.branchRepo = branchRepo;
            this.assignmentRepo = assignmentRepo;
            this.slaRepo = slaRepo;
            this.fraudRepo = fraudRepo;
        }
        /**
         * Calculate ETA for an order based on multiple factors
         */
        async calculateETA(orderId, driverId) {
            // Get all necessary data
            const [order, driver, branch, recentAssignments] = await Promise.all([
                this.orderRepo.findOne({ where: { id: orderId } }),
                this.driverRepo.findOne({ where: { id: driverId } }),
                this.branchRepo.findOne({
                    where: { restaurant: { id: orderId } } // Simplified - adjust based on actual relations
                }),
                this.assignmentRepo.find({
                    where: { driver: { id: driverId } },
                    order: { createdAt: 'DESC' },
                    take: 10
                })
            ]);
            if (!order || !driver || !branch) {
                throw new Error('Required data not found for ETA calculation');
            }
            // Base ETA calculation factors
            const factors = {
                distance: await this.calculateDistance(order, driver, branch),
                trafficConditions: await this.getTrafficConditions(),
                kitchenDelay: await this.getKitchenDelay(branch.id),
                driverExperience: driver.totalDeliveries,
                timeOfDay: new Date().getHours(),
                weatherImpact: await this.getWeatherImpact()
            };
            // Calculate base time based on distance and average speed
            const baseTimeMinutes = (factors.distance / Math.max(driver.averageSpeed, 10)) * 60; // Convert to minutes
            // Apply multipliers based on conditions
            let totalMultiplier = 1.0;
            // Traffic impact (1.0 = normal, 1.5 = heavy traffic, etc.)
            totalMultiplier *= factors.trafficConditions.multiplier || 1.0;
            // Kitchen delay impact
            totalMultiplier *= (1 + (factors.kitchenDelay.delayMinutes / 60));
            // Time of day impact (rush hours)
            const hour = factors.timeOfDay;
            if ((hour >= 7 && hour <= 9) || (hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 20)) {
                totalMultiplier *= 1.3; // Rush hour multiplier
            }
            // Weather impact
            totalMultiplier *= factors.weatherImpact.multiplier || 1.0;
            // Driver experience factor (experienced drivers are slightly faster)
            const experienceFactor = Math.max(0.8, 1 - (driver.totalDeliveries / 2000));
            totalMultiplier *= experienceFactor;
            const etaMinutes = baseTimeMinutes * totalMultiplier;
            // Calculate confidence based on data availability and historical accuracy
            const confidence = this.calculateConfidence(factors, recentAssignments);
            return {
                etaMinutes: Math.round(etaMinutes),
                confidence,
                factors
            };
        }
        /**
         * Calculate distance between restaurant and delivery location
         * (In reality, this would use a mapping service like Google Maps API)
         */
        async calculateDistance(order, driver, branch) {
            // Placeholder implementation - in reality you'd:
            // 1. Get restaurant coordinates from branch
            // 2. Get delivery coordinates from order
            // 3. Use a distance calculation service (Haversine formula or mapping API)
            // For now, return a reasonable placeholder
            return 5.0; // 5 km average
        }
        /**
         * Get current traffic conditions
         * (In reality, this would call a traffic API like Google Maps Traffic API)
         */
        async getTrafficConditions() {
            // Placeholder - in reality you'd call a traffic API
            // Return normal traffic conditions
            return {
                multiplier: 1.0,
                level: 'normal'
            };
        }
        /**
         * Get average kitchen delay for a branch
         */
        async getKitchenDelay(branchId) {
            // Placeholder - in reality you'd query recent SLA data or kitchen metrics
            return {
                delayMinutes: 5, // 5 minutes average delay
                confidence: 0.7
            };
        }
        /**
         * Get weather impact factor
         * (In reality, this would call a weather API)
         */
        async getWeatherImpact() {
            // Placeholder - in reality you'd call a weather API
            return {
                multiplier: 1.0,
                condition: 'clear'
            };
        }
        /**
         * Calculate confidence in ETA prediction based on data quality and historical accuracy
         */
        calculateConfidence(factors, recentAssignments) {
            let confidence = 0.8; // Base confidence
            // Reduce confidence if we don't have enough historical data
            if (recentAssignments.length < 3) {
                confidence *= 0.8;
            }
            // Reduce confidence if unknown factor has low confidence
            if (factors.kitchenDelay && factors.kitchenDelay.confidence < 0.8) {
                confidence *= factors.kitchenDelay.confidence;
            }
            // Increase confidence for experienced drivers with good track record
            // This would be based on historical ETA accuracy in a real implementation
            return Math.min(0.95, Math.max(0.3, confidence)); // Clamp between 30% and 95%
        }
        /**
         * Update ETA for an ongoing delivery based on real-time progress
         */
        async updateETARegionalTime(assignmentId, currentLocation) {
            // Placeholder implementation - in reality you'd:
            // 1. Get the assignment details
            // 2. Calculate remaining distance to destination
            // 3. Factor in current traffic, speed, etc.
            // 4. Return updated ETA
            return {
                etaMinutes: 15, // Placeholder
                timestamp: new Date()
            };
        }
        /**
         * Get historical ETA accuracy for a driver or branch
         */
        async getHistoricalETAAccuracy(driverId, branchId, days = 7) {
            // Placeholder - in reality you'd compare predicted vs actual ETAs
            return {
                averageErrorMinutes: 3,
                accuracyPercentage: 85
            };
        }
    };
    return ETAIntelligenceService = _classThis;
})();
exports.ETAIntelligenceService = ETAIntelligenceService;
