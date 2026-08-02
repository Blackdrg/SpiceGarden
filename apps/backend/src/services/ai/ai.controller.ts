import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Get('recommendations')
  async getRecs(@Req() req: any) {
    return this.aiService.getRecommendations(req.user.userId);
  }

  @Post('chatbot')
  async askChatbot(@Body('message') message: string) {
    const reply = await this.aiService.chatbotResponse(message);
    return { reply };
  }

  @Get('forecast')
  async getForecast(@Query('branchId') branchId: string) {
    return this.aiService.predictDemand(branchId, new Date());
  }

  @Post('embedding')
  async getEmbedding(@Body('text') text: string) {
    const embedding = await this.aiService.generateEmbedding(text);
    return { embedding };
  }

  @Post('semantic-search')
  async semanticSearch(@Body('query') query: string, @Query('topK') topK: number = 5) {
    const results = await this.aiService.semanticSearch(query, topK);
    return { results };
  }

  @Post('rag/document')
  async addRagDocument(@Body() body: { id: string; content: string; source: string; metadata?: Record<string, any> }) {
    await this.aiService.addRAGDocument(body.id, body.content, body.source, body.metadata || {});
    return { success: true, documentId: body.id };
  }

  @Post('context-memory')
  async addContextMemory(@Body() body: { sessionId: string; role: 'user' | 'assistant'; content: string }) {
    await this.aiService.addContextMemory(body.sessionId, body.role, body.content);
    return { success: true };
  }

  @Get('context-memory/:sessionId')
  async getContextMemory(@Req() req: any, @Query('sessionId') sessionId: string) {
    const memory = await this.aiService.getContextMemory(sessionId || req.params.sessionId);
    return { memory };
  }

  @Post('dynamic-pricing')
  async dynamicPricing(@Body() body: { basePrice: number; restaurantId: string; userId: string }) {
    const result = await this.aiService.dynamicPricing(body.basePrice, body.restaurantId, body.userId);
    return result;
  }

  @Post('route-optimize')
  async routeOptimize(@Body() body: { stops: Array<{ lat: number; lng: number; address: string }>; restaurantLocation: { lat: number; lng: number; address: string } }) {
    const result = await this.aiService.optimizeRoute(body.stops, body.restaurantLocation);
    return result;
  }
}