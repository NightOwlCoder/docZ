# Weblab MCP Implementation Guide

## Complete Implementation Plan

Based on Keith's technical guidance and amzn-mcp patterns analysis, here's the step-by-step implementation:

## 1. Directory Structure Setup

Create the following structure in amzn-mcp:
```
src/tools/weblab/
├── index.ts                    # Export all weblab tools
├── client.ts                   # WeblabClient with API integration
├── types.ts                    # Weblab-specific TypeScript types
├── weblab-search.ts           # Search experiments tool
├── weblab-details.ts          # Get experiment details tool
├── weblab-allocations.ts      # Get current allocations tool
├── weblab-activation-history.ts # Get activation history tool
└── weblab-treatment-assignment.ts # Get treatment assignment tool
```

## 2. Types Definition

```typescript
// src/tools/weblab/types.ts
export interface WeblabSearchParams {
  query?: string;
  creator?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  resolverGroup?: string;
  limit?: number;
}

export interface WeblabDetailsParams {
  experimentId: string;
}

export interface WeblabAllocationsParams {
  experimentId: string;
  realm?: string;
  domain?: string;
}

export interface WeblabActivationHistoryParams {
  experimentId: string;
  limit?: number;
}

export interface WeblabTreatmentAssignmentParams {
  experimentId: string;
  visitorId: string;
  realm?: string;
}

export interface WeblabExperiment {
  id: string;
  name: string;
  description?: string;
  status: string;
  creator: string;
  treatments: WeblabTreatment[];
  cti?: string;
  resolverGroup?: string;
}

export interface WeblabTreatment {
  id: string;
  name: string;
  allocation: number;
  isControl: boolean;
}

export interface WeblabAllocation {
  realm: string;
  domain: string;
  status: 'ACTIVE' | 'INACTIVE';
  allocation: number;
  startTime: string;
  endTime?: string;
}

export interface WeblabActivationEvent {
  timestamp: string;
  action: 'ACTIVATED' | 'DEACTIVATED' | 'MODIFIED';
  user: string;
  mcmId?: string;
  comment?: string;
}
```

## 3. Client Implementation

```typescript
// src/tools/weblab/client.ts
import { MidwayHttpClient, HttpMethod } from "../../core/http/midway-http-client.js";
import { getConfigPath } from "../../constants/paths.js";
import { NonRetryableError } from "../../core/reliability/retry.js";
import * as fs from "node:fs/promises";
import {
  WeblabSearchParams,
  WeblabDetailsParams,
  WeblabAllocationsParams,
  WeblabActivationHistoryParams,
  WeblabTreatmentAssignmentParams
} from "./types.js";

export class WeblabClient {
  private httpClient: MidwayHttpClient;
  private configPath: string;
  private static readonly SHARED_COMMUNITY_KEY = "TK_SHARED_COMMUNITY_KEY"; // To be determined
  private static readonly API_BASE_URL = "https://weblab-api.amazon.com"; // Keith's guidance
  private static readonly EXTERNAL_API_URL = "https://weblab-external-api.amazon.com"; // For treatment assignment

  constructor() {
    this.httpClient = MidwayHttpClient.getInstance();
    this.configPath = process.env.AMAZON_MCP_SERVER_CONFIG_PATH || getConfigPath();
  }

  private async getWeblabApiKey(): Promise<string> {
    // Individual API key first (higher rate limits)
    if (process.env.WEBLAB_API_KEY) {
      return process.env.WEBLAB_API_KEY;
    }

    // Try config file
    try {
      const data = await fs.readFile(this.configPath, "utf-8");
      const match = data.match(/WEBLAB_API_KEY=(.+)/);
      if (match) {
        return match[1].trim();
      }
    } catch (error) {
      console.debug("No individual WEBLAB_API_KEY found, using shared community key");
    }

    // Fallback to shared community key (lower rate limits)
    return WeblabClient.SHARED_COMMUNITY_KEY;
  }

  private async makeRequest(url: string, method: HttpMethod = HttpMethod.GET, body?: any): Promise<any> {
    const apiKey = await this.getWeblabApiKey();
    
    const response = await this.httpClient.request(
      new URL(url),
      method,
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      }
    );

    if (response.statusCode === 429) {
      throw new NonRetryableError('Rate limit exceeded. Try again later or use individual API key.');
    }

    if (response.statusCode === 401) {
      throw new NonRetryableError('Authentication failed. Check your WEBLAB_API_KEY.');
    }

    if (response.statusCode >= 400) {
      throw new Error(`API request failed with status ${response.statusCode}: ${response.body}`);
    }

    return typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
  }

  async searchExperiments(params: WeblabSearchParams): Promise<any> {
    // Note: Keith mentioned no search in WeblabAPIModel
    // This would need coordination with Arpit/Ampl for search service proxy
    // For now, implement basic filtering on list endpoint
    
    const queryParams = new URLSearchParams();
    if (params.creator) queryParams.append('creator', params.creator);
    if (params.status) queryParams.append('status', params.status);
    if (params.resolverGroup) queryParams.append('resolverGroup', params.resolverGroup);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${WeblabClient.API_BASE_URL}/experiments?${queryParams.toString()}`;
    return this.makeRequest(url);
  }

  async getExperimentDetails(params: WeblabDetailsParams): Promise<any> {
    const url = `${WeblabClient.API_BASE_URL}/experiments/${params.experimentId}`;
    return this.makeRequest(url);
  }

  async getExperimentAllocations(params: WeblabAllocationsParams): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params.realm) queryParams.append('realm', params.realm);
    if (params.domain) queryParams.append('domain', params.domain);

    const url = `${WeblabClient.API_BASE_URL}/experiments/${params.experimentId}/allocations?${queryParams.toString()}`;
    return this.makeRequest(url);
  }

  async getActivationHistory(params: WeblabActivationHistoryParams): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${WeblabClient.API_BASE_URL}/experiments/${params.experimentId}/history?${queryParams.toString()}`;
    return this.makeRequest(url);
  }

  async getTreatmentAssignment(params: WeblabTreatmentAssignmentParams): Promise<any> {
    // Keith's solution: Use WeblabAPIExternalModel allocation-operation
    // Reference: https://code.amazon.com/packages/WeblabAPIExternalModel/blobs/87d876e88ce8d3c99516d2a45a558df39cbad571/--/model/allocation-operation.xml#L116
    
    const body = {
      experimentId: params.experimentId,
      visitorId: params.visitorId,
      realm: params.realm || 'USAmazon'
    };

    const url = `${WeblabClient.EXTERNAL_API_URL}/allocation-operation`;
    return this.makeRequest(url, HttpMethod.POST, body);
  }
}
```

## 4. Tool Implementations

### Search Tool
```typescript
// src/tools/weblab/weblab-search.ts
import { z } from "zod";
import { Tool, ToolTag } from "../tool.js";
import { WeblabClient } from "./client.js";
import { WeblabSearchParams } from "./types.js";

export interface WeblabSearchInput {
  query?: string;
  creator?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  resolverGroup?: string;
  limit?: number;
}

export const WeblabSearchTool: Tool = {
  name: "weblab_search",
  tags: ["search"] as ToolTag[],
  publishStatus: "experimental",
  description: [
    "Search for weblab experiments",
    "",
    "This tool searches for weblab experiments based on various criteria.",
    "Note: Full search functionality requires coordination with Arpit/Ampl team.",
    "",
    "Parameters:",
    "- query: Search query (limited functionality)",
    "- creator: Filter by experiment creator",
    "- status: Filter by experiment status (ACTIVE, INACTIVE, DRAFT)",
    "- resolverGroup: Filter by resolver group",
    "- limit: Maximum number of results (default: 50)",
    "",
    "Examples:",
    "1. Search by creator:",
    "```json",
    "{",
    '  "creator": "username"',
    "}",
    "```",
    "",
    "2. Search active experiments:",
    "```json",
    "{",
    '  "status": "ACTIVE",',
    '  "limit": 20',
    "}",
    "```"
  ].join("\n"),

  paramSchema: {
    query: z.string().optional().describe("Search query for experiment names/descriptions"),
    creator: z.string().optional().describe("Filter by experiment creator username"),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional().describe("Filter by experiment status"),
    resolverGroup: z.string().optional().describe("Filter by resolver group"),
    limit: z.number().min(1).max(100).optional().describe("Maximum number of results (default: 50)")
  },

  cb: async (input: WeblabSearchInput) => {
    const client = new WeblabClient();
    try {
      console.log(`Searching weblab experiments with params:`, input);

      const result = await client.searchExperiments(input);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              status: "success",
              searchParams: input,
              resultCount: result.experiments?.length || 0,
              experiments: result.experiments || []
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error("WeblabSearchTool error:", error);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              searchParams: input
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }
};
```

### Details Tool
```typescript
// src/tools/weblab/weblab-details.ts
import { z } from "zod";
import { Tool, ToolTag } from "../tool.js";
import { WeblabClient } from "./client.js";

export interface WeblabDetailsInput {
  experimentId: string;
}

export const WeblabDetailsTool: Tool = {
  name: "weblab_details",
  tags: ["read"] as ToolTag[],
  publishStatus: "experimental",
  description: [
    "Get detailed information about a weblab experiment",
    "",
    "This tool retrieves complete information about a specific weblab experiment",
    "including treatments, CTI information, ownership, and configuration details.",
    "",
    "Parameters:",
    "- experimentId: The unique identifier of the weblab experiment",
    "",
    "Example:",
    "```json",
    "{",
    '  "experimentId": "MyExperiment_2024"',
    "}",
    "```"
  ].join("\n"),

  paramSchema: {
    experimentId: z.string().describe("The unique identifier of the weblab experiment")
  },

  cb: async (input: WeblabDetailsInput) => {
    const client = new WeblabClient();
    try {
      console.log(`Getting weblab experiment details for: ${input.experimentId}`);

      const result = await client.getExperimentDetails(input);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              status: "success",
              experimentId: input.experimentId,
              experiment: result
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error("WeblabDetailsTool error:", error);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              experimentId: input.experimentId
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }
};
```

### Allocations Tool
```typescript
// src/tools/weblab/weblab-allocations.ts
import { z } from "zod";
import { Tool, ToolTag } from "../tool.js";
import { WeblabClient } from "./client.js";

export interface WeblabAllocationsInput {
  experimentId: string;
  realm?: string;
  domain?: string;
}

export const WeblabAllocationsTool: Tool = {
  name: "weblab_allocations",
  tags: ["read"] as ToolTag[],
  publishStatus: "experimental",
  description: [
    "Get current allocation status for a weblab experiment",
    "",
    "This tool retrieves the current allocation status across different realms and domains.",
    "Shows whether experiments are active and their current traffic allocation percentages.",
    "",
    "Parameters:",
    "- experimentId: The unique identifier of the weblab experiment",
    "- realm: Optional realm filter (e.g., 'USAmazon', 'UKAmazon')",
    "- domain: Optional domain filter",
    "",
    "Examples:",
    "1. Get all allocations:",
    "```json",
    "{",
    '  "experimentId": "MyExperiment_2024"',
    "}",
    "```",
    "",
    "2. Get allocations for specific realm:",
    "```json",
    "{",
    '  "experimentId": "MyExperiment_2024",',
    '  "realm": "USAmazon"',
    "}",
    "```"
  ].join("\n"),

  paramSchema: {
    experimentId: z.string().describe("The unique identifier of the weblab experiment"),
    realm: z.string().optional().describe("Filter by realm (e.g., 'USAmazon', 'UKAmazon')"),
    domain: z.string().optional().describe("Filter by domain")
  },

  cb: async (input: WeblabAllocationsInput) => {
    const client = new WeblabClient();
    try {
      console.log(`Getting weblab allocations for: ${input.experimentId}`);

      const result = await client.getExperimentAllocations(input);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              status: "success",
              experimentId: input.experimentId,
              filters: {
                realm: input.realm,
                domain: input.domain
              },
              allocations: result.allocations || []
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error("WeblabAllocationsTool error:", error);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              experimentId: input.experimentId
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }
};
```

### Activation History Tool
```typescript
// src/tools/weblab/weblab-activation-history.ts
import { z } from "zod";
import { Tool, ToolTag } from "../tool.js";
import { WeblabClient } from "./client.js";

export interface WeblabActivationHistoryInput {
  experimentId: string;
  limit?: number;
}

export const WeblabActivationHistoryTool: Tool = {
  name: "weblab_activation_history",
  tags: ["read"] as ToolTag[],
  publishStatus: "experimental",
  description: [
    "Get activation history for a weblab experiment",
    "",
    "This tool retrieves the chronological history of experiment activations,",
    "deactivations, and modifications, including MCM information when available.",
    "",
    "Parameters:",
    "- experimentId: The unique identifier of the weblab experiment",
    "- limit: Maximum number of history entries to return (default: 50)",
    "",
    "Example:",
    "```json",
    "{",
    '  "experimentId": "MyExperiment_2024",',
    '  "limit": 20',
    "}",
    "```"
  ].join("\n"),

  paramSchema: {
    experimentId: z.string().describe("The unique identifier of the weblab experiment"),
    limit: z.number().min(1).max(200).optional().describe("Maximum number of history entries (default: 50)")
  },

  cb: async (input: WeblabActivationHistoryInput) => {
    const client = new WeblabClient();
    try {
      console.log(`Getting weblab activation history for: ${input.experimentId}`);

      const result = await client.getActivationHistory(input);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              status: "success",
              experimentId: input.experimentId,
              historyCount: result.history?.length || 0,
              history: result.history || []
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error("WeblabActivationHistoryTool error:", error);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              experimentId: input.experimentId
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }
};
```

### Treatment Assignment Tool
```typescript
// src/tools/weblab/weblab-treatment-assignment.ts
import { z } from "zod";
import { Tool, ToolTag } from "../tool.js";
import { WeblabClient } from "./client.js";

export interface WeblabTreatmentAssignmentInput {
  experimentId: string;
  visitorId: string;
  realm?: string;
}

export const WeblabTreatmentAssignmentTool: Tool = {
  name: "weblab_treatment_assignment",
  tags: ["read"] as ToolTag[],
  publishStatus: "experimental",
  description: [
    "Get treatment assignment for a specific visitor",
    "",
    "This tool determines which treatment a specific visitor would receive",
    "for a given weblab experiment. Uses WeblabAPIExternalModel allocation-operation.",
    "",
    "Parameters:",
    "- experimentId: The unique identifier of the weblab experiment",
    "- visitorId: The visitor identifier to check assignment for",
    "- realm: Optional realm (default: 'USAmazon')",
    "",
    "Example:",
    "```json",
    "{",
    '  "experimentId": "MyExperiment_2024",',
    '  "visitorId": "visitor123",',
    '  "realm": "USAmazon"',
    "}",
    "```"
  ].join("\n"),

  paramSchema: {
    experimentId: z.string().describe("The unique identifier of the weblab experiment"),
    visitorId: z.string().describe("The visitor identifier to check assignment for"),
    realm: z.string().optional().describe("Realm for the assignment check (default: 'USAmazon')")
  },

  cb: async (input: WeblabTreatmentAssignmentInput) => {
    const client = new WeblabClient();
    try {
      console.log(`Getting treatment assignment for visitor ${input.visitorId} in experiment ${input.experimentId}`);

      const result = await client.getTreatmentAssignment(input);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              status: "success",
              experimentId: input.experimentId,
              visitorId: input.visitorId,
              realm: input.realm || 'USAmazon',
              assignment: result
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      console.error("WeblabTreatmentAssignmentTool error:", error);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              experimentId: input.experimentId,
              visitorId: input.visitorId
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }
};
```

## 5. Index File

```typescript
// src/tools/weblab/index.ts
import { WeblabSearchTool } from "./weblab-search.js";
import { WeblabDetailsTool } from "./weblab-details.js";
import { WeblabAllocationsTool } from "./weblab-allocations.js";
import { WeblabActivationHistoryTool } from "./weblab-activation-history.js";
import { WeblabTreatmentAssignmentTool } from "./weblab-treatment-assignment.js";
import { Tool } from "../tool.js";

export const tools: Tool[] = [
  WeblabSearchTool,
  WeblabDetailsTool,
  WeblabAllocationsTool,
  WeblabActivationHistoryTool,
  WeblabTreatmentAssignmentTool
];
```

## 6. Registration Update

Add to `src/registration.ts`:
```typescript
// Add import
import { tools as weblabTools } from "./tools/weblab/index.js";

// Add to tools array
export const tools: Tool[] = [
  // ... existing tools
  ...weblabTools,
];
```

## 7. Testing Strategy

### Unit Tests
```typescript
// test/tools/weblab/weblab-search.test.ts
import { describe, it, expect, vi } from 'vitest';
import { WeblabSearchTool } from '../../../src/tools/weblab/weblab-search.js';

describe('WeblabSearchTool', () => {
  it('should search experiments successfully', async () => {
    // Mock implementation
    const result = await WeblabSearchTool.cb({ creator: 'testuser' });
    expect(result.content[0].type).toBe('text');
  });

  it('should handle errors gracefully', async () => {
    // Error case testing
  });
});
```

### Integration Testing
```bash
# Test with MCP Inspector
npx @modelcontextprotocol/inspector npm start

# Test individual tools
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_search", "arguments": {"creator": "testuser"}}, "id": 1}' | amzn-mcp
```

## 8. Documentation Updates

Update `README.md` to include weblab tools:
```markdown
### Weblab Tools (Experiment Management)
- weblab_search: Search for weblab experiments by creator, status, or resolver group
- weblab_details: Get complete experiment information including treatments and CTI
- weblab_allocations: Check current experiment status and treatment allocations
- weblab_activation_history: Access experiment activation history with MCM information
- weblab_treatment_assignment: Get treatment assignments for specific visitors
```

## 9. Configuration

Add to MCP client configuration:
```json
{
  "mcpServers": {
    "amzn-mcp": {
      "command": "amzn-mcp",
      "env": {
        "WEBLAB_API_KEY": "your-individual-api-key-here"
      }
    }
  }
}
```

## 10. Next Steps

1. **Coordinate with Keith's team** for actual API endpoints and authentication details
2. **Work with Arpit/Ampl** for search service integration
3. **Determine shared community API key** value
4. **Test with actual weblab API** endpoints
5. **Add to WeblabAPI/src/api-consumers.ts** for API key management
6. **Implement circuit breaker** for service protection
7. **Add monitoring and alerting** following amzn-mcp patterns

This implementation follows all established amzn-mcp patterns and provides a solid foundation for weblab functionality integration.
