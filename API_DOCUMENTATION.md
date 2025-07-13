# Fathem Context API Documentation

Base URL: `https://fathom-ai-465017.el.r.appspot.com/api/v1/context`

## Overview

The Context API provides intelligent conversation tracking, resolution management, and similarity search capabilities. It uses a graph-based knowledge system to understand customer issues, track solution attempts, and provide recommendations based on historical data.

## Authentication

All endpoints require authentication using an API key:

- **Header**: `X-API-Key: your-api-key`

## Endpoints

### 1. Track Conversation

Track customer conversations incrementally and build knowledge about issues and solutions.

**Endpoint**: `POST /track`

**Description**: This endpoint accepts incremental conversation updates (new messages only) and automatically:
- Identifies issue types
- Tracks solution attempts
- Updates success/failure statistics
- Builds resolution patterns

**Request Body**:
```json
{
  "conversationId": "unique-conversation-id",
  "messages": [
    {
      "role": "user",
      "content": "My payment is being declined"
    },
    {
      "role": "assistant", 
      "content": "I'll help you with that. Can you check if your card is expired?"
    }
  ],
  "userId": "optional-user-id"
}
```

**Parameters**:
- `conversationId` (required): Unique identifier for the conversation
- `messages` (required): Array of new messages to add (max 10 per request)
  - You can send any number of messages in any order (e.g., user, assistant, assistant, user)
  - Each message must have:
    - `role`: Either "user" or "assistant"
    - `content`: The message content (string)
- `userId` (optional): Identifier for the user

**Response**:
```json
{
  "success": true,
  "message": "Conversation tracking initiated",
  "data": {
    "conversationId": "unique-conversation-id",
    "messagesReceived": 2,
    "isIncremental": true
  },
  "requestId": "req-123"
}
```

**Usage Example**:
```bash
curl -X POST https://fathom-ai-465017.el.r.appspot.com/api/v1/context/track \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "conversationId": "conv-001",
    "messages": [
      {"role": "user", "content": "My card keeps getting declined"},
      {"role": "assistant", "content": "Let me check that for you"},
      {"role": "assistant", "content": "I see the issue - your card appears to be expired"},
      {"role": "user", "content": "Oh! I didn't realize that"}
    ]
  }'
```

### 2. Mark Conversation as Resolved

Mark a conversation as resolved and optionally provide resolution notes.

**Endpoint**: `POST /resolve`

**Description**: Marks a conversation as resolved and generates resolution insights. If no resolution notes are provided, the system will auto-generate them based on the conversation history.

**Request Body**:
```json
{
  "conversationId": "unique-conversation-id",
  "resolutionNotes": "Customer's card was expired. Updated payment method resolved the issue."
}
```

**Parameters**:
- `conversationId` (required): The conversation to mark as resolved
- `resolutionNotes` (optional): Custom resolution notes (auto-generated if not provided)

**Response**:
```json
{
  "success": true,
  "message": "Conversation marked as resolved",
  "data": {
    "conversationId": "unique-conversation-id",
    "resolutionNotes": "Customer's card was expired. Updated payment method resolved the issue."
  },
  "requestId": "req-124"
}
```

**Usage Example**:
```bash
curl -X POST https://fathom-ai-465017.el.r.appspot.com/api/v1/context/resolve \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "conversationId": "conv-001",
    "resolutionNotes": "Resolved by updating expired card"
  }'
```

### 3. Find Similar Conversations

Search for similar conversations and get AI-powered recommendations based on historical patterns.

**Endpoint**: `POST /similarity`

**Description**: Uses semantic search to find similar customer issues and provides actionable recommendations based on successful resolutions.

**Request Body**:
```json
{
  "message": "Customer says their payment is not going through",
  "limit": 10
}
```

**Parameters**:
- `message` (required): The customer message or issue description to search for
- `limit` (optional): Maximum number of results to return (default: 10, max: 100)

**Response**:
```json
{
  "success": true,
  "message": "Similar conversations retrieved successfully",
  "data": {
    "query": "Customer says their payment is not going through",
    "totalFound": 3,
    "conversations": [
      {
        "resolutionNotes": "Card was expired. Customer updated payment method.",
        "issueDetails": {
          "name": "payment_declined",
          "description": "Payment card declined by bank or payment processor",
          "occurrences": 45,
          "symptoms": ["card declined", "payment failed", "transaction rejected"],
          "causes": ["expired card", "insufficient funds", "incorrect details"]
        },
        "attemptedSolutions": [
          {
            "solution": "verify_card_details",
            "outcome": "success",
            "confidence": 0.85,
            "solutionDetails": {
              "description": "Guide customer to verify and update card information",
              "steps": [
                "Ask customer to check card expiration date",
                "Verify billing address matches bank records",
                "Check for sufficient funds"
              ],
              "prerequisites": ["Access to card", "Online account access"],
              "successIndicators": ["Payment processes successfully"],
              "stats": {
                "successCount": 38,
                "failureCount": 7,
                "totalAttempts": 45,
                "successRate": 0.84
              }
            }
          }
        ]
      }
    ],
    "recommendations": {
      "issueType": "payment_declined",
      "recommendedActions": [
        {
          "action": "verify_card_details",
          "successProbability": 0.84,
          "averageTimeToResolve": 5
        },
        {
          "action": "check_bank_restrictions",
          "successProbability": 0.72,
          "averageTimeToResolve": 10
        }
      ],
      "escalationPoint": 3,
      "historicalSuccessRate": 0.78,
      "similarResolutions": []
    }
  },
  "requestId": "req-125"
}
```

**Usage Example**:
```bash
curl -X POST https://fathom-ai-465017.el.r.appspot.com/api/v1/context/similarity \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "message": "My payment keeps failing",
    "limit": 5
  }'
```

## Rate Limits and Quotas

API usage is subject to your subscription plan limits:

- **Requests**: Number of API calls per month
- **Tokens**: Total tokens processed for AI operations
- **Retrievals**: Number of similarity searches per month

When limits are exceeded, you'll receive a 429 status code with details about which limit was reached.

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "requestId": "req-123"
}
```

**Common Error Codes**:
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Invalid or missing API key
- `404`: Not Found - Conversation not found (for resolve endpoint)
- `409`: Conflict - Conversation already resolved
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error

## Best Practices

1. **Incremental Updates**: Send only new messages to the track endpoint, not the entire conversation history
2. **Conversation IDs**: Use unique, persistent IDs for each conversation
3. **Message Order**: Maintain chronological order when sending messages
4. **Resolution**: Always mark conversations as resolved when completed for better pattern recognition
5. **Error Handling**: Implement exponential backoff for rate limit errors

## Integration Example

Here's a complete example of tracking a conversation from start to resolution:

```javascript
const API_KEY = 'your-api-key';
const BASE_URL = 'https://fathom-ai-465017.el.r.appspot.com/api/v1/context';

// 1. Start tracking a new conversation
async function trackConversation(conversationId, messages) {
  const response = await fetch(`${BASE_URL}/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      conversationId,
      messages
    })
  });
  return response.json();
}

// 2. Find similar issues for recommendations
async function findSimilar(message) {
  const response = await fetch(`${BASE_URL}/similarity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      message,
      limit: 5
    })
  });
  return response.json();
}

// 3. Mark as resolved when done
async function resolveConversation(conversationId, notes) {
  const response = await fetch(`${BASE_URL}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      conversationId,
      resolutionNotes: notes
    })
  });
  return response.json();
}

// Example workflow
async function handleCustomerIssue() {
  const conversationId = 'conv-' + Date.now();
  
  // Track initial messages
  await trackConversation(conversationId, [
    { role: 'user', content: 'My payment is failing' },
    { role: 'assistant', content: 'I can help with that' }
  ]);
  
  // Get recommendations
  const similar = await findSimilar('payment failing');
  console.log('Recommended solutions:', similar.data.recommendations);
  
  // Continue conversation...
  await trackConversation(conversationId, [
    { role: 'user', content: 'It was my expired card!' },
    { role: 'assistant', content: 'Great! Please update your card details' }
  ]);
  
  // Mark as resolved
  await resolveConversation(conversationId, 'Expired card - customer updated payment method');
}
```

