import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PromptTemplateService, RenderedPrompt } from './prompt-template.service';

export interface TokenBudget {
  maxRequestTokens: number;
  maxUserTokensPerMinute: number;
  maxUserTokensPerHour: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

export interface AICallResult {
  response: string;
  usage: TokenUsage;
  modelUsed: string;
  attempts: number;
  hallucinationDetected: boolean;
}

export interface AIFeedback {
  rating: 'thumbs_up' | 'thumbs_down';
  correction?: string;
  userId?: string;
  orderId?: string;
  promptTemplateId?: string;
}

const HALLUCINATION_PATTERNS = [
  /your order.*delivered/i,
  /order.*confirmed.*\d+/,
  /tracking number:\s*\d+/,
  /refund.*processed.*\$[\d,]+/,
];

const HALLUCINATION_KEYWORDS = ['tracking number', 'your order has been', 'refunded', 'processed'];

const REQUEST_TIMEOUT_MS = 15000;

@Injectable()
export class AIControlPlaneService {
  private readonly logger = new Logger(AIControlPlaneService.name);

  private userTokenUsage: Map<string, { count: number; resetAt: number }> = new Map();

  private readonly defaultBudget: TokenBudget = {
    maxRequestTokens: 1000,
    maxUserTokensPerMinute: 20000,
    maxUserTokensPerHour: 60000,
  };

  private readonly fallbackChain: string[];

  constructor(
    private configService: ConfigService,
    private promptTemplateService: PromptTemplateService,
  ) {
    this.fallbackChain = [
      this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini'),
      this.configService.get<string>('OPENAI_FALLBACK_MODEL', 'gpt-4o'),
      this.configService.get<string>('OPENAI_FALLBACK_MODEL_2', 'gpt-3.5-turbo'),
    ];
  }

  getBudget(): TokenBudget {
    return {
      maxRequestTokens: this.configService.get<number>('AI_MAX_TOKENS', this.defaultBudget.maxRequestTokens),
      maxUserTokensPerMinute: this.configService.get<number>('AI_TOKEN_BUDGET_MINUTE', this.defaultBudget.maxUserTokensPerMinute),
      maxUserTokensPerHour: this.configService.get<number>('AI_TOKEN_BUDGET_HOUR', this.defaultBudget.maxUserTokensPerHour),
    };
  }

  private checkUserBudget(userId: string | undefined, tokensUsed: number): void {
    if (!userId) return;

    const now = Date.now();
    const minuteKey = `${userId}:minute`;
    const hourKey = `${userId}:hour`;

    const minuteBucket = this.userTokenUsage.get(minuteKey);
    if ((!minuteBucket || minuteBucket.resetAt <= now)) {
      this.userTokenUsage.set(minuteKey, { count: 0, resetAt: now + 60000 });
    }
    const newMinuteBucket = this.userTokenUsage.get(minuteKey)!;
    newMinuteBucket.count += tokensUsed;

    if (newMinuteBucket.count > this.getBudget().maxUserTokensPerMinute) {
      throw new Error(`Token budget exceeded for user ${userId} (per-minute limit)`);
    }

    const hourBucket = this.userTokenUsage.get(hourKey);
    if ((!hourBucket || hourBucket.resetAt <= now)) {
      this.userTokenUsage.set(hourKey, { count: 0, resetAt: now + 3600000 });
    }
    const newHourBucket = this.userTokenUsage.get(hourKey)!;
    newHourBucket.count += tokensUsed;

    if (newHourBucket.count > this.getBudget().maxUserTokensPerHour) {
      throw new Error(`Token budget exceeded for user ${userId} (per-hour limit)`);
    }
  }

  detectHallucination(response: string, prompt: string): boolean {
    if (!response || response.trim().length < 10) return true;
    if (response.trim().length > 4000) return true;
    if (response.trim() === prompt.trim()) return true;

    const lower = response.toLowerCase();
    if (HALLUCINATION_PATTERNS.some((p) => p.test(response))) return true;
    if (HALLUCINATION_KEYWORDS.some((kw) => lower.includes(kw))) {
      const confidencePhrases = ['i can', "i'm not sure", 'may have', 'might have', 'could be'];
      const hasLowConfidence = confidencePhrases.some((p) => lower.includes(p));
      if (!hasLowConfidence) return true;
    }

    if (/(.{4,})\1{2,}/.test(response)) return true;

    return false;
  }

  async callWithFallback(
    templateId: string,
    variables: Record<string, string>,
    userId?: string,
  ): Promise<AICallResult> {
    const template = this.promptTemplateService.getTemplate(templateId);
    const rendered = this.promptTemplateService.renderTemplate(template, variables);

    const budget = this.getBudget();
    const maxTokens = Math.min(rendered.maxTokens, budget.maxRequestTokens);

    let attempts = 0;
    let lastError: Error | undefined;

    const fallbackSet = new Set(rendered.fallbackModels || []);
    const modelsToTry = [rendered.model, ...(rendered.fallbackModels || []), ...this.fallbackChain.filter((m) => m !== rendered.model && !fallbackSet.has(m))];
    const uniqueModels = [...new Set(modelsToTry)];

    for (const model of uniqueModels) {
      attempts++;
      try {
        const result = await this.executeAICall(rendered, model, maxTokens, userId);

        if (template.halluctionsChecks && this.detectHallucination(result.response, rendered.messages[1].content)) {
          this.logger.warn(`Hallucination detected in response from model ${model} for template ${templateId}`);
          lastError = new Error('Hallucination detected');
          continue;
        }

        return {
          response: result.response,
          usage: result.usage,
          modelUsed: model,
          attempts,
          hallucinationDetected: false,
        };
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Model ${model} failed (attempt ${attempts}): ${lastError.message}`);
      }
    }

    if (attempts > 0) {
      this.logger.error(`All models failed for template ${templateId}. Last error: ${lastError?.message}`);
    }

    throw new InternalServerErrorException(
      `AI call failed after ${attempts} attempts: ${lastError?.message || 'unknown error'}`
    );
  }

  private async executeAICall(
    rendered: RenderedPrompt,
    model: string,
    maxTokens: number,
    userId?: string,
  ): Promise<{ response: string; usage: TokenUsage }> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
    if (!apiKey || apiKey.includes('CHANGE_ME') || apiKey === 'sk-test-placeholder') {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: rendered.messages,
          max_tokens: maxTokens,
          temperature: rendered.temperature,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = (await response.json()) as {
        choices: Array<{ message?: { content?: string } }>;
        usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      };

      const usage: TokenUsage = {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        model,
      };

      this.checkUserBudget(userId, usage.totalTokens);
      this.logAICall(rendered.templateId, rendered.templateVersion, model, usage, userId);

      return {
        response: data.choices[0]?.message?.content?.trim() || "I'm sorry, I didn't understand that.",
        usage,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private logAICall(
    templateId: string,
    templateVersion: string,
    model: string,
    usage: TokenUsage,
    userId?: string,
  ): void {
    this.logger.log(
      `AI call: template=${templateId}@${templateVersion}, model=${model}, ` +
      `tokens=${usage.totalTokens} (prompt=${usage.promptTokens}, completion=${usage.completionTokens}), user=${userId || 'anonymous'}`
    );
  }

  async recordFeedback(feedback: AIFeedback): Promise<{ recorded: boolean }> {
    this.logger.log(
      `AI feedback: rating=${feedback.rating}, user=${feedback.userId || 'anonymous'}, ` +
      `template=${feedback.promptTemplateId}, correction=${feedback.correction || 'none'}`
    );

    return { recorded: true };
  }

  getUserTokenUsage(userId: string): { minute: number; hour: number } {
    const now = Date.now();
    const minuteKey = `${userId}:minute`;
    const hourKey = `${userId}:hour`;

    const minute = this.userTokenUsage.get(minuteKey);
    const hour = this.userTokenUsage.get(hourKey);

    return {
      minute: minute && minute.resetAt > now ? minute.count : 0,
      hour: hour && hour.resetAt > now ? hour.count : 0,
    };
  }
}
