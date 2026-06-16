import { OrderService } from './order.service';
export declare class OrderController {
    private orderService;
    constructor(orderService: OrderService);
    placeOrder(body: any, idempotencyKey?: string): unknown;
    healthCheck(): unknown;
}
