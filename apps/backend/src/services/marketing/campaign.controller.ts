import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CampaignService, CampaignStatus } from './campaign.service';
import { CreateCampaignDto, RecordConversionDto } from './campaign.dto';

@Controller('marketing/campaigns')
@ApiTags('Campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @ApiOperation({ summary: 'Create campaign' })
  async create(@Body() campaignData: CreateCampaignDto) {
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
  async getCampaigns(@Query() query: { status?: CampaignStatus; restaurantId?: string }) {
    return this.campaignService.getCampaigns(query);
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
  async recordConversion(@Param('id') id: string, @Body() body: RecordConversionDto) {
    await this.campaignService.recordConversion(id, body.orderAmount);
    return { success: true };
  }

  @Get('platform/stats')
  @ApiOperation({ summary: 'Get platform campaign stats' })
  async getPlatformStats(@Query() query: { startDate: string; endDate: string }) {
    return this.campaignService.getPlatformCampaignStats(new Date(query.startDate), new Date(query.endDate));
  }
}
