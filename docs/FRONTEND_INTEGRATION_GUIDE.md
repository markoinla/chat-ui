# ZenGPT Central Agent - Frontend Integration Guide

This guide shows how to integrate your frontend application with the deployed ZenGPT Central Agent on Google Cloud Run.

## Service Information

- **Base URL**: `https://zengpt-central-agent-79646917313.us-central1.run.app`
- **App Name**: `zengpt_central_agent`
- **Authentication**: Unauthenticated (public access enabled)
- **CORS**: Not natively supported (requires proxy solution)

## Quick Start

### 1. Basic API Endpoints

```javascript
const BASE_URL = 'https://zengpt-central-agent-79646917313.us-central1.run.app';
const APP_NAME = 'zengpt_central_agent';

// List available apps
GET ${BASE_URL}/list-apps

// Create/update session
POST ${BASE_URL}/apps/${APP_NAME}/users/{userId}/sessions/{sessionId}
Body: {"state": {}}

// Send message (synchronous)
POST ${BASE_URL}/run
Body: {
  "appName": "zengpt_central_agent",
  "userId": "your_user_id",
  "sessionId": "your_session_id",
  "newMessage": {
    "parts": [{"text": "Your message here"}]
  }
}

// Send message (streaming)
POST ${BASE_URL}/run_sse
Body: Same as above + "streaming": true
```

### 2. CORS Solution (Required)

Since the service doesn't include CORS headers, you need a proxy solution:

#### Option A: Next.js API Route (Recommended)

Create `pages/api/zengpt/[...path].js`:

```javascript
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Construct target URL
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path;
  const targetUrl = `https://zengpt-central-agent-79646917313.us-central1.run.app/${pathString}`;
  
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
}
```

## Complete React Implementation

```jsx
// hooks/useZenGPT.js
import { useState, useCallback } from 'react';

export const useZenGPT = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const baseUrl = '/api/zengpt';
  const appName = 'zengpt_central_agent';

  const createSession = useCallback(async (userId, sessionId) => {
    try {
      const response = await fetch(
        `${baseUrl}/apps/${appName}/users/${userId}/sessions/${sessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: {} })
        }
      );
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const sendMessage = useCallback(async (userId, sessionId, message) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseUrl}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName,
          userId,
          sessionId,
          newMessage: { parts: [{ text: message }] }
        })
      });
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createSession, sendMessage, loading, error };
};

// components/ZenGPTChat.jsx
import React, { useState, useEffect } from 'react';
import { useZenGPT } from '../hooks/useZenGPT';

const ZenGPTChat = () => {
  const { createSession, sendMessage, loading, error } = useZenGPT();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(`session_${Date.now()}`);
  const userId = 'default_user';

  useEffect(() => {
    createSession(userId, sessionId);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await sendMessage(userId, sessionId, input);
      if (response?.[0]?.content?.parts?.[0]?.text) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response[0].content.parts[0].text
        }]);
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="h-96 overflow-y-auto border rounded p-4 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-center text-gray-500">Thinking...</div>}
        {error && <div className="text-red-500">Error: {error}</div>}
      </div>
      
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 border rounded px-3 py-2"
          disabled={loading}
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ZenGPTChat;
```

## Testing Commands

```bash
# Test session creation
curl -X POST "https://zengpt-central-agent-79646917313.us-central1.run.app/apps/zengpt_central_agent/users/test/sessions/test_session" \
  -H "Content-Type: application/json" \
  -d '{"state": {}}'

# Test message sending  
curl -X POST "https://zengpt-central-agent-79646917313.us-central1.run.app/run" \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "zengpt_central_agent",
    "userId": "test",
    "sessionId": "test_session", 
    "newMessage": {"parts": [{"text": "Hello!"}]}
  }'
```

## Troubleshooting

- **CORS Error**: Ensure proxy is configured correctly
- **Session Not Found**: Create session before sending messages
- **Network Error**: Check proxy server is running
- **Invalid Format**: Use correct ADK API structure

The service is fully deployed and functional - just add the CORS proxy to your frontend! 