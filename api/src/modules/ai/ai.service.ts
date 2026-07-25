import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AiProviderClient,
  ChatOptions,
  ChatResult,
  EmbedResult,
} from './ai-provider.interface';
import { OpenAiProvider } from './providers/openai.provider';

/**
 * Provider-agnostic AI gateway. All modules call this — never a provider
 * directly — so routing, cost tracking and guardrails live in one place.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly openai: OpenAiProvider,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private provider(): AiProviderClient {
    // Only OpenAI wired today; Anthropic/Gemini plug in here by AI_PROVIDER.
    return this.openai;
  }

  async chat(
    prompt: string,
    feature: string,
    opts?: ChatOptions,
    userId?: string,
  ): Promise<ChatResult> {
    const provider = this.provider();
    const result = await provider.chat(prompt, opts);
    await this.logUsage(provider.name, result.model, feature, result.tokensIn, result.tokensOut, userId);
    return result;
  }

  async embed(
    texts: string[],
    feature: string,
    userId?: string,
  ): Promise<EmbedResult> {
    const provider = this.provider();
    const result = await provider.embed(texts);
    await this.logUsage(provider.name, result.model, feature, result.tokens, 0, userId);
    return result;
  }

  private async logUsage(
    provider: import('@prisma/client').AiProvider,
    model: string,
    feature: string,
    tokensIn: number,
    tokensOut: number,
    userId?: string,
  ): Promise<void> {
    try {
      await this.prisma.aiUsageLog.create({
        data: { provider, model, feature, tokensIn, tokensOut, userId: userId ?? null },
      });
    } catch (err) {
      // Usage logging must never break a feature.
      this.logger.warn(`Failed to log AI usage: ${String(err)}`);
    }
  }
}
