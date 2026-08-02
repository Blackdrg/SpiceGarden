import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { AIControlPlaneService } from '../src/services/ai/ai-control-plane.service';
import { PromptTemplateService } from '../src/services/ai/prompt-template.service';

function createServices() {
  const configService = {
    get: jest.fn((key: string, fallback?: any) => {
      const defaults: Record<string, any> = {
        OPENAI_API_KEY: 'sk-test-key',
        OPENAI_MODEL: 'gpt-4o-mini',
      };
      return defaults[key] ?? fallback;
    }),
  };

  const promptTemplateService = new PromptTemplateService(configService as any);
  const controlPlane = new AIControlPlaneService(configService as any, promptTemplateService as any);

  return { controlPlane, promptTemplateService, configService };
}

const mockFetchSuccess = (content: string) => ({
  ok: true,
  json: async () => ({
    choices: [{ message: { content } }],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
  }),
});

const mockFetchError = (status: number) => ({
  ok: false,
  status,
  json: async () => ({}),
});

describe('AIControlPlaneService', () => {
  let ctx: ReturnType<typeof createServices>;

  beforeEach(() => {
    ctx = createServices();
    (global as any).fetch = jest.fn();
  });

  describe('detectHallucination', () => {
    it('flags responses shorter than 10 characters', () => {
      expect(ctx.controlPlane.detectHallucination('short', 'hello there')).toBe(true);
    });

    it('flags responses that exactly match the prompt', () => {
      const prompt = 'hello there friend';
      expect(ctx.controlPlane.detectHallucination(prompt, prompt)).toBe(true);
    });

    it('flags responses with repeated phrases', () => {
      expect(ctx.controlPlane.detectHallucination('blah blah blah blah blah ', 'hello')).toBe(true);
    });

    it('passes through legitimate responses', () => {
      expect(ctx.controlPlane.detectHallucination('I can help you track your order.', 'track order')).toBe(false);
    });

    it('flags responses with tracking number keywords without low-confidence qualifiers', () => {
      expect(ctx.controlPlane.detectHallucination('Your order has been delivered.', 'hello')).toBe(true);
    });

    it('allows responses with low-confidence qualifiers even with suspicious keywords', () => {
      expect(ctx.controlPlane.detectHallucination("I'm not sure but your order may have shipped.", 'hello')).toBe(false);
    });
  });

  describe('callWithFallback', () => {
    it('returns the response on first model success', async () => {
      const mockFetch = (global as any).fetch;
      mockFetch.mockResolvedValue(mockFetchSuccess('Here is your order status.') as any);

      const result = await ctx.controlPlane.callWithFallback('customer-support-v1', { message: 'Where is my order?' }, 'user-1');

      expect(result.response).toBe('Here is your order status.');
      expect(result.modelUsed).toBe('gpt-4o-mini');
      expect(result.attempts).toBe(1);
      expect(result.hallucinationDetected).toBe(false);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.model).toBe('gpt-4o-mini');
    });

    it('falls back to alternate model on 4xx error', async () => {
      const mockFetch = (global as any).fetch;
      mockFetch
        .mockResolvedValueOnce(mockFetchError(429) as any)
        .mockResolvedValueOnce(mockFetchSuccess('Fallback response here.') as any);

      const result = await ctx.controlPlane.callWithFallback('customer-support-v1', { message: 'Hello' });

      expect(result.modelUsed).toBe('gpt-4o');
      expect(result.attempts).toBe(2);
    });

    it('throws after all models fail', async () => {
      const mockFetch = (global as any).fetch;
      mockFetch.mockResolvedValue(mockFetchError(500) as any);

      await expect(ctx.controlPlane.callWithFallback('customer-support-v1', { message: 'Hello' }))
        .rejects.toThrow('AI call failed');
    });

    it('skips models that produce hallucinated responses', async () => {
      const mockFetch = (global as any).fetch;
      mockFetch
        .mockResolvedValueOnce(mockFetchSuccess('Your order has been delivered.') as any)
        .mockResolvedValueOnce(mockFetchSuccess('Here is your order status.') as any);

      const result = await ctx.controlPlane.callWithFallback('customer-support-v1', { message: 'Where is my order?' });

      expect(result.hallucinationDetected).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.response).toBe('Here is your order status.');
    });
  });

  describe('recordFeedback', () => {
    it('records thumbs up feedback', async () => {
      const result = await ctx.controlPlane.recordFeedback({ rating: 'thumbs_up', userId: 'user-1', promptTemplateId: 'customer-support-v1' });
      expect(result).toEqual({ recorded: true });
    });

    it('records thumbs down feedback with correction', async () => {
      const result = await ctx.controlPlane.recordFeedback({
        rating: 'thumbs_down',
        userId: 'user-1',
        promptTemplateId: 'customer-support-v1',
        correction: 'The order was not delivered',
      });
      expect(result).toEqual({ recorded: true });
    });
  });

  describe('getUserTokenUsage', () => {
    it('returns zero usage for a new user', () => {
      const usage = ctx.controlPlane.getUserTokenUsage('new-user');
      expect(usage).toEqual({ minute: 0, hour: 0 });
    });
  });
});

describe('PromptTemplateService', () => {
  let ctx: ReturnType<typeof createServices>;

  beforeEach(() => {
    ctx = createServices();
  });

  it('returns the default template', () => {
    const template = ctx.promptTemplateService.getTemplate('customer-support-v1');
    expect(template.id).toBe('customer-support-v1');
    expect(template.name).toBe('Customer Support');
    expect(template.isActive).toBe(true);
  });

  it('returns the latest active template', () => {
    const template = ctx.promptTemplateService.getLatestActiveTemplate();
    expect(template).toBeDefined();
    expect(template.isActive).toBe(true);
  });

  it('lists all templates', () => {
    const templates = ctx.promptTemplateService.listTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(1);
  });

  it('renders a template with variables', () => {
    const template = ctx.promptTemplateService.getTemplate('customer-support-v1');
    const rendered = ctx.promptTemplateService.renderTemplate(template, { message: 'Where is my order?' });

    expect(rendered.messages[0].role).toBe('system');
    expect(rendered.messages[1].role).toBe('user');
    expect(rendered.messages[1].content).toBe('Where is my order?');
    expect(rendered.model).toBe('gpt-4o-mini');
    expect(rendered.templateId).toBe('customer-support-v1');
  });

  it('allows creating a new template version', () => {
    const template = ctx.promptTemplateService.createTemplate({
      name: 'Support',
      version: 'v2',
      systemPrompt: 'You are a helpful assistant.',
    });

    expect(template.id).toBe('support-v2');
    expect(template.version).toBe('v2');

    const retrieved = ctx.promptTemplateService.getTemplate('support-v2');
    expect(retrieved.systemPrompt).toBe('You are a helpful assistant.');
  });

  it('throws NotFoundException for unknown template', () => {
    expect(() => ctx.promptTemplateService.getTemplate('nonexistent')).toThrow();
  });

  it('renders variables as interpolated values', () => {
    const template = ctx.promptTemplateService.createTemplate({
      name: 'Test',
      version: 'v1',
      systemPrompt: 'Test prompt',
      userPromptTemplate: 'Value: {{value}}',
      variables: ['value'],
    });

    const rendered = ctx.promptTemplateService.renderTemplate(template, { value: '42' });
    expect(rendered.messages[1].content).toBe('Value: 42');
  });
});
