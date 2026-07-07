import { RestaurantService } from './restaurant.service';
export declare class RestaurantController {
    private restaurantService;
    constructor(restaurantService: RestaurantService);
    getAll(): Promise<import("../../db/entities").RestaurantEntity[]>;
    search(query: string): Promise<import("../../db/entities").RestaurantEntity[]>;
    getNearby(lat: string, lng: string, radius?: string): Promise<import("../../db/entities/restaurant-branch.entity").RestaurantBranchEntity[]>;
    getDetails(slug: string): Promise<import("../../db/entities").RestaurantEntity | null>;
    updateStatus(id: string, body: {
        isOnline: boolean;
    }): Promise<import("typeorm").UpdateResult>;
}
