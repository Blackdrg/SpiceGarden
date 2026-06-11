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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
let FinanceController = (() => {
    let _classDecorators = [(0, common_1.Controller)('finance')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getGSTReport_decorators;
    let _reconcilePayments_decorators;
    let _reconcilePayouts_decorators;
    let _reconcileDriverPayments_decorators;
    let _runFullReconciliation_decorators;
    var FinanceController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getGSTReport_decorators = [(0, common_1.Get)('gst/report')];
            _reconcilePayments_decorators = [(0, common_1.Post)('reconciliation/payments')];
            _reconcilePayouts_decorators = [(0, common_1.Post)('reconciliation/payouts')];
            _reconcileDriverPayments_decorators = [(0, common_1.Post)('reconciliation/driver')];
            _runFullReconciliation_decorators = [(0, common_1.Post)('reconciliation/full')];
            __esDecorate(this, null, _getGSTReport_decorators, { kind: "method", name: "getGSTReport", static: false, private: false, access: { has: obj => "getGSTReport" in obj, get: obj => obj.getGSTReport }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reconcilePayments_decorators, { kind: "method", name: "reconcilePayments", static: false, private: false, access: { has: obj => "reconcilePayments" in obj, get: obj => obj.reconcilePayments }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reconcilePayouts_decorators, { kind: "method", name: "reconcilePayouts", static: false, private: false, access: { has: obj => "reconcilePayouts" in obj, get: obj => obj.reconcilePayouts }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _reconcileDriverPayments_decorators, { kind: "method", name: "reconcileDriverPayments", static: false, private: false, access: { has: obj => "reconcileDriverPayments" in obj, get: obj => obj.reconcileDriverPayments }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _runFullReconciliation_decorators, { kind: "method", name: "runFullReconciliation", static: false, private: false, access: { has: obj => "runFullReconciliation" in obj, get: obj => obj.runFullReconciliation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            FinanceController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        taxService = __runInitializers(this, _instanceExtraInitializers);
        reconciliationService;
        constructor(taxService, reconciliationService) {
            this.taxService = taxService;
            this.reconciliationService = reconciliationService;
        }
        async getGSTReport(restaurantId, month, year) {
            return this.taxService.generateGSTReport(restaurantId, Number(month), Number(year));
        }
        async reconcilePayments(body) {
            return this.reconciliationService.reconcilePayments(new Date(body.startDate), new Date(body.endDate));
        }
        async reconcilePayouts(body) {
            return this.reconciliationService.reconcilePayouts(body.restaurantId, new Date(body.startDate), new Date(body.endDate));
        }
        async reconcileDriverPayments(body) {
            return this.reconciliationService.reconcileDriverPayments(body.driverId, new Date(body.startDate), new Date(body.endDate));
        }
        async runFullReconciliation(body) {
            return this.reconciliationService.runFullReconciliation({
                start: new Date(body.startDate),
                end: new Date(body.endDate),
            });
        }
    };
    return FinanceController = _classThis;
})();
exports.FinanceController = FinanceController;
