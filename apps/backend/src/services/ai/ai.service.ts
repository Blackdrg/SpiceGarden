import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '../../metrics/metrics.service';

export interface EmbeddingVector {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
}

export interface RAGDocument {
  id: string;
  content: string;
  embedding: number[];
  source: string;
  metadata: Record<string, any>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DemandForecast {
  predictedOrders: number;
  busyHours: string[];
  confidence: number;
  hourlyBreakdown: Record<string, number>;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface DynamicPriceResult {
  basePrice: number;
  multiplier: number;
  finalPrice: number;
  reason: string;
}

interface RoutePoint {
  lat: number;
  lng: number;
  address: string;
}

export interface RouteOptimizationResult {
  optimizedStops: RoutePoint[];
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  routeId: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openaiApiKey: string;
  private readonly openaiModel: string;
  private readonly embeddingModel: string;
  private readonly vectordbEnabled: boolean;
  private readonly vectorDbUrl: string;
  private readonly vectorDbApiKey: string;
  private readonly ragEnabled: boolean;
  private readonly ragDocuments: RAGDocument[] = [];
  private readonly contextMemory: Map<string, ChatMessage[]> = new Map();

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuRepo: Repository<MenuItemEntity>,
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY', '');
    this.openaiModel = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
    this.embeddingModel = this.configService.get<string>('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small');
    this.vectordbEnabled = this.configService.get<boolean>('VECTOR_DB_ENABLED', false);
    this.vectorDbUrl = this.configService.get<string>('VECTOR_DB_URL', '');
    this.vectorDbApiKey = this.configService.get<string>('VECTOR_DB_API_KEY', '');
    this.ragEnabled = this.configService.get<boolean>('RAG_ENABLED', false);
  }

  async getRecommendations(userId: string) {
    const recentOrders = await this.orderRepo.find({
      where: { userId },
      relations: {
        items: {
          menuItem: {
            category: true,
          },
        },
      },
      take: 10,
      order: { createdAt: 'DESC' },
    });

    const preferredCategoryIds = new Set<string>();
    const categoryScores = new Map<string, number>();
    recentOrders.forEach((order) => {
      order.items?.forEach((item) => {
        if (item.menuItem?.category?.id) {
          const catId = item.menuItem.category.id;
          const score = categoryScores.get(catId) || 0;
          categoryScores.set(catId, score + 1);
          preferredCategoryIds.add(catId);
        }
      });
    });

    if (preferredCategoryIds.size > 0) {
      const sortedCategories = Array.from(categoryScores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id);

      return this.menuRepo.find({
        where: { category: { id: sortedCategories[0] } as any },
        take: 5,
      });
    }

    return this.menuRepo.find({ take: 5, order: { createdAt: 'DESC' } });
  }

  async predictDemand(branchId: string, date: Date): Promise<DemandForecast> {
    const start = Date.now();
    const endpoint = 'forecast';

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [historicalOrders, trendMultiplier] = await Promise.all([
      this.orderRepo.find({
        where: {
          restaurantId: branchId,
          createdAt: Between(startOfDay, endOfDay),
        },
        select: ['createdAt'],
      }),
      this.calculateTrendMultiplier(branchId, date),
    ]);

    const hourlyCounts = new Map<string, number>();
    const hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
    hours.forEach((h) => hourlyCounts.set(h, 0));

    historicalOrders.forEach((order) => {
      const hour = order.createdAt.getHours().toString().padStart(2, '0');
      hourlyCounts.set(hour, (hourlyCounts.get(hour) || 0) + 1);
    });

    const totalOrders = historicalOrders.length;
    const baselineOrders = totalOrders > 0 ? totalOrders : 50;

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendMultiplier = isWeekend ? 1.3 : 1.0;

    const predictedOrders = Math.max(10, Math.floor(baselineOrders * trendMultiplier * weekendMultiplier));

    const sortedHours = [...hourlyCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([hour]) => `${hour}:00`);

    const avgHourlyVariance = this.calculateHourlyVariance(hourlyCounts);
    const confidence = Math.max(0.5, Math.min(0.95, 1 - avgHourlyVariance));

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (trendMultiplier > 1.05) trend = 'increasing';
    else if (trendMultiplier < 0.95) trend = 'decreasing';

    const result = {
      predictedOrders,
      busyHours: sortedHours,
      confidence,
      hourlyBreakdown: Object.fromEntries(hourlyCounts),
      trend,
    };

    this.metricsService.incrementAiCall(endpoint, 'success');
    this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
    return result;
  }

  private async calculateTrendMultiplier(branchId: string, date: Date): Promise<number> {
    const lookbackDays = 7;
    const currentDate = new Date(date);
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - lookbackDays);

    const currentStart = new Date(currentDate);
    currentStart.setHours(0, 0, 0, 0);
    const currentEnd = new Date(currentDate);
    currentEnd.setHours(23, 59, 59, 999);

    const prevStart = new Date(prevDate);
    prevStart.setHours(0, 0, 0, 0);
    const prevEnd = new Date(prevDate);
    prevEnd.setHours(23, 59, 59, 999);

    const [currentCount, prevCount] = await Promise.all([
      this.orderRepo.count({
        where: {
          restaurantId: branchId,
          createdAt: Between(currentStart, currentEnd),
        },
      }),
      this.orderRepo.count({
        where: {
          restaurantId: branchId,
          createdAt: Between(prevStart, prevEnd),
        },
      }),
    ]);

    const current = currentCount as unknown as number;
    const prev = prevCount as unknown as number;

    if (prev === 0) return 1.0;
    return Math.max(0.5, Math.min(2.0, current / prev));
  }

  private calculateHourlyVariance(counts: Map<string, number>): number {
    const values = Array.from(counts.values());
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const maxVal = Math.max(...values, 1);
    return variance / (maxVal * maxVal);
  }

  async chatbotResponse(message: string): Promise<string> {
    if (!message || typeof message !== 'string') {
      return 'Please provide a message so I can help you.';
    }

    const start = Date.now();
    const endpoint = 'chatbot';

    if (this.openaiApiKey && this.openaiApiKey !== 'sk-test-placeholder' && !this.openaiApiKey.includes('CHANGE_ME')) {
      try {
        const reply = await this.callOpenAI(message);
        this.metricsService.incrementAiCall(endpoint, 'success');
        this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
        return reply;
      } catch (error) {
        this.metricsService.incrementAiCall(endpoint, 'error');
        this.metricsService.incrementAiError(endpoint, error instanceof Error ? error.message : String(error));
        this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
        this.logger.warn(`OpenAI chatbot failed, falling back to rule-based: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const reply = this.fallbackChatbotResponse(message);
    this.metricsService.incrementAiCall(endpoint, 'fallback');
    this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
    return reply;
  }

  private async callOpenAI(message: string): Promise<string> {
    const systemPrompt = `You are SpiceGarden's customer support assistant. You help customers with:
- Order status and tracking
- Refund and return policies
- Menu recommendations
- Restaurant information
- Delivery estimates
- Payment and billing questions

Respond concisely and helpfully. If you cannot answer a question, offer to connect them to a human agent.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = (await response.json()) as { choices: Array<{ message?: { content?: string } }> };
    return data.choices[0]?.message?.content?.trim() || "I'm sorry, I didn't understand that.";
  }

  private fallbackChatbotResponse(message: string): string {
    const msg = message.toLowerCase();
    if (msg.includes('order status') || msg.includes('track')) return 'You can track your order in the "Active Orders" section of your dashboard.';
    if (msg.includes('refund') || msg.includes('return')) return 'Refunds typically take 5-7 business days to process. You can initiate a refund from your order details page.';
    if (msg.includes('contact') || msg.includes('support') || msg.includes('help')) return 'You can reach us at support@spicegarden.com or call 1800-SPICE.';
    if (msg.includes('menu') || msg.includes('order') || msg.includes('food')) return 'Browse our restaurant menu for available dishes. You can filter by cuisine, dietary preferences, and price range.';
    if (msg.includes('delivery') || msg.includes('delivery time') || msg.includes('eta')) return 'Delivery typically takes 30-45 minutes depending on restaurant preparation time and your location.';
    if (msg.includes('payment') || msg.includes('pay') || msg.includes('price') || msg.includes('cost')) return 'We accept credit/debit cards, UPI, net banking, wallets, and cash on delivery.';
    return "I'm sorry, I didn't quite catch that. Would you like to speak to a human agent?";
  }

  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.openaiApiKey || this.openaiApiKey.includes('CHANGE_ME') || this.openaiApiKey === 'sk-test-placeholder') {
      this.logger.warn('OpenAI API key not configured for embeddings');
      this.metricsService.incrementAiCall('embedding', 'fallback');
      return null;
    }

    const start = Date.now();

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: this.embeddingModel,
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const embedding = data.data[0]?.embedding || null;
      
      if (embedding) {
        this.metricsService.incrementAiCall('embedding', 'success');
        this.metricsService.recordAiCallDuration('embedding', (Date.now() - start) / 1000);
      }
      
      return embedding;
    } catch (error) {
      this.metricsService.incrementAiCall('embedding', 'error');
      this.metricsService.incrementAiError('embedding', error instanceof Error ? error.message : String(error));
      this.metricsService.recordAiCallDuration('embedding', (Date.now() - start) / 1000);
      this.logger.error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  async semanticSearch(query: string, topK: number = 5): Promise<RAGDocument[]> {
    const start = Date.now();
    const endpoint = 'semantic-search';

    if (!this.ragEnabled) {
      this.metricsService.incrementAiCall(endpoint, 'fallback');
      this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
      this.logger.warn('RAG is not enabled');
      return [];
    }

    const queryEmbedding = await this.generateEmbedding(query);
    if (!queryEmbedding) {
      this.metricsService.incrementAiCall(endpoint, 'fallback');
      this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
      this.logger.warn('Could not generate query embedding, returning empty results');
      return [];
    }

    let results: RAGDocument[];
    if (this.vectordbEnabled && this.vectorDbUrl) {
      try {
        results = await this.searchVectorDB(queryEmbedding, topK);
        this.metricsService.incrementAiCall(endpoint, 'success');
      } catch (error) {
        this.metricsService.incrementAiCall(endpoint, 'error');
        this.metricsService.incrementAiError(endpoint, error instanceof Error ? error.message : String(error));
        results = this.fallbackSemanticSearch(query, queryEmbedding, topK);
      }
    } else {
      results = this.fallbackSemanticSearch(query, queryEmbedding, topK);
      this.metricsService.incrementAiCall(endpoint, 'fallback');
    }

    this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
    return results;
  }

  private async searchVectorDB(queryEmbedding: number[], topK: number): Promise<RAGDocument[]> {
    try {
      const response = await fetch(`${this.vectorDbUrl}/collections/spicegarden/documents/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.vectorDbApiKey}`,
        },
        body: JSON.stringify({
          vector: queryEmbedding,
          top_k: topK,
          include_metadata: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Vector DB query error: ${response.status}`);
      }

const data = await response.json() as any;
       return (data.results || []).map((r: any) => ({
        id: r.id,
        content: r.payload?.content || '',
        embedding: r.vector,
        source: r.payload?.source || 'unknown',
        metadata: r.payload?.metadata || {},
      }));
    } catch (error) {
      this.logger.error(`Vector DB search failed: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  private fallbackSemanticSearch(query: string, queryEmbedding: number[], topK: number): RAGDocument[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    const scored = this.ragDocuments.map((doc) => {
      const docWords = doc.content.toLowerCase().split(/\s+/);
      const docWordSet = new Set(docWords);
      const intersection = queryWords.filter((w) => docWordSet.has(w));
      const score = intersection.length / Math.max(queryWords.length, 1);
      return { ...doc, score };
    });

    return scored
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, topK);
  }

  async addRAGDocument(id: string, content: string, source: string, metadata: Record<string, any> = {}): Promise<void> {
    const start = Date.now();
    const endpoint = 'rag-document';

    const embedding = await this.generateEmbedding(content);
    if (!embedding) {
      this.metricsService.incrementAiCall(endpoint, 'fallback');
      this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
      this.logger.warn(`Could not generate embedding for document ${id}`);
      return;
    }

    this.ragDocuments.push({
      id,
      content,
      embedding,
      source,
      metadata,
    });

    if (this.vectordbEnabled && this.vectorDbUrl) {
      try {
        await this.indexInVectorDB({ id, content, embedding, source, metadata });
        this.metricsService.incrementAiCall(endpoint, 'success');
      } catch (error) {
        this.metricsService.incrementAiCall(endpoint, 'error');
        this.metricsService.incrementAiError(endpoint, error instanceof Error ? error.message : String(error));
      }
    } else {
      this.metricsService.incrementAiCall(endpoint, 'fallback');
    }

    this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
  }

  private async indexInVectorDB(doc: RAGDocument): Promise<void> {
    try {
      await fetch(`${this.vectorDbUrl}/collections/spicegarden/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.vectorDbApiKey}`,
        },
        body: JSON.stringify({
          id: doc.id,
          vector: doc.embedding,
          payload: {
            content: doc.content,
            source: doc.source,
            metadata: doc.metadata,
          },
        }),
      });
    } catch (error) {
      this.logger.error(`Failed to index document in vector DB: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getContextMemory(sessionId: string): Promise<ChatMessage[]> {
    return this.contextMemory.get(sessionId) || [];
  }

  async addContextMemory(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    if (!this.contextMemory.has(sessionId)) {
      this.contextMemory.set(sessionId, []);
    }
    const memory = this.contextMemory.get(sessionId)!;
    memory.push({ role, content });
    if (memory.length > 20) {
      memory.splice(0, memory.length - 20);
    }
  }

  async dynamicPricing(basePrice: number, restaurantId: string, userId: string): Promise<DynamicPriceResult> {
    const start = Date.now();
    const endpoint = 'dynamic-pricing';

    try {
      const [demandForecast, recentOrders] = await Promise.all([
        this.predictDemand(restaurantId, new Date()),
        this.orderRepo.count({
          where: { restaurantId },
        }),
      ]);
      const demandMultiplier = demandForecast.predictedOrders > 100 ? 1.15 : demandForecast.predictedOrders > 50 ? 1.05 : 1.0;
      const popularityMultiplier = recentOrders > 500 ? 1.1 : recentOrders > 200 ? 1.05 : 1.0;

      const multiplier = demandMultiplier * popularityMultiplier;
      const finalPrice = Math.round(basePrice * multiplier * 100) / 100;

      let reason = `Base price`;
      if (demandMultiplier > 1.0) reason += ` + demand surge (${(demandMultiplier - 1) * 100}%)`;
      if (popularityMultiplier > 1.0) reason += ` + popularity (${(popularityMultiplier - 1) * 100}%)`;

      const result = {
        basePrice,
        multiplier: Math.round(multiplier * 1000) / 1000,
        finalPrice,
        reason,
      };

      this.metricsService.incrementAiCall(endpoint, 'success');
      this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
      return result;
    } catch (error) {
      this.metricsService.incrementAiCall(endpoint, 'error');
      this.metricsService.incrementAiError(endpoint, error instanceof Error ? error.message : String(error));
      this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
      throw error;
    }
  }

  async optimizeRoute(stops: RoutePoint[], restaurantLocation: RoutePoint): Promise<RouteOptimizationResult> {
    const start = Date.now();
    const endpoint = 'route-optimize';

    try {
      if (stops.length === 0) {
        const result = {
          optimizedStops: [restaurantLocation],
          totalDistanceKm: 0,
          estimatedDurationMinutes: 0,
          routeId: `route-${Date.now()}`,
        };
        this.metricsService.incrementAiCall(endpoint, 'success');
        this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
        return result;
      }

      const allPoints = [restaurantLocation, ...stops];
      const optimizedStops = this.nearestNeighborTSP(allPoints);

      let totalDistanceKm = 0;
      for (let i = 0; i < optimizedStops.length - 1; i++) {
        totalDistanceKm += this.haversineKm(
          optimizedStops[i].lat,
          optimizedStops[i].lng,
          optimizedStops[i + 1].lat,
          optimizedStops[i + 1].lng,
        );
      }

      const estimatedDurationMinutes = Math.round(totalDistanceKm * 3);

      const result = {
        optimizedStops,
        totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
        estimatedDurationMinutes,
        routeId: `route-${Date.now()}`,
      };

      this.metricsService.incrementAiCall(endpoint, 'success');
      this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
      return result;
    } catch (error) {
      this.metricsService.incrementAiCall(endpoint, 'error');
      this.metricsService.incrementAiError(endpoint, error instanceof Error ? error.message : String(error));
      this.metricsService.recordAiCallDuration(endpoint, (Date.now() - start) / 1000);
      throw error;
    }
  }

  private nearestNeighborTSP(points: RoutePoint[]): RoutePoint[] {
    if (points.length <= 1) return [...points];

    const visited = new Set<number>();
    const result: RoutePoint[] = [points[0]];
    visited.add(0);

    while (visited.size < points.length) {
      const last = result[result.length - 1];
      let nearestIdx = -1;
      let nearestDist = Infinity;

      for (let i = 0; i < points.length; i++) {
        if (visited.has(i)) continue;
        const dist = this.haversineKm(last.lat, last.lng, points[i].lat, points[i].lng);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }

      if (nearestIdx >= 0) {
        result.push(points[nearestIdx]);
        visited.add(nearestIdx);
      }
    }

    return result;
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
