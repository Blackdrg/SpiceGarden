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
exports.HSNSACEntity = void 0;
var typeorm_1 = require("typeorm");
var menu_item_entity_1 = require("./menu-item.entity");
var HSNSACEntity = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('hsn_sac_codes')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _menuItem_decorators;
    var _menuItem_initializers = [];
    var _menuItemId_decorators;
    var _menuItemId_initializers = [];
    var _hsnCode_decorators;
    var _hsnCode_initializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _gstRate_decorators;
    var _gstRate_initializers = [];
    var _effectiveFrom_decorators;
    var _effectiveFrom_initializers = [];
    var _effectiveTo_decorators;
    var _effectiveTo_initializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var HSNSACEntity = _classThis = /** @class */ (function () {
        function HSNSACEntity_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.menuItem = __runInitializers(this, _menuItem_initializers, void 0);
            this.menuItemId = __runInitializers(this, _menuItemId_initializers, void 0);
            this.hsnCode = __runInitializers(this, _hsnCode_initializers, void 0); // HSN code for goods (6 digits) or SAC code for services (6 digits)
            this.description = __runInitializers(this, _description_initializers, void 0); // Description of goods/services
            this.gstRate = __runInitializers(this, _gstRate_initializers, void 0); // Default GST rate for this HSN/SAC code (%)
            this.effectiveFrom = __runInitializers(this, _effectiveFrom_initializers, void 0); // Date from which this code/rate is effective
            this.effectiveTo = __runInitializers(this, _effectiveTo_initializers, void 0); // Date until which this code/rate is effective
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            this.updatedAt = __runInitializers(this, _updatedAt_initializers, void 0);
        }
        return HSNSACEntity_1;
    }());
    __setFunctionName(_classThis, "HSNSACEntity");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _menuItem_decorators = [(0, typeorm_1.ManyToOne)(function () { return menu_item_entity_1.MenuItemEntity; }, function (menuItem) { return menuItem.hsnSac; })];
        _menuItemId_decorators = [(0, typeorm_1.RelationId)(function (hsnSac) { return hsnSac.menuItem; })];
        _hsnCode_decorators = [(0, typeorm_1.Column)()];
        _description_decorators = [(0, typeorm_1.Column)()];
        _gstRate_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _effectiveFrom_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _effectiveTo_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _menuItem_decorators, { kind: "field", name: "menuItem", static: false, private: false, access: { has: function (obj) { return "menuItem" in obj; }, get: function (obj) { return obj.menuItem; }, set: function (obj, value) { obj.menuItem = value; } }, metadata: _metadata }, _menuItem_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _menuItemId_decorators, { kind: "field", name: "menuItemId", static: false, private: false, access: { has: function (obj) { return "menuItemId" in obj; }, get: function (obj) { return obj.menuItemId; }, set: function (obj, value) { obj.menuItemId = value; } }, metadata: _metadata }, _menuItemId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _hsnCode_decorators, { kind: "field", name: "hsnCode", static: false, private: false, access: { has: function (obj) { return "hsnCode" in obj; }, get: function (obj) { return obj.hsnCode; }, set: function (obj, value) { obj.hsnCode = value; } }, metadata: _metadata }, _hsnCode_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _gstRate_decorators, { kind: "field", name: "gstRate", static: false, private: false, access: { has: function (obj) { return "gstRate" in obj; }, get: function (obj) { return obj.gstRate; }, set: function (obj, value) { obj.gstRate = value; } }, metadata: _metadata }, _gstRate_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _effectiveFrom_decorators, { kind: "field", name: "effectiveFrom", static: false, private: false, access: { has: function (obj) { return "effectiveFrom" in obj; }, get: function (obj) { return obj.effectiveFrom; }, set: function (obj, value) { obj.effectiveFrom = value; } }, metadata: _metadata }, _effectiveFrom_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _effectiveTo_decorators, { kind: "field", name: "effectiveTo", static: false, private: false, access: { has: function (obj) { return "effectiveTo" in obj; }, get: function (obj) { return obj.effectiveTo; }, set: function (obj, value) { obj.effectiveTo = value; } }, metadata: _metadata }, _effectiveTo_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        HSNSACEntity = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return HSNSACEntity = _classThis;
}();
exports.HSNSACEntity = HSNSACEntity;
