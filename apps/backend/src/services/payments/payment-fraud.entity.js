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
exports.PaymentFraudFlagEntity = void 0;
const typeorm_1 = require("typeorm");
let PaymentFraudFlagEntity = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('payment_fraud_flags')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _userId_decorators;
    let _userId_initializers = [];
    let _userId_extraInitializers = [];
    let _paymentIntentId_decorators;
    let _paymentIntentId_initializers = [];
    let _paymentIntentId_extraInitializers = [];
    let _orderId_decorators;
    let _orderId_initializers = [];
    let _orderId_extraInitializers = [];
    let _flagType_decorators;
    let _flagType_initializers = [];
    let _flagType_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _riskScore_decorators;
    let _riskScore_initializers = [];
    let _riskScore_extraInitializers = [];
    let _evidence_decorators;
    let _evidence_initializers = [];
    let _evidence_extraInitializers = [];
    let _isBlocked_decorators;
    let _isBlocked_initializers = [];
    let _isBlocked_extraInitializers = [];
    let _blockedAt_decorators;
    let _blockedAt_initializers = [];
    let _blockedAt_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    var PaymentFraudFlagEntity = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
            _userId_decorators = [(0, typeorm_1.Index)(), (0, typeorm_1.Column)()];
            _paymentIntentId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _orderId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _flagType_decorators = [(0, typeorm_1.Column)()];
            _amount_decorators = [(0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, nullable: true })];
            _riskScore_decorators = [(0, typeorm_1.Column)()];
            _evidence_decorators = [(0, typeorm_1.Column)('simple-json', { nullable: true })];
            _isBlocked_decorators = [(0, typeorm_1.Column)({ default: false })];
            _blockedAt_decorators = [(0, typeorm_1.Column)({ nullable: true })];
            _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: obj => "userId" in obj, get: obj => obj.userId, set: (obj, value) => { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
            __esDecorate(null, null, _paymentIntentId_decorators, { kind: "field", name: "paymentIntentId", static: false, private: false, access: { has: obj => "paymentIntentId" in obj, get: obj => obj.paymentIntentId, set: (obj, value) => { obj.paymentIntentId = value; } }, metadata: _metadata }, _paymentIntentId_initializers, _paymentIntentId_extraInitializers);
            __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: obj => "orderId" in obj, get: obj => obj.orderId, set: (obj, value) => { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _orderId_extraInitializers);
            __esDecorate(null, null, _flagType_decorators, { kind: "field", name: "flagType", static: false, private: false, access: { has: obj => "flagType" in obj, get: obj => obj.flagType, set: (obj, value) => { obj.flagType = value; } }, metadata: _metadata }, _flagType_initializers, _flagType_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _riskScore_decorators, { kind: "field", name: "riskScore", static: false, private: false, access: { has: obj => "riskScore" in obj, get: obj => obj.riskScore, set: (obj, value) => { obj.riskScore = value; } }, metadata: _metadata }, _riskScore_initializers, _riskScore_extraInitializers);
            __esDecorate(null, null, _evidence_decorators, { kind: "field", name: "evidence", static: false, private: false, access: { has: obj => "evidence" in obj, get: obj => obj.evidence, set: (obj, value) => { obj.evidence = value; } }, metadata: _metadata }, _evidence_initializers, _evidence_extraInitializers);
            __esDecorate(null, null, _isBlocked_decorators, { kind: "field", name: "isBlocked", static: false, private: false, access: { has: obj => "isBlocked" in obj, get: obj => obj.isBlocked, set: (obj, value) => { obj.isBlocked = value; } }, metadata: _metadata }, _isBlocked_initializers, _isBlocked_extraInitializers);
            __esDecorate(null, null, _blockedAt_decorators, { kind: "field", name: "blockedAt", static: false, private: false, access: { has: obj => "blockedAt" in obj, get: obj => obj.blockedAt, set: (obj, value) => { obj.blockedAt = value; } }, metadata: _metadata }, _blockedAt_initializers, _blockedAt_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentFraudFlagEntity = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        userId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
        paymentIntentId = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _paymentIntentId_initializers, void 0));
        orderId = (__runInitializers(this, _paymentIntentId_extraInitializers), __runInitializers(this, _orderId_initializers, void 0));
        flagType = (__runInitializers(this, _orderId_extraInitializers), __runInitializers(this, _flagType_initializers, void 0));
        amount = (__runInitializers(this, _flagType_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        riskScore = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _riskScore_initializers, void 0));
        evidence = (__runInitializers(this, _riskScore_extraInitializers), __runInitializers(this, _evidence_initializers, void 0));
        isBlocked = (__runInitializers(this, _evidence_extraInitializers), __runInitializers(this, _isBlocked_initializers, void 0));
        blockedAt = (__runInitializers(this, _isBlocked_extraInitializers), __runInitializers(this, _blockedAt_initializers, void 0));
        createdAt = (__runInitializers(this, _blockedAt_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        constructor() {
            __runInitializers(this, _createdAt_extraInitializers);
        }
    };
    return PaymentFraudFlagEntity = _classThis;
})();
exports.PaymentFraudFlagEntity = PaymentFraudFlagEntity;
