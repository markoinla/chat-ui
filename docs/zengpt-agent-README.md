# ZenGPT Central Agent

An advanced AI knowledge worker built with Google's Agent Development Kit (ADK), featuring memory persistence, streaming responses, dynamic model selection, and comprehensive tool capabilities for document management, web research, and task execution.

## 🚀 Features & Capabilities

### Core Functionality

**🧠 Advanced AI Agent**
- Built on Google ADK with LLM Agent architecture
- Support for multiple AI models via LiteLLM integration
- Dynamic model switching during runtime
- Enhanced reasoning capabilities for supported models (Claude Sonnet 4, Opus 4)
- Memory service for cross-session knowledge persistence

**📄 Document Management**
- Create, read, update, and delete documents with ProseMirror JSON format
- Structured diff applications for precise editing
- Semantic document search across collections
- Support for rich text formatting (headings, lists, tables, code blocks)
- Document versioning and content validation

**🔍 Web Research & Search**
- Parallel web search using multiple specialized search agents
- Comprehensive coverage with simultaneous Google searches
- Company knowledge base integration
- Search result aggregation and synthesis
- Memory-enhanced search with previous results context

**⚙️ Task Planning & Execution**
- Multi-step task breakdown and coordination
- System command execution with safety validation
- Tool usage transparency and tracking
- Workflow orchestration for complex operations

**💾 Memory & Context**
- Cross-session memory persistence
- Contextual information retrieval
- Personalized responses based on history
- Session state management

### Technical Features

**🔄 Streaming Support**
- Real-time response streaming via Server-Sent Events (SSE)
- Bidirectional streaming capabilities
- Tool execution feedback during processing

**🔧 Dynamic Model Selection**
- Runtime model switching via API parameters
- Support for OpenAI GPT, Anthropic Claude, Google Gemini, Cohere models
- Temperature and parameter overrides
- Fallback model configuration

**📊 Observability**
- Pretty JSON logging with structured output
- ADK event logging and tracing
- Tool call tracking and history
- Performance monitoring

## 🏗️ Architecture

### Core Components

```
zengpt_central_agent/
├── agent.py                 # Main LLM Agent implementation
├── agent_engine_app.py      # Agent Engine deployment wrapper
├── config.py               # Configuration management
├── instructions.py         # Agent behavior instructions
├── deploy.py              # Deployment automation
├── tools/                 # Tool implementations
│   ├── search_agent.py    # Parallel web search
│   ├── task_planner.py    # Task coordination
│   ├── create_document.py # Document creation
│   ├── get_document.py    # Document retrieval
│   └── ...               # Additional tools
├── memory/                # Memory service
│   └── memory_service.py  # Cross-session persistence
└── callbacks/             # Event handling
    └── tool_call_tracker.py
```

### Agent Architecture

1. **Dynamic Model Agent**: Wrapper that creates agents based on runtime parameters
2. **Core LLM Agent**: Main ZenGPT agent with comprehensive tool set
3. **Parallel Search Agent**: Multiple specialized search sub-agents
4. **Memory Service**: Cross-session knowledge management
5. **Tool Registry**: Comprehensive tool collection for various tasks

## 📦 Dependencies

### Core Requirements
- `google-adk>=1.4.2` - Google Agent Development Kit
- `pydantic>=2.0.0` - Data validation and settings
- `python-dotenv>=1.0.0` - Environment configuration
- `litellm>=1.50.0` - Multi-model LLM integration
- `requests>=2.31.0` - HTTP client
- `aiohttp>=3.8.0` - Async HTTP support

### Development & Testing
- `pytest>=8.3.4` - Testing framework
- `pytest-asyncio>=0.23.8` - Async testing support
- `nest-asyncio>=1.6.0` - Nested async loops

## ⚙️ Configuration

### Environment Setup

1. **Copy environment template:**
```bash
cp env.example .env
```

2. **Configure your preferred model:**

**Option 1: OpenAI GPT (Recommended for development)**
```bash
USE_LITELLM=true
LITELLM_MODEL=gpt-4o
OPENAI_API_KEY=your_openai_api_key_here
MODEL_TEMPERATURE=0.2
```

**Option 2: Anthropic Claude (Great for reasoning)**
```bash
USE_LITELLM=true
LITELLM_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_API_KEY=your_anthropic_api_key_here
MODEL_TEMPERATURE=0.1
```

**Option 3: Google Gemini (Cost-effective default)**
```bash
USE_LITELLM=true
LITELLM_MODEL=gemini/gemini-2.5-flash
GOOGLE_API_KEY=your_google_api_key_here
MODEL_TEMPERATURE=0.1
```

### Key Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `USE_LITELLM` | Enable multi-model support | `true` |
| `LITELLM_MODEL` | Primary model selection | `gemini/gemini-2.5-flash` |
| `MODEL_TEMPERATURE` | Response randomness (0.0-1.0) | `0.1` |
| `MODEL_MAX_TOKENS` | Maximum response length | `8192` |
| `STREAMING_MODE` | Response streaming type | `SSE` |
| `PRETTY_JSON_LOGS` | Enhanced logging format | `true` |
| `ENABLE_REASONING` | Claude reasoning models | `true` |
| `MEMORY_SERVICE_TYPE` | Memory persistence type | `in_memory` |

## 🚀 Deployment

### Method 1: Agent Engine (Recommended)

**Quick Deploy:**
```bash
# Set your project ID
export PROJECT_ID=your-google-cloud-project

# Deploy to development
make deploy-dev PROJECT_ID=$PROJECT_ID

# Deploy to production
make deploy-prod PROJECT_ID=$PROJECT_ID
```

**Manual Deploy:**
```bash
python deploy.py \
  --project your-project-id \
  --location us-central1 \
  --name zengpt-central-agent \
  --update
```

### Method 2: Local Development

**Install dependencies:**
```bash
make install
# or
pip install -r requirements.txt
```

**Run locally:**
```bash
# Set required environment variables
export GOOGLE_CLOUD_PROJECT=your-project-id

# Test locally with ADK CLI
make test-local
# or
cd .. && python -m adk web --agent zengpt_central_agent.agent:root_agent
```

### Method 3: Cloud Run

Use the provided `cloud_run_deployment.py` script for containerized deployment.

## 🔌 Connection & Usage

### Production Endpoints

#### **Agent Engine (Primary Production)**
```
Base URL: https://us-central1-aiplatform.googleapis.com/v1/projects/zenlayer-zengpt/locations/us-central1/agents/zengpt-central-agent
```

**Invoke Endpoint:**
```
POST https://us-central1-aiplatform.googleapis.com/v1/projects/zenlayer-zengpt/locations/us-central1/agents/zengpt-central-agent:invoke
```

**Streaming Endpoint:**
```
POST https://us-central1-aiplatform.googleapis.com/v1/projects/zenlayer-zengpt/locations/us-central1/agents/zengpt-central-agent:streamingInvoke
```

#### **Cloud Run (Alternative Production)**
```
Base URL: https://zengpt-central-agent-us-central1.run.app
```

**Invoke Endpoint:**
```
POST https://zengpt-central-agent-us-central1.run.app/invoke
```

**Streaming Endpoint:**
```
POST https://zengpt-central-agent-us-central1.run.app/stream
```

**Web UI (Development/Testing):**
```
GET https://zengpt-central-agent-us-central1.run.app/
```

### Authentication

#### **Google Cloud Authentication (Agent Engine)**
```bash
# Get access token
gcloud auth application-default print-access-token

# Or use service account key
export GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

#### **API Key Authentication (Cloud Run)**
```bash
# Set in request headers
X-API-Key: your-api-key-here
```

### API Usage

#### **Agent Engine Production Requests**

**Basic Request:**
```python
import requests
import subprocess

# Get access token
access_token = subprocess.check_output([
    "gcloud", "auth", "application-default", "print-access-token"
]).decode().strip()

response = requests.post(
    "https://us-central1-aiplatform.googleapis.com/v1/projects/zenlayer-zengpt/locations/us-central1/agents/zengpt-central-agent:invoke",
    json={
        "user_content": "Create a document about AI trends",
        "session_id": "user-session-123"
    },
    headers={
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
)
```

#### **Cloud Run Production Requests**

**Basic Request:**
```python
import requests

response = requests.post(
    "https://zengpt-central-agent-us-central1.run.app/invoke",
    json={
        "user_content": "Create a document about AI trends",
        "session_id": "user-session-123"
    },
    headers={
        "X-API-Key": "your-api-key-here",
        "Content-Type": "application/json"
    }
)
```

#### **Dynamic Model Selection**

**Agent Engine - Via Request State:**
```python
import requests
import subprocess

access_token = subprocess.check_output([
    "gcloud", "auth", "application-default", "print-access-token"
]).decode().strip()

response = requests.post(
    "https://us-central1-aiplatform.googleapis.com/v1/projects/zenlayer-zengpt/locations/us-central1/agents/zengpt-central-agent:invoke",
    json={
        "user_content": "Research quantum computing",
        "session_id": "user-session-123",
        "state": {
            "model": "gpt-4o",
            "temperature": 0.3
        }
    },
    headers={
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
)
```

**Cloud Run - Via User Content:**
```python
import requests
import json

response = requests.post(
    "https://zengpt-central-agent-us-central1.run.app/invoke",
    json={
        "user_content": json.dumps({
            "query": "Analyze market trends",
            "model": "claude-3-5-sonnet-20241022",
            "temperature": 0.2
        }),
        "session_id": "user-session-123"
    },
    headers={
        "X-API-Key": "your-api-key-here",
        "Content-Type": "application/json"
    }
)
```

### Streaming Responses

#### **Agent Engine Streaming:**
```python
import requests
import subprocess

access_token = subprocess.check_output([
    "gcloud", "auth", "application-default", "print-access-token"
]).decode().strip()

response = requests.post(
    "https://us-central1-aiplatform.googleapis.com/v1/projects/zenlayer-zengpt/locations/us-central1/agents/zengpt-central-agent:streamingInvoke",
    json={
        "user_content": "Research AI developments",
        "session_id": "user-session-123"
    },
    headers={
        "Authorization": f"Bearer {access_token}",
        "Accept": "text/event-stream",
        "Content-Type": "application/json"
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
```

#### **Cloud Run Streaming:**
```python
import requests

response = requests.post(
    "https://zengpt-central-agent-us-central1.run.app/stream",
    json={
        "user_content": "Research AI developments",
        "session_id": "user-session-123"
    },
    headers={
        "X-API-Key": "your-api-key-here",
        "Accept": "text/event-stream",
        "Content-Type": "application/json"
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
```

### Request/Response Formats

#### **Standard Request Format**
```json
{
    "user_content": "Your message or task description",
    "session_id": "unique-session-identifier",
    "state": {
        "model": "gpt-4o",
        "temperature": 0.3,
        "max_tokens": 8192
    },
    "metadata": {
        "user_id": "user-123",
        "context": "additional context"
    }
}
```

#### **Response Format**
```json
{
    "response": "Agent's response text",
    "session_id": "unique-session-identifier",
    "tool_calls": [
        {
            "tool": "search_agent",
            "input": "search query",
            "output": "search results"
        }
    ],
    "metadata": {
        "model_used": "gpt-4o",
        "tokens_used": 1234,
        "processing_time": 2.5
    }
}
```

#### **Error Response Format**
```json
{
    "error": {
        "code": "INVALID_REQUEST",
        "message": "Invalid model specified",
        "details": "Model 'invalid-model' is not supported"
    },
    "session_id": "unique-session-identifier"
}
```

### Client Libraries & SDKs

#### **Python Client Example**
```python
import requests
import subprocess
from typing import Dict, Any, Optional

class ZenGPTClient:
    def __init__(self, use_cloud_run: bool = False, api_key: Optional[str] = None):
        if use_cloud_run:
            self.base_url = "https://zengpt-central-agent-us-central1.run.app"
            self.headers = {
                "X-API-Key": api_key or "your-api-key-here",
                "Content-Type": "application/json"
            }
        else:
            self.base_url = "https://us-central1-aiplatform.googleapis.com/v1/projects/zenlayer-zengpt/locations/us-central1/agents/zengpt-central-agent"
            access_token = subprocess.check_output([
                "gcloud", "auth", "application-default", "print-access-token"
            ]).decode().strip()
            self.headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
    
    def invoke(self, message: str, session_id: str, model: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Send a message to the agent and get a response."""
        payload = {
            "user_content": message,
            "session_id": session_id
        }
        
        if model:
            payload["state"] = {"model": model, **kwargs}
        
        endpoint = f"{self.base_url}:invoke" if "aiplatform" in self.base_url else f"{self.base_url}/invoke"
        response = requests.post(endpoint, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def stream(self, message: str, session_id: str, model: Optional[str] = None):
        """Stream responses from the agent."""
        payload = {
            "user_content": message,
            "session_id": session_id
        }
        
        if model:
            payload["state"] = {"model": model}
        
        headers = {**self.headers, "Accept": "text/event-stream"}
        endpoint = f"{self.base_url}:streamingInvoke" if "aiplatform" in self.base_url else f"{self.base_url}/stream"
        
        response = requests.post(endpoint, json=payload, headers=headers, stream=True)
        response.raise_for_status()
        
        for line in response.iter_lines():
            if line:
                yield line.decode('utf-8')

# Usage examples
client = ZenGPTClient()  # Agent Engine
# client = ZenGPTClient(use_cloud_run=True, api_key="your-key")  # Cloud Run

# Standard request
response = client.invoke("Create a document about AI trends", "session-123")
print(response)

# With specific model
response = client.invoke("Research quantum computing", "session-123", model="gpt-4o", temperature=0.3)

# Streaming
for chunk in client.stream("Analyze market trends", "session-123"):
    print(chunk)
```

#### **JavaScript/Node.js Client Example**
```javascript
const axios = require('axios');
const { execSync } = require('child_process');

class ZenGPTClient {
    constructor(useCloudRun = false, apiKey = null) {
        if (useCloudRun) {
            this.baseUrl = 'https://zengpt-central-agent-us-central1.run.app';
            this.headers = {
                'X-API-Key': apiKey || 'your-api-key-here',
                'Content-Type': 'application/json'
            };
        } else {
            this.baseUrl = 'https://us-central1-aiplatform.googleapis.com/v1/projects/zenlayer-zengpt/locations/us-central1/agents/zengpt-central-agent';
            const accessToken = execSync('gcloud auth application-default print-access-token', { encoding: 'utf8' }).trim();
            this.headers = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };
        }
    }

    async invoke(message, sessionId, model = null, options = {}) {
        const payload = {
            user_content: message,
            session_id: sessionId
        };

        if (model) {
            payload.state = { model, ...options };
        }

        const endpoint = this.baseUrl.includes('aiplatform') 
            ? `${this.baseUrl}:invoke` 
            : `${this.baseUrl}/invoke`;

        const response = await axios.post(endpoint, payload, { headers: this.headers });
        return response.data;
    }
}

// Usage
const client = new ZenGPTClient();
client.invoke('Create a document about AI trends', 'session-123')
    .then(response => console.log(response))
    .catch(error => console.error(error));
```

### Rate Limits & Quotas

#### **Agent Engine Limits**
- **Requests per minute**: 60 (per project)
- **Concurrent requests**: 10
- **Max request size**: 32MB
- **Max response size**: 32MB
- **Session timeout**: 1 hour

#### **Cloud Run Limits**
- **Requests per minute**: 1000 (configurable)
- **Concurrent requests**: 100 (configurable)
- **Max request size**: 32MB
- **Request timeout**: 60 seconds
- **Memory limit**: 8GB (configurable)

### Health Check & Status

#### **Health Check Endpoints**
```bash
# Agent Engine health (via Cloud Console or API)
GET https://us-central1-aiplatform.googleapis.com/v1/projects/zenlayer-zengpt/locations/us-central1/agents/zengpt-central-agent

# Cloud Run health
GET https://zengpt-central-agent-us-central1.run.app/health
```

#### **Status Response**
```json
{
    "status": "healthy",
    "version": "1.0.0",
    "model": "gemini/gemini-2.5-flash",
    "features": {
        "streaming": true,
        "dynamic_models": true,
        "memory_service": true
    },
    "uptime": "2h 30m 15s"
}
```

### Available Tools

The agent provides access to these tool categories:

1. **Document Management**
   - `create_document` - Create new documents
   - `get_document` - Retrieve documents
   - `update_document_section` - Edit document sections
   - `apply_document_diff` - Apply structured changes
   - `list_documents` - Browse document collections

2. **Search & Research**
   - `search_agent` - Parallel web search
   - `search_company_knowledge` - Internal knowledge base
   - `get_tool_calls` - Tool usage transparency

3. **Task Management**
   - `task_planner` - Multi-step task coordination
   - System command execution (with validation)

## 🧪 Testing

### Local Testing
```bash
# Run local tests
make test-local

# Run integration tests
python -m pytest tests/integration/

# Test specific functionality
python -c "
from zengpt_central_agent.agent import zengpt_agent
result = zengpt_agent.run('Hello, create a test document')
print(result)
"
```

### Remote Testing

After deployment, test using the provided notebooks:
- `notebooks/adk_app_testing.ipynb` - Interactive testing
- `notebooks/evaluating_adk_agent.ipynb` - Performance evaluation

## 📊 Monitoring & Observability

### Logging

The agent provides comprehensive logging with:
- Pretty JSON formatting for structured logs
- ADK event tracking
- Tool execution monitoring
- Performance metrics

**Enable detailed logging:**
```bash
export PRETTY_JSON_LOGS=true
export LOG_ADK_EVENTS=true
export LOGGING_LEVEL=DEBUG
```

### Tool Call Tracking

Monitor tool usage with the built-in tracker:
```python
# Get tool usage history
result = agent.run("Show me my recent tool calls")
```

## 🔧 Development

### Adding Custom Tools

1. Create tool in `tools/` directory:
```python
# tools/my_custom_tool.py
from google.adk.tools import FunctionTool

def my_function(param: str) -> str:
    """Custom tool implementation."""
    return f"Processed: {param}"

my_custom_tool = FunctionTool(my_function)
```

2. Register in `tools/__init__.py`:
```python
from .my_custom_tool import my_custom_tool
```

3. Add to agent in `agent.py`:
```python
all_tools = [
    # ... existing tools
    my_custom_tool
]
```

### Extending Memory Service

Implement custom memory backends by extending `ZenGPTMemoryService`:

```python
class CustomMemoryService(ZenGPTMemoryService):
    async def add_session_info(self, session_id: str, info: Dict[str, Any]) -> None:
        # Custom implementation
        pass
```

## 🐛 Troubleshooting

### Common Issues

**1. Model Authentication Errors**
```bash
# Ensure API keys are set
export OPENAI_API_KEY=your_key
export ANTHROPIC_API_KEY=your_key
export GOOGLE_API_KEY=your_key
```

**2. Deployment Failures**
```bash
# Check Google Cloud authentication
gcloud auth application-default login
gcloud config set project your-project-id
```

**3. Memory Issues**
```bash
# Clear agent cache
make clean
```

### Debug Mode

Enable comprehensive debugging:
```bash
export DEBUG=true
export ENABLE_TRACING=true
export LOGGING_LEVEL=DEBUG
```

## 📝 License & Contributing

This project is part of the ZenGPT ecosystem. See the main repository for licensing and contribution guidelines.

## 🔗 Related Projects

- **ADK Examples**: `/examples/agent-development-kit-crash-course-main/`
- **Agent Starter Pack**: `/examples/agent-starter-pack-main/`
- **Minimal Deploy**: `/zengpt_minimal_deploy/`

---

For more information and advanced usage patterns, see the documentation in `/docs/` and explore the example implementations in `/examples/`.
