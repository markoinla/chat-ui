import type { NextRequest } from 'next/server';
import { ZenGPTClient, ZenGPTClientError } from '@/lib/ai/zengpt-client';
import { transformStreamToSSE } from '@/lib/ai/response-transformer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, id: sessionId, model, temperature, max_tokens } = body;

    // Check if ZenGPT is enabled
    const isZenGPTEnabled = process.env.ZENGPT_ENABLED === 'true';
    if (!isZenGPTEnabled) {
      return new Response(
        JSON.stringify({
          error:
            'ZenGPT agent is not enabled. Set ZENGPT_ENABLED=true to use this endpoint.',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const client = new ZenGPTClient();
    const lastMessage = messages[messages.length - 1];

    // Extract text content from message parts if using parts format
    let messageContent: string;
    if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
      // Find text parts and concatenate them
      const textParts = lastMessage.parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .filter(Boolean);
      messageContent = textParts.join('\n');
    } else {
      // Fallback to content property
      messageContent = lastMessage.content || '';
    }

    if (!messageContent.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message content is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Generate session ID if not provided
    const effectiveSessionId = sessionId || ZenGPTClient.generateSessionId();

    // Prepare options for the agent
    const agentOptions = {
      ...(model && { model }),
      ...(temperature !== undefined && { temperature }),
      ...(max_tokens && { max_tokens }),
      metadata: {
        source: 'chat-ui',
        timestamp: new Date().toISOString(),
        user_agent: request.headers.get('user-agent'),
      },
    };

    // Stream response from ZenGPT agent
    const agentResponse = await client.stream(
      messageContent,
      effectiveSessionId,
      agentOptions,
    );

    // Transform the stream to Vercel AI SDK compatible format
    const transformedStream = transformStreamToSSE(agentResponse);

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable Nginx buffering
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('ZenGPT API Error:', error);

    // Handle ZenGPT specific errors
    if (error instanceof ZenGPTClientError) {
      const statusCode =
        error.data.error.code === 'TIMEOUT'
          ? 408
          : error.data.error.code.startsWith('HTTP_')
            ? Number.parseInt(error.data.error.code.slice(5), 10)
            : 500;

      return new Response(
        JSON.stringify({
          error: error.data.error.message,
          code: error.data.error.code,
          details: error.data.error.details,
        }),
        {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Handle other errors
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
