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
        restaurants: any;
        items: any;
    }>;
    getTrending(): Promise<any>;
    getRecommended(req: AuthenticatedRequest): Promise<any>;
}
export {};
