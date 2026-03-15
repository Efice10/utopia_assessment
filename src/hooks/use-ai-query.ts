import { useMutation } from '@tanstack/react-query';

interface AIQueryRequest {
  question: string;
  stream?: boolean;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface AIQueryResponse {
  success: boolean;
  response: string;
  intent: string;
  timestamp: string;
}

// Non-streaming AI query
export function useAIQuery() {
  return useMutation({
    mutationFn: async (params: {
      question: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    }): Promise<AIQueryResponse> => {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: params.question,
          history: params.history,
          stream: false,
        } as AIQueryRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process query');
      }

      return response.json();
    },
  });
}

// Streaming AI query - returns async generator
export async function* streamAIQuery(
  question: string,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): AsyncGenerator<string, void, unknown> {
  const response = await fetch('/api/ai/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      history,
      stream: true,
    } as AIQueryRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to process query');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value);
  }
}

// Hook for streaming with state management
export function useAIQueryStream() {
  return useMutation({
    mutationFn: async ({
      question,
      history,
      onChunk,
    }: {
      question: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
      onChunk: (chunk: string) => void;
    }): Promise<string> => {
      let fullResponse = '';

      for await (const chunk of streamAIQuery(question, history)) {
        fullResponse += chunk;
        onChunk(chunk);
      }

      return fullResponse;
    },
  });
}
