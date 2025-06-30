# ZenGPT Agent Integration Plan

## Overview

This plan outlines the integration of the ZenGPT Central Agent with the existing chat UI, replacing the Vercel AI SDK for basic chat functionality while maintaining all existing features and providing a non-destructive fallback approach.

## Agent Details

**Production Endpoint (Cloud Run):**
- Base URL: `https://zengpt-central-agent-us-central1.run.app`
- Invoke: `POST /invoke`
- Streaming: `POST /stream`
- Authentication: `X-API-Key` header
- Session Management: Via `session_id` parameter in requests

**Key Capabilities:**
- Multi-model support (OpenAI, Anthropic, Google, Cohere)
- Dynamic model selection via request state
- Cross-session memory persistence
- Document management tools
- Web research and search capabilities
- Server-Sent Events (SSE) streaming
- Artifact management

## Implementation Strategy

### Phase 1: Non-Destructive Integration Setup
**Goal:** Create parallel API route for testing ZenGPT agent without affecting existing functionality

#### 1.1 Environment Configuration
**Files to modify:**
- `.env.local` (create if doesn't exist)
- `next.config.ts` (add environment variables)

**New environment variables:**
```bash
# ZenGPT Agent Configuration
ZENGPT_API_URL=https://zengpt-central-agent-us-central1.run.app
ZENGPT_API_KEY=your-api-key-here
ZENGPT_ENABLED=false  # Feature flag for gradual rollout
```

#### 1.2 Create ZenGPT Client Library
**New file:** `lib/ai/zengpt-client.ts`

**Purpose:** Centralized client for ZenGPT agent communication
**Features:**
- HTTP client for invoke/stream endpoints
- Error handling and retry logic
- TypeScript interfaces for request/response
- Session management utilities

#### 1.3 Create Parallel API Route
**New file:** `app/(chat)/api/chat-agent/route.ts`

**Purpose:** Alternative chat endpoint using ZenGPT agent
**Features:**
- Mirrors existing `/api/chat` functionality
- Transforms ZenGPT responses to Vercel AI SDK format
- SSE streaming support
- Session ID management

#### 1.4 Response Format Transformation
**New file:** `lib/ai/response-transformer.ts`

**Purpose:** Convert ZenGPT agent responses to message parts format
**Features:**
- Transform text responses to `{ type: "text", text: "..." }`
- Handle tool calls as `{ type: "tool-invocation", ... }`
- Handle tool results as `{ type: "tool-result", ... }`
- Preserve streaming format compatibility

### Phase 2: Basic Chat Integration
**Goal:** Implement basic text chat functionality with ZenGPT agent

#### 2.1 Create ZenGPT Hook
**New file:** `hooks/use-zengpt-chat.ts`

**Purpose:** React hook that mirrors `useChat` API but connects to ZenGPT
**Features:**
- Compatible interface with existing `useChat`
- SSE streaming handling
- Message parts transformation
- Session management
- Error handling

#### 2.2 Feature Flag Implementation
**Files to modify:**
- `components/chat.tsx`
- `app/(chat)/page.tsx`

**Purpose:** Allow switching between Vercel AI SDK and ZenGPT agent
**Implementation:**
- Environment variable check
- Conditional hook usage
- Seamless UI experience

#### 2.3 Session Management Integration
**Files to modify:**
- `lib/ai/zengpt-client.ts`
- `hooks/use-zengpt-chat.ts`

**Purpose:** Map Next.js sessions to ZenGPT session IDs
**Features:**
- Generate/retrieve session IDs
- Cross-session memory via ZenGPT agent
- User identification mapping

### Phase 3: Testing and Validation
**Goal:** Ensure feature parity and reliability

#### 3.1 Local Development Setup
**Files to create:**
- `scripts/test-zengpt.ts` - Testing script for agent connectivity
- `docs/zengpt-testing-guide.md` - Testing procedures

#### 3.2 Error Handling Enhancement
**Files to modify:**
- `lib/ai/zengpt-client.ts`
- `hooks/use-zengpt-chat.ts`
- `app/(chat)/api/chat-agent/route.ts`

**Features:**
- Graceful error handling
- Timeout management
- Retry logic
- Fallback messaging

## Detailed Implementation

### File Structure
```
├── app/(chat)/api/
│   ├── chat/route.ts              # Existing Vercel AI SDK route
│   └── chat-agent/route.ts        # New ZenGPT agent route
├── lib/ai/
│   ├── zengpt-client.ts           # ZenGPT API client
│   ├── response-transformer.ts    # Response format conversion
│   └── zengpt-types.ts           # TypeScript interfaces
├── hooks/
│   └── use-zengpt-chat.ts         # ZenGPT chat hook
├── scripts/
│   └── test-zengpt.ts            # Testing utilities
└── docs/
    ├── zengpt-integration-plan.md # This file
    └── zengpt-testing-guide.md   # Testing procedures
```

### TypeScript Interfaces

```typescript
// lib/ai/zengpt-types.ts
export interface ZenGPTRequest {
  user_content: string;
  session_id: string;
  state?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  };
  metadata?: Record<string, any>;
}

export interface ZenGPTResponse {
  response: string;
  session_id: string;
  tool_calls?: ToolCall[];
  metadata?: {
    model_used: string;
    tokens_used: number;
    processing_time: number;
  };
}

export interface ToolCall {
  tool: string;
  input: any;
  output: any;
}

export interface ZenGPTError {
  error: {
    code: string;
    message: string;
    details?: string;
  };
  session_id?: string;
}
```

### API Route Implementation

```typescript
// app/(chat)/api/chat-agent/route.ts
import { NextRequest } from 'next/server';
import { ZenGPTClient } from '@/lib/ai/zengpt-client';
import { transformToMessageParts } from '@/lib/ai/response-transformer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, id: sessionId } = body;
    
    const client = new ZenGPTClient();
    const lastMessage = messages[messages.length - 1];
    
    // Stream response from ZenGPT agent
    const stream = await client.stream(
      lastMessage.content,
      sessionId || `session-${Date.now()}`
    );
    
    // Transform stream to Vercel AI SDK format
    return new Response(
      transformToMessageParts(stream),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  } catch (error) {
    console.error('ZenGPT API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
```

### Client Implementation

```typescript
// lib/ai/zengpt-client.ts
export class ZenGPTClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.ZENGPT_API_URL!;
    this.apiKey = process.env.ZENGPT_API_KEY!;
  }

  async invoke(message: string, sessionId: string, options?: any) {
    const response = await fetch(`${this.baseUrl}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        user_content: message,
        session_id: sessionId,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`ZenGPT API error: ${response.statusText}`);
    }

    return response.json();
  }

  async stream(message: string, sessionId: string, options?: any) {
    const response = await fetch(`${this.baseUrl}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        user_content: message,
        session_id: sessionId,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`ZenGPT Stream API error: ${response.statusText}`);
    }

    return response;
  }
}
```

### Hook Implementation

```typescript
// hooks/use-zengpt-chat.ts
import { useState, useCallback } from 'react';
import { ZenGPTClient } from '@/lib/ai/zengpt-client';

export function useZenGPTChat({ id }: { id?: string }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const append = useCallback(async (message) => {
    setIsLoading(true);
    setError(null);

    try {
      const client = new ZenGPTClient();
      const sessionId = id || `session-${Date.now()}`;
      
      // Add user message
      const userMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        parts: [{ type: 'text', text: message.content }],
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Stream response
      const response = await client.stream(message.content, sessionId);
      const reader = response.body?.getReader();
      
      if (!reader) throw new Error('No response stream');

      // Handle streaming response
      let assistantMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        parts: [],
      };

      // Process stream and update message
      // Implementation details for SSE parsing and parts transformation
      
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return {
    messages,
    append,
    isLoading,
    error,
    reload: () => {}, // Implement reload functionality
    stop: () => {}, // Implement stop functionality
  };
}
```

## Testing Strategy

### 1. Unit Tests
- ZenGPT client functionality
- Response transformation logic
- Error handling scenarios

### 2. Integration Tests
- End-to-end chat flow
- SSE streaming functionality
- Session management

### 3. Manual Testing
- Feature flag switching
- UI component compatibility
- Performance comparison

## Rollout Plan

### Stage 1: Development Setup (1-2 days)
- [ ] Set up environment variables
- [ ] Create ZenGPT client library
- [ ] Implement basic API route
- [ ] Create testing script

### Stage 2: Core Integration (2-3 days)
- [ ] Implement response transformer
- [ ] Create ZenGPT hook
- [ ] Add feature flag support
- [ ] Basic chat functionality

### Stage 3: Testing & Refinement (1-2 days)
- [ ] Comprehensive testing
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] Documentation updates

### Stage 4: Gradual Rollout (Ongoing)
- [ ] Enable for development environment
- [ ] Limited user testing
- [ ] Full production rollout
- [ ] Monitor and iterate

## Risk Mitigation

### Fallback Strategy
- Feature flag allows instant rollback
- Existing API route remains untouched
- No changes to core UI components initially

### Error Handling
- Graceful degradation on agent failures
- Clear error messages for users
- Logging and monitoring integration

### Performance Considerations
- Response time monitoring
- Caching strategies for repeated requests
- Connection pooling for API calls

## Success Metrics

### Technical Metrics
- Response time parity with Vercel AI SDK
- Error rate < 1%
- Successful SSE streaming
- Session persistence accuracy

### User Experience Metrics
- Feature parity with existing chat
- Seamless switching between implementations
- No UI regressions

## Future Enhancements

After successful basic integration:
1. **Advanced Features**: Document management, artifacts, web research
2. **Model Selection UI**: Expose dynamic model switching
3. **Memory Management**: Cross-session knowledge interface
4. **Tool Integration**: Leverage ZenGPT's comprehensive tool set
5. **Performance Optimization**: Caching, connection pooling
6. **Monitoring**: Analytics and usage tracking

## Conclusion

This plan provides a structured, non-destructive approach to integrating the ZenGPT Central Agent while maintaining system stability and allowing for easy rollback if needed. The phased implementation ensures thorough testing and validation at each step. 