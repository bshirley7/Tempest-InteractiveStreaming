# TEMPTEST - MCP (Model Context Protocol) Integrations

## Overview

Model Context Protocol (MCP) servers can enhance Bolt.new's capabilities when building Temptest. These integrations provide direct access to external services and tools that Claude Sonnet 4 can use during development.

## Recommended MCP Servers for Temptest

### 1. Supabase MCP Server
**Purpose**: Direct database operations and schema management
**Benefits**:
- Create tables and indexes directly
- Run migrations and seed data
- Test queries during development
- Monitor real-time subscriptions

**Setup in Bolt.new**:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "your_project_url",
        "SUPABASE_SERVICE_KEY": "your_service_key"
      }
    }
  }
}
```

### 2. GitHub MCP Server
**Purpose**: Repository management and version control
**Benefits**:
- Create branches for features
- Commit code changes
- Open pull requests
- Manage issues and project boards

**Setup in Bolt.new**:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your_github_token"
      }
    }
  }
}
```

### 3. Filesystem MCP Server
**Purpose**: Enhanced file operations
**Benefits**:
- Batch file operations
- Directory tree management
- File search and replace
- Permission management

**Setup in Bolt.new**:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem"],
      "env": {
        "PROJECT_ROOT": "/path/to/temptest"
      }
    }
  }
}
```

### 4. Cloudflare MCP Server (Custom)
**Purpose**: Direct Cloudflare API access
**Benefits**:
- Upload videos to Stream
- Configure R2 buckets
- Set up Workers
- Manage DNS and CDN

**Note**: This would need to be a custom MCP server. Here's the structure:

```typescript
// mcp-cloudflare/index.ts
import { Server } from '@modelcontextprotocol/sdk';

const server = new Server({
  name: 'cloudflare',
  version: '1.0.0',
});

server.setRequestHandler('cloudflare.stream.upload', async (params) => {
  // Handle video upload to Cloudflare Stream
});

server.setRequestHandler('cloudflare.r2.createBucket', async (params) => {
  // Create R2 bucket
});

server.setRequestHandler('cloudflare.r2.upload', async (params) => {
  // Upload to R2
});
```

### 5. PostgreSQL MCP Server
**Purpose**: Direct database access for Supabase's PostgreSQL
**Benefits**:
- Execute complex queries
- Manage indexes and performance
- Run database maintenance
- Access query explain plans

**Setup in Bolt.new**:
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"],
      "env": {
        "CONNECTION_STRING": "postgresql://user:pass@host:5432/db"
      }
    }
  }
}
```

### 6. Brave Search MCP Server
**Purpose**: Web search during development
**Benefits**:
- Find documentation
- Search for error solutions
- Research best practices
- Find code examples

**Setup in Bolt.new**:
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your_api_key"
      }
    }
  }
}
```

## How to Use MCP in Bolt.new

### Step 1: Enable MCP Servers
When starting a new Bolt.new project, configure MCP servers in the settings or initialization prompt.

### Step 2: Instruct Claude to Use MCP
Include MCP usage in your prompts:
```
"Use the Supabase MCP to create the database tables as defined in the schema documentation."

"Use the GitHub MCP to create a new branch called 'feature/video-player' before implementing the video components."

"Use the Cloudflare MCP to upload test videos to Stream and get their IDs for the demo content."
```

### Step 3: MCP-Driven Development Flow

1. **Database Setup Phase**:
   ```
   "Using the Supabase MCP:
   1. Create all tables from DATABASE_SCHEMA.md
   2. Set up RLS policies
   3. Enable real-time replication
   4. Create initial test data"
   ```

2. **File Operations Phase**:
   ```
   "Using the Filesystem MCP:
   1. Create the complete folder structure from FILE_STRUCTURE.md
   2. Set up all configuration files
   3. Create component boilerplates"
   ```

3. **External Service Setup**:
   ```
   "Using custom MCPs:
   1. Configure Cloudflare Stream
   2. Create R2 buckets
   3. Set up Clerk webhooks
   4. Initialize Sentry project"
   ```

## MCP Best Practices for Temptest

### 1. Batch Operations
Use MCP for batch operations to save time:
```
"Use Supabase MCP to create all 8 tables in one operation"
```

### 2. Verification Steps
Always verify MCP operations:
```
"After creating tables with Supabase MCP, query each table to verify structure"
```

### 3. Error Handling
Include error handling in MCP requests:
```
"If Supabase MCP fails to create a table, log the error and try alternative approach"
```

### 4. Progressive Enhancement
Start with basic MCP usage, then enhance:
```
Phase 1: Use MCP for basic file/database operations
Phase 2: Use MCP for service configurations
Phase 3: Use MCP for deployment and monitoring
```

## Custom MCP Servers for Temptest

Consider creating these custom MCP servers:

### 1. Temptest Setup MCP
```typescript
// Handles complete project setup
- Initialize all services
- Create environment variables
- Set up database schema
- Configure external services
```

### 2. Video Processing MCP
```typescript
// Handles video operations
- Upload to Cloudflare Stream
- Generate thumbnails
- Extract metadata
- Create streaming URLs
```

### 3. Analytics MCP
```typescript
// Handles analytics operations
- Query analytics data
- Generate reports
- Export metrics
- Create dashboards
```

## MCP Usage Examples

### Example 1: Complete Database Setup
```
Prompt: "Use the Supabase MCP to:
1. Create all tables from the schema
2. Set up foreign key relationships
3. Create indexes on frequently queried columns
4. Enable RLS with proper policies
5. Create database functions for analytics aggregation
6. Set up real-time triggers for chat_messages and interactions"
```

### Example 2: Video Upload Workflow
```
Prompt: "Use the Cloudflare MCP to:
1. Create a new video upload in Stream
2. Get the upload URL
3. Upload the video file
4. Wait for processing completion
5. Get the playback URLs
6. Store metadata in Supabase using the Supabase MCP"
```

### Example 3: Development Environment Setup
```
Prompt: "Use multiple MCPs to:
1. Filesystem MCP: Create project structure
2. Supabase MCP: Initialize database
3. GitHub MCP: Create repository and initial commit
4. Custom MCP: Configure all external services"
```

## Monitoring MCP Operations

### Logging
Ensure all MCP operations are logged:
```typescript
// In your prompts
"Log all MCP operations to a file called mcp-operations.log"
```

### Status Tracking
Track MCP operation status:
```typescript
// Track what's been completed
{
  "database_setup": "complete",
  "file_structure": "complete",
  "service_config": "in_progress",
  "deployment": "pending"
}
```

### Error Recovery
Plan for MCP failures:
```
"If any MCP operation fails:
1. Log the error with full details
2. Attempt retry with exponential backoff
3. If still failing, provide manual alternative
4. Continue with other non-dependent operations"
```

## Conclusion

MCP servers significantly enhance Bolt.new's capabilities for building Temptest. By leveraging these integrations, Claude Sonnet 4 can:

1. Directly interact with databases and services
2. Perform complex file operations efficiently
3. Manage external service configurations
4. Automate repetitive setup tasks
5. Verify implementations in real-time

Always instruct Bolt.new to use available MCP servers when appropriate, as they provide more reliable and efficient operations than simulating these actions.