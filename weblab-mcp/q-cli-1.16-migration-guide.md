# Q CLI 1.16+ Migration Guide for Weblab MCP

**Problem:** Q CLI 1.16+ switched to Anthropic's rmcp crate which strictly enforces JSON-RPC spec. Any console output to stdout breaks MCP loading with error: `Mcp error: -32002`

## Quick Fix (Minimal Changes)

If your fork has diverged significantly, here's the minimal fix:

### 1. Create Wrapper Script

Create `amazon-internal-mcp-server/src/AmazonInternalMCPServer/src/mcp-wrapper.ts`:

```typescript
#!/usr/bin/env node

// MCP COMPLIANCE: Silence ALL console output when running in production mode
// This wrapper ensures console is silenced BEFORE any module imports
if (process.env.NODE_ENV === 'production' && !process.stdin.isTTY) {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  console.error = noop;
  console.debug = noop;
  console.trace = noop;
  console.dir = noop;
  console.time = noop;
  console.timeEnd = noop;
  console.timeLog = noop;
  console.group = noop;
  console.groupEnd = noop;
  console.groupCollapsed = noop;
  console.table = noop;
  console.clear = noop;
  console.count = noop;
  console.countReset = noop;
  console.assert = noop;
  console.profile = noop;
  console.profileEnd = noop;
}

// NOW import the main module - console is already silenced
import('./index.js');
```

### 2. Update Q Config

Edit `~/.aws/amazonq/mcp.json` and add/update your local MCP entry:

```json
"amzn-mcp-local": {
  "command": "npx",
  "args": [
    "--yes", 
    "tsx", 
    "/path/to/your/fork/amazon-internal-mcp-server/src/AmazonInternalMCPServer/src/mcp-wrapper.ts",
    "--exclude-tools=..."  // your tool exclusions
  ],
  "env": {
    "NODE_ENV": "production",  // CRITICAL: This enables console silencing
    "WEBLAB_API_KEY": "your-api-key",
    "WEBLAB_ENVIRONMENT": "PROD"
    // ... other env vars
  },
  "timeout": 120000,
  "disabled": false
}
```

**Key points:**
- Uses `npx tsx` to run the wrapper (handles TypeScript)
- Set `NODE_ENV=production` to activate console silencing
- Point to YOUR code's path

## Troubleshooting

If it still doesn't load:
1. Check you have `NODE_ENV=production` in the env
2. Make sure the path to mcp-wrapper.ts is correct
3. Try running manually to see errors:
   ```bash
   echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"0.1.0","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | NODE_ENV=production npx tsx /path/to/mcp-wrapper.ts
   ```
   Should output clean JSON only.

