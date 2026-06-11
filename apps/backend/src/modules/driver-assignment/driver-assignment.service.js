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
exports.DriverAssignmentService = void 0;
const common_1 = require("@nestjs/common");
let DriverAssignmentService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DriverAssignmentService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DriverAssignmentService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        driverRepo;
        orderRepo;
        assignmentRepo;
        branchRepo;
        scoreRepo;
        slaRepo;
        fraudRepo;
        dataSource;
        dispatchEngine;
        etaIntelligence;
        constructor(driverRepo, orderRepo, assignmentRepo, branchRepo, scoreRepo, slaRepo, fraudRepo, dataSource, dispatchEngine, etaIntelligence) {
            this.driverRepo = driverRepo;
            this.orderRepo = orderRepo;
            this.assignmentRepo = assignmentRepo;
            this.branchRepo = branchRepo;
            this.scoreRepo = scoreRepo;
            this.slaRepo = slaRepo;
            this.fraudRepo = fraudRepo;
            this.dataSource = dataSource;
            this.dispatchEngine = dispatchEngine;
            this.etaIntelligence = etaIntelligence;
        }
        /**
         * Assign a driver to an order using the dispatch engine
         */
        async assignDriverToOrder(orderId) {
            return this.dispatchEngine.dispatchOrder(orderId);
        }
        /**
         * Assign multiple orders to a single driver (batch delivery)
         */
        async assignBatchDelivery(orderIds, driverId) {
            return this.dispatchEngine.assignBatchDelivery(orderIds, driverId);
        }
        /**
         * Reassign an order from one driver to another
         */
        async reassignOrder(assignmentId, newDriverId, reason = 'Driver unavailable') {
            return this.dispatchEngine.reassignOrder(assignmentId, newDriverId, reason);
        }
        /**
         * Get current assignments for a driver
         */
        async getDriverAssignments(driverId, status) {
            const where = { driver: { id: driverId } };
            if (status) {
                where.status = status;
            }
            return this.assignmentRepo.find({
                where,
                relations: ['order', 'driver', 'branch'],
                order: { createdAt: 'DESC' }
            });
        }
        /**
         * Get assignments for an order
         */
        async getOrderAssignments(orderId) {
            return this.assignmentRepo.find({
                where: { order: { id: orderId } },
                relations: ['driver', 'branch'],
                order: { createdAt: 'DESC' }
            });
        }
        /**
         * Update assignment status (accepted, picked_up, delivered, etc.)
         */
        async updateAssignmentStatus(assignmentId, status, actualTimeMinutes) {
            const assignment = await this.assignmentRepo.findOne({
                where: { id: assignmentId }
            });
            if (!assignment) {
                throw new Error('Assignment not found');
            }
            assignment.status = status;
            if (actualTimeMinutes !== undefined) {
                assignment.actualTimeMinutes = actualTimeMinutes;
            }
            // If delivered, set completed timestamp
            if (status === 'delivered') {
                assignment.actualTimeMinutes = actualTimeMinutes || 0;
                // In a real system, you'd calculate actual time from timestamps
            }
            return this.assignmentRepo.save(assignment);
        }
        /**
         * Record GPS tracking data for an assignment
         */
        async updateAssignmentRoute(assignmentId, routeData) {
            const assignment = await this.assignmentRepo.findOne({
                where: { id: assignmentId }
            });
            if (!assignment) {
                throw new Error('Assignment not found');
            }
            assignment.routeData = routeData;
            return this.assignmentRepo.save(assignment);
        }
        /**
         * Get available drivers for a location
         */
        async getAvailableDrivers(lat, lng, radiusInKm = 5) {
            const radius = radiusInKm * 1000; // Convert to meters
            return this.driverRepo
                .createQueryBuilder('driver')
                .where('driver.isOnline = :online', { online: true })
                .andWhere('driver.kycStatus = :status', { status: 'approved' })
                .andWhere('driver.isFraudSuspicious = :fraud', { fraud: false })
                .andWhere(`ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`, { lng, lat, radius })
                .getMany();
        }
        /**
         * Calculate and update driver score based on performance
         */
        async updateDriverScore(driverId) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver) {
                throw new Error('Driver not found');
            }
            // Get recent assignments for scoring calculations
            const recentAssignments = await this.assignmentRepo.find({
                where: { driver: { id: driverId }, status: 'delivered' },
                relations: ['order'],
                order: { createdAt: 'DESC' },
                take: 50 // Look at last 50 deliveries
            });
            if (recentAssignments.length === 0) {
                // No delivery history yet - set default scores
                const score = this.scoreRepo.create({
                    driver,
                    overallScore: 0,
                    onTimeDeliveryRate: 0,
                    acceptanceRate: 0,
                    cancellationRate: 0,
                    customerRating: driver.rating || 0,
                    totalDeliveries: driver.totalDeliveries,
                    totalDistance: driver.totalDistance,
                    averageSpeed: driver.averageSpeed,
                    lastCalculatedAt: new Date()
                });
                return this.scoreRepo.save(score);
            }
            // Calculate metrics from recent assignments
            const totalDeliveries = recentAssignments.length;
            const onTimeDeliveries = recentAssignments.filter(a => a.actualTimeMinutes !== null &&
                a.estimatedTimeMinutes !== null &&
                a.actualTimeMinutes <= a.estimatedTimeMinutes * 1.2 // Allow 20% buffer
            ).length;
            const onTimeDeliveryRate = (onTimeDeliveries / totalDeliveries) * 100;
            // For simplicity, we'll assume acceptance rate based on assignments vs refusals
            // In reality, you'd track refused assignments
            const acceptanceRate = 95; // Placeholder
            // Cancellation rate from assignments
            const cancelledAssignments = await this.assignmentRepo.count({
                where: {
                    driver: { id: driverId },
                    status: 'failed' // Assuming 'failed' means cancelled
                }
            });
            const totalAssignments = await this.assignmentRepo.count({
                where: { driver: { id: driverId } }
            });
            const cancellationRate = totalAssignments > 0
                ? (cancelledAssignments / totalAssignments) * 100
                : 0;
            // Average customer rating would come from order ratings in a real system
            const customerRating = driver.rating || 0;
            // Calculate overall score (weighted average)
            const overallScore = (onTimeDeliveryRate / 100) * 0.3 +
                (acceptanceRate / 100) * 0.2 +
                (1 - cancellationRate / 100) * 0.2 + // Invert cancellation rate
                (customerRating / 5) * 0.3; // Normalize rating to 0-1
            // Update or create driver score
            let score = await this.scoreRepo.findOne({ where: { driver: { id: driverId } } });
            if (!score) {
                score = this.scoreRepo.create({ driver });
            }
            score.overallScore = overallScore * 5; // Convert to 0-5 scale
            score.onTimeDeliveryRate = onTimeDeliveryRate;
            score.acceptanceRate = acceptanceRate;
            score.cancellationRate = cancellationRate;
            score.customerRating = customerRating;
            score.totalDeliveries = driver.totalDeliveries;
            score.totalDistance = driver.totalDistance;
            score.averageSpeed = driver.averageSpeed;
            score.lastCalculatedAt = new Date();
            return this.scoreRepo.save(score);
        }
        /**
         * Record delivery SLA metrics
         */
        async recordDeliverySLA(driverId, branchId, metricName, value, unit, targetValue, targetUnit, measurementPeriod = 'per_delivery') {
            const [driver, branch] = await Promise.all([
                this.driverRepo.findOne({ where: { id: driverId } }),
                this.branchRepo.findOne({ where: { id: branchId } })
            ]);
            if (!driver || !branch) {
                throw new Error('Driver or branch not found');
            }
            const sla = this.slaRepo.create({
                driver,
                branch,
                metricName,
                value,
                unit,
                targetValue,
                targetUnit,
                measurementPeriod,
                measuredAt: new Date()
            });
            return this.slaRepo.save(sla);
        }
        /**
         * Record potential fraud incident
         */
        async recordFraudIncident(driverId, orderId, branchId, fraudType, evidence, severity) {
            const [driver, order, branch] = await Promise.all([
                this.driverRepo.findOne({ where: { id: driverId } }),
                this.orderRepo.findOne({ where: { id: orderId } }),
                this.branchRepo.findOne({ where: { id: branchId } })
            ]);
            if (!driver || !order || !branch) {
                throw new Error('Driver, order, or branch not found');
            }
            const fraud = this.fraudRepo.create({
                driver,
                order,
                branch,
                fraudType,
                evidence,
                severity,
                isResolved: false
            });
            // Update driver fraud score based on incident
            await this.updateDriverFraudScore(driverId, fraudType, severity);
            return this.fraudRepo.save(fraud);
        }
        /**
         * Update driver's fraud risk score based on incident
         */
        async updateDriverFraudScore(driverId, fraudType, severity) {
            const driver = await this.driverRepo.findOne({ where: { id: driverId } });
            if (!driver) {
                return;
            }
            // Increase fraud score based on severity
            let scoreIncrease = 0;
            switch (severity) {
                case 'low':
                    scoreIncrease = 5;
                    break;
                case 'medium':
                    scoreIncrease = 15;
                    break;
                case 'high':
                    scoreIncrease = 30;
                    break;
            }
            // Adjust based on fraud type (some are more serious)
            let typeMultiplier = 1;
            switch (fraudType) {
                case 'fake_delivery':
                case 'gps_spoofing':
                    typeMultiplier = 1.5; // More serious
                    break;
                case 'route_deviation':
                    typeMultiplier = 1.2;
                    break;
                case 'late_delivery_abuse':
                    typeMultiplier = 1.0;
                    break;
                default:
                    typeMultiplier = 1.0;
            }
            const newFraudScore = Math.min(100, driver.fraudScore + (scoreIncrease * typeMultiplier));
            const isFraudSuspicious = newFraudScore >= 70; // Consider suspicious if score >= 70
            await this.driverRepo.update(driverId, {
                fraudScore: newFraudScore,
                isFraudSuspicious,
                lastFraudCheck: new Date()
            });
        }
        /**
         * Get driver's fraud history
         */
        async getDriverFraudHistory(driverId) {
            return this.fraudRepo.find({
                where: { driver: { id: driverId } },
                order: { createdAt: 'DESC' }
            });
        }
        /**
         * Get delivery SLA metrics for a driver or branch
         */
        async getDeliverySLAMetrics(driverId, branchId, metricName, limit = 100) {
            const where = {};
            if (driverId) {
                where.driver = { id: driverId };
            }
            if (branchId) {
                where.branch = { id: branchId };
            }
            if (metricName) {
                where.metricName = metricName;
            }
            return this.slaRepo.find({
                where,
                order: { measuredAt: 'DESC' },
                take: limit
            });
        }
    };
    return DriverAssignmentService = _classThis;
})();
exports.DriverAssignmentService = DriverAssignmentService;
