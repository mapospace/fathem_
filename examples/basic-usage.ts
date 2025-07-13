import { FathemClient } from '../src';

async function main() {
  // Initialize the client with your API key
  const client = new FathemClient({
    apiKey: process.env.FATHEM_API_KEY || 'your_api_key_here',
  });

  try {
    const conversationId = 'example_conv_001';
    
    // Track initial messages
    console.log('1. Tracking initial conversation...');
    const response1 = await client.trackConversation({
      conversationId,
      messages: [
        { role: 'user', content: 'My payment is being declined' },
        { role: 'assistant', content: 'I can help you with that. What type of card are you using?' }
      ],
      userId: 'customer_12345',
    });
    console.log(`   Tracked ${response1.data.messagesReceived} messages`);
    console.log(`   Is Incremental: ${response1.data.isIncremental}\n`);

    // Continue the conversation
    console.log('2. Adding more messages...');
    const response2 = await client.trackConversation({
      conversationId,
      messages: [
        { role: 'user', content: 'Visa ending in 1234' },
        { role: 'assistant', content: 'I see. The issue might be an expired card or bank restriction. Please check the expiration date.' },
        { role: 'user', content: 'Oh, it expired last month! That must be it.' }
      ]
    });
    console.log(`   Tracked ${response2.data.messagesReceived} messages`);
    console.log(`   Is Incremental: ${response2.data.isIncremental}\n`);

    // Find similar issues
    console.log('3. Finding similar issues...');
    const similar = await client.findSimilarConversations(
      'payment declined expired card',
      5
    );
    console.log(`   Found ${similar.data.totalFound} similar conversations\n`);

    // Resolve the conversation
    console.log('4. Resolving conversation...');
    const resolved = await client.resolveConversation(
      conversationId,
      'Payment issue resolved - expired card identified'
    );
    console.log(`   Resolution: ${resolved.data.resolutionNotes}\n`);

    // Check service health
    console.log('5. Checking API health...');
    const health = await client.checkHealth();
    console.log(`   Status: ${health.message}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main().catch(console.error);