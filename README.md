# Fathem AI SDK

TypeScript SDK for the Fathem AI Context API - intelligent conversation tracking and analysis for customer service applications.

## Version 2.0.0 - Breaking Changes

> **Important**: Version 2.0.0 removes the `trackConversationIncremental` method. The API now automatically handles incremental updates based on conversation ID.

## Features

- 🚀 **Production Ready**: Built with TypeScript, comprehensive error handling, and extensive test coverage
- 🔄 **Automatic Incremental Updates**: API automatically detects if messages should be added to existing conversations
- 🛡️ **Type Safe**: Full TypeScript support with detailed type definitions
- 📊 **Smart Recommendations**: AI-powered similarity search with actionable recommendations
- 🧪 **Well Tested**: Comprehensive unit tests with >80% coverage requirement
- 📝 **Detailed Errors**: Custom error classes for different failure scenarios
- ⚡ **Modern Async/Await**: Clean, promise-based API

## Installation

```bash
npm install @fathem/fathem
```

## Quick Start

```typescript
import { FathemClient } from '@fathem/fathem';

// Initialize the client
const client = new FathemClient({
  apiKey: 'your_api_key_here'
});

// Track a NEW conversation
const response = await client.trackConversation({
  conversationId: 'conv_123',
  messages: [
    { role: 'user', content: 'My payment is failing' },
    { role: 'assistant', content: 'I'll help you with that payment issue' }
  ],
  userId: 'customer_12345'
});

console.log('Messages tracked:', response.data.messagesReceived);
console.log('Is incremental:', response.data.isIncremental); // false for new conversations

// Continue the SAME conversation (automatically incremental)
const response2 = await client.trackConversation({
  conversationId: 'conv_123',  // Same ID = incremental update
  messages: [
    { role: 'user', content: 'It says card declined' },
    { role: 'assistant', content: 'Let me check your card status' }
  ]
});

console.log('Is incremental:', response2.data.isIncremental); // true for existing conversations
```

## Configuration

```typescript
const client = new FathemClient({
  apiKey: 'your_api_key_here',         // Required
  baseURL: 'https://custom-api.com',   // Optional: custom API endpoint
  timeout: 30000,                      // Optional: request timeout in ms (default: 30000)
  retryAttempts: 3,                    // Optional: number of retry attempts (default: 3)
  retryDelay: 1000                     // Optional: initial retry delay in ms (default: 1000)
});
```

## API Methods

### Track Conversation

Track conversation messages. The API automatically handles incremental updates based on conversation ID.

```typescript
// First call - creates new conversation
const response = await client.trackConversation({
  conversationId: 'conv_123',
  messages: [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' }
  ],
  userId: 'user_123'  // Optional
});

// Subsequent calls - automatically incremental
const response2 = await client.trackConversation({
  conversationId: 'conv_123',  // Same ID
  messages: [                  // Only NEW messages
    { role: 'user', content: 'I need help' }
  ]
});
```

### Find Similar Conversations

Search for similar issues and get AI-powered recommendations.

```typescript
const similar = await client.findSimilarConversations(
  'payment declined credit card',
  10  // Optional: limit (default: 10, max: 100)
);

// Access recommendations
if (similar.data.recommendations?.recommendedActions) {
  similar.data.recommendations.recommendedActions.forEach(action => {
    console.log(`Action: ${action.action}`);
    console.log(`Success Rate: ${action.successProbability * 100}%`);
  });
}
```

### Resolve Conversation

Mark a conversation as resolved with optional custom notes.

```typescript
// With custom resolution notes
const response = await client.resolveConversation(
  'conv_123',
  'Issue resolved - updated payment method'
);

// Without notes (auto-generated)
const response2 = await client.resolveConversation('conv_456');
```

### Health Check

Check the API service health status.

```typescript
const health = await client.checkHealth();
console.log('Service Status:', health.message);
console.log('Services:', health.services);
```

## Error Handling

The SDK provides detailed error classes for different scenarios:

```typescript
import {
  FathemError,
  FathemAuthenticationError,
  FathemRateLimitError,
  FathemNotFoundError,
  FathemConflictError,
  FathemValidationError,
  FathemNetworkError
} from '@fathem/fathem';

try {
  await client.trackConversation(request);
} catch (error) {
  if (error instanceof FathemAuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof FathemRateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof FathemNotFoundError) {
    console.error('Conversation not found');
  } else if (error instanceof FathemConflictError) {
    console.error('Conversation already resolved');
  } else if (error instanceof FathemValidationError) {
    console.error('Invalid request:', error.details);
  } else if (error instanceof FathemNetworkError) {
    console.error('Network error:', error.message);
  }
}
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import {
  FathemClient,
  FathemConfig,
  Message,
  TrackConversationRequest,
  TrackConversationResponse,
  SimilaritySearchRequest,
  SimilaritySearchResponse,
  ResolveConversationRequest,
  ResolveConversationResponse,
  HealthCheckResponse
} from '@fathem/fathem';
```

## Best Practices

1. **Unique Conversation IDs**: Use unique conversation IDs for each customer session
2. **Send Only New Messages**: When updating conversations, only send new messages
3. **Track Resolution**: Always mark conversations as resolved for better AI learning
4. **Error Recovery**: Implement proper error handling for production applications
5. **Check Response Flags**: Use `isIncremental` in responses to verify behavior

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the package
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

## API Rate Limits

The SDK automatically handles rate limiting with exponential backoff. When limits are exceeded:
- You'll receive a 429 status code
- The error includes details about which limit was reached
- Use the `retryAfter` value to wait before retrying

## Support

For API support or technical questions, please contact the Fathem AI support team with your API key and specific error details.

## License

MIT

## Contributing

Contributions are welcome! Please ensure:
- All tests pass (`npm test`)
- Code coverage remains >80%
- Linting passes (`npm run lint`)
- Code is properly formatted (`npm run format`)