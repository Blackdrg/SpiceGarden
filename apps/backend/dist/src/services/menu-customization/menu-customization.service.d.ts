import { Repository } from 'typeorm';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { MenuCategoryEntity } from '../../db/entities/menu-category.entity';
import { MenuAddonEntity } from '../../db/entities/menu-addon.entity';
export declare class MenuCustomizationService {
    private readonly menuItemRepo;
    private readonly categoryRepo;
    private readonly addonRepo;
    constructor(menuItemRepo: Repository<MenuItemEntity>, categoryRepo: Repository<MenuCategoryEntity>, addonRepo: Repository<MenuAddonEntity>);
    getMenuItems(restaurantId: string, category?: string): Promise<{
        id: string;
        name: string;
        description: string;
        price: number;
        image: string;
        category: string;
        isVeg: boolean;
        spiceLevel: number;
        addons: {
            id: string;
            name: string;
            price: number;
        }[];
    }[]>;
    getItemDetails(itemId: string): Promise<{
        id: string;
        name: string;
        description: string;
        price: number;
        image: string;
        category: string;
        isVeg: boolean;
        spiceLevel: number;
        status: string;
        addons: {
            id: string;
            name: string;
            price: number;
        }[];
    } | null>;
    getItemAddons(itemId: string): Promise<MenuAddonEntity[]>;
    getCategories(restaurantId: string): Promise<MenuCategoryEntity[]>;
}
