import { transformZenGPTResponseToDataStream } from '../lib/ai/response-transformer';

// Mock ZenGPT SSE response data (based on actual response format)
const mockZenGPTSSEData = `data: {"content":{"parts":[{"text":"Hello"}],"role":"model"},"partial":true,"invocationId":"test","author":"ZenGPTCentralAgent","actions":{"stateDelta":{},"artifactDelta":{},"requestedAuthConfigs":{}},"id":"1","timestamp":1751255536.452697}

data: {"content":{"parts":[{"text":"! I'm ZenGPT"}],"role":"model"},"partial":true,"invocationId":"test","author":"ZenGPTCentralAgent","actions":{"stateDelta":{},"artifactDelta":{},"requestedAuthConfigs":{}},"id":"2","timestamp":1751255536.452697}

data: {"content":{"parts":[{"text":", your AI assistant."}],"role":"model"},"partial":true,"invocationId":"test","author":"ZenGPTCentralAgent","actions":{"stateDelta":{},"artifactDelta":{},"requestedAuthConfigs":{}},"id":"3","timestamp":1751255536.452697}

data: {"content":{"parts":[{"text":"Hello! I'm ZenGPT, your AI assistant."}],"role":"model"},"partial":false,"invocationId":"test","author":"ZenGPTCentralAgent","actions":{"stateDelta":{},"artifactDelta":{},"requestedAuthConfigs":{}},"id":"4","timestamp":1751255536.452697}

`;

async function testTransformer() {
  console.log('Testing ZenGPT Response Transformer...\n');

  // Create a mock ReadableStream from the SSE data
  const encoder = new TextEncoder();
  const mockStream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(mockZenGPTSSEData));
      controller.close();
    },
  });

  // Transform the stream
  const transformedStream = transformZenGPTResponseToDataStream(mockStream);
  const reader = transformedStream.getReader();
  const decoder = new TextDecoder();

  console.log('Transformed output:');
  console.log('==================');

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      console.log(chunk);
    }
  } catch (error) {
    console.error('Error reading transformed stream:', error);
  } finally {
    reader.releaseLock();
  }

  console.log('\nTest completed!');
}

// Run the test
testTransformer().catch(console.error);
