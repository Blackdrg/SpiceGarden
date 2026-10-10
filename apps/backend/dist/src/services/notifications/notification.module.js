"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const db_repositories_module_1 = require("../../db/db-repositories.module");
const notification_service_1 = require("./notification.service");
const production_notification_service_1 = require("./production-notification.service");
const production_sms_provider_1 = require("./production-sms.provider");
const production_fcm_provider_1 = require("./production-fcm.provider");
const production_apns_provider_1 = require("./production-apns.provider");
const notification_preferences_service_1 = require("./notification-preferences.service");
const notification_engine_service_1 = require("./notification-engine.service");
const notification_queue_module_1 = require("./queue/notification-queue.module");
const device_controller_1 = require("./device.controller");
const notification_preferences_controller_1 = require("./notification-preferences.controller");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            db_repositories_module_1.DbRepositoriesModule,
            notification_queue_module_1.NotificationQueueModule,
        ],
        providers: [
            notification_service_1.NotificationService,
            production_notification_service_1.ProductionNotificationService,
            production_sms_provider_1.ProductionSMSProvider,
            production_fcm_provider_1.ProductionFCMProvider,
            production_apns_provider_1.ProductionAPNsProvider,
            notification_preferences_service_1.NotificationPreferencesService,
            notification_engine_service_1.NotificationEngineService,
        ],
        controllers: [device_controller_1.DeviceController, notification_preferences_controller_1.NotificationPreferencesController],
        exports: [
            notification_service_1.NotificationService,
            production_notification_service_1.ProductionNotificationService,
            production_sms_provider_1.ProductionSMSProvider,
            production_fcm_provider_1.ProductionFCMProvider,
            production_apns_provider_1.ProductionAPNsProvider,
            notification_preferences_service_1.NotificationPreferencesService,
            notification_engine_service_1.NotificationEngineService,
        ],
    })
], NotificationModule);
