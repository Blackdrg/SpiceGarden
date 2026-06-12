"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantServiceModule = void 0;
const common_1 = require("@nestjs/common");
const local_repository_module_1 = require("../../db/local-repository.module");
const restaurant_service_1 = require("./restaurant.service");
const restaurant_controller_1 = require("./restaurant.controller");
const restaurant_ops_controller_1 = require("./restaurant-ops.controller");
const restaurant_ops_service_1 = require("./restaurant-ops.service");
const menu_moderation_service_1 = require("./menu-moderation.service");
const payout_service_1 = require("./payout.service");
const branch_management_service_1 = require("./branch-management.service");
const commission_service_1 = require("./commission.service");
const onboarding_service_1 = require("./onboarding.service");
const onboarding_controller_1 = require("./onboarding.controller");
let RestaurantServiceModule = class RestaurantServiceModule {
};
exports.RestaurantServiceModule = RestaurantServiceModule;
exports.RestaurantServiceModule = RestaurantServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            local_repository_module_1.LocalRepositoryModule,
        ],
        providers: [
            restaurant_service_1.RestaurantService,
            restaurant_ops_service_1.RestaurantOpsService,
            menu_moderation_service_1.MenuModerationService,
            payout_service_1.PayoutService,
            branch_management_service_1.BranchManagementService,
            commission_service_1.CommissionService,
            onboarding_service_1.RestaurantOnboardingService
        ],
        controllers: [
            restaurant_controller_1.RestaurantController,
            restaurant_ops_controller_1.RestaurantOpsController,
            onboarding_controller_1.RestaurantOnboardingController
        ],
        exports: [
            restaurant_service_1.RestaurantService,
            restaurant_ops_service_1.RestaurantOpsService,
            menu_moderation_service_1.MenuModerationService,
            payout_service_1.PayoutService,
            branch_management_service_1.BranchManagementService,
            commission_service_1.CommissionService,
            onboarding_service_1.RestaurantOnboardingService
        ],
    })
], RestaurantServiceModule);
//# sourceMappingURL=restaurant.module.js.map