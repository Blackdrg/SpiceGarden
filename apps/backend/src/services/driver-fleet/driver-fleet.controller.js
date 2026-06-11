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
exports.DriverFleetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
let DriverFleetController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('driver-fleet'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('fleet'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _startShift_decorators;
    let _endShift_decorators;
    let _getShifts_decorators;
    let _getEarnings_decorators;
    let _calculateIncentives_decorators;
    let _issuePenalty_decorators;
    let _getPerformance_decorators;
    let _getDriverPerformance_decorators;
    let _getSchedule_decorators;
    let _approvePenalty_decorators;
    let _waivePenalty_decorators;
    var DriverFleetController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _startShift_decorators = [(0, common_1.Post)('shifts/start'), (0, swagger_1.ApiOperation)({ summary: 'Start a driver shift' })];
            _endShift_decorators = [(0, common_1.Post)('shifts/end'), (0, swagger_1.ApiOperation)({ summary: 'End a driver shift' })];
            _getShifts_decorators = [(0, common_1.Get)('shifts/:driverId'), (0, swagger_1.ApiOperation)({ summary: 'Get driver shift history' })];
            _getEarnings_decorators = [(0, common_1.Post)('earnings'), (0, swagger_1.ApiOperation)({ summary: 'Get driver earnings for a period' })];
            _calculateIncentives_decorators = [(0, common_1.Post)('incentives/calculate'), (0, swagger_1.ApiOperation)({ summary: 'Calculate driver incentives' })];
            _issuePenalty_decorators = [(0, common_1.Post)('penalties'), (0, swagger_1.ApiOperation)({ summary: 'Issue a penalty to driver' })];
            _getPerformance_decorators = [(0, common_1.Get)('performance'), (0, swagger_1.ApiOperation)({ summary: 'Get performance ranking' })];
            _getDriverPerformance_decorators = [(0, common_1.Get)('performance/:driverId'), (0, swagger_1.ApiOperation)({ summary: 'Get driver performance' })];
            _getSchedule_decorators = [(0, common_1.Get)('schedule/:driverId'), (0, swagger_1.ApiOperation)({ summary: 'Get driver schedule' })];
            _approvePenalty_decorators = [(0, common_1.Put)('penalties/:id/approve'), (0, swagger_1.ApiOperation)({ summary: 'Approve penalty' })];
            _waivePenalty_decorators = [(0, common_1.Put)('penalties/:id/waive'), (0, swagger_1.ApiOperation)({ summary: 'Waive penalty' })];
            __esDecorate(this, null, _startShift_decorators, { kind: "method", name: "startShift", static: false, private: false, access: { has: obj => "startShift" in obj, get: obj => obj.startShift }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _endShift_decorators, { kind: "method", name: "endShift", static: false, private: false, access: { has: obj => "endShift" in obj, get: obj => obj.endShift }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getShifts_decorators, { kind: "method", name: "getShifts", static: false, private: false, access: { has: obj => "getShifts" in obj, get: obj => obj.getShifts }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getEarnings_decorators, { kind: "method", name: "getEarnings", static: false, private: false, access: { has: obj => "getEarnings" in obj, get: obj => obj.getEarnings }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _calculateIncentives_decorators, { kind: "method", name: "calculateIncentives", static: false, private: false, access: { has: obj => "calculateIncentives" in obj, get: obj => obj.calculateIncentives }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _issuePenalty_decorators, { kind: "method", name: "issuePenalty", static: false, private: false, access: { has: obj => "issuePenalty" in obj, get: obj => obj.issuePenalty }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPerformance_decorators, { kind: "method", name: "getPerformance", static: false, private: false, access: { has: obj => "getPerformance" in obj, get: obj => obj.getPerformance }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDriverPerformance_decorators, { kind: "method", name: "getDriverPerformance", static: false, private: false, access: { has: obj => "getDriverPerformance" in obj, get: obj => obj.getDriverPerformance }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getSchedule_decorators, { kind: "method", name: "getSchedule", static: false, private: false, access: { has: obj => "getSchedule" in obj, get: obj => obj.getSchedule }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _approvePenalty_decorators, { kind: "method", name: "approvePenalty", static: false, private: false, access: { has: obj => "approvePenalty" in obj, get: obj => obj.approvePenalty }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _waivePenalty_decorators, { kind: "method", name: "waivePenalty", static: false, private: false, access: { has: obj => "waivePenalty" in obj, get: obj => obj.waivePenalty }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DriverFleetController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        fleetService = __runInitializers(this, _instanceExtraInitializers);
        constructor(fleetService) {
            this.fleetService = fleetService;
        }
        startShift(driverId) {
            return this.fleetService.startShift(driverId);
        }
        endShift(driverId, shiftId) {
            return this.fleetService.endShift(driverId, shiftId);
        }
        getShifts(driverId) {
            return this.fleetService.getShifts(driverId);
        }
        getEarnings(body) {
            return this.fleetService.getEarnings(body.driverId, { start: new Date(body.start), end: new Date(body.end) });
        }
        calculateIncentives(driverId) {
            return this.fleetService.calculateIncentives(driverId);
        }
        issuePenalty(body) {
            return this.fleetService.issuePenalty(body.driverId, body);
        }
        getPerformance() {
            return this.fleetService.getPerformanceRanking();
        }
        getDriverPerformance(driverId) {
            return this.fleetService.getPerformanceRanking(driverId);
        }
        getSchedule(driverId) {
            return this.fleetService.getDriverSchedule(driverId);
        }
        approvePenalty(id, approvedBy) {
            return this.fleetService.approvePenalty(id, approvedBy);
        }
        waivePenalty(id, body) {
            return this.fleetService.waivePenalty(id, body.waivedBy, body.reason);
        }
    };
    return DriverFleetController = _classThis;
})();
exports.DriverFleetController = DriverFleetController;
