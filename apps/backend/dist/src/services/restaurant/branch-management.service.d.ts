import { Repository, DataSource } from 'typeorm';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
export declare class BranchManagementService {
    private branchRepo;
    private restaurantRepo;
    private connection;
    private readonly logger;
    constructor(branchRepo: Repository<RestaurantBranchEntity>, restaurantRepo: Repository<RestaurantEntity>, connection: DataSource);
    createBranch(restaurantId: string, branchData: {
        branchName: string;
        address: string;
        lat: number;
        lng: number;
        openingTime?: string;
        closingTime?: string;
    }): Promise<RestaurantBranchEntity>;
    updateBranch(branchId: string, updateData: Partial<RestaurantBranchEntity> & {
        lat?: number;
        lng?: number;
    }): Promise<RestaurantBranchEntity>;
    toggleBranchStatus(branchId: string, isOnline: boolean): Promise<RestaurantBranchEntity>;
    getBranchDetails(branchId: string): Promise<RestaurantBranchEntity>;
    getBranchesByRestaurant(restaurantId: string): Promise<RestaurantBranchEntity[]>;
    getAllBranches(filter?: {
        isOnline?: boolean;
        restaurantId?: string;
    }): Promise<RestaurantBranchEntity[]>;
    deleteBranch(branchId: string): Promise<void>;
}
