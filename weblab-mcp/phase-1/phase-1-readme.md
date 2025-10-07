# Phase 1: Weblab MCP Integration (Historical Reference)

**Status:** Complete (September 2025)  
**Architecture:** Local MCP tools in amzn-mcp package  
**Purpose:** Historical reference for Phase 1 setup and configuration

---

## What We Built (Phase 1)

We added weblab data access capabilities to AI agents and tools through 4 core MCP tools that enable:

- **Experiment Search**: Find weblabs by creator, status, resolver group, etc.
- **Experiment Details**: Get comprehensive experiment information including treatments, CTI, and ownership
- **Allocation Monitoring**: Check current experiment status and treatment allocations
- **Change History**: Access experiment activation history with MCM information

## Why This Mattered

Internal teams were increasingly using AI tools (Q CLI, Cline, etc.) for weblab analysis and needed programmatic access to experiment data. This integration provided:

- Service Protection: Uses public weblab APIs with proper rate limiting
- Scalable Authentication: Hybrid approach supporting individual and shared API keys
- AI-Friendly: Native MCP integration for seamless AI agent workflows
- Future-Ready: Extensible architecture for advanced orchestration and multi-agent systems

## Repository Structure (Phase 1)

```
├── .kiro/specs/weblab-mcp-integration/
│   ├── requirements.md    # User stories and acceptance criteria
│   ├── design.md         # Technical architecture and design decisions
│   └── tasks.md          # Implementation plan and task breakdown
├── docs/                 # Supporting documentation
└── README.md            # This file
```

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

## Testing (Phase 1)

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
- **PROD Environment**: Supported (CR-220258045)
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

## Key Design Decisions (Phase 1)

- **Public API Only**: Uses WeblabAPIModel public APIs to ensure service availability
- **Rate Limiting**: TK query/minute for shared keys, higher limits for individual keys
- **Authentication**: Hybrid approach with individual API keys and shared community fallback
- **MCP Integration**: Follows established `amzn-mcp` patterns and conventions

## TK Values

Throughout the documents, you'll see "TK" placeholders for numeric values that need team discussion and decision. These include rate limits, timeouts, and other operational parameters.

---

## Why Phase 1 is Complete

**Phase 1 Goal:** Validate MCP approach with minimal tools

**Achievements:**
- 3 core tools working (details, allocations, history)
- Tested with director (Vignesh)
- Proven API patterns and authentication
- Test suite passing

**What Changed:**
- MCP Everywhere mandate (October 2025) requires remote-first architecture
- amzn-mcp deprecating by end of October 2025
- Must pivot to Phase 2: Remote Strands agent

**Phase 1 Value:**
- Validated API approach (not page scraping)
- Proved tool discovery works
- Established authentication patterns
- 90% of API logic reusable in Phase 2

---

## Migration to Phase 2

**See:**
- [Phase 2 Dev Setup](phase-2-dev-setup.md) - New development guide
- [Technical Vision](mcp-weblab-anywhere-technical-vision.md) - Architecture evolution
- [Roadmap](mcp-weblab-anywhere-roadmap.md) - Phase 2 implementation plan

**Key Changes:**
- Local amzn-mcp → Remote Strands agent
- TypeScript → Python
- stdio → Remote MCP protocol
- Midway only → CloudAuth + Transitive Auth

---

**Document Status:** Historical reference  
**Last Active:** September 2025  
**Superseded By:** Phase 2 documentation
