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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
let AdminController = (() => {
    let _classDecorators = [(0, common_1.Controller)('admin')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getStats_decorators;
    let _getFullStats_decorators;
    let _getOrders_decorators;
    let _banUser_decorators;
    var AdminController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getStats_decorators = [(0, common_1.Get)('dashboard')];
            _getFullStats_decorators = [(0, common_1.Get)('stats')];
            _getOrders_decorators = [(0, common_1.Get)('orders')];
            _banUser_decorators = [(0, common_1.Post)('users/ban')];
            __esDecorate(this, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getFullStats_decorators, { kind: "method", name: "getFullStats", static: false, private: false, access: { has: obj => "getFullStats" in obj, get: obj => obj.getFullStats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getOrders_decorators, { kind: "method", name: "getOrders", static: false, private: false, access: { has: obj => "getOrders" in obj, get: obj => obj.getOrders }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _banUser_decorators, { kind: "method", name: "banUser", static: false, private: false, access: { has: obj => "banUser" in obj, get: obj => obj.banUser }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AdminController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        adminService = __runInitializers(this, _instanceExtraInitializers);
        constructor(adminService) {
            this.adminService = adminService;
        }
        async getStats(query) {
            return this.adminService.getDashboardStats(query.branchId);
        }
        async getFullStats(query) {
            return this.adminService.getDashboardStats(query.branchId);
        }
        async getOrders(page, limit) {
            return this.adminService.getAllOrders(Number(page) || 1, Number(limit) || 10);
        }
        async banUser(body, req) {
            return this.adminService.banUser(body.userId, body.reason);
        }
    };
    return AdminController = _classThis;
})();
exports.AdminController = AdminController;
