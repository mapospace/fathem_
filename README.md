# Fathem AI SDK

A production-grade TypeScript SDK for the Fathem AI Context API - intelligent conversation tracking and analysis for customer service applications.

## Features

- 🚀 **Production Ready**: Built with TypeScript, comprehensive error handling, and extensive test coverage
- 🔄 **Automatic Retries**: Configurable retry logic with exponential backoff
- 🛡️ **Type Safe**: Full TypeScript support with detailed type definitions
- 📊 **Smart Rate Limiting**: Automatic handling of rate limits with retry-after support
- 🧪 **Well Tested**: Comprehensive unit tests with >80% coverage requirement
- 📝 **Detailed Errors**: Custom error classes for different failure scenarios
- ⚡ **Modern Async/Await**: Clean, promise-based API

## Installation

```bash
npm install fathem
```

## Quick Start

```typescript
import { FathemClient } from 'fathem';

// Initialize the client
const client = new FathemClient({
  apiKey: 'your_api_key_here'
});

// Track a conversation
const response = await client.trackConversation({
  conversationId: 'conv_123',
  messages: [
    { role: 'user', content: 'My payment is failing' },
    { role: 'assistant', content: 'I'll help you with that payment issue' }
  ],
  userId: 'customer_12345'
});

console.log('Issue Type:', response.data.issueType);
console.log('Current Stage:', response.data.currentStage);

// Mark conversation as resolved
await client.resolveConversation('conv_123');
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

Track conversation progress and get real-time recommendations.

```typescript
const response = await client.trackConversation({
  conversationId: 'conv_123',
  messages: [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' }
  ],
  userId: 'user_123',        // Optional
  isIncremental: false       // Optional: append to existing conversation
});
```

### Track Conversation Incrementally

Convenience method for incremental conversation updates.

```typescript
const response = await client.trackConversationIncremental(
  'conv_123',
  [{ role: 'user', content: 'New message' }],
  'user_123'
);
```

### Resolve Conversation

Mark a conversation as resolved. The system automatically generates resolution notes.

```typescript
const response = await client.resolveConversation('conv_123');
console.log('Resolution Notes:', response.data.resolutionNotes);
```

### Health Check

Check the API service health status.

```typescript
const health = await client.checkHealth();
console.log('Service Status:', health.services);
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
} from 'fathem';

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
  ResolveConversationResponse,
  HealthCheckResponse,
  Usage,
  Remaining
} from 'fathem';
```

## Best Practices

1. **Unique Conversation IDs**: Use unique conversation IDs for each customer session
2. **Complete Message History**: Send all messages or use incremental updates consistently
3. **Track Resolution**: Always mark conversations as resolved for better learning
4. **Error Recovery**: Implement proper error handling for production applications
5. **Rate Limit Handling**: The SDK handles rate limits automatically, but monitor usage

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

The SDK automatically handles rate limiting with exponential backoff. Rate limits vary by subscription tier:

- **Freemium**: 1,000 requests/month
- **Premium**: 25,000 requests/month
- **Pro**: 100,000 requests/month

## Support

For API support or technical questions, please contact the Fathem AI support team with your API key and specific requirements.

## License

MIT

## Contributing

Contributions are welcome! Please ensure:
- All tests pass (`npm test`)
- Code coverage remains >80%
- Linting passes (`npm run lint`)
- Code is properly formatted (`npm run format`)