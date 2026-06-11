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
exports.KitchenService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let KitchenService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var KitchenService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            KitchenService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        inventoryRepo;
        recipeRepo;
        batchRepo;
        foodPrepRepo;
        slaRepo;
        supplierRepo;
        branchRepo;
        inventoryAlertRepo;
        slaAlertRepo;
        menuItemAvailabilityRepo;
        orderRepo;
        orderItemRepo;
        dataSource;
        logger = new common_1.Logger(KitchenService.name);
        constructor(inventoryRepo, recipeRepo, batchRepo, foodPrepRepo, slaRepo, supplierRepo, branchRepo, inventoryAlertRepo, slaAlertRepo, menuItemAvailabilityRepo, orderRepo, orderItemRepo, dataSource) {
            this.inventoryRepo = inventoryRepo;
            this.recipeRepo = recipeRepo;
            this.batchRepo = batchRepo;
            this.foodPrepRepo = foodPrepRepo;
            this.slaRepo = slaRepo;
            this.supplierRepo = supplierRepo;
            this.branchRepo = branchRepo;
            this.inventoryAlertRepo = inventoryAlertRepo;
            this.slaAlertRepo = slaAlertRepo;
            this.menuItemAvailabilityRepo = menuItemAvailabilityRepo;
            this.orderRepo = orderRepo;
            this.orderItemRepo = orderItemRepo;
            this.dataSource = dataSource;
        }
        /**
         * Check inventory levels and create alerts if thresholds are breached
         */
        async checkAndCreateInventoryAlert(itemId) {
            try {
                const item = await this.inventoryRepo.findOne({
                    where: { id: itemId },
                    relations: ['branch']
                });
                if (!item)
                    return;
                // Check for out of stock
                if (item.currentStock === 0) {
                    await this.createInventoryAlert(item.id, 'out_of_stock', item.currentStock, item.lowStockThreshold);
                }
                // Check for low stock
                else if (item.currentStock <= item.lowStockThreshold) {
                    await this.createInventoryAlert(item.id, 'low_stock', item.currentStock, item.lowStockThreshold);
                }
                // Check if we should resolve existing alerts
                else {
                    await this.resolveInventoryAlerts(item.id, ['low_stock', 'out_of_stock']);
                }
            }
            catch (error) {
                this.logger.error(`Error checking inventory alerts for item ${itemId}`, error);
            }
        }
        /**
         * Create an inventory alert
         */
        async createInventoryAlert(itemId, alertType, currentLevel, thresholdLevel) {
            try {
                const item = await this.inventoryRepo.findOne({
                    where: { id: itemId },
                    relations: ['branch']
                });
                if (!item || !item.branch)
                    return;
                // Check if there's already an active alert of this type for this item
                const existingAlert = await this.inventoryAlertRepo.findOne({
                    where: {
                        inventoryItem: { id: itemId },
                        alertType,
                        isResolved: false
                    }
                });
                if (!existingAlert) {
                    const alert = this.inventoryAlertRepo.create({
                        inventoryItem: item,
                        branch: item.branch,
                        alertType,
                        currentLevel,
                        thresholdLevel
                    });
                    await this.inventoryAlertRepo.save(alert);
                    this.logger.log(`Created ${alertType} alert for item ${item.name}`);
                }
            }
            catch (error) {
                this.logger.error(`Error creating inventory alert`, error);
            }
        }
        /**
         * Resolve inventory alerts for an item
         */
        async resolveInventoryAlerts(itemId, alertTypes) {
            try {
                await this.inventoryAlertRepo.update({
                    inventoryItem: { id: itemId },
                    alertType: (0, typeorm_1.In)(alertTypes),
                    isResolved: false
                }, {
                    isResolved: true,
                    resolvedAt: new Date()
                });
            }
            catch (error) {
                this.logger.error(`Error resolving inventory alerts for item ${itemId}`, error);
            }
        }
        /**
         * Check and create wastage alerts based on wastage percentage
         */
        async checkAndCreateWastageAlert(itemId, wastedQuantity, reason) {
            try {
                const item = await this.inventoryRepo.findOne({
                    where: { id: itemId },
                    relations: ['branch']
                });
                if (!item)
                    return;
                // Calculate wastage percentage (wastage / total used + wastage)
                // For simplicity, we'll use wastage vs current stock + wastage as proxy for total usage
                const totalUsage = item.currentStock + item.wastage;
                const wastagePercentage = totalUsage > 0 ? (item.wastage / totalUsage) * 100 : 0;
                // Create alert if wastage is high (e.g., > 10%)
                if (wastagePercentage > 10) {
                    // Check if there's already an active wastage alert for this item
                    const existingAlert = await this.inventoryAlertRepo.findOne({
                        where: {
                            inventoryItem: { id: itemId },
                            alertType: 'wastage_high',
                            isResolved: false
                        }
                    });
                    if (!existingAlert) {
                        const alert = this.inventoryAlertRepo.create({
                            inventoryItem: item,
                            branch: item.branch,
                            alertType: 'wastage_high',
                            currentLevel: wastagePercentage,
                            thresholdLevel: 10 // 10% threshold
                        });
                        await this.inventoryAlertRepo.save(alert);
                        this.logger.log(`Created wastage alert for item ${item.name}: ${wastagePercentage.toFixed(1)}% wastage`);
                    }
                }
                else {
                    // Resolve unknown existing wastage alerts if wastage is now acceptable
                    await this.resolveInventoryAlerts(itemId, ['wastage_high']);
                }
            }
            catch (error) {
                this.logger.error(`Error checking wastage alerts for item ${itemId}`, error);
            }
        }
        async createInventoryItem(data) {
            const item = this.inventoryRepo.create(data);
            const savedItem = await this.inventoryRepo.save(item);
            // Check if this creates a low stock situation
            await this.checkAndCreateInventoryAlert(savedItem.id);
            return savedItem;
        }
        async updateInventoryStock(itemId, quantityChange) {
            const item = await this.inventoryRepo.findOne({ where: { id: itemId } });
            if (!item) {
                throw new Error('Inventory item not found');
            }
            item.currentStock = Math.max(0, item.currentStock + quantityChange);
            if (item.unitCost !== null && item.unitCost !== undefined) {
                item.totalCost = item.currentStock * item.unitCost;
            }
            const savedItem = await this.inventoryRepo.save(item);
            // Check for stock alerts after update
            await this.checkAndCreateInventoryAlert(itemId);
            return savedItem;
        }
        async recordWastage(itemId, wastedQuantity, reason) {
            const item = await this.inventoryRepo.findOne({ where: { id: itemId } });
            if (!item) {
                throw new Error('Inventory item not found');
            }
            item.wastage = (item.wastage || 0) + wastedQuantity;
            if (item.unitCost !== null && item.unitCost !== undefined) {
                item.wastageCost = (item.wastageCost || 0) + (wastedQuantity * item.unitCost);
            }
            item.currentStock = Math.max(0, item.currentStock - wastedQuantity);
            if (item.unitCost !== null && item.unitCost !== undefined) {
                item.totalCost = item.currentStock * item.unitCost;
            }
            const savedItem = await this.inventoryRepo.save(item);
            // Check for wastage alerts
            await this.checkAndCreateWastageAlert(itemId, wastedQuantity, reason);
            // Check for stock alerts after wastage
            await this.checkAndCreateInventoryAlert(itemId);
            return savedItem;
        }
        async getLowStockItems(branchId) {
            return this.inventoryRepo.find({
                where: {
                    branch: { id: branchId }
                }
            }).then(items => items.filter(item => item.currentStock < item.lowStockThreshold));
        }
        async checkAndNotifyLowStock(branchId) {
            const lowStockItems = await this.getLowStockItems(branchId);
            const notificationsSent = lowStockItems.length;
            return {
                lowStockItems,
                notificationsSent
            };
        }
        async createRecipe(data) {
            const recipe = this.recipeRepo.create(data);
            return this.recipeRepo.save(recipe);
        }
        async getRecipeById(id) {
            return this.recipeRepo.findOne({ where: { id }, relations: ['branch'] });
        }
        async createBatch(data) {
            const batch = this.batchRepo.create(data);
            return this.batchRepo.save(batch);
        }
        async updateBatchStatus(batchId, status) {
            const batch = await this.batchRepo.findOne({ where: { id: batchId } });
            if (!batch) {
                throw new Error('Batch not found');
            }
            batch.status = status;
            if (status === 'ready' || status === 'used' || status === 'discarded') {
                batch.completedAt = new Date();
            }
            const savedBatch = await this.batchRepo.save(batch);
            // If batch is completed, calculate actual time and check for delays
            if ((status === 'ready' || status === 'used' || status === 'discarded') && batch.startedAt) {
                await this.calculateAndRecordBatchTiming(batchId);
            }
            return savedBatch;
        }
        async logFoodPrep(data) {
            const foodPrep = this.foodPrepRepo.create(data);
            const savedFoodPrep = await this.foodPrepRepo.save(foodPrep);
            // If this is a completion, calculate actual time and check for delays
            if (data.status === 'completed' && data.startedAt) {
                await this.calculateAndRecordFoodPrepTiming(savedFoodPrep.id);
            }
            return savedFoodPrep;
        }
        async updateFoodPrepQuality(prepId, qualityData) {
            const foodPrep = await this.foodPrepRepo.findOne({ where: { id: prepId } });
            if (!foodPrep) {
                throw new Error('Food prep record not found');
            }
            foodPrep.qualityCheck = {
                ...(foodPrep.qualityCheck || { taste: 0, temperature: 0, appearance: 0, passed: false }),
                ...qualityData
            };
            const savedFoodPrep = await this.foodPrepRepo.save(foodPrep);
            // If this is a completion with quality data, calculate timing
            if (foodPrep.status === 'completed' && foodPrep.startedAt && !foodPrep.actualPrepTimeMinutes) {
                await this.calculateAndRecordFoodPrepTiming(prepId);
            }
            return savedFoodPrep;
        }
        /**
         * Calculate and record actual prep time and delays for food preparation
         */
        async calculateAndRecordFoodPrepTiming(prepId) {
            try {
                const foodPrep = await this.foodPrepRepo.findOne({
                    where: { id: prepId },
                    relations: ['batch', 'batch.recipe', 'branch']
                });
                if (!foodPrep || !foodPrep.startedAt)
                    return;
                // Calculate actual prep time
                const completedAt = foodPrep.completedAt || new Date();
                const actualTimeMs = completedAt.getTime() - foodPrep.startedAt.getTime();
                const actualTimeMinutes = Math.max(0, actualTimeMs / 60000);
                // Get estimated time from recipe or historical data
                let estimatedTimeMinutes = 30; // Default
                if (foodPrep.batch?.recipe?.prepTimeMinutes) {
                    estimatedTimeMinutes = foodPrep.batch.recipe.prepTimeMinutes;
                }
                else if (foodPrep.batch?.recipe?.cookTimeMinutes) {
                    estimatedTimeMinutes = foodPrep.batch.recipe.cookTimeMinutes;
                }
                // Calculate delay
                const delayMinutes = actualTimeMinutes - estimatedTimeMinutes;
                // Determine delay reasons (simplified - in reality this would be more sophisticated)
                const delayReasons = [];
                if (delayMinutes > 10) {
                    delayReasons.push('Preparation took longer than expected');
                }
                if (delayMinutes < -5) {
                    delayReasons.push('Prepared faster than expected');
                }
                // Update the food prep record
                foodPrep.actualPrepTimeMinutes = actualTimeMinutes;
                foodPrep.estimatedPrepTimeMinutes = estimatedTimeMinutes;
                foodPrep.delayMinutes = delayMinutes;
                foodPrep.delayReasons = delayReasons;
                await this.foodPrepRepo.save(foodPrep);
                // Record SLA for prep time
                await this.recordPrepTimeSLA(foodPrep.branch.id, actualTimeMinutes, estimatedTimeMinutes);
                this.logger.log(`Calculated timing for food prep ${prepId}: ${actualTimeMinutes.toFixed(1)}m actual vs ${estimatedTimeMinutes.toFixed(1)}m estimated`);
            }
            catch (error) {
                this.logger.error(`Error calculating food prep timing for ${prepId}`, error);
            }
        }
        async calculateAndRecordBatchTiming(batchId) {
            try {
                const batch = await this.batchRepo.findOne({
                    where: { id: batchId },
                    relations: ['recipe', 'branch']
                });
                if (!batch || !batch.startedAt)
                    return;
                // Calculate actual prep time
                const completedAt = batch.completedAt || new Date();
                const actualTimeMs = completedAt.getTime() - batch.startedAt.getTime();
                const actualTimeMinutes = Math.max(0, actualTimeMs / 60000);
                // Get estimated time from batch entity
                let estimatedTimeMinutes = batch.estimatedPrepTimeMinutes ?? 0;
                if (!estimatedTimeMinutes && batch.recipe?.prepTimeMinutes) {
                    estimatedTimeMinutes = batch.recipe.prepTimeMinutes;
                }
                else if (!estimatedTimeMinutes && batch.recipe?.cookTimeMinutes) {
                    estimatedTimeMinutes = batch.recipe.cookTimeMinutes;
                }
                // Calculate delay
                const delayMinutes = actualTimeMinutes - estimatedTimeMinutes;
                // Determine delay reasons (simplified)
                const delayReasons = [];
                if (delayMinutes > 10) {
                    delayReasons.push('Batch preparation took longer than expected');
                }
                if (delayMinutes < -5) {
                    delayReasons.push('Batch prepared faster than expected');
                }
                // Update the batch record
                batch.actualPrepTimeMinutes = actualTimeMinutes;
                batch.delayMinutes = delayMinutes;
                batch.delayReasons = delayReasons;
                await this.batchRepo.save(batch);
                // TODO: Consider recording SLA for batch timing if needed
                this.logger.log(`Calculated timing for batch ${batchId}: ${actualTimeMinutes.toFixed(1)}m actual vs ${estimatedTimeMinutes.toFixed(1)}m estimated`);
            }
            catch (error) {
                this.logger.error(`Error calculating batch timing for ${batchId}`, error);
            }
        }
        /**
        * Record prep time SLA metrics and check for breaches
        */
        async recordPrepTimeSLA(branchId, actualTime, targetTime) {
            try {
                const branch = await this.branchRepo.findOne({ where: { id: branchId } });
                if (!branch)
                    return;
                const isBreached = actualTime > targetTime;
                const breachSeverity = isBreached
                    ? (actualTime > targetTime * 1.5 ? 'high' : actualTime > targetTime * 1.2 ? 'medium' : 'low')
                    : null;
                // Check if there's already an recent SLA alert for this branch and metric
                const recentAlert = await this.slaAlertRepo.findOne({
                    where: {
                        branch: { id: branchId },
                        slaType: 'prep_time',
                        createdAt: (0, typeorm_1.MoreThan)(new Date(Date.now() - 60 * 60 * 1000)) // Last hour
                    },
                    order: { createdAt: 'DESC' }
                });
                // Only create alert if breached and no recent alert for same issue
                if (isBreached && !recentAlert) {
                    const alert = this.slaAlertRepo.create({
                        branch,
                        slaType: 'prep_time',
                        targetValue: targetTime,
                        actualValue: actualTime,
                        isBreached: true,
                        breachSeverity: breachSeverity
                    });
                    await this.slaAlertRepo.save(alert);
                    this.logger.log(`Created prep time SLA alert for branch ${branchId}: ${actualTime.toFixed(1)}m vs ${targetTime.toFixed(1)}m target`);
                }
                else if (!isBreached && recentAlert) {
                    // Resolve previous alert if now within SLA
                    await this.slaAlertRepo.update({ id: recentAlert.id }, { isBreached: false, isNotified: true });
                }
            }
            catch (error) {
                this.logger.error(`Error recording prep time SLA for branch ${branchId}`, error);
            }
        }
        async recordKitchenSLA(data) {
            const sla = this.slaRepo.create(data);
            return this.slaRepo.save(sla);
        }
        async recordAvgPrepTime(branchId, prepTimeMinutes, period = 'hourly') {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            return this.recordKitchenSLA({
                branch,
                metricName: 'avg_prep_time',
                value: prepTimeMinutes,
                unit: 'minutes',
                targetValue: 30,
                targetUnit: 'minutes',
                measurementPeriod: period,
                measuredAt: new Date()
            });
        }
        async recordLatePrepPercentage(branchId, latePercentage, period = 'hourly') {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            return this.recordKitchenSLA({
                branch,
                metricName: 'late_prep_percentage',
                value: latePercentage,
                unit: 'percentage',
                targetValue: 5,
                targetUnit: 'percentage',
                measurementPeriod: period,
                measuredAt: new Date()
            });
        }
        async recordFoodRejectionRate(branchId, rejectionRate, period = 'hourly') {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            return this.recordKitchenSLA({
                branch,
                metricName: 'food_rejection_rate',
                value: rejectionRate,
                unit: 'percentage',
                targetValue: 2,
                targetUnit: 'percentage',
                measurementPeriod: period,
                measuredAt: new Date()
            });
        }
        /**
         * Automatically calculate and record food rejection rate based on actual food prep data
         */
        async calculateAndRecordFoodRejectionRate(branchId, period = 'hourly') {
            try {
                const branch = await this.branchRepo.findOne({ where: { id: branchId } });
                if (!branch)
                    throw new Error(`Branch not found: ${branchId}`);
                // Determine time period for calculation
                const now = new Date();
                let startDate;
                switch (period) {
                    case 'hourly':
                        startDate = new Date(now.getTime() - 60 * 60 * 1000); // Last hour
                        break;
                    case 'daily':
                        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last day
                        break;
                    case 'weekly':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last week
                        break;
                    default:
                        startDate = new Date(now.getTime() - 60 * 60 * 1000); // Default to hourly
                }
                // Get completed food prep records for the branch in the time period
                const foodPrepRecords = await this.foodPrepRepo.find({
                    where: {
                        branch: { id: branchId },
                        status: (0, typeorm_1.In)(['completed', 'failed']),
                        completedAt: (0, typeorm_1.Between)(startDate, now)
                    }
                });
                if (foodPrepRecords.length === 0) {
                    // No data to calculate rejection rate, record 0 or skip?
                    // For now, record 0% rejection rate
                    return this.recordKitchenSLA({
                        branch,
                        metricName: 'food_rejection_rate',
                        value: 0,
                        unit: 'percentage',
                        targetValue: 2,
                        targetUnit: 'percentage',
                        measurementPeriod: period,
                        measuredAt: now
                    });
                }
                // Calculate rejection rate: (failed preparations / total preparations) * 100
                const failedCount = foodPrepRecords.filter(record => record.status === 'failed').length;
                const totalCount = foodPrepRecords.length;
                const rejectionRate = (totalCount > 0) ? (failedCount / totalCount) * 100 : 0;
                // Record the SLA
                return this.recordKitchenSLA({
                    branch,
                    metricName: 'food_rejection_rate',
                    value: rejectionRate,
                    unit: 'percentage',
                    targetValue: 2,
                    targetUnit: 'percentage',
                    measurementPeriod: period,
                    measuredAt: now
                });
            }
            catch (error) {
                this.logger.error(`Error calculating food rejection rate for branch ${branchId}`, error);
                throw error;
            }
        }
        async recordKitchenThroughput(branchId, ordersPerHour, period = 'hourly') {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            return this.recordKitchenSLA({
                branch,
                metricName: 'kitchen_throughput',
                value: ordersPerHour,
                unit: 'orders_per_hour',
                targetValue: 50,
                targetUnit: 'orders_per_hour',
                measurementPeriod: period,
                measuredAt: new Date()
            });
        }
        /**
         * Automatically calculate and record kitchen throughput based on actual order data
         */
        async calculateAndRecordKitchenThroughput(branchId, period = 'hourly') {
            try {
                const branch = await this.branchRepo.findOne({ where: { id: branchId } });
                if (!branch)
                    throw new Error(`Branch not found: ${branchId}`);
                // Determine time period for calculation
                const now = new Date();
                let startDate;
                switch (period) {
                    case 'hourly':
                        startDate = new Date(now.getTime() - 60 * 60 * 1000); // Last hour
                        break;
                    case 'daily':
                        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last day
                        break;
                    case 'weekly':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last week
                        break;
                    default:
                        startDate = new Date(now.getTime() - 60 * 60 * 1000); // Default to hourly
                }
                // Get completed orders for the branch in the time period
                const completedOrders = await this.orderRepo.count({
                    where: {
                        restaurantId: branch.id, // Assuming restaurantId maps to branch - may need adjustment
                        status: (0, typeorm_1.In)(['delivered', 'completed']), // Completed orders
                        updatedAt: (0, typeorm_1.Between)(startDate, now)
                    }
                });
                // Calculate orders per hour
                const hoursInPeriod = {
                    hourly: 1,
                    daily: 24,
                    weekly: 24 * 7
                }[period];
                const ordersPerHour = completedOrders / hoursInPeriod;
                // Record the SLA
                return this.recordKitchenSLA({
                    branch,
                    metricName: 'kitchen_throughput',
                    value: ordersPerHour,
                    unit: 'orders_per_hour',
                    targetValue: 50,
                    targetUnit: 'orders_per_hour',
                    measurementPeriod: period,
                    measuredAt: now
                });
            }
            catch (error) {
                this.logger.error(`Error calculating kitchen throughput for branch ${branchId}`, error);
                throw error;
            }
        }
        /**
         * Automatically calculate and record average prep time based on actual food prep data
         */
        async calculateAndRecordAvgPrepTime(branchId, period = 'hourly') {
            try {
                const branch = await this.branchRepo.findOne({ where: { id: branchId } });
                if (!branch)
                    throw new Error(`Branch not found: ${branchId}`);
                // Determine time period for calculation
                const now = new Date();
                let startDate;
                switch (period) {
                    case 'hourly':
                        startDate = new Date(now.getTime() - 60 * 60 * 1000); // Last hour
                        break;
                    case 'daily':
                        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last day
                        break;
                    case 'weekly':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last week
                        break;
                    default:
                        startDate = new Date(now.getTime() - 60 * 60 * 1000); // Default to hourly
                }
                // Get completed food prep records for the branch in the time period
                const foodPrepRecords = await this.foodPrepRepo.find({
                    where: {
                        branch: { id: branchId },
                        status: 'completed',
                        actualPrepTimeMinutes: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()),
                        completedAt: (0, typeorm_1.Between)(startDate, now)
                    }
                });
                if (foodPrepRecords.length === 0) {
                    // No data to calculate average prep time, record 0 or skip?
                    // For now, record 0 minutes average prep time
                    return this.recordKitchenSLA({
                        branch,
                        metricName: 'avg_prep_time',
                        value: 0,
                        unit: 'minutes',
                        targetValue: 30,
                        targetUnit: 'minutes',
                        measurementPeriod: period,
                        measuredAt: now
                    });
                }
                // Calculate average prep time
                const totalPrepTime = foodPrepRecords.reduce((sum, record) => sum + (record.actualPrepTimeMinutes || 0), 0);
                const avgPrepTime = totalPrepTime / foodPrepRecords.length;
                // Record the SLA
                return this.recordKitchenSLA({
                    branch,
                    metricName: 'avg_prep_time',
                    value: avgPrepTime,
                    unit: 'minutes',
                    targetValue: 30,
                    targetUnit: 'minutes',
                    measurementPeriod: period,
                    measuredAt: now
                });
            }
            catch (error) {
                this.logger.error(`Error calculating average prep time for branch ${branchId}`, error);
                throw error;
            }
        }
        /**
         * Record prep delay SLA metrics and check for breaches
         */
        async recordPrepDelaySLA(branchId, actualDelay, targetDelay) {
            try {
                const branch = await this.branchRepo.findOne({ where: { id: branchId } });
                if (!branch)
                    return;
                // For prep delay, we want to know if actual delay exceeds target delay (usually 0 or negative for early completion)
                const isBreached = actualDelay > targetDelay;
                const breachSeverity = isBreached
                    ? (actualDelay > targetDelay + 15 ? 'high' : actualDelay > targetDelay + 5 ? 'medium' : 'low')
                    : null;
                // Check if there's already an recent SLA alert for this branch and metric
                const recentAlert = await this.slaAlertRepo.findOne({
                    where: {
                        branch: { id: branchId },
                        slaType: 'prep_delay',
                        createdAt: (0, typeorm_1.MoreThan)(new Date(Date.now() - 60 * 60 * 1000)) // Last hour
                    },
                    order: { createdAt: 'DESC' }
                });
                // Only create alert if breached and no recent alert for same issue
                if (isBreached && !recentAlert) {
                    const alert = this.slaAlertRepo.create({
                        branch,
                        slaType: 'prep_delay',
                        targetValue: targetDelay,
                        actualValue: actualDelay,
                        isBreached: true,
                        breachSeverity: breachSeverity
                    });
                    await this.slaAlertRepo.save(alert);
                    this.logger.log(`Created prep delay SLA alert for branch ${branchId}: ${actualDelay.toFixed(1)}m delay vs ${targetDelay.toFixed(1)}m target`);
                }
                else if (!isBreached && recentAlert) {
                    // Resolve previous alert if now within SLA
                    await this.slaAlertRepo.update({ id: recentAlert.id }, { isBreached: false, isNotified: true });
                }
            }
            catch (error) {
                this.logger.error(`Error recording prep delay SLA for branch ${branchId}`, error);
            }
        }
        /**
         * Automatically record all kitchen SLA metrics based on actual data
         * This would typically be called by a cron job or scheduler
         */
        async recordAllKitchenSLAs(branchId) {
            try {
                this.logger.log(`Recording all kitchen SLAs for branch ${branchId}`);
                // Record all SLA metrics
                await Promise.all([
                    this.calculateAndRecordAvgPrepTime(branchId, 'hourly'),
                    this.calculateAndRecordFoodRejectionRate(branchId, 'hourly'),
                    this.calculateAndRecordKitchenThroughput(branchId, 'hourly')
                ]);
                this.logger.log(`Completed recording all kitchen SLAs for branch ${branchId}`);
            }
            catch (error) {
                this.logger.error(`Error recording all kitchen SLAs for branch ${branchId}`, error);
                throw error;
            }
        }
        async getKitchenSLABranch(branchId, metricName, limit = 100) {
            const where = { branch: { id: branchId } };
            if (metricName) {
                where.metricName = metricName;
            }
            return this.slaRepo.find({
                where,
                order: { measuredAt: 'DESC' },
                take: limit
            });
        }
        async getKitchenSLASummary(branchId, period = 'daily') {
            const metrics = await this.slaRepo.find({
                where: {
                    branch: { id: branchId },
                    measurementPeriod: period
                },
                order: { measuredAt: 'DESC' }
            });
            const summary = {};
            for (const metric of metrics) {
                if (!summary[metric.metricName] || new Date(metric.measuredAt) > new Date(summary[metric.metricName].measuredAt)) {
                    summary[metric.metricName] = {
                        value: metric.value,
                        unit: metric.unit,
                        targetValue: metric.targetValue,
                        targetUnit: metric.targetUnit,
                        measuredAt: metric.measuredAt
                    };
                }
            }
            return summary;
        }
        async createSupplier(data) {
            const supplier = this.supplierRepo.create(data);
            return this.supplierRepo.save(supplier);
        }
        async getSupplierInventory(supplierId) {
            return this.inventoryRepo.find({ where: { supplier: { id: supplierId } } });
        }
        async getInventoryConsumption(branchId, days = 7) {
            return {
                branchId,
                periodDays: days,
                consumptionData: [
                    { itemId: 'sample-item-1', itemName: 'Sample Ingredient', consumed: 10.5, unit: 'kg', cost: 52.50 }
                ],
                totalConsumptionCost: 52.50,
                generatedAt: new Date()
            };
        }
        async forecastInventoryNeeds(branchId, daysAhead = 7) {
            const consumption = await this.getInventoryConsumption(branchId, daysAhead * 2);
            return {
                branchId,
                forecastDays: daysAhead,
                predictions: consumption.consumptionData.map(item => ({
                    itemId: item.itemId,
                    itemName: item.itemName,
                    predictedConsumption: item.consumed * (daysAhead / consumption.periodDays) * 1.2,
                    unit: item.unit,
                    recommendedOrderQuantity: Math.ceil(item.consumed * (daysAhead / consumption.periodDays) * 1.2)
                })),
                generatedAt: new Date()
            };
        }
        async getKitchenAnalytics(branchId) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const [totalOrders, avgPrepTime, rejectionRate, throughput] = await Promise.all([
                this.slaRepo.count({
                    where: {
                        branch: { id: branchId },
                        metricName: 'kitchen_throughput'
                    }
                }),
                this.slaRepo.findOne({
                    where: {
                        branch: { id: branchId },
                        metricName: 'avg_prep_time',
                        measuredAt: (0, typeorm_1.MoreThan)(thirtyDaysAgo)
                    },
                    order: { measuredAt: 'DESC' }
                }),
                this.slaRepo.findOne({
                    where: {
                        branch: { id: branchId },
                        metricName: 'food_rejection_rate',
                        measuredAt: (0, typeorm_1.MoreThan)(thirtyDaysAgo)
                    },
                    order: { measuredAt: 'DESC' }
                }),
                this.slaRepo.findOne({
                    where: {
                        branch: { id: branchId },
                        metricName: 'kitchen_throughput',
                        measuredAt: (0, typeorm_1.MoreThan)(thirtyDaysAgo)
                    },
                    order: { measuredAt: 'DESC' }
                })
            ]);
            return {
                branchId,
                period: '30 days',
                totalOrdersProcessed: totalOrders,
                avgPrepTimeMinutes: avgPrepTime?.value || 0,
                rejectionRate: rejectionRate?.value || 0,
                ordersPerHour: throughput?.value || 0,
                generatedAt: new Date()
            };
        }
    };
    return KitchenService = _classThis;
})();
exports.KitchenService = KitchenService;
