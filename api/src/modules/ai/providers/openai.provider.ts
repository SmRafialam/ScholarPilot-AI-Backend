import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider } from '@prisma/client';
import {
  AiProviderClient,
  ChatOptions,
  ChatResult,
  EmbedResult,
} from '../ai-provider.interface';

const OPENAI_BASE = 'https://api.openai.com/v1';

@Injectable()
export class OpenAiProvider implements AiProviderClient {
  readonly name = AiProvider.OPENAI;
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

    const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`OpenAI chat failed ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    return {
      text: data.choices[0].message.content ?? '',
      tokensIn: data.usage?.prompt_tokens ?? 0,
      tokensOut: data.usage?.completion_tokens ?? 0,
      model: data.model,
    };
  }

  async embed(texts: string[]): Promise<EmbedResult> {
    const res = await fetch(`${OPENAI_BASE}/embeddings`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ model: this.embedModel, input: texts }),
    });
    if (!res.ok) {
      throw new Error(`OpenAI embed failed ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    return {
      vectors: data.data.map((d: { embedding: number[] }) => d.embedding),
      tokens: data.usage?.total_tokens ?? 0,
      model: data.model,
    };
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }
}
