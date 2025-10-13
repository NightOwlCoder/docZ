# Amazon Internal MCP Server Analysis

## Overview
Based on my analysis of the AmazonInternalMCPServer codebase, here's the complete implementation guidance for adding weblab functionality to the existing amzn-mcp package.

## Directory Structure

The amzn-mcp follows this structure:
```
src/
├── registration.ts          # Central tool registration
├── tools/
│   ├── tool.ts             # Tool type definitions
│   └── [tool-name]/
│       ├── index.ts        # Tool exports
│       ├── tool.ts         # Tool implementation
│       ├── client.ts       # API client (if needed)
│       └── types.ts        # Type definitions
```

## Tool Registration Pattern

Tools are registered in `src/registration.ts`:

```typescript
// 1. Import the tools
import { tools as weblabTools } from "./tools/weblab/index.js";

// 2. Add to the tools array
export const tools: Tool[] = [
  // ... existing tools
  ...weblabTools,
];
```

## Tool Implementation Pattern

Each tool follows this structure:

### 1. Tool Type Definition (`src/tools/tool.ts`)
```typescript
export type ToolTag = 'read' | 'write' | 'search' | 'experimental' | 'sales' | 'sfdc';
export type ToolPublishStatus = 'draft' | 'experimental' | 'live' | 'deprecated';

export type Tool = {
  name: string;
  description: string;
  paramSchema: any;
  tags?: ToolTag[];
  publishStatus?: ToolPublishStatus;
  deprecationDate?: Date;
  cb: any;
};
```

### 2. Tool Implementation Pattern
```typescript
import { z } from "zod";
import { Tool, ToolTag } from "../tool";

export const WeblabSearchTool: Tool = {
  name: "weblab_search",
  tags: ["search"] as ToolTag[],
  publishStatus: "experimental",
  description: "Search for weblab experiments...",
  
  paramSchema: {
    query: z.string().describe("Search query"),
    // ... other params
  },

  cb: async (input: WeblabSearchInput) => {
    try {
      // Implementation
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error"
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }
};
```

## Authentication Pattern

Based on the Quip tool pattern, weblab authentication should follow:

```typescript
// Environment variable first, then config file
private async getWeblabApiKey(): Promise<string | null> {
  // First try environment variable
  if (process.env.WEBLAB_API_KEY) {
    return process.env.WEBLAB_API_KEY;
  }

  // Then try config file
  try {
    const data = await fs.readFile(this.configPath, "utf-8");
    const match = data.match(/WEBLAB_API_KEY=(.+)/);
    if (!match) {
      console.error("WEBLAB_API_KEY not found in config file");
      return null;
    }
    return match[1].trim();
  } catch (error) {
    console.error("Error reading API key:", error);
    return null;
  }
}
```

## HTTP Client Pattern

The codebase uses MidwayHttpClient for authenticated requests:

```typescript
import { MidwayHttpClient, HttpMethod } from "../../core/http/midway-http-client.js";

export class WeblabClient {
  private httpClient: MidwayHttpClient;

  constructor() {
    this.httpClient = MidwayHttpClient.getInstance();
  }

  async makeRequest(url: string, options: any) {
    const response = await this.httpClient.request(
      new URL(url),
      HttpMethod.GET,
      {
        headers: {
          'x-api-key': await this.getWeblabApiKey(),
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.statusCode === 429) {
      throw new NonRetryableError('Rate limit exceeded. Try again later or use individual API key.');
    }
    
    return response;
  }
}
```

## Error Handling Pattern

Consistent error handling across all tools:

```typescript
try {
  // API call
  const result = await client.makeRequest();
  
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
} catch (error) {
  console.error("WeblabTool error:", error);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error"
        }, null, 2)
      }
    ],
    isError: true
  };
}
```

## Weblab-Specific Implementation Plan

### 1. Directory Structure
```
src/tools/weblab/
├── index.ts           # Export all weblab tools
├── client.ts          # WeblabClient implementation
├── types.ts           # Weblab-specific types
├── weblab-search.ts   # Search tool
├── weblab-details.ts  # Details tool
├── weblab-allocations.ts        # Allocations tool
├── weblab-activation-history.ts # History tool
└── weblab-treatment-assignment.ts # Assignment tool
```

### 2. Client Implementation
```typescript
// src/tools/weblab/client.ts
import { MidwayHttpClient, HttpMethod } from "../../core/http/midway-http-client.js";
import { getConfigPath } from "../../constants/paths.js";

export class WeblabClient {
  private httpClient: MidwayHttpClient;
  private configPath: string;
  private static readonly SHARED_COMMUNITY_KEY = "TK_SHARED_KEY";

  constructor() {
    this.httpClient = MidwayHttpClient.getInstance();
    this.configPath = process.env.AMAZON_MCP_SERVER_CONFIG_PATH || getConfigPath();
  }

  private async getWeblabApiKey(): Promise<string> {
    // Individual key first
    if (process.env.WEBLAB_API_KEY) {
      return process.env.WEBLAB_API_KEY;
    }

    // Config file
    try {
      const data = await fs.readFile(this.configPath, "utf-8");
      const match = data.match(/WEBLAB_API_KEY=(.+)/);
      if (match) {
        return match[1].trim();
      }
    } catch (error) {
      console.debug("No individual API key found, using shared community key");
    }

    // Fallback to shared community key
    return WeblabClient.SHARED_COMMUNITY_KEY;
  }

  async searchExperiments(params: WeblabSearchParams): Promise<any> {
    // Implementation using Keith's guidance
  }

  async getExperimentDetails(experimentId: string): Promise<any> {
    // Implementation
  }

  async getExperimentAllocations(experimentId: string): Promise<any> {
    // Implementation
  }

  async getActivationHistory(experimentId: string): Promise<any> {
    // Implementation
  }

  async getTreatmentAssignment(params: TreatmentAssignmentParams): Promise<any> {
    // Implementation using Keith's WeblabAPIExternalModel solution
  }
}
```

### 3. Tool Implementations

Each tool follows the established pattern with proper Zod schemas, error handling, and response formatting.

### 4. Registration

Add to `src/registration.ts`:
```typescript
import { tools as weblabTools } from "./tools/weblab/index.js";

export const tools: Tool[] = [
  // ... existing tools
  ...weblabTools,
];
```

## Key Implementation Notes

1. **Rate Limiting**: Handle 429 responses with proper error messages
2. **Authentication**: Support both individual and shared community API keys
3. **Error Handling**: Consistent error response format
4. **Response Format**: Always return JSON-formatted responses
5. **Tags**: Use appropriate tags ('search', 'read') for tool categorization
6. **Publish Status**: Start with 'experimental' status

## Testing Strategy

1. **Unit Tests**: Follow existing patterns in the test directory
2. **MCP Inspector**: Use for interactive testing
3. **Integration Tests**: Test with actual weblab API endpoints
4. **Error Scenarios**: Test rate limiting, authentication failures

This analysis provides the complete foundation for implementing weblab functionality in the amzn-mcp package following established patterns and conventions.
