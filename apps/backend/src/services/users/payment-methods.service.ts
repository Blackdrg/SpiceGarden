import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethodEntity } from '../../db/entities/payment-method.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethodEntity)
    private readonly paymentRepo: Repository<PaymentMethodEntity>,
  ) {}

  async getUserPaymentMethods(userId: string) {
    return this.paymentRepo.find({ where: { userId } });
  }

  async addPaymentMethod(userId: string, data: any) {
    const paymentData = data as Record<string, any>;
    if (paymentData.isDefault) {
      await this.paymentRepo.update({ userId }, { isDefault: false } as any);
    }
    const payment = this.paymentRepo.create({ ...paymentData, userId } as any);
    return this.paymentRepo.save(payment);
  }

  async setDefault(userId: string, paymentId: string) {
    await this.paymentRepo.update({ userId }, { isDefault: false });
    return this.paymentRepo.update({ userId, id: paymentId }, { isDefault: true });
  }

  async deletePaymentMethod(userId: string, paymentId: string) {
    return this.paymentRepo.delete({ userId, id: paymentId });
  }
}