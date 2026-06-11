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
exports.MenuCustomizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const menu_item_entity_1 = require("../../db/entities/menu-item.entity");
const menu_category_entity_1 = require("../../db/entities/menu-category.entity");
const menu_addon_entity_1 = require("../../db/entities/menu-addon.entity");
let MenuCustomizationService = class MenuCustomizationService {
    constructor(menuItemRepo, categoryRepo, addonRepo) {
        this.menuItemRepo = menuItemRepo;
        this.categoryRepo = categoryRepo;
        this.addonRepo = addonRepo;
    }
    async getMenuItems(restaurantId, category) {
        const whereClause = { restaurantId };
        const items = await this.menuItemRepo.find({
            where: whereClause,
            relations: ['addons', 'category'],
            order: { createdAt: 'DESC' },
        });
        return items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: Number(item.basePrice),
            image: item.imageUrl,
            category: item.category?.name,
            isVeg: item.isVeg,
            spiceLevel: item.spiceLevel,
            addons: item.addons?.map(addon => ({
                id: addon.id,
                name: addon.addonName,
                price: Number(addon.price),
            })) || [],
        }));
    }
    async getItemDetails(itemId) {
        const item = await this.menuItemRepo.findOne({
            where: { id: itemId },
            relations: ['addons', 'category'],
        });
        if (!item) {
            return null;
        }
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            price: Number(item.basePrice),
            image: item.imageUrl,
            category: item.category?.name,
            isVeg: item.isVeg,
            spiceLevel: item.spiceLevel,
            status: item.status,
            addons: item.addons?.map(addon => ({
                id: addon.id,
                name: addon.addonName,
                price: Number(addon.price),
            })) || [],
        };
    }
    async getItemAddons(itemId) {
        return this.addonRepo.find({ where: { menuItemId: itemId } });
    }
    async getCategories(restaurantId) {
        return this.categoryRepo.find({
            where: { branch: { restaurant: { id: restaurantId } } },
            order: { sortOrder: 'ASC' }
        });
    }
};
exports.MenuCustomizationService = MenuCustomizationService;
exports.MenuCustomizationService = MenuCustomizationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(menu_item_entity_1.MenuItemEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(menu_category_entity_1.MenuCategoryEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(menu_addon_entity_1.MenuAddonEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MenuCustomizationService);
//# sourceMappingURL=menu-customization.service.js.map