import { Repository, DataSource } from 'typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
export declare class RestaurantService {
    private readonly restaurantRepo;
    private readonly branchRepo;
    private readonly dataSource;
    constructor(restaurantRepo: Repository<RestaurantEntity>, branchRepo: Repository<RestaurantBranchEntity>, dataSource: DataSource);
    getAllRestaurants(): unknown;
    findNearby(lat: number, lng: number, radiusInKm?: number): unknown;
    getRestaurantDetails(slug: string): unknown;
    searchRestaurants(query: string): unknown;
    updateBranchStatus(branchId: string, isOnline: boolean): unknown;
}
