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
exports.ReviewSchema = exports.ReviewDocument = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ReviewDocument = (() => {
    let _classDecorators = [(0, mongoose_1.Schema)({ timestamps: true })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = mongoose_2.Document;
    let _userId_decorators;
    let _userId_initializers = [];
    let _userId_extraInitializers = [];
    let _restaurantId_decorators;
    let _restaurantId_initializers = [];
    let _restaurantId_extraInitializers = [];
    let _orderId_decorators;
    let _orderId_initializers = [];
    let _orderId_extraInitializers = [];
    let _rating_decorators;
    let _rating_initializers = [];
    let _rating_extraInitializers = [];
    let _comment_decorators;
    let _comment_initializers = [];
    let _comment_extraInitializers = [];
    let _images_decorators;
    let _images_initializers = [];
    let _images_extraInitializers = [];
    var ReviewDocument = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _userId_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _restaurantId_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _orderId_decorators = [(0, mongoose_1.Prop)({ required: true })];
            _rating_decorators = [(0, mongoose_1.Prop)({ required: true, min: 1, max: 5 })];
            _comment_decorators = [(0, mongoose_1.Prop)()];
            _images_decorators = [(0, mongoose_1.Prop)([String])];
            __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: obj => "userId" in obj, get: obj => obj.userId, set: (obj, value) => { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
            __esDecorate(null, null, _restaurantId_decorators, { kind: "field", name: "restaurantId", static: false, private: false, access: { has: obj => "restaurantId" in obj, get: obj => obj.restaurantId, set: (obj, value) => { obj.restaurantId = value; } }, metadata: _metadata }, _restaurantId_initializers, _restaurantId_extraInitializers);
            __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: obj => "orderId" in obj, get: obj => obj.orderId, set: (obj, value) => { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _orderId_extraInitializers);
            __esDecorate(null, null, _rating_decorators, { kind: "field", name: "rating", static: false, private: false, access: { has: obj => "rating" in obj, get: obj => obj.rating, set: (obj, value) => { obj.rating = value; } }, metadata: _metadata }, _rating_initializers, _rating_extraInitializers);
            __esDecorate(null, null, _comment_decorators, { kind: "field", name: "comment", static: false, private: false, access: { has: obj => "comment" in obj, get: obj => obj.comment, set: (obj, value) => { obj.comment = value; } }, metadata: _metadata }, _comment_initializers, _comment_extraInitializers);
            __esDecorate(null, null, _images_decorators, { kind: "field", name: "images", static: false, private: false, access: { has: obj => "images" in obj, get: obj => obj.images, set: (obj, value) => { obj.images = value; } }, metadata: _metadata }, _images_initializers, _images_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ReviewDocument = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        userId = __runInitializers(this, _userId_initializers, void 0);
        restaurantId = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _restaurantId_initializers, void 0));
        orderId = (__runInitializers(this, _restaurantId_extraInitializers), __runInitializers(this, _orderId_initializers, void 0));
        rating = (__runInitializers(this, _orderId_extraInitializers), __runInitializers(this, _rating_initializers, void 0));
        comment = (__runInitializers(this, _rating_extraInitializers), __runInitializers(this, _comment_initializers, void 0));
        images = (__runInitializers(this, _comment_extraInitializers), __runInitializers(this, _images_initializers, void 0));
        constructor() {
            super(...arguments);
            __runInitializers(this, _images_extraInitializers);
        }
    };
    return ReviewDocument = _classThis;
})();
exports.ReviewDocument = ReviewDocument;
exports.ReviewSchema = mongoose_1.SchemaFactory.createForClass(ReviewDocument);
