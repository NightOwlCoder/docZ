**From:** Ibagy, Sergio <sibagy@amazon.com>
**To:** weblab-users@amazon.com, weblab-interest@amazon.com, genai-interest@amazon.com
**Subject:** [Launch Announcement] Weblab MCP Integration - Natural Language Access to Experiment Data

## What did we launch?

On September 22, 2025, the Weblab team launched **Weblab MCP Integration** - natural language access to weblab experiment data through the Model Context Protocol (MCP). This integration enables Amazon Q, Cline, and other AI tools to retrieve weblab experiment information.

**3 new AI-accessible tools now available:**
- **weblab_details** - Get experiment information including treatments
- **weblab_allocations** - Check current status and treatment distributions
- **weblab_activation_history** - Access experiment change history and change tickets

Teams can now ask Amazon Q and other MCP enabled tools natural language questions like:
- "What's the current allocation for WEBLAB_MOBILE_TESTAPP_SESSION_1299744?"
- "Show me details for experiment OFFERSX_DP_AOD_INGRESS_766516"
- "What's the activation history for my experiment?"

## Why is this important?

Teams are increasingly using AI tools but lacked natural language access to weblab data. Manual copy-paste from weblab UI is time-consuming. 

With this launch:
- **Faster data retrieval** - AI tools can retrieve experiment data quickly
- **Reduced toil** - No more manual data extraction from weblab UI
- **Service protection** - Uses public APIs with proper rate limiting (no backdoor endpoints)
- **Future-ready** - Extensible architecture for additional tools and workflows

## How do I use it?

### Installation

1. Install toolbox ([Getting Started Guide](https://docs.hub.amazon.dev/builder-toolbox/user-guide/getting-started/))
2. Add the registry and install amzn-mcp:
```bash
toolbox registry add s3://amzn-mcp-prod-registry-bucket-us-west-2/tools.json
toolbox install amzn-mcp
```

3. Configure MCP in your tool (example for Amazon Q in `~/.aws/amazonq/mcp.json`):
```json
{
  "mcpServers": {
    "amzn-mcp": {
      "command": "amzn-mcp"
    }
  }
}
```

### Example Usage (with Amazon Q)
```bash
q chat -a "What's the status of experiment WEBLAB_MOBILE_TESTAPP_SESSION_1299744?"
q chat -a "When did we activate WEBLAB_MOBILE_TESTAPP_SESSION_1299744 for JP market?"
```

### BYOK (Bring Your Own Key) 
Teams can request their own API key for higher rate limits:

1. Open a SIM to the Weblab API team with use case, benefit estimation, and TPS requirements (per [wiki process](https://w.amazon.com/bin/view/Weblab/Manual/Advanced/Programmatic/WeblabAPI/))
2. Configure in your MCP config:
```json
{
  "env": {
    "WEBLAB_API_KEY": "YourTeam-Weblab-12345",
    "WEBLAB_ENVIRONMENT": "PROD"
  }
}
```

**Default shared key**: `WeblabMCPServer-Weblab-58093` (heavily throttled, good for testing)

## FAQs

**Which environments are supported?**
- Both BETA and PROD environments work. Default is BETA, override with `WEBLAB_ENVIRONMENT=PROD`

**What about rate limiting?**
- Shared key: Limited requests per minute (testing only)
- Team keys: Higher limits based on your agreement with weblab team

**Can I use this with tools other than Amazon Q?**
- Yes! Works with any MCP-compatible client (Cline, custom Strands agents, etc.)

**Is this using internal backdoor APIs?**
- No. We only use public weblab APIs with proper authentication as documented in the weblab API wiki

**How do I troubleshoot issues?**
- Enable debug logging: `export WEBLAB_DEBUG=true`
- Check logs show API calls, response codes, masked API keys

**Why is search not available?**
- Search is not available in the public weblab API.
- We may add it in the future if the search service gets added to the API proxy.

**Will more tools be added?**
- Yes, we're working with the weblab team to expand available operations.

## Who made this happen?

**[Engineering]** Sergio Ibagy
**[Product]** James McQueen & Will Poff

Special thanks to Keith Norman for public API guidance.

## Resources
- **Documentation**: https://code.amazon.com/packages/SIbagy-Weblab-MCP-docs
- **Source Code**: Part of [amzn-mcp](https://code.amazon.com/packages/AmazonInternalMCPServer) package
- **Working Backwards Doc**: https://quip-amazon.com/maowAvtplLmZ/Working-Backwards-Weblab-MCP-Integration

## Still have questions?

Create a [SIM ticket](https://sim.amazon.com/issues/create?assignedFolder=weblab-mcp) or reach out in #weblab-genai Slack channel.

Happy experimenting with AI!

The Weblab Team
