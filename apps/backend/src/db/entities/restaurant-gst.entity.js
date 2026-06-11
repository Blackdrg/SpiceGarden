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
exports.RestaurantGSTEntity = void 0;
var typeorm_1 = require("typeorm");
var restaurant_entity_1 = require("./restaurant.entity");
var RestaurantGSTEntity = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('restaurant_gst')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _restaurant_decorators;
    var _restaurant_initializers = [];
    var _restaurantId_decorators;
    var _restaurantId_initializers = [];
    var _gstin_decorators;
    var _gstin_initializers = [];
    var _legalNameOfBusiness_decorators;
    var _legalNameOfBusiness_initializers = [];
    var _tradeName_decorators;
    var _tradeName_initializers = [];
    var _address_decorators;
    var _address_initializers = [];
    var _stateCode_decorators;
    var _stateCode_initializers = [];
    var _state_decorators;
    var _state_initializers = [];
    var _registrationDate_decorators;
    var _registrationDate_initializers = [];
    var _cancellationDate_decorators;
    var _cancellationDate_initializers = [];
    var _isActive_decorators;
    var _isActive_initializers = [];
    var _email_decorators;
    var _email_initializers = [];
    var _phone_decorators;
    var _phone_initializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var RestaurantGSTEntity = _classThis = /** @class */ (function () {
        function RestaurantGSTEntity_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.restaurant = __runInitializers(this, _restaurant_initializers, void 0);
            this.restaurantId = __runInitializers(this, _restaurantId_initializers, void 0);
            this.gstin = __runInitializers(this, _gstin_initializers, void 0); // GST Identification Number (15 characters)
            this.legalNameOfBusiness = __runInitializers(this, _legalNameOfBusiness_initializers, void 0); // Legal name as per GST registration
            this.tradeName = __runInitializers(this, _tradeName_initializers, void 0); // Trade name of the business
            this.address = __runInitializers(this, _address_initializers, void 0); // Principal place of business
            this.stateCode = __runInitializers(this, _stateCode_initializers, void 0); // State code (first 2 digits of GSTIN)
            this.state = __runInitializers(this, _state_initializers, void 0); // State name
            this.registrationDate = __runInitializers(this, _registrationDate_initializers, void 0); // Date of GST registration
            this.cancellationDate = __runInitializers(this, _cancellationDate_initializers, void 0); // Date of GST cancellation (if applicable)
            this.isActive = __runInitializers(this, _isActive_initializers, void 0); // Whether GST registration is active
            this.email = __runInitializers(this, _email_initializers, void 0); // Email for GST communications
            this.phone = __runInitializers(this, _phone_initializers, void 0); // Phone number for GST communications
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            this.updatedAt = __runInitializers(this, _updatedAt_initializers, void 0);
        }
        return RestaurantGSTEntity_1;
    }());
    __setFunctionName(_classThis, "RestaurantGSTEntity");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _restaurant_decorators = [(0, typeorm_1.ManyToOne)(function () { return restaurant_entity_1.RestaurantEntity; }, function (restaurant) { return restaurant.gstDetail; })];
        _restaurantId_decorators = [(0, typeorm_1.RelationId)(function (restaurantGst) { return restaurantGst.restaurant; })];
        _gstin_decorators = [(0, typeorm_1.Column)({ unique: true })];
        _legalNameOfBusiness_decorators = [(0, typeorm_1.Column)()];
        _tradeName_decorators = [(0, typeorm_1.Column)()];
        _address_decorators = [(0, typeorm_1.Column)()];
        _stateCode_decorators = [(0, typeorm_1.Column)()];
        _state_decorators = [(0, typeorm_1.Column)()];
        _registrationDate_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _cancellationDate_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _isActive_decorators = [(0, typeorm_1.Column)({ default: true })];
        _email_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _phone_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _restaurant_decorators, { kind: "field", name: "restaurant", static: false, private: false, access: { has: function (obj) { return "restaurant" in obj; }, get: function (obj) { return obj.restaurant; }, set: function (obj, value) { obj.restaurant = value; } }, metadata: _metadata }, _restaurant_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _restaurantId_decorators, { kind: "field", name: "restaurantId", static: false, private: false, access: { has: function (obj) { return "restaurantId" in obj; }, get: function (obj) { return obj.restaurantId; }, set: function (obj, value) { obj.restaurantId = value; } }, metadata: _metadata }, _restaurantId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _gstin_decorators, { kind: "field", name: "gstin", static: false, private: false, access: { has: function (obj) { return "gstin" in obj; }, get: function (obj) { return obj.gstin; }, set: function (obj, value) { obj.gstin = value; } }, metadata: _metadata }, _gstin_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _legalNameOfBusiness_decorators, { kind: "field", name: "legalNameOfBusiness", static: false, private: false, access: { has: function (obj) { return "legalNameOfBusiness" in obj; }, get: function (obj) { return obj.legalNameOfBusiness; }, set: function (obj, value) { obj.legalNameOfBusiness = value; } }, metadata: _metadata }, _legalNameOfBusiness_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _tradeName_decorators, { kind: "field", name: "tradeName", static: false, private: false, access: { has: function (obj) { return "tradeName" in obj; }, get: function (obj) { return obj.tradeName; }, set: function (obj, value) { obj.tradeName = value; } }, metadata: _metadata }, _tradeName_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _address_decorators, { kind: "field", name: "address", static: false, private: false, access: { has: function (obj) { return "address" in obj; }, get: function (obj) { return obj.address; }, set: function (obj, value) { obj.address = value; } }, metadata: _metadata }, _address_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _stateCode_decorators, { kind: "field", name: "stateCode", static: false, private: false, access: { has: function (obj) { return "stateCode" in obj; }, get: function (obj) { return obj.stateCode; }, set: function (obj, value) { obj.stateCode = value; } }, metadata: _metadata }, _stateCode_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _state_decorators, { kind: "field", name: "state", static: false, private: false, access: { has: function (obj) { return "state" in obj; }, get: function (obj) { return obj.state; }, set: function (obj, value) { obj.state = value; } }, metadata: _metadata }, _state_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _registrationDate_decorators, { kind: "field", name: "registrationDate", static: false, private: false, access: { has: function (obj) { return "registrationDate" in obj; }, get: function (obj) { return obj.registrationDate; }, set: function (obj, value) { obj.registrationDate = value; } }, metadata: _metadata }, _registrationDate_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _cancellationDate_decorators, { kind: "field", name: "cancellationDate", static: false, private: false, access: { has: function (obj) { return "cancellationDate" in obj; }, get: function (obj) { return obj.cancellationDate; }, set: function (obj, value) { obj.cancellationDate = value; } }, metadata: _metadata }, _cancellationDate_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: function (obj) { return "isActive" in obj; }, get: function (obj) { return obj.isActive; }, set: function (obj, value) { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: function (obj) { return "phone" in obj; }, get: function (obj) { return obj.phone; }, set: function (obj, value) { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RestaurantGSTEntity = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RestaurantGSTEntity = _classThis;
}();
exports.RestaurantGSTEntity = RestaurantGSTEntity;
