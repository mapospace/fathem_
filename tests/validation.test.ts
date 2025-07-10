import {
  validateConversationId,
  validateMessages,
  validateTrackConversationRequest,
  validateApiKey,
} from '../src/utils/validation';
import { FathemValidationError } from '../src/errors';
import { Message, TrackConversationRequest } from '../src/types';

describe('Validation Utils', () => {
  describe('validateConversationId', () => {
    it('should pass for valid conversation ID', () => {
      expect(() => validateConversationId('conv_123')).not.toThrow();
      expect(() => validateConversationId('a')).not.toThrow();
      expect(() => validateConversationId('a'.repeat(100))).not.toThrow();
    });

    it('should throw for empty conversation ID', () => {
      expect(() => validateConversationId('')).toThrow(FathemValidationError);
      expect(() => validateConversationId('')).toThrow(
        'conversationId is required and must be a string',
      );
    });

    it('should throw for non-string conversation ID', () => {
      expect(() => validateConversationId(null as any)).toThrow(FathemValidationError);
      expect(() => validateConversationId(undefined as any)).toThrow(FathemValidationError);
      expect(() => validateConversationId(123 as any)).toThrow(FathemValidationError);
    });

    it('should throw for conversation ID exceeding length limit', () => {
      expect(() => validateConversationId('a'.repeat(101))).toThrow(FathemValidationError);
      expect(() => validateConversationId('a'.repeat(101))).toThrow(
        'conversationId must be between 1 and 100 characters',
      );
    });
  });

  describe('validateMessages', () => {
    const validMessages: Message[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];

    it('should pass for valid messages', () => {
      expect(() => validateMessages(validMessages)).not.toThrow();
      expect(() => validateMessages([{ role: 'user', content: 'Single message' }])).not.toThrow();
    });

    it('should throw for non-array messages', () => {
      expect(() => validateMessages(null as any)).toThrow(FathemValidationError);
      expect(() => validateMessages('not an array' as any)).toThrow('messages must be an array');
    });

    it('should throw for empty messages array', () => {
      expect(() => validateMessages([])).toThrow(FathemValidationError);
      expect(() => validateMessages([])).toThrow('messages array cannot be empty');
    });

    it('should throw for invalid message structure', () => {
      expect(() => validateMessages([null as any])).toThrow(
        'message at index 0 must be an object',
      );
      expect(() => validateMessages(['string' as any])).toThrow(
        'message at index 0 must be an object',
      );
    });

    it('should throw for invalid role', () => {
      const invalidMessages = [{ role: 'invalid', content: 'test' }] as any;
      expect(() => validateMessages(invalidMessages)).toThrow(
        "message at index 0 must have role 'user' or 'assistant'",
      );
    });

    it('should throw for missing or invalid content', () => {
      expect(() => validateMessages([{ role: 'user' } as any])).toThrow(
        'message at index 0 must have content as string',
      );
      expect(() => validateMessages([{ role: 'user', content: null } as any])).toThrow(
        'message at index 0 must have content as string',
      );
      expect(() => validateMessages([{ role: 'user', content: 123 } as any])).toThrow(
        'message at index 0 must have content as string',
      );
    });
  });

  describe('validateTrackConversationRequest', () => {
    const validRequest: TrackConversationRequest = {
      conversationId: 'conv_123',
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi!' },
      ],
    };

    it('should pass for valid request', () => {
      expect(() => validateTrackConversationRequest(validRequest)).not.toThrow();
      expect(() =>
        validateTrackConversationRequest({
          ...validRequest,
          userId: 'user_123',
          isIncremental: true,
        }),
      ).not.toThrow();
    });

    it('should validate conversationId', () => {
      const invalidRequest = { ...validRequest, conversationId: '' };
      expect(() => validateTrackConversationRequest(invalidRequest)).toThrow(
        FathemValidationError,
      );
    });

    it('should validate messages', () => {
      const invalidRequest = { ...validRequest, messages: [] };
      expect(() => validateTrackConversationRequest(invalidRequest)).toThrow(
        FathemValidationError,
      );
    });

    it('should validate optional userId type', () => {
      const invalidRequest = { ...validRequest, userId: 123 as any };
      expect(() => validateTrackConversationRequest(invalidRequest)).toThrow(
        'userId must be a string if provided',
      );
    });

    it('should validate optional isIncremental type', () => {
      const invalidRequest = { ...validRequest, isIncremental: 'true' as any };
      expect(() => validateTrackConversationRequest(invalidRequest)).toThrow(
        'isIncremental must be a boolean if provided',
      );
    });
  });

  describe('validateApiKey', () => {
    it('should pass for valid API key', () => {
      expect(() => validateApiKey('test_api_key_123')).not.toThrow();
      expect(() => validateApiKey('a')).not.toThrow();
    });

    it('should throw for empty API key', () => {
      expect(() => validateApiKey('')).toThrow(FathemValidationError);
      expect(() => validateApiKey('')).toThrow('API key is required and must be a string');
    });

    it('should throw for non-string API key', () => {
      expect(() => validateApiKey(null as any)).toThrow(
        'API key is required and must be a string',
      );
      expect(() => validateApiKey(undefined as any)).toThrow(
        'API key is required and must be a string',
      );
      expect(() => validateApiKey(123 as any)).toThrow(
        'API key is required and must be a string',
      );
    });

    it('should throw for whitespace-only API key', () => {
      expect(() => validateApiKey('   ')).toThrow('API key cannot be empty');
      expect(() => validateApiKey('\t\n')).toThrow('API key cannot be empty');
    });
  });
});