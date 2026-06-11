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
exports.MenuItemEntity = void 0;
var typeorm_1 = require("typeorm");
var menu_category_entity_1 = require("./menu-category.entity");
var hsn_sac_entity_1 = require("./hsn-sac.entity");
var menu_addon_entity_1 = require("./menu-addon.entity");
var MenuItemEntity = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('menu_items')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _basePrice_decorators;
    var _basePrice_initializers = [];
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _isVeg_decorators;
    var _isVeg_initializers = [];
    var _spiceLevel_decorators;
    var _spiceLevel_initializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _category_decorators;
    var _category_initializers = [];
    var _hsnSacId_decorators;
    var _hsnSacId_initializers = [];
    var _hsnSac_decorators;
    var _hsnSac_initializers = [];
    var _addons_decorators;
    var _addons_initializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var MenuItemEntity = _classThis = /** @class */ (function () {
        function MenuItemEntity_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.name = __runInitializers(this, _name_initializers, void 0);
            this.description = __runInitializers(this, _description_initializers, void 0);
            this.basePrice = __runInitializers(this, _basePrice_initializers, void 0);
            this.imageUrl = __runInitializers(this, _imageUrl_initializers, void 0);
            this.isVeg = __runInitializers(this, _isVeg_initializers, void 0);
            this.spiceLevel = __runInitializers(this, _spiceLevel_initializers, void 0);
            this.status = __runInitializers(this, _status_initializers, void 0);
            this.category = __runInitializers(this, _category_initializers, void 0);
            this.hsnSacId = __runInitializers(this, _hsnSacId_initializers, void 0); // Reference to HSN/SAC code
            this.hsnSac = __runInitializers(this, _hsnSac_initializers, void 0);
            this.addons = __runInitializers(this, _addons_initializers, void 0);
            this.createdAt = __runInitializers(this, _createdAt_initializers, void 0);
            this.updatedAt = __runInitializers(this, _updatedAt_initializers, void 0);
        }
        return MenuItemEntity_1;
    }());
    __setFunctionName(_classThis, "MenuItemEntity");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _name_decorators = [(0, typeorm_1.Column)()];
        _description_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _basePrice_decorators = [(0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 })];
        _imageUrl_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _isVeg_decorators = [(0, typeorm_1.Column)({ default: true })];
        _spiceLevel_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _status_decorators = [(0, typeorm_1.Column)({ default: 'available' })];
        _category_decorators = [(0, typeorm_1.ManyToOne)(function () { return menu_category_entity_1.MenuCategoryEntity; }, function (category) { return category.items; })];
        _hsnSacId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _hsnSac_decorators = [(0, typeorm_1.ManyToOne)(function () { return hsn_sac_entity_1.HSNSACEntity; }, { nullable: true })];
        _addons_decorators = [(0, typeorm_1.OneToMany)(function () { return menu_addon_entity_1.MenuAddonEntity; }, function (addon) { return addon.menuItem; })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _basePrice_decorators, { kind: "field", name: "basePrice", static: false, private: false, access: { has: function (obj) { return "basePrice" in obj; }, get: function (obj) { return obj.basePrice; }, set: function (obj, value) { obj.basePrice = value; } }, metadata: _metadata }, _basePrice_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _isVeg_decorators, { kind: "field", name: "isVeg", static: false, private: false, access: { has: function (obj) { return "isVeg" in obj; }, get: function (obj) { return obj.isVeg; }, set: function (obj, value) { obj.isVeg = value; } }, metadata: _metadata }, _isVeg_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _spiceLevel_decorators, { kind: "field", name: "spiceLevel", static: false, private: false, access: { has: function (obj) { return "spiceLevel" in obj; }, get: function (obj) { return obj.spiceLevel; }, set: function (obj, value) { obj.spiceLevel = value; } }, metadata: _metadata }, _spiceLevel_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: function (obj) { return "category" in obj; }, get: function (obj) { return obj.category; }, set: function (obj, value) { obj.category = value; } }, metadata: _metadata }, _category_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _hsnSacId_decorators, { kind: "field", name: "hsnSacId", static: false, private: false, access: { has: function (obj) { return "hsnSacId" in obj; }, get: function (obj) { return obj.hsnSacId; }, set: function (obj, value) { obj.hsnSacId = value; } }, metadata: _metadata }, _hsnSacId_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _hsnSac_decorators, { kind: "field", name: "hsnSac", static: false, private: false, access: { has: function (obj) { return "hsnSac" in obj; }, get: function (obj) { return obj.hsnSac; }, set: function (obj, value) { obj.hsnSac = value; } }, metadata: _metadata }, _hsnSac_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _addons_decorators, { kind: "field", name: "addons", static: false, private: false, access: { has: function (obj) { return "addons" in obj; }, get: function (obj) { return obj.addons; }, set: function (obj, value) { obj.addons = value; } }, metadata: _metadata }, _addons_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MenuItemEntity = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MenuItemEntity = _classThis;
}();
exports.MenuItemEntity = MenuItemEntity;
