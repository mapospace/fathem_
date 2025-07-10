import axios from 'axios';
import { FathemClient } from '../src/client';
import { FathemValidationError } from '../src/errors';
import { TrackConversationRequest } from '../src/types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FathemClient', () => {
  let client: FathemClient;
  const mockApiKey = 'test_api_key_123';
  const mockBaseURL = 'https://test-api.example.com';

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue({
      post: jest.fn(),
      get: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    } as any);

    client = new FathemClient({ apiKey: mockApiKey });
  });

  describe('constructor', () => {
    it('should create client with valid config', () => {
      expect(() => new FathemClient({ apiKey: mockApiKey })).not.toThrow();
    });

    it('should throw validation error for missing API key', () => {
      expect(() => new FathemClient({ apiKey: '' })).toThrow(FathemValidationError);
    });

    it('should use custom base URL when provided', () => {
      new FathemClient({ apiKey: mockApiKey, baseURL: mockBaseURL });
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: mockBaseURL,
        }),
      );
    });
  });

  describe('trackConversation', () => {
    const validRequest: TrackConversationRequest = {
      conversationId: 'conv_123',
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ],
    };

    const mockResponse = {
      data: {
        success: true,
        message: 'Conversation tracked successfully',
        data: {
          conversationId: 'conv_123',
          issueType: 'greeting',
          currentStage: 'initial',
          escalationPoint: 0,
          similarResolutions: [],
          usage: { tokensUsed: 50, retrievalsUsed: 1, requestsUsed: 1 },
          remaining: { tokens: 999950, retrievals: 499, requests: 999 },
        },
        requestId: 'req_123',
      },
    };

    it('should track conversation successfully', async () => {
      const mockPost = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        post: mockPost,
        get: jest.fn(),
        interceptors: {
          response: {
            use: jest.fn(),
          },
        },
      } as any);

      const newClient = new FathemClient({ apiKey: mockApiKey });
      const result = await newClient.trackConversation(validRequest);

      expect(mockPost).toHaveBeenCalledWith('/context/track', validRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should validate conversationId', async () => {
      const invalidRequest = { ...validRequest, conversationId: '' };
      await expect(client.trackConversation(invalidRequest)).rejects.toThrow(
        FathemValidationError,
      );
    });

    it('should validate messages array', async () => {
      const invalidRequest = { ...validRequest, messages: [] };
      await expect(client.trackConversation(invalidRequest)).rejects.toThrow(
        FathemValidationError,
      );
    });

    it('should validate message role', async () => {
      const invalidRequest = {
        ...validRequest,
        messages: [{ role: 'invalid' as any, content: 'test' }],
      };
      await expect(client.trackConversation(invalidRequest)).rejects.toThrow(
        FathemValidationError,
      );
    });
  });

  describe('trackConversationIncremental', () => {
    it('should call trackConversation with isIncremental flag', async () => {
      const mockPost = jest.fn().mockResolvedValue({ data: {} });
      mockedAxios.create.mockReturnValue({
        post: mockPost,
        get: jest.fn(),
        interceptors: {
          response: {
            use: jest.fn(),
          },
        },
      } as any);

      const newClient = new FathemClient({ apiKey: mockApiKey });
      const messages = [{ role: 'user' as const, content: 'Hello' }];

      await newClient.trackConversationIncremental('conv_123', messages, 'user_123');

      expect(mockPost).toHaveBeenCalledWith('/context/track', {
        conversationId: 'conv_123',
        messages,
        userId: 'user_123',
        isIncremental: true,
      });
    });
  });

  describe('resolveConversation', () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'Conversation marked as resolved',
        data: {
          conversationId: 'conv_123',
          resolutionNotes: 'Issue resolved successfully',
        },
        requestId: 'req_456',
      },
    };

    it('should resolve conversation successfully', async () => {
      const mockPost = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        post: mockPost,
        get: jest.fn(),
        interceptors: {
          response: {
            use: jest.fn(),
          },
        },
      } as any);

      const newClient = new FathemClient({ apiKey: mockApiKey });
      const result = await newClient.resolveConversation('conv_123');

      expect(mockPost).toHaveBeenCalledWith('/context/resolve', {
        conversationId: 'conv_123',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should validate conversationId', async () => {
      await expect(client.resolveConversation('')).rejects.toThrow(FathemValidationError);
    });
  });

  describe('checkHealth', () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'Context service is healthy',
        services: {
          conversationTracking: 'connected',
          neo4j: 'connected',
          openai: 'connected',
        },
        timestamp: '2025-07-08T17:45:12.398Z',
        requestId: 'req_789',
      },
    };

    it('should check health successfully', async () => {
      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue({
        post: jest.fn(),
        get: mockGet,
        interceptors: {
          response: {
            use: jest.fn(),
          },
        },
      } as any);

      const newClient = new FathemClient({ apiKey: mockApiKey });
      const result = await newClient.checkHealth();

      expect(mockGet).toHaveBeenCalledWith('/context/health');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('error handling', () => {
    it('should handle authentication errors', async () => {
      const errorHandler = jest.fn();
      mockedAxios.create.mockReturnValue({
        post: jest.fn(),
        get: jest.fn(),
        interceptors: {
          response: {
            use: jest.fn().mockImplementation((_success, error) => {
              errorHandler.mockImplementation(error);
            }),
          },
        },
      } as any);

      const error = {
        response: {
          status: 401,
          data: { message: 'Invalid API key', requestId: 'req_123' },
        },
      };

      new FathemClient({ apiKey: mockApiKey });
      
      expect(() => errorHandler(error)).toThrow();
      try {
        errorHandler(error);
      } catch (result: any) {
        expect(result.name).toBe('FathemAuthenticationError');
        expect(result.message).toBe('Invalid API key');
        expect(result.statusCode).toBe(401);
      }
    });

    it('should handle rate limit errors', async () => {
      const errorHandler = jest.fn();
      mockedAxios.create.mockReturnValue({
        post: jest.fn(),
        get: jest.fn(),
        interceptors: {
          response: {
            use: jest.fn().mockImplementation((_success, error) => {
              errorHandler.mockImplementation(error);
            }),
          },
        },
      } as any);

      const error = {
        response: {
          status: 429,
          data: { message: 'Rate limit exceeded', requestId: 'req_123' },
          headers: { 'retry-after': '60' },
        },
      };

      new FathemClient({ apiKey: mockApiKey });
      
      expect(() => errorHandler(error)).toThrow();
      try {
        errorHandler(error);
      } catch (result: any) {
        expect(result.name).toBe('FathemRateLimitError');
        expect(result.message).toBe('Rate limit exceeded');
        expect(result.retryAfter).toBe(60);
      }
    });

    it('should handle not found errors', async () => {
      const errorHandler = jest.fn();
      mockedAxios.create.mockReturnValue({
        post: jest.fn(),
        get: jest.fn(),
        interceptors: {
          response: {
            use: jest.fn().mockImplementation((_success, error) => {
              errorHandler.mockImplementation(error);
            }),
          },
        },
      } as any);

      const error = {
        response: {
          status: 404,
          data: { message: 'Conversation not found', requestId: 'req_123' },
        },
      };

      new FathemClient({ apiKey: mockApiKey });
      
      expect(() => errorHandler(error)).toThrow();
      try {
        errorHandler(error);
      } catch (result: any) {
        expect(result.name).toBe('FathemNotFoundError');
        expect(result.message).toBe('Conversation not found');
      }
    });

    it('should handle conflict errors', async () => {
      const errorHandler = jest.fn();
      mockedAxios.create.mockReturnValue({
        post: jest.fn(),
        get: jest.fn(),
        interceptors: {
          response: {
            use: jest.fn().mockImplementation((_success, error) => {
              errorHandler.mockImplementation(error);
            }),
          },
        },
      } as any);

      const error = {
        response: {
          status: 409,
          data: { message: 'Conversation already resolved', requestId: 'req_123' },
        },
      };

      new FathemClient({ apiKey: mockApiKey });
      
      expect(() => errorHandler(error)).toThrow();
      try {
        errorHandler(error);
      } catch (result: any) {
        expect(result.name).toBe('FathemConflictError');
        expect(result.message).toBe('Conversation already resolved');
      }
    });

    it('should handle network errors', async () => {
      const errorHandler = jest.fn();
      mockedAxios.create.mockReturnValue({
        post: jest.fn(),
        get: jest.fn(),
        interceptors: {
          response: {
            use: jest.fn().mockImplementation((_success, error) => {
              errorHandler.mockImplementation(error);
            }),
          },
        },
      } as any);

      const error = {
        request: { url: 'https://api.example.com' },
        message: 'Network error',
      };

      new FathemClient({ apiKey: mockApiKey });
      
      expect(() => errorHandler(error)).toThrow();
      try {
        errorHandler(error);
      } catch (result: any) {
        expect(result.name).toBe('FathemNetworkError');
        expect(result.message).toBe('Network error occurred');
      }
    });

    it('should handle generic errors', async () => {
      const errorHandler = jest.fn();
      mockedAxios.create.mockReturnValue({
        post: jest.fn(),
        get: jest.fn(),
        interceptors: {
          response: {
            use: jest.fn().mockImplementation((_success, error) => {
              errorHandler.mockImplementation(error);
            }),
          },
        },
      } as any);

      const error = {
        message: 'Unknown error',
      };

      new FathemClient({ apiKey: mockApiKey });
      
      expect(() => errorHandler(error)).toThrow();
      try {
        errorHandler(error);
      } catch (result: any) {
        expect(result.name).toBe('FathemError');
        expect(result.message).toBe('Unknown error');
      }
    });

    it('should handle server errors', async () => {
      const errorHandler = jest.fn();
      mockedAxios.create.mockReturnValue({
        post: jest.fn(),
        get: jest.fn(),
        interceptors: {
          response: {
            use: jest.fn().mockImplementation((_success, error) => {
              errorHandler.mockImplementation(error);
            }),
          },
        },
      } as any);

      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error', requestId: 'req_123' },
        },
      };

      new FathemClient({ apiKey: mockApiKey });
      
      expect(() => errorHandler(error)).toThrow();
      try {
        errorHandler(error);
      } catch (result: any) {
        expect(result.name).toBe('FathemError');
        expect(result.message).toBe('Internal server error');
        expect(result.statusCode).toBe(500);
      }
    });
  });
});