import { Controller, Post, Get, Put, Param, Body, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { RestaurantOnboardingService } from './onboarding.service';
import { OnboardingStep } from '../../db/entities/restaurant-onboarding.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import { type Request } from 'express';

@ApiTags('restaurant-onboarding')
@Controller('restaurant-onboarding')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
export class RestaurantOnboardingController {

  constructor(private readonly onboardingService: RestaurantOnboardingService) {}

  @Post('initialize/:restaurantId')
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initialize onboarding for a restaurant' })
  @ApiResponse({ status: 200, description: 'Onboarding initialized successfully' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  @ApiParam({ name: 'restaurantId', type: 'string' })
  async initializeOnboarding(
    @Param('restaurantId') restaurantId: string
  ) {
    return await this.onboardingService.initializeOnboarding(restaurantId);
  }

  @Put('step/:onboardingId')
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update onboarding step' })
  @ApiResponse({ status: 200, description: 'Onboarding step updated successfully' })
  @ApiResponse({ status: 404, description: 'Onboarding record not found' })
  @ApiParam({ name: 'onboardingId', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        step: { type: 'string', enum: Object.values(OnboardingStep) },
        data: { type: 'object' }
      },
      required: ['step']
    }
  })
  async updateStep(
    @Param('onboardingId') onboardingId: string,
    @Body() body: any
  ) {
    return await this.onboardingService.updateStep(
      onboardingId,
      body.step as OnboardingStep,
      body.data
    );
  }

  @Get('status/:restaurantId')
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get onboarding status for a restaurant' })
  @ApiResponse({ status: 200, description: 'Onboarding status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Onboarding record not found' })
  @ApiParam({ name: 'restaurantId', type: 'string' })
  async getOnboardingStatus(
    @Param('restaurantId') restaurantId: string
  ) {
    return await this.onboardingService.getOnboardingStatus(restaurantId);
  }

  @Post('complete/:onboardingId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete onboarding' })
  @ApiResponse({ status: 200, description: 'Onboarding completed successfully' })
  @ApiResponse({ status: 404, description: 'Onboarding record not found' })
  @ApiParam({ name: 'onboardingId', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reviewedBy: { type: 'string' }
      },
      required: ['reviewedBy']
    }
  })
  async completeOnboarding(
    @Param('onboardingId') onboardingId: string,
    @Body() body: any
  ) {
    return await this.onboardingService.completeOnboarding(
      onboardingId,
      body.reviewedBy
    );
  }

  @Post('reject/:onboardingId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject onboarding' })
  @ApiResponse({ status: 200, description: 'Onboarding rejected successfully' })
  @ApiResponse({ status: 404, description: 'Onboarding record not found' })
  @ApiParam({ name: 'onboardingId', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reviewedBy: { type: 'string' },
        reason: { type: 'string' }
      },
      required: ['reviewedBy', 'reason']
    }
  })
  async rejectOnboarding(
    @Param('onboardingId') onboardingId: string,
    @Body() body: any
  ) {
    return await this.onboardingService.rejectOnboarding(
      onboardingId,
      body.reviewedBy,
      body.reason
    );
  }

  @Put('gst/:restaurantId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('restaurants:manage_own')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Configure GST for a restaurant' })
  async submitGSTConfig(
    @Param('restaurantId') restaurantId: string,
    @Body() gstData: any
  ) {
    return await this.onboardingService.submitGSTConfig(restaurantId, gstData);
  }

  @Put('pricing/:restaurantId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('restaurants:manage_own')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Setup pricing for a restaurant' })
  async setupPricing(
    @Param('restaurantId') restaurantId: string,
    @Body() pricing: any
  ) {
    return await this.onboardingService.setupPricing(restaurantId, pricing);
  }

  @Put('payout/:restaurantId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('restaurants:manage_own')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Setup payout settings for a restaurant' })
  async setupPayout(
    @Param('restaurantId') restaurantId: string,
    @Body() payout: any
  ) {
    return await this.onboardingService.setupPayout(restaurantId, payout);
  }

  @Get('analytics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get onboarding analytics' })
  @ApiResponse({ status: 200, description: 'Onboarding analytics retrieved successfully' })
  async getOnboardingAnalytics() {

    return await this.onboardingService.getOnboardingAnalytics();
  }
}

