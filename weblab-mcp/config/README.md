# MCP Configuration for Weblab Integration

## Overview
This directory contains MCP (Model Context Protocol) configuration files for testing and using the weblab MCP integration with Amazon Q and other AI agents.

## Files

### `amazon-q-mcp-config.json`
Complete Amazon Q MCP configuration that includes:
- **amzn-mcp-local**: Local weblab MCP server for development/testing
- **builder-mcp**: Amazon's internal builder tools
- **brave-search**: Web search capabilities  
- **fetch**: HTTP fetch capabilities
- **code_cerebro_mcp**: Code analysis tools

## Setup Instructions

### 1. Install the Configuration

Copy the configuration to Amazon Q's MCP directory:

```bash
# Backup existing config (if any)
cp ~/.aws/amazonq/mcp.json ~/.aws/amazonq/mcp.json.backup

# Install our config
cp docs/config/amazon-q-mcp-config.json ~/.aws/amazonq/mcp.json
```

### 2. Update Paths

Edit `~/.aws/amazonq/mcp.json` and update the path in the `amzn-mcp-local` server:

```json
{
  "mcpServers": {
    "amzn-mcp-local": {
      "args": [
        "--silent",
        "--prefix",
        "/YOUR/PATH/TO/amazon-internal-mcp-server/src/AmazonInternalMCPServer/",
        "start"
      ]
    }
  }
}
```

### 3. Set Environment Variables

The configuration includes these environment variables for the weblab integration:

- **WEBLAB_API_KEY**: Content Symphony API key for weblab access
- **USER**: Your Amazon username (for weblab-api-authorizing-actor header)
- **HOME**: Your home directory path

Update these values in the config file as needed.

### 4. Start Local MCP Server

Before using Amazon Q with weblab tools, start the local MCP server:

```bash
cd amazon-internal-mcp-server/src/AmazonInternalMCPServer
npm start
```

### 5. Test the Integration

Use Amazon Q to test weblab functionality:

```bash
q chat -a --no-interactive "Please analyze weblab experiment 'WEBLAB_MOBILE_TESTAPP_SESSION_1299744' using the weblab_details tool"
```

## Auto-Approved Tools

The configuration auto-approves these weblab tools (no permission prompts):
- `weblab_details`
- `weblab_search` 
- `weblab_allocations`
- `weblab_activation_history`
- `weblab_treatment_assignment`

## Troubleshooting

### MCP Server Not Found
- Verify the path in `amzn-mcp-local` configuration
- Ensure the MCP server is running: `npm start`
- Check Amazon Q logs for connection errors

### Authentication Errors
- Verify `WEBLAB_API_KEY` is correct
- Check that `USER` matches your Amazon username
- Ensure you're authenticated with Midway: `mwinit --aea`

### Tool Not Available
- Confirm tools are in the `autoApprove` list
- Restart Amazon Q after config changes
- Check MCP server logs for tool registration errors

## Related Documentation

- [Testing Guide](../testing/test-weblab-tool-with-llm.md) - Comprehensive testing instructions
- [Test Prompts](../testing/weblab-test-prompts.md) - Ready-to-use test prompts
- [Working Backwards Doc](../weblab-mcp-integration-working-backwards.md) - Project overview

## Security Notes

⚠️ **Important**: This configuration contains API keys and tokens. 

- Never commit this file to public repositories
- Use environment variables for sensitive values in production
- Rotate API keys regularly
- Follow Amazon's security guidelines for API key management