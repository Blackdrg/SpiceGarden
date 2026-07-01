import { PaymentMethodsService } from './payment-methods.service';
export declare class PaymentMethodsController {
    private readonly paymentService;
    constructor(paymentService: PaymentMethodsService);
    getPaymentMethods(req: any): Promise<any>;
    addPaymentMethod(req: any, data: any): Promise<any>;
    setDefault(req: any, paymentId: string): Promise<any>;
    deletePaymentMethod(req: any, paymentId: string): Promise<any>;
}
