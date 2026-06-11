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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
let AnalyticsController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('analytics'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('analytics'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getTopDishes_decorators;
    let _getChurnAnalysis_decorators;
    let _getRepeatUsers_decorators;
    let _getConversion_decorators;
    let _getHeatmap_decorators;
    let _getPeakHours_decorators;
    let _getRestaurantAnalytics_decorators;
    let _getPlatformAnalytics_decorators;
    var AnalyticsController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getTopDishes_decorators = [(0, common_1.Get)('top-dishes'), (0, swagger_1.ApiOperation)({ summary: 'Get top selling dishes' })];
            _getChurnAnalysis_decorators = [(0, common_1.Get)('churn'), (0, swagger_1.ApiOperation)({ summary: 'Get churn analysis' })];
            _getRepeatUsers_decorators = [(0, common_1.Get)('repeat-users'), (0, swagger_1.ApiOperation)({ summary: 'Get repeat user analytics' })];
            _getConversion_decorators = [(0, common_1.Get)('conversion'), (0, swagger_1.ApiOperation)({ summary: 'Get conversion funnel' })];
            _getHeatmap_decorators = [(0, common_1.Get)('heatmap'), (0, swagger_1.ApiOperation)({ summary: 'Get delivery heatmap' })];
            _getPeakHours_decorators = [(0, common_1.Get)('peak-hours'), (0, swagger_1.ApiOperation)({ summary: 'Get peak hours analysis' })];
            _getRestaurantAnalytics_decorators = [(0, common_1.Get)('restaurant/:id'), (0, swagger_1.ApiOperation)({ summary: 'Get full restaurant analytics' })];
            _getPlatformAnalytics_decorators = [(0, common_1.Get)('platform'), (0, swagger_1.ApiOperation)({ summary: 'Get platform-wide analytics' })];
            __esDecorate(this, null, _getTopDishes_decorators, { kind: "method", name: "getTopDishes", static: false, private: false, access: { has: obj => "getTopDishes" in obj, get: obj => obj.getTopDishes }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getChurnAnalysis_decorators, { kind: "method", name: "getChurnAnalysis", static: false, private: false, access: { has: obj => "getChurnAnalysis" in obj, get: obj => obj.getChurnAnalysis }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getRepeatUsers_decorators, { kind: "method", name: "getRepeatUsers", static: false, private: false, access: { has: obj => "getRepeatUsers" in obj, get: obj => obj.getRepeatUsers }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getConversion_decorators, { kind: "method", name: "getConversion", static: false, private: false, access: { has: obj => "getConversion" in obj, get: obj => obj.getConversion }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getHeatmap_decorators, { kind: "method", name: "getHeatmap", static: false, private: false, access: { has: obj => "getHeatmap" in obj, get: obj => obj.getHeatmap }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPeakHours_decorators, { kind: "method", name: "getPeakHours", static: false, private: false, access: { has: obj => "getPeakHours" in obj, get: obj => obj.getPeakHours }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getRestaurantAnalytics_decorators, { kind: "method", name: "getRestaurantAnalytics", static: false, private: false, access: { has: obj => "getRestaurantAnalytics" in obj, get: obj => obj.getRestaurantAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getPlatformAnalytics_decorators, { kind: "method", name: "getPlatformAnalytics", static: false, private: false, access: { has: obj => "getPlatformAnalytics" in obj, get: obj => obj.getPlatformAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AnalyticsController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        analyticsService = __runInitializers(this, _instanceExtraInitializers);
        constructor(analyticsService) {
            this.analyticsService = analyticsService;
        }
        getTopDishes(restaurantId, period = '30') {
            return this.analyticsService.getTopDishes(restaurantId, parseInt(period));
        }
        getChurnAnalysis(restaurantId, period = '90') {
            return this.analyticsService.getChurnAnalysis(restaurantId, parseInt(period));
        }
        getRepeatUsers(restaurantId, period = '90') {
            return this.analyticsService.getRepeatUsers(restaurantId, parseInt(period));
        }
        getConversion(restaurantId, period = '30') {
            return this.analyticsService.getConversionRate(restaurantId, parseInt(period));
        }
        getHeatmap(restaurantId, period = '30') {
            return this.analyticsService.getDeliveryHeatmap(restaurantId, parseInt(period));
        }
        getPeakHours(restaurantId, period = '30') {
            return this.analyticsService.getPeakHours(restaurantId, parseInt(period));
        }
        getRestaurantAnalytics(id) {
            return this.analyticsService.getRestaurantAnalytics(id);
        }
        getPlatformAnalytics() {
            return this.analyticsService.getPlatformAnalytics();
        }
    };
    return AnalyticsController = _classThis;
})();
exports.AnalyticsController = AnalyticsController;
