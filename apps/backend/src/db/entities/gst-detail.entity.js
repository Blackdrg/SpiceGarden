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
exports.GSTDetailEntity = void 0;
var typeorm_1 = require("typeorm");
var order_entity_1 = require("./order.entity");
var GSTDetailEntity = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('gst_details')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _order_decorators;
    var _order_initializers = [];
    var _orderId_decorators;
    var _orderId_initializers = [];
    var _taxableValue_decorators;
    var _taxableValue_initializers = [];
    var _cgstRate_decorators;
    var _cgstRate_initializers = [];
    var _cgstAmount_decorators;
    var _cgstAmount_initializers = [];
    var _sgstRate_decorators;
    var _sgstRate_initializers = [];
    var _sgstAmount_decorators;
    var _sgstAmount_initializers = [];
    var _igstRate_decorators;
    var _igstRate_initializers = [];
    var _igstAmount_decorators;
    var _igstAmount_initializers = [];
    var _totalGstAmount_decorators;
    var _totalGstAmount_initializers = [];
    var _totalAmount_decorators;
    var _totalAmount_initializers = [];
    var _placeOfSupply_decorators;
    var _placeOfSupply_initializers = [];
    var _reverseChargeApplicable_decorators;
    var _reverseChargeApplicable_initializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var GSTDetailEntity = _classThis = /** @class */ (function () {
        function GSTDetailEntity_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.order = __runInitializers(this, _order_initializers, void 0);
            this.orderId = __runInitializers(this, _orderId_initializers, void 0);
            this.taxableValue = __runInitializers(this, _taxableValue_initializers, void 0); // Amount on which GST is calculated
            // CGST (Central GST)
            this.cgstRate = __runInitializers(this, _cgstRate_initializers, void 0); // Percentage
            this.cgstAmount = __runInitializers(this, _cgstAmount_initializers, void 0);
            // SGST/UTGST (State GST/Union Territory GST)
            this.sgstRate = __runInitializers(this, _sgstRate_initializers, void 0); // Percentage
            this.sgstAmount = __runInitializers(this, _sgstAmount_initializers, void 0);
            // IGST (Integrated GST) - for inter-state transactions
            this.igstRate = __runInitializers(this, _igstRate_initializers, void 0); // Percentage
            this.igstAmount = __runInitializers(this, _igstAmount_initializers, void 0);
            this.totalGstAmount = __runInitializers(this, _totalGstAmount_initializers, void 0); // Total GST (CGST + SGST + IGST)
            this.totalAmount = __runInitializers(this, _totalAmount_initializers, void 0); // Taxable value + Total GST
            this.placeOfSupply = __runInitializers(this, _placeOfSupply_initializers, void 0); // State code where supply is made
            this.reverseChargeApplicable = __runInitializers(this, _reverseChargeApplicable_initializers, void 0); // Whether GST is payable under reverse charge
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
        }
        return GSTDetailEntity_1;
    }());
    __setFunctionName(_classThis, "GSTDetailEntity");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _order_decorators = [(0, typeorm_1.ManyToOne)(function () { return order_entity_1.OrderEntity; }, function (order) { return order.gstDetail; })];
        _orderId_decorators = [(0, typeorm_1.RelationId)(function (gstDetail) { return gstDetail.order; })];
        _taxableValue_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 })];
        _cgstRate_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _cgstAmount_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true })];
        _sgstRate_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _sgstAmount_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true })];
        _igstRate_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _igstAmount_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true })];
        _totalGstAmount_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 })];
        _totalAmount_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 })];
        _placeOfSupply_decorators = [(0, typeorm_1.Column)()];
        _reverseChargeApplicable_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: function (obj) { return "order" in obj; }, get: function (obj) { return obj.order; }, set: function (obj, value) { obj.order = value; } }, metadata: _metadata }, _order_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: function (obj) { return "orderId" in obj; }, get: function (obj) { return obj.orderId; }, set: function (obj, value) { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _taxableValue_decorators, { kind: "field", name: "taxableValue", static: false, private: false, access: { has: function (obj) { return "taxableValue" in obj; }, get: function (obj) { return obj.taxableValue; }, set: function (obj, value) { obj.taxableValue = value; } }, metadata: _metadata }, _taxableValue_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _cgstRate_decorators, { kind: "field", name: "cgstRate", static: false, private: false, access: { has: function (obj) { return "cgstRate" in obj; }, get: function (obj) { return obj.cgstRate; }, set: function (obj, value) { obj.cgstRate = value; } }, metadata: _metadata }, _cgstRate_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _cgstAmount_decorators, { kind: "field", name: "cgstAmount", static: false, private: false, access: { has: function (obj) { return "cgstAmount" in obj; }, get: function (obj) { return obj.cgstAmount; }, set: function (obj, value) { obj.cgstAmount = value; } }, metadata: _metadata }, _cgstAmount_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _sgstRate_decorators, { kind: "field", name: "sgstRate", static: false, private: false, access: { has: function (obj) { return "sgstRate" in obj; }, get: function (obj) { return obj.sgstRate; }, set: function (obj, value) { obj.sgstRate = value; } }, metadata: _metadata }, _sgstRate_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _sgstAmount_decorators, { kind: "field", name: "sgstAmount", static: false, private: false, access: { has: function (obj) { return "sgstAmount" in obj; }, get: function (obj) { return obj.sgstAmount; }, set: function (obj, value) { obj.sgstAmount = value; } }, metadata: _metadata }, _sgstAmount_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _igstRate_decorators, { kind: "field", name: "igstRate", static: false, private: false, access: { has: function (obj) { return "igstRate" in obj; }, get: function (obj) { return obj.igstRate; }, set: function (obj, value) { obj.igstRate = value; } }, metadata: _metadata }, _igstRate_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _igstAmount_decorators, { kind: "field", name: "igstAmount", static: false, private: false, access: { has: function (obj) { return "igstAmount" in obj; }, get: function (obj) { return obj.igstAmount; }, set: function (obj, value) { obj.igstAmount = value; } }, metadata: _metadata }, _igstAmount_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _totalGstAmount_decorators, { kind: "field", name: "totalGstAmount", static: false, private: false, access: { has: function (obj) { return "totalGstAmount" in obj; }, get: function (obj) { return obj.totalGstAmount; }, set: function (obj, value) { obj.totalGstAmount = value; } }, metadata: _metadata }, _totalGstAmount_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _totalAmount_decorators, { kind: "field", name: "totalAmount", static: false, private: false, access: { has: function (obj) { return "totalAmount" in obj; }, get: function (obj) { return obj.totalAmount; }, set: function (obj, value) { obj.totalAmount = value; } }, metadata: _metadata }, _totalAmount_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _placeOfSupply_decorators, { kind: "field", name: "placeOfSupply", static: false, private: false, access: { has: function (obj) { return "placeOfSupply" in obj; }, get: function (obj) { return obj.placeOfSupply; }, set: function (obj, value) { obj.placeOfSupply = value; } }, metadata: _metadata }, _placeOfSupply_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _reverseChargeApplicable_decorators, { kind: "field", name: "reverseChargeApplicable", static: false, private: false, access: { has: function (obj) { return "reverseChargeApplicable" in obj; }, get: function (obj) { return obj.reverseChargeApplicable; }, set: function (obj, value) { obj.reverseChargeApplicable = value; } }, metadata: _metadata }, _reverseChargeApplicable_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GSTDetailEntity = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GSTDetailEntity = _classThis;
}();
exports.GSTDetailEntity = GSTDetailEntity;
