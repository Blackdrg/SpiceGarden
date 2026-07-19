import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsIngestController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ingest a client analytics event' })
  @ApiResponse({ status: 200, description: 'Event recorded' })
  async trackEvent(@Body() body: Record<string, any>) {
    if (!body || typeof body !== 'object' || typeof body.type !== 'string') {
      return { ok: false, error: 'invalid payload' };
    }
    const result = await this.analyticsService.trackEvent({
      type: body.type,
      userId: body.userId ?? null,
      sessionId: body.sessionId ?? null,
      properties: body.properties ?? null,
      timestamp: body.timestamp,
    });
    return { ok: true, id: result.id };
  }
}
