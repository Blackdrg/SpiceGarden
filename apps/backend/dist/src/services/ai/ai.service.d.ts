import { Repository } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
export declare class AiService {
    private readonly orderRepo;
    private readonly menuRepo;
    constructor(orderRepo: Repository<OrderEntity>, menuRepo: Repository<MenuItemEntity>);
    getRecommendations(userId: string): unknown;
    predictDemand(branchId: string, date: Date): unknown;
    chatbotResponse(message: string): unknown;
}
