// Test script for streaming endpoint
// Run with: node test-streaming.js

const API_URL = 'http://localhost:3000/api/gemini-stream'; // Update for your environment

async function testStreaming() {
  console.log('🧪 Testing Gemini Streaming Endpoint...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Write a brief test message about League of Legends wave management.',
        model: 'gemini-2.5-flash'
      })
    });

    if (!response.ok) {
      console.error('❌ Request failed:', response.status, response.statusText);
      return;
    }

    console.log('✅ Connection established');
    console.log('📡 Streaming response:\n');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('\n\n✅ Stream completed');
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            console.log('\n📋 Received completion signal');
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              console.error('❌ Error:', parsed.error);
            } else if (parsed.text) {
              chunkCount++;
              process.stdout.write(parsed.text);
            } else if (parsed.groundingMetadata) {
              console.log('\n\n🔍 Grounding Metadata:', JSON.stringify(parsed.groundingMetadata, null, 2));
            }
          } catch (e) {
            console.error('⚠️ Parse error:', e.message);
          }
        }
      }
    }

    console.log(`\n\n📊 Statistics:`);
    console.log(`   Chunks received: ${chunkCount}`);
    console.log(`   Status: SUCCESS`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testStreaming();

