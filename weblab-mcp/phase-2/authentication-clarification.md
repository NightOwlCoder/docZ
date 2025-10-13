# Authentication Clarification: andes-mcp vs Direct Redshift

**Created**: 9/23/2025  
**Purpose**: Clear up confusion about authentication methods

## 🎯 The Key Distinction

### andes-mcp Authentication (What we use)
- **Method**: Standard Midway authentication (automatic)
- **Required Setup**: NONE - just have andes-mcp server installed
- **AWS_PROFILE**: NOT NEEDED 
- **ada profile**: NOT NEEDED  
- **How it works**: andes-mcp handles auth internally through Midway

### Direct Redshift CLI Authentication (What the shell script uses)
- **Method**: AWS IAM role via ada
- **Required Setup**: `ada credentials update --profile=redshift --account=...`
- **AWS_PROFILE**: REQUIRED (`export AWS_PROFILE=redshift`)
- **ada profile**: REQUIRED (IibsAdminAccess-DO-NOT-DELETE role)
- **Used by**: `weblab-andes-query.sh` shell script only

##  Quick Reference

| Tool/Method | Needs AWS_PROFILE? | Needs ada? | Authentication |
|-------------|-------------------|------------|----------------|
| **andes-mcp server** | No | No | Midway (automatic) |
| **DataCentralWorkbench** | No | No | Via andes-mcp |
| **weblab-andes-query.sh** | Yes | Yes | Direct Redshift CLI |
| **Broken TypeScript tools** | Yes | Yes | Trying direct access |

## 🔧 What You Actually Need

### For andes-mcp (RECOMMENDED):
```bash
# Just install and use - no auth setup needed!
q config add-mcp-server andes \
  --command "npx" \
  --args "@amazon-q/andes-mcp-server"
```

### For shell script (LEGACY):
```bash
# Only if using weblab-andes-query.sh directly
ada credentials update --profile=redshift --account=123456789012 --role=IibsAdminAccess-DO-NOT-DELETE
export AWS_PROFILE=redshift
./weblab-andes-query.sh 2025-01-01 2025-03-31 5
```

## Common Misconceptions

1. **"I need AWS_PROFILE for andes-mcp"** - NO! andes-mcp uses Midway auth
2. **"I need ada setup for MCP tools"** - NO! Only for direct CLI access
3. **"The tools are broken because of auth"** - NO! They're broken because they're trying to bypass andes-mcp

## The Right Approach

Our MCP tools should **NEVER** directly connect to Redshift. Instead:

```typescript
// WRONG - Direct Redshift connection
const client = new RedshiftClient({ 
  credentials: fromIni({ profile: 'redshift' })
});

// RIGHT - Delegate to andes-mcp
return {
  content: [{
    type: "text",
    text: "To get your experiments, use andes-mcp server with DataCentralWorkbench..."
  }]
};
```

##  Summary

The prompt you're looking at mixes two different authentication contexts:

1. **andes-mcp context** (what we should use): No AWS_PROFILE or ada needed
2. **Direct Redshift context** (legacy approach): Needs AWS_PROFILE and ada

The confusion comes from the broken tools trying to do direct Redshift access instead of properly delegating to andes-mcp. The fix is to update those tools to return proper delegation instructions or (better) actually call andes-mcp programmatically.

**Bottom line**: For andes-mcp, you don't need ANY authentication setup - it just works!
