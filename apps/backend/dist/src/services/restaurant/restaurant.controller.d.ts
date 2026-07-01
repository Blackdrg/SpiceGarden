import { RestaurantService } from './restaurant.service';
export declare class RestaurantController {
    private restaurantService;
    constructor(restaurantService: RestaurantService);
    getAll(): Promise<any>;
    search(query: string): Promise<any>;
    getNearby(lat: string, lng: string, radius?: string): Promise<any>;
    getDetails(slug: string): Promise<any>;
    updateStatus(id: string, body: {
        isOnline: boolean;
    }): Promise<any>;
}
