import { Repository } from 'typeorm';
import { PaymentMethodEntity } from '../../db/entities/payment-method.entity';
export declare class PaymentMethodsService {
    private readonly paymentRepo;
    constructor(paymentRepo: Repository<PaymentMethodEntity>);
    getUserPaymentMethods(userId: string): Promise<PaymentMethodEntity[]>;
    addPaymentMethod(userId: string, data: any): Promise<PaymentMethodEntity[]>;
    setDefault(userId: string, paymentId: string): Promise<import("typeorm").UpdateResult>;
    deletePaymentMethod(userId: string, paymentId: string): Promise<import("typeorm").DeleteResult>;
}
