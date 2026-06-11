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
exports.RestaurantController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let RestaurantController = (() => {
    let _classDecorators = [(0, common_1.Controller)('restaurants')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getAll_decorators;
    let _search_decorators;
    let _getNearby_decorators;
    let _getDetails_decorators;
    let _updateStatus_decorators;
    var RestaurantController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getAll_decorators = [(0, common_1.Get)()];
            _search_decorators = [(0, common_1.Get)('search')];
            _getNearby_decorators = [(0, common_1.Get)('nearby')];
            _getDetails_decorators = [(0, common_1.Get)(':slug')];
            _updateStatus_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(user_interface_1.UserRole.RESTAURANT, user_interface_1.UserRole.ADMIN), (0, common_1.Put)('branch/:id/status')];
            __esDecorate(this, null, _getAll_decorators, { kind: "method", name: "getAll", static: false, private: false, access: { has: obj => "getAll" in obj, get: obj => obj.getAll }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _search_decorators, { kind: "method", name: "search", static: false, private: false, access: { has: obj => "search" in obj, get: obj => obj.search }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getNearby_decorators, { kind: "method", name: "getNearby", static: false, private: false, access: { has: obj => "getNearby" in obj, get: obj => obj.getNearby }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getDetails_decorators, { kind: "method", name: "getDetails", static: false, private: false, access: { has: obj => "getDetails" in obj, get: obj => obj.getDetails }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateStatus_decorators, { kind: "method", name: "updateStatus", static: false, private: false, access: { has: obj => "updateStatus" in obj, get: obj => obj.updateStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RestaurantController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        restaurantService = __runInitializers(this, _instanceExtraInitializers);
        constructor(restaurantService) {
            this.restaurantService = restaurantService;
        }
        async getAll() {
            return this.restaurantService.getAllRestaurants();
        }
        async search(query) {
            return this.restaurantService.searchRestaurants(query);
        }
        async getNearby(lat, lng, radius) {
            return this.restaurantService.findNearby(Number(lat), Number(lng), radius ? Number(radius) : undefined);
        }
        async getDetails(slug) {
            return this.restaurantService.getRestaurantDetails(slug);
        }
        async updateStatus(id, body) {
            return this.restaurantService.updateBranchStatus(id, body.isOnline);
        }
    };
    return RestaurantController = _classThis;
})();
exports.RestaurantController = RestaurantController;
