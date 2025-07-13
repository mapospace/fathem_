# Changelog

All notable changes to the Fathem SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-15

### BREAKING CHANGES
- Removed `trackConversationIncremental()` method - use `trackConversation()` for all message tracking
- Removed `isIncremental` parameter from `TrackConversationRequest` type
- The API now automatically handles incremental updates based on conversation ID

### Changed
- `trackConversation()` now automatically detects if it should create a new conversation or add to an existing one
- Updated all examples to use the simplified API
- Improved documentation to clarify automatic incremental behavior
- Updated TypeScript types to match actual API responses

### Added
- `findSimilarConversations()` method for AI-powered similarity search
- Support for similarity search with recommendations
- New types: `SimilaritySearchRequest`, `SimilaritySearchResponse`, and related interfaces
- Comprehensive error handling for all API responses
- Better examples showing real-world usage patterns

### Fixed
- API endpoint paths now correctly match the documentation
- Response types now accurately reflect what the API returns
- Removed confusion around incremental updates

### Migration Guide

#### Before (v1.x):
```typescript
// Initial tracking
await client.trackConversation({
  conversationId: 'conv_123',
  messages: [...],
  isIncremental: false
});

// Incremental update
await client.trackConversationIncremental('conv_123', [...]);
```

#### After (v2.0):
```typescript
// Initial tracking (same conversationId = new conversation)
await client.trackConversation({
  conversationId: 'conv_123',
  messages: [...]
});

// Incremental update (same conversationId = add to existing)
await client.trackConversation({
  conversationId: 'conv_123',
  messages: [...] // Only new messages
});
```

The API response includes `isIncremental: true/false` to indicate what happened.

## [1.0.0] - 2024-01-10

### Added
- Initial release of Fathem SDK
- Basic conversation tracking
- Resolution management
- Health check endpoint
- TypeScript support
- Comprehensive error handling
- Automatic retry logic