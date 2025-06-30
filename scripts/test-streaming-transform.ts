#!/usr/bin/env tsx

/**
 * Test script to verify ZenGPT streaming response transformation
 */

import { transformZenGPTResponseToDataStream } from '../lib/ai/response-transformer';

// Mock ZenGPT streaming response (similar to what we saw in curl test)
const mockZenGPTResponse = `data: {"content":{"parts":[{"text":"Hello"}],"role":"model"},"partial":true,"invocationId":"test-123","author":"ZenGPTCentralAgent","actions":{"stateDelta":{},"artifactDelta":{},"requestedAuthConfigs":{}},"id":"chunk1","timestamp":1751255536.452697}

data: {"content":{"parts":[{"text":"! I'm ZenGPT"}],"role":"model"},"partial":true,"invocationId":"test-123","author":"ZenGPTCentralAgent","actions":{"stateDelta":{},"artifactDelta":{},"requestedAuthConfigs":{}},"id":"chunk2","timestamp":1751255536.452697}

data: {"content":{"parts":[{"text":", your AI assistant."}],"role":"model"},"partial":true,"invocationId":"test-123","author":"ZenGPTCentralAgent","actions":{"stateDelta":{},"artifactDelta":{},"requestedAuthConfigs":{}},"id":"chunk3","timestamp":1751255536.452697}

data: {"content":{"parts":[{"text":"Hello! I'm ZenGPT, your AI assistant."}],"role":"model"},"partial":false,"invocationId":"test-123","author":"ZenGPTCentralAgent","actions":{"stateDelta":{},"artifactDelta":{},"requestedAuthConfigs":{}},"id":"final","timestamp":1751255536.452697}

`;

async function testStreamingTransformation() {
  console.log('🧪 Testing ZenGPT streaming transformation...\n');

  // Create a mock ReadableStream from the mock response
  const encoder = new TextEncoder();
  const mockStream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(mockZenGPTResponse));
      controller.close();
    },
  });

  // Transform the stream
  const transformedStream = transformZenGPTResponseToDataStream(mockStream);

  // Read and log the transformed output
  const reader = transformedStream.getReader();
  const decoder = new TextDecoder();

  console.log('📤 Transformed output:');
  console.log('─'.repeat(50));

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);
      process.stdout.write(chunk);
    }
  } catch (error) {
    console.error('❌ Error reading transformed stream:', error);
  } finally {
    reader.releaseLock();
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log('✅ Streaming transformation test completed!');
}

// Run the test
testStreamingTransformation().catch(console.error);
