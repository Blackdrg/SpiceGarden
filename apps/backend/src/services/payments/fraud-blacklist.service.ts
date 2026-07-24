import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudBlacklistEntity, BanType } from '../../db/entities/fraud-blacklist.entity';
import { AuditService } from '../../audit/audit.service';

export interface AddToBlacklistDto {
  entityType: string;
  entityValue: string;
  banType?: BanType;
  reason?: string;
  evidence?: Record<string, any>;
  expiresAt?: Date;
  createdBy?: string;
}

@Injectable()
export class FraudBlacklistService {
  private readonly logger = new Logger(FraudBlacklistService.name);

  constructor(
    @InjectRepository(FraudBlacklistEntity)
    private readonly blacklistRepo: Repository<FraudBlacklistEntity>,
    private readonly auditService: AuditService,
  ) {}

  async addToBlacklist(dto: AddToBlacklistDto): Promise<FraudBlacklistEntity> {
    const existing = await this.blacklistRepo.findOne({
      where: { entityType: dto.entityType, entityValue: dto.entityValue, isActive: true },
    });

    if (existing) {
      this.logger.warn(`Entity ${dto.entityType}:${dto.entityValue} already blacklisted`);
      return existing;
    }

    const entry = this.blacklistRepo.create({
      entityType: dto.entityType,
      entityValue: dto.entityValue,
      banType: dto.banType || BanType.SOFT,
      reason: dto.reason,
      evidence: dto.evidence,
      expiresAt: dto.expiresAt,
      createdBy: dto.createdBy,
    });

    const saved = await this.blacklistRepo.save(entry);

    await this.auditService.log('entity_blacklisted', dto.createdBy || 'system', 'FraudBlacklist', saved.id, {
      entityType: dto.entityType,
      entityValue: dto.entityValue,
      banType: saved.banType,
      reason: dto.reason,
    });

    this.logger.log(`Blacklisted: ${dto.entityType} = ${dto.entityValue}`);
    return saved;
  }

  async isBlacklisted(entityType: string, entityValue: string): Promise<boolean> {
    const entry = await this.blacklistRepo.findOne({
      where: { entityType, entityValue, isActive: true },
    });

    if (!entry) return false;

    if (entry.expiresAt && entry.expiresAt < new Date()) {
      entry.isActive = false;
      await this.blacklistRepo.save(entry);
      return false;
    }

    return true;
  }

  async getBlacklistEntries(filters?: { active?: boolean }): Promise<FraudBlacklistEntity[]> {
    const query = this.blacklistRepo.createQueryBuilder('entry');

    if (filters?.active !== undefined) {
      query.andWhere('entry.isActive = :active', { active: filters.active });
    }

    return query.orderBy('entry.createdAt', 'DESC').getMany();
  }

  async removeFromBlacklist(id: string): Promise<void> {
    const entry = await this.blacklistRepo.findOne({ where: { id } });
    if (!entry) return;

    entry.isActive = false;
    await this.blacklistRepo.save(entry);
  }

  async getBlacklistStats(): Promise<{ totalEntries: number; activeEntries: number; byType: Record<string, number> }> {
    const [total, active, allEntries] = await Promise.all([
      this.blacklistRepo.count(),
      this.blacklistRepo.count({ where: { isActive: true } }),
      this.blacklistRepo.find({ where: { isActive: true }, take: 500 }),
    ]);

    const byType: Record<string, number> = {};
    for (const entry of allEntries) {
      byType[entry.entityType] = (byType[entry.entityType] || 0) + 1;
    }

    return { totalEntries: total, activeEntries: active, byType };
  }
}