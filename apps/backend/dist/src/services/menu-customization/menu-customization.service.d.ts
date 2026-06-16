import { Repository } from 'typeorm';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { MenuCategoryEntity } from '../../db/entities/menu-category.entity';
import { MenuAddonEntity } from '../../db/entities/menu-addon.entity';
export declare class MenuCustomizationService {
    private readonly menuItemRepo;
    private readonly categoryRepo;
    private readonly addonRepo;
    constructor(menuItemRepo: Repository<MenuItemEntity>, categoryRepo: Repository<MenuCategoryEntity>, addonRepo: Repository<MenuAddonEntity>);
    getMenuItems(restaurantId: string, category?: string): unknown;
    getItemDetails(itemId: string): unknown;
    getItemAddons(itemId: string): unknown;
    getCategories(restaurantId: string): unknown;
}
