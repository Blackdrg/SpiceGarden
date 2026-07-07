"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const encryption_service_1 = require("./encryption.service");
const secret_loader_service_1 = require("../infra/secret-loader.service");
const db_repositories_module_1 = require("../db/db-repositories.module");
const permission_guard_1 = require("./permission.guard");
const roles_guard_1 = require("./roles.guard");
const loadTestLimit = parseInt(process.env.LOAD_TEST_LIMIT || '1000000', 10);
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            db_repositories_module_1.DbRepositoriesModule,
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: process.env.LOAD_TEST_MODE === 'true' && process.env.NODE_ENV !== 'production' ? loadTestLimit : 10,
                }]),
        ],
        providers: [secret_loader_service_1.SecretLoaderService, encryption_service_1.EncryptionService, permission_guard_1.PermissionGuard, roles_guard_1.RolesGuard],
        exports: [encryption_service_1.EncryptionService, throttler_1.ThrottlerModule, permission_guard_1.PermissionGuard, roles_guard_1.RolesGuard],
    })
], SecurityModule);
