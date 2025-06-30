import type {
  ZenGPTRequest,
  ZenGPTResponse,
  ZenGPTError as ZenGPTErrorType,
} from './zengpt-types';

export class ZenGPTClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(options?: { timeout?: number }) {
    this.baseUrl =
      process.env.ZENGPT_API_URL ||
      'https://zengpt-central-agent-us-central1.run.app';
    this.apiKey = process.env.ZENGPT_API_KEY || '';
    this.timeout = options?.timeout || 30000; // 30 second default timeout

    if (!this.apiKey) {
      console.warn(
        'ZenGPT API key not configured. Set ZENGPT_API_KEY environment variable.',
      );
    }
  }

  private async makeRequest(
    endpoint: string,
    body: any,
    options?: { stream?: boolean },
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    if (options?.stream) {
      headers['Accept'] = 'text/event-stream';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`ZenGPT Request: ${this.baseUrl}${endpoint}`);
      console.log(`ZenGPT Headers:`, headers);
      console.log(`ZenGPT Body:`, JSON.stringify(body, null, 2));

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`ZenGPT Response Status: ${response.status}`);
      console.log(
        `ZenGPT Response Headers:`,
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: ZenGPTErrorType;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            error: {
              code: `HTTP_${response.status}`,
              message: response.statusText || 'Unknown error',
              details: errorText,
            },
          };
        }

        throw new ZenGPTClientError(errorData.error.message, errorData);
      }

      return response;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof ZenGPTClientError) {
        throw error;
      }

      if ((error as Error).name === 'AbortError') {
        throw new ZenGPTClientError('Request timeout', {
          error: {
            code: 'TIMEOUT',
            message: 'Request timed out',
          },
        });
      }

      throw new ZenGPTClientError('Network error', {
        error: {
          code: 'NETWORK_ERROR',
          message: (error as Error).message || 'Network request failed',
        },
      });
    }
  }

  async invoke(
    message: string,
    sessionId: string,
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      metadata?: Record<string, any>;
    },
  ): Promise<ZenGPTResponse> {
    // Use Google ADK API format
    const requestBody = {
      appName: 'zengpt_central_agent',
      userId: 'default_user',
      sessionId: sessionId,
      newMessage: {
        parts: [{ text: message }],
      },
    };

    const response = await this.makeRequest('/run', requestBody);
    return response.json();
  }

  async stream(
    message: string,
    sessionId: string,
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      metadata?: Record<string, any>;
    },
  ): Promise<Response> {
    // Use Google ADK API format
    const requestBody = {
      appName: 'zengpt_central_agent',
      userId: 'default_user',
      sessionId: sessionId,
      newMessage: {
        parts: [{ text: message }],
      },
      streaming: true,
    };

    return this.makeRequest('/run_sse', requestBody, { stream: true });
  }

  // Utility method to generate session IDs
  static generateSessionId(prefix = 'zengpt'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}-${timestamp}-${random}`;
  }

  // Create session for ADK API
  async createSession(userId: string, sessionId: string): Promise<void> {
    const response = await this.makeRequest(
      `/apps/zengpt_central_agent/users/${userId}/sessions/${sessionId}`,
      { state: {} },
    );
    return response.json();
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.apiKey ? { 'X-API-Key': this.apiKey } : {},
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Custom error class for ZenGPT client errors
export class ZenGPTClientError extends Error {
  public readonly data: ZenGPTErrorType;

  constructor(message: string, data: ZenGPTErrorType) {
    super(message);
    this.name = 'ZenGPTClientError';
    this.data = data;
  }
}
