import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreferenceEntity } from '../../db/entities/notification-preference.entity';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    @InjectRepository(NotificationPreferenceEntity)
    private readonly prefRepo: Repository<NotificationPreferenceEntity>,
  ) {}

  async getPreferences(userId: string) {
    let prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.prefRepo.create({ userId });
      prefs = await this.prefRepo.save(prefs);
    }
    return prefs;
  }

  async updatePreferences(userId: string, updates: Partial<NotificationPreferenceEntity>) {
    let prefs = await this.prefRepo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.prefRepo.create({ userId, ...updates });
    } else {
      Object.assign(prefs, updates);
    }
    return this.prefRepo.save(prefs);
  }

  async shouldSendPush(userId: string, category: 'orders' | 'promotions' | 'deliveryUpdates') {
    const prefs = await this.getPreferences(userId);
    switch (category) {
      case 'orders': return prefs.pushOrders;
      case 'promotions': return prefs.pushPromotions;
      case 'deliveryUpdates': return prefs.pushDeliveryUpdates;
      default: return true;
    }
  }
}