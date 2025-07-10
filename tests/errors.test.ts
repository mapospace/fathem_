import {
  FathemError,
  FathemAuthenticationError,
  FathemRateLimitError,
  FathemNotFoundError,
  FathemConflictError,
  FathemValidationError,
  FathemNetworkError,
} from '../src/errors';

describe('FathemErrors', () => {
  describe('FathemError', () => {
    it('should create error with all properties', () => {
      const error = new FathemError('Test error', 500, 'req_123', { detail: 'test' });
      
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('FathemError');
      expect(error.statusCode).toBe(500);
      expect(error.requestId).toBe('req_123');
      expect(error.details).toEqual({ detail: 'test' });
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(FathemError);
    });
  });

  describe('FathemAuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new FathemAuthenticationError('Invalid API key', 'req_123');
      
      expect(error.message).toBe('Invalid API key');
      expect(error.name).toBe('FathemAuthenticationError');
      expect(error.statusCode).toBe(401);
      expect(error.requestId).toBe('req_123');
      expect(error).toBeInstanceOf(FathemError);
      expect(error).toBeInstanceOf(FathemAuthenticationError);
    });
  });

  describe('FathemRateLimitError', () => {
    it('should create rate limit error with retry after', () => {
      const error = new FathemRateLimitError('Rate limit exceeded', 60, 'req_123');
      
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.name).toBe('FathemRateLimitError');
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(60);
      expect(error.requestId).toBe('req_123');
      expect(error).toBeInstanceOf(FathemError);
      expect(error).toBeInstanceOf(FathemRateLimitError);
    });
  });

  describe('FathemNotFoundError', () => {
    it('should create not found error', () => {
      const error = new FathemNotFoundError('Conversation not found', 'req_123');
      
      expect(error.message).toBe('Conversation not found');
      expect(error.name).toBe('FathemNotFoundError');
      expect(error.statusCode).toBe(404);
      expect(error.requestId).toBe('req_123');
      expect(error).toBeInstanceOf(FathemError);
      expect(error).toBeInstanceOf(FathemNotFoundError);
    });
  });

  describe('FathemConflictError', () => {
    it('should create conflict error', () => {
      const error = new FathemConflictError('Conversation already resolved', 'req_123');
      
      expect(error.message).toBe('Conversation already resolved');
      expect(error.name).toBe('FathemConflictError');
      expect(error.statusCode).toBe(409);
      expect(error.requestId).toBe('req_123');
      expect(error).toBeInstanceOf(FathemError);
      expect(error).toBeInstanceOf(FathemConflictError);
    });
  });

  describe('FathemValidationError', () => {
    it('should create validation error with details', () => {
      const details = { field: 'conversationId', issue: 'required' };
      const error = new FathemValidationError('Validation failed', details, 'req_123');
      
      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('FathemValidationError');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
      expect(error.requestId).toBe('req_123');
      expect(error).toBeInstanceOf(FathemError);
      expect(error).toBeInstanceOf(FathemValidationError);
    });
  });

  describe('FathemNetworkError', () => {
    it('should create network error', () => {
      const details = { code: 'ECONNREFUSED' };
      const error = new FathemNetworkError('Network connection failed', details);
      
      expect(error.message).toBe('Network connection failed');
      expect(error.name).toBe('FathemNetworkError');
      expect(error.statusCode).toBeUndefined();
      expect(error.requestId).toBeUndefined();
      expect(error.details).toEqual(details);
      expect(error).toBeInstanceOf(FathemError);
      expect(error).toBeInstanceOf(FathemNetworkError);
    });
  });
});