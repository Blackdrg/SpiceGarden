import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftCardEntity, GiftCardStatus } from '../../db/entities/gift-card.entity';
import { WalletService } from '../../services/wallet/wallet.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationService } from '../../services/notifications/notification.service';

export interface CreateGiftCardDto {
  code: string;
  initialBalance: number;
  discountPercentage?: number;
  minOrderAmount?: number;
  validFrom: Date;
  validUntil: Date;
  usagePerUser?: number;
  createdBy?: string;
}

export interface ApplyGiftCardDto {
  code: string;
  userId: string;
  orderId: string;
  orderAmount: number;
}

@Injectable()
export class GiftCardService {
  private readonly logger = new Logger(GiftCardService.name);

  constructor(
    @InjectRepository(GiftCardEntity)
    private readonly giftCardRepo: Repository<GiftCardEntity>,
    private readonly walletService: WalletService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  async createGiftCard(dto: CreateGiftCardDto): Promise<GiftCardEntity> {
    const existing = await this.giftCardRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException(`Gift card with code "${dto.code}" already exists`);
    }

    const giftCard = this.giftCardRepo.create({
      code: dto.code.toUpperCase(),
      initialBalance: dto.initialBalance,
      currentBalance: dto.initialBalance,
      status: GiftCardStatus.ACTIVE,
      discountPercentage: dto.discountPercentage || 0,
      minOrderAmount: dto.minOrderAmount || 0,
      validFrom: dto.validFrom,
      validUntil: dto.validUntil,
      usagePerUser: dto.usagePerUser || 1,
      createdBy: dto.createdBy,
    });

    return this.giftCardRepo.save(giftCard);
  }

  async applyGiftCard(dto: ApplyGiftCardDto): Promise<{ success: boolean; discount: number; newBalance: number }> {
    const giftCard = await this.giftCardRepo.findOne({ where: { code: dto.code.toUpperCase() } });
    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    if (giftCard.status !== GiftCardStatus.ACTIVE) {
      throw new BadRequestException(`Gift card is ${giftCard.status}`);
    }

    if (new Date() < giftCard.validFrom || new Date() > giftCard.validUntil) {
      throw new BadRequestException('Gift card is not valid at this time');
    }

    if (giftCard.usagePerUser > 0) {
      const userUsage = await this.giftCardRepo.count({
        where: { code: dto.code.toUpperCase(), userId: dto.userId },
      });
      if (userUsage >= giftCard.usagePerUser) {
        throw new BadRequestException('You have reached the usage limit for this gift card');
      }
    }

    let discount = 0;

    if (giftCard.discountPercentage > 0) {
      discount = (dto.orderAmount * giftCard.discountPercentage) / 100;
      if (giftCard.minOrderAmount && dto.orderAmount < giftCard.minOrderAmount) {
        throw new BadRequestException(`Minimum order amount of ${giftCard.minOrderAmount} required for this gift card`);
      }
    } else if (giftCard.currentBalance > 0) {
      discount = Math.min(giftCard.currentBalance, dto.orderAmount);
    }

    giftCard.currentBalance -= discount;
    giftCard.usageCount += 1;
    giftCard.userId = dto.userId;

    if (giftCard.currentBalance <= 0) {
      giftCard.status = GiftCardStatus.USED;
    }

    await this.giftCardRepo.save(giftCard);

    if (discount > 0) {
      try {
        await this.walletService.creditWallet(
          dto.userId,
          discount,
          `Gift card ${dto.code} applied to order ${dto.orderId}`,
          `GIFT-${dto.orderId}`
        );
      } catch (error) {
        this.logger.warn(`Wallet credit failed for gift card ${dto.code}: ${(error as Error).message}`);
      }
    }

    await this.auditService.log('gift_card_applied', dto.userId, 'GiftCard', giftCard.id, {
      code: dto.code,
      orderId: dto.orderId,
      discount,
      remainingBalance: giftCard.currentBalance,
    });

    return { success: true, discount, newBalance: giftCard.currentBalance };
  }

  async getGiftCard(code: string): Promise<GiftCardEntity> {
    const card = await this.giftCardRepo.findOne({ where: { code: code.toUpperCase() } });
    if (!card) {
      throw new NotFoundException('Gift card not found');
    }
    return card;
  }

  async getAllGiftCards(filters?: { status?: GiftCardStatus; active?: boolean }): Promise<GiftCardEntity[]> {
    const query = this.giftCardRepo.createQueryBuilder('card');

    if (filters?.status) {
      query.andWhere('card.status = :status', { status: filters.status });
    }
    if (filters?.active !== undefined) {
      query.andWhere('card.status = :status', { status: filters.active ? GiftCardStatus.ACTIVE : GiftCardStatus.USED });
    }

    return query.orderBy('card.createdAt', 'DESC').getMany();
  }

  async deactivateGiftCard(id: string): Promise<GiftCardEntity> {
    const card = await this.giftCardRepo.findOne({ where: { id } });
    if (!card) {
      throw new NotFoundException('Gift card not found');
    }
    card.status = GiftCardStatus.CANCELLED;
    return this.giftCardRepo.save(card);
  }
}
