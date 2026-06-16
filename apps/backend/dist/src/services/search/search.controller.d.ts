import { SearchService } from './search.service';
interface AuthenticatedRequest {
    user: {
        userId: string;
    };
}
export declare class SearchController {
    private searchService;
    constructor(searchService: SearchService);
    search(query: string): unknown;
    getTrending(): unknown;
    getRecommended(req: AuthenticatedRequest): unknown;
}
export {};
