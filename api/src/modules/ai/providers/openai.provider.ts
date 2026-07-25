import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider } from '@prisma/client';
import {
  AiProviderClient,
  ChatOptions,
  ChatResult,
  EmbedResult,
} from '../ai-provider.interface';

const OPENAI_BASE = 'https://api.openai.com/v1';
const MAX_ATTEMPTS = 3;

@Injectable()
export class OpenAiProvider implements AiProviderClient {
  readonly name = AiProvider.OPENAI;
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly apiKey: string;
  private readonly chatModel: string;
  private readonly embedModel: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('OPENAI_API_KEY') ?? '';
    this.chatModel = config.get<string>('OPENAI_CHAT_MODEL') ?? 'gpt-4o-mini';
    this.embedModel =
      config.get<string>('OPENAI_EMBED_MODEL') ?? 'text-embedding-3-small';
  }

  async chat(prompt: string, opts: ChatOptions = {}): Promise<ChatResult> {
    const messages: { role: string; content: string }[] = [];
    if (opts.system) messages.push({ role: 'system', content: opts.system });
    messages.push({ role: 'user', content: prompt });

    const body: Record<string, unknown> = {
      model: this.chatModel,
      messages,
      max_tokens: opts.maxTokens ?? 800,
      temperature: 0.4,
    };
    if (opts.json) body.response_format = { type: 'json_object' };

    const data = await this.request('/chat/completions', body);
    return {
      text: data.choices[0].message.content ?? '',
      tokensIn: data.usage?.prompt_tokens ?? 0,
      tokensOut: data.usage?.completion_tokens ?? 0,
      model: data.model,
    };
  }

  async embed(texts: string[]): Promise<EmbedResult> {
    const data = await this.request('/embeddings', {
      model: this.embedModel,
      input: texts,
    });
    return {
      vectors: data.data.map((d: { embedding: number[] }) => d.embedding),
      tokens: data.usage?.total_tokens ?? 0,
      model: data.model,
    };
  }

  /** POST with retry on transient (5xx / network) errors + exponential backoff. */
  private async request(
    path: string,
    body: Record<string, unknown>,
  ): Promise<any> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const res = await fetch(`${OPENAI_BASE}${path}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        if (res.ok) return res.json();

        // Retry only transient server errors + rate limits.
        if ((res.status >= 500 || res.status === 429) && attempt < MAX_ATTEMPTS) {
          this.logger.warn(`OpenAI ${res.status} on ${path}, retry ${attempt}/${MAX_ATTEMPTS}`);
          await this.delay(500 * 2 ** (attempt - 1));
          continue;
        }
        throw new Error(`OpenAI request failed ${res.status}: ${await res.text()}`);
      } catch (err) {
        lastError = err;
        if (attempt < MAX_ATTEMPTS) {
          await this.delay(500 * 2 ** (attempt - 1));
          continue;
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error('OpenAI request failed');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
