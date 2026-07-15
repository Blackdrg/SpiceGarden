import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CampaignService, CampaignStatus } from './campaign.service';

@Controller('marketing/campaigns')
@ApiTags('Campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @ApiOperation({ summary: 'Create campaign' })
  async create(@Body() campaignData: any) {
    return this.campaignService.createCampaign(campaignData);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate campaign' })
  async activate(@Param('id') id: string) {
    return this.campaignService.activateCampaign(id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause campaign' })
  async pause(@Param('id') id: string) {
    return this.campaignService.pauseCampaign(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get campaigns' })
  async getCampaigns(@Body() body?: { status?: CampaignStatus; restaurantId?: string }) {
    return this.campaignService.getCampaigns(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign details' })
  async getCampaign(@Param('id') id: string) {
    return this.campaignService.getCampaign(id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get campaign analytics' })
  async getAnalytics(@Param('id') id: string) {
    return this.campaignService.getCampaignAnalytics(id);
  }

  @Post(':id/impression')
  @ApiOperation({ summary: 'Record impression' })
  async recordImpression(@Param('id') id: string) {
    await this.campaignService.recordImpression(id);
    return { success: true };
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Record click' })
  async recordClick(@Param('id') id: string) {
    await this.campaignService.recordClick(id);
    return { success: true };
  }

  @Post(':id/conversion')
  @ApiOperation({ summary: 'Record conversion' })
  async recordConversion(@Param('id') id: string, @Body() body: { orderAmount: number }) {
    await this.campaignService.recordConversion(id, body.orderAmount);
    return { success: true };
  }

  @Get('platform/stats')
  @ApiOperation({ summary: 'Get platform campaign stats' })
  async getPlatformStats(@Body() body: { startDate: string; endDate: string }) {
    return this.campaignService.getPlatformCampaignStats(new Date(body.startDate), new Date(body.endDate));
  }
}
