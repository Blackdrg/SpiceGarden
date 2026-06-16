import { MenuCustomizationService } from './menu-customization.service';
export declare class MenuCustomizationController {
    private readonly menuService;
    constructor(menuService: MenuCustomizationService);
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
    getItemAddons(itemId: string): Promise<import("../../db/entities/menu-addon.entity").MenuAddonEntity[]>;
    getCategories(restaurantId: string): Promise<import("../../db/entities/menu-category.entity").MenuCategoryEntity[]>;
}
