import { PaymentMethodsService } from './payment-methods.service';
export declare class PaymentMethodsController {
    private readonly paymentService;
    constructor(paymentService: PaymentMethodsService);
    getPaymentMethods(req: any): Promise<import("../../db/entities/payment-method.entity").PaymentMethodEntity[]>;
    addPaymentMethod(req: any, data: any): Promise<import("../../db/entities/payment-method.entity").PaymentMethodEntity[]>;
    setDefault(req: any, paymentId: string): Promise<import("typeorm").UpdateResult>;
    deletePaymentMethod(req: any, paymentId: string): Promise<import("typeorm").DeleteResult>;
}
