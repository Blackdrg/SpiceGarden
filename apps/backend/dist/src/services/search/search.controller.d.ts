import { SearchService } from './search.service';
interface AuthenticatedRequest {
    user: {
        userId: string;
    };
}
export declare class SearchController {
    private searchService;
    constructor(searchService: SearchService);
    search(query: string): Promise<{
        restaurants: import("../../db/entities/restaurant.entity").RestaurantEntity[];
        items: import("../../db/entities/menu-item.entity").MenuItemEntity[];
    }>;
    getTrending(): Promise<import("../../db/entities/menu-item.entity").MenuItemEntity[]>;
    getRecommended(req: AuthenticatedRequest): Promise<import("../../db/entities/menu-item.entity").MenuItemEntity[]>;
}
export {};
