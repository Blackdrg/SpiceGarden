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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
let AiController = (() => {
    let _classDecorators = [(0, common_1.Controller)('ai')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getRecs_decorators;
    let _askChatbot_decorators;
    let _getForecast_decorators;
    var AiController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getRecs_decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.Get)('recommendations')];
            _askChatbot_decorators = [(0, common_1.Post)('chatbot')];
            _getForecast_decorators = [(0, common_1.Get)('forecast')];
            __esDecorate(this, null, _getRecs_decorators, { kind: "method", name: "getRecs", static: false, private: false, access: { has: obj => "getRecs" in obj, get: obj => obj.getRecs }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _askChatbot_decorators, { kind: "method", name: "askChatbot", static: false, private: false, access: { has: obj => "askChatbot" in obj, get: obj => obj.askChatbot }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getForecast_decorators, { kind: "method", name: "getForecast", static: false, private: false, access: { has: obj => "getForecast" in obj, get: obj => obj.getForecast }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AiController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        aiService = __runInitializers(this, _instanceExtraInitializers);
        constructor(aiService) {
            this.aiService = aiService;
        }
        async getRecs(req) {
            return this.aiService.getRecommendations(req.user.userId);
        }
        async askChatbot(message) {
            const reply = await this.aiService.chatbotResponse(message);
            return { reply };
        }
        async getForecast(branchId) {
            return this.aiService.predictDemand(branchId, new Date());
        }
    };
    return AiController = _classThis;
})();
exports.AiController = AiController;
