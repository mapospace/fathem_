import { FathemClient } from '../src';

async function main() {
  // Initialize the client with your API key
  const client = new FathemClient({
    apiKey: process.env.FATHEM_API_KEY || 'your_api_key_here',
  });

  try {
    // Example 1: Track a simple conversation
    console.log('=== Example 1: Basic Conversation Tracking ===');
    const trackResponse = await client.trackConversation({
      conversationId: 'example_conv_001',
      messages: [
        { role: 'user', content: 'My credit card payment is being declined' },
        { role: 'assistant', content: 'I understand you're having trouble with a payment. Let me help you resolve this issue.' },
        { role: 'user', content: 'It says insufficient funds but I have money in my account' },
        { role: 'assistant', content: 'That's concerning. Let me check your account details and recent transactions.' }
      ],
      userId: 'customer_12345',
    });

    console.log('Issue Type:', trackResponse.data.issueType);
    console.log('Current Stage:', trackResponse.data.currentStage);
    console.log('Escalation Point:', trackResponse.data.escalationPoint);
    console.log('Similar Resolutions:', trackResponse.data.similarResolutions.length);
    console.log('Tokens Used:', trackResponse.data.usage.tokensUsed);
    console.log('\n');

    // Example 2: Incremental conversation update
    console.log('=== Example 2: Incremental Update ===');
    const incrementalResponse = await client.trackConversationIncremental(
      'example_conv_001',
      [
        { role: 'assistant', content: 'I can see there was a temporary hold placed on your card. Let me remove that for you.' },
        { role: 'user', content: 'Oh, that would explain it. Thank you!' }
      ],
      'customer_12345'
    );

    console.log('Updated Stage:', incrementalResponse.data.currentStage);
    console.log('\n');

    // Example 3: Resolve the conversation
    console.log('=== Example 3: Resolving Conversation ===');
    const resolveResponse = await client.resolveConversation('example_conv_001');
    console.log('Resolution Notes:', resolveResponse.data.resolutionNotes);
    console.log('\n');

    // Example 4: Check service health
    console.log('=== Example 4: Health Check ===');
    const healthResponse = await client.checkHealth();
    console.log('Service Status:', healthResponse.message);
    console.log('Services:', healthResponse.services);
    console.log('Timestamp:', healthResponse.timestamp);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main().catch(console.error);