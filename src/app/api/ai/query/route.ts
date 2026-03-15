import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  generateCompletion,
  streamCompletion,
} from '@/lib/ai/client';
import {
  OPERATIONS_ASSISTANT_SYSTEM_PROMPT,
  buildQueryContext,
  classifyQueryIntent,
} from '@/lib/ai/prompts';
import { executeTool, parseToolCalls } from '@/lib/ai/tools';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const maxDuration = 30; // 30 seconds timeout

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QueryRequest {
  question: string;
  stream?: boolean;
  history?: ChatMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const body: QueryRequest = await request.json();
    const { question, stream = false, history } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Get current user and supabase client
    const supabase = await createSupabaseServerClient();
    await supabase.auth.getUser();

    // Classify the query intent
    const intent = classifyQueryIntent(question);

    // Fetch relevant data based on intent
    const contextData = await fetchContextData(supabase);

    // Build the full prompt with context
    const context = buildQueryContext(contextData);
    const fullSystemPrompt = `${OPERATIONS_ASSISTANT_SYSTEM_PROMPT}\n\n${context}`;

    if (stream) {
      // For streaming, we need to collect the full response first to check for tool calls
      let fullResponse = '';

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            // Collect the full response with history
            for await (const chunk of streamCompletion(fullSystemPrompt, question, { history })) {
              fullResponse += chunk;
            }

            // Check for tool calls
            const toolCalls = parseToolCalls(fullResponse);
            console.log('[AI Query] Full response:', fullResponse.substring(0, 500));
            console.log('[AI Query] Tool calls found:', toolCalls);

            if (toolCalls && toolCalls.length > 0) {
              // Execute the first tool call
              const { tool, params } = toolCalls[0];
              console.log('[AI Query] Executing tool:', tool, 'with params:', params);
              const result = await executeTool(tool, params, supabase);
              console.log('[AI Query] Tool result:', result);

              // Generate a natural language response about the result
              const resultPrompt = `You just executed a tool call. Here is the result:
Success: ${result.success}
Message: ${result.message}
${result.data ? `Data: ${JSON.stringify(result.data, null, 2)}` : ''}

Please summarize this result for the user in a friendly way. Do not include any tool_call tags.`;

              const finalResponse = await generateCompletion(
                'You are a helpful assistant that summarizes action results.',
                resultPrompt
              );

              // Clean the response of any tool call tags - flexible regex
              const cleanResponse = finalResponse.replace(/<tool_call[^>]*>[\s\S]*?(?:<\/tool_call\s*>|<\/tool_call\s*$|<\/tool_call(?![a-zA-Z]))/gi, '').trim();

              controller.enqueue(encoder.encode(cleanResponse));
            } else {
              // No tool calls, just send the response
              // Clean the response of any tool call tags just in case - flexible regex
              const cleanResponse = fullResponse.replace(/<tool_call[^>]*>[\s\S]*?(?:<\/tool_call\s*>|<\/tool_call\s*$|<\/tool_call(?![a-zA-Z]))/gi, '').trim();
              controller.enqueue(encoder.encode(cleanResponse));
            }

            controller.close();
          } catch (error) {
            console.error('Stream error:', error);
            controller.error(error);
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    } else {
      // Non-streaming response with history
      let response = await generateCompletion(fullSystemPrompt, question, { history });

      // Check for tool calls
      const toolCalls = parseToolCalls(response);
      console.log('[AI Query] Non-streaming response:', response.substring(0, 500));
      console.log('[AI Query] Tool calls found:', toolCalls);

      if (toolCalls && toolCalls.length > 0) {
        // Execute the first tool call
        const { tool, params } = toolCalls[0];
        console.log('[AI Query] Executing tool:', tool, 'with params:', params);
        const result = await executeTool(tool, params, supabase);
        console.log('[AI Query] Tool result:', result);

        // Generate a natural language response about the result
        const resultPrompt = `You just executed a tool call. Here is the result:
Success: ${result.success}
Message: ${result.message}
${result.data ? `Data: ${JSON.stringify(result.data, null, 2)}` : ''}

Please summarize this result for the user in a friendly way. Do not include any tool_call tags.`;

        const finalResponse = await generateCompletion(
          'You are a helpful assistant that summarizes action results.',
          resultPrompt
        );

        response = finalResponse;
      }

      // Clean response of any tool call tags - flexible regex
      const cleanResponse = response.replace(/<tool_call[^>]*>[\s\S]*?(?:<\/tool_call\s*>|<\/tool_call\s*$|<\/tool_call(?![a-zA-Z]))/gi, '').trim();

      return NextResponse.json({
        success: true,
        response: cleanResponse,
        intent,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('AI Query Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process query',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Fetch relevant context data based on query intent
async function fetchContextData(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{
  orders?: unknown[];
  technicians?: unknown[];
  serviceRecords?: unknown[];
  summary?: {
    totalOrders?: number;
    completedOrders?: number;
    totalRevenue?: number;
    pendingOrders?: number;
  };
}> {
  const result: {
    orders?: unknown[];
    technicians?: unknown[];
    serviceRecords?: unknown[];
    summary?: {
      totalOrders?: number;
      completedOrders?: number;
      totalRevenue?: number;
      pendingOrders?: number;
    };
  } = {};

  try {
    // Fetch summary data
    const [ordersResult, techniciansResult, serviceRecordsResult] =
      await Promise.all([
        supabase.from('orders').select('*').limit(100),
        supabase.from('users').select('*').eq('role', 'technician'),
        supabase.from('service_records').select('*').limit(100),
      ]);

    if (ordersResult.data) {
      result.orders = ordersResult.data;

      const orders = ordersResult.data as Array<{
        status: string;
        quoted_price: number;
      }>;

      result.summary = {
        totalOrders: orders.length,
        completedOrders: orders.filter(
          (o) => o.status === 'closed' || o.status === 'reviewed'
        ).length,
        pendingOrders: orders.filter(
          (o) => o.status === 'new' || o.status === 'assigned'
        ).length,
        totalRevenue: orders
          .filter((o) => o.status === 'closed' || o.status === 'reviewed')
          .reduce((sum, o) => sum + (o.quoted_price || 0), 0),
      };
    }

    if (techniciansResult.data) {
      result.technicians = techniciansResult.data;
    }

    if (serviceRecordsResult.data) {
      result.serviceRecords = serviceRecordsResult.data;
    }
  } catch (error) {
    console.error('Error fetching context data:', error);
    // Return empty context if fetch fails (tables might not exist yet)
  }

  return result;
}
