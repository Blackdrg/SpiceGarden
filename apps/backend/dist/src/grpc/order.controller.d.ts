import { OrderService } from '../services/order/order.service';
export declare class OrderGrpcController {
    private readonly orderService;
    constructor(orderService: OrderService);
    placeOrder(data: any): Promise<import("../shared/domain/order.interface").Order>;
}
