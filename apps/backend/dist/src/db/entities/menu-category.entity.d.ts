import { RestaurantBranchEntity } from './restaurant-branch.entity';
import { MenuItemEntity } from './menu-item.entity';
export declare class MenuCategoryEntity {
    id: string;
    name: string;
    sortOrder: number;
    branch: RestaurantBranchEntity;
    items: MenuItemEntity[];
    createdAt: Date;
    updatedAt: Date;
}
