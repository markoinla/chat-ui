import type {
  ZenGPTResponse,
  ZenGPTStreamEvent,
  ToolCall,
} from './zengpt-types';

// Message parts format compatible with Vercel AI SDK
export interface MessagePart {
  type: 'text' | 'tool-invocation' | 'tool-result' | 'reasoning';
  text?: string;
  toolInvocation?: {
    toolName: string;
    toolCallId: string;
    state: 'call' | 'result';
    args?: any;
  };
  result?: any;
  reasoning?: string;
}

export interface TransformedMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: MessagePart[];
  createdAt?: Date;
}

// Transform a complete ZenGPT response to message parts format
export function transformResponse(
  response: ZenGPTResponse,
  messageId?: string,
): TransformedMessage {
  const parts: MessagePart[] = [];

  // Add main text response
  if (response.response) {
    parts.push({
      type: 'text',
      text: response.response,
    });
  }

  // Add tool calls if present
  if (response.tool_calls && response.tool_calls.length > 0) {
    response.tool_calls.forEach((toolCall, index) => {
      // Tool invocation part
      parts.push({
        type: 'tool-invocation',
        toolInvocation: {
          toolName: toolCall.tool,
          toolCallId: `${messageId || 'msg'}-tool-${index}`,
          state: 'call',
          args: toolCall.input,
        },
      });

      // Tool result part
      if (toolCall.output !== undefined) {
        parts.push({
          type: 'tool-result',
          toolInvocation: {
            toolName: toolCall.tool,
            toolCallId: `${messageId || 'msg'}-tool-${index}`,
            state: 'result',
          },
          result: toolCall.output,
        });
      }
    });
  }

  return {
    id: messageId || `msg-${Date.now()}`,
    role: 'assistant',
    parts,
    createdAt: new Date(),
  };
}

// Transform streaming events to Server-Sent Events format
export function transformStreamToSSE(
  stream: Response,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      if (!stream.body) {
        controller.close();
        return;
      }

      const reader = stream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;

            try {
              const event = parseSSELine(line);
              if (event) {
                const transformedEvent = transformSSEEvent(event);
                if (transformedEvent) {
                  controller.enqueue(encoder.encode(transformedEvent));
                }
              }
            } catch (error) {
              console.warn('Failed to parse SSE line:', line, error);
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          try {
            const event = parseSSELine(buffer);
            if (event) {
              const transformedEvent = transformSSEEvent(event);
              if (transformedEvent) {
                controller.enqueue(encoder.encode(transformedEvent));
              }
            }
          } catch (error) {
            console.warn('Failed to parse final SSE line:', buffer, error);
          }
        }

        controller.close();
      } catch (error) {
        console.error('Stream processing error:', error);
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

// Parse a single SSE line
function parseSSELine(line: string): ZenGPTStreamEvent | null {
  const trimmed = line.trim();

  if (trimmed.startsWith('data: ')) {
    const data = trimmed.slice(6);
    if (data === '[DONE]') {
      return { event: 'done', data: '[DONE]' };
    }

    try {
      const parsed = JSON.parse(data);
      return { event: 'data', data: JSON.stringify(parsed) };
    } catch {
      return { event: 'data', data };
    }
  }

  if (trimmed.startsWith('event: ')) {
    return { event: trimmed.slice(7) };
  }

  if (trimmed.startsWith('id: ')) {
    return { id: trimmed.slice(4) };
  }

  if (trimmed.startsWith('retry: ')) {
    return { retry: Number.parseInt(trimmed.slice(7), 10) };
  }

  return null;
}

// Transform SSE event to Vercel AI SDK compatible format
function transformSSEEvent(event: ZenGPTStreamEvent): string | null {
  if (event.event === 'done' || event.data === '[DONE]') {
    return 'data: [DONE]\n\n';
  }

  if (event.event === 'data' && event.data) {
    try {
      const data = JSON.parse(event.data);

      // Transform the data to match Vercel AI SDK expectations
      const transformed = {
        id: data.id || `msg-${Date.now()}`,
        role: 'assistant',
        parts: data.parts || [
          {
            type: 'text',
            text: data.response || data.text || '',
          },
        ],
        // Include metadata if available
        ...(data.metadata && { metadata: data.metadata }),
      };

      return `data: ${JSON.stringify(transformed)}\n\n`;
    } catch (error) {
      // If parsing fails, treat as plain text
      return `data: ${JSON.stringify({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: event.data,
          },
        ],
      })}\n\n`;
    }
  }

  return null;
}

// Utility to create a text message part
export function createTextPart(text: string): MessagePart {
  return {
    type: 'text',
    text,
  };
}

// Utility to create a tool invocation part
export function createToolInvocationPart(
  toolName: string,
  toolCallId: string,
  args: any,
): MessagePart {
  return {
    type: 'tool-invocation',
    toolInvocation: {
      toolName,
      toolCallId,
      state: 'call',
      args,
    },
  };
}

// Utility to create a tool result part
export function createToolResultPart(
  toolName: string,
  toolCallId: string,
  result: any,
): MessagePart {
  return {
    type: 'tool-result',
    toolInvocation: {
      toolName,
      toolCallId,
      state: 'result',
    },
    result,
  };
}

// Transform ZenGPT streaming response to Vercel AI SDK DataStream format
export function transformZenGPTResponseToDataStream(
  zenGPTStream: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const reader = zenGPTStream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;

            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                // Send completion signal
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                // Extract text from ZenGPT's ADK format
                let textDelta = '';
                if (parsed.content?.parts?.[0]?.text) {
                  textDelta = parsed.content.parts[0].text;
                } else if (parsed.response || parsed.text) {
                  // Fallback for other possible formats
                  textDelta = parsed.response || parsed.text;
                }

                // Only send non-empty text deltas
                if (textDelta) {
                  // Transform ZenGPT response to Vercel AI SDK message parts format
                  const transformed = {
                    type: 'text-delta',
                    textDelta: textDelta,
                  };

                  // Send the transformed data
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(transformed)}\n\n`),
                  );
                }

                // Check if this is the final message (partial: false)
                if (parsed.partial === false) {
                  // Send completion signal for final message
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                }
              } catch (parseError) {
                console.warn('Failed to parse ZenGPT SSE data:', parseError);
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          if (buffer.startsWith('data: ')) {
            const data = buffer.slice(6);
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);

                // Extract text from ZenGPT's ADK format
                let textDelta = '';
                if (parsed.content?.parts?.[0]?.text) {
                  textDelta = parsed.content.parts[0].text;
                } else if (parsed.response || parsed.text) {
                  // Fallback for other possible formats
                  textDelta = parsed.response || parsed.text;
                }

                // Only send non-empty text deltas
                if (textDelta) {
                  const transformed = {
                    type: 'text-delta',
                    textDelta: textDelta,
                  };
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(transformed)}\n\n`),
                  );
                }

                // Check if this is the final message (partial: false)
                if (parsed.partial === false) {
                  // Send completion signal for final message
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                }
              } catch (parseError) {
                console.warn(
                  'Failed to parse final ZenGPT SSE data:',
                  parseError,
                );
              }
            }
          }
        }

        controller.close();
      } catch (error) {
        console.error('ZenGPT stream transformation error:', error);
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}
