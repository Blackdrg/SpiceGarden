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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantEntity = void 0;
var typeorm_1 = require("typeorm");
var restaurant_branch_entity_1 = require("./restaurant-branch.entity");
var restaurant_gst_entity_1 = require("./restaurant-gst.entity");
var RestaurantEntity = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('restaurants')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _slug_decorators;
    var _slug_initializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _logoUrl_decorators;
    var _logoUrl_initializers = [];
    var _bannerUrl_decorators;
    var _bannerUrl_initializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _stripeAccountId_decorators;
    var _stripeAccountId_initializers = [];
    var _razorpayFundAccountId_decorators;
    var _razorpayFundAccountId_initializers = [];
    var _commissionType_decorators;
    var _commissionType_initializers = [];
    var _commissionValue_decorators;
    var _commissionValue_initializers = [];
    var _location_decorators;
    var _location_initializers = [];
    var _branches_decorators;
    var _branches_initializers = [];
    var _gstDetail_decorators;
    var _gstDetail_initializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var RestaurantEntity = _classThis = /** @class */ (function () {
        function RestaurantEntity_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.name = __runInitializers(this, _name_initializers, void 0);
            this.slug = __runInitializers(this, _slug_initializers, void 0);
            this.description = __runInitializers(this, _description_initializers, void 0);
            this.logoUrl = __runInitializers(this, _logoUrl_initializers, void 0);
            this.bannerUrl = __runInitializers(this, _bannerUrl_initializers, void 0);
            this.status = __runInitializers(this, _status_initializers, void 0);
            this.stripeAccountId = __runInitializers(this, _stripeAccountId_initializers, void 0);
            this.razorpayFundAccountId = __runInitializers(this, _razorpayFundAccountId_initializers, void 0);
            this.commissionType = __runInitializers(this, _commissionType_initializers, void 0);
            this.commissionValue = __runInitializers(this, _commissionValue_initializers, void 0);
            this.location = __runInitializers(this, _location_initializers, void 0);
            this.branches = __runInitializers(this, _branches_initializers, void 0);
            this.gstDetail = __runInitializers(this, _gstDetail_initializers, void 0);
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            this.updatedAt = __runInitializers(this, _updatedAt_initializers, void 0);
        }
        return RestaurantEntity_1;
    }());
    __setFunctionName(_classThis, "RestaurantEntity");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _name_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _slug_decorators = [(0, typeorm_1.Column)({ unique: true, nullable: true })];
        _description_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _logoUrl_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _bannerUrl_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _status_decorators = [(0, typeorm_1.Column)({ default: 'active' })];
        _stripeAccountId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _razorpayFundAccountId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _commissionType_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _commissionValue_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true })];
        _location_decorators = [(0, typeorm_1.Column)({ type: 'json', nullable: true })];
        _branches_decorators = [(0, typeorm_1.OneToMany)(function () { return restaurant_branch_entity_1.RestaurantBranchEntity; }, function (branch) { return branch.restaurant; })];
        _gstDetail_decorators = [(0, typeorm_1.OneToOne)(function () { return restaurant_gst_entity_1.RestaurantGSTEntity; }, function (gstDetail) { return gstDetail.restaurant; })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _slug_decorators, { kind: "field", name: "slug", static: false, private: false, access: { has: function (obj) { return "slug" in obj; }, get: function (obj) { return obj.slug; }, set: function (obj, value) { obj.slug = value; } }, metadata: _metadata }, _slug_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _logoUrl_decorators, { kind: "field", name: "logoUrl", static: false, private: false, access: { has: function (obj) { return "logoUrl" in obj; }, get: function (obj) { return obj.logoUrl; }, set: function (obj, value) { obj.logoUrl = value; } }, metadata: _metadata }, _logoUrl_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _bannerUrl_decorators, { kind: "field", name: "bannerUrl", static: false, private: false, access: { has: function (obj) { return "bannerUrl" in obj; }, get: function (obj) { return obj.bannerUrl; }, set: function (obj, value) { obj.bannerUrl = value; } }, metadata: _metadata }, _bannerUrl_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _stripeAccountId_decorators, { kind: "field", name: "stripeAccountId", static: false, private: false, access: { has: function (obj) { return "stripeAccountId" in obj; }, get: function (obj) { return obj.stripeAccountId; }, set: function (obj, value) { obj.stripeAccountId = value; } }, metadata: _metadata }, _stripeAccountId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _razorpayFundAccountId_decorators, { kind: "field", name: "razorpayFundAccountId", static: false, private: false, access: { has: function (obj) { return "razorpayFundAccountId" in obj; }, get: function (obj) { return obj.razorpayFundAccountId; }, set: function (obj, value) { obj.razorpayFundAccountId = value; } }, metadata: _metadata }, _razorpayFundAccountId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _commissionType_decorators, { kind: "field", name: "commissionType", static: false, private: false, access: { has: function (obj) { return "commissionType" in obj; }, get: function (obj) { return obj.commissionType; }, set: function (obj, value) { obj.commissionType = value; } }, metadata: _metadata }, _commissionType_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _commissionValue_decorators, { kind: "field", name: "commissionValue", static: false, private: false, access: { has: function (obj) { return "commissionValue" in obj; }, get: function (obj) { return obj.commissionValue; }, set: function (obj, value) { obj.commissionValue = value; } }, metadata: _metadata }, _commissionValue_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _branches_decorators, { kind: "field", name: "branches", static: false, private: false, access: { has: function (obj) { return "branches" in obj; }, get: function (obj) { return obj.branches; }, set: function (obj, value) { obj.branches = value; } }, metadata: _metadata }, _branches_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _gstDetail_decorators, { kind: "field", name: "gstDetail", static: false, private: false, access: { has: function (obj) { return "gstDetail" in obj; }, get: function (obj) { return obj.gstDetail; }, set: function (obj, value) { obj.gstDetail = value; } }, metadata: _metadata }, _gstDetail_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RestaurantEntity = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RestaurantEntity = _classThis;
}();
exports.RestaurantEntity = RestaurantEntity;
