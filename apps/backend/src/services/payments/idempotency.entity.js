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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyEntity = void 0;
const typeorm_1 = require("typeorm");
let IdempotencyEntity = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('idempotency_keys'), (0, typeorm_1.Index)(['key', 'operation'], { unique: true })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _key_decorators;
    let _key_initializers = [];
    let _key_extraInitializers = [];
    let _operation_decorators;
    let _operation_initializers = [];
    let _operation_extraInitializers = [];
    let _userId_decorators;
    let _userId_initializers = [];
    let _userId_extraInitializers = [];
    let _requestPayload_decorators;
    let _requestPayload_initializers = [];
    let _requestPayload_extraInitializers = [];
    let _responsePayload_decorators;
    let _responsePayload_initializers = [];
    let _responsePayload_extraInitializers = [];
    let _statusCode_decorators;
    let _statusCode_initializers = [];
    let _statusCode_extraInitializers = [];
    let _isCompleted_decorators;
    let _isCompleted_initializers = [];
    let _isCompleted_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _completedAt_decorators;
    let _completedAt_initializers = [];
    let _completedAt_extraInitializers = [];
    var IdempotencyEntity = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
            _key_decorators = [(0, typeorm_1.Column)()];
            _operation_decorators = [(0, typeorm_1.Column)()];
            _userId_decorators = [(0, typeorm_1.Column)()];
            _requestPayload_decorators = [(0, typeorm_1.Column)('jsonb')];
            _responsePayload_decorators = [(0, typeorm_1.Column)('jsonb', { nullable: true })];
            _statusCode_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _isCompleted_decorators = [(0, typeorm_1.Column)({ default: false })];
            _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
            _completedAt_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _key_decorators, { kind: "field", name: "key", static: false, private: false, access: { has: obj => "key" in obj, get: obj => obj.key, set: (obj, value) => { obj.key = value; } }, metadata: _metadata }, _key_initializers, _key_extraInitializers);
            __esDecorate(null, null, _operation_decorators, { kind: "field", name: "operation", static: false, private: false, access: { has: obj => "operation" in obj, get: obj => obj.operation, set: (obj, value) => { obj.operation = value; } }, metadata: _metadata }, _operation_initializers, _operation_extraInitializers);
            __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: obj => "userId" in obj, get: obj => obj.userId, set: (obj, value) => { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
            __esDecorate(null, null, _requestPayload_decorators, { kind: "field", name: "requestPayload", static: false, private: false, access: { has: obj => "requestPayload" in obj, get: obj => obj.requestPayload, set: (obj, value) => { obj.requestPayload = value; } }, metadata: _metadata }, _requestPayload_initializers, _requestPayload_extraInitializers);
            __esDecorate(null, null, _responsePayload_decorators, { kind: "field", name: "responsePayload", static: false, private: false, access: { has: obj => "responsePayload" in obj, get: obj => obj.responsePayload, set: (obj, value) => { obj.responsePayload = value; } }, metadata: _metadata }, _responsePayload_initializers, _responsePayload_extraInitializers);
            __esDecorate(null, null, _statusCode_decorators, { kind: "field", name: "statusCode", static: false, private: false, access: { has: obj => "statusCode" in obj, get: obj => obj.statusCode, set: (obj, value) => { obj.statusCode = value; } }, metadata: _metadata }, _statusCode_initializers, _statusCode_extraInitializers);
            __esDecorate(null, null, _isCompleted_decorators, { kind: "field", name: "isCompleted", static: false, private: false, access: { has: obj => "isCompleted" in obj, get: obj => obj.isCompleted, set: (obj, value) => { obj.isCompleted = value; } }, metadata: _metadata }, _isCompleted_initializers, _isCompleted_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _completedAt_decorators, { kind: "field", name: "completedAt", static: false, private: false, access: { has: obj => "completedAt" in obj, get: obj => obj.completedAt, set: (obj, value) => { obj.completedAt = value; } }, metadata: _metadata }, _completedAt_initializers, _completedAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            IdempotencyEntity = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        key = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _key_initializers, void 0));
        operation = (__runInitializers(this, _key_extraInitializers), __runInitializers(this, _operation_initializers, void 0));
        userId = (__runInitializers(this, _operation_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
        requestPayload = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _requestPayload_initializers, void 0));
        responsePayload = (__runInitializers(this, _requestPayload_extraInitializers), __runInitializers(this, _responsePayload_initializers, void 0));
        statusCode = (__runInitializers(this, _responsePayload_extraInitializers), __runInitializers(this, _statusCode_initializers, void 0));
        isCompleted = (__runInitializers(this, _statusCode_extraInitializers), __runInitializers(this, _isCompleted_initializers, void 0));
        createdAt = (__runInitializers(this, _isCompleted_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        completedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _completedAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _completedAt_extraInitializers);
        }
    };
    return IdempotencyEntity = _classThis;
})();
exports.IdempotencyEntity = IdempotencyEntity;
