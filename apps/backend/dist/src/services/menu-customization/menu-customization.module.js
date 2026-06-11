"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuCustomizationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const menu_customization_service_1 = require("./menu-customization.service");
const menu_customization_controller_1 = require("./menu-customization.controller");
const menu_item_entity_1 = require("../../db/entities/menu-item.entity");
const menu_category_entity_1 = require("../../db/entities/menu-category.entity");
const menu_addon_entity_1 = require("../../db/entities/menu-addon.entity");
let MenuCustomizationModule = class MenuCustomizationModule {
};
exports.MenuCustomizationModule = MenuCustomizationModule;
exports.MenuCustomizationModule = MenuCustomizationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([menu_item_entity_1.MenuItemEntity, menu_category_entity_1.MenuCategoryEntity, menu_addon_entity_1.MenuAddonEntity])],
        providers: [menu_customization_service_1.MenuCustomizationService],
        controllers: [menu_customization_controller_1.MenuCustomizationController],
        exports: [menu_customization_service_1.MenuCustomizationService],
    })
], MenuCustomizationModule);
//# sourceMappingURL=menu-customization.module.js.map