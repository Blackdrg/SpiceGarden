import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { CampaignEntity, CampaignType, CampaignStatus, BillingModel } from '../../db/entities/campaign.entity';
export { CampaignStatus, CampaignType, BillingModel } from '../../db/entities/campaign.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepo: Repository<CampaignEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(RestaurantEntity)
    private restaurantRepo: Repository<RestaurantEntity>,
    private dataSource: DataSource,
  ) {}

  async createCampaign(campaignData: Partial<CampaignEntity>): Promise<CampaignEntity> {
    const campaign = this.campaignRepo.create(campaignData);
    campaign.status = CampaignStatus.DRAFT;
    campaign.impressions = 0;
    campaign.clicks = 0;
    campaign.conversions = 0;
    campaign.spentBudget = 0;
    campaign.ctr = 0;
    campaign.cpc = 0;
    campaign.dailyStats = {};
    return this.campaignRepo.save(campaign);
  }

  async activateCampaign(campaignId: string): Promise<CampaignEntity> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.PAUSED) {
      throw new BadRequestException(`Cannot activate campaign in ${campaign.status} status`);
    }

    campaign.status = CampaignStatus.ACTIVE;
    return this.campaignRepo.save(campaign);
  }

  async pauseCampaign(campaignId: string): Promise<CampaignEntity> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    campaign.status = CampaignStatus.PAUSED;
    return this.campaignRepo.save(campaign);
  }

  async getCampaigns(filters?: { status?: CampaignStatus; restaurantId?: string }): Promise<CampaignEntity[]> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.restaurantId) where.restaurantId = filters.restaurantId;
    return this.campaignRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getCampaign(campaignId: string): Promise<CampaignEntity> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async recordImpression(campaignId: string): Promise<void> {
    await this.campaignRepo.increment({ id: campaignId }, 'impressions', 1);
    await this.updateDailyStats(campaignId, 'impressions');
  }

  async recordClick(campaignId: string): Promise<void> {
    await this.campaignRepo.increment({ id: campaignId }, 'clicks', 1);
    await this.updateDailyStats(campaignId, 'clicks');
  }

  async recordConversion(campaignId: string, orderAmount: number): Promise<void> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) return;

    await this.campaignRepo.increment({ id: campaignId }, 'conversions', 1);

    if (campaign.billingModel === BillingModel.CPA && campaign.bidAmount) {
      campaign.spentBudget = Number(campaign.spentBudget) + Number(campaign.bidAmount);
      await this.campaignRepo.save(campaign);
    }

    if (campaign.impressions > 0) {
      campaign.ctr = Math.round((campaign.clicks / campaign.impressions) * 10000) / 100;
    }
    if (campaign.clicks > 0) {
      campaign.cpc = Math.round((campaign.spentBudget / campaign.clicks) * 100) / 100;
    }

    await this.campaignRepo.save(campaign);
  }

  async getCampaignAnalytics(campaignId: string): Promise<any> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return {
      campaignId: campaign.id,
      name: campaign.name,
      status: campaign.status,
      budget: campaign.budget,
      spentBudget: campaign.spentBudget,
      remainingBudget: campaign.budget - campaign.spentBudget,
      impressions: campaign.impressions,
      clicks: campaign.clicks,
      conversions: campaign.conversions,
      ctr: campaign.ctr,
      cpc: campaign.cpc,
      dailyStats: campaign.dailyStats,
      targeting: campaign.targeting,
      creatives: campaign.creatives,
    };
  }

  async getPlatformCampaignStats(startDate: Date, endDate: Date): Promise<any> {
    const campaigns = await this.campaignRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + Number(c.spentBudget), 0);

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === CampaignStatus.ACTIVE).length,
      totalImpressions,
      totalClicks,
      totalConversions,
      totalSpent,
      avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      avgCpc: totalClicks > 0 ? totalSpent / totalClicks : 0,
      campaignsByType: this.groupBy(campaigns, 'campaignType'),
    };
  }

  private async updateDailyStats(campaignId: string, metric: 'impressions' | 'clicks'): Promise<void> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) return;

    const today = new Date().toISOString().split('T')[0];
    const dailyStats = campaign.dailyStats || {};

    if (!dailyStats[today]) {
      dailyStats[today] = { impressions: 0, clicks: 0, spent: 0 };
    }

    dailyStats[today][metric]++;
    campaign.dailyStats = dailyStats;
    await this.campaignRepo.save(campaign);
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) result[groupKey] = [];
      result[groupKey].push(item);
      return result;
    }, {} as Record<string, T[]>);
  }
}
