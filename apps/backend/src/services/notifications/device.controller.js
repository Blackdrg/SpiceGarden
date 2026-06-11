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
exports.DeviceController = void 0;
const common_1 = require("@nestjs/common");
let DeviceController = (() => {
    let _classDecorators = [(0, common_1.Controller)('devices')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _registerDevice_decorators;
    let _unregisterDevice_decorators;
    var DeviceController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _registerDevice_decorators = [(0, common_1.Post)('register'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            _unregisterDevice_decorators = [(0, common_1.Delete)('unregister'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
            __esDecorate(this, null, _registerDevice_decorators, { kind: "method", name: "registerDevice", static: false, private: false, access: { has: obj => "registerDevice" in obj, get: obj => obj.registerDevice }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _unregisterDevice_decorators, { kind: "method", name: "unregisterDevice", static: false, private: false, access: { has: obj => "unregisterDevice" in obj, get: obj => obj.unregisterDevice }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DeviceController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        notificationService = __runInitializers(this, _instanceExtraInitializers);
        constructor(notificationService) {
            this.notificationService = notificationService;
        }
        async registerDevice(body) {
            const { userId, fcmToken, apnsToken, deviceInfo } = body;
            if (fcmToken) {
                await this.notificationService.registerDevice(userId, fcmToken, deviceInfo);
            }
            if (apnsToken) {
                await this.notificationService.registerDevice(userId, apnsToken, { ...deviceInfo, type: 'ios' });
            }
            return { success: true, message: 'Device registered successfully' };
        }
        async unregisterDevice(body) {
            const { userId, fcmToken, apnsToken } = body;
            if (fcmToken) {
                await this.notificationService.unregisterDevice(userId, fcmToken);
            }
            if (apnsToken) {
                await this.notificationService.unregisterDevice(userId, apnsToken);
            }
            return { success: true, message: 'Device unregistered successfully' };
        }
    };
    return DeviceController = _classThis;
})();
exports.DeviceController = DeviceController;
