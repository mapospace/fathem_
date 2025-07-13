export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface TrackConversationRequest {
  conversationId: string;
  messages: Message[];
  userId?: string;
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
    messagesReceived: number;
    isIncremental: boolean;
  };
  requestId: string;
}

export interface ResolveConversationRequest {
  conversationId: string;
  resolutionNotes?: string;
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

export interface SimilaritySearchRequest {
  message: string;
  limit?: number;
}

export interface IssueDetails {
  name: string;
  description: string;
  occurrences: number;
  symptoms: string[];
  causes: string[];
}

export interface SolutionDetails {
  description: string;
  steps: string[];
  prerequisites: string[];
  successIndicators: string[];
  stats: {
    successCount: number;
    failureCount: number;
    totalAttempts: number;
    successRate: number;
  };
}

export interface AttemptedSolution {
  solution: string;
  outcome: 'success' | 'failure';
  confidence: number;
  solutionDetails: SolutionDetails;
}

export interface SimilarConversation {
  resolutionNotes: string;
  issueDetails: IssueDetails;
  attemptedSolutions: AttemptedSolution[];
}

export interface RecommendedAction {
  action: string;
  successProbability: number;
  averageTimeToResolve: number;
}

export interface Recommendations {
  issueType: string;
  recommendedActions: RecommendedAction[];
  escalationPoint: number;
  historicalSuccessRate: number;
  similarResolutions: Resolution[];
}

export interface SimilaritySearchResponse {
  success: boolean;
  message: string;
  data: {
    query: string;
    totalFound: number;
    conversations: SimilarConversation[];
    recommendations: Recommendations;
  };
  requestId: string;
}

export type FathemResponse<T> = T | ErrorResponse;
