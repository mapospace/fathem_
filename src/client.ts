import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  FathemConfig,
  TrackConversationRequest,
  TrackConversationResponse,
  ResolveConversationRequest,
  ResolveConversationResponse,
  SimilaritySearchRequest,
  SimilaritySearchResponse,
  HealthCheckResponse,
  ErrorResponse,
} from './types';
import {
  FathemError,
  FathemAuthenticationError,
  FathemRateLimitError,
  FathemNotFoundError,
  FathemConflictError,
  FathemValidationError,
  FathemNetworkError,
} from './errors';
import {
  validateApiKey,
  validateTrackConversationRequest,
  validateConversationId,
} from './utils/validation';
import { withRetry, RetryOptions } from './utils/retry';

const DEFAULT_BASE_URL = 'https://fathom-ai-465017.el.r.appspot.com';
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000;

export class FathemClient {
  private readonly client: AxiosInstance;
  private readonly retryOptions: RetryOptions;

  constructor(config: FathemConfig) {
    validateApiKey(config.apiKey);

    this.client = axios.create({
      baseURL: config.baseURL || DEFAULT_BASE_URL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
      },
    });

    this.retryOptions = {
      attempts: config.retryAttempts || DEFAULT_RETRY_ATTEMPTS,
      delay: config.retryDelay || DEFAULT_RETRY_DELAY,
    };

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        throw this.handleError(error);
      },
    );
  }

  private handleError(error: AxiosError<ErrorResponse>): Error {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || error.message;
      const requestId = data?.requestId;

      switch (status) {
        case 400:
          return new FathemValidationError(message, data, requestId);
        case 401:
          return new FathemAuthenticationError(message, requestId);
        case 404:
          return new FathemNotFoundError(message, requestId);
        case 409:
          return new FathemConflictError(message, requestId);
        case 429: {
          const retryAfter = error.response.headers['retry-after'];
          return new FathemRateLimitError(
            message,
            retryAfter ? parseInt(retryAfter, 10) : undefined,
            requestId,
          );
        }
        default:
          return new FathemError(message, status, requestId, data);
      }
    }

    if (error.request) {
      return new FathemNetworkError('Network error occurred', error.request);
    }

    return new FathemError(error.message);
  }

  /**
   * Track conversation messages. Automatically handles incremental updates
   * if the conversationId already exists.
   */
  async trackConversation(request: TrackConversationRequest): Promise<TrackConversationResponse> {
    validateTrackConversationRequest(request);

    return withRetry(async () => {
      const response = await this.client.post<TrackConversationResponse>('/context/track', request);
      return response.data;
    }, this.retryOptions);
  }


  /**
   * Mark conversation as resolved
   */
  async resolveConversation(
    conversationId: string,
    resolutionNotes?: string,
  ): Promise<ResolveConversationResponse> {
    validateConversationId(conversationId);

    const request: ResolveConversationRequest = {
      conversationId,
      resolutionNotes,
    };

    return withRetry(async () => {
      const response = await this.client.post<ResolveConversationResponse>(
        '/context/resolve',
        request,
      );
      return response.data;
    }, this.retryOptions);
  }

  /**
   * Find similar conversations and get recommendations
   */
  async findSimilarConversations(
    message: string,
    limit?: number,
  ): Promise<SimilaritySearchResponse> {
    if (!message || message.trim().length === 0) {
      throw new FathemValidationError('Message cannot be empty');
    }

    const request: SimilaritySearchRequest = {
      message,
      limit,
    };

    return withRetry(async () => {
      const response = await this.client.post<SimilaritySearchResponse>(
        '/context/similarity',
        request,
      );
      return response.data;
    }, this.retryOptions);
  }

  /**
   * Check API health status
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    return withRetry(async () => {
      const response = await this.client.get<HealthCheckResponse>('/context/health');
      return response.data;
    }, this.retryOptions);
  }
}
