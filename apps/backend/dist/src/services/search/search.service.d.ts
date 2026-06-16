import { Repository } from 'typeorm';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
export declare class SearchService {
    private readonly menuRepo;
    private readonly restaurantRepo;
    constructor(menuRepo: Repository<MenuItemEntity>, restaurantRepo: Repository<RestaurantEntity>);
    search(query: string): unknown;
    getTrending(): unknown;
    getRecommended(userId: string): unknown;
}
