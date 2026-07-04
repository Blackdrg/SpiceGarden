import { MenuCustomizationService } from './menu-customization.service';
export declare class MenuCustomizationController {
    private readonly menuService;
    constructor(menuService: MenuCustomizationService);
    getMenuItems(restaurantId: string, category?: string): Promise<any>;
    getItemDetails(itemId: string): Promise<{
        id: any;
        name: any;
        description: any;
        price: number;
        image: any;
        category: any;
        isVeg: any;
        spiceLevel: any;
        status: any;
        addons: any;
    } | null>;
    getItemAddons(itemId: string): Promise<any>;
    getCategories(restaurantId: string): Promise<any>;
}
