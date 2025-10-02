# MCP Environment Setup Guide

## The Problem
Hardcoded API tokens in MCP configuration files create security risks when committed to git repositories.

## The Solution: Environment Variables

### 1. Set Environment Variables in Your Shell

Add these to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.):

```bash
# MCP API Keys - DO NOT COMMIT THESE!
export QUIP_API_TOKEN="your-actual-quip-token-here"
export BRAVE_API_KEY="your-actual-brave-api-key-here"
```

### 2. Reload Your Shell
```bash
source ~/.zshrc  # or ~/.bashrc
```

### 3. Verify Environment Variables
```bash
echo $QUIP_API_TOKEN
echo $BRAVE_API_KEY
```

### 4. How MCP Servers Access Environment Variables

MCP servers automatically inherit environment variables from your shell. The `amzn-mcp` and `brave-search` servers will look for:
- `QUIP_API_TOKEN` environment variable for Quip access
- `BRAVE_API_KEY` environment variable for Brave Search

### 5. Alternative: Use .env Files (Not Recommended for Git)

If you prefer `.env` files, create them OUTSIDE your git repository:

```bash
# Create in your home directory
echo "QUIP_API_TOKEN=your-token" >> ~/.mcp-env
echo "BRAVE_API_KEY=your-key" >> ~/.mcp-env

# Source before starting Kiro
source ~/.mcp-env
```

## Security Best Practices

✅ **DO:**
- Store tokens in environment variables
- Use shell profiles for permanent setup
- Keep tokens out of git repositories
- Use different tokens for different environments

❌ **DON'T:**
- Hardcode tokens in JSON files
- Commit tokens to git
- Share tokens in chat/email
- Use production tokens for development

## Troubleshooting

**MCP server not working after removing tokens?**
1. Check environment variables are set: `echo $QUIP_API_TOKEN`
2. Restart Kiro to pick up new environment
3. Check MCP server logs for authentication errors

**Still getting security alerts?**
- Check git history: `git log --oneline -p | grep -i token`
- Consider rotating compromised tokens
- Use `git filter-branch` to remove tokens from history (advanced)

## For Your Weblab MCP Integration

When you implement the weblab MCP tools, follow this same pattern:

```json
{
  "amzn-mcp": {
    "command": "amzn-mcp",
    "env": {
      "WEBLAB_API_KEY": "will-be-read-from-environment"
    }
  }
}
```

Then set: `export WEBLAB_API_KEY="your-weblab-key"`