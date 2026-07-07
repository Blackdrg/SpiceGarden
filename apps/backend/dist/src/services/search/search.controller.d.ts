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
        restaurants: import("../../db/entities").RestaurantEntity[];
        items: import("../../db/entities").MenuItemEntity[];
    }>;
    getTrending(): Promise<import("../../db/entities").MenuItemEntity[]>;
    getRecommended(req: AuthenticatedRequest): Promise<import("../../db/entities").MenuItemEntity[]>;
}
export {};
