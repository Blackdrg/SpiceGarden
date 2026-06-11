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
exports.LoyaltyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
let LoyaltyController = (() => {
    let _classDecorators = [(0, swagger_1.ApiTags)('loyalty'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.Controller)('loyalty'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createCoupon_decorators;
    let _applyCoupon_decorators;
    let _getCoupons_decorators;
    let _getCouponAnalytics_decorators;
    let _deactivateCoupon_decorators;
    let _generateReferralCode_decorators;
    let _processReferral_decorators;
    let _getReferralHistory_decorators;
    let _processCashback_decorators;
    let _getWalletCashback_decorators;
    var LoyaltyController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _createCoupon_decorators = [(0, common_1.Post)('coupons'), (0, swagger_1.ApiOperation)({ summary: 'Create a new coupon' })];
            _applyCoupon_decorators = [(0, common_1.Post)('coupons/apply'), (0, swagger_1.ApiOperation)({ summary: 'Apply coupon to order' })];
            _getCoupons_decorators = [(0, common_1.Get)('coupons'), (0, swagger_1.ApiOperation)({ summary: 'Get all coupons' })];
            _getCouponAnalytics_decorators = [(0, common_1.Get)('coupons/:id/analytics'), (0, swagger_1.ApiOperation)({ summary: 'Get coupon analytics' })];
            _deactivateCoupon_decorators = [(0, common_1.Put)('coupons/:id/deactivate'), (0, swagger_1.ApiOperation)({ summary: 'Deactivate coupon' })];
            _generateReferralCode_decorators = [(0, common_1.Post)('referrals/code'), (0, swagger_1.ApiOperation)({ summary: 'Generate referral code' })];
            _processReferral_decorators = [(0, common_1.Post)('referrals/process'), (0, swagger_1.ApiOperation)({ summary: 'Process referral' })];
            _getReferralHistory_decorators = [(0, common_1.Get)('referrals/:userId'), (0, swagger_1.ApiOperation)({ summary: 'Get referral history' })];
            _processCashback_decorators = [(0, common_1.Post)('cashback/process'), (0, swagger_1.ApiOperation)({ summary: 'Process cashback for order' })];
            _getWalletCashback_decorators = [(0, common_1.Get)('cashback/:userId'), (0, swagger_1.ApiOperation)({ summary: 'Get user cashback summary' })];
            __esDecorate(this, null, _createCoupon_decorators, { kind: "method", name: "createCoupon", static: false, private: false, access: { has: obj => "createCoupon" in obj, get: obj => obj.createCoupon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _applyCoupon_decorators, { kind: "method", name: "applyCoupon", static: false, private: false, access: { has: obj => "applyCoupon" in obj, get: obj => obj.applyCoupon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getCoupons_decorators, { kind: "method", name: "getCoupons", static: false, private: false, access: { has: obj => "getCoupons" in obj, get: obj => obj.getCoupons }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getCouponAnalytics_decorators, { kind: "method", name: "getCouponAnalytics", static: false, private: false, access: { has: obj => "getCouponAnalytics" in obj, get: obj => obj.getCouponAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deactivateCoupon_decorators, { kind: "method", name: "deactivateCoupon", static: false, private: false, access: { has: obj => "deactivateCoupon" in obj, get: obj => obj.deactivateCoupon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _generateReferralCode_decorators, { kind: "method", name: "generateReferralCode", static: false, private: false, access: { has: obj => "generateReferralCode" in obj, get: obj => obj.generateReferralCode }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _processReferral_decorators, { kind: "method", name: "processReferral", static: false, private: false, access: { has: obj => "processReferral" in obj, get: obj => obj.processReferral }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getReferralHistory_decorators, { kind: "method", name: "getReferralHistory", static: false, private: false, access: { has: obj => "getReferralHistory" in obj, get: obj => obj.getReferralHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _processCashback_decorators, { kind: "method", name: "processCashback", static: false, private: false, access: { has: obj => "processCashback" in obj, get: obj => obj.processCashback }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getWalletCashback_decorators, { kind: "method", name: "getWalletCashback", static: false, private: false, access: { has: obj => "getWalletCashback" in obj, get: obj => obj.getWalletCashback }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LoyaltyController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        loyaltyService = __runInitializers(this, _instanceExtraInitializers);
        constructor(loyaltyService) {
            this.loyaltyService = loyaltyService;
        }
        createCoupon(data) {
            return this.loyaltyService.createCoupon(data);
        }
        applyCoupon(body) {
            return this.loyaltyService.applyCoupon(body.code, body.userId, body.orderAmount, body.orderId);
        }
        getCoupons(filters) {
            return this.loyaltyService.getAllCoupons(filters);
        }
        getCouponAnalytics(id) {
            return this.loyaltyService.getCouponAnalytics(id);
        }
        deactivateCoupon(id) {
            return this.loyaltyService.deactivateCoupon(id);
        }
        generateReferralCode(body) {
            return this.loyaltyService.generateReferralCode(body.userId);
        }
        processReferral(body) {
            return this.loyaltyService.processReferral(body.code, body.refereeId, body.firstOrderId);
        }
        getReferralHistory(userId) {
            return this.loyaltyService.getReferralHistory(userId);
        }
        processCashback(body) {
            return this.loyaltyService.processCashback(body.userId, body.orderId, body.orderAmount);
        }
        getWalletCashback(userId) {
            return this.loyaltyService.getWalletCashback(userId);
        }
    };
    return LoyaltyController = _classThis;
})();
exports.LoyaltyController = LoyaltyController;
