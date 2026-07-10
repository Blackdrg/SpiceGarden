"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServiceModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const db_repositories_module_1 = require("../../db/db-repositories.module");
const auth_service_1 = require("./auth.service");
const password_reset_service_1 = require("./password-reset.service");
const mfa_service_1 = require("./mfa.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const google_strategy_1 = require("./strategies/google.strategy");
const facebook_strategy_1 = require("./strategies/facebook.strategy");
const mfa_controller_1 = require("./mfa.controller");
const notification_module_1 = require("../notifications/notification.module");
const missing_env_error_1 = require("../../common/errors/missing-env.error");
function requireJwtSecret(configService) {
    return (0, missing_env_error_1.getRequiredSecret)(configService, 'JWT_SECRET');
}
let AuthServiceModule = class AuthServiceModule {
};
exports.AuthServiceModule = AuthServiceModule;
exports.AuthServiceModule = AuthServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            notification_module_1.NotificationModule,
            db_repositories_module_1.DbRepositoriesModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const secret = requireJwtSecret(configService);
                    const expiresIn = (configService.get('JWT_EXPIRES_IN') || '60m');
                    return {
                        secret,
                        signOptions: { expiresIn },
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [auth_service_1.AuthService, password_reset_service_1.PasswordResetService, mfa_service_1.MfaService, jwt_strategy_1.JwtStrategy, google_strategy_1.GoogleStrategy, facebook_strategy_1.FacebookStrategy],
        controllers: [auth_controller_1.AuthController, mfa_controller_1.MfaController],
        exports: [auth_service_1.AuthService, password_reset_service_1.PasswordResetService, mfa_service_1.MfaService],
    })
], AuthServiceModule);
