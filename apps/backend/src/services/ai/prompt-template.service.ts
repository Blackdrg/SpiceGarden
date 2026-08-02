import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PromptTemplate {
  id: string;
  name: string;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  maxTokens: number;
  temperature: number;
  model: string;
  fallbackModels: string[];
  halluctionsChecks: boolean;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface RenderedPrompt {
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  maxTokens: number;
  temperature: number;
  fallbackModels?: string[];
  templateId: string;
  templateVersion: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are SpiceGarden's customer support assistant. You help customers with:
- Order status and tracking
- Refund and return policies
- Menu recommendations
- Restaurant information
- Delivery estimates
- Payment and billing questions

Respond concisely and helpfully. If you cannot answer a question, offer to connect them to a human agent.`;

const DEFAULT_USER_TEMPLATE = `{{message}}`;

@Injectable()
export class PromptTemplateService {
  private readonly logger = new Logger(PromptTemplateService.name);
  private readonly templates: Map<string, PromptTemplate> = new Map();

  constructor(private configService: ConfigService) {
    const defaultTemplate: PromptTemplate = {
      id: 'customer-support-v1',
      name: 'Customer Support',
      version: 'v1',
      systemPrompt: this.configService.get<string>('AI_SYSTEM_PROMPT') || DEFAULT_SYSTEM_PROMPT,
      userPromptTemplate: DEFAULT_USER_TEMPLATE,
      variables: ['message'],
      maxTokens: this.configService.get<number>('AI_MAX_TOKENS', 200),
      temperature: this.configService.get<number>('AI_TEMPERATURE', 0.7),
      model: this.configService.get<string>('AI_MODEL', 'gpt-4o-mini'),
      fallbackModels: this.configService.get<string[]>('AI_FALLBACK_MODELS', ['gpt-4o', 'gpt-3.5-turbo']),
      halluctionsChecks: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    this.templates.set(defaultTemplate.id, defaultTemplate);
  }

  getTemplate(id: string): PromptTemplate {
    const template = this.templates.get(id);
    if (!template || !template.isActive) {
      throw new NotFoundException(`Prompt template not found: ${id}`);
    }
    return template;
  }

  getLatestActiveTemplate(name?: string): PromptTemplate {
    if (!name) {
      return Array.from(this.templates.values())
        .filter((t) => t.isActive)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    }
    return Array.from(this.templates.values())
      .filter((t) => t.name === name && t.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  listTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  createTemplate(template: Partial<PromptTemplate>): PromptTemplate {
    if (!template.name || !template.version) {
      throw new BadRequestException('Template name and version are required');
    }

    const id = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${template.version}`;
    const fullTemplate: PromptTemplate = {
      id,
      name: template.name,
      version: template.version,
      systemPrompt: template.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      userPromptTemplate: template.userPromptTemplate || DEFAULT_USER_TEMPLATE,
      variables: template.variables || ['message'],
      maxTokens: template.maxTokens || 200,
      temperature: template.temperature ?? 0.7,
      model: template.model || 'gpt-4o-mini',
      fallbackModels: template.fallbackModels || ['gpt-4o', 'gpt-3.5-turbo'],
      halluctionsChecks: template.halluctionsChecks ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: template.isActive ?? true,
    };

    this.templates.set(id, fullTemplate);
    this.logger.log(`Created prompt template: ${id}`);
    return { ...fullTemplate };
  }

  renderTemplate(template: PromptTemplate, variables: Record<string, string>): RenderedPrompt {
    const missingVars = template.variables.filter((v) => !(v in variables) || !variables[v]);
    if (missingVars.length > 0) {
      throw new BadRequestException(`Missing required variables: ${missingVars.join(', ')}`);
    }

    const renderedUserPrompt = template.userPromptTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return variables[key] || '';
    });

    return {
      model: template.model,
      messages: [
        { role: 'system', content: template.systemPrompt },
        { role: 'user', content: renderedUserPrompt },
      ],
      maxTokens: template.maxTokens,
      temperature: template.temperature,
      fallbackModels: template.fallbackModels,
      templateId: template.id,
      templateVersion: template.version,
    };
  }
}
