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
exports.KitchenController = void 0;
const common_1 = require("@nestjs/common");
let KitchenController = (() => {
    let _classDecorators = [(0, common_1.Controller)('kitchen')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createInventoryItem_decorators;
    let _updateInventoryStock_decorators;
    let _recordWastage_decorators;
    let _getLowStockItems_decorators;
    let _checkAndNotifyLowStock_decorators;
    let _createRecipe_decorators;
    let _getRecipeById_decorators;
    let _createBatch_decorators;
    let _updateBatchStatus_decorators;
    let _logFoodPrep_decorators;
    let _updateFoodPrepQuality_decorators;
    let _recordKitchenSLA_decorators;
    let _recordAvgPrepTime_decorators;
    let _recordLatePrepPercentage_decorators;
    let _recordFoodRejectionRate_decorators;
    let _calculateFoodRejectionRate_decorators;
    let _recordKitchenThroughput_decorators;
    let _calculateKitchenThroughput_decorators;
    let _recordAllKitchenSLAs_decorators;
    let _getKitchenSLABranch_decorators;
    let _getKitchenSLASummary_decorators;
    let _createSupplier_decorators;
    let _getSupplierInventory_decorators;
    let _getInventoryConsumption_decorators;
    let _forecastInventoryNeeds_decorators;
    var KitchenController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _createInventoryItem_decorators = [(0, common_1.Post)('inventory')];
            _updateInventoryStock_decorators = [(0, common_1.Put)('inventory/:id/stock')];
            _recordWastage_decorators = [(0, common_1.Put)('inventory/:id/wastage')];
            _getLowStockItems_decorators = [(0, common_1.Get)('inventory/low-stock/:branchId')];
            _checkAndNotifyLowStock_decorators = [(0, common_1.Post)('inventory/low-stock/notify/:branchId')];
            _createRecipe_decorators = [(0, common_1.Post)('recipes')];
            _getRecipeById_decorators = [(0, common_1.Get)('recipes/:id')];
            _createBatch_decorators = [(0, common_1.Post)('batches')];
            _updateBatchStatus_decorators = [(0, common_1.Put)('batches/:id/status')];
            _logFoodPrep_decorators = [(0, common_1.Post)('food-prep')];
            _updateFoodPrepQuality_decorators = [(0, common_1.Put)('food-prep/:id/quality')];
            _recordKitchenSLA_decorators = [(0, common_1.Post)('sla')];
            _recordAvgPrepTime_decorators = [(0, common_1.Post)('sla/avg-prep-time/:branchId')];
            _recordLatePrepPercentage_decorators = [(0, common_1.Post)('sla/late-prep/:branchId')];
            _recordFoodRejectionRate_decorators = [(0, common_1.Post)('sla/food-rejection/:branchId')];
            _calculateFoodRejectionRate_decorators = [(0, common_1.Post)('sla/food-rejection/calculate/:branchId')];
            _recordKitchenThroughput_decorators = [(0, common_1.Post)('sla/throughput/:branchId')];
            _calculateKitchenThroughput_decorators = [(0, common_1.Post)('sla/throughput/calculate/:branchId')];
            _recordAllKitchenSLAs_decorators = [(0, common_1.Post)('sla/record-all/:branchId')];
            _getKitchenSLABranch_decorators = [(0, common_1.Get)('sla/branch/:branchId')];
            _getKitchenSLASummary_decorators = [(0, common_1.Get)('sla/summary/:branchId')];
            _createSupplier_decorators = [(0, common_1.Post)('suppliers')];
            _getSupplierInventory_decorators = [(0, common_1.Get)('suppliers/:id/inventory')];
            _getInventoryConsumption_decorators = [(0, common_1.Get)('inventory/consumption/:branchId')];
            _forecastInventoryNeeds_decorators = [(0, common_1.Get)('inventory/forecast/:branchId')];
            __esDecorate(this, null, _createInventoryItem_decorators, { kind: "method", name: "createInventoryItem", static: false, private: false, access: { has: obj => "createInventoryItem" in obj, get: obj => obj.createInventoryItem }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateInventoryStock_decorators, { kind: "method", name: "updateInventoryStock", static: false, private: false, access: { has: obj => "updateInventoryStock" in obj, get: obj => obj.updateInventoryStock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recordWastage_decorators, { kind: "method", name: "recordWastage", static: false, private: false, access: { has: obj => "recordWastage" in obj, get: obj => obj.recordWastage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getLowStockItems_decorators, { kind: "method", name: "getLowStockItems", static: false, private: false, access: { has: obj => "getLowStockItems" in obj, get: obj => obj.getLowStockItems }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkAndNotifyLowStock_decorators, { kind: "method", name: "checkAndNotifyLowStock", static: false, private: false, access: { has: obj => "checkAndNotifyLowStock" in obj, get: obj => obj.checkAndNotifyLowStock }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createRecipe_decorators, { kind: "method", name: "createRecipe", static: false, private: false, access: { has: obj => "createRecipe" in obj, get: obj => obj.createRecipe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getRecipeById_decorators, { kind: "method", name: "getRecipeById", static: false, private: false, access: { has: obj => "getRecipeById" in obj, get: obj => obj.getRecipeById }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createBatch_decorators, { kind: "method", name: "createBatch", static: false, private: false, access: { has: obj => "createBatch" in obj, get: obj => obj.createBatch }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateBatchStatus_decorators, { kind: "method", name: "updateBatchStatus", static: false, private: false, access: { has: obj => "updateBatchStatus" in obj, get: obj => obj.updateBatchStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _logFoodPrep_decorators, { kind: "method", name: "logFoodPrep", static: false, private: false, access: { has: obj => "logFoodPrep" in obj, get: obj => obj.logFoodPrep }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateFoodPrepQuality_decorators, { kind: "method", name: "updateFoodPrepQuality", static: false, private: false, access: { has: obj => "updateFoodPrepQuality" in obj, get: obj => obj.updateFoodPrepQuality }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recordKitchenSLA_decorators, { kind: "method", name: "recordKitchenSLA", static: false, private: false, access: { has: obj => "recordKitchenSLA" in obj, get: obj => obj.recordKitchenSLA }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recordAvgPrepTime_decorators, { kind: "method", name: "recordAvgPrepTime", static: false, private: false, access: { has: obj => "recordAvgPrepTime" in obj, get: obj => obj.recordAvgPrepTime }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recordLatePrepPercentage_decorators, { kind: "method", name: "recordLatePrepPercentage", static: false, private: false, access: { has: obj => "recordLatePrepPercentage" in obj, get: obj => obj.recordLatePrepPercentage }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recordFoodRejectionRate_decorators, { kind: "method", name: "recordFoodRejectionRate", static: false, private: false, access: { has: obj => "recordFoodRejectionRate" in obj, get: obj => obj.recordFoodRejectionRate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _calculateFoodRejectionRate_decorators, { kind: "method", name: "calculateFoodRejectionRate", static: false, private: false, access: { has: obj => "calculateFoodRejectionRate" in obj, get: obj => obj.calculateFoodRejectionRate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recordKitchenThroughput_decorators, { kind: "method", name: "recordKitchenThroughput", static: false, private: false, access: { has: obj => "recordKitchenThroughput" in obj, get: obj => obj.recordKitchenThroughput }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _calculateKitchenThroughput_decorators, { kind: "method", name: "calculateKitchenThroughput", static: false, private: false, access: { has: obj => "calculateKitchenThroughput" in obj, get: obj => obj.calculateKitchenThroughput }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recordAllKitchenSLAs_decorators, { kind: "method", name: "recordAllKitchenSLAs", static: false, private: false, access: { has: obj => "recordAllKitchenSLAs" in obj, get: obj => obj.recordAllKitchenSLAs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getKitchenSLABranch_decorators, { kind: "method", name: "getKitchenSLABranch", static: false, private: false, access: { has: obj => "getKitchenSLABranch" in obj, get: obj => obj.getKitchenSLABranch }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getKitchenSLASummary_decorators, { kind: "method", name: "getKitchenSLASummary", static: false, private: false, access: { has: obj => "getKitchenSLASummary" in obj, get: obj => obj.getKitchenSLASummary }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createSupplier_decorators, { kind: "method", name: "createSupplier", static: false, private: false, access: { has: obj => "createSupplier" in obj, get: obj => obj.createSupplier }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSupplierInventory_decorators, { kind: "method", name: "getSupplierInventory", static: false, private: false, access: { has: obj => "getSupplierInventory" in obj, get: obj => obj.getSupplierInventory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getInventoryConsumption_decorators, { kind: "method", name: "getInventoryConsumption", static: false, private: false, access: { has: obj => "getInventoryConsumption" in obj, get: obj => obj.getInventoryConsumption }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _forecastInventoryNeeds_decorators, { kind: "method", name: "forecastInventoryNeeds", static: false, private: false, access: { has: obj => "forecastInventoryNeeds" in obj, get: obj => obj.forecastInventoryNeeds }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            KitchenController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        kitchenService = __runInitializers(this, _instanceExtraInitializers);
        constructor(kitchenService) {
            this.kitchenService = kitchenService;
        }
        // Inventory Management Endpoints
        async createInventoryItem(data) {
            return this.kitchenService.createInventoryItem(data);
        }
        async updateInventoryStock(id, quantityChange) {
            return this.kitchenService.updateInventoryStock(id, quantityChange);
        }
        async recordWastage(id, wastedQuantity, reason) {
            return this.kitchenService.recordWastage(id, wastedQuantity, reason);
        }
        async getLowStockItems(branchId) {
            return this.kitchenService.getLowStockItems(branchId);
        }
        async checkAndNotifyLowStock(branchId) {
            return this.kitchenService.checkAndNotifyLowStock(branchId);
        }
        // Recipe Management Endpoints
        async createRecipe(data) {
            return this.kitchenService.createRecipe(data);
        }
        async getRecipeById(id) {
            return this.kitchenService.getRecipeById(id);
        }
        // Batch Management Endpoints
        async createBatch(data) {
            return this.kitchenService.createBatch(data);
        }
        async updateBatchStatus(id, status) {
            return this.kitchenService.updateBatchStatus(id, status);
        }
        // Food Preparation Endpoints
        async logFoodPrep(data) {
            return this.kitchenService.logFoodPrep(data);
        }
        async updateFoodPrepQuality(id, qualityData) {
            return this.kitchenService.updateFoodPrepQuality(id, qualityData);
        }
        // SLA Monitoring Endpoints
        async recordKitchenSLA(data) {
            return this.kitchenService.recordKitchenSLA(data);
        }
        async recordAvgPrepTime(branchId, prepTimeMinutes, period = 'hourly') {
            return this.kitchenService.recordAvgPrepTime(branchId, prepTimeMinutes, period);
        }
        async recordLatePrepPercentage(branchId, latePercentage, period = 'hourly') {
            return this.kitchenService.recordLatePrepPercentage(branchId, latePercentage, period);
        }
        async recordFoodRejectionRate(branchId, rejectionRate, period = 'hourly') {
            return this.kitchenService.recordFoodRejectionRate(branchId, rejectionRate, period);
        }
        async calculateFoodRejectionRate(branchId, period = 'hourly') {
            return this.kitchenService.calculateAndRecordFoodRejectionRate(branchId, period);
        }
        async recordKitchenThroughput(branchId, ordersPerHour, period = 'hourly') {
            return this.kitchenService.recordKitchenThroughput(branchId, ordersPerHour, period);
        }
        async calculateKitchenThroughput(branchId, period = 'hourly') {
            return this.kitchenService.calculateAndRecordKitchenThroughput(branchId, period);
        }
        async recordAllKitchenSLAs(branchId) {
            return this.kitchenService.recordAllKitchenSLAs(branchId);
        }
        async getKitchenSLABranch(branchId, metricName, limit = 100) {
            return this.kitchenService.getKitchenSLABranch(branchId, metricName, limit);
        }
        async getKitchenSLASummary(branchId, period = 'daily') {
            return this.kitchenService.getKitchenSLASummary(branchId, period);
        }
        // Supplier Management Endpoints
        async createSupplier(data) {
            return this.kitchenService.createSupplier(data);
        }
        async getSupplierInventory(supplierId) {
            return this.kitchenService.getSupplierInventory(supplierId);
        }
        // Consumption & Forecasting Endpoints
        async getInventoryConsumption(branchId, days = 7) {
            return this.kitchenService.getInventoryConsumption(branchId, days);
        }
        async forecastInventoryNeeds(branchId, daysAhead = 7) {
            return this.kitchenService.forecastInventoryNeeds(branchId, daysAhead);
        }
    };
    return KitchenController = _classThis;
})();
exports.KitchenController = KitchenController;
