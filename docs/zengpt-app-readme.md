# ZenGPT - AI-Enabled Sales & Marketing Document Assistant

**AI-powered document collaboration platform for Zenlayer's sales and marketing teams**

ZenGPT enables teams to chat with company knowledge while writing documents, featuring built-in guardrails and company-provided context. The platform combines intelligent document management with AI-powered assistance to streamline content creation and knowledge access.

## 🎯 Core Value Proposition

*"Chat with our company knowledge base while writing sales/marketing documents"*

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Next.js 14 + TipTap Editor + shadcn/ui + Tailwind CSS
- **Backend**: Python 3.11 + FastAPI + Google Cloud Run
- **Database**: Firestore + Google Cloud Storage
- **AI/ML**: Vertex AI + RAG Engine + Custom ADK (Agent Development Kit)
- **Development**: Docker Compose + Local Emulators

### Project Structure
```
ZenGPT/
├── frontend/           # Next.js React application
├── backend/            # Python FastAPI service
├── shared/             # Shared types & schemas
├── scripts/            # Development & deployment scripts
├── docs/               # Documentation & planning
└── credentials/        # GCP service account keys
```

---

## 🚀 Frontend Features

### 📝 Document Editor System
**Advanced rich-text editing with dual-format support**

- **TipTap Rich Text Editor**
  - Modern WYSIWYG editor with full formatting support
  - Tables, lists, headings, links, images, and task lists
  - Bubble menu for contextual formatting
  - Real-time auto-save functionality
  - Dark/light theme support

- **Dual Format Support**
  - **JSON Format**: Structured TipTap JSON for AI precision
  - **Markdown Format**: Traditional markdown for compatibility
  - Seamless conversion between formats
  - Editor-specific optimizations

- **Document Types**
  - **Created Documents**: Native documents created in TipTap editor
  - **Uploaded Documents**: DOCX/PDF files with markdown conversion
  - **Agent Documents**: AI-generated documents with enhanced metadata

### 💬 AI Chat Interface
**Intelligent conversation system with document context**

- **Session Management**
  - Persistent chat sessions with history
  - Session restoration and management
  - Multi-session support with switching
  - Auto-save and recovery

- **Document References**
  - `@filename` autocomplete for document references
  - File context injection into conversations
  - Visual file reference badges
  - Smart context building from open documents

- **AI Integration**
  - ADK (Agent Development Kit) integration
  - Streaming responses with real-time updates
  - Tool call display and execution
  - Structured response parsing

- **Enhanced Features**
  - Message history with timestamps
  - Copy message content functionality
  - Loading states and error handling
  - Prompt suggestions and templates

### 📁 File Management System
**Comprehensive document organization and upload**

- **File Upload**
  - Drag-and-drop file upload interface
  - Click-to-upload via system file browser
  - Progress tracking with visual feedback
  - File type validation and size limits
  - Duplicate prevention and error handling

- **File Browser**
  - Unified view of uploaded and created documents
  - Hierarchical folder organization
  - Document type indicators and metadata display
  - Search and filtering capabilities
  - Background synchronization

- **Folder Management**
  - Create, rename, and delete folders
  - Nested folder structure support
  - Breadcrumb navigation
  - Drag-and-drop organization
  - Folder-specific document uploads

- **Document Operations**
  - Document editing and updating
  - Metadata management
  - Document deletion with confirmation
  - Recent documents tracking
  - Document sharing and collaboration

### 🎨 User Interface Components
**Modern, accessible UI built with shadcn/ui**

- **Core Components**
  - Responsive sidebar navigation
  - Theme toggle (light/dark mode)
  - Toast notifications for user feedback
  - Modal dialogs and confirmation prompts
  - Loading skeletons and progress indicators

- **Enhanced Chat Components**
  - Message bubbles with role indicators
  - Code syntax highlighting
  - Markdown rendering in messages
  - Auto-scroll to latest messages
  - Message timestamps and status

- **Accessibility Features**
  - Keyboard navigation support
  - ARIA labels and descriptions
  - Focus management
  - Screen reader compatibility
  - High contrast mode support

### ⚙️ Configuration & Customization
**Flexible configuration system**

- **Prompt Management**
  - Configurable AI prompts and personas
  - B2B executive communication templates
  - Custom prompt creation and editing
  - Prompt suggestions based on context

- **Feature Flags**
  - Enable/disable chat functionality
  - File upload toggles
  - Document editor features
  - Agent integration controls

- **Environment Configuration**
  - Development/production API endpoints
  - Theme preferences
  - File upload limits and types
  - Debug logging controls

---

## 🔧 Backend Features

### 🗄️ Document Processing Engine
**Advanced document conversion and content extraction**

- **File Processing Pipeline**
  - Multi-format document conversion (DOCX, PDF, TXT, etc.)
  - Content extraction using MarkItDown library
  - Markdown conversion with metadata preservation
  - ProseMirror JSON generation for editor compatibility

- **Dual Storage Architecture**
  - Original file storage in Google Cloud Storage
  - Markdown versions for AI processing
  - JSON content for editor operations
  - Metadata caching for performance

- **Content Analysis**
  - Word count and character analysis
  - Reading time estimation
  - Content structure detection (headings, tables, images)
  - Preview generation for quick access

### 🤖 AI Agent Integration
**Custom ADK implementation for intelligent assistance**

- **Agent Document Service**
  - Create AI-generated markdown documents
  - Agent-specific metadata tracking
  - Template-based document generation
  - Version control and collaboration features

- **ADK Session Management**
  - Session creation and persistence
  - Event streaming and processing
  - Tool call execution and results
  - Context management across conversations

- **RAG (Retrieval-Augmented Generation)**
  - Document indexing for semantic search
  - Context retrieval from document corpus
  - Relevance scoring and ranking
  - Source citation and attribution

### 🗃️ Database Services
**Firestore-based metadata management**

- **Document Management**
  - Unified document model for all types
  - Hierarchical folder organization
  - Field-optimized queries for performance
  - Batch operations and transactions

- **Session Storage**
  - Chat session persistence
  - Message history with references
  - User session management
  - Cross-session context sharing

- **Metadata Optimization**
  - Field selection for reduced bandwidth
  - Caching strategies for frequently accessed data
  - Background synchronization
  - Automatic cleanup and maintenance

### 🔐 Security & Authentication
**Enterprise-grade security implementation**

- **Google Cloud Integration**
  - Service account authentication
  - IAM role-based access control
  - Secure credential management
  - Environment-specific configurations

- **Data Protection**
  - Input validation and sanitization
  - File type and size restrictions
  - Error handling without information leakage
  - Secure file storage and access

### 📊 API Architecture
**RESTful API with comprehensive endpoints**

#### Document Management Endpoints
```
POST /api/v1/documents/upload          # Upload document files
GET  /api/v1/documents                 # List documents with filtering
GET  /api/v1/documents/{id}            # Get document details
PUT  /api/v1/documents/{id}            # Update document
DELETE /api/v1/documents/{id}          # Delete document
```

#### Agent Document Endpoints
```
POST /api/v1/agent/documents           # Create agent documents
GET  /api/v1/agent/documents/{id}      # Get agent document
PUT  /api/v1/agent/documents/{id}      # Update agent document
DELETE /api/v1/agent/documents/{id}    # Delete agent document
GET  /api/v1/agent/documents           # List agent documents
```

#### Folder Management Endpoints
```
GET  /api/v1/folders                   # List folders
POST /api/v1/folders                   # Create folder
PUT  /api/v1/folders/{id}              # Update folder
DELETE /api/v1/folders/{id}            # Delete folder
```

#### Chat & AI Endpoints
```
POST /api/v1/chat/sessions             # Create chat session
GET  /api/v1/chat/sessions/{id}        # Get session history
POST /api/v1/chat/sessions/{id}/message # Send message
```

---

## 🛠️ Development Features

### 📦 Development Environment
**Streamlined development workflow**

- **Script Automation**
  - `npm run dev` - Start all services
  - `./scripts/dev-frontend.sh` - Frontend only
  - `./scripts/dev-backend.sh` - Backend only
  - `./scripts/setup-gcp.sh` - GCP resource setup

- **Docker Integration**
  - Docker Compose for backend services
  - Local development with hot reload
  - Environment variable management
  - Service orchestration

- **Testing Infrastructure**
  - Frontend: Jest + React Testing Library
  - Backend: pytest + async testing
  - Integration tests for API endpoints
  - End-to-end testing capabilities

### 🔍 Debugging & Monitoring
**Comprehensive debugging tools**

- **Logging System**
  - Structured logging with levels
  - Request/response tracking
  - Performance monitoring
  - Error tracking and reporting

- **Development Tools**
  - React Query DevTools for API debugging
  - TipTap editor debugging utilities
  - Session management debugging
  - Real-time API monitoring

### 📚 Documentation System
**Extensive documentation and planning**

- **API Documentation**
  - Endpoint reference guides
  - Integration tutorials
  - Authentication guides
  - Deployment procedures

- **Development Guides**
  - Setup and installation
  - Architecture explanations
  - Feature implementation guides
  - Best practices and patterns

---

## 🚀 Deployment & Operations

### ☁️ Cloud Infrastructure
**Google Cloud Platform integration**

- **Services Used**
  - **Cloud Run**: Scalable backend deployment
  - **Firestore**: NoSQL document database
  - **Cloud Storage**: File storage and CDN
  - **Vertex AI**: AI/ML processing and RAG
  - **IAM**: Security and access management

- **Deployment Strategy**
  - Frontend: Vercel or Firebase Hosting
  - Backend: Google Cloud Run with auto-scaling
  - Database: Firestore with global distribution
  - Storage: Multi-region Cloud Storage buckets

### 📊 Performance Optimization
**Optimized for enterprise scale**

- **Frontend Optimizations**
  - Code splitting and lazy loading
  - Image optimization and caching
  - Bundle size optimization
  - Progressive Web App features

- **Backend Optimizations**
  - Field-selective database queries
  - Response caching strategies
  - Batch processing for bulk operations
  - Connection pooling and resource management

---

## 🎯 Success Metrics

### 📈 Key Performance Indicators
- **Daily Active Users** from Zenlayer teams
- **Chat Messages per Session** (engagement depth)
- **@-file References per Chat** (document utility)
- **Documents Uploaded per User** (adoption)
- **User Feedback Scores** (satisfaction)

### 🔧 Technical Metrics
- Upload success rate and processing time
- Chat response latency and accuracy
- Document conversion reliability
- Search result relevance scores
- System uptime and availability

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Python 3.11+ with pip
- Google Cloud Platform account
- Docker and Docker Compose (optional)

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/zenlayer/zengpt.git
cd zengpt

# Install dependencies
npm run setup

# Set up GCP resources
npm run setup:gcp

# Start development environment
npm run dev
```

### Environment Variables
Create `.env.local` files in frontend and backend directories with:
```env
# Frontend (.env.local)
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_AGENT_API_BASE=http://localhost:8080

# Backend (.env)
PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account.json
GCS_BUCKET_NAME=your-storage-bucket
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Please read our [Contributing Guide](docs/CONTRIBUTING.md) for development guidelines and submission processes.

## 📞 Support

For technical support or questions:
- Create an issue in this repository
- Contact the Zenlayer development team
- Check the [documentation](docs/) for detailed guides

---

*Built with ❤️ for Zenlayer by the ZenGPT development team*
