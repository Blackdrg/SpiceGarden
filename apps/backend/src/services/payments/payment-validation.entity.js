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
exports.PaymentValidationEventEntity = void 0;
const typeorm_1 = require("typeorm");
let PaymentValidationEventEntity = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('payment_validation_events')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _userId_decorators;
    let _userId_initializers = [];
    let _userId_extraInitializers = [];
    let _validationType_decorators;
    let _validationType_initializers = [];
    let _validationType_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _validationData_decorators;
    let _validationData_initializers = [];
    let _validationData_extraInitializers = [];
    let _passed_decorators;
    let _passed_initializers = [];
    let _passed_extraInitializers = [];
    let _failureReason_decorators;
    let _failureReason_initializers = [];
    let _failureReason_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    var PaymentValidationEventEntity = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
            _userId_decorators = [(0, typeorm_1.Index)(), (0, typeorm_1.Column)()];
            _validationType_decorators = [(0, typeorm_1.Column)()];
            _amount_decorators = [(0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, nullable: true })];
            _validationData_decorators = [(0, typeorm_1.Column)('jsonb', { nullable: true })];
            _passed_decorators = [(0, typeorm_1.Column)({ default: false })];
            _failureReason_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: obj => "userId" in obj, get: obj => obj.userId, set: (obj, value) => { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
            __esDecorate(null, null, _validationType_decorators, { kind: "field", name: "validationType", static: false, private: false, access: { has: obj => "validationType" in obj, get: obj => obj.validationType, set: (obj, value) => { obj.validationType = value; } }, metadata: _metadata }, _validationType_initializers, _validationType_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _validationData_decorators, { kind: "field", name: "validationData", static: false, private: false, access: { has: obj => "validationData" in obj, get: obj => obj.validationData, set: (obj, value) => { obj.validationData = value; } }, metadata: _metadata }, _validationData_initializers, _validationData_extraInitializers);
            __esDecorate(null, null, _passed_decorators, { kind: "field", name: "passed", static: false, private: false, access: { has: obj => "passed" in obj, get: obj => obj.passed, set: (obj, value) => { obj.passed = value; } }, metadata: _metadata }, _passed_initializers, _passed_extraInitializers);
            __esDecorate(null, null, _failureReason_decorators, { kind: "field", name: "failureReason", static: false, private: false, access: { has: obj => "failureReason" in obj, get: obj => obj.failureReason, set: (obj, value) => { obj.failureReason = value; } }, metadata: _metadata }, _failureReason_initializers, _failureReason_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentValidationEventEntity = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        userId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
        validationType = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _validationType_initializers, void 0));
        amount = (__runInitializers(this, _validationType_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        validationData = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _validationData_initializers, void 0));
        passed = (__runInitializers(this, _validationData_extraInitializers), __runInitializers(this, _passed_initializers, void 0));
        failureReason = (__runInitializers(this, _passed_extraInitializers), __runInitializers(this, _failureReason_initializers, void 0));
        createdAt = (__runInitializers(this, _failureReason_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
    return PaymentValidationEventEntity = _classThis;
})();
exports.PaymentValidationEventEntity = PaymentValidationEventEntity;
