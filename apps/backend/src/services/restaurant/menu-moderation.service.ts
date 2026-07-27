import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, In, FindOptionsWhere } from 'typeorm';
import { MenuModerationEntity, ModerationStatus, ModerationAction } from '../../db/entities/menu-moderation.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Injectable()
export class MenuModerationService {
  private readonly logger = new Logger(MenuModerationService.name);

  constructor(
    @InjectRepository(MenuModerationEntity)
    private moderationRepo: Repository<MenuModerationEntity>,
    @InjectRepository(MenuItemEntity)
    private itemRepo: Repository<MenuItemEntity>,
    @InjectRepository(RestaurantEntity)
    private restaurantRepo: Repository<RestaurantEntity>,
    @InjectDataSource()
    private connection: DataSource,
  ) {}

  async submitForModeration(
    menuItemId: string,
    restaurantId: string,
    action: ModerationAction,
    data: Record<string, any>,
    originalData?: Record<string, any>,
  ): Promise<MenuModerationEntity> {
    const menuItem = await this.itemRepo.findOne({ where: { id: menuItemId } });
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    const aiFlags = this.detectAIFlags(data);

    const moderation = this.moderationRepo.create({
      menuItemId,
      restaurantId,
      action,
      status: ModerationStatus.PENDING,
      updatedData: data,
      originalData: originalData || {},
      aiFlags,
      flaggedForReview: this.shouldFlagForReview(aiFlags),
    });

    const saved = await this.moderationRepo.save(moderation);

    await this.itemRepo.update(menuItemId, { status: 'pending_moderation' });

    return saved;
  }

  private detectAIFlags(data: Record<string, any> | undefined): { priceAnomaly?: boolean; descriptionIssue?: boolean; imageProblem?: boolean; duplicateDetected?: boolean } {
    const flags: { priceAnomaly?: boolean; descriptionIssue?: boolean; imageProblem?: boolean; duplicateDetected?: boolean } = {};
    const basePrice = typeof data?.basePrice === 'number' ? data.basePrice : Number(data?.basePrice);
    const description = typeof data?.description === 'string' ? data.description : undefined;
    const imageUrl = typeof data?.imageUrl === 'string' ? data.imageUrl : undefined;

    if (basePrice && (basePrice < 10 || basePrice > 5000)) {
      flags.priceAnomaly = true;
    }

    if (description && description.length < 10) {
      flags.descriptionIssue = true;
    }

    if (!imageUrl || imageUrl.includes('placeholder')) {
      flags.imageProblem = true;
    }

    return flags;
  }

  private shouldFlagForReview(flags: any): boolean {
    return Object.values(flags).some((v: any) => v === true);
  }

  async getPendingModerations(restaurantId?: string, priorityOnly: boolean = false): Promise<MenuModerationEntity[]> {
    const where: FindOptionsWhere<MenuModerationEntity> = { status: ModerationStatus.PENDING };
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    return this.moderationRepo.find({
      where,
      relations: { menuItem: true, restaurant: true },
      order: { createdAt: 'DESC' },
    });
  }

  async reviewModeration(
    moderationId: string,
    moderatorId: string,
    status: ModerationStatus,
    notes?: string,
  ): Promise<MenuModerationEntity> {
    const moderation = await this.moderationRepo.findOne({ where: { id: moderationId } });
    if (!moderation) {
      throw new NotFoundException('Moderation request not found');
    }

    await this.moderationRepo.update(moderationId, {
      status,
      moderatorId,
      moderatorNotes: notes,
      reviewedAt: new Date(),
    });

    if (status === ModerationStatus.APPROVED) {
      await this.itemRepo.update(moderation.menuItemId, { status: 'available' });
    } else if (status === ModerationStatus.REJECTED || status === ModerationStatus.CHANGES_REQUESTED) {
      await this.itemRepo.update(moderation.menuItemId, { status: 'rejected' });
    }

    return (await this.moderationRepo.findOne({ where: { id: moderationId } }))!;
  }

  async bulkApprove(moderationIds: string[], moderatorId: string): Promise<void> {
    await this.moderationRepo.update(
      { id: In(moderationIds) },
      { status: ModerationStatus.APPROVED, moderatorId, reviewedAt: new Date() },
    );

    const moderations = await this.moderationRepo.findBy({ id: In(moderationIds) });
    await Promise.all(moderations.map((m) => this.itemRepo.update(m.menuItemId, { status: 'available' })));
  }

  async getModerationStats(restaurantId?: string): Promise<any> {
    const where: FindOptionsWhere<MenuModerationEntity> = {};
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    const [
      totalPending,
      totalApproved,
      totalRejected,
      avgReviewTime,
    ] = await Promise.all([
      this.moderationRepo.count({ where: { ...where, status: ModerationStatus.PENDING } }),
      this.moderationRepo.count({ where: { ...where, status: ModerationStatus.APPROVED } }),
      this.moderationRepo.count({ where: { ...where, status: ModerationStatus.REJECTED } }),
      this.getAverageReviewTime(where),
    ]);

    return {
      pending: totalPending,
      approved: totalApproved,
      rejected: totalRejected,
      avgReviewTimeHours: avgReviewTime,
    };
  }

  private async getAverageReviewTime(where: FindOptionsWhere<MenuModerationEntity>): Promise<number> {
    const result = await this.moderationRepo
      .createQueryBuilder('moderation')
      .select('AVG(TIMESTAMPDIFF(HOUR, moderation.createdAt, moderation.reviewedAt))', 'avgHours')
      .where('moderation.reviewedAt IS NOT NULL')
      .getRawOne();

    return result?.avgHours || 0;
  }
}