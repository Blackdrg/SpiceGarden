import { Repository } from 'typeorm';
import { PaymentMethodEntity } from '../../db/entities/payment-method.entity';
export declare class PaymentMethodsService {
    private readonly paymentRepo;
    constructor(paymentRepo: Repository<PaymentMethodEntity>);
    getUserPaymentMethods(userId: string): Promise<any>;
    addPaymentMethod(userId: string, data: any): Promise<any>;
    setDefault(userId: string, paymentId: string): Promise<any>;
    deletePaymentMethod(userId: string, paymentId: string): Promise<any>;
}
