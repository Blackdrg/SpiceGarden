import { Repository, DataSource } from 'typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
export declare class RestaurantService {
    private readonly restaurantRepo;
    private readonly branchRepo;
    private readonly dataSource;
    constructor(restaurantRepo: Repository<RestaurantEntity>, branchRepo: Repository<RestaurantBranchEntity>, dataSource: DataSource);
    getAllRestaurants(): Promise<any>;
    findNearby(lat: number, lng: number, radiusInKm?: number): Promise<any>;
    getRestaurantDetails(slug: string): Promise<any>;
    searchRestaurants(query: string): Promise<any>;
    updateBranchStatus(branchId: string, isOnline: boolean): Promise<any>;
}
