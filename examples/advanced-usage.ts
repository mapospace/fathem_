import {
  FathemClient,
  FathemAuthenticationError,
  FathemRateLimitError,
  FathemNotFoundError,
  FathemConflictError,
  FathemValidationError,
  TrackConversationRequest,
  Message,
} from '../src';

// Custom conversation manager with error handling and retry logic
class ConversationManager {
  private client: FathemClient;
  private conversations: Map<string, Message[]> = new Map();

  constructor(apiKey: string) {
    this.client = new FathemClient({
      apiKey,
      timeout: 45000,
      retryAttempts: 5,
      retryDelay: 2000,
    });
  }

  async startConversation(conversationId: string, initialMessage: string): Promise<void> {
    const messages: Message[] = [{ role: 'user', content: initialMessage }];
    this.conversations.set(conversationId, messages);

    try {
      const response = await this.client.trackConversation({
        conversationId,
        messages,
      });

      console.log(`Conversation ${conversationId} started`);
      console.log(`Detected issue type: ${response.data.issueType}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<void> {
    const messages = this.conversations.get(conversationId);
    if (!messages) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    messages.push({ role, content });

    try {
      const response = await this.client.trackConversationIncremental(
        conversationId,
        [{ role, content }],
      );

      console.log(`Message added to ${conversationId}`);
      console.log(`Current stage: ${response.data.currentStage}`);

      // Check if we should escalate
      if (response.data.escalationPoint > 5) {
        console.warn('Consider escalating to human agent');
      }

      // Show similar resolutions if available
      if (response.data.similarResolutions.length > 0) {
        console.log('Similar resolutions found:');
        response.data.similarResolutions.forEach((resolution) => {
          console.log(`- ${resolution.issueType}: ${resolution.resolutionPath.join(' -> ')}`);
        });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async resolveConversation(conversationId: string): Promise<void> {
    try {
      const response = await this.client.resolveConversation(conversationId);
      console.log(`Conversation ${conversationId} resolved`);
      console.log(`Resolution: ${response.data.resolutionNotes}`);
      this.conversations.delete(conversationId);
    } catch (error) {
      if (error instanceof FathemConflictError) {
        console.log('Conversation already resolved');
        this.conversations.delete(conversationId);
      } else {
        this.handleError(error);
      }
    }
  }

  private handleError(error: unknown): void {
    if (error instanceof FathemAuthenticationError) {
      console.error('Authentication failed. Please check your API key.');
      process.exit(1);
    } else if (error instanceof FathemRateLimitError) {
      console.error(`Rate limit exceeded. Retry after ${error.retryAfter} seconds`);
      console.error('Consider upgrading your subscription for higher limits');
    } else if (error instanceof FathemNotFoundError) {
      console.error('Conversation not found. It may have been deleted or expired.');
    } else if (error instanceof FathemValidationError) {
      console.error('Validation error:', error.message);
      if (error.details) {
        console.error('Details:', error.details);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Example usage
async function runAdvancedExample() {
  const manager = new ConversationManager(
    process.env.FATHEM_API_KEY || 'your_api_key_here',
  );

  // Simulate a customer service conversation
  const conversationId = `conv_${Date.now()}`;

  try {
    // Customer initiates conversation
    await manager.startConversation(
      conversationId,
      "I can't log into my account. It says my password is wrong but I'm sure it's correct.",
    );

    // Agent responds
    await manager.addMessage(
      conversationId,
      'assistant',
      "I'm sorry to hear you're having trouble logging in. Let me help you with that. First, can you confirm the email address associated with your account?",
    );

    // Customer provides information
    await manager.addMessage(
      conversationId,
      'user',
      'Yes, it\'s john.doe@example.com',
    );

    // Agent provides solution
    await manager.addMessage(
      conversationId,
      'assistant',
      "Thank you. I can see your account. For security, I've sent a password reset link to john.doe@example.com. Please check your email and follow the instructions.",
    );

    // Customer confirms resolution
    await manager.addMessage(
      conversationId,
      'user',
      'Got it! I received the email and was able to reset my password. Thanks for your help!',
    );

    // Agent closes conversation
    await manager.addMessage(
      conversationId,
      'assistant',
      "You're welcome! I'm glad I could help you regain access to your account. Is there anything else I can assist you with today?",
    );

    await manager.addMessage(
      conversationId,
      'user',
      "No, that's all. Thanks again!",
    );

    // Resolve the conversation
    await manager.resolveConversation(conversationId);

    // Demonstrate error handling by trying to update a resolved conversation
    console.log('\n--- Testing error handling ---');
    await manager.addMessage(
      conversationId,
      'user',
      'Actually, I have another question...',
    );
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Run the example
runAdvancedExample().catch(console.error);