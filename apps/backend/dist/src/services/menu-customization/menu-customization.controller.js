"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuCustomizationController = void 0;
const common_1 = require("@nestjs/common");
const menu_customization_service_1 = require("./menu-customization.service");
let MenuCustomizationController = class MenuCustomizationController {
    menuService;
    constructor(menuService) {
        this.menuService = menuService;
    }
    async getMenuItems(restaurantId, category) {
        return this.menuService.getMenuItems(restaurantId, category);
    }
    async getItemDetails(itemId) {
        return this.menuService.getItemDetails(itemId);
    }
    async getItemAddons(itemId) {
        return this.menuService.getItemAddons(itemId);
    }
    async getCategories(restaurantId) {
        return this.menuService.getCategories(restaurantId);
    }
};
exports.MenuCustomizationController = MenuCustomizationController;
__decorate([
    (0, common_1.Get)(':restaurantId/items'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MenuCustomizationController.prototype, "getMenuItems", null);
__decorate([
    (0, common_1.Get)('items/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuCustomizationController.prototype, "getItemDetails", null);
__decorate([
    (0, common_1.Get)('items/:itemId/addons'),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuCustomizationController.prototype, "getItemAddons", null);
__decorate([
    (0, common_1.Get)('categories/:restaurantId'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuCustomizationController.prototype, "getCategories", null);
exports.MenuCustomizationController = MenuCustomizationController = __decorate([
    (0, common_1.Controller)('menus'),
    __metadata("design:paramtypes", [menu_customization_service_1.MenuCustomizationService])
], MenuCustomizationController);
