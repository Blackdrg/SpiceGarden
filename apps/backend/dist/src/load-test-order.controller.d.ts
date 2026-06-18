export declare class LoadTestOrderController {
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
    placeOrder(body: any): Promise<any>;
}
