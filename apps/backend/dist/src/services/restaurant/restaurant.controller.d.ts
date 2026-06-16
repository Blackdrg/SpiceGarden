import { RestaurantService } from './restaurant.service';
export declare class RestaurantController {
    private restaurantService;
    constructor(restaurantService: RestaurantService);
    getAll(): unknown;
    search(query: string): unknown;
    getNearby(lat: string, lng: string, radius?: string): unknown;
    getDetails(slug: string): unknown;
    updateStatus(id: string, body: {
        isOnline: boolean;
    }): unknown;
}
