import { Repository } from 'typeorm';
import { PaymentMethodEntity } from '../../db/entities/payment-method.entity';
export declare class PaymentMethodsService {
    private readonly paymentRepo;
    constructor(paymentRepo: Repository<PaymentMethodEntity>);
    getUserPaymentMethods(userId: string): unknown;
    addPaymentMethod(userId: string, data: any): unknown;
    setDefault(userId: string, paymentId: string): unknown;
    deletePaymentMethod(userId: string, paymentId: string): unknown;
}
