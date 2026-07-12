"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const db_repositories_module_1 = require("../../db/db-repositories.module");
const address_service_1 = require("./address.service");
const address_controller_1 = require("./address.controller");
const payment_methods_service_1 = require("./payment-methods.service");
const payment_methods_controller_1 = require("./payment-methods.controller");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [db_repositories_module_1.DbRepositoriesModule],
        controllers: [address_controller_1.AddressController, payment_methods_controller_1.PaymentMethodsController],
        providers: [address_service_1.AddressService, payment_methods_service_1.PaymentMethodsService],
        exports: [address_service_1.AddressService, payment_methods_service_1.PaymentMethodsService],
    })
], UserModule);
