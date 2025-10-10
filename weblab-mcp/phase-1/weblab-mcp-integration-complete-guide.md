# Weblab MCP Integration - Complete Implementation Guide

## Overview

This document consolidates all research, technical guidance, and implementation details for adding weblab functionality to Amazon's AmazonInternalMCPServer package. This integration enables AI agents to access weblab experiment data through the Model Context Protocol (MCP).

## Architecture Summary

**Target Architecture**: AI Clients → MCP Protocol → AmazonInternalMCPServer (TypeScript) → Public Weblab API

**Key Components**:
- 5 weblab MCP tools in AmazonInternalMCPServer package
- Public Weblab API integration (NOT internal UI endpoints)
- Hybrid authentication (individual + shared community keys)
- Optional Strands agent integration for advanced workflows

## Critical Technical Requirements (Keith Norman's Guidance)

### 🚨 **MUST USE PUBLIC API**
- **Previous Failure**: CR-196833998 was reverted for using internal UI endpoints
- **Keith's Requirement**: Use public weblab API with proper service protection
- **Forbidden**: Internal "backdoor" endpoints (weblab.amazon.com/api, /v2/api, /s/_xhr/page)
- **Required**: Proper API keys, rate limiting, API Gateway usage plans

### **Keith's Technical Solutions**
1. **Search**: Not in WeblabAPIModel, coordinate with Arpit/Ampl to add search service to proxy
2. **Treatment Assignment**: Use WeblabAPIExternalModel allocation-operation (exact link provided)
3. **API Client Libraries**: 
   - HarmonyWeblabClient-JS (actual client used by Content Symphony)
   - WeblabAPITypescriptClient (types only)
4. **Authentication**: Midway recommended, comprehensive docs at Weblab API wiki
5. **API Keys**: Add entries to WeblabAPI/src/api-consumers.ts

## AmazonInternalMCPServer Contribution Process

### Development Setup
```bash
# Create Brazil workspace
brazil ws create && brazil ws use -p AmazonInternalMCPServer

# Build project
brazil-build

# Install dependencies
npm install && npm run build

# Run tests
npm test && npm run generate-tool-list

# Test with MCP Inspector
npx @modelcontextprotocol/inspector npm start
```

### Tool Implementation Pattern
```typescript
// src/tools/weblab/tool-name.ts
export const ToolName: Tool = {
  name: "tool_name",
  tags: ["read"|"write"|"search"] as ToolTag[],
  publishStatus: "experimental"|"live"|"deprecated",
  description: "Multi-line description with examples",
  paramSchema: { /* Zod schema */ },
  cb: async (input) => { /* Implementation */ }
};
```

### Directory Structure
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

test/tools/weblab/     # Unit tests
documentation/projects/weblab-mcp-integration/ # Project docs
```

### Authentication Pattern
```typescript
private async getWeblabApiKey(): Promise<string> {
  // 1. Environment variable (individual key - higher limits)
  if (process.env.WEBLAB_API_KEY) return process.env.WEBLAB_API_KEY;
  
  // 2. Config file (~/.amazon-internal-mcp-server/.env)
  const configMatch = await readConfigFile();
  if (configMatch) return configMatch;
  
  // 3. Shared community key (fallback - lower limits)
  return SHARED_COMMUNITY_KEY;
}
```

### Code Review Requirements

**CRITICAL**: Dual approval required from both teams:
1. **mcp-community team**: https://permissions.amazon.com/a/team/amzn1.abacus.team.3agdl3qdt2oo7vuz32ta
2. **genai-devx-appdev team**: https://code.amazon.com/reviews/to-entity/posixg/genai-devx-appdev

**Process**:
1. Get SME review FIRST (Keith Norman or weblab domain expert)
2. Update documentation (README.md, tool_names.txt, usage docs)
3. Create project documentation folder
4. Submit CR with both team approvals
5. Address feedback on tool curation, security, code structure

## 5 Weblab Tools Implementation

### 1. weblab_search
- **Purpose**: Search experiments by creator, status, resolver group
- **Challenge**: No search in WeblabAPIModel (coordinate with Arpit/Ampl)
- **Workaround**: Basic filtering on list endpoint initially

### 2. weblab_details
- **Purpose**: Get comprehensive experiment information
- **API**: GetExperiment operation from WeblabAPIModel
- **Output**: Title, objective, treatments, CTI, ownership

### 3. weblab_allocations
- **Purpose**: Check current experiment status and allocations
- **API**: ListAllocations operation from WeblabAPIModel
- **Output**: Status, treatment percentages, exposure levels

### 4. weblab_activation_history
- **Purpose**: Get experiment change history with MCM info
- **API**: ListAllocationPeriods operation from WeblabAPIModel
- **Output**: Chronological changes with user, timestamp, comments

### 5. weblab_treatment_assignment
- **Purpose**: Get treatment assignment for specific visitor
- **API**: WeblabAPIExternalModel allocation-operation (Keith's solution)
- **Output**: Treatment assignment (C, T1, T2, etc.)

## MCP Prompts Integration (Advanced Feature)

### Overview
Based on [CR-212609177](https://code.amazon.com/reviews/CR-212609177/revisions/2#/details), Amazon has implemented **MCP Prompts** - structured prompts with parameters that can orchestrate multiple tools for complex workflows.

### Weblab Analysis Prompts (Future Enhancement)
Following the pattern from `fix-integration-test` prompt, we could implement weblab-specific prompts:

#### 1. weblab_experiment_analysis
```typescript
// Example prompt structure
export const WeblabExperimentAnalysisPrompt: Prompt = {
  name: "weblab-experiment-analysis",
  description: "Comprehensive weblab experiment analysis and recommendations",
  arguments: [
    {
      name: "experimentId",
      description: "The weblab experiment ID to analyze",
      required: true,
    },
    {
      name: "analysisType", 
      description: "Type of analysis: 'performance', 'allocation', 'history', 'comprehensive'",
      required: false,
    }
  ],
  generateMessages: (args) => {
    // Generate structured prompt that orchestrates multiple weblab tools
  }
};
```

#### 2. weblab_troubleshoot_experiment
- **Purpose**: Diagnose experiment issues (not activating, low traffic, etc.)
- **Tools Used**: weblab_details, weblab_allocations, weblab_activation_history
- **Output**: Root cause analysis and fix recommendations

#### 3. weblab_experiment_health_check
- **Purpose**: Comprehensive health check for experiments
- **Tools Used**: All 5 weblab tools + external validation
- **Output**: Health report with actionable insights

### Usage Pattern
```bash
# In Amazon Q CLI
@weblab-experiment-analysis MyExperiment_2024
@weblab-troubleshoot-experiment MyExperiment_2024 analysisType=allocation
```

### Implementation Benefits
1. **Structured Workflows**: Prompts orchestrate multiple tools systematically
2. **Consistent Analysis**: Standardized investigation procedures
3. **User Experience**: Simple command interface for complex operations
4. **Reusability**: Prompts can be shared across teams

### Integration with Existing Tools
- **MCP Tools**: Prompts use our 5 weblab tools as building blocks
- **External Tools**: Can integrate with BrazilWorkspace, CRRevisionCreator for fixes
- **Documentation**: Prompts can reference internal wikis and documentation

## API Integration Details

### Public API Endpoints (Keith's Guidance)
- **Base URL**: TBD with Keith's team (prod/beta environments)
- **Authentication**: x-api-key header for API Gateway
- **Rate Limiting**: Handled by API Gateway based on key type
- **Documentation**: https://w.amazon.com/bin/view/Weblab/Manual/Advanced/Programmatic/WeblabAPI/

### Error Handling Pattern
```typescript
// Handle rate limiting
if (response.statusCode === 429) {
  throw new NonRetryableError('Rate limit exceeded. Try again later or use individual API key.');
}

// Handle API errors
if (response.statusCode !== 200) {
  throw new NonRetryableError(`Weblab API returned status ${response.statusCode}`);
}
```

## Testing Strategy

### Unit Tests
- Mock API responses for each tool
- Test authentication scenarios
- Verify error handling patterns
- Follow existing test patterns in test/ directory

### Integration Tests
- Add test cases to scripts/run-simple-tests.sh
- Test against real Weblab APIs with test keys
- Verify MCP protocol functionality
- Test with MCP Inspector and Amazon Q

### Example Test Pattern
```bash
# Add to scripts/run-simple-tests.sh
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_search", "arguments": {"creator": "testuser"}}, "id": 1}' | npm start | grep "expected output" > /dev/null && echo weblab_search ok || echo weblab_search failed.
```

## Strands Integration (Optional Phase 2)

### MCPClient Usage
```python
from strands.tools.mcp import MCPClient
from mcp import stdio_client, StdioServerParameters

# Connect to amzn-mcp server
weblab_tools = MCPClient(lambda: stdio_client(StdioServerParameters(
    command="amzn-mcp"
)))

with weblab_tools:
    result = weblab_tools.call_tool_sync("weblab_details", {"experimentId": "EXP_123"})
```

### Agent Implementation
```python
from strands import Agent

# Create agent with MCP weblab tools
agent = Agent(tools=[weblab_tools])

# Example usage
agent("What is the current allocation for weblab XYZ?")
```

## Key Resources

### Documentation
- [Weblab API Manual](https://w.amazon.com/bin/view/Weblab/Manual/Advanced/Programmatic/WeblabAPI/)
- [AmazonInternalMCPServer Package](https://code.amazon.com/packages/AmazonInternalMCPServer/trees/mainline)
- [CONTRIBUTING.md](https://code.amazon.com/packages/AmazonInternalMCPServer/blobs/mainline/--/CONTRIBUTING.md)
- [DEVELOPING.md](https://code.amazon.com/packages/AmazonInternalMCPServer/blobs/mainline/--/DEVELOPING.md)

### Code References
- [HarmonyWeblabClient-JS](https://code.amazon.com/packages/HarmonyWeblabClient-JS/trees/mainline)
- [WeblabAPITypescriptClient](https://code.amazon.com/packages/WeblabAPITypescriptClient/trees/mainline)
- [WeblabAPIExternalModel](https://code.amazon.com/packages/WeblabAPIExternalModel/blobs/87d876e88ce8d3c99516d2a45a558df39cbad571/--/model/allocation-operation.xml#L116)

### Previous Implementation
- [CR-196833998 (Reverted)](https://code.amazon.com/reviews/CR-196833998/revisions/1#/details) - Learn from mistakes, reuse patterns

## Success Criteria

### Functional Requirements
- All 5 weblab tools implemented following AmazonInternalMCPServer patterns
- Proper authentication with individual and shared API keys
- Rate limiting and error handling
- Consistent response formatting
- Integration with existing tool registration system

### Integration Requirements
- Works with Amazon Q CLI
- Works with Strands agents via MCP protocol
- Works with other MCP clients (Cline, etc.)
- Proper service protection and monitoring

### Code Review Requirements
- SME validation from weblab domain expert
- Dual approval from mcp-community and genai-devx-appdev teams
- Complete documentation and usage examples
- Comprehensive test coverage

This guide consolidates all research findings and provides a complete roadmap for implementing weblab MCP integration following Amazon's established patterns and Keith's technical guidance.