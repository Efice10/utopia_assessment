import Anthropic from '@anthropic-ai/sdk';

/**
 * AI Client Configuration
 *
 * Uses Z.AI as a proxy for Claude API.
 * Configure via environment variables:
 * - ANTHROPIC_AUTH_TOKEN: Your Z.AI token
 * - ANTHROPIC_BASE_URL: https://api.z.ai/api/anthropic
 * - AI_MODEL: Model to use (default: glm-5)
 */

// Create Anthropic client configured for Z.AI
export function createAIClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_AUTH_TOKEN,
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.z.ai/api/anthropic',
  });
}

// Singleton for server-side use
let aiClient: Anthropic | null = null;

export function getAIClient() {
  if (!aiClient) {
    aiClient = createAIClient();
  }
  return aiClient;
}

// Get the configured model
export function getAIModel() {
  return process.env.AI_MODEL || 'glm-5';
}

// Helper to generate text completion
export async function generateCompletion(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }
) {
  const client = getAIClient();
  const model = getAIModel();

  // Build messages array with history if provided
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  if (options?.history && options.history.length > 0) {
    messages.push(...options.history);
  }

  messages.push({
    role: 'user',
    content: userMessage,
  });

  const response = await client.messages.create({
    model,
    max_tokens: options?.maxTokens || 1024,
    temperature: options?.temperature || 0.7,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );

  return textBlock?.text || '';
}

// Helper for streaming completions
export async function* streamCompletion(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }
): AsyncGenerator<string, void, unknown> {
  const client = getAIClient();
  const model = getAIModel();

  // Build messages array with history if provided
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  if (options?.history && options.history.length > 0) {
    messages.push(...options.history);
  }

  messages.push({
    role: 'user',
    content: userMessage,
  });

  const stream = client.messages.stream({
    model,
    max_tokens: options?.maxTokens || 1024,
    temperature: options?.temperature || 0.7,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}
