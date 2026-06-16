import { PaymentMethodsService } from './payment-methods.service';
export declare class PaymentMethodsController {
    private readonly paymentService;
    constructor(paymentService: PaymentMethodsService);
    getPaymentMethods(req: any): unknown;
    addPaymentMethod(req: any, data: any): unknown;
    setDefault(req: any, paymentId: string): unknown;
    deletePaymentMethod(req: any, paymentId: string): unknown;
}
