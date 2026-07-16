import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiKeyService } from './api-key.service';
import { ApiKeyScope } from '../../db/entities/api-key.entity';
import { GenerateApiKeyDto, RevokeApiKeyDto } from './api-key.dto';

@Controller('enterprise/api-keys')
@ApiTags('API Keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @ApiOperation({ summary: 'Generate API key' })
  async generate(@Body() body: GenerateApiKeyDto) {
    return this.apiKeyService.generateApiKey(body.userId, body.name, body.scopes, body.tenantId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get API keys for user' })
  async getUserKeys(@Param('userId') userId: string) {
    return this.apiKeyService.getApiKeys(userId);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get API keys for tenant' })
  async getTenantKeys(@Param('tenantId') tenantId: string) {
    return this.apiKeyService.getTenantApiKeys(tenantId);
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: 'Revoke API key' })
  async revoke(@Param('id') id: string, @Body() body: RevokeApiKeyDto) {
    return this.apiKeyService.revokeApiKey(id, body.revokedBy);
  }

  @Get(':id/rate-limit')
  @ApiOperation({ summary: 'Check rate limit' })
  async checkRateLimit(@Param('id') id: string) {
    return this.apiKeyService.checkRateLimit(id);
  }
}
