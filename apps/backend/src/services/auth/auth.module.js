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
exports.AuthServiceModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const session_entity_1 = require("../../db/entities/session.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const security_module_1 = require("../../security/security.module");
let AuthServiceModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                passport_1.PassportModule,
                security_module_1.SecurityModule,
                typeorm_1.TypeOrmModule.forFeature([session_entity_1.SessionEntity, user_entity_1.UserEntity]),
                jwt_1.JwtModule.registerAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: async (configService) => {
                        const secret = configService.get('JWT_SECRET');
                        if (!secret) {
                            if (configService.get('NODE_ENV') === 'production') {
                                throw new Error('JWT_SECRET not configured');
                            }
                            console.warn('JWT_SECRET not configured. Using fallback for development.');
                            return { secret: 'dev-secret-change-in-production-please', signOptions: { expiresIn: '60m' } };
                        }
                        if (secret.includes('CHANGE_ME') || secret.includes('secret_here')) {
                            if (configService.get('NODE_ENV') === 'production') {
                                throw new Error('JWT_SECRET not properly configured');
                            }
                            console.warn('JWT_SECRET has placeholder value. Using fallback for development.');
                            return { secret: 'dev-secret-change-in-production-please', signOptions: { expiresIn: '60m' } };
                        }
                        return {
                            secret,
                            signOptions: { expiresIn: '60m' },
                        };
                    },
                    inject: [config_1.ConfigService],
                }),
            ],
            providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy],
            controllers: [auth_controller_1.AuthController],
            exports: [auth_service_1.AuthService],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthServiceModule = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthServiceModule = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return AuthServiceModule = _classThis;
})();
exports.AuthServiceModule = AuthServiceModule;
