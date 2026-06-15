"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGrpcModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const db_module_1 = require("../db/db.module");
const security_module_1 = require("../security/security.module");
const logging_module_1 = require("../logging/logging.module");
const queue_module_1 = require("../infra/queue/queue.module");
const tracking_module_1 = require("../infra/tracking/tracking.module");
const auth_module_1 = require("../services/auth/auth.module");
const auth_controller_1 = require("./auth.controller");
const order_controller_1 = require("./order.controller");
const order_service_1 = require("../services/order/order.service");
let AppGrpcModule = class AppGrpcModule {
};
exports.AppGrpcModule = AppGrpcModule;
exports.AppGrpcModule = AppGrpcModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", ".env.local"] }),
            db_module_1.DbModule,
            security_module_1.SecurityModule,
            logging_module_1.LoggingModule,
            queue_module_1.QueueModule,
            tracking_module_1.TrackingModule,
            auth_module_1.AuthServiceModule,
            order_service_1.OrderService,
        ],
        controllers: [auth_controller_1.AuthGrpcController, order_controller_1.OrderGrpcController],
        providers: [],
    })
], AppGrpcModule);
