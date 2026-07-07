"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrpcModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth.controller");
const order_controller_1 = require("./order.controller");
const auth_service_1 = require("../services/auth/auth.service");
const order_service_1 = require("../services/order/order.service");
let GrpcModule = class GrpcModule {
};
exports.GrpcModule = GrpcModule;
exports.GrpcModule = GrpcModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [auth_controller_1.AuthGrpcController, order_controller_1.OrderGrpcController],
        providers: [auth_service_1.AuthService, order_service_1.OrderService],
        exports: [],
    })
], GrpcModule);
