# Weblab MCP - Developer Testing Guide (Pre-Merge)

Want to try the Weblab MCP tools before they're merged? Follow these steps!

## Quick Start

### 1. Checkout the Code Review

#### Option A: Create new workspace with CR

```bash
cr-pull -w CR-222230979:1
```

#### Option B: Use git directly

```bash
git clone ssh://git.amazon.com/pkg/AmazonInternalMCPServer/snapshot/sibagy/2025-09-17T23-54-12 -b head AmazonInternalMCPServer
```

### 2. Navigate to the package and build

```bash
cd AmazonInternalMCPServer
# Install dependencies and build
npm install
npm run build
```

### 3. Configure Amazon Q to Use Your Local Build

Edit `~/.aws/amazonq/mcp.json`:

```json
{
  "mcpServers": {
    "amzn-mcp-dev": {
      "command": "npx",
      "args": ["--yes", "tsx", "/path/to/your/workspace/AmazonInternalMCPServer/src/mcp-wrapper.ts"],
      "env": {
        "NODE_ENV": "production",
        "WEBLAB_API_KEY": "WeblabMCPServer-Weblab-58093",
        "WEBLAB_ENVIRONMENT": "BETA",
        "WEBLAB_DEBUG": "true"
      }
    }
  }
}
```

**Note**: After Q CLI 1.16+, we use the wrapper script with `NODE_ENV=production` to ensure clean JSON output.

**Important**: Replace `/path/to/your/workspace` with your actual path!

### 4. Test It!

```bash
q chat -a "What's the status of experiment OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516?"
```

## Troubleshooting

### Q not seeing the tools?
- Restart Q (close and reopen the app)
- Verify path in config is absolute, not relative
- Make sure `dist/index.js` exists after build

### Want more debug info?

**After Q CLI 1.16+ (IMPORTANT):** We now have two testing modes because Q 1.16+ requires clean JSON output.

#### Development/Debug Mode (recommended for testing)
Use `npm start` to see all console logs - perfect for debugging:

```bash
cd /path/to/AmazonInternalMCPServer

# Test with PROD data (good data available)
export WEBLAB_DEBUG=true
export WEBLAB_ENVIRONMENT=BETA

# Test weblab_details tool - WITH console output for debugging
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_details", "arguments": {"experimentId": "OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516"}}, "id": 1}' | npm start 2>&1

# Test weblab_allocations tool
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_allocations", "arguments": {"experimentId": "OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516"}}, "id": 1}' | npm start 2>&1

# Test weblab_activation_history tool
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_activation_history", "arguments": {"experimentId": "OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516"}}, "id": 1}' | npm start 2>&1
```

Debug output will show:
```
[WEBLAB-xxx] Getting details for experiment: OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516
[WEBLAB-xxx] API GET https://api.us-east-1.prod.api.weblab.amazon.dev/sso/experiment/v1?experimentId=...
[WEBLAB-xxx] API Key: WeblabMCPS...8093
[WEBLAB-xxx] Success: 200
```

#### Production Mode (how Q actually sees it)
To test with clean JSON output only (simulates Q environment):

```bash
cd /path/to/AmazonInternalMCPServer

# Test with clean JSON output - no console logs
echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "weblab_details", "arguments": {"experimentId": "OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516"}}, "id": 1}' | NODE_ENV=production npx tsx src/mcp-wrapper.ts
```

This outputs ONLY the JSON response, exactly as Q expects. Logs still written to `~/.weblab-mcp/weblab-mcp.log`.

## Testing with Different Environments

### Use PROD instead of BETA:
```json
"env": {
  "WEBLAB_ENVIRONMENT": "PROD"
}
```

### Use your team's API key:
```json
"env": {
  "WEBLAB_API_KEY": "YourTeam-Weblab-12345"
}
```

## For Cline Users

If you're using Cline instead of Q, add to your Cline MCP settings:

```json
{
  "amzn-mcp-dev": {
    "command": "node",
    "args": ["/path/to/your/workspace/AmazonInternalMCPServer/dist/index.js"]
  }
}
```

## Making Changes?

If you're modifying the code:

```bash
# After making changes
npm run build

# If running, restart Q - it'll use the new build on next invocation
```

## Example Queries to Try

```bash
q chat -a "Show me details for experiment OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516"
q chat -a "What's the activation history for OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516?"
q chat -a "What are the current allocations for OFFERSX_DP_AOD_INGRESS_BELOW_OFFER_DISPLAY_766516?"
```

**Note**: This is a BETA experiment that has good data. For PROD experiments, change `WEBLAB_ENVIRONMENT` to "PROD" and use IDs like WEBLAB_MOBILE_TESTAPP_SESSION_1299744.

## Questions?

Ping @sibagy in #weblab-learning-and-genai Slack.

---

**Note**: This is for dev testing only. Once merged, use the official `toolbox install amzn-mcp` method.
