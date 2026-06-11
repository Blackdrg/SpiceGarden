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
exports.OrderItemEntity = void 0;
var typeorm_1 = require("typeorm");
var order_entity_1 = require("./order.entity");
var menu_item_entity_1 = require("./menu-item.entity");
var hsn_sac_entity_1 = require("./hsn-sac.entity");
var OrderItemEntity = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('order_items')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _orderId_decorators;
    var _orderId_initializers = [];
    var _order_decorators;
    var _order_initializers = [];
    var _menuItemId_decorators;
    var _menuItemId_initializers = [];
    var _menuItem_decorators;
    var _menuItem_initializers = [];
    var _hsnSacId_decorators;
    var _hsnSacId_initializers = [];
    var _hsnSac_decorators;
    var _hsnSac_initializers = [];
    var _quantity_decorators;
    var _quantity_initializers = [];
    var _unitPrice_decorators;
    var _unitPrice_initializers = [];
    var _totalPrice_decorators;
    var _totalPrice_initializers = [];
    var _instructions_decorators;
    var _instructions_initializers = [];
    var _variants_decorators;
    var _variants_initializers = [];
    var _addons_decorators;
    var _addons_initializers = [];
    var _cgstRate_decorators;
    var _cgstRate_initializers = [];
    var _sgstRate_decorators;
    var _sgstRate_initializers = [];
    var _igstRate_decorators;
    var _igstRate_initializers = [];
    var _cgstAmount_decorators;
    var _cgstAmount_initializers = [];
    var _sgstAmount_decorators;
    var _sgstAmount_initializers = [];
    var _igstAmount_decorators;
    var _igstAmount_initializers = [];
    var _totalTax_decorators;
    var _totalTax_initializers = [];
    var _totalAmount_decorators;
    var _totalAmount_initializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var OrderItemEntity = _classThis = /** @class */ (function () {
        function OrderItemEntity_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.orderId = __runInitializers(this, _orderId_initializers, void 0);
            this.order = __runInitializers(this, _order_initializers, void 0);
            this.menuItemId = __runInitializers(this, _menuItemId_initializers, void 0);
            this.menuItem = __runInitializers(this, _menuItem_initializers, void 0);
            this.hsnSacId = __runInitializers(this, _hsnSacId_initializers, void 0); // Reference to HSN/SAC code
            this.hsnSac = __runInitializers(this, _hsnSac_initializers, void 0);
            this.quantity = __runInitializers(this, _quantity_initializers, void 0);
            this.unitPrice = __runInitializers(this, _unitPrice_initializers, void 0); // Price per unit before tax
            this.totalPrice = __runInitializers(this, _totalPrice_initializers, void 0); // Total price for quantity (unitPrice * quantity) before tax
            this.instructions = __runInitializers(this, _instructions_initializers, void 0);
            this.variants = __runInitializers(this, _variants_initializers, void 0);
            this.addons = __runInitializers(this, _addons_initializers, void 0);
            // Tax breakdown for this item
            this.cgstRate = __runInitializers(this, _cgstRate_initializers, void 0); // CGST rate (%)
            this.sgstRate = __runInitializers(this, _sgstRate_initializers, void 0); // SGST rate (%)
            this.igstRate = __runInitializers(this, _igstRate_initializers, void 0); // IGST rate (%)
            this.cgstAmount = __runInitializers(this, _cgstAmount_initializers, void 0); // CGST amount
            this.sgstAmount = __runInitializers(this, _sgstAmount_initializers, void 0); // SGST amount
            this.igstAmount = __runInitializers(this, _igstAmount_initializers, void 0); // IGST amount
            this.totalTax = __runInitializers(this, _totalTax_initializers, void 0); // Total tax amount for this item
            this.totalAmount = __runInitializers(this, _totalAmount_initializers, void 0); // Total amount for this item (totalPrice + totalTax)
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            this.updatedAt = __runInitializers(this, _updatedAt_initializers, void 0);
        }
        return OrderItemEntity_1;
    }());
    __setFunctionName(_classThis, "OrderItemEntity");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _orderId_decorators = [(0, typeorm_1.Column)()];
        _order_decorators = [(0, typeorm_1.ManyToOne)(function () { return order_entity_1.OrderEntity; })];
        _menuItemId_decorators = [(0, typeorm_1.Column)()];
        _menuItem_decorators = [(0, typeorm_1.ManyToOne)(function () { return menu_item_entity_1.MenuItemEntity; })];
        _hsnSacId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _hsnSac_decorators = [(0, typeorm_1.ManyToOne)(function () { return hsn_sac_entity_1.HSNSACEntity; }, { nullable: true })];
        _quantity_decorators = [(0, typeorm_1.Column)()];
        _unitPrice_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 })];
        _totalPrice_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 })];
        _instructions_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _variants_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _addons_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', nullable: true })];
        _cgstRate_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 })];
        _sgstRate_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 })];
        _igstRate_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 })];
        _cgstAmount_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 })];
        _sgstAmount_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 })];
        _igstAmount_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 })];
        _totalTax_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0 })];
        _totalAmount_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: function (obj) { return "orderId" in obj; }, get: function (obj) { return obj.orderId; }, set: function (obj, value) { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: function (obj) { return "order" in obj; }, get: function (obj) { return obj.order; }, set: function (obj, value) { obj.order = value; } }, metadata: _metadata }, _order_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _menuItemId_decorators, { kind: "field", name: "menuItemId", static: false, private: false, access: { has: function (obj) { return "menuItemId" in obj; }, get: function (obj) { return obj.menuItemId; }, set: function (obj, value) { obj.menuItemId = value; } }, metadata: _metadata }, _menuItemId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _menuItem_decorators, { kind: "field", name: "menuItem", static: false, private: false, access: { has: function (obj) { return "menuItem" in obj; }, get: function (obj) { return obj.menuItem; }, set: function (obj, value) { obj.menuItem = value; } }, metadata: _metadata }, _menuItem_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _hsnSacId_decorators, { kind: "field", name: "hsnSacId", static: false, private: false, access: { has: function (obj) { return "hsnSacId" in obj; }, get: function (obj) { return obj.hsnSacId; }, set: function (obj, value) { obj.hsnSacId = value; } }, metadata: _metadata }, _hsnSacId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _hsnSac_decorators, { kind: "field", name: "hsnSac", static: false, private: false, access: { has: function (obj) { return "hsnSac" in obj; }, get: function (obj) { return obj.hsnSac; }, set: function (obj, value) { obj.hsnSac = value; } }, metadata: _metadata }, _hsnSac_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: function (obj) { return "quantity" in obj; }, get: function (obj) { return obj.quantity; }, set: function (obj, value) { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: function (obj) { return "unitPrice" in obj; }, get: function (obj) { return obj.unitPrice; }, set: function (obj, value) { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _totalPrice_decorators, { kind: "field", name: "totalPrice", static: false, private: false, access: { has: function (obj) { return "totalPrice" in obj; }, get: function (obj) { return obj.totalPrice; }, set: function (obj, value) { obj.totalPrice = value; } }, metadata: _metadata }, _totalPrice_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _instructions_decorators, { kind: "field", name: "instructions", static: false, private: false, access: { has: function (obj) { return "instructions" in obj; }, get: function (obj) { return obj.instructions; }, set: function (obj, value) { obj.instructions = value; } }, metadata: _metadata }, _instructions_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _variants_decorators, { kind: "field", name: "variants", static: false, private: false, access: { has: function (obj) { return "variants" in obj; }, get: function (obj) { return obj.variants; }, set: function (obj, value) { obj.variants = value; } }, metadata: _metadata }, _variants_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _addons_decorators, { kind: "field", name: "addons", static: false, private: false, access: { has: function (obj) { return "addons" in obj; }, get: function (obj) { return obj.addons; }, set: function (obj, value) { obj.addons = value; } }, metadata: _metadata }, _addons_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _cgstRate_decorators, { kind: "field", name: "cgstRate", static: false, private: false, access: { has: function (obj) { return "cgstRate" in obj; }, get: function (obj) { return obj.cgstRate; }, set: function (obj, value) { obj.cgstRate = value; } }, metadata: _metadata }, _cgstRate_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _sgstRate_decorators, { kind: "field", name: "sgstRate", static: false, private: false, access: { has: function (obj) { return "sgstRate" in obj; }, get: function (obj) { return obj.sgstRate; }, set: function (obj, value) { obj.sgstRate = value; } }, metadata: _metadata }, _sgstRate_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _igstRate_decorators, { kind: "field", name: "igstRate", static: false, private: false, access: { has: function (obj) { return "igstRate" in obj; }, get: function (obj) { return obj.igstRate; }, set: function (obj, value) { obj.igstRate = value; } }, metadata: _metadata }, _igstRate_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _cgstAmount_decorators, { kind: "field", name: "cgstAmount", static: false, private: false, access: { has: function (obj) { return "cgstAmount" in obj; }, get: function (obj) { return obj.cgstAmount; }, set: function (obj, value) { obj.cgstAmount = value; } }, metadata: _metadata }, _cgstAmount_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _sgstAmount_decorators, { kind: "field", name: "sgstAmount", static: false, private: false, access: { has: function (obj) { return "sgstAmount" in obj; }, get: function (obj) { return obj.sgstAmount; }, set: function (obj, value) { obj.sgstAmount = value; } }, metadata: _metadata }, _sgstAmount_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _igstAmount_decorators, { kind: "field", name: "igstAmount", static: false, private: false, access: { has: function (obj) { return "igstAmount" in obj; }, get: function (obj) { return obj.igstAmount; }, set: function (obj, value) { obj.igstAmount = value; } }, metadata: _metadata }, _igstAmount_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _totalTax_decorators, { kind: "field", name: "totalTax", static: false, private: false, access: { has: function (obj) { return "totalTax" in obj; }, get: function (obj) { return obj.totalTax; }, set: function (obj, value) { obj.totalTax = value; } }, metadata: _metadata }, _totalTax_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _totalAmount_decorators, { kind: "field", name: "totalAmount", static: false, private: false, access: { has: function (obj) { return "totalAmount" in obj; }, get: function (obj) { return obj.totalAmount; }, set: function (obj, value) { obj.totalAmount = value; } }, metadata: _metadata }, _totalAmount_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OrderItemEntity = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OrderItemEntity = _classThis;
}();
exports.OrderItemEntity = OrderItemEntity;
