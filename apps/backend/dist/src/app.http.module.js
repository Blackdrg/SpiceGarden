"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppHttpModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const db_module_1 = require("./db/db.module");
const security_module_1 = require("./security/security.module");
const logging_module_1 = require("./logging/logging.module");
const queue_module_1 = require("./infra/queue/queue.module");
const tracking_module_1 = require("./infra/tracking/tracking.module");
const auth_module_1 = require("./services/auth/auth.module");
const order_module_1 = require("./services/order/order.module");
const payments_module_1 = require("./services/payments/payments.module");
const restaurant_module_1 = require("./services/restaurant/restaurant.module");
const search_module_1 = require("./services/search/search.module");
const delivery_module_1 = require("./services/delivery/delivery.module");
const driver_ops_module_1 = require("./services/delivery/driver-ops.module");
const admin_module_1 = require("./services/admin/admin.module");
let AppHttpModule = class AppHttpModule {
};
exports.AppHttpModule = AppHttpModule;
exports.AppHttpModule = AppHttpModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", ".env.local"] }),
            db_module_1.DbModule,
            security_module_1.SecurityModule,
            logging_module_1.LoggingModule,
            queue_module_1.QueueModule,
            tracking_module_1.TrackingModule,
            auth_module_1.AuthServiceModule,
            order_module_1.OrderServiceModule,
            payments_module_1.PaymentServiceModule,
            restaurant_module_1.RestaurantServiceModule,
            search_module_1.SearchServiceModule,
            delivery_module_1.DeliveryServiceModule,
            driver_ops_module_1.DriverOpsModule,
            admin_module_1.AdminServiceModule,
        ],
    })
], AppHttpModule);
