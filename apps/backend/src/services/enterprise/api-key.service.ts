import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKeyEntity, ApiKeyStatus, ApiKeyScope } from '../../db/entities/api-key.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { TenantEntity } from '../../db/entities/tenant.entity';

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    @InjectRepository(ApiKeyEntity)
    private apiKeyRepo: Repository<ApiKeyEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(TenantEntity)
    private tenantRepo: Repository<TenantEntity>,
    private dataSource: DataSource,
  ) {}

  async generateApiKey(userId: string, name: string, scopes: ApiKeyScope[], tenantId?: string): Promise<{ apiKey: ApiKeyEntity; plainKey: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plainKey = `sg_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');
    const keyPrefix = plainKey.substring(0, 8);

    const apiKey = this.apiKeyRepo.create({
      keyHash,
      keyPrefix,
      name,
      userId,
      tenantId,
      scopes,
      allowedEndpoints: [],
      status: ApiKeyStatus.ACTIVE,
      dailyLimit: 10000,
      monthlyLimit: 300000,
    });

    const saved = await this.apiKeyRepo.save(apiKey);
    return { apiKey: saved, plainKey };
  }

  async validateApiKey(key: string): Promise<ApiKeyEntity | null> {
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const apiKey = await this.apiKeyRepo.findOne({ where: { keyHash } });
    if (!apiKey) return null;

    if (apiKey.status !== ApiKeyStatus.ACTIVE) return null;
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return null;
    }

    apiKey.usageCount++;
    apiKey.lastUsedAt = new Date();
    await this.apiKeyRepo.save(apiKey);

    return apiKey;
  }

  async revokeApiKey(id: string, revokedBy: string): Promise<ApiKeyEntity> {
    const apiKey = await this.apiKeyRepo.findOne({ where: { id } });
    if (!apiKey) throw new NotFoundException('API key not found');

    apiKey.status = ApiKeyStatus.REVOKED;
    apiKey.revokedAt = new Date();
    apiKey.revokedBy = revokedBy;
    return this.apiKeyRepo.save(apiKey);
  }

  async getApiKeys(userId: string): Promise<ApiKeyEntity[]> {
    return this.apiKeyRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTenantApiKeys(tenantId: string): Promise<ApiKeyEntity[]> {
    return this.apiKeyRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async checkRateLimit(apiKeyId: string): Promise<{ allowed: boolean; remaining: number }> {
    const apiKey = await this.apiKeyRepo.findOne({ where: { id: apiKeyId } });
    if (!apiKey) return { allowed: false, remaining: 0 };

    if (apiKey.monthlyLimit > 0 && apiKey.usageCount >= apiKey.monthlyLimit) {
      return { allowed: false, remaining: 0 };
    }

    return {
      allowed: true,
      remaining: apiKey.monthlyLimit > 0 ? apiKey.monthlyLimit - apiKey.usageCount : 999999,
    };
  }
}
