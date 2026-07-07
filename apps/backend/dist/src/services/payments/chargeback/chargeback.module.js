"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargebackModule = void 0;
const common_1 = require("@nestjs/common");
const db_repositories_module_1 = require("../../../db/db-repositories.module");
const chargeback_service_1 = require("./chargeback.service");
const chargeback_controller_1 = require("./chargeback.controller");
const notification_module_1 = require("../../notifications/notification.module");
let ChargebackModule = class ChargebackModule {
};
exports.ChargebackModule = ChargebackModule;
exports.ChargebackModule = ChargebackModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_repositories_module_1.DbRepositoriesModule,
            notification_module_1.NotificationModule,
        ],
        providers: [chargeback_service_1.ChargebackService],
        controllers: [chargeback_controller_1.ChargebackController],
        exports: [chargeback_service_1.ChargebackService]
    })
], ChargebackModule);
