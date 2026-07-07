"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSTModule = void 0;
const common_1 = require("@nestjs/common");
const db_repositories_module_1 = require("../../db/db-repositories.module");
const gst_service_1 = require("./gst.service");
const gst_controller_1 = require("./gst.controller");
let GSTModule = class GSTModule {
};
exports.GSTModule = GSTModule;
exports.GSTModule = GSTModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_repositories_module_1.DbRepositoriesModule,
        ],
        providers: [gst_service_1.GSTService],
        controllers: [gst_controller_1.GSTController],
        exports: [gst_service_1.GSTService],
    })
], GSTModule);
