# Amazon Internal MCP Server - Tool Development Guide

## Overview

The Amazon Internal MCP Server's extensible architecture allows developers to create new tools that leverage Amazon's internal services and expose them through a standardized interface. This guide provides a comprehensive, step-by-step approach to implementing a new tool from initial setup to final verification.

**What is a Tool?** In the context of the MCP Server, a tool is a self-contained module that implements a specific capability, such as reading a Quip document, searching internal code, or creating a SIM issue. Tools provide a standardized interface for LLM applications to interact with internal Amazon resources.

## Prerequisites

Before creating a new tool, ensure you have:
- A working Amazon Internal MCP Server development environment
- Understanding of the service/API your tool will integrate with
- Access to necessary authentication credentials (if required)
- Basic knowledge of TypeScript and Zod schemas

### Tool Planning Considerations

Answering these questions will help you design an effective tool:
- **Purpose:** What specific capability will your tool provide?
- **Parameters:** What inputs does your tool need to function?
- **Return format:** What data structure will your tool return?
- **Error handling:** What possible failure modes exist?
- **Performance:** Are there rate limits or optimization opportunities?
- **Authorization:** How will your tool authenticate with the service?

## Step 1: Directory Structure Setup

First, create the necessary directories and files for your new tool:

```bash
# Create required directory structure
mkdir -p src/tools/new-tool-name
mkdir -p test/tools/new-tool-name
touch src/tools/new-tool-name/tool.ts
touch src/tools/new-tool-name/index.ts
touch test/tools/new-tool-name/tool.test.ts
```

**Naming Convention:** Use kebab-case for directory names (e.g., `new-tool-name`) and snake_case for the actual tool name in the code (e.g., `new_tool_name`). This ensures compatibility with both the filesystem and the CLI.

### Directory Structure Explanation
- `src/tools/new-tool-name/tool.ts` - Main tool implementation
- `src/tools/new-tool-name/index.ts` - Tool export for registration
- `test/tools/new-tool-name/tool.test.ts` - Unit tests for the tool

## Step 2: Tool Implementation

Implement your tool in `src/tools/new-tool-name/tool.ts` following this structure. This object literal approach is the recommended and most common implementation pattern in the codebase:

```typescript
import { z } from "zod";
import { Tool, ToolTag } from "../tool";
import { MidwayHttpClient } from "../../core/http/midway-http-client";
import { HttpMethod } from "../../core/http/midway-http-client";
import { formatContent } from "../utils";
import { URL } from "node:url";
import { NonRetryableError } from "../../core/reliability/retry";

// Define tool input interface - match parameter schema
interface NewToolInput {
  paramA: string;
  paramB?: number; // Optional parameter
  paramC?: boolean;
}

/**
 * Implementation of the new tool
 * Should include detailed JSDoc for:
 * - Tool purpose
 * - Input parameters
 * - Output format
 * - Dependencies and requirements
 * - Any rate limits or restrictions
 */
export const NewToolNameTool: Tool = {
  name: "new_tool_name", // Snake_case for tool names (critical for CLI access)
  tags: ["read"] as ToolTag[], // Valid tags: 'read', 'write', 'search'

  description: [
    "Description of what the new tool does and when to use it.",
    "Support for multiline descriptions via array join.",
    "",
    "## Input Parameters",
    "- `paramA`: Description of parameter A (required)",
    "- `paramB`: Description of parameter B (optional)",
    "- `paramC`: Description of parameter C (optional)",
    "",
    "## Examples",
    "Example usage: new_tool_name paramA --paramB 123 --paramC true"
  ].join("\n"),

  // Zod schema for runtime parameter validation
  paramSchema: {
    paramA: z.string().describe("Description of parameter A"),
    paramB: z.number().optional().describe("Description of parameter B"),
    paramC: z.boolean().optional().describe("Description of parameter C")
  },

  // Main tool implementation (async callback)
  cb: async (input: NewToolInput) => {
    const { paramA, paramB = 0, paramC = false } = input;
    console.debug(`Processing tool with paramA=${paramA}, paramB=${paramB}, paramC=${paramC}`);

    try {
      // 1. Request preparation
      const url = new URL(`https://example.service.amazon.com/api/endpoint`);

      // 2. Add query parameters
      url.searchParams.set("paramA", paramA);
      if (paramB !== 0) {
        url.searchParams.set("paramB", paramB.toString());
      }
      if (paramC) {
        url.searchParams.set("paramC", "true");
      }

      // 3. Get HTTP client singleton
      const httpClient = MidwayHttpClient.getInstance();

      // 4. Make request with proper error handling
      const response = await httpClient.request(
        url,
        HttpMethod.GET,
        {
          timeout: 15000, // 15 second timeout
          retryStrategy: {
            maxAttempts: 3,
            maxElapsedTime: 45000 // 45 seconds
          }
        }
      );

      // 5. Process response based on status code
      if (response.statusCode !== 200) {
        throw new NonRetryableError(`Service returned error status: ${response.statusCode}`);
      }

      // 6. Parse and validate response body
      if (!response.body || typeof response.body !== "object") {
        throw new NonRetryableError("Invalid response format");
      }

      // 7. Transform response to MCP content format using the formatContent utility
      return formatContent(response.body);
    } catch (error) {
      if (error instanceof NonRetryableError) {
        throw error; // Pass through non-retryable errors
      }

      // Wrap other errors with context
      throw new NonRetryableError(`Error executing new_tool_name: ${error.message}`);
    }
  }
};
```

### formatContent Usage

This utility function handles different input types:
- For strings: `formatContent("result string")`
- For objects: `formatContent(responseObject)` - will automatically JSON.stringify the object
- For null/undefined: Returns empty content
- For objects with an error property: Throws the error

You don't need to manually create the `content` array structure, as shown in outdated examples.

### Key Components Explained

- **Input Interface:** Define a TypeScript interface that matches the parameter schema
- **Tool Object:** Create a constant that implements the Tool interface
- **Name:** Use snake_case for the tool name (e.g., `new_tool_name`)
- **Tags:** Use one or more of `read`, `write`, `search` tags
- **Description:** Provide a detailed description with Markdown formatting
- **Parameter Schema:** Define Zod schema for runtime parameter validation
- **Callback:** Implement the main tool logic in the `cb` function

### Best Practices for Tool Implementation

- **Error Handling:** Use `NonRetryableError` for terminal failures
- **Request Timeout:** Set appropriate timeouts based on the expected response time
- **Retry Strategy:** Configure retry parameters based on service reliability
- **Parameter Validation:** Use Zod schemas for runtime validation
- **Response Transformation:** Use `formatContent` to standardize output

**Important:** Always handle errors gracefully and provide context in error messages. Never expose sensitive information in error messages.

## Step 3: Tool Export

Export your tool from `src/tools/new-tool-name/index.ts` to make it available for registration:

```typescript
// Export the tool for registration
export { NewToolNameTool as default } from "./tool";

// Alternatively, if the tool has multiple exports:
// export const tools = [NewToolNameTool, SecondaryTool];
```

This export pattern allows the registration system to discover and register your tool. There are two common patterns:
- **Default Export:** Use when exporting a single tool
- **Named Export (tools):** Use when exporting multiple related tools

## Step 4: Tool Registration

Register your tool in `src/registration.ts` (not src/index.ts) by adding it to the tools array:

### 1. Import the tool at the top of the file:
```typescript
import { NewToolNameTool } from "./tools/new-tool-name/tool.js";
```

### 2. Add the tool to the `tools` array:
```typescript
const tools: Tool[] = [
  // Existing tools...
  NewToolNameTool,
  // Other tools...
];
```

**Important Note:** Always register tools in `src/registration.ts`, not in `src/index.ts`. The registration system automatically handles filtering and registering tools with the MCP server. Make sure to use the correct import path with `.js` extension (this is required due to the ESM module system, even though the source files use TypeScript).

**Note:** The registration system will automatically apply include/exclude filters based on the tool's tags and the server startup options. For example, if your tool has the `write` tag, it will be excluded when the server is started with `--exclude-tags=write`.

## Step 5: Unit Testing

Implement comprehensive unit tests in `test/tools/new-tool-name/tool.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NewToolNameTool } from "../../../src/tools/new-tool-name/tool";
import { MidwayHttpClient } from "../../../src/core/http/midway-http-client";
import { HttpMethod } from "../../../src/core/http/midway-http-client";

// Mock the MidwayHttpClient for isolated testing
vi.mock("../../../src/core/http/midway-http-client", () => {
  const mockInstance = {
    request: vi.fn(),
  };

  return {
    MidwayHttpClient: {
      getInstance: vi.fn(() => mockInstance),
    },
    HttpMethod: {
      GET: "GET",
      POST: "POST",
    },
  };
});

describe("NewToolNameTool", () => {
  // Get the mocked instance for use in tests
  const mockHttpClient = MidwayHttpClient.getInstance() as jest.Mocked<MidwayHttpClient>;

  beforeEach(() => {
    // Reset mock state between tests
    vi.resetAllMocks();
  });

  it("should handle valid parameters successfully", async () => {
    // Arrange: Setup mock response
    mockHttpClient.request.mockResolvedValueOnce({
      statusCode: 200,
      headers: {},
      body: { result: "test_success" },
      url: new URL("https://example.service.amazon.com/api/endpoint"),
      queryParams: new URLSearchParams(),
    });

    // Act: Call the tool
    const result = await NewToolNameTool.cb({
      paramA: "test_value",
      paramB: 123,
    });

    // Assert: Verify results
    expect(mockHttpClient.request).toHaveBeenCalledTimes(1);
    expect(mockHttpClient.request).toHaveBeenCalledWith(
      expect.objectContaining({
        hostname: "example.service.amazon.com",
        pathname: "/api/endpoint",
      }),
      HttpMethod.GET,
      expect.objectContaining({
        timeout: expect.any(Number),
        retryStrategy: expect.objectContaining({
          maxAttempts: expect.any(Number),
        }),
      }),
    );

    // Verify response format
    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("type", "text");
    expect(result.content[0].text).toContain("test_success");
  });

  it("should handle error responses correctly", async () => {
    // Arrange: Setup error response
    mockHttpClient.request.mockResolvedValueOnce({
      statusCode: 404,
      headers: {},
      body: { error: "not_found" },
      url: new URL("https://example.service.amazon.com/api/endpoint"),
      queryParams: new URLSearchParams(),
    });

    // Act & Assert: Verify error is thrown
    await expect(NewToolNameTool.cb({
      paramA: "nonexistent",
    })).rejects.toThrow("Service returned error status: 404");
  });

  it("should validate required parameters", async () => {
    // Test with missing required parameter
    // Note: Zod validation happens at server level before callback
    // This test verifies our code handles absence correctly

    // @ts-ignore - Intentionally passing invalid input
    await expect(NewToolNameTool.cb({})).rejects.toThrow();
  });
});
```

### Testing Best Practices

- **Mock Dependencies:** Use `vi.mock()` to mock external dependencies
- **Reset Mocks:** Reset mock state between tests with `vi.resetAllMocks()`
- **Test Success Path:** Verify that valid inputs produce expected outputs
- **Test Error Paths:** Verify that error conditions are handled correctly
- **Test Parameters:** Verify that parameter validation works as expected
- **Use AAA Pattern:** Structure tests with Arrange, Act, Assert sections

## Step 6: Integration Tests

Add an integration test case to `scripts/run-simple-tests.sh`:

```bash
# Test the new tool
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "new_tool_name", "arguments": {"paramA": "test_value", "paramB": 123}}, "id": 1}' | npm start | grep "test_success" > /dev/null && echo "new_tool_name ok" || echo "new_tool_name failed"
```

This integration test verifies that your tool works correctly when called through the JSON-RPC interface. The test:
1. Sends a JSON-RPC request to the server
2. Checks that the response contains the expected output
3. Reports success or failure based on the grep result

**Tip:** Integration tests are valuable for catching issues that might not be apparent in unit tests, such as registration problems or parameter serialization issues.

## Step 7: Build and Verification

Finally, build and verify your tool works correctly:

### 1. Rebuild the project:
```bash
npm run build
```

### 2. Verify tool registration:
```bash
npm run generate-tool-list
```
This command should add your tool to `tool_names.txt`.

### 3. Run the tool from CLI:
```bash
npm run cli new_tool_name test_value --paramB 123
```

### 4. Run integration tests:
```bash
bash scripts/run-simple-tests.sh
```

### Troubleshooting Tips:
- If your tool doesn't appear in `tool_names.txt`, check that it's properly exported and registered
- If the CLI can't find your tool, verify the case sensitivity of the tool name
- If tests fail, use `--verbose` mode to see detailed error messages

## Complete Examples

Explore these existing tools for reference implementations:

### Simple Tools
- `search_people` - Basic search tool with simple parameters
- `read_kingpin_goal` - Read tool with straightforward implementation
- `plantuml` - Tool with multiple operations (encode/decode)

### Strategy Pattern Examples
- `read_internal_website` - Extensive strategy pattern use
- `search_internal_websites` - Strategy-based search implementation

### Complex Tools
- `sim_create_issue` - Complex creation operation with many parameters
- `edit_quip` - Advanced editing with section targeting
- `search_sable` - Sophisticated search with multiple options

**Learning Approach:** A highly effective way to learn tool development is to study existing tools. Start with simple tools to understand the basic pattern, then explore more complex implementations as you gain confidence.

## Next Steps

After creating your basic tool, consider these advanced enhancements:
- **Improve Error Handling:** Add more specific error types and messages
- **Add Caching:** Implement caching for frequently accessed data
- **Optimize Performance:** Refine rate limiting and connection reuse
- **Enhance Documentation:** Add detailed examples and edge cases
- **Implement Strategies:** Split complex logic into targeted strategies