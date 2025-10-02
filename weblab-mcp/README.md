# Weblab MCP Integration

This repository contains the specification and design documents for integrating weblab functionality into Amazon's `amzn-mcp` package through the Model Context Protocol (MCP).

## What We're Building

We're adding weblab data access capabilities to AI agents and tools through 4 core MCP tools that enable:

- **Experiment Search**: Find weblabs by creator, status, resolver group, etc.
- **Experiment Details**: Get comprehensive experiment information including treatments, CTI, and ownership
- **Allocation Monitoring**: Check current experiment status and treatment allocations
- **Change History**: Access experiment activation history with MCM information

## Why This Matters

Internal teams are increasingly using AI tools (Q CLI, Cline, etc.) for weblab analysis and need programmatic access to experiment data. This integration provides:

- ✅ **Service Protection**: Uses public weblab APIs with proper rate limiting
- ✅ **Scalable Authentication**: Hybrid approach supporting individual and shared API keys
- ✅ **AI-Friendly**: Native MCP integration for seamless AI agent workflows
- ✅ **Future-Ready**: Extensible architecture for advanced orchestration and multi-agent systems

## Repository Structure

```
├── .kiro/specs/weblab-mcp-integration/
│   ├── requirements.md    # User stories and acceptance criteria
│   ├── design.md         # Technical architecture and design decisions
│   └── tasks.md          # Implementation plan and task breakdown
├── docs/                 # Supporting documentation
└── README.md            # This file
```

## Getting Started

1. **Review the Spec**: Start with `requirements.md` to understand the user needs
2. **Understand the Design**: Read `design.md` for technical architecture details
3. **Implementation**: Follow `tasks.md` for step-by-step implementation guidance
4. **Testing**: Use `docs/testing/weblab-test-runner.js` to validate tools work with Amazon Q

## Configuration

### BYOK (Bring Your Own Key) Support

The Weblab MCP integration supports both shared community keys and team-specific API keys:

#### Default Shared Key
- **Key**: `WeblabMCPServer-Weblab-58093`
- **Rate Limit**: Heavily throttled for casual users
- **Use Case**: Testing and low-volume queries

#### Team-Specific Keys (BYOK)
Teams can configure their own Weblab API key for higher rate limits:

1. **Obtain a Weblab API Key**: Contact the Weblab team to create a new SSO consumer with appropriate permissions
2. **Configure in MCP**: Add to your `mcp.json` configuration:
   ```json
   {
     "env": {
       "WEBLAB_API_KEY": "YourTeam-Weblab-12345",
       "WEBLAB_ENVIRONMENT": "PROD"
     }
   }
   ```

#### Origin Pattern
The integration automatically derives the Origin header from your API key:
- **Pattern**: First segment before hyphen becomes the origin
- **Examples**:
  - `WeblabMCPServer-Weblab-58093` → Origin: `WeblabMCPServer`
  - `AmazonFresh-Weblab-77234` → Origin: `AmazonFresh`
  - `RufusAI-Weblab-99102` → Origin: `RufusAI`

**Important**: When requesting a new API key, ensure the configured origins match the first segment of your key name.

### Debug Logging

Enable detailed API request/response logging for troubleshooting:

```bash
# Enable debug logging
export WEBLAB_DEBUG=true
```

Debug output includes:
- API endpoints being called
- Partial API key (masked for security)
- Origin headers
- Response status codes
- Response lengths

**Note**: Debug logs are written to `stderr` to avoid interfering with MCP communication.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WEBLAB_API_KEY` | Your team's Weblab API key | `WeblabMCPServer-Weblab-58093` |
| `WEBLAB_ENVIRONMENT` | Target environment (`BETA` or `PROD`) | `BETA` |
| `WEBLAB_DEBUG` | Enable debug logging (`true` or `false`) | `false` |

## Testing

### Quick Validation
```bash
# Test both BETA and PROD environments
node docs/testing/weblab-test-runner.js

# Test specific environment only
WEBLAB_ENVIRONMENT=PROD node docs/testing/weblab-test-runner.js
WEBLAB_ENVIRONMENT=BETA node docs/testing/weblab-test-runner.js
```

### Environment Support
- **BETA Environment**: Default, uses BETA experiments for testing
- **PROD Environment**: ✅ **NOW SUPPORTED** (CR-220258045)
  - Full activation history support (`allocationperiods` enabled)
  - Use `WEBLAB_ENVIRONMENT=PROD` to test production experiments
  - Environment variable overrides MCP configuration

### Developer Workflow
1. **Make MCP tool changes**
2. **Run test bench** - validates Q can discover and use tools correctly
3. **If tests fail** - tweak tool descriptions or test prompts
4. **Repeat until all pass**

### Adding New Tools
1. **Add tool to MCP server**
2. **Add test case to `docs/testing/weblab-test-suite.json`**:
   ```json
   {
     "name": "My new tool test",
     "prompt": "Natural language that should trigger my tool",
     "expectedTools": ["my_new_tool"]
   }
   ```
3. **Run test bench to validate**

### Manual Testing
```bash
# Test individual prompts
q "What can you tell me about experiment X?"
# Check which tools Q actually uses vs expected
```

## Key Design Decisions

- **Public API Only**: Uses WeblabAPIModel public APIs to ensure service availability
- **Rate Limiting**: TK query/minute for shared keys, higher limits for individual keys
- **Authentication**: Hybrid approach with individual API keys and shared community fallback
- **MCP Integration**: Follows established `amzn-mcp` patterns and conventions

## TK Values

Throughout the documents, you'll see "TK" placeholders for numeric values that need team discussion and decision. These include rate limits, timeouts, and other operational parameters.

## Contributing

This is currently in the specification phase. Implementation will begin once the design is finalized and TK values are determined.

## Questions?

For questions about this integration, reach out to the weblab MCP integration team or check the design document for technical details.
