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

export interface ZenGPTStreamEvent {
  event?: string;
  data?: string;
  id?: string;
  retry?: number;
}
