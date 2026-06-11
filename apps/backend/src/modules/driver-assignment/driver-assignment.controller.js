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
exports.DriverAssignmentController = void 0;
const common_1 = require("@nestjs/common");
let DriverAssignmentController = (() => {
    let _classDecorators = [(0, common_1.Controller)('driver-assignment')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _assignDriverToOrder_decorators;
    let _assignBatchDelivery_decorators;
    let _reassignOrder_decorators;
    let _getDriverAssignments_decorators;
    let _getOrderAssignments_decorators;
    let _updateAssignmentStatus_decorators;
    let _updateAssignmentRoute_decorators;
    let _getAvailableDrivers_decorators;
    let _updateDriverScore_decorators;
    let _calculateETA_decorators;
    let _recordDeliverySLA_decorators;
    let _getDeliverySLAMetrics_decorators;
    let _recordFraudIncident_decorators;
    let _getDriverFraudHistory_decorators;
    let _getAllFraudIncidents_decorators;
    var DriverAssignmentController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _assignDriverToOrder_decorators = [(0, common_1.Post)('assign/:orderId')];
            _assignBatchDelivery_decorators = [(0, common_1.Post)('batch-assign')];
            _reassignOrder_decorators = [(0, common_1.Put)('reassign/:assignmentId')];
            _getDriverAssignments_decorators = [(0, common_1.Get)('driver/:driverId/assignments')];
            _getOrderAssignments_decorators = [(0, common_1.Get)('order/:orderId/assignments')];
            _updateAssignmentStatus_decorators = [(0, common_1.Put)(':assignmentId/status')];
            _updateAssignmentRoute_decorators = [(0, common_1.Put)(':assignmentId/route')];
            _getAvailableDrivers_decorators = [(0, common_1.Get)('drivers/available')];
            _updateDriverScore_decorators = [(0, common_1.Post)('drivers/:driverId/score')];
            _calculateETA_decorators = [(0, common_1.Get)('eta/:orderId/:driverId')];
            _recordDeliverySLA_decorators = [(0, common_1.Post)('sla')];
            _getDeliverySLAMetrics_decorators = [(0, common_1.Get)('sla')];
            _recordFraudIncident_decorators = [(0, common_1.Post)('fraud')];
            _getDriverFraudHistory_decorators = [(0, common_1.Get)('drivers/:driverId/fraud')];
            _getAllFraudIncidents_decorators = [(0, common_1.Get)('fraud')];
            __esDecorate(this, null, _assignDriverToOrder_decorators, { kind: "method", name: "assignDriverToOrder", static: false, private: false, access: { has: obj => "assignDriverToOrder" in obj, get: obj => obj.assignDriverToOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _assignBatchDelivery_decorators, { kind: "method", name: "assignBatchDelivery", static: false, private: false, access: { has: obj => "assignBatchDelivery" in obj, get: obj => obj.assignBatchDelivery }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reassignOrder_decorators, { kind: "method", name: "reassignOrder", static: false, private: false, access: { has: obj => "reassignOrder" in obj, get: obj => obj.reassignOrder }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDriverAssignments_decorators, { kind: "method", name: "getDriverAssignments", static: false, private: false, access: { has: obj => "getDriverAssignments" in obj, get: obj => obj.getDriverAssignments }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOrderAssignments_decorators, { kind: "method", name: "getOrderAssignments", static: false, private: false, access: { has: obj => "getOrderAssignments" in obj, get: obj => obj.getOrderAssignments }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateAssignmentStatus_decorators, { kind: "method", name: "updateAssignmentStatus", static: false, private: false, access: { has: obj => "updateAssignmentStatus" in obj, get: obj => obj.updateAssignmentStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateAssignmentRoute_decorators, { kind: "method", name: "updateAssignmentRoute", static: false, private: false, access: { has: obj => "updateAssignmentRoute" in obj, get: obj => obj.updateAssignmentRoute }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAvailableDrivers_decorators, { kind: "method", name: "getAvailableDrivers", static: false, private: false, access: { has: obj => "getAvailableDrivers" in obj, get: obj => obj.getAvailableDrivers }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateDriverScore_decorators, { kind: "method", name: "updateDriverScore", static: false, private: false, access: { has: obj => "updateDriverScore" in obj, get: obj => obj.updateDriverScore }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _calculateETA_decorators, { kind: "method", name: "calculateETA", static: false, private: false, access: { has: obj => "calculateETA" in obj, get: obj => obj.calculateETA }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recordDeliverySLA_decorators, { kind: "method", name: "recordDeliverySLA", static: false, private: false, access: { has: obj => "recordDeliverySLA" in obj, get: obj => obj.recordDeliverySLA }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDeliverySLAMetrics_decorators, { kind: "method", name: "getDeliverySLAMetrics", static: false, private: false, access: { has: obj => "getDeliverySLAMetrics" in obj, get: obj => obj.getDeliverySLAMetrics }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recordFraudIncident_decorators, { kind: "method", name: "recordFraudIncident", static: false, private: false, access: { has: obj => "recordFraudIncident" in obj, get: obj => obj.recordFraudIncident }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDriverFraudHistory_decorators, { kind: "method", name: "getDriverFraudHistory", static: false, private: false, access: { has: obj => "getDriverFraudHistory" in obj, get: obj => obj.getDriverFraudHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAllFraudIncidents_decorators, { kind: "method", name: "getAllFraudIncidents", static: false, private: false, access: { has: obj => "getAllFraudIncidents" in obj, get: obj => obj.getAllFraudIncidents }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DriverAssignmentController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        driverAssignmentService = __runInitializers(this, _instanceExtraInitializers);
        constructor(driverAssignmentService) {
            this.driverAssignmentService = driverAssignmentService;
        }
        // Driver Assignment Endpoints
        async assignDriverToOrder(orderId) {
            return this.driverAssignmentService.assignDriverToOrder(orderId);
        }
        async assignBatchDelivery(orderIds, driverId) {
            return this.driverAssignmentService.assignBatchDelivery(orderIds, driverId);
        }
        async reassignOrder(assignmentId, newDriverId, reason = 'Driver unavailable') {
            return this.driverAssignmentService.reassignOrder(assignmentId, newDriverId, reason);
        }
        async getDriverAssignments(driverId, status) {
            return this.driverAssignmentService.getDriverAssignments(driverId, status);
        }
        async getOrderAssignments(orderId) {
            return this.driverAssignmentService.getOrderAssignments(orderId);
        }
        async updateAssignmentStatus(assignmentId, status, actualTimeMinutes) {
            return this.driverAssignmentService.updateAssignmentStatus(assignmentId, status, actualTimeMinutes);
        }
        async updateAssignmentRoute(assignmentId, routeData) {
            return this.driverAssignmentService.updateAssignmentRoute(assignmentId, routeData);
        }
        // Driver Management Endpoints
        async getAvailableDrivers(lat, lng, radius = 5) {
            return this.driverAssignmentService.getAvailableDrivers(lat, lng, radius);
        }
        async updateDriverScore(driverId) {
            return this.driverAssignmentService.updateDriverScore(driverId);
        }
        // ETA Intelligence Endpoints
        async calculateETA(orderId, driverId) {
            // This would call the ETA service - for now returning placeholder
            // In a full implementation, you'd inject ETAIntelligenceService
            return {
                etaMinutes: 25,
                confidence: 0.85,
                factors: {
                    distance: 4.2,
                    trafficConditions: { multiplier: 1.1, level: 'moderate' },
                    kitchenDelay: { delayMinutes: 3, confidence: 0.8 },
                    driverExperience: 150,
                    timeOfDay: 14,
                    weatherImpact: { multiplier: 1.0, condition: 'clear' }
                }
            };
        }
        // SLA Monitoring Endpoints
        async recordDeliverySLA(data) {
            return this.driverAssignmentService.recordDeliverySLA(data.driverId, data.branchId, data.metricName, data.value, data.unit, data.targetValue, data.targetUnit, data.measurementPeriod);
        }
        async getDeliverySLAMetrics(driverId, branchId, metricName, limit = 100) {
            return this.driverAssignmentService.getDeliverySLAMetrics(driverId, branchId, metricName, limit);
        }
        // Fraud Detection Endpoints
        async recordFraudIncident(data) {
            return this.driverAssignmentService.recordFraudIncident(data.driverId, data.orderId, data.branchId, data.fraudType, data.evidence, data.severity);
        }
        async getDriverFraudHistory(driverId) {
            return this.driverAssignmentService.getDriverFraudHistory(driverId);
        }
        async getAllFraudIncidents(driverId, limit = 50) {
            // This would need to be implemented in the service
            // For now returning placeholder
            return [];
        }
    };
    return DriverAssignmentController = _classThis;
})();
exports.DriverAssignmentController = DriverAssignmentController;
