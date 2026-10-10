import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from '../../db/entities/address.entity';
import { PaymentMethodEntity } from '../../db/entities/payment-method.entity';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepo: Repository<AddressEntity>,
    @InjectRepository(PaymentMethodEntity)
    private readonly paymentMethodRepo: Repository<PaymentMethodEntity>,
  ) {}

  async getAddresses(userId: string) {
    return this.addressRepo.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
  }

  async createAddress(userId: string, data: {
    label: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    location: { lat: number; lng: number };
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      await this.addressRepo.update({ userId }, { isDefault: false });
    }

    const point = `(${data.location.lng},${data.location.lat})`;
    const rows = await this.addressRepo.query(
      'INSERT INTO user_addresses("userId", label, "addressLine", city, state, "postalCode", location, "isDefault") VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userId, data.label, data.addressLine, data.city, data.state, data.postalCode, point, data.isDefault || false]
    );
    return rows[0];
  }

  async updateAddress(userId: string, id: string, data: Partial<{
    label: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    location: { lat: number; lng: number };
    isDefault: boolean;
  }>) {
    const address = await this.addressRepo.findOne({ where: { id, userId } });
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (data.isDefault) {
      await this.addressRepo.update({ userId }, { isDefault: false });
    }

    Object.assign(address, data);
    return this.addressRepo.save(address);
  }

  async deleteAddress(userId: string, id: string) {
    const address = await this.addressRepo.findOne({ where: { id, userId } });
    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.addressRepo.delete(id);
    return { success: true };
  }

  async getPaymentMethods(userId: string) {
    return this.paymentMethodRepo.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
  }

  async createPaymentMethod(userId: string, data: {
    type: 'card' | 'upi' | 'wallet';
    cardLast4?: string;
    cardBrand?: string;
    cardExpiry?: string;
    upiId?: string;
    walletProvider?: string;
    externalPaymentMethodId?: string;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      await this.paymentMethodRepo.update({ userId }, { isDefault: false });
    }

    const paymentMethod = this.paymentMethodRepo.create({
      userId,
      ...data,
    });

    return this.paymentMethodRepo.save(paymentMethod);
  }

  async deletePaymentMethod(userId: string, id: string) {
    const paymentMethod = await this.paymentMethodRepo.findOne({ where: { id, userId } });
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    await this.paymentMethodRepo.delete(id);
    return { success: true };
  }

  async setDefaultPaymentMethod(userId: string, id: string) {
    const paymentMethod = await this.paymentMethodRepo.findOne({ where: { id, userId } });
    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    await this.paymentMethodRepo.update({ userId }, { isDefault: false });
    paymentMethod.isDefault = true;
    return this.paymentMethodRepo.save(paymentMethod);
  }

  async validatePaymentMethodOwnership(userId: string, paymentMethodId: string) {
    const exists = await this.paymentMethodRepo.findOne({ where: { id: paymentMethodId, userId } });
    if (!exists) {
      throw new NotFoundException('Payment method not found or not owned by user');
    }
    return exists;
  }
}