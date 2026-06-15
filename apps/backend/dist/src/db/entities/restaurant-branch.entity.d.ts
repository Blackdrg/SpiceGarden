import { RestaurantEntity } from './restaurant.entity';
import { MenuCategoryEntity } from './menu-category.entity';
export declare class RestaurantBranchEntity {
    id: string;
    branchName: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    openingTime: string;
    closingTime: string;
    isOnline: boolean;
    restaurant: RestaurantEntity;
    categories: MenuCategoryEntity[];
    createdAt: Date;
    updatedAt: Date;
}
