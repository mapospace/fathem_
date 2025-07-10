export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface TrackConversationRequest {
  conversationId: string;
  messages: Message[];
  userId?: string;
  isIncremental?: boolean;
}

export interface Resolution {
  conversationId: string;
  issueType: string;
  resolutionPath: string[];
  timeToResolve: number;
}

export interface Usage {
  tokensUsed: number;
  retrievalsUsed: number;
  requestsUsed: number;
}

export interface Remaining {
  tokens: number;
  retrievals: number;
  requests: number;
}

export interface TrackConversationResponse {
  success: boolean;
  message: string;
  data: {
    conversationId: string;
    issueType: string;
    currentStage: string;
    escalationPoint: number;
    similarResolutions: Resolution[];
    usage: Usage;
    remaining: Remaining;
  };
  requestId: string;
}

export interface ResolveConversationRequest {
  conversationId: string;
}

export interface ResolveConversationResponse {
  success: boolean;
  message: string;
  data: {
    conversationId: string;
    resolutionNotes: string;
  };
  requestId: string;
}

export interface HealthCheckResponse {
  success: boolean;
  message: string;
  services: {
    conversationTracking: string;
    neo4j: string;
    openai: string;
  };
  timestamp: string;
  requestId: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  requestId: string;
}

export interface FathemConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export type FathemResponse<T> = T | ErrorResponse;
