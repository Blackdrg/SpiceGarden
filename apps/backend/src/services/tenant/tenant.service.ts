import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TenantEntity, TenantStatus } from '../../db/entities/tenant.entity';
export { TenantStatus } from '../../db/entities/tenant.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { SubscriptionPlanEntity, SubscriptionPlanType } from '../../db/entities/subscription-plan.entity';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectRepository(TenantEntity)
    private tenantRepo: Repository<TenantEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(SubscriptionPlanEntity)
    private planRepo: Repository<SubscriptionPlanEntity>,
    private dataSource: DataSource,
  ) {}

  async createTenant(tenantData: Partial<TenantEntity>): Promise<TenantEntity> {
    const existing = await this.tenantRepo.findOne({ where: { slug: tenantData.slug } });
    if (existing) throw new BadRequestException('Tenant slug already exists');

    const tenant = this.tenantRepo.create(tenantData);
    return this.tenantRepo.save(tenant);
  }

  async getTenant(slug: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepo.findOne({ where: { slug } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async getTenantById(id: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async updateTenant(id: string, updateData: Partial<TenantEntity>): Promise<TenantEntity> {
    await this.tenantRepo.update(id, updateData);
    return (await this.tenantRepo.findOne({ where: { id } }))!;
  }

  async suspendTenant(id: string): Promise<TenantEntity> {
    return this.updateTenant(id, { status: TenantStatus.SUSPENDED });
  }

  async activateTenant(id: string): Promise<TenantEntity> {
    return this.updateTenant(id, { status: TenantStatus.ACTIVE });
  }

  async listTenants(filters?: { status?: TenantStatus }): Promise<TenantEntity[]> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    return this.tenantRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async updateBranding(id: string, branding: any): Promise<TenantEntity> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    tenant.branding = { ...tenant.branding, ...branding };
    return this.tenantRepo.save(tenant);
  }

  async updateSettings(id: string, settings: any): Promise<TenantEntity> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    tenant.settings = { ...tenant.settings, ...settings };
    return this.tenantRepo.save(tenant);
  }

  async getTenantAnalytics(id: string, startDate: Date, endDate: Date): Promise<any> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    return {
      tenantId: tenant.id,
      name: tenant.name,
      status: tenant.status,
      createdAt: tenant.createdAt,
      features: tenant.features,
      maxUsers: tenant.maxUsers,
      maxRestaurants: tenant.maxRestaurants,
    };
  }
}
