import { Controller, Post, Get, Body, Param, UseGuards, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GiftCardService } from './gift-card.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@ApiTags('gift-cards')
@ApiBearerAuth()
@Controller('gift-cards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GiftCardController {
  constructor(private readonly giftCardService: GiftCardService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a gift card' })
  async createGiftCard(@Body() body: any) {
    return this.giftCardService.createGiftCard(body);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all gift cards' })
  async getGiftCards(@Query() query: any) {
    return this.giftCardService.getAllGiftCards(query);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply a gift card to order' })
  async applyGiftCard(@Body() body: any) {
    return this.giftCardService.applyGiftCard(body);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get gift card details by code' })
  async getGiftCard(@Param('code') code: string) {
    return this.giftCardService.getGiftCard(code);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate a gift card' })
  async deactivateGiftCard(@Param('id') id: string) {
    return this.giftCardService.deactivateGiftCard(id);
  }
}
