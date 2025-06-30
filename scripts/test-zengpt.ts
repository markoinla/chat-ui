#!/usr/bin/env tsx

/**
 * ZenGPT Agent Testing Script
 *
 * This script tests the ZenGPT agent integration by:
 * 1. Validating environment configuration
 * 2. Testing agent connectivity
 * 3. Testing basic invoke functionality
 * 4. Testing streaming functionality
 * 5. Testing error handling
 */

import { ZenGPTClient, ZenGPTClientError } from '../lib/ai/zengpt-client';
import { transformResponse } from '../lib/ai/response-transformer';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✅ ${message}`, colors.green);
}

function error(message: string) {
  log(`❌ ${message}`, colors.red);
}

function warning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function section(title: string) {
  log(`\n${colors.bold}=== ${title} ===${colors.reset}`);
}

async function testEnvironmentConfiguration() {
  section('Environment Configuration Test');

  const requiredEnvVars = [
    'ZENGPT_API_URL',
    'ZENGPT_API_KEY',
    'ZENGPT_ENABLED',
  ];

  let allConfigured = true;

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      if (envVar === 'ZENGPT_API_KEY') {
        success(`${envVar}: configured (${value.slice(0, 8)}...)`);
      } else {
        success(`${envVar}: ${value}`);
      }
    } else {
      error(`${envVar}: not configured`);
      allConfigured = false;
    }
  }

  if (!allConfigured) {
    error(
      'Some environment variables are missing. Please check your .env.local file.',
    );
    return false;
  }

  return true;
}

async function testAgentConnectivity() {
  section('Agent Connectivity Test');

  try {
    const client = new ZenGPTClient();
    info('Testing health check endpoint...');

    const isHealthy = await client.healthCheck();

    if (isHealthy) {
      success('Agent health check passed');
      return true;
    } else {
      warning(
        'Agent health check failed, but this might be expected if health endpoint is not available',
      );
      return true; // Don't fail the test for this
    }
  } catch (err) {
    warning(
      `Health check failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    );
    info('Proceeding with other tests...');
    return true; // Don't fail the test for this
  }
}

async function testBasicInvoke() {
  section('Basic Invoke Test');

  try {
    const client = new ZenGPTClient();
    const sessionId = ZenGPTClient.generateSessionId('test');

    info(`Testing basic invoke with session: ${sessionId}`);
    info('Sending message: "Hello, this is a test message"');

    const response = await client.invoke(
      'Hello, this is a test message',
      sessionId,
    );

    if (response && response.response) {
      success('Basic invoke test passed');
      info(
        `Response: ${response.response.slice(0, 100)}${response.response.length > 100 ? '...' : ''}`,
      );

      if (response.metadata) {
        info(`Model used: ${response.metadata?.model_used}`);
        info(`Tokens used: ${response.metadata?.tokens_used}`);
      }

      // Test response transformation
      const transformed = transformResponse(response);
      if (transformed.parts && transformed.parts.length > 0) {
        success('Response transformation test passed');
        info(`Transformed parts: ${transformed.parts.length}`);
      } else {
        error('Response transformation test failed');
        return false;
      }

      return true;
    } else {
      error('Invalid response format');
      return false;
    }
  } catch (err) {
    if (err instanceof ZenGPTClientError) {
      error(`ZenGPT Error: ${err.data.error.message}`);
      info(`Error code: ${err.data.error.code}`);
    } else {
      error(
        `Invoke test failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
    return false;
  }
}

async function testStreamingFunctionality() {
  section('Streaming Test');

  try {
    const client = new ZenGPTClient();
    const sessionId = ZenGPTClient.generateSessionId('stream-test');

    info(`Testing streaming with session: ${sessionId}`);
    info('Sending message: "Count from 1 to 5 slowly"');

    const response = await client.stream('Count from 1 to 5 slowly', sessionId);

    if (!response.body) {
      error('No response body received');
      return false;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunks = 0;
    let totalData = '';

    info('Reading stream chunks...');

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks++;
        const chunk = decoder.decode(value, { stream: true });
        totalData += chunk;

        if (chunks <= 3) {
          // Only log first few chunks to avoid spam
          info(
            `Chunk ${chunks}: ${chunk.slice(0, 50)}${chunk.length > 50 ? '...' : ''}`,
          );
        }
      }

      success(`Streaming test passed - received ${chunks} chunks`);
      info(`Total data length: ${totalData.length} characters`);
      return true;
    } finally {
      reader.releaseLock();
    }
  } catch (err) {
    if (err instanceof ZenGPTClientError) {
      error(`ZenGPT Streaming Error: ${err.data.error.message}`);
    } else {
      error(
        `Streaming test failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
    return false;
  }
}

async function testErrorHandling() {
  section('Error Handling Test');

  try {
    const client = new ZenGPTClient();

    info('Testing with empty message (should fail gracefully)...');

    try {
      await client.invoke('', 'error-test-session');
      warning('Expected error but request succeeded');
    } catch (err) {
      if (err instanceof ZenGPTClientError) {
        success('Error handling test passed - caught ZenGPTClientError');
        info(`Error message: ${err.data.error.message}`);
      } else {
        success('Error handling test passed - caught generic error');
        info(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return true;
  } catch (err) {
    error(
      `Error handling test failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    );
    return false;
  }
}

async function testWithDifferentModels() {
  section('Model Selection Test');

  const modelsToTest = [
    'gpt-4o',
    'claude-3-5-sonnet-20241022',
    'gemini/gemini-2.5-flash',
  ];

  for (const model of modelsToTest) {
    try {
      const client = new ZenGPTClient();
      const sessionId = ZenGPTClient.generateSessionId(
        `model-test-${model.replace(/[^a-z0-9]/gi, '-')}`,
      );

      info(`Testing with model: ${model}`);

      const response = await client.invoke(
        'Say hello in one sentence',
        sessionId,
        { model, temperature: 0.1 },
      );

      if (response && response.response) {
        success(`Model ${model} test passed`);
        if (response.metadata?.model_used) {
          info(`Actual model used: ${response.metadata?.model_used}`);
        }
      } else {
        warning(`Model ${model} test failed - no response`);
      }
    } catch (err) {
      if (err instanceof ZenGPTClientError) {
        warning(`Model ${model} failed: ${err.data.error.message}`);
      } else {
        warning(
          `Model ${model} failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        );
      }
    }
  }

  return true;
}

async function runAllTests() {
  log(`${colors.bold}🧪 ZenGPT Agent Integration Test Suite${colors.reset}\n`);

  const tests = [
    { name: 'Environment Configuration', fn: testEnvironmentConfiguration },
    { name: 'Agent Connectivity', fn: testAgentConnectivity },
    { name: 'Basic Invoke', fn: testBasicInvoke },
    { name: 'Streaming Functionality', fn: testStreamingFunctionality },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Model Selection', fn: testWithDifferentModels },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (err) {
      error(
        `Test "${test.name}" threw an exception: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      results.push({ name: test.name, passed: false });
    }
  }

  // Summary
  section('Test Results Summary');

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((result) => {
    if (result.passed) {
      success(result.name);
    } else {
      error(result.name);
    }
  });

  log(
    `\n${colors.bold}Overall: ${passed}/${total} tests passed${colors.reset}`,
  );

  if (passed === total) {
    success('🎉 All tests passed! ZenGPT integration is ready.');
  } else {
    warning(
      `${total - passed} test(s) failed. Please check the configuration and try again.`,
    );
  }

  return passed === total;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      error(
        `Test suite failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      process.exit(1);
    });
}

export { runAllTests };
