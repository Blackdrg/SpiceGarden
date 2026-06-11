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
exports.DispatchEngineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const driver_entity_1 = require("../../db/entities/driver.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const order_interface_1 = require("../../shared/domain/order.interface");
let DispatchEngineService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DispatchEngineService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DispatchEngineService = _classThis = _classDescriptor.value;
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
        constructor(driverRepo, orderRepo, assignmentRepo, branchRepo, scoreRepo, slaRepo, fraudRepo, dataSource) {
            this.driverRepo = driverRepo;
            this.orderRepo = orderRepo;
            this.assignmentRepo = assignmentRepo;
            this.branchRepo = branchRepo;
            this.scoreRepo = scoreRepo;
            this.slaRepo = slaRepo;
            this.fraudRepo = fraudRepo;
            this.dataSource = dataSource;
        }
        /**
         * Core dispatch logic - assigns drivers to orders based on multiple factors
         */
        async dispatchOrder(orderId) {
            // Start transaction for consistency
            return this.dataSource.transaction(async (manager) => {
                // 1. Get the order details
                const order = await manager.findOne(order_entity_1.OrderEntity, {
                    where: { id: orderId },
                    relations: ['restaurantId'] // Assuming we have restaurant relation
                });
                if (!order) {
                    throw new Error('Order not found');
                }
                // 2. Get restaurant branch (simplified - in reality you'd get branch from restaurant)
                const branch = await manager.findOne(restaurant_branch_entity_1.RestaurantBranchEntity, {
                    where: { restaurant: { id: order.restaurantId } } // Adjust based on your entity relations
                });
                if (!branch) {
                    throw new Error('Restaurant branch not found');
                }
                // 3. Find available drivers based on multiple criteria
                const availableDrivers = await this.findOptimalDrivers(order, branch, manager);
                if (!availableDrivers || availableDrivers.length === 0) {
                    throw new Error('No available drivers found');
                }
                // 4. Select best driver based on scoring algorithm
                const bestDriver = this.selectBestDriver(availableDrivers, order, branch);
                // 5. Create assignment
                const assignment = await this.createAssignment(bestDriver, order, branch, 'single', // assignment type
                manager);
                // 6. Update order with driver assignment
                await manager.update(order_entity_1.OrderEntity, orderId, {
                    driverId: bestDriver.id,
                    status: order_interface_1.OrderStatus.DRIVER_ASSIGNED
                });
                return assignment;
            });
        }
        /**
         * Find drivers that meet basic availability and qualification criteria
         */
        async findOptimalDrivers(order, branch, manager) {
            // For now, we'll use a simple proximity-based search
            // In reality, you'd want to get the restaurant location from branch
            // This is a simplified version - you'd need to enhance based on your actual data model
            // Get drivers who are online and approved
            const drivers = await manager.find(driver_entity_1.DriverEntity, {
                where: {
                    isOnline: true,
                    kycStatus: 'approved',
                    isFraudSuspicious: false
                }
            });
            // Filter by distance and other factors would go here
            // For now, return all available drivers (in production, you'd filter by proximity)
            return drivers;
        }
        /**
         * Select the best driver based on multiple scoring factors
         */
        selectBestDriver(drivers, order, branch) {
            // Simple scoring algorithm - in reality this would be much more sophisticated
            return drivers.reduce((best, current) => {
                const bestScore = this.calculateDriverScore(best, order, branch);
                const currentScore = this.calculateDriverScore(current, order, branch);
                return currentScore > bestScore ? current : best;
            }, drivers[0]);
        }
        /**
         * Calculate a driver's suitability score for an order
         */
        calculateDriverScore(driver, order, branch) {
            let score = 0;
            // Factor 1: Driver rating (0-5 scale, normalized to 0-1)
            score += (driver.rating / 5) * 0.3;
            // Factor 2: Fraud risk (inverted - lower risk is better)
            score += ((100 - driver.fraudScore) / 100) * 0.2;
            // Factor 3: Experience (based on total deliveries, normalized)
            const experienceScore = Math.min(driver.totalDeliveries / 1000, 1); // Cap at 1000 deliveries
            score += experienceScore * 0.2;
            // Factor 4: Average speed (prefer reasonable speeds - not too slow or too fast)
            const speedScore = 1 - Math.abs(driver.averageSpeed - 30) / 50; // Ideal around 30 km/h
            score += Math.max(0, speedScore) * 0.15;
            // Factor 5: Distance from restaurant (would need actual location data)
            // For now, we'll add a placeholder - in reality you'd calculate actual distance
            score += 0.15; // Placeholder for proximity score
            return score;
        }
        /**
         * Create a driver assignment record
         */
        async createAssignment(driver, order, branch, assignmentType, manager) {
            // In a real implementation, you would:
            // 1. Calculate actual distance between restaurant and delivery location
            // 2. Estimate time based on distance, traffic, etc.
            // 3. Get actual route data from GPS/mapping service
            const assignment = manager.create(driver_assignment_entity_1.DriverAssignmentEntity, {
                driver,
                order,
                branch,
                assignmentType,
                status: 'assigned',
                distance: 5.0, // Placeholder - would be calculated
                estimatedTimeMinutes: 30, // Placeholder - would be calculated
                isPriority: false,
                retryCount: 0
            });
            return manager.save(driver_assignment_entity_1.DriverAssignmentEntity, assignment);
        }
        /**
         * Handle batch delivery assignments (multiple orders to one driver)
         */
        async assignBatchDelivery(orderIds, driverId) {
            return this.dataSource.transaction(async (manager) => {
                const driver = await manager.findOne(driver_entity_1.DriverEntity, { where: { id: driverId } });
                if (!driver) {
                    throw new Error('Driver not found');
                }
                const orders = await manager.find(order_entity_1.OrderEntity, {
                    where: { id: (0, typeorm_1.In)(orderIds) }
                });
                if (orders.length !== orderIds.length) {
                    throw new Error('Some orders not found');
                }
                // Get branch from first order (assuming all orders are from same restaurant)
                const branch = await manager.findOne(restaurant_branch_entity_1.RestaurantBranchEntity, {
                    where: { restaurant: { id: orders[0].restaurantId } }
                });
                const assignments = [];
                for (const order of orders) {
                    const assignment = manager.create(driver_assignment_entity_1.DriverAssignmentEntity, {
                        driver,
                        order,
                        branch,
                        assignmentType: 'batch',
                        batchId: `batch_${Date.now()}`, // Simple batch ID generation
                        status: 'assigned',
                        distance: 5.0, // Placeholder
                        estimatedTimeMinutes: 30, // Placeholder
                        isPriority: false,
                        retryCount: 0
                    });
                    assignments.push(await manager.save(driver_assignment_entity_1.DriverAssignmentEntity, assignment));
                    // Update order
                    await manager.update(order_entity_1.OrderEntity, order.id, {
                        driverId: driver.id,
                        status: order_interface_1.OrderStatus.DRIVER_ASSIGNED
                    });
                }
                return assignments;
            });
        }
        /**
         * Handle order reassignment (when driver fails to pickup or complete)
         */
        async reassignOrder(assignmentId, newDriverId, reason) {
            return this.dataSource.transaction(async (manager) => {
                // Get current assignment
                const currentAssignment = await manager.findOne(driver_assignment_entity_1.DriverAssignmentEntity, {
                    where: { id: assignmentId },
                    relations: ['driver', 'order', 'branch']
                });
                if (!currentAssignment) {
                    throw new Error('Assignment not found');
                }
                // Get new driver
                const newDriver = await manager.findOne(driver_entity_1.DriverEntity, { where: { id: newDriverId } });
                if (!newDriver) {
                    throw new Error('New driver not found');
                }
                // Update current assignment as reassigned
                currentAssignment.status = 'reassigned';
                currentAssignment.reassignedFrom = currentAssignment.driver.id;
                currentAssignment.retryCount += 1;
                await manager.save(driver_assignment_entity_1.DriverAssignmentEntity, currentAssignment);
                // Create new assignment
                const newAssignment = manager.create(driver_assignment_entity_1.DriverAssignmentEntity, {
                    driver: newDriver,
                    order: currentAssignment.order,
                    branch: currentAssignment.branch,
                    assignmentType: currentAssignment.assignmentType,
                    batchId: currentAssignment.batchId,
                    status: 'assigned',
                    distance: currentAssignment.distance,
                    estimatedTimeMinutes: currentAssignment.estimatedTimeMinutes,
                    isPriority: currentAssignment.isPriority,
                    reassignedFrom: currentAssignment.driver.id,
                    retryCount: 0
                });
                const savedAssignment = await manager.save(driver_assignment_entity_1.DriverAssignmentEntity, newAssignment);
                // Update order with new driver
                await manager.update(order_entity_1.OrderEntity, currentAssignment.order.id, {
                    driverId: newDriver.id
                });
                return savedAssignment;
            });
        }
    };
    return DispatchEngineService = _classThis;
})();
exports.DispatchEngineService = DispatchEngineService;
