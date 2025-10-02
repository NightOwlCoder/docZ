# Strands Implementation Query for Weblab MCP Integration

## Context
We're implementing weblab functionality for Amazon's existing amzn-mcp package. We have Keith's technical guidance and need to understand the existing codebase patterns to implement our 5 weblab MCP tools correctly.

## Integration Architecture
**Flow**: Strands Agents (Python) → MCP Protocol → amzn-mcp (TypeScript) → Weblab API

## Keith's Technical Guidance Summary
- **Search**: No search in WeblabAPIModel, but could work with Arpit/Ampl to add search service to proxy
- **Treatment Assignment**: Use WeblabAPIExternalModel allocation-operation (specific link provided)
- **API Client**: HarmonyWeblabClient-JS (actual client) + WeblabAPITypescriptClient (types)
- **Auth**: Midway recommended, comprehensive docs at Weblab API wiki
- **API Keys**: Add entries to WeblabAPI/src/api-consumers.ts

## Detailed Implementation Query

### Primary Questions for Amazon LLM

**1. amzn-mcp Codebase Analysis**
```
Please analyze the amzn-mcp source code and help me understand:

- What is the exact directory structure for adding new tools? (I see references to src/tools/ but need specifics)
- How does tool registration work in src/registration.ts? Show me the pattern for adding 5 new tools
- What are the existing authentication patterns? (I need to follow QUIP tool pattern for WEBLAB_API_KEY)
- How does MidwayHttpClient work in the existing codebase? Show me examples
- What's the formatContent utility pattern for consistent response formatting?
- How do existing tools handle rate limiting and error responses?
- What's the proper way to add Zod schemas for tool parameters?
```

**2. Weblab API Integration Patterns**
```
Based on Keith's guidance, help me understand:

- How should I integrate HarmonyWeblabClient-JS with amzn-mcp patterns?
- What's the best way to use WeblabAPITypescriptClient for type generation?
- How do I implement Midway authentication following the documented examples?
- What's the proper way to handle API keys (individual vs shared community key)?
- How should I structure the WeblabClient interface to match existing amzn-mcp patterns?
```

**3. Specific Tool Implementation**
```
For each of our 5 weblab tools, show me:

weblab_search:
- How to structure the tool.ts file following amzn-mcp patterns
- How to handle the search limitation (no search in WeblabAPIModel)
- Should I coordinate with Arpit/Ampl or implement alternative approach?
- What's the proper SearchParams interface structure?

weblab_details:
- How to map GetExperiment operation to MCP tool pattern
- What's the proper ExperimentDetails interface structure?
- How to handle error responses and format output?

weblab_allocations:
- How to use ListAllocations operation effectively
- What's the proper interface for realm/domain support?
- How to handle inactive experiments ("Not Started" or "OFF" status)?

weblab_activation_history:
- How to use ListAllocationPeriods operation
- How to parse MCM information from activation comments?
- What's the proper chronological formatting?

weblab_treatment_assignment:
- How to implement Keith's solution using WeblabAPIExternalModel allocation-operation?
- Reference: https://code.amazon.com/packages/WeblabAPIExternalModel/blobs/87d876e88ce8d3c99516d2a45a558df39cbad571/--/model/allocation-operation.xml#L116
- How to structure visitor-specific queries?
```

**4. Testing and Integration**
```
Help me understand:

- What's the testing pattern in amzn-mcp? (unit tests, integration tests)
- How do I add tests to scripts/run-simple-tests.sh?
- What's the proper way to test with MCP Inspector?
- How do I verify tools work with Cline, Q CLI, and other MCP clients?
- What's the build process? (npm run build, npm run generate-tool-list)
```

**5. Production Readiness**
```
Based on existing amzn-mcp patterns:

- How should I implement circuit breaker for service protection?
- What's the monitoring and alerting pattern for new tools?
- How do I add documentation following DEVELOPING.md patterns?
- What's the proper way to handle shared community API key setup?
- How do I integrate with existing amzn-mcp reliability patterns?
```

### Specific Code Examples Needed

**1. Tool Registration Pattern**
```typescript
// Show me how to add these 4 tools to src/registration.ts:
// weblab_search, weblab_details, weblab_allocations, weblab_activation_history
```

**2. Authentication Manager Pattern**
```typescript
// Show me how to implement following QUIP tool pattern:
const getWeblabApiKey = (): string => {
  return process.env.WEBLAB_API_KEY || SHARED_COMMUNITY_KEY;
};
```

**3. MidwayHttpClient Usage**
```typescript
// Show me how to make API calls using existing amzn-mcp MidwayHttpClient patterns
// with proper header handling for x-api-key
```

**4. Tool Implementation Template**
```typescript
// Show me the complete tool.ts template following amzn-mcp patterns
// including proper error handling, Zod schemas, and formatContent usage
```

**5. Rate Limit Error Handling**
```typescript
// Show me how to handle 429 responses following existing patterns
if (response.statusCode === 429) {
  throw new NonRetryableError('Rate limit exceeded. Try again later or use individual API key.');
}
```

### Expected Deliverables from LLM

1. **Complete directory structure** for adding weblab tools to amzn-mcp
2. **Working code examples** for each of the 5 weblab tools
3. **Integration patterns** that match existing amzn-mcp conventions
4. **Testing approach** that follows established patterns
5. **Build and deployment** steps specific to amzn-mcp

### Success Criteria

The LLM response should enable us to:
- Add weblab tools to amzn-mcp without breaking existing functionality
- Follow established patterns for authentication, error handling, and response formatting
- Implement proper rate limiting and service protection
- Create comprehensive tests following existing patterns
- Successfully build and deploy the enhanced amzn-mcp package

---

## Follow-up Questions

After getting the initial implementation guidance, we'll need to ask about:

1. **Search Service Integration**: If we coordinate with Arpit/Ampl, what's the process?
2. **API Key Management**: How to work with Weblab team for shared community key?
3. **Performance Optimization**: Any specific patterns for weblab API efficiency?
4. **Monitoring Integration**: How to add weblab-specific metrics to existing monitoring?

---

*This query is designed to get comprehensive implementation guidance from an LLM with access to Amazon's internal codebase, specifically focusing on amzn-mcp patterns and weblab API integration.*