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
exports.RestaurantBranchEntity = void 0;
var typeorm_1 = require("typeorm");
var restaurant_entity_1 = require("./restaurant.entity");
var menu_category_entity_1 = require("./menu-category.entity");
var RestaurantBranchEntity = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('restaurant_branches')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _branchName_decorators;
    var _branchName_initializers = [];
    var _address_decorators;
    var _address_initializers = [];
    var _location_decorators;
    var _location_initializers = [];
    var _openingTime_decorators;
    var _openingTime_initializers = [];
    var _closingTime_decorators;
    var _closingTime_initializers = [];
    var _isOnline_decorators;
    var _isOnline_initializers = [];
    var _restaurant_decorators;
    var _restaurant_initializers = [];
    var _categories_decorators;
    var _categories_initializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var RestaurantBranchEntity = _classThis = /** @class */ (function () {
        function RestaurantBranchEntity_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.branchName = __runInitializers(this, _branchName_initializers, void 0);
            this.address = __runInitializers(this, _address_initializers, void 0);
            this.location = __runInitializers(this, _location_initializers, void 0);
            this.openingTime = __runInitializers(this, _openingTime_initializers, void 0);
            this.closingTime = __runInitializers(this, _closingTime_initializers, void 0);
            this.isOnline = __runInitializers(this, _isOnline_initializers, void 0);
            this.restaurant = __runInitializers(this, _restaurant_initializers, void 0);
            this.categories = __runInitializers(this, _categories_initializers, void 0);
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            this.updatedAt = __runInitializers(this, _updatedAt_initializers, void 0);
        }
        return RestaurantBranchEntity_1;
    }());
    __setFunctionName(_classThis, "RestaurantBranchEntity");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _branchName_decorators = [(0, typeorm_1.Column)()];
        _address_decorators = [(0, typeorm_1.Column)()];
        _location_decorators = [(0, typeorm_1.Index)({ spatial: true }), (0, typeorm_1.Column)({
                type: 'point',
                transformer: {
                    from: function (v) {
                        if (typeof v === 'string') {
                            var match = v.match(/\((.*)\)/);
                            if (match) {
                                var _a = match[1].split(' ').map(Number), lng = _a[0], lat = _a[1];
                                return { lat: lat, lng: lng };
                            }
                        }
                        return v;
                    },
                    to: function (v) {
                        return "(".concat(v.lng, " ").concat(v.lat, ")");
                    },
                },
            })];
        _openingTime_decorators = [(0, typeorm_1.Column)({ type: 'time' })];
        _closingTime_decorators = [(0, typeorm_1.Column)({ type: 'time' })];
        _isOnline_decorators = [(0, typeorm_1.Column)({ default: true })];
        _restaurant_decorators = [(0, typeorm_1.ManyToOne)(function () { return restaurant_entity_1.RestaurantEntity; }, function (restaurant) { return restaurant.branches; })];
        _categories_decorators = [(0, typeorm_1.OneToMany)(function () { return menu_category_entity_1.MenuCategoryEntity; }, function (category) { return category.branch; })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _branchName_decorators, { kind: "field", name: "branchName", static: false, private: false, access: { has: function (obj) { return "branchName" in obj; }, get: function (obj) { return obj.branchName; }, set: function (obj, value) { obj.branchName = value; } }, metadata: _metadata }, _branchName_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _address_decorators, { kind: "field", name: "address", static: false, private: false, access: { has: function (obj) { return "address" in obj; }, get: function (obj) { return obj.address; }, set: function (obj, value) { obj.address = value; } }, metadata: _metadata }, _address_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _openingTime_decorators, { kind: "field", name: "openingTime", static: false, private: false, access: { has: function (obj) { return "openingTime" in obj; }, get: function (obj) { return obj.openingTime; }, set: function (obj, value) { obj.openingTime = value; } }, metadata: _metadata }, _openingTime_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _closingTime_decorators, { kind: "field", name: "closingTime", static: false, private: false, access: { has: function (obj) { return "closingTime" in obj; }, get: function (obj) { return obj.closingTime; }, set: function (obj, value) { obj.closingTime = value; } }, metadata: _metadata }, _closingTime_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _isOnline_decorators, { kind: "field", name: "isOnline", static: false, private: false, access: { has: function (obj) { return "isOnline" in obj; }, get: function (obj) { return obj.isOnline; }, set: function (obj, value) { obj.isOnline = value; } }, metadata: _metadata }, _isOnline_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _restaurant_decorators, { kind: "field", name: "restaurant", static: false, private: false, access: { has: function (obj) { return "restaurant" in obj; }, get: function (obj) { return obj.restaurant; }, set: function (obj, value) { obj.restaurant = value; } }, metadata: _metadata }, _restaurant_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _categories_decorators, { kind: "field", name: "categories", static: false, private: false, access: { has: function (obj) { return "categories" in obj; }, get: function (obj) { return obj.categories; }, set: function (obj, value) { obj.categories = value; } }, metadata: _metadata }, _categories_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RestaurantBranchEntity = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RestaurantBranchEntity = _classThis;
}();
exports.RestaurantBranchEntity = RestaurantBranchEntity;
