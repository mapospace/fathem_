import {
  FathemClient,
  FathemAuthenticationError,
  FathemRateLimitError,
  FathemNotFoundError,
  FathemValidationError,
  Message,
} from '../src';

// Customer support agent assistant
class AgentAssistant {
  private client: FathemClient;
  private activeConversations: Map<string, Message[]> = new Map();

  constructor(apiKey: string) {
    this.client = new FathemClient({
      apiKey,
      timeout: 45000,
      retryAttempts: 3,
      retryDelay: 2000,
    });
  }

  async handleNewConversation(conversationId: string, initialMessage: string, userId?: string): Promise<void> {
    try {
      // Track the initial message
      const response = await this.client.trackConversation({
        conversationId,
        messages: [{ role: 'user', content: initialMessage }],
        userId,
      });

      console.log(`New conversation started: ${conversationId}`);
      console.log(`Messages tracked: ${response.data.messagesReceived}`);

      // Store for tracking
      this.activeConversations.set(conversationId, [
        { role: 'user', content: initialMessage }
      ]);

      // Find similar issues immediately
      const similar = await this.client.findSimilarConversations(initialMessage, 3);
      if (similar.data.totalFound > 0) {
        console.log(`Found ${similar.data.totalFound} similar conversations`);
        // Agent can use these recommendations
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    try {
      // Track the new message
      const response = await this.client.trackConversation({
        conversationId,
        messages: [{ role, content }],
      });

      console.log(`Added ${role} message to ${conversationId}`);
      console.log(`Is continuation: ${response.data.isIncremental}`);

      // Update local tracking
      const messages = this.activeConversations.get(conversationId) || [];
      messages.push({ role, content });
      this.activeConversations.set(conversationId, messages);

    } catch (error) {
      this.handleError(error);
    }
  }

  async resolveConversation(conversationId: string, resolution: string): Promise<void> {
    try {
      const response = await this.client.resolveConversation(conversationId, resolution);
      console.log(`Conversation ${conversationId} resolved`);
      console.log(`Resolution: ${response.data.resolutionNotes}`);
      
      // Clean up
      this.activeConversations.delete(conversationId);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): void {
    if (error instanceof FathemAuthenticationError) {
      console.error('Authentication failed. Check API key.');
    } else if (error instanceof FathemRateLimitError) {
      console.error(`Rate limit hit. Retry after ${error.retryAfter}s`);
    } else if (error instanceof FathemNotFoundError) {
      console.error('Resource not found:', error.message);
    } else if (error instanceof FathemValidationError) {
      console.error('Validation error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Example usage
async function demonstrateAgentAssistant() {
  const assistant = new AgentAssistant(
    process.env.FATHEM_API_KEY || 'your_api_key_here'
  );

  const conversationId = `support_${Date.now()}`;

  try {
    // Customer initiates
    await assistant.handleNewConversation(
      conversationId,
      "I can't access my account, it says my password is invalid",
      'customer_789'
    );

    // Agent responds
    await assistant.addMessage(
      conversationId,
      'assistant',
      "I can help you regain access. Let me verify your identity first. Can you provide your email?"
    );

    // Customer provides info
    await assistant.addMessage(
      conversationId,
      'user',
      'Yes, it\'s user@example.com'
    );

    // Agent helps
    await assistant.addMessage(
      conversationId,
      'assistant',
      "Thank you. I've sent a password reset link to user@example.com. Please check your email."
    );

    // Customer confirms
    await assistant.addMessage(
      conversationId,
      'user',
      'Got it! I was able to reset my password and log in. Thank you!'
    );

    // Resolve
    await assistant.resolveConversation(
      conversationId,
      'Password reset completed successfully via email link'
    );

  } catch (error) {
    console.error('Demo failed:', error);
  }
}

// Run the demo
demonstrateAgentAssistant().catch(console.error);