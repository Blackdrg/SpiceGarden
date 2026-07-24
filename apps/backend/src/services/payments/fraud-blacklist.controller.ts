import { Controller, Get, Post, Body, Param, UseGuards, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FraudBlacklistService } from './fraud-blacklist.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@ApiTags('fraud-blacklist')
@ApiBearerAuth()
@Controller('fraud-blacklist')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FraudBlacklistController {
  constructor(private readonly fraudBlacklistService: FraudBlacklistService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add entity to fraud blacklist' })
  async addToBlacklist(@Body() body: any) {
    return this.fraudBlacklistService.addToBlacklist(body);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all blacklist entries' })
  async getBlacklistEntries(@Query() query: any) {
    return this.fraudBlacklistService.getBlacklistEntries({ active: query.active !== 'false' });
  }

  @Post('check')
  @ApiOperation({ summary: 'Check if an entity is blacklisted' })
  async checkBlacklist(@Body() body: { entityType: string; entityValue: string }) {
    const isBlacklisted = await this.fraudBlacklistService.isBlacklisted(body.entityType, body.entityValue);
    return { isBlacklisted, entityType: body.entityType, entityValue: body.entityValue };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove entity from blacklist' })
  async removeFromBlacklist(@Param('id') id: string) {
    await this.fraudBlacklistService.removeFromBlacklist(id);
    return { message: 'Removed from blacklist' };
  }
}
