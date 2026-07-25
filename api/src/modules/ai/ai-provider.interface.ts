import { AiProvider } from '@prisma/client';

export interface ChatOptions {
  system?: string;
  json?: boolean;
  maxTokens?: number;
}

export interface ChatResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
  model: string;
}

export interface EmbedResult {
  vectors: number[][];
  tokens: number;
  model: string;
}

/** Provider-agnostic AI client. New providers (Anthropic/Gemini) implement this. */
export interface AiProviderClient {
  readonly name: AiProvider;
  chat(prompt: string, opts?: ChatOptions): Promise<ChatResult>;
  embed(texts: string[]): Promise<EmbedResult>;
}
