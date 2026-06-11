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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let WalletController = (() => {
    let _classDecorators = [(0, common_1.Controller)('wallet'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(user_interface_1.UserRole.CUSTOMER)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getWallet_decorators;
    let _getBalance_decorators;
    let _getTransactions_decorators;
    let _creditWallet_decorators;
    let _debitWallet_decorators;
    let _compensateUser_decorators;
    let _processCODPayment_decorators;
    let _confirmCODCollection_decorators;
    let _refundCOD_decorators;
    let _preventDuplicatePayment_decorators;
    var WalletController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getWallet_decorators = [(0, common_1.Get)()];
            _getBalance_decorators = [(0, common_1.Get)('balance')];
            _getTransactions_decorators = [(0, common_1.Get)('transactions')];
            _creditWallet_decorators = [(0, common_1.Post)('credit')];
            _debitWallet_decorators = [(0, common_1.Post)('debit')];
            _compensateUser_decorators = [(0, common_1.Post)('compensate')];
            _processCODPayment_decorators = [(0, common_1.Post)('cod/process')];
            _confirmCODCollection_decorators = [(0, common_1.Post)('cod/confirm')];
            _refundCOD_decorators = [(0, common_1.Post)('cod/refund')];
            _preventDuplicatePayment_decorators = [(0, common_1.Post)('prevent-duplicate')];
            __esDecorate(this, null, _getWallet_decorators, { kind: "method", name: "getWallet", static: false, private: false, access: { has: obj => "getWallet" in obj, get: obj => obj.getWallet }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getBalance_decorators, { kind: "method", name: "getBalance", static: false, private: false, access: { has: obj => "getBalance" in obj, get: obj => obj.getBalance }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getTransactions_decorators, { kind: "method", name: "getTransactions", static: false, private: false, access: { has: obj => "getTransactions" in obj, get: obj => obj.getTransactions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _creditWallet_decorators, { kind: "method", name: "creditWallet", static: false, private: false, access: { has: obj => "creditWallet" in obj, get: obj => obj.creditWallet }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _debitWallet_decorators, { kind: "method", name: "debitWallet", static: false, private: false, access: { has: obj => "debitWallet" in obj, get: obj => obj.debitWallet }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _compensateUser_decorators, { kind: "method", name: "compensateUser", static: false, private: false, access: { has: obj => "compensateUser" in obj, get: obj => obj.compensateUser }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _processCODPayment_decorators, { kind: "method", name: "processCODPayment", static: false, private: false, access: { has: obj => "processCODPayment" in obj, get: obj => obj.processCODPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _confirmCODCollection_decorators, { kind: "method", name: "confirmCODCollection", static: false, private: false, access: { has: obj => "confirmCODCollection" in obj, get: obj => obj.confirmCODCollection }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _refundCOD_decorators, { kind: "method", name: "refundCOD", static: false, private: false, access: { has: obj => "refundCOD" in obj, get: obj => obj.refundCOD }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _preventDuplicatePayment_decorators, { kind: "method", name: "preventDuplicatePayment", static: false, private: false, access: { has: obj => "preventDuplicatePayment" in obj, get: obj => obj.preventDuplicatePayment }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            WalletController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        walletService = __runInitializers(this, _instanceExtraInitializers);
        constructor(walletService) {
            this.walletService = walletService;
        }
        async getWallet(req) {
            return await this.walletService.getWallet(req.user.id);
        }
        async getBalance(req) {
            return await this.walletService.getWalletBalance(req.user.id);
        }
        async getTransactions(req, limit = 20, offset = 0) {
            return await this.walletService.getWalletTransactions(req.user.id, limit, offset);
        }
        async creditWallet(req, amount, description, referenceId) {
            return await this.walletService.creditWallet(req.user.id, amount, description, referenceId);
        }
        async debitWallet(req, amount, description, referenceId) {
            return await this.walletService.debitWallet(req.user.id, amount, description, referenceId);
        }
        async compensateUser(req, amount, reason) {
            return await this.walletService.compensateUser(req.user.id, amount, reason);
        }
        async processCODPayment(req, orderId, amount) {
            return await this.walletService.processCODPayment(orderId, amount, req.user.id);
        }
        async confirmCODCollection(req, orderId, amount) {
            return await this.walletService.confirmCODCollection(orderId, amount, req.user.id);
        }
        async refundCOD(req, orderId, amount, reason) {
            return await this.walletService.refundCOD(orderId, amount, req.user.id, reason);
        }
        async preventDuplicatePayment(req, orderId, amount) {
            const isAllowed = await this.walletService.preventDoublePayment(req.user.id, orderId, amount);
            return { allowed: isAllowed };
        }
    };
    return WalletController = _classThis;
})();
exports.WalletController = WalletController;
