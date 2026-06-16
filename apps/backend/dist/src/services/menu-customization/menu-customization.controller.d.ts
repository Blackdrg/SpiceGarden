import { MenuCustomizationService } from './menu-customization.service';
export declare class MenuCustomizationController {
    private readonly menuService;
    constructor(menuService: MenuCustomizationService);
    getMenuItems(restaurantId: string, category?: string): unknown;
    getItemDetails(itemId: string): unknown;
    getItemAddons(itemId: string): unknown;
    getCategories(restaurantId: string): unknown;
}
