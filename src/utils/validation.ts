import { Message, TrackConversationRequest } from '../types';
import { FathemValidationError } from '../errors';

export function validateConversationId(conversationId: string): void {
  if (!conversationId || typeof conversationId !== 'string') {
    throw new FathemValidationError('conversationId is required and must be a string');
  }

  if (conversationId.length < 1 || conversationId.length > 100) {
    throw new FathemValidationError('conversationId must be between 1 and 100 characters');
  }
}

export function validateMessages(messages: Message[]): void {
  if (!Array.isArray(messages)) {
    throw new FathemValidationError('messages must be an array');
  }

  if (messages.length === 0) {
    throw new FathemValidationError('messages array cannot be empty');
  }

  messages.forEach((message, index) => {
    if (!message || typeof message !== 'object') {
      throw new FathemValidationError(`message at index ${index} must be an object`);
    }

    if (!['user', 'assistant'].includes(message.role)) {
      throw new FathemValidationError(
        `message at index ${index} must have role 'user' or 'assistant'`,
      );
    }

    if (!message.content || typeof message.content !== 'string') {
      throw new FathemValidationError(`message at index ${index} must have content as string`);
    }
  });
}

export function validateTrackConversationRequest(request: TrackConversationRequest): void {
  validateConversationId(request.conversationId);
  validateMessages(request.messages);

  if (request.userId !== undefined && typeof request.userId !== 'string') {
    throw new FathemValidationError('userId must be a string if provided');
  }

  if (request.isIncremental !== undefined && typeof request.isIncremental !== 'boolean') {
    throw new FathemValidationError('isIncremental must be a boolean if provided');
  }
}

export function validateApiKey(apiKey: string): void {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new FathemValidationError('API key is required and must be a string');
  }

  if (apiKey.trim().length === 0) {
    throw new FathemValidationError('API key cannot be empty');
  }
}
